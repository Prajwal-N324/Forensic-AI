// Mock Forensic Datenarios for ForensicAI Query
export const SCENARIOS = {
  crypt_shepherd: {
    id: "case_crypt_shepherd",
    name: "Case CryptShepherd: Cyber Extortion Campaign",
    description: "Investigation into a high-value cryptocurrency extortion campaign targeting a public official. The perpetrator uses coordinated burner contacts, deletes key messages, and coordinates location pings near ATMs for cashout.",
    status: "Active - Critical Alert",
    investigator: "Special Agent Sarah Jenkins",
    dateCreated: "2026-05-10T08:00:00Z",
    metrics: {
      totalMessages: 1240,
      totalCalls: 45,
      flaggedContacts: 4,
      dataHealth: "Good (92%)",
      uploadedFiles: ["Cellebrite_Export_UFED_4421.json", "SMS_Backup_Vance.xml"],
      filesCount: 124
    },
    suspects: [
      { id: "marcus_vance", name: "Marcus Vance", phone: "+1 (555) 019-2831", alias: "V_Shepherd", role: "Lead Suspect / Extortion Coordinator", avatar: "👤" },
      { id: "elena_rostova", name: "Elena Rostova", phone: "+1 (555) 014-9982", alias: "RedRaven", role: "Financial Mule", avatar: "👩‍💼" },
      { id: "target_official", name: "Senator John Miller", phone: "+1 (555) 012-4029", alias: "Target", role: "Victim / Target", avatar: "🏛️" },
      { id: "unknown_burner", name: "Unknown Burner #3", phone: "+1 (555) 015-8831", alias: "Ghost_Operator", role: "Unverified Accomplice", avatar: "👥" }
    ],
    anomalies: [
      {
        id: "anom_extort_1",
        risk: "High",
        category: "Keyword Flag",
        description: "Direct threat regarding private data leakage matched with cryptocurrency transfer demand.",
        evidence: "V_Shepherd: 'Pay 12 BTC by 6 PM or the Senator's financial ledger goes public. Address: bc1qxy25...'",
        recommendation: "Flag message for formal legal report. Correlate timestamp with Senator's receipt log.",
        linkedEventId: "ev_crypt_4"
      },
      {
        id: "anom_extort_2",
        risk: "High",
        category: "Location Match",
        description: "Marcus Vance and Elena Rostova located at the same ATM location coordinates within 3 minutes of a transaction.",
        evidence: "GPS pings place Marcus Vance (-73.9852, 40.7484) and Elena Rostova (-73.9854, 40.7483) at Manhattan CoinATM.",
        recommendation: "Subpoena ATM surveillance footage from Chase Manhattan branch on 5th Ave.",
        linkedEventId: "ev_crypt_9"
      },
      {
        id: "anom_extort_3",
        risk: "Medium",
        category: "Communication Gap",
        description: "Total silence (0 messages/calls) on Marcus Vance's primary phone for 36 hours immediately after the ransom deadline.",
        evidence: "Gap detected: 2026-05-15 18:05 to 2026-05-17 06:15. Device went offline / flight mode.",
        recommendation: "Check cell tower logs for IMEI location during this blackout window to detect burner phone usage.",
        linkedEventId: "ev_crypt_14"
      }
    ],
    timeline: [
      { id: "ev_crypt_1", timestamp: "2026-05-15T09:12:00Z", type: "chat", actor: "Marcus Vance", recipient: "Senator John Miller", content: "Senator, I hope you received my mail. We need to settle this account today.", channel: "WhatsApp", severity: "Suspicious" },
      { id: "ev_crypt_2", timestamp: "2026-05-15T09:15:00Z", type: "call", actor: "Senator John Miller", recipient: "Marcus Vance", content: "Call duration: 4m 12s", channel: "Cellular", severity: "Normal" },
      { id: "ev_crypt_3", timestamp: "2026-05-15T09:30:00Z", type: "chat", actor: "Marcus Vance", recipient: "Elena Rostova", content: "Target is rattled. Stand by the wallet. Be ready to transfer to local cashout immediately.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_crypt_4", timestamp: "2026-05-15T11:45:00Z", type: "chat", actor: "Marcus Vance", recipient: "Senator John Miller", content: "Pay 12 BTC by 6 PM or the Senator's financial ledger goes public. Address: bc1qxy25z3119028a47ff221", channel: "WhatsApp", severity: "Suspicious" },
      { id: "ev_crypt_5", timestamp: "2026-05-15T12:00:00Z", type: "location", actor: "Marcus Vance", recipient: "None", content: "GPS Ping: (-73.9852, 40.7484) - 5th Ave Manhattan (CoinATM lobby)", channel: "GPS", severity: "Normal" },
      { id: "ev_crypt_6", timestamp: "2026-05-15T12:03:00Z", type: "location", actor: "Elena Rostova", recipient: "None", content: "GPS Ping: (-73.9854, 40.7483) - 5th Ave Manhattan (CoinATM lobby)", channel: "GPS", severity: "Suspicious" },
      { id: "ev_crypt_7", timestamp: "2026-05-15T14:10:00Z", type: "chat", actor: "Unknown Burner #3", recipient: "Marcus Vance", content: "System updated. Clean coins arriving. Transfer fee deducted.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_crypt_8", timestamp: "2026-05-15T17:50:00Z", type: "chat", actor: "Senator John Miller", recipient: "Marcus Vance", content: "Transaction sent. TXID: 9a88b172a8fe... Don't call me again.", channel: "WhatsApp", severity: "Normal" },
      { id: "ev_crypt_9", timestamp: "2026-05-15T18:02:00Z", type: "chat", actor: "Marcus Vance", recipient: "Elena Rostova", content: "Payment received. Cash out the first $10k at the Manhattan terminal.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_crypt_10", timestamp: "2026-05-15T18:05:00Z", type: "chat", actor: "Marcus Vance", recipient: "Unknown Burner #3", content: "Going dark now. Burn this number.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_crypt_blackout", timestamp: "2026-05-15T18:06:00Z", type: "media", actor: "Marcus Vance", recipient: "None", content: "Device status: Airplane mode enabled / Sim Card Removed", channel: "Device System Logs", severity: "Suspicious" },
      { id: "ev_crypt_14", timestamp: "2026-05-17T06:15:00Z", type: "media", actor: "Marcus Vance", recipient: "None", content: "Device status: Power on, Sim Card Inserted (IMSI changed)", channel: "Device System Logs", severity: "Suspicious" }
    ],
    graph: {
      nodes: [
        { id: "Marcus Vance", type: "suspect", count: 8 },
        { id: "Elena Rostova", type: "associate", count: 4 },
        { id: "Senator John Miller", type: "victim", count: 3 },
        { id: "Unknown Burner #3", type: "flagged", count: 2 }
      ],
      links: [
        { source: "Marcus Vance", target: "Senator John Miller", value: 3, type: "extortion" },
        { source: "Marcus Vance", target: "Elena Rostova", value: 4, type: "coordination" },
        { source: "Marcus Vance", target: "Unknown Burner #3", value: 2, type: "burner" },
        { source: "Elena Rostova", target: "Unknown Burner #3", value: 0, type: "none" }
      ]
    },
    presets: [
      {
        query: "Find extortion messages containing payment instructions or crypto addresses.",
        intent: "Identify extortion messages & cryptocurrency wallets",
        translation: "SELECT * FROM chat_logs WHERE (message LIKE '%BTC%' OR message LIKE '%wallet%' OR message LIKE '%address%') AND severity = 'Suspicious'",
        summary: "The AI detected a critical message sent by Marcus Vance (V_Shepherd) on May 15 at 11:45 AM demanding a ransom of **12 BTC** from Senator John Miller, containing the address **bc1qxy25z3119028a47ff221**.",
        sources: ["WhatsApp", "Signal", "SMS"],
        confidence: 98,
        results: [
          { time: "2026-05-15 11:45", from: "Marcus Vance", to: "Senator John Miller", channel: "WhatsApp", message: "Pay 12 BTC by 6 PM or the Senator's financial ledger goes public. Address: bc1qxy25z3119028a47ff221" }
        ],
        suggestions: [
          "Trace cryptocurrency address transaction history.",
          "Check locations of Vance and Rostova around transaction timestamps."
        ]
      },
      {
        query: "Analyze location patterns of Marcus and Elena around 12:00 PM.",
        intent: "Correlate geolocation coordinates of Vance and Rostova",
        translation: "SELECT actor, coordinates, timestamp FROM location_logs WHERE timestamp BETWEEN '12:00:00' AND '12:10:00' AND actor IN ('Marcus Vance', 'Elena Rostova')",
        summary: "Co-location anomaly detected. On May 15 at 12:00 PM and 12:03 PM, both Marcus Vance and Elena Rostova pinged at the exact same CoinATM terminal in 5th Ave Manhattan (coordinates -73.9852, 40.7484), suggesting physical coordination of cryptocurrency exchange.",
        sources: ["GPS Logs", "WiFi Pings"],
        confidence: 94,
        results: [
          { time: "2026-05-15 12:00", actor: "Marcus Vance", coord: "(-73.9852, 40.7484)", location: "Manhattan CoinATM lobby" },
          { time: "2026-05-15 12:03", actor: "Elena Rostova", coord: "(-73.9854, 40.7483)", location: "Manhattan CoinATM lobby" }
        ],
        suggestions: [
          "Check chat instructions immediately prior to 12:00 PM.",
          "Examine ATM withdrawal confirmations."
        ]
      },
      {
        query: "Identify communication gaps or device airplane mode events for Marcus Vance.",
        intent: "Analyze device state changes and blackout periods",
        translation: "SELECT timestamp, content FROM device_logs WHERE actor = 'Marcus Vance' AND (content LIKE '%Airplane%' OR content LIKE '%Sim Card%')",
        summary: "Anti-forensic device blackout detected. Marcus Vance enabled Airplane Mode and removed his SIM card on May 15 at 6:06 PM (immediately after the ransom deadline) and powered back on with a different SIM (changed IMSI) on May 17 at 6:15 AM.",
        sources: ["Device System Logs"],
        confidence: 97,
        results: [
          { time: "2026-05-15 18:06", actor: "Marcus Vance", recipient: "None", channel: "Device System Logs", message: "Device status: Airplane mode enabled / Sim Card Removed" },
          { time: "2026-05-17 06:15", actor: "Marcus Vance", recipient: "None", channel: "Device System Logs", message: "Device status: Power on, Sim Card Inserted (IMSI changed)" }
        ],
        suggestions: [
          "Check cell towers for physical location of IMEI during this window.",
          "Review burner handset registration logs."
        ]
      },
      {
        query: "Find all contacts and chat logs associated with RedRaven alias.",
        intent: "Isolate associate communications",
        translation: "SELECT * FROM chat_logs WHERE actor = 'Elena Rostova' OR recipient = 'Elena Rostova'",
        summary: "Coordinated mule directions identified. On May 15, Marcus Vance sent messages to Elena Rostova (alias RedRaven) coordinating the cashout: **'Payment received. Cash out the first $10k at the Manhattan terminal.'**",
        sources: ["Signal", "WhatsApp"],
        confidence: 95,
        results: [
          { time: "2026-05-15 09:30", actor: "Marcus Vance", recipient: "Elena Rostova", channel: "Signal", message: "Target is rattled. Stand by the wallet. Be ready to transfer to local cashout immediately." },
          { time: "2026-05-15 18:02", actor: "Marcus Vance", recipient: "Elena Rostova", channel: "Signal", message: "Payment received. Cash out the first $10k at the Manhattan terminal." }
        ],
        suggestions: [
          "Search for digital wallet files in Elena's local extraction.",
          "Subpoena ATM location transaction list."
        ]
      }
    ]
  },

  project_aegis: {
    id: "case_project_aegis",
    name: "Case ProjectAegis: IP & Source Code Theft",
    description: "Investigation into an intellectual property breach at Aegis Corp. A senior developer is suspected of leaking proprietary autonomous driving source code to a foreign competitor via encrypted messaging apps.",
    status: "Active - Under Surveillance",
    investigator: "Cyber Investigator Dan Kowalski",
    dateCreated: "2026-05-12T10:30:00Z",
    metrics: {
      totalMessages: 8520,
      totalCalls: 18,
      flaggedContacts: 2,
      dataHealth: "Excellent (98%)",
      uploadedFiles: ["UFED_Physical_Dump_ElenaK.json", "Git_Access_Logs.csv"],
      filesCount: 312
    },
    suspects: [
      { id: "elena_k", name: "Elena Kovalenko", phone: "+1 (555) 012-7744", alias: "ekov_dev", role: "Senior Developer / Suspected Leaker", avatar: "👩‍💻" },
      { id: "rival_contact", name: "Dr. Chen Wei", phone: "+86 139 0102 9988", alias: "wei_competitor", role: "Rival R&D Director", avatar: "👨‍💼" },
      { id: "git_bot", name: "Aegis Git Server", phone: "Internal IP", alias: "GitLab-Aegis", role: "Source Code Repository", avatar: "🤖" }
    ],
    anomalies: [
      {
        id: "anom_aegis_1",
        risk: "High",
        category: "Keyword Flag",
        description: "Sent secure files named 'aegis_adas_v5.tar.gz' to unverified competitor phone number.",
        evidence: "Elena Kovalenko sent attachment 'aegis_adas_v5.tar.gz' (240MB) via WhatsApp to Dr. Chen Wei.",
        recommendation: "Extract media metadata from the database. Check company VPN logs for Git downloads preceding this time.",
        linkedEventId: "ev_aegis_4"
      },
      {
        id: "anom_aegis_2",
        risk: "Medium",
        category: "Location Match",
        description: "Elena Kovalenko pinged within 50 meters of the rival company's liaison office during non-work hours.",
        evidence: "GPS places Elena at 450 Broadway Ste 4 (Rival Corp Liaison Office) at 9:30 PM on a Friday.",
        recommendation: "Cross-reference with security logs to see if her work laptop connected to local public WiFi.",
        linkedEventId: "ev_aegis_7"
      }
    ],
    timeline: [
      { id: "ev_aegis_1", timestamp: "2026-05-14T18:15:00Z", type: "media", actor: "Elena Kovalenko", recipient: "Aegis Git Server", content: "Downloaded repository: aegis-adas-core (branch: main)", channel: "Git Logs", severity: "Normal" },
      { id: "ev_aegis_2", timestamp: "2026-05-14T18:22:00Z", type: "chat", actor: "Elena Kovalenko", recipient: "Dr. Chen Wei", content: "Got the latest update of the sensor fusion model. Packaging it now.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_aegis_3", timestamp: "2026-05-14T18:30:00Z", type: "call", actor: "Dr. Chen Wei", recipient: "Elena Kovalenko", content: "Call duration: 12m 45s", channel: "WhatsApp Voice", severity: "Suspicious" },
      { id: "ev_aegis_4", timestamp: "2026-05-14T19:05:00Z", type: "media", actor: "Elena Kovalenko", recipient: "Dr. Chen Wei", content: "Sent file: 'aegis_adas_v5.tar.gz' (242 MB)", channel: "WhatsApp", severity: "Suspicious" },
      { id: "ev_aegis_5", timestamp: "2026-05-14T19:08:00Z", type: "chat", actor: "Dr. Chen Wei", recipient: "Elena Kovalenko", content: "Received. Transferring funds to your offshore account. Delete these logs.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_aegis_6", timestamp: "2026-05-14T19:15:00Z", type: "chat", actor: "Elena Kovalenko", recipient: "Dr. Chen Wei", content: "Understood. Wiping local logs and key files.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_aegis_7", timestamp: "2026-05-15T21:30:00Z", type: "location", actor: "Elena Kovalenko", recipient: "None", content: "GPS Ping: (-122.4012, 37.7892) - 450 Broadway (Rival Liaison Office)", channel: "GPS", severity: "Suspicious" }
    ],
    graph: {
      nodes: [
        { id: "Elena Kovalenko", type: "suspect", count: 6 },
        { id: "Dr. Chen Wei", type: "flagged", count: 5 },
        { id: "Aegis Git Server", type: "associate", count: 1 }
      ],
      links: [
        { source: "Elena Kovalenko", target: "Dr. Chen Wei", value: 5, type: "data_leak" },
        { source: "Elena Kovalenko", target: "Aegis Git Server", value: 1, type: "git_access" },
        { source: "Dr. Chen Wei", target: "Aegis Git Server", value: 0, type: "none" }
      ]
    },
    presets: [
      {
        query: "Show files transferred by Elena to the competitor.",
        intent: "Identify file sharing/leakage events",
        translation: "SELECT filename, recipient, timestamp FROM media_logs WHERE actor = 'Elena Kovalenko' AND (filename LIKE '%.tar.gz%' OR filename LIKE '%.zip%')",
        summary: "The AI identified a file leakage event. On May 14 at 7:05 PM, Elena Kovalenko sent a compressed archive **'aegis_adas_v5.tar.gz'** (242 MB) to Dr. Chen Wei via WhatsApp, right after cloning the main repository from the internal Aegis Git Server.",
        sources: ["WhatsApp Attachment Tracker", "Git Logs"],
        confidence: 99,
        results: [
          { time: "2026-05-14 19:05", actor: "Elena Kovalenko", recipient: "Dr. Chen Wei", channel: "WhatsApp", message: "Sent file: 'aegis_adas_v5.tar.gz' (242 MB)" }
        ],
        suggestions: [
          "Analyze Signal chat logs around the file transfer timestamp.",
          "Check financial transactions / wire mentions."
        ]
      },
      {
        query: "Search for instructions to wipe logs or delete chat history.",
        intent: "Detect anti-forensic activity / log wiping",
        translation: "SELECT * FROM chat_logs WHERE message LIKE '%delete%' OR message LIKE '%wipe%' OR message LIKE '%clear%'",
        summary: "Anti-forensic actions detected. On May 14 at 7:08 PM and 7:15 PM, chat messages between Dr. Chen Wei and Elena Kovalenko coordinate the wiping of local logs and critical source code files following the offshore transaction.",
        sources: ["Signal Chat History"],
        confidence: 96,
        results: [
          { time: "2026-05-14 19:08", actor: "Dr. Chen Wei", recipient: "Elena Kovalenko", channel: "Signal", message: "Received. Transferring funds to your offshore account. Delete these logs." },
          { time: "2026-05-14 19:15", actor: "Elena Kovalenko", recipient: "Dr. Chen Wei", channel: "Signal", message: "Understood. Wiping local logs and key files." }
        ],
        suggestions: [
          "Inspect file system for deleted db-wal files.",
          "Correlate offshore wire transfer confirmations."
        ]
      },
      {
        query: "Check location logs for Elena Kovalenko's off-work movements.",
        intent: "Trace suspect movement and co-location anomalies",
        translation: "SELECT timestamp, coordinates, content FROM location_logs WHERE actor = 'Elena Kovalenko' AND severity = 'Suspicious'",
        summary: "A suspicious location log on Friday, May 15 at 9:30 PM places Elena Kovalenko at **450 Broadway (Rival Liaison Office)**, correlating to the timing of the suspect IP theft campaign.",
        sources: ["GPS History", "Device Location Cache"],
        confidence: 92,
        results: [
          { time: "2026-05-15 21:30", actor: "Elena Kovalenko", recipient: "GPS", channel: "GPS", message: "GPS Ping: (-122.4012, 37.7892) - 450 Broadway (Rival Liaison Office)" }
        ],
        suggestions: [
          "Query WiFi connection logs for public hotspots.",
          "Analyze surveillance camera feeds around Broadway."
        ]
      }
    ]
  },

  blue_lotus: {
    id: "case_blue_lotus",
    name: "Case BlueLotus: Narcotics Coordination",
    description: "Investigation into a regional narcotics ring operating under the moniker BlueLotus. Chats show coded transactions involving street terms ('candy', 'wheels') with coordinate pings near public docks.",
    status: "Active - Gathering Evidence",
    investigator: "Detective Ray Miller",
    dateCreated: "2026-05-08T14:15:00Z",
    metrics: {
      totalMessages: 3410,
      totalCalls: 120,
      flaggedContacts: 5,
      dataHealth: "Fair (80%)",
      uploadedFiles: ["UFED_Physical_BlueLotus_Burner.json"],
      filesCount: 85
    },
    suspects: [
      { id: "jake_flint", name: "Jake Flint", phone: "+1 (555) 018-4001", alias: "Lotus_Lead", role: "Lead Dealer", avatar: "👤" },
      { id: "tommy_mule", name: "Tommy Vance", phone: "+1 (555) 011-2093", alias: "Wheels", role: "Mule / Delivery Courier", avatar: "🏍️" },
      { id: "supplier_shadow", name: "Unknown Supplier", phone: "+1 (800) 091-8821", alias: "Shadow_Supply", role: "Wholesale Supplier", avatar: "👥" }
    ],
    anomalies: [
      {
        id: "anom_lotus_1",
        risk: "High",
        category: "Coded Language",
        description: "Unusual frequency of words 'candy', 'wheels', and 'dock' in standard SMS logs.",
        evidence: "Jake: 'Drop the candy at the usual dock. Wheels is moving now.'",
        recommendation: "Categorize as drug drop coordination. Verify GPS coordinate in the text.",
        linkedEventId: "ev_lotus_3"
      },
      {
        id: "anom_lotus_2",
        risk: "High",
        category: "Location Match",
        description: "Delivery courier pinged at the exact warehouse coordinates specified in the text messages.",
        evidence: "Tommy's phone places him at Warehouse 14, Docks (coordinates -74.0121, 40.7022) at 11:15 PM.",
        recommendation: "Request search warrant for Warehouse 14 based on location correlation.",
        linkedEventId: "ev_lotus_5"
      }
    ],
    timeline: [
      { id: "ev_lotus_1", timestamp: "2026-05-14T21:00:00Z", type: "chat", actor: "Unknown Supplier", recipient: "Jake Flint", content: "Shipment arrived at Dock 4. 20 crates. Move it fast.", channel: "SMS", severity: "Suspicious" },
      { id: "ev_lotus_2", timestamp: "2026-05-14T21:15:00Z", type: "call", actor: "Jake Flint", recipient: "Tommy Vance", content: "Call duration: 1m 05s", channel: "Cellular", severity: "Normal" },
      { id: "ev_lotus_3", timestamp: "2026-05-14T21:20:00Z", type: "chat", actor: "Jake Flint", recipient: "Tommy Vance", content: "Drop the candy at the usual dock. Wheels is moving now. Coordinates for warehouse: (-74.0121, 40.7022)", channel: "SMS", severity: "Suspicious" },
      { id: "ev_lotus_4", timestamp: "2026-05-14T22:30:00Z", type: "chat", actor: "Tommy Vance", recipient: "Jake Flint", content: "Picked up. Driving to the drop location now.", channel: "SMS", severity: "Normal" },
      { id: "ev_lotus_5", timestamp: "2026-05-14T23:15:00Z", type: "location", actor: "Tommy Vance", recipient: "None", content: "GPS Ping: (-74.0121, 40.7022) - Warehouse 14, Docks", channel: "GPS", severity: "Suspicious" },
      { id: "ev_lotus_6", timestamp: "2026-05-14T23:20:00Z", type: "chat", actor: "Tommy Vance", recipient: "Jake Flint", content: "Delivery secured inside Warehouse 14. Locked.", channel: "SMS", severity: "Suspicious" }
    ],
    graph: {
      nodes: [
        { id: "Jake Flint", type: "suspect", count: 4 },
        { id: "Tommy Vance", type: "associate", count: 4 },
        { id: "Unknown Supplier", type: "flagged", count: 1 }
      ],
      links: [
        { source: "Jake Flint", target: "Tommy Vance", value: 3, type: "coordination" },
        { source: "Unknown Supplier", target: "Jake Flint", value: 1, type: "wholesale" },
        { source: "Unknown Supplier", target: "Tommy Vance", value: 0, type: "none" }
      ]
    },
    presets: [
      {
        query: "Search for drop instructions or locations at the docks.",
        intent: "Identify drop locations and courier instructions",
        translation: "SELECT * FROM chat_logs WHERE message LIKE '%dock%' OR message LIKE '%warehouse%' OR message LIKE '%coordinates%'",
        summary: "The AI highlighted a drop instruction sent by Jake Flint to Tommy Vance on May 14 at 9:20 PM: **'Drop the candy at the usual dock... Coordinates: (-74.0121, 40.7022)'**. This matches a subsequent GPS ping of Tommy Vance at that warehouse location at 11:15 PM.",
        sources: ["SMS", "GPS Logs"],
        confidence: 96,
        results: [
          { time: "2026-05-14 21:20", actor: "Jake Flint", recipient: "Tommy Vance", channel: "SMS", message: "Drop the candy at the usual dock. Wheels is moving now. Coordinates for warehouse: (-74.0121, 40.7022)" },
          { time: "2026-05-14 23:15", actor: "Tommy Vance", recipient: "GPS", channel: "GPS", message: "GPS Ping: (-74.0121, 40.7022) - Warehouse 14, Docks" }
        ],
        suggestions: [
          "Show all messages from courier Tommy Vance.",
          "Check calls between Jake Flint and Tommy Vance around 9:15 PM."
        ]
      },
      {
        query: "Identify references to delivery vehicles, couriers, or 'wheels'.",
        intent: "Identify logistical coordination and courier alias",
        translation: "SELECT * FROM chat_logs WHERE message LIKE '%wheels%' OR message LIKE '%mule%' OR message LIKE '%drive%'",
        summary: "Logistical courier coordination detected. Jake Flint contacts Tommy Vance (alias 'Wheels') on May 14 at 9:20 PM confirming courier deployment: **'Wheels is moving now'**.",
        sources: ["SMS Logs"],
        confidence: 94,
        results: [
          { time: "2026-05-14 21:20", actor: "Jake Flint", recipient: "Tommy Vance", channel: "SMS", message: "Drop the candy at the usual dock. Wheels is moving now. Coordinates for warehouse: (-74.0121, 40.7022)" },
          { time: "2026-05-14 22:30", actor: "Tommy Vance", recipient: "Jake Flint", channel: "SMS", message: "Picked up. Driving to the drop location now." }
        ],
        suggestions: [
          "Trace cellular tower registration for Tommy's device.",
          "Check traffic camera logs near Dock 4."
        ]
      },
      {
        query: "Show calls between Jake Flint and Tommy Vance.",
        intent: "Analyze phone call patterns",
        translation: "SELECT timestamp, actor, recipient, content FROM call_logs WHERE (actor = 'Jake Flint' AND recipient = 'Tommy Vance') OR (actor = 'Tommy Vance' AND recipient = 'Jake Flint')",
        summary: "Call activity correlated. Jake Flint calls Tommy Vance on May 14 at 9:15 PM (duration 1m 05s), immediately prior to sending the drop coordinates via SMS.",
        sources: ["Call Logs"],
        confidence: 98,
        results: [
          { time: "2026-05-14 21:15", actor: "Jake Flint", recipient: "Tommy Vance", channel: "Cellular", message: "Call duration: 1m 05s" }
        ],
        suggestions: [
          "Compare call towers to verify if suspects were co-located.",
          "Search other numbers contacted by Tommy Vance."
        ]
      }
    ]
  },

  phish_hook: {
    id: "case_phish_hook",
    name: "Case PhishHook: Identity Theft Ring",
    description: "Investigation into a bulk phishing syndicate. The ring coordinates the distribution of malicious links spoofing major banks to harvest credentials and coordinates SIM-swap operations.",
    status: "Active - Alert Flagged",
    investigator: "Inspector Kyle Reese",
    dateCreated: "2026-05-15T09:00:00Z",
    metrics: {
      totalMessages: 15420,
      totalCalls: 89,
      flaggedContacts: 7,
      dataHealth: "Good (89%)",
      uploadedFiles: ["UFED_Bulk_SMS_Extract.json", "IP_Web_Server_Logs.csv"],
      filesCount: 520
    },
    suspects: [
      { id: "ryan_cross", name: "Ryan Cross", phone: "+1 (555) 013-0948", alias: "PhishBoss", role: "Syndicate Leader / Web Dev", avatar: "👤" },
      { id: "sim_swapper", name: "Kelly Chen", phone: "+1 (555) 017-4831", alias: "SimSwap_Pro", role: "Carrier Insider / Swapper", avatar: "👩" },
      { id: "link_sender", name: "Bulk Sender #5", phone: "+1 (555) 016-0099", alias: "Spoofer_Bot", role: "Spam Sender", avatar: "🤖" }
    ],
    anomalies: [
      {
        id: "anom_phish_1",
        risk: "High",
        category: "Phishing URLs",
        description: "Sent bulk SMS templates containing domain lookalikes of Chase and Bank of America.",
        evidence: "Ryan: 'Send out the link: http://chase-login-verify-security.com now.'",
        recommendation: "Request domain takedown. Correlate with bulk spam sender server records.",
        linkedEventId: "ev_phish_2"
      },
      {
        id: "anom_phish_2",
        risk: "High",
        category: "SIM Swap Action",
        description: "Instruction sent to swap IMSI code of victim's phone immediately before high-value withdrawals.",
        evidence: "Kelly: 'Swap complete. BofA verification SMS should route to our burner now.'",
        recommendation: "Identify specific carrier logs for target IMSI change on May 16.",
        linkedEventId: "ev_phish_4"
      }
    ],
    timeline: [
      { id: "ev_phish_1", timestamp: "2026-05-16T10:00:00Z", type: "chat", actor: "Ryan Cross", recipient: "Bulk Sender #5", content: "Spin up the login page clone. Make sure the database is logging passwords.", channel: "Discord Mock", severity: "Suspicious" },
      { id: "ev_phish_2", timestamp: "2026-05-16T10:15:00Z", type: "chat", actor: "Ryan Cross", recipient: "Bulk Sender #5", content: "Send out the link: http://chase-login-verify-security.com now to list group 3.", channel: "Discord Mock", severity: "Suspicious" },
      { id: "ev_phish_3", timestamp: "2026-05-16T12:30:00Z", type: "chat", actor: "Kelly Chen", recipient: "Ryan Cross", content: "Got target's details. Preparing SIM swap for Senator's account.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_phish_4", timestamp: "2026-05-16T13:45:00Z", type: "chat", actor: "Kelly Chen", recipient: "Ryan Cross", content: "Swap complete. BofA verification SMS should route to our burner now. Log in and withdraw.", channel: "Signal", severity: "Suspicious" },
      { id: "ev_phish_5", timestamp: "2026-05-16T13:48:00Z", type: "media", actor: "Ryan Cross", recipient: "None", content: "Browser status: Connected to bank portal, OTP received and accepted.", channel: "Browser Activity", severity: "Suspicious" },
      { id: "ev_phish_6", timestamp: "2026-05-16T14:15:00Z", type: "call", actor: "Ryan Cross", recipient: "Kelly Chen", content: "Call duration: 5m 12s", channel: "WhatsApp Voice", severity: "Normal" }
    ],
    graph: {
      nodes: [
        { id: "Ryan Cross", type: "suspect", count: 4 },
        { id: "Kelly Chen", type: "flagged", count: 2 },
        { id: "Bulk Sender #5", type: "associate", count: 2 }
      ],
      links: [
        { source: "Ryan Cross", target: "Kelly Chen", value: 3, type: "swap_coordination" },
        { source: "Ryan Cross", target: "Bulk Sender #5", value: 2, type: "phishing_deploy" },
        { source: "Kelly Chen", target: "Bulk Sender #5", value: 0, type: "none" }
      ]
    },
    presets: [
      {
        query: "Identify phishing links or fake domains sent to victims.",
        intent: "Identify credential harvesting URLs",
        translation: "SELECT url, sender FROM message_logs WHERE message LIKE '%http%' AND (message LIKE '%login%' OR message LIKE '%security%' OR message LIKE '%verify%')",
        summary: "The AI highlighted a domain template sent by Ryan Cross to Bulk Sender #5 on May 16: **'http://chase-login-verify-security.com'**, which matches lookalike patterns of financial institutions commonly used for phishing.",
        sources: ["SMS Logs", "Internal Chat History"],
        confidence: 97,
        results: [
          { time: "2026-05-16 10:15", actor: "Ryan Cross", recipient: "Bulk Sender #5", channel: "Discord Mock", message: "Send out the link: http://chase-login-verify-security.com now to list group 3." }
        ],
        suggestions: [
          "Check SIM swap logs on carrier systems for listed targets.",
          "Find other IP hits on the phishing clone web server."
        ]
      },
      {
        query: "Identify SIM swap instructions and carrier insider activity.",
        intent: "Detect unauthorized SIM swap operations",
        translation: "SELECT * FROM chat_logs WHERE message LIKE '%swap%' OR message LIKE '%IMSI%' OR message LIKE '%sim%'",
        summary: "SIM swap execution confirmed. Kelly Chen (SimSwap_Pro) messaged Ryan Cross on May 16 at 1:45 PM: **'Swap complete. BofA verification SMS should route to our burner now. Log in and withdraw.'**",
        sources: ["Signal Chats", "Carrier IMSI Logs"],
        confidence: 99,
        results: [
          { time: "2026-05-16T12:30:00Z", actor: "Kelly Chen", recipient: "Ryan Cross", channel: "Signal", message: "Got target's details. Preparing SIM swap for Senator's account." },
          { time: "2026-05-16T13:45:00Z", actor: "Kelly Chen", recipient: "Ryan Cross", channel: "Signal", message: "Swap complete. BofA verification SMS should route to our burner now. Log in and withdraw." }
        ],
        suggestions: [
          "Check carrier employee login history for Kelly Chen.",
          "Track IP address associated with BofA transaction."
        ]
      },
      {
        query: "Trace Ryan Cross's browser activity and banking portal logins.",
        intent: "Audit suspect device web navigation logs",
        translation: "SELECT timestamp, actor, content FROM web_browser_logs WHERE actor = 'Ryan Cross' OR content LIKE '%bank%'",
        summary: "Illicit financial access logged. Browser activity shows Ryan Cross connected to the victim's banking portal at 1:48 PM, utilizing the diverted OTP.",
        sources: ["Browser History Extraction"],
        confidence: 95,
        results: [
          { time: "2026-05-16T13:48:00Z", actor: "Ryan Cross", recipient: "None", channel: "Browser Activity", message: "Browser status: Connected to bank portal, OTP received and accepted." }
        ],
        suggestions: [
          "Extract session cookies from browser SQLite databases.",
          "Trace routing IPs through Tor nodes or VPN gateways."
        ]
      }
    ]
  }
};
