/**
 * Suspicion Engine — Automated Risk Scoring
 * Analyzes entities and communications for suspicious patterns
 *
 * Scoring rules:
 *   Suspicious keyword in message    → +15 pts
 *   Call between 23:00 – 04:00       → +10 pts
 *   30+ calls in a single day        → +20 pts
 *   10+ calls under 5 seconds        → +15 pts
 *   Crypto address found             → +25 pts
 *   Foreign (non-Indian) number      → +10 pts
 *   Message mentions "delete/destroy"→ +15 pts
 *   Call to unknown contact          → +8 pts
 *   Burner/signal/encrypted mention  → +12 pts
 *
 * Risk levels:
 *   HIGH:   60–100
 *   MEDIUM: 30–59
 *   LOW:    0–29
 */

import { extractCryptoFromText, isForeignNumber, SUSPICIOUS_KEYWORDS } from '../nlp/entity-extractor';

const SUSPICION_RULES = {
  SUSPICIOUS_KEYWORD: { points: 15, label: 'Suspicious keyword in message' },
  LATE_NIGHT_CALL: { points: 10, label: 'Call between 23:00–04:00' },
  HIGH_CALL_FREQUENCY: { points: 20, label: '30+ calls in a single day' },
  FLASH_CALLS: { points: 15, label: '10+ calls under 5 seconds' },
  CRYPTO_ADDRESS: { points: 25, label: 'Cryptocurrency address found' },
  FOREIGN_NUMBER: { points: 10, label: 'Communication with foreign number' },
  DELETE_MENTION: { points: 15, label: 'Message contains "delete/destroy"' },
  UNKNOWN_CONTACT: { points: 8, label: 'Calls to unknown/unnamed contacts' },
  BURNER_MENTION: { points: 12, label: 'Burner phone / encrypted app mention' },
  CROSS_BORDER: { points: 18, label: 'Cross-border communication pattern' },
};

function isLateNightCall(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getUTCHours();
  return hour >= 23 || hour < 4;
}

function groupCallsByDay(calls) {
  const dayMap = {};
  for (const call of calls) {
    const day = call.timestamp.substring(0, 10); // YYYY-MM-DD
    dayMap[day] = (dayMap[day] || 0) + 1;
  }
  return dayMap;
}

/**
 * Score a single contact/entity
 */
