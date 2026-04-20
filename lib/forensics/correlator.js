/**
 * Cross-Data Correlator
 * Links chats + calls + contacts + metadata and returns unified results
 * Implements get_entity_profile() and timeline building
 */

import { tfidfSearch, flattenMessages } from '../nlp/tfidf-search';
import { isForeignNumber } from '../nlp/entity-extractor';

/**
 * Apply time filter to a list of items with timestamp field
 */
function applyTimeFilter(items, timeFilter) {
  if (!timeFilter) return items;
  return items.filter(item => {
    const date = new Date(item.timestamp);
    const hour = date.getUTCHours();
    const { from, to } = timeFilter;
    if (from > to) {
      // Wraps midnight (e.g., 23:00 – 04:00)
      return hour >= from || hour < to;
    }
    return hour >= from && hour < to;
  });
}

/**
 * Get all data for a specific entity (phone/name)
 */
export function getEntityProfile(entityQuery, caseData) {
  const q = entityQuery?.toLowerCase() || '';

  // Find contact
  const contact = caseData.contacts.find(c =>
    c.name.toLowerCase().includes(q) ||
    c.numbers.some(n => n.includes(q))
  );

  if (!contact) return null;

  const phone = contact.numbers[0];

  const calls = caseData.calls.filter(c => c.from === phone || c.to === phone);
  const chats = caseData.chats.filter(c => c.participants.includes(phone));
  const messages = chats.flatMap(c => c.messages);

  return { contact, calls, chats, messages };
}

/**
 * Find calls with optional filters
 */
export function findCalls(caseData, entities) {
  let calls = [...caseData.calls];

  // Filter by person/phone
  if (entities.person) {
    const q = entities.person.toLowerCase();
    calls = calls.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.from.includes(q) || c.to.includes(q)
    );
  }
  if (entities.phoneNumber) {
    calls = calls.filter(c =>
      c.from.includes(entities.phoneNumber) || c.to.includes(entities.phoneNumber)
    );
  }

  // Apply time filter
  if (entities.timeFilter) {
    calls = applyTimeFilter(calls, entities.timeFilter);
  }

  // Enrich with contact names
  return calls.map(call => {
    const otherPhone = call.from === caseData.metadata.suspectPhone ? call.to : call.from;
    const contact = caseData.contacts.find(c => c.numbers.includes(otherPhone));
    return {
      ...call,
      contactName: contact?.name || call.name || 'Unknown',
      isForeign: isForeignNumber(otherPhone),
      source: 'Call Log',
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Find chats/messages with optional filters
 */
export function findChats(caseData, entities) {
  let chats = [...caseData.chats];

  // Filter by person
  if (entities.person) {
    const q = entities.person.toLowerCase();
    chats = chats.filter(c =>
      c.participantName?.toLowerCase().includes(q) ||
      c.participants.some(p => p.includes(q))
    );
  }

  // Filter by platform
  if (entities.platform) {
    chats = chats.filter(c =>
      c.platform.toLowerCase() === entities.platform.toLowerCase()
    );
  }

  // Build flat message list with context
  const messages = chats.flatMap(chat =>
    chat.messages.map(msg => ({
      ...msg,
      platform: chat.platform,
      participantName: chat.participantName,
      chatId: chat.id,
      source: chat.platform,
    }))
  );

  // Apply time filter on messages
  return entities.timeFilter
    ? applyTimeFilter(messages, entities.timeFilter)
    : messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Keyword search across all messages using TF-IDF
 */
export function keywordSearch(caseData, keyword) {
  if (!keyword) return [];
  const allMessages = flattenMessages(caseData);
  return tfidfSearch(keyword, allMessages);
}

/**
 * Build unified timeline across all data sources
 */
export function buildTimeline(caseData, entities) {
  const events = [];

  // Add calls
  for (const call of caseData.calls) {
    const otherPhone = call.from === caseData.metadata.suspectPhone ? call.to : call.from;
    const contact = caseData.contacts.find(c => c.numbers.includes(otherPhone));
    events.push({
      id: call.id,
      type: 'call',
      timestamp: call.timestamp,
      description: `${call.type === 'outgoing' ? '📤' : '📥'} ${call.type} call ${call.type === 'outgoing' ? 'to' : 'from'} ${contact?.name || call.name || otherPhone}`,
      detail: `Duration: ${call.duration}s`,
      source: 'Call Log',
      color: '#3b82f6',
    });
  }

  // Add messages
  for (const chat of caseData.chats) {
    for (const msg of chat.messages) {
      events.push({
        id: msg.id,
        type: 'message',
        timestamp: msg.timestamp,
        description: `💬 ${chat.platform} message ${msg.from === caseData.metadata.suspectPhone ? 'sent to' : 'received from'} ${chat.participantName}`,
        detail: msg.text.substring(0, 80) + (msg.text.length > 80 ? '...' : ''),
        source: chat.platform,
        color: '#10b981',
      });
    }
  }

  // Add locations
  for (const loc of caseData.locations) {
    events.push({
      id: loc.id,
      type: 'location',
      timestamp: loc.timestamp,
      description: `📍 Location: ${loc.label}`,
      detail: `GPS: ${loc.lat}, ${loc.lng}`,
      source: 'Location',
      color: '#f59e0b',
    });
  }

  // Apply date filter
  let filtered = events;
  if (entities.date) {
    filtered = events.filter(e => {
      const d = new Date(e.timestamp);
      if (entities.date.month && d.getUTCMonth() + 1 !== entities.date.month) return false;
      if (entities.date.day && d.getUTCDate() !== entities.date.day) return false;
      return true;
    });
  }

  // Sort by timestamp
  return filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Build network graph data for D3.js
 */
export function buildNetworkGraph(caseData) {
  const nodes = [];
  const links = [];

  // Add suspect as central node
  nodes.push({
    id: caseData.metadata.suspectPhone,
    label: caseData.metadata.suspect,
    type: 'suspect',
    callCount: caseData.calls.length,
  });

  // Add contacts
  for (const contact of caseData.contacts) {
    const phone = contact.numbers[0];
    nodes.push({
      id: phone,
      label: contact.name,
      type: isForeignNumber(phone) ? 'foreign' : 'contact',
      callCount: contact.callCount,
      messageCount: contact.messageCount,
    });

    // Link to suspect
    const callsBetween = caseData.calls.filter(
      c => (c.from === phone || c.to === phone)
    );
    const msgsBetween = caseData.chats.filter(
      c => c.participants.includes(phone)
    ).flatMap(c => c.messages).length;

    if (callsBetween.length > 0 || msgsBetween > 0) {
      links.push({
        source: caseData.metadata.suspectPhone,
        target: phone,
        calls: callsBetween.length,
        messages: msgsBetween,
        weight: callsBetween.length + msgsBetween,
      });
    }
  }

  return { nodes, links };
}

/**
 * Find contacts with optional filters
 */
export function findContacts(caseData, entities) {
  let contacts = [...caseData.contacts];

  if (entities.person) {
    const q = entities.person.toLowerCase();
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.numbers.some(n => n.includes(q))
    );
  }

  if (entities.phoneNumber) {
    contacts = contacts.filter(c =>
      c.numbers.some(n => n.includes(entities.phoneNumber))
    );
  }

  return contacts.map(c => ({
    ...c,
    isForeign: c.numbers.some(n => isForeignNumber(n)),
    source: 'Contacts',
  }));
}
