# ForensicAI Investigation Suite: Technical Specification

## 1. Project Overview
**ForensicAI Query** is a high-fidelity, AI-powered forensic analytics platform designed to transform raw mobile forensic exports (UFDR format) into actionable intelligence. It replaces manual investigative filtering with an autonomous 6-layer discovery pipeline.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 16 (App Router)** | High-speed server-side rendering and routing. |
| **Identity & Security** | **Firebase Auth** | Institutional-grade investigator authentication (AuthGuard). |
| **Database & Persistence** | **Google Cloud Firestore** | Secure vault for case history and forensic metadata. |
| **Intelligence Engine** | **Natural (Naive Bayes)** | Intent classification for natural language queries. |
| **Entity Extraction** | **Compromise (NLP)** | Rule-based extraction of phone numbers, BTC addresses, and foreign nodes. |
| **Graph Visualization** | **D3.js / SVG Clusters** | Interactive mapping of suspect-associate relationship networks. |
| **Analytics UI** | **Chart.js** | Visualizing communication frequency and risk distributions. |
| **Design System** | **Glassmorphic Vanilla CSS** | "Mission Control" aesthetic using premium obsidian dark tokens. |

---

## 3. The 6-Layer Intelligence Pipeline

Implementing the **ForensicAI Methodology**, the system processes a single plain-English query through six distinct layers:

### **Layer 1: Intent Recognition**
- **Process**: Uses a Naive Bayes classifier to identify the mathematical intent (e.g., `find_calls`, `get_suspicion`, `detect_crypto`).
- **Goal**: Understand *what* the investigator is looking for without requiring SQL or filters.

### **Layer 2: Sector-Aware NER (Entity Extraction)**
- **Process**: Extracts parameters like suspect names, date ranges, and specialized sector keywords (Narcotics, Fraud, Espionage).
- **Goal**: Map language to data fields.

### **Layer 3: Cross-Data Correlation**
- **Process**: Simultaneously scans multiple forensic sources (Chats, Call Logs, Contacts, and Metadata).
- **Goal**: Links a message in a chat to a contact name and a physical location.

### **Layer 4: Interactive Timeline Construction**
- **Process**: Reconstructs evidence into a unified chronological sequence.
- **Goal**: Identifies patterns of life and suspicious midnight activity.

### **Layer 5: Network Discovery Graph**
- **Process**: Generates nodes and links based on communication frequency.
- **Goal**: Visualizes "hidden" relationships between primary suspects and external threat actors.

### **Layer 6: Autonomous Suspicion Scoring**
- **Process**: Runs a heuristic engine that assigns risk points (0-100) based on forensic red flags (e.g., mention of "delete," use of crypto, or 2 AM calls).
- **Goal**: Automatically highlights the "Smoking Gun" evidence for the investigator.

---

## 4. Implementation Methodology

### **A. Modular Component Architecture**
The suite is built with modular React components (`TimelineView`, `NetworkGraph`, `SuspicionReport`), allowing for sector-specific visualizations to be toggled based on the investigation type.

### **B. Simulation-First Testing**
Using a sophisticated `CaseFactory`, the system generates multi-sector mock data (Narcotics, Espionage, Fraud). This ensures the NLP and Scoring engines are hardened against realistic forensic noise before live UFDR ingestion.

### **C. Institutional UX (Mission Control)**
The UI prioritizes **clinical efficiency**:
- **High-Density Data Views**: Tables and graphs optimized for speed-reading.
- **Visual Heatmaps**: Using color (Cyan/Magenta) to direct investigator attention to anomalies.
- **Low-Latency Feedback**: Pulse animations and loading layers ensure the investigator feels the "weight" of the AI processing.

---

## 5. Security & Compliance
- **Data Encapsulation**: Forensic data is stored in user-specific sub-collections in Firestore, ensuring data isolation between different investigators.
- **Auth Guarding**: No component or API route is accessible without a verified investigator session token.
- **Environment Isolation**: Sensitive configuration keys are managed via Vercel Secret Management to prevent exposure in code repositories.

---
**Version 1.0.0** | **Confidential Forensic Document** | **Built for Modern Digital Discovery**