export function scoreEntity(entityPhone, caseData) {
  const flags = [];
  let score = 0;

  // Filter data for this entity
  const entityCalls = caseData.calls.filter(
    c => c.from === entityPhone || c.to === entityPhone
  );

  const entityChats = caseData.chats.filter(
    c => c.participants.includes(entityPhone)
  );

  const allMessages = entityChats.flatMap(c => c.messages);

  // Rule 1: Late night calls
  const lateNightCalls = entityCalls.filter(c => isLateNightCall(c.timestamp));
  if (lateNightCalls.length > 0) {
    score += SUSPICION_RULES.LATE_NIGHT_CALL.points;
    flags.push({
      rule: 'LATE_NIGHT_CALL',
      label: SUSPICION_RULES.LATE_NIGHT_CALL.label,
      points: SUSPICION_RULES.LATE_NIGHT_CALL.points,
      detail: `${lateNightCalls.length} late night call(s) detected`,
    });
  }

  // Rule 2: High call frequency in a day
  const callsByDay = groupCallsByDay(entityCalls);
  const maxCallsInDay = Math.max(...Object.values(callsByDay), 0);
  if (maxCallsInDay >= 30) {
    score += SUSPICION_RULES.HIGH_CALL_FREQUENCY.points;
    flags.push({
      rule: 'HIGH_CALL_FREQUENCY',
      label: SUSPICION_RULES.HIGH_CALL_FREQUENCY.label,
      points: SUSPICION_RULES.HIGH_CALL_FREQUENCY.points,
      detail: `${maxCallsInDay} calls in a single day`,
    });
  }

  // Rule 3: Flash calls (under 5 seconds)
  const flashCalls = entityCalls.filter(c => c.duration > 0 && c.duration < 5);
  if (flashCalls.length >= 3) {
    score += SUSPICION_RULES.FLASH_CALLS.points;
    flags.push({
      rule: 'FLASH_CALLS',
      label: SUSPICION_RULES.FLASH_CALLS.label,
      points: SUSPICION_RULES.FLASH_CALLS.points,
      detail: `${flashCalls.length} calls under 5 seconds`,
    });
  }

  // Rule 4: Crypto addresses in messages
  const cryptoMessages = allMessages.filter(m => {
    const found = extractCryptoFromText(m.text);
    return found.length > 0;
  });
  if (cryptoMessages.length > 0) {
    score += SUSPICION_RULES.CRYPTO_ADDRESS.points;
    flags.push({
      rule: 'CRYPTO_ADDRESS',
      label: SUSPICION_RULES.CRYPTO_ADDRESS.label,
      points: SUSPICION_RULES.CRYPTO_ADDRESS.points,
      detail: `${cryptoMessages.length} message(s) with crypto addresses`,
    });
  }

  // Rule 5: Foreign number communications
  const foreignContacts = entityCalls.filter(c => {
    const other = c.from === entityPhone ? c.to : c.from;
    return isForeignNumber(other);
  });
  if (foreignContacts.length > 0) {
    score += SUSPICION_RULES.FOREIGN_NUMBER.points;
    flags.push({
      rule: 'FOREIGN_NUMBER',
      label: SUSPICION_RULES.FOREIGN_NUMBER.label,
      points: SUSPICION_RULES.FOREIGN_NUMBER.points,
      detail: `${foreignContacts.length} communication(s) with foreign numbers`,
    });
  }

  // Rule 6: Delete/destroy mentions
  const deleteMessages = allMessages.filter(m =>
    /delete|destroy|erase|remove evidence/i.test(m.text)
  );
  if (deleteMessages.length > 0) {
    score += SUSPICION_RULES.DELETE_MENTION.points;
    flags.push({
      rule: 'DELETE_MENTION',
      label: SUSPICION_RULES.DELETE_MENTION.label,
      points: SUSPICION_RULES.DELETE_MENTION.points,
      detail: `${deleteMessages.length} message(s) mention deleting evidence`,
    });
  }

  // Rule 7: Burner/encrypted app mentions
  const burnerMessages = allMessages.filter(m =>
    /burner|signal|encrypted|dark web|anonymous|untraceable/i.test(m.text)
  );
  if (burnerMessages.length > 0) {
    score += SUSPICION_RULES.BURNER_MENTION.points;
    flags.push({
      rule: 'BURNER_MENTION',
      label: SUSPICION_RULES.BURNER_MENTION.label,
      points: SUSPICION_RULES.BURNER_MENTION.points,
      detail: `${burnerMessages.length} mention(s) of encrypted/burner communication`,
    });
  }

  // Rule 8: Unknown contacts
  const unknownCalls = entityCalls.filter(c => {
    const other = c.from === entityPhone ? c.to : c.from;
    const isKnown = caseData.contacts.some(ct => ct.numbers.includes(other));
    return !isKnown;
  });
  if (unknownCalls.length > 0) {
    score += SUSPICION_RULES.UNKNOWN_CONTACT.points;
    flags.push({
      rule: 'UNKNOWN_CONTACT',
      label: SUSPICION_RULES.UNKNOWN_CONTACT.label,
      points: SUSPICION_RULES.UNKNOWN_CONTACT.points,
      detail: `${unknownCalls.length} call(s) with unknown contacts`,
    });
  }

  // Cap at 100
  score = Math.min(score, 100);

  const riskLevel = score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

  return {
    score,
    riskLevel,
    flags,
    callCount: entityCalls.length,
    messageCount: allMessages.length,
    lateNightCallCount: lateNightCalls.length,
    foreignContactCount: foreignContacts.length,
  };
}

/**
 * Score all contacts in a case
 */
export function scoreAllEntities(caseData) {
  const suspectPhone = caseData.metadata.suspectPhone;
  const suspectScore = scoreEntity(suspectPhone, caseData);

  const contactScores = caseData.contacts.map(contact => {
    const phone = contact.numbers[0];
    const score = scoreEntity(phone, caseData);
    return { ...contact, ...score };
  });

  return {
    suspect: { phone: suspectPhone, ...suspectScore },
    contacts: contactScores.sort((a, b) => b.score - a.score),
  };
}

export { SUSPICION_RULES };
