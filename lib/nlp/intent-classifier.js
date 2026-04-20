/**
 * NLP Intent Classifier — Naive Bayes implementation
 * Classifies investigator queries into one of 6 intents:
 *   find_calls | find_chats | keyword_search | build_timeline | get_suspicion | find_contacts
 */

// Training dataset — intent → example phrases
const TRAINING_DATA = {
  find_calls: [
    "show me all calls", "calls after midnight", "calls made by suspect",
    "incoming calls", "outgoing calls", "call log", "phone calls from",
    "who did he call", "calls between", "night calls", "calls at 2am",
    "missed calls", "call duration", "calls to foreign number",
    "how many calls", "calls made after 11pm", "late night calls",
    "calls received", "calls last week", "call history"
  ],
  find_chats: [
    "show messages", "whatsapp chats", "messages from", "text messages",
    "conversations with", "chat history", "telegram messages", "sms",
    "what did he say", "messages between", "chat log", "show all chats",
    "messages to suspect", "read conversation", "signal messages",
    "messages sent", "received messages", "chat with ravi"
  ],
  keyword_search: [
    "find messages with", "search for", "messages containing", "look for",
    "find the word", "messages about bitcoin", "crypto in messages",
    "delete in chat", "burner", "keyword", "find all mentions of",
    "search messages for", "contains the word", "where is the word",
    "messages with delete", "find crypto address", "look up"
  ],
  build_timeline: [
    "show timeline", "what happened on", "activity on march 10",
    "events on tuesday", "chronological order", "sequence of events",
    "show all activity", "timeline for", "what did he do on",
    "events this week", "march events", "activity log", "build timeline",
    "show history for", "events after", "activity between dates"
  ],
  get_suspicion: [
    "how suspicious", "risk score", "suspicion level", "is this person suspicious",
    "what is the risk", "flag this person", "suspicion analysis",
    "risk assessment", "how dangerous", "threat level", "trust score",
    "analyze suspicion", "check risk", "is he a suspect", "crime indicators",
    "get suspicion score", "risk for", "evaluate this person"
  ],
  find_contacts: [
    "who is this number", "contact details", "find contact", "who called from",
    "identify number", "contact list", "all contacts", "foreign numbers",
    "unknown contacts", "who is", "search contact", "number belongs to",
    "find person", "contact info", "list all numbers", "who are the contacts"
  ]
};

/**
 * Simple Naive Bayes text classifier
 * P(class|text) ∝ P(class) × ∏ P(word|class)
 */
class NaiveBayesClassifier {
  constructor() {
    this.classCounts = {};
    this.wordCounts = {};
    this.totalDocs = 0;
    this.vocabulary = new Set();
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  train(intents) {
    for (const [intent, examples] of Object.entries(intents)) {
      this.classCounts[intent] = examples.length;
      this.wordCounts[intent] = {};
      this.totalDocs += examples.length;

      for (const example of examples) {
        const tokens = this.tokenize(example);
        for (const token of tokens) {
          this.vocabulary.add(token);
          this.wordCounts[intent][token] = (this.wordCounts[intent][token] || 0) + 1;
        }
      }
    }
  }

  classify(text) {
    const tokens = this.tokenize(text);
    let bestIntent = 'keyword_search';
    let bestScore = -Infinity;
    const vocabSize = this.vocabulary.size;
    const scores = {};

    for (const intent of Object.keys(this.classCounts)) {
      // Log-probability to avoid underflow
      let score = Math.log(this.classCounts[intent] / this.totalDocs);
      const totalWordsInClass = Object.values(this.wordCounts[intent]).reduce((a, b) => a + b, 0);

      for (const token of tokens) {
        // Laplace smoothing
        const wordCount = (this.wordCounts[intent][token] || 0) + 1;
        score += Math.log(wordCount / (totalWordsInClass + vocabSize));
      }

      scores[intent] = score;
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    // Confidence = softmax of top intent vs others
    const maxScore = Math.max(...Object.values(scores));
    const exps = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.exp(v - maxScore)]));
    const total = Object.values(exps).reduce((a, b) => a + b, 0);
    const confidence = ((exps[bestIntent] / total) * 100).toFixed(1);

    return { intent: bestIntent, confidence: parseFloat(confidence), scores };
  }
}

// Singleton trained classifier
const classifier = new NaiveBayesClassifier();
classifier.train(TRAINING_DATA);

export function classifyIntent(query) {
  return classifier.classify(query);
}

export const INTENT_LABELS = {
  find_calls: { label: 'Find Calls', icon: '📞', color: '#3b82f6' },
  find_chats: { label: 'Find Chats', icon: '💬', color: '#10b981' },
  keyword_search: { label: 'Keyword Search', icon: '🔍', color: '#8b5cf6' },
  build_timeline: { label: 'Build Timeline', icon: '📅', color: '#f59e0b' },
  get_suspicion: { label: 'Suspicion Score', icon: '⚠️', color: '#ef4444' },
  find_contacts: { label: 'Find Contacts', icon: '👤', color: '#06b6d4' },
};
