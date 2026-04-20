/**
 * Entity Extractor — Rule-based NER patterns (spaCy-equivalent in JS)
 * Extracts: person names, phone numbers, time filters, keywords, crypto addresses
 */

// Suspicious keywords to detect in queries and messages
const SUSPICIOUS_KEYWORDS = [
  'delete', 'destroy', 'hide', 'burner', 'signal', 'crypto', 'bitcoin', 'btc', 'eth',
  'ethereum', 'wire', 'cash', 'untraceable', 'clean', 'disappear', 'remove', 'erase',
  'dark', 'anonymous', 'encrypted', 'disposable', 'fake', 'launder', 'offshore',
  'grams', 'package', 'meet', 'delivery', 'stash', 'kilo', 'weight',
  'wallet', 'transfer', 'exchange', 'NDA', 'confidential', 'source code',
  'unlocked', 'exfiltrate', 'zip', 'cloud', 'territory', 'turf', 'heat', 'police'
];

// Time pattern → hour range mappings
const TIME_PATTERNS = [
  { pattern: /after midnight|late night|2am|3am|4am|night calls|past midnight/i, label: 'late night', from: 23, to: 4 },
  { pattern: /morning|early morning|dawn/i, label: 'morning', from: 5, to: 9 },
  { pattern: /afternoon/i, label: 'afternoon', from: 12, to: 17 },
  { pattern: /evening/i, label: 'evening', from: 17, to: 21 },
  { pattern: /night/i, label: 'night', from: 21, to: 23 },
];

// Phone number pattern (international)
const PHONE_REGEX = /(\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4})/g;

// Crypto address patterns
const CRYPTO_PATTERNS = {
  bitcoin: /\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b/g,
  ethereum: /\b0x[a-fA-F0-9]{40}\b/g,
};

// Platform patterns
const PLATFORM_PATTERNS = {
  whatsapp: /whatsapp/i,
  telegram: /telegram/i,
  signal: /signal/i,
  sms: /\bsms\b|text message/i,
};

// Date patterns
const DATE_PATTERNS = [
  { pattern: /march (\d{1,2})/i, month: 3 },
  { pattern: /april (\d{1,2})/i, month: 4 },
  { pattern: /january (\d{1,2})/i, month: 1 },
  { pattern: /february (\d{1,2})/i, month: 2 },
  { pattern: /on the (\d{1,2})(?:st|nd|rd|th)/i, month: null },
];

/**
 * Main entity extraction function
 * @param {string} query - The investigator's natural language query
 * @returns {object} Extracted entities
 */
export function extractEntities(query) {
  const q = query.toLowerCase();
  const entities = {
    person: null,
    phoneNumber: null,
    timeFilter: null,
    keyword: null,
    cryptoAddress: null,
    platform: null,
    date: null,
    suspiciousTerms: [],
  };

  // 1. Extract phone numbers
  const phoneMatch = query.match(PHONE_REGEX);
  if (phoneMatch) {
    entities.phoneNumber = phoneMatch[0].replace(/\s|-/g, '');
  }

  // 2. Extract time filters
  for (const tp of TIME_PATTERNS) {
    if (tp.pattern.test(query)) {
      entities.timeFilter = { label: tp.label, from: tp.from, to: tp.to };
      break;
    }
  }

  // 3. Extract crypto addresses
  const btcMatch = query.match(CRYPTO_PATTERNS.bitcoin);
  const ethMatch = query.match(CRYPTO_PATTERNS.ethereum);
  if (btcMatch) entities.cryptoAddress = { type: 'Bitcoin', address: btcMatch[0] };
  else if (ethMatch) entities.cryptoAddress = { type: 'Ethereum', address: ethMatch[0] };

  // 4. Extract quoted keywords or "find X" / "search for X" patterns
  const quotedMatch = query.match(/"([^"]+)"/);
  if (quotedMatch) {
    entities.keyword = quotedMatch[1];
  } else {
    const findMatch = q.match(/(?:find|search for|look for|containing|with the word|with)\s+([a-z0-9]+)/);
    if (findMatch) entities.keyword = findMatch[1];
  }

  // 5. Extract messaging platform
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(query)) {
      entities.platform = platform;
      break;
    }
  }

  // 6. Extract person names — look for capitalized words not at sentence start
  const words = query.split(/\s+/);
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z]/g, '');
    if (word.length > 2 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      // Not a common word
      const stopWords = ['Show', 'Find', 'Get', 'Search', 'Call', 'What', 'Who', 'How', 'When', 'Where', 'Tell'];
      if (!stopWords.includes(word)) {
        entities.person = word;
        break;
      }
    }
  }

  // 7. Detect suspicious terms in query
  for (const term of SUSPICIOUS_KEYWORDS) {
    if (q.includes(term)) {
      entities.suspiciousTerms.push(term);
    }
  }

  // 8. Extract date
  for (const dp of DATE_PATTERNS) {
    const match = query.match(dp.pattern);
    if (match) {
      entities.date = { day: parseInt(match[1]), month: dp.month };
      break;
    }
  }

  return entities;
}

/**
 * Check if a message contains crypto addresses
 */
export function extractCryptoFromText(text) {
  const btc = text.match(CRYPTO_PATTERNS.bitcoin);
  const eth = text.match(CRYPTO_PATTERNS.ethereum);
  const results = [];
  if (btc) btc.forEach(a => results.push({ type: 'Bitcoin', address: a }));
  if (eth) eth.forEach(a => results.push({ type: 'Ethereum', address: a }));
  return results;
}

/**
 * Check if a number is a foreign number (non-Indian)
 */
export function isForeignNumber(number) {
  const cleaned = number.replace(/\s|-/g, '');
  return !cleaned.startsWith('+91') && !cleaned.startsWith('0') && cleaned.startsWith('+');
}

export { SUSPICIOUS_KEYWORDS };
