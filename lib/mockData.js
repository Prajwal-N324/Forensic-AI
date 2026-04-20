/**
 * Mock UFDR data simulating a real Cellebrite UFED extraction.
 * In production, this data is parsed from an uploaded .ufdr file.
 * Structure mirrors what the UFDR parser would produce.
 */

export const mockCaseData = {
  metadata: {
    deviceModel: "Samsung Galaxy S21",
    imei: "358239051234567",
    androidVersion: "13",
    extractionDate: "2024-03-15T08:30:00Z",
    extractionType: "Full File System",
    caseNumber: "CASE-2024-0031",
    investigator: "Det. Meera Nair",
    suspect: "Aryan Kapoor",
    suspectPhone: "+919876543210",
  },

  contacts: [
    { id: "c1", name: "Ravi Sharma", numbers: ["+917001234567"], email: "ravi@gmail.com", callCount: 34, messageCount: 120 },
    { id: "c2", name: "Unknown X", numbers: ["+447890123456"], email: null, callCount: 12, messageCount: 5 },
    { id: "c3", name: "Priya Mehta", numbers: ["+919812345678"], email: "priya.m@yahoo.com", callCount: 8, messageCount: 67 },
    { id: "c4", name: "Ali Hassan", numbers: ["+923001234567"], email: null, callCount: 22, messageCount: 44 },
    { id: "c5", name: "Vikram D", numbers: ["+919988776655"], email: null, callCount: 7, messageCount: 19 },
    { id: "c6", name: "Broker99", numbers: ["+16502345678"], email: null, callCount: 18, messageCount: 32 },
    { id: "c7", name: "Suresh (Driver)", numbers: ["+919765432100"], email: null, callCount: 3, messageCount: 8 },
  ],

  calls: [
    { id: "call1", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 342, timestamp: "2024-03-10T02:14:00Z", type: "outgoing" },
    { id: "call2", from: "+917001234567", to: "+919876543210", name: "Ravi Sharma", duration: 4, timestamp: "2024-03-10T02:58:00Z", type: "incoming" },
    { id: "call3", from: "+919876543210", to: "+447890123456", name: "Unknown X", duration: 0, timestamp: "2024-03-11T01:45:00Z", type: "outgoing" },
    { id: "call4", from: "+919876543210", to: "+923001234567", name: "Ali Hassan", duration: 512, timestamp: "2024-03-11T03:22:00Z", type: "outgoing" },
    { id: "call5", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 88, timestamp: "2024-03-12T14:30:00Z", type: "outgoing" },
    { id: "call6", from: "+919876543210", to: "+16502345678", name: "Broker99", duration: 203, timestamp: "2024-03-12T02:05:00Z", type: "outgoing" },
    { id: "call7", from: "+919876543210", to: "+919812345678", name: "Priya Mehta", duration: 120, timestamp: "2024-03-13T10:15:00Z", type: "outgoing" },
    { id: "call8", from: "+923001234567", to: "+919876543210", name: "Ali Hassan", duration: 3, timestamp: "2024-03-13T23:50:00Z", type: "incoming" },
    { id: "call9", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 2, timestamp: "2024-03-14T00:10:00Z", type: "outgoing" },
    { id: "call10", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 3, timestamp: "2024-03-14T00:11:00Z", type: "outgoing" },
    { id: "call11", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 2, timestamp: "2024-03-14T00:12:00Z", type: "outgoing" },
    { id: "call12", from: "+919876543210", to: "+917001234567", name: "Ravi Sharma", duration: 4, timestamp: "2024-03-14T00:15:00Z", type: "outgoing" },
    { id: "call13", from: "+919876543210", to: "+16502345678", name: "Broker99", duration: 445, timestamp: "2024-03-14T03:10:00Z", type: "outgoing" },
    { id: "call14", from: "+919876543210", to: "+923001234567", name: "Ali Hassan", duration: 277, timestamp: "2024-03-14T03:45:00Z", type: "outgoing" },
    { id: "call15", from: "+919988776655", to: "+919876543210", name: "Vikram D", duration: 99, timestamp: "2024-03-15T11:00:00Z", type: "incoming" },
  ],

  chats: [
    {
      id: "chat1", platform: "WhatsApp", participants: ["+919876543210", "+917001234567"],
      participantName: "Ravi Sharma",
      messages: [
        { id: "m1", from: "+919876543210", text: "Delivery confirmed for Tuesday. Delete this after reading.", timestamp: "2024-03-10T02:00:00Z" },
        { id: "m2", from: "+917001234567", text: "Done. Switching to Signal after this.", timestamp: "2024-03-10T02:02:00Z" },
        { id: "m3", from: "+919876543210", text: "Send 0.5 BTC to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", timestamp: "2024-03-10T02:05:00Z" },
        { id: "m4", from: "+917001234567", text: "On it. How many packages this week?", timestamp: "2024-03-10T02:07:00Z" },
        { id: "m5", from: "+919876543210", text: "Three. The usual route. Tell no one.", timestamp: "2024-03-10T02:10:00Z" },
        { id: "m6", from: "+917001234567", text: "Understood. I'll destroy the burner after.", timestamp: "2024-03-11T09:00:00Z" },
      ]
    },
    {
      id: "chat2", platform: "Telegram", participants: ["+919876543210", "+923001234567"],
      participantName: "Ali Hassan",
      messages: [
        { id: "m7", from: "+923001234567", text: "Meeting confirmed. Border point Gamma.", timestamp: "2024-03-11T10:00:00Z" },
        { id: "m8", from: "+919876543210", text: "Understood. Payment via crypto only.", timestamp: "2024-03-11T10:05:00Z" },
        { id: "m9", from: "+923001234567", text: "Send to 0x71C7656EC7ab88b098defB751B7401B5f6d8976F", timestamp: "2024-03-11T10:10:00Z" },
        { id: "m10", from: "+919876543210", text: "Done. Three days.", timestamp: "2024-03-11T10:15:00Z" },
      ]
    },
    {
      id: "chat3", platform: "WhatsApp", participants: ["+919876543210", "+919812345678"],
      participantName: "Priya Mehta",
      messages: [
        { id: "m11", from: "+919812345678", text: "Hey, how are you?", timestamp: "2024-03-13T09:00:00Z" },
        { id: "m12", from: "+919876543210", text: "Good! Busy week. Lets meet weekend.", timestamp: "2024-03-13T09:05:00Z" },
        { id: "m13", from: "+919812345678", text: "Sure! Coffee on Sunday?", timestamp: "2024-03-13T09:10:00Z" },
      ]
    },
    {
      id: "chat4", platform: "SMS", participants: ["+919876543210", "+16502345678"],
      participantName: "Broker99",
      messages: [
        { id: "m14", from: "+16502345678", text: "New account ready. 50k moved.", timestamp: "2024-03-12T01:00:00Z" },
        { id: "m15", from: "+919876543210", text: "Good. Keep the burner clean.", timestamp: "2024-03-12T01:10:00Z" },
        { id: "m16", from: "+16502345678", text: "Always. Wire received. Delete thread.", timestamp: "2024-03-12T01:15:00Z" },
      ]
    },
  ],

  locations: [
    { id: "l1", lat: 19.0760, lng: 72.8777, label: "Mumbai Central", timestamp: "2024-03-10T23:00:00Z" },
    { id: "l2", lat: 28.6139, lng: 77.2090, label: "New Delhi (Unusual)", timestamp: "2024-03-11T04:00:00Z" },
    { id: "l3", lat: 19.0330, lng: 73.0297, label: "Navi Mumbai", timestamp: "2024-03-12T02:00:00Z" },
    { id: "l4", lat: 19.0760, lng: 72.8777, label: "Mumbai Central", timestamp: "2024-03-13T10:00:00Z" },
  ]
};

export default mockCaseData;
