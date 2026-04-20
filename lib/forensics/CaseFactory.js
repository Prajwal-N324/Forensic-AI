/**
 * CaseFactory - Generates high-fidelity mock forensic data for different sectors.
 * Mimics technical structure of Cellebrite UFDR outputs.
 */

const SECTORS = {
  NARCOTICS: {
    name: 'Narcotics Logistics - Case-2024-NARC',
    investigator: 'Agent Sarah Miller',
    suspect: 'Marco "The Ghost" Rossi',
    suspectPhone: '+393123456789',
    keywords: ['grams', 'package', 'meet', 'delivery', 'stash', 'kilo', 'weight', 'burner'],
    scenarios: [
      { text: "Heard the stash is ready at point B. Delete this.", timeOffset: -3600 },
      { text: "Need 500 grams by midnight.", timeOffset: -7200 },
      { text: "Moving to a burner after this. Use Signal.", timeOffset: -86400 }
    ]
  },
  FINANCIAL: {
    name: 'Crypto Money Laundering - Case-2024-FRAUD',
    investigator: 'Analyst Ken Chen',
    suspect: 'Viktor Volkov',
    suspectPhone: '+79123456789',
    keywords: ['btc', 'crypto', 'wallet', 'transfer', 'wire', 'launder', 'offshore', 'exchange'],
    scenarios: [
      { text: "Wallet address: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", timeOffset: -1000 },
      { text: "Transfer 12.5 BTC to cold storage.", timeOffset: -50000 },
      { text: "The wire from the offshore account is pending.", timeOffset: -120000 }
    ]
  },
  ESPIONAGE: {
    name: 'Corporate Exfiltration - Case-2024-INTEL',
    investigator: 'Specialist Elena Vance',
    suspect: 'J. Harper (Former Sysadmin)',
    suspectPhone: '+16505550199',
    keywords: ['nda', 'confidential', 'source code', 'unlocked', 'exfiltrate', 'zip', 'cloud'],
    scenarios: [
      { text: "I have the source code for project Phoenix. Zip file is ready.", timeOffset: -2000 },
      { text: "Uploading confidential files to the private cloud now.", timeOffset: -10000 },
      { text: "Bypassing the NDA was easier than expected.", timeOffset: -200000 }
    ]
  },
  ORGANIZED_GANG: {
    name: 'Gang Activity Cluster - Case-2024-STREET',
    investigator: 'Officer Lee Park',
    suspect: 'T-Bone',
    suspectPhone: '+12125550123',
    keywords: ['territory', 'turf', 'heat', 'police', 'flash', 'move', 'encoded', 'safe'],
    scenarios: [
      { text: "Too much heat on 5th street. Move the safe.", timeOffset: -4000 },
      { text: "Tell the crew to use encoded messages only.", timeOffset: -15000 },
      { text: "Turf war starting. Call for backup.", timeOffset: -300000 }
    ]
  }
};

/**
 * Generate a complete Case object for a specific sector.
 */
export function generateCase(sectorKey = 'NARCOTICS') {
  const config = SECTORS[sectorKey.toUpperCase()] || SECTORS.NARCOTICS;
  const now = new Date();

  // 1. Generate Metadata
  const metadata = {
    id: `CASE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    name: config.name,
    investigator: config.investigator,
    suspect: config.suspect,
    suspectPhone: config.suspectPhone,
    deviceModel: "iPhone 15 Pro Max (Simulated)",
    imei: Math.floor(Math.random() * 1e15).toString(),
    createdAt: now.toISOString(),
    sector: sectorKey.toUpperCase()
  };

  // 2. Generate Contacts
  const contacts = [
    { id: 'c1', name: 'Ringleader X', numbers: ['+447000000000'], callCount: 45, messageCount: 156 },
    { id: 'c2', name: 'Associate B', numbers: ['+12000000000'], callCount: 12, messageCount: 89 },
    { id: 'c3', name: 'The Broker', numbers: ['+971000000000'], callCount: 33, messageCount: 210 },
    { id: 'c4', name: 'Storage Unit', numbers: ['+18005550123'], callCount: 5, messageCount: 12 }
  ];

  // 3. Generate Chats
  const chats = contacts.map(c => ({
    id: `chat-${c.id}`,
    platform: Math.random() > 0.5 ? 'WhatsApp' : 'Signal',
    participantName: c.name,
    participants: [metadata.suspectPhone, c.numbers[0]],
    messages: [
      ...config.scenarios.map((s, idx) => ({
        id: `m-${c.id}-${idx}`,
        from: Math.random() > 0.5 ? metadata.suspectPhone : c.numbers[0],
        text: s.text,
        timestamp: new Date(now.getTime() + s.timeOffset * 1000).toISOString()
      })),
      {
        id: `m-filler-${c.id}`,
        from: c.numbers[0],
        text: "Just checking in on the status.",
        timestamp: new Date(now.getTime() - 3600000).toISOString()
      }
    ]
  }));

  // 4. Generate Calls
  const calls = [];
  for (let i = 0; i < 20; i++) {
    const contact = contacts[Math.floor(Math.random() * contacts.length)];
    const date = new Date(now.getTime() - Math.random() * 864000000); // within last 10 days
    calls.push({
      id: `call-${i}`,
      from: Math.random() > 0.5 ? metadata.suspectPhone : contact.numbers[0],
      to: Math.random() > 0.5 ? contact.numbers[0] : metadata.suspectPhone,
      name: contact.name,
      duration: Math.floor(Math.random() * 600),
      timestamp: date.toISOString(),
      type: Math.random() > 0.5 ? 'incoming' : 'outgoing'
    });
  }

  // 5. Generate Locations
  const locations = [
    { id: 'l1', lat: 51.5074, lng: -0.1278, label: 'Central Hub', timestamp: now.toISOString() },
    { id: 'l2', lat: 40.7128, lng: -74.0060, label: 'Secondary Node', timestamp: new Date(now.getTime() - 86400000).toISOString() }
  ];

  return { metadata, contacts, chats, calls, locations };
}

export const CASE_SECTORS = Object.keys(SECTORS);
export { SECTORS };
