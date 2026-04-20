/**
 * TF-IDF Message Search Engine
 * Ranks messages by relevance to a keyword query
 * TF-IDF: Term Frequency × Inverse Document Frequency
 */

/**
 * Tokenize and clean text
 */
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

/**
 * Compute TF (term frequency) for a document
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token of Object.keys(tf)) {
    tf[token] = tf[token] / total;
  }
  return tf;
}

/**
 * Compute IDF (inverse document frequency) across all documents
 */
function computeIDF(documents) {
  const idf = {};
  const N = documents.length;

  for (const doc of documents) {
    const tokens = new Set(tokenize(doc));
    for (const token of tokens) {
      idf[token] = (idf[token] || 0) + 1;
    }
  }

  for (const token of Object.keys(idf)) {
    idf[token] = Math.log(N / idf[token]);
  }
  return idf;
}

/**
 * Search messages using TF-IDF ranking
 * @param {string} keyword - Search term
 * @param {Array} messages - Array of { id, text, timestamp, from, participantName, platform }
 * @returns {Array} Ranked results with tfidf scores
 */
export function tfidfSearch(keyword, messages) {
  if (!keyword || messages.length === 0) return [];

  const queryTokens = tokenize(keyword);
  const documents = messages.map(m => m.text);

  // Compute IDF across all messages
  const idf = computeIDF(documents);

  // Score each message
  const scored = messages.map(msg => {
    const tokens = tokenize(msg.text);
    const tf = computeTF(tokens);

    let score = 0;
    for (const qToken of queryTokens) {
      const tfScore = tf[qToken] || 0;
      const idfScore = idf[qToken] || 0;
      score += tfScore * idfScore;
    }

    // Boost if exact phrase found
    if (msg.text.toLowerCase().includes(keyword.toLowerCase())) {
      score += 1.5;
    }

    return { ...msg, relevanceScore: parseFloat(score.toFixed(4)) };
  });

  // Sort by score descending, return non-zero matches
  return scored
    .filter(m => m.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Flatten all messages from caseData into a searchable array
 */
export function flattenMessages(caseData) {
  const messages = [];
  for (const chat of caseData.chats) {
    for (const msg of chat.messages) {
      messages.push({
        ...msg,
        platform: chat.platform,
        participantName: chat.participantName,
        chatId: chat.id,
      });
    }
  }
  return messages;
}
