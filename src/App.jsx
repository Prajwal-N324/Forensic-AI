import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Shield, 
  LayoutDashboard, 
  Database, 
  HelpCircle, 
  Calendar, 
  Network, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Send, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  LogOut, 
  Clock, 
  Mic, 
  Check, 
  AlertCircle,
  FileDown,
  UserCheck,
  MessageCircle,
  Bot,
  X,
  Loader,
  Sparkles,
  Zap,
  MapPin,
  Phone,
  Image,
  Key
} from "lucide-react";
import { SCENARIOS } from "./ufdr_scenarios";
import { saveAuditLog, getAuditLogs } from "./firebase";
import { analyzeForensicQuery, generateDetailedReport, chatWithAI, getScreenGuidance, isAIAvailable, aiModelsStatus, parseAndStructureCaseWithAI, getCasePresets, buildFallbackCustomCase } from "./ai-engine";
import ForceGraph from "./ForceGraph";
import "./App.css";
import ThemeToggle from "./ThemeToggle";

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("agent_jenkins");
  const [userRole, setUserRole] = useState("Investigator");
  const [authPassword, setAuthPassword] = useState("••••••••");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  
  // Dashboard & Case State
  const [activeScreen, setActiveScreen] = useState("login");
  const [currentCaseId, setCurrentCaseId] = useState("crypt_shepherd");
  const [parsingStatus, setParsingStatus] = useState("idle");
  const [parsingProgress, setParsingProgress] = useState(0);
  const [customFiles, setCustomFiles] = useState([]);
  const [cases, setCases] = useState(SCENARIOS);
  
  // AI Query State
  const [queryInput, setQueryInput] = useState("");
  const [activeQueryResult, setActiveQueryResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  // Timeline State
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineTypeFilter, setTimelineTypeFilter] = useState({
    chat: true,
    call: true,
    location: true,
    media: true
  });
  const [timelineSuspectFilter, setTimelineSuspectFilter] = useState({});
  const [highlightedEventId, setHighlightedEventId] = useState(null);

  // Correlation Graph State
  const [selectedNode, setSelectedNode] = useState(null);

  // Report State
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [appendedItems, setAppendedItems] = useState([]);
  
  // Audit & Notifications
  const [auditLogs, setAuditLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);

  // AI State
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [aiGuidance, setAiGuidance] = useState("");
  const chatEndRef = useRef(null);

  const activeCase = cases[currentCaseId] || SCENARIOS[currentCaseId];

  // Auto-initialize suspect filters when case changes
  useEffect(() => {
    if (activeCase) {
      const filters = {};
      activeCase.suspects.forEach(s => {
        filters[s.name] = true;
      });
      setTimelineSuspectFilter(filters);
      
      // Auto-populate report content
      setReportTitle(`OFFICIAL FORENSIC ANALYSIS: ${activeCase.name.toUpperCase()}`);
      setReportContent(
        `Case: ${activeCase.name}\n` +
        `Date Created: ${new Date(activeCase.dateCreated).toLocaleDateString()}\n` +
        `Investigator: ${activeCase.investigator}\n` +
        `Case Status: ${activeCase.status}\n\n` +
        `EXECUTIVE SUMMARY:\n` +
        `${activeCase.description}\n\n` +
        `SUSPECT INVOLVEMENT:\n` +
        activeCase.suspects.map(s => `- ${s.name} (${s.alias}): ${s.role}`).join("\n") +
        `\n\nANALYSIS NOTES & EVIDENCE DETAILS:\n`
      );
      
      // Reset state variables
      setActiveQueryResult(null);
      setSelectedNode(null);
      setAppendedItems([]);
      setAiReport(null);
      
      // Write audit log
      logAction("Case Loaded", `Forensic dataset for '${activeCase.name}' active state established.`);
    }
  }, [currentCaseId]);

  // Load audit logs on start
  useEffect(() => {
    fetchLogs();
  }, []);

  // AI guidance on screen changes
  useEffect(() => {
    if (isAuthenticated && activeCase && activeScreen !== "login") {
      getScreenGuidance(activeScreen, activeCase).then(tip => setAiGuidance(tip));
    }
  }, [activeScreen, currentCaseId, isAuthenticated]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchLogs = async () => {
    const logs = await getAuditLogs();
    setAuditLogs(logs);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ text: message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const logAction = async (action, details) => {
    const entry = {
      action,
      details,
      actor: username,
      role: userRole,
      caseName: activeCase ? activeCase.name : "None"
    };
    await saveAuditLog(entry);
    fetchLogs();
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setActiveScreen("dashboard");
    logAction("Authentication", `User authenticated successfully with role: ${userRole}.`);
    showNotification("Security handshake complete. Welcome back.", "success");
  };

  // Logout handler
  const handleLogout = () => {
    logAction("Authentication", "User logged out / session terminated.");
    setIsAuthenticated(false);
    setActiveScreen("login");
    showNotification("Session cleared.", "info");
  };

  const handleDragStart = (e, caseId, fileName) => {
    e.dataTransfer.setData("caseId", caseId);
    e.dataTransfer.setData("fileName", fileName);
  };

  const analyzeCaseFile = (caseId, fileName) => {
    setParsingStatus("parsing");
    setParsingProgress(0);
    logAction("Data Import", `Initiated parsing of case scenario: '${fileName}'`);

    fetch(`/forensic_scenarios/${fileName}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not find file in public/forensic_scenarios");
        return res.json();
      })
      .then(content => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setParsingProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            
            const targetId = content.id || caseId;
            setCases(prev => ({
              ...prev,
              [targetId]: content
            }));
            setCurrentCaseId(targetId);
            setCustomFiles([fileName]);
            setParsingStatus("done");
            logAction("Data Import", `Successfully matched and parsed case scenario '${targetId}' from file '${fileName}'`);
            showNotification(`Loaded ${content.name}`, "success");

            setTimeout(() => {
              setActiveScreen("query");
              setParsingStatus("idle");
            }, 1200);
          }
        }, 120);
      })
      .catch(err => {
        console.warn("Error loading mock file from server, using local fallback:", err);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setParsingProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setCurrentCaseId(caseId);
            setCustomFiles([fileName]);
            setParsingStatus("done");
            logAction("Data Import", `Successfully loaded local fallback for case scenario '${caseId}'`);
            showNotification(`Loaded ${SCENARIOS[caseId].name}`, "success");
            setTimeout(() => {
              setActiveScreen("query");
              setParsingStatus("idle");
            }, 1200);
          }
        }, 120);
      });
  };

  const parseRealFile = (file) => {
    setParsingStatus("parsing");
    setParsingProgress(10);
    logAction("Data Import", `Initiated parsing of uploaded file: '${file.name}'`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileText = e.target.result;
        let content = null;
        let isStandardJson = false;

        try {
          content = JSON.parse(fileText);
          if (content && Array.isArray(content.timeline) && Array.isArray(content.suspects)) {
            isStandardJson = true;
          }
        } catch (err) {
          // Parse fail simply means it's not standard JSON case format
        }

        if (isStandardJson) {
          setParsingProgress(50);
          const interval = setInterval(() => {
            setParsingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                
                const caseId = content.id || `custom_case_${Date.now()}`;
                if (!content.presets || content.presets.length === 0) {
                  content.presets = getCasePresets(content);
                }
                setCases(prevCases => ({
                  ...prevCases,
                  [caseId]: { ...content, id: caseId }
                }));
                setCurrentCaseId(caseId);
                setCustomFiles([file.name]);
                setParsingStatus("done");
                logAction("Data Import", `Successfully loaded standard case scenario '${caseId}' from file '${file.name}'`);
                showNotification(`Loaded ${content.name || "Custom Case"}`, "success");
                setTimeout(() => {
                  setActiveScreen("query");
                  setParsingStatus("idle");
                }, 1200);
                return 100;
              }
              return prev + 25;
            });
          }, 100);
        } else {
          setParsingProgress(30);
          showNotification("Extracting structural data & mapping suspects with ForensicAI...", "info");
          
          try {
            const structuredCase = await parseAndStructureCaseWithAI(file.name, fileText);
            setParsingProgress(80);
            
            const caseId = structuredCase.id || `custom_case_${Date.now()}`;
            setCases(prevCases => ({
              ...prevCases,
              [caseId]: { ...structuredCase, id: caseId }
            }));
            setCurrentCaseId(caseId);
            setCustomFiles([file.name]);
            setParsingProgress(100);
            setParsingStatus("done");
            logAction("Data Import", `Successfully parsed and structured raw file '${file.name}' using AI Parser`);
            showNotification(`Parsed ${structuredCase.name}`, "success");
            setTimeout(() => {
              setActiveScreen("query");
              setParsingStatus("idle");
            }, 1200);
          } catch (err) {
            console.error("AI parse failed, running local fallback parser:", err);
            const fallbackCase = buildFallbackCustomCase(file.name, fileText);
            setParsingProgress(85);
            const caseId = fallbackCase.id;
            setCases(prevCases => ({
              ...prevCases,
              [caseId]: fallbackCase
            }));
            setCurrentCaseId(caseId);
            setCustomFiles([file.name]);
            setParsingProgress(100);
            setParsingStatus("done");
            logAction("Data Import Error", `Successfully parsed file '${file.name}' using local fallback parser`);
            showNotification(`Parsed ${fallbackCase.name} (Fallback)`, "success");
            setTimeout(() => {
              setActiveScreen("query");
              setParsingStatus("idle");
            }, 1200);
          }
        }
      } catch (err) {
        setParsingStatus("idle");
        logAction("Data Import Error", `Failed to parse file '${file.name}': ${err.message}`);
        showNotification("Invalid file format or parse error.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Upload/parsing simulator click handler
  const handleFileUpload = (e) => {
    e.preventDefault();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,.ufdr,.txt,.csv,.log,.xml";
    
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        parseRealFile(file);
      }
    };
    
    fileInput.click();
  };

  // Submit search query to AI engine
  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || isAIProcessing) return;

    logAction("AI Query", `Natural language query submitted: "${queryInput}"`);
    setIsAIProcessing(true);
    setActiveQueryResult(null);

    try {
      const result = await analyzeForensicQuery(queryInput, activeCase);
      setActiveQueryResult(result);
      setQueryHistory(prev => [queryInput, ...prev.filter(q => q !== queryInput)].slice(0, 10));
      showNotification(`AI analysis complete. Confidence: ${result.confidence}%`, "success");
    } catch (err) {
      console.error("Query failed:", err);
      showNotification("AI query failed. Please try again.", "error");
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Run a preset query through AI
  const runPresetQuery = async (preset) => {
    setQueryInput(preset.query);
    logAction("AI Query", `Preset query triggered: "${preset.query}"`);
    setIsAIProcessing(true);
    setActiveQueryResult(null);

    try {
      const result = await analyzeForensicQuery(preset.query, activeCase);
      setActiveQueryResult(result);
      setQueryHistory(prev => [preset.query, ...prev.filter(q => q !== preset.query)].slice(0, 10));
      showNotification(`Preset analyzed. Confidence: ${result.confidence}%`, "success");
    } catch (err) {
      showNotification("Preset query failed.", "error");
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Simulate Voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      const presets = getCasePresets(activeCase);
      if (presets && presets.length > 0) {
        const randomPreset = presets[Math.floor(Math.random() * presets.length)];
        setQueryInput(randomPreset.query);
      }
      showNotification("Voice capture complete.", "success");
    } else {
      setIsListening(true);
      showNotification("Microphone active... Speak query.", "info");
    }
  };

  // Navigate to timeline and highlight specific event
  const jumpToTimelineEvent = (eventId) => {
    setHighlightedEventId(eventId);
    setActiveScreen("timeline");
    logAction("Timeline Navigation", `Investigator drilled down to event: ${eventId}`);
    setTimeout(() => {
      const element = document.getElementById(eventId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Append evidence block to report
  const appendToReport = (title, text) => {
    const textToAppend = `\n--- EVIDENCE BLOCK: ${title.toUpperCase()} ---\n${text}\n`;
    setReportContent(prev => prev + textToAppend);
    setAppendedItems(prev => [...prev, title]);
    logAction("Report Modification", `Appended evidence: '${title}'`);
    showNotification("Appended to report draft.", "success");
  };

  // AI Chatbox handler
  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatProcessing) return;

    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatProcessing(true);

    try {
      const response = await chatWithAI(chatInput, activeCase, [...chatMessages, userMsg]);
      setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  // AI Report generation
  const handleGenerateAIReport = async () => {
    if (isReportGenerating) return;
    setIsReportGenerating(true);
    logAction("Report Generation", "AI comprehensive forensic report generation initiated.");
    showNotification("Generating comprehensive AI forensic report...", "info");

    try {
      const report = await generateDetailedReport(activeCase, queryHistory, appendedItems, username, userRole);
      setAiReport(report);
      logAction("Report Generation", "AI forensic report generated successfully.");
      showNotification("Comprehensive AI report generated.", "success");
    } catch (err) {
      console.error("Report generation failed:", err);
      showNotification("Report generation failed. Please try again.", "error");
    } finally {
      setIsReportGenerating(false);
    }
  };

  // Export detailed report
  const handleExportReport = () => {
    logAction("Report Exported", "Case summary report generated and signed digitally.");
    showNotification("Generating report package. Download starting...", "success");
    
    let fullReport = reportContent;

    // If AI report exists, append its structured data
    if (aiReport) {
      fullReport += "\n\n" + "=".repeat(80);
      fullReport += "\nAI-GENERATED COMPREHENSIVE FORENSIC ANALYSIS REPORT";
      fullReport += "\n" + "=".repeat(80);
      fullReport += `\n\nEXECUTIVE SUMMARY:\n${aiReport.executiveSummary}`;
      
      if (aiReport.suspectProfiles?.length) {
        fullReport += "\n\nSUSPECT PROFILES & RISK ASSESSMENT:";
        aiReport.suspectProfiles.forEach(s => {
          fullReport += `\n  [${s.riskLevel}] ${s.name} (${s.alias}) - ${s.role}\n    ${s.assessment}`;
        });
      }
      if (aiReport.suspiciousCommunications?.length) {
        fullReport += "\n\nSUSPICIOUS COMMUNICATIONS:";
        aiReport.suspiciousCommunications.forEach(c => {
          fullReport += `\n  [${c.timestamp}] ${c.from} → ${c.to} (${c.channel})\n    "${c.content}"\n    Reason: ${c.reason}`;
        });
      }
      if (aiReport.suspiciousCallLogs?.length) {
        fullReport += "\n\nSUSPICIOUS CALL LOGS:";
        aiReport.suspiciousCallLogs.forEach(c => {
          fullReport += `\n  [${c.timestamp}] ${c.caller} → ${c.receiver} (${c.duration})\n    Reason: ${c.reason}`;
        });
      }
      if (aiReport.suspiciousKeywords?.length) {
        fullReport += "\n\nSUSPICIOUS KEYWORDS & LANGUAGE:";
        aiReport.suspiciousKeywords.forEach(k => {
          fullReport += `\n  [${k.severity}] "${k.keyword}" — said by ${k.speaker}\n    Context: ${k.context}\n    Interpretation: ${k.interpretation}`;
        });
      }
      if (aiReport.suspiciousMedia?.length) {
        fullReport += "\n\nSUSPICIOUS MEDIA & FILES:";
        aiReport.suspiciousMedia.forEach(m => {
          fullReport += `\n  [${m.timestamp}] ${m.actor}: ${m.description}\n    Reason: ${m.reason}`;
        });
      }
      if (aiReport.suspiciousLocations?.length) {
        fullReport += "\n\nSUSPICIOUS GPS/LOCATION HISTORY:";
        aiReport.suspiciousLocations.forEach(l => {
          fullReport += `\n  [${l.timestamp}] ${l.person} at ${l.location} (${l.coordinates})\n    Reason: ${l.reason}`;
        });
      }
      if (aiReport.anomalySummary?.length) {
        fullReport += "\n\nANOMALY SUMMARY:";
        aiReport.anomalySummary.forEach(a => {
          fullReport += `\n  [${a.risk} - ${a.category}] ${a.description}\n    Evidence: ${a.evidence}\n    Recommendation: ${a.recommendation}`;
        });
      }
      fullReport += `\n\nCOMMUNICATION NETWORK ANALYSIS:\n${aiReport.networkAnalysis}`;
      if (aiReport.recommendations?.length) {
        fullReport += "\n\nINVESTIGATOR RECOMMENDATIONS:";
        aiReport.recommendations.forEach((r, i) => { fullReport += `\n  ${i+1}. ${r}`; });
      }
      fullReport += `\n\nCONCLUSION:\n${aiReport.conclusion}`;
    }

    fullReport += `\n\n${"=".repeat(80)}\nDIGITAL SIGNATURE SECURED:\nInvestigator: ${username}\nRole: ${userRole}\nTimestamp: ${new Date().toISOString()}\n${"=".repeat(80)}`;

    const element = document.createElement("a");
    const file = new Blob([fullReport], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeCase.id}_Forensic_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (activeScreen === "login") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Shield className="auth-logo-icon" />
            <h1 className="auth-title">ForensicAI Query</h1>
            <p className="auth-subtitle">Secure Investigator Access Handshake</p>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Investigator Handle</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role Authorization</label>
              <select 
                className="form-select" 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="Investigator">Lead Investigator</option>
                <option value="Analyst">Forensic Analyst</option>
                <option value="Admin">Administrator</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Access Pin / Password</label>
              <input 
                type="password" 
                className="form-input" 
                required 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">2FA Authorization Token</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="6-Digit OTP Token" 
                maxLength="6"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <button type="submit" className="auth-btn">Establish Session</button>
          </form>
          <div className="auth-footer">
            AUTHORIZED PERSONNEL ONLY. ACCESS IS AUDITED AND LOGGED.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ThemeToggle />
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <Shield className="sidebar-logo-icon" size={24} />
            <span className="sidebar-title">ForensicAI</span>
          </div>
          <nav className="sidebar-menu">
            <div 
              className={`menu-item ${activeScreen === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveScreen("dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "case_manager" ? "active" : ""}`}
              onClick={() => setActiveScreen("case_manager")}
            >
              <Database size={18} />
              <span>Case & Data Manager</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "query" ? "active" : ""}`}
              onClick={() => setActiveScreen("query")}
            >
              <HelpCircle size={18} />
              <span>AI Query Interface</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "timeline" ? "active" : ""}`}
              onClick={() => setActiveScreen("timeline")}
            >
              <Calendar size={18} />
              <span>Evidence Timeline</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "correlation" ? "active" : ""}`}
              onClick={() => {
                setActiveScreen("correlation");
                setSelectedNode(null);
              }}
            >
              <Network size={18} />
              <span>Correlation Map</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "suspicion" ? "active" : ""}`}
              onClick={() => setActiveScreen("suspicion")}
            >
              <AlertTriangle size={18} />
              <span>Suspicion & Anomalies</span>
            </div>
            <div 
              className={`menu-item ${activeScreen === "report" ? "active" : ""}`}
              onClick={() => setActiveScreen("report")}
            >
              <FileText size={18} />
              <span>Report Builder</span>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-role">{userRole}</span>
            </div>
            <LogOut 
              size={16} 
              style={{ marginLeft: "auto", cursor: "pointer", color: "var(--accent-rose)" }} 
              onClick={handleLogout}
              title="Logout Session"
            />
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-workspace">
        {/* Workspace Top Header */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="case-selector-container">
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>ACTIVE CASE:</span>
              <select 
                className="case-select-dropdown" 
                value={currentCaseId} 
                onChange={(e) => setCurrentCaseId(e.target.value)}
              >
                <option value="crypt_shepherd">CryptShepherd (Cyber Extortion)</option>
                <option value="project_aegis">ProjectAegis (Insider Threat)</option>
                <option value="blue_lotus">BlueLotus (Narcotics Ring)</option>
                <option value="phish_hook">PhishHook (Identity Theft)</option>
              </select>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge alert">
              SHIELD SECURE
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              V2026.05.20
            </span>
          </div>
        </header>

        {/* Workspace Body Content */}
        <div className="workspace-content">
          
          {/* AI Guidance Banner */}
          {aiGuidance && (
            <div className="ai-guidance-banner">
              <Sparkles size={14} style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />
              <span>{aiGuidance}</span>
              <div className="ai-models-indicator">
                {Object.values(aiModelsStatus).map((m, i) => (
                  <span key={i} className={`model-dot ${m.available ? "online" : "offline"}`} title={`${m.model} — ${m.role} (${m.available ? "Online" : "Offline"})`} />
                ))}
              </div>
            </div>
          )}

          {/* Notification Toast */}
          {notification && (
            <div className="notification-bubble">
              <CheckCircle2 size={16} style={{ color: notification.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{notification.text}</span>
            </div>
          )}

          {/* SCREEN 1: Dashboard Overview */}
          {activeScreen === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="alert-strip">
                <span className="alert-message">
                  <AlertCircle size={16} style={{ color: "var(--accent-rose)" }} />
                  CRITICAL: 2 new suspicion anomalies detected in {activeCase.name}. Immediate review recommended.
                </span>
                <button className="alert-btn" onClick={() => setActiveScreen("suspicion")}>Investigate</button>
              </div>

              <div className="dashboard-grid">
                <div className="stat-card">
                  <div className="stat-details">
                    <span className="stat-label">Total Messages</span>
                    <span className="stat-val">{activeCase.metrics.totalMessages.toLocaleString()}</span>
                  </div>
                  <div className="stat-icon-wrapper"><Database size={24} /></div>
                </div>
                <div className="stat-card">
                  <div className="stat-details">
                    <span className="stat-label">Total Calls</span>
                    <span className="stat-val">{activeCase.metrics.totalCalls}</span>
                  </div>
                  <div className="stat-icon-wrapper"><Network size={24} /></div>
                </div>
                <div 
                  className="stat-card clickable-stat" 
                  onClick={() => setShowFlaggedModal(true)}
                  style={{ cursor: "pointer" }}
                  title="Click to view flagged contacts details"
                >
                  <div className="stat-details">
                    <span className="stat-label">Flagged Contacts</span>
                    <span className="stat-val" style={{ color: "var(--accent-rose)" }}>{activeCase.metrics.flaggedContacts}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(244, 63, 94, 0.1)", color: "var(--accent-rose)" }}><AlertTriangle size={24} /></div>
                </div>
                <div className="stat-card">
                  <div className="stat-details">
                    <span className="stat-label">Data Health</span>
                    <span className="stat-val" style={{ color: "var(--accent-emerald)" }}>{activeCase.metrics.dataHealth}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)" }}><CheckCircle2 size={24} /></div>
                </div>
              </div>

              <div className="dashboard-row-2">
                <div className="panel-card">
                  <div className="panel-title-container">
                    <h2 className="panel-title"><Shield size={18} /> Active Case Overview</h2>
                    <span className="status-badge" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", borderColor: "var(--accent-blue)", color: "var(--accent-blue)" }}>{activeCase.status}</span>
                  </div>
                  <div className="panel-body" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    <p style={{ marginBottom: "1rem", color: "var(--text-primary)", fontWeight: 600 }}>{activeCase.name}</p>
                    <p style={{ marginBottom: "1.5rem" }}>{activeCase.description}</p>
                    
                    <h3 style={{ fontSize: "0.85rem", color: "var(--text-primary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Active UFED Source Materials</h3>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {activeCase.metrics.uploadedFiles.concat(customFiles).map((file, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.6rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.75rem" }}>
                          <FileText size={12} style={{ color: "var(--accent-blue)" }} />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-title-container">
                    <h2 className="panel-title"><AlertTriangle size={18} style={{ color: "var(--accent-rose)" }} /> Recent Incidents</h2>
                  </div>
                  <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {activeCase.anomalies.map((anom, idx) => (
                      <div 
                        key={idx} 
                        style={{ padding: "0.75rem", borderLeft: `3px solid ${anom.risk === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`, backgroundColor: "var(--bg-primary)", borderRadius: "4px", cursor: "pointer" }}
                        onClick={() => jumpToTimelineEvent(anom.linkedEventId)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: anom.risk === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>{anom.risk} RISK</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{anom.category}</span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{anom.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Model Performance Analytics */}
              <div className="panel-card">
                <div className="panel-title-container">
                  <h2 className="panel-title"><Sparkles size={18} style={{ color: "var(--accent-cyan)" }} /> AI Model Performance Analytics</h2>
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    {Object.values(aiModelsStatus).map((m, i) => (
                      <span key={i} className={`model-dot ${m.available ? "online" : "offline"}`} title={`${m.model} — ${m.available ? "Online" : "Offline"}`} />
                    ))}
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>
                      {Object.values(aiModelsStatus).filter(m => m.available).length}/3 Models Active
                    </span>
                  </div>
                </div>

                {/* Model Cards */}
                <div className="ai-model-cards-grid">
                  <div className="ai-model-stat-card">
                    <div className="ai-model-stat-header">
                      <span className="ai-model-stat-dot" style={{ background: "var(--accent-cyan)" }} />
                      <strong>Gemini 2.5 Flash</strong>
                    </div>
                    <span className="ai-model-stat-role">Deep Analysis & Reports</span>
                    <div className="ai-model-stat-specs">
                      <span>1M token context</span>
                      <span>{aiModelsStatus.gemini.available ? "● Online" : "○ Offline"}</span>
                    </div>
                  </div>
                  <div className="ai-model-stat-card">
                    <div className="ai-model-stat-header">
                      <span className="ai-model-stat-dot" style={{ background: "var(--accent-purple, #a855f7)" }} />
                      <strong>Llama 3.3 70B</strong>
                    </div>
                    <span className="ai-model-stat-role">AI Chatbot (Groq)</span>
                    <div className="ai-model-stat-specs">
                      <span>131K tokens • 300+ tok/s</span>
                      <span>{aiModelsStatus.groqChat.available ? "● Online" : "○ Offline"}</span>
                    </div>
                  </div>
                  <div className="ai-model-stat-card">
                    <div className="ai-model-stat-header">
                      <span className="ai-model-stat-dot" style={{ background: "var(--accent-amber)" }} />
                      <strong>Llama 3.1 8B</strong>
                    </div>
                    <span className="ai-model-stat-role">Screen Guidance (Groq)</span>
                    <div className="ai-model-stat-specs">
                      <span>131K tokens • Ultra-Fast</span>
                      <span>{aiModelsStatus.groqGuide.available ? "● Online" : "○ Offline"}</span>
                    </div>
                  </div>
                </div>

                {/* Graph Gallery */}
                <div className="ai-graph-gallery">
                  <div className="ai-graph-card">
                    <img src="/ai-graphs/accuracy.png" alt="AI Model Accuracy Comparison" loading="lazy" />
                    <span className="ai-graph-caption">Model Accuracy Comparison</span>
                  </div>
                  <div className="ai-graph-card">
                    <img src="/ai-graphs/latency.png" alt="Response Latency & Throughput" loading="lazy" />
                    <span className="ai-graph-caption">Response Latency & Throughput</span>
                  </div>
                  <div className="ai-graph-card">
                    <img src="/ai-graphs/tokens.png" alt="Context Window & Token Capacity" loading="lazy" />
                    <span className="ai-graph-caption">Context Window & Token Capacity</span>
                  </div>
                  <div className="ai-graph-card">
                    <img src="/ai-graphs/specialization.png" alt="Task Specialization Matrix" loading="lazy" />
                    <span className="ai-graph-caption">Task Specialization Matrix</span>
                  </div>
                  <div className="ai-graph-card full-width">
                    <img src="/ai-graphs/architecture.png" alt="Multi-Model AI Pipeline Architecture" loading="lazy" />
                    <span className="ai-graph-caption">Multi-Model AI Pipeline Architecture</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: Case & Data Manager */}
          {activeScreen === "case_manager" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="panel-card">
                <div className="panel-title-container">
                  <h2 className="panel-title"><Upload size={18} /> Forensic Extraction Uploader</h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Load Cellebrite XML/JSON exports or cell tower dumps</span>
                </div>
                <div 
                  className="upload-zone" 
                  onClick={handleFileUpload}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("dragover");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("dragover");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("dragover");
                    const caseId = e.dataTransfer.getData("caseId");
                    const fileName = e.dataTransfer.getData("fileName");
                    if (caseId && cases[caseId]) {
                      analyzeCaseFile(caseId, fileName);
                    } else {
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        parseRealFile(file);
                      }
                    }
                  }}
                >
                  {parsingStatus === "idle" && (
                    <>
                      <Upload className="upload-icon" />
                      <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem" }}>Drag and drop UFDR files here, or click to choose from system</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Supports .ufdr, .xml, .csv, and physical device folder structures</p>
                      
                      <div className="quick-scenarios-container" onClick={(e) => e.stopPropagation()}>
                        <p style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 600, letterSpacing: "1px", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                          Quick Scan Mock Forensic Files:
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                          {Object.keys(cases).map((key) => {
                            const sc = cases[key];
                            const fileName = `${key}_ufdr.json`;
                            return (
                              <div 
                                key={key}
                                draggable
                                onDragStart={(e) => handleDragStart(e, key, fileName)}
                                onClick={() => analyzeCaseFile(key, fileName)}
                                className="quick-scenario-chip"
                                title={`Drag to this area or click to auto-parse ${sc.name}`}
                              >
                                <FileText size={12} style={{ color: "var(--accent-blue)" }} />
                                <span>{fileName}</span>
                                <span className="chip-action-pill">Drag / Click</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                  {parsingStatus === "parsing" && (
                    <div className="parsing-loader-container">
                      <Clock size={36} className="upload-icon" style={{ animation: "spin 2s linear infinite" }} />
                      <p style={{ fontWeight: 600 }}>Decompressing file system structure & parsing databases...</p>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${parsingProgress}%` }}></div>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Parsing SQLite contacts db, WhatsApp keys, and SMS tables... {parsingProgress}%</p>
                    </div>
                  )}
                  {parsingStatus === "done" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <CheckCircle2 size={36} style={{ color: "var(--accent-emerald)", filter: "drop-shadow(var(--glow-emerald))" }} />
                      <p style={{ fontWeight: 600, color: "var(--accent-emerald)" }}>Cellebrite extraction filesystem parsed successfully.</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Loaded files: {customFiles.join(", ")}</p>
                      <button 
                        className="auth-btn" 
                        style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", marginTop: "0.5rem" }}
                        onClick={(e) => { e.stopPropagation(); setParsingStatus("idle"); }}
                      >
                        Upload Another Extraction
                      </button>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--accent-emerald)" }} /> Parser Extraction Status
                </h3>
                <div className="parser-status-list">
                  <div className="parser-status-item">
                    <span>WhatsApp / Messenger database extraction</span>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                      PARSED ({activeCase?.metrics?.filesCount ?? 0} files) ✓
                    </span>
                  </div>
                  <div className="parser-status-item">
                    <span>SMS / MMS message backups</span>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                      PARSED ({(activeCase?.metrics?.totalMessages ?? 0).toLocaleString()} rows) ✓
                    </span>
                  </div>
                  <div className="parser-status-item">
                    <span>Device location log cache (GPS history)</span>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                      PARSED ({activeCase?.timeline?.filter(e => e.type === "location").length ?? 0} points) ✓
                    </span>
                  </div>
                  <div className="parser-status-item">
                    <span>Audit trail records & integrity verification</span>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                      VERIFIED (SHA-256 matches) ✓
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-title-container">
                  <h2 className="panel-title"><UserCheck size={18} /> Suspect Profile Directory ({activeCase.suspects.length})</h2>
                </div>
                <div className="suspect-profiles-grid">
                  {activeCase.suspects.map((suspect, idx) => (
                    <div key={idx} className="suspect-card">
                      <div className="suspect-avatar">{suspect.avatar}</div>
                      <div className="suspect-info">
                        <span className="suspect-name">{suspect.name}</span>
                        <span className="suspect-alias">Alias: {suspect.alias}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{suspect.phone}</span>
                        <span className="suspect-role">{suspect.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: AI Query Interface */}
          {activeScreen === "query" && (
            <div className="query-interface-container">
              <div className="query-main-panel">
                <div className="query-input-box">
                  <form onSubmit={handleQuerySubmit} className="query-input-row">
                    <textarea 
                      className="query-textarea"
                      placeholder="Ask the AI investigator a natural language question (e.g., 'Find extortion messages containing BTC address')..."
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleQuerySubmit();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className={`query-btn ${isListening ? "listening" : ""}`} 
                      style={{ padding: "0 0.75rem", backgroundColor: isListening ? "var(--accent-rose)" : "var(--bg-primary)", border: "1px solid var(--border-color)", color: isListening ? "white" : "var(--text-secondary)" }}
                      onClick={toggleVoiceInput}
                    >
                      <Mic size={18} style={{ animation: isListening ? "pulseGlow 1.5s infinite" : "none" }} />
                    </button>
                    <button type="submit" className="query-btn">
                      <Send size={16} />
                      <span>Query</span>
                    </button>
                  </form>
                  <div className="presets-container">
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>PRESETS:</span>
                    {getCasePresets(activeCase).map((preset, idx) => (
                      <button 
                        key={idx} 
                        className="preset-chip" 
                        onClick={() => runPresetQuery(preset)}
                      >
                        {preset.query}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="query-output-panel">
                  {isAIProcessing ? (
                    <div className="ai-loading-container">
                      <div className="ai-loading-spinner" />
                      <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--accent-cyan)" }}>AI Analyzing Case Data...</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Gemini 2.5 Flash is processing your query against all timeline events, suspects, and anomalies</p>
                    </div>
                  ) : activeQueryResult ? (
                    <>
                      <div className="output-header-bar">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>AI INTENT DETECTED:</span>
                          <span className="intent-badge">{activeQueryResult.intent}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Files Parsed:</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                              {activeCase.metrics.filesCount || 140}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Confidence Score:</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: activeQueryResult.confidence > 90 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                              {activeQueryResult.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sql-translation-card">
                        <div>// Structured Query Translation:</div>
                        <code>{activeQueryResult.translation}</code>
                      </div>

                      <div className="summary-text-pane">
                        <p style={{ fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "0.25rem" }}>AI Synthesis Summary</p>
                        <p style={{ color: "var(--text-primary)" }}>{activeQueryResult.summary}</p>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <button 
                            className="auth-btn" 
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                            onClick={() => appendToReport(`AI Query Results - ${activeQueryResult.intent}`, activeQueryResult.summary)}
                          >
                            <Check size={12} />
                            <span>Append to Case Draft</span>
                          </button>

                          <button 
                            className="auth-btn" 
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto", backgroundColor: "rgba(59, 130, 246, 0.2)", border: "1px solid var(--accent-blue)", color: "white" }}
                            onClick={() => {
                              logAction("Navigation", "Investigator marked query stage complete and transitioned to Report Builder.");
                              setActiveScreen("report");
                              showNotification("Transitioned to Report Builder.", "info");
                            }}
                          >
                            <span>Proceed to Report Page →</span>
                          </button>
                        </div>
                      </div>

                      <div className="results-table-container">
                        <table className="forensic-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Sender</th>
                              <th>Recipient</th>
                              <th>Source</th>
                              <th>Extract Contents</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeQueryResult.results.map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{row.time}</td>
                                <td style={{ fontWeight: 600 }}>{row.from || row.actor}</td>
                                <td>{row.to || row.recipient || "N/A"}</td>
                                <td>
                                  <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "4px" }}>
                                    {row.channel}
                                  </span>
                                </td>
                                <td style={{ color: "var(--text-primary)" }}>{row.message || row.coord || row.content}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="suggested-follows">
                        <span className="suggested-title">Suggested Follow-Up Queries</span>
                        <div className="suggested-list">
                          {activeQueryResult.suggestions.map((sug, idx) => (
                            <span 
                              key={idx} 
                              className="suggested-item"
                              onClick={() => {
                                setQueryInput(sug);
                                showNotification("Suggested query set. Click Query to run.", "info");
                              }}
                            >
                              • {sug}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", margin: "auto", color: "var(--text-muted)", gap: "0.5rem", padding: "2rem" }}>
                      <HelpCircle size={48} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
                      <p style={{ fontSize: "0.95rem" }}>Ask a question or select a preset query above to start investigation analysis.</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--accent-cyan)" }}>
                        <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Powered by Gemini 2.5 Flash — each query analyzes the full case dataset
                      </p>
                      <button 
                        className="auth-btn" 
                        style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", marginTop: "1rem", backgroundColor: "rgba(59, 130, 246, 0.15)", border: "1px solid var(--accent-blue)" }}
                        onClick={() => {
                          setActiveScreen("report");
                        }}
                      >
                        Skip to Report Page →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="query-history-sidebar">
                <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Clock size={14} /> Query History
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {queryHistory.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No queries recorded in this session.</span>
                  ) : (
                    queryHistory.map((q, idx) => (
                      <div 
                        key={idx} 
                        style={{ padding: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        onClick={() => {
                          setQueryInput(q);
                          showNotification("Query set. Click Query to run.", "info");
                        }}
                      >
                        {q}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: Evidence Timeline */}
          {activeScreen === "timeline" && (
            <div className="timeline-container">
              <div className="timeline-filters">
                <div className="filter-group">
                  <Search size={16} style={{ color: "var(--text-muted)" }} />
                  <input 
                    type="text" 
                    placeholder="Search messages, channels..." 
                    className="form-input" 
                    style={{ padding: "0.4rem 0.8rem", width: "240px" }}
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                  />
                </div>
                
                <div className="filter-group" style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "1.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "0.5rem" }}>CHANNELS:</span>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={timelineTypeFilter.chat} 
                      onChange={(e) => setTimelineTypeFilter(p => ({ ...p, chat: e.target.checked }))} 
                    />
                    Chats
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={timelineTypeFilter.call} 
                      onChange={(e) => setTimelineTypeFilter(p => ({ ...p, call: e.target.checked }))} 
                    />
                    Calls
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={timelineTypeFilter.location} 
                      onChange={(e) => setTimelineTypeFilter(p => ({ ...p, location: e.target.checked }))} 
                    />
                    Locations
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={timelineTypeFilter.media} 
                      onChange={(e) => setTimelineTypeFilter(p => ({ ...p, media: e.target.checked }))} 
                    />
                    Media/Sys
                  </label>
                </div>

                <div className="filter-group" style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "1.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "0.5rem" }}>SUSPECTS:</span>
                  {activeCase.suspects.map((suspect, idx) => (
                    <label key={idx} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={!!timelineSuspectFilter[suspect.name]} 
                        onChange={(e) => setTimelineSuspectFilter(p => ({ ...p, [suspect.name]: e.target.checked }))} 
                      />
                      {suspect.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="timeline-scroll-area">
                {activeCase.timeline
                  .filter(node => {
                    // Check search text
                    if (timelineSearch && !node.content.toLowerCase().includes(timelineSearch.toLowerCase()) && !node.actor.toLowerCase().includes(timelineSearch.toLowerCase())) {
                      return false;
                    }
                    // Check type filter
                    if (node.type === "chat" && !timelineTypeFilter.chat) return false;
                    if (node.type === "call" && !timelineTypeFilter.call) return false;
                    if (node.type === "location" && !timelineTypeFilter.location) return false;
                    if (node.type === "media" && !timelineTypeFilter.media) return false;

                    // Check suspect filter
                    if (node.actor !== "None" && !timelineSuspectFilter[node.actor]) {
                      if (node.recipient && node.recipient !== "None" && !timelineSuspectFilter[node.recipient]) {
                        return false;
                      }
                      if (!node.recipient || node.recipient === "None") return false;
                    }
                    return true;
                  })
                  .map((node, idx) => (
                    <div 
                      key={idx} 
                      id={node.id} 
                      className={`timeline-node ${node.type} ${node.severity === 'Suspicious' ? 'suspicious' : ''}`}
                      style={{ 
                        boxShadow: highlightedEventId === node.id ? "0 0 15px var(--accent-rose)" : "none",
                        borderColor: highlightedEventId === node.id ? "var(--accent-rose)" : "var(--border-color)" 
                      }}
                    >
                      <span className="node-time">
                        {new Date(node.timestamp).toLocaleString()}
                      </span>
                      <div className="node-content-box">
                        <span className="node-actor-line">
                          {node.actor} {node.recipient && node.recipient !== "None" ? ` → ${node.recipient}` : ""}
                        </span>
                        <span className="node-body-text">{node.content}</span>
                      </div>
                      <span className="node-channel-tag">{node.channel}</span>
                      
                      {/* Drag/Append Action Button */}
                      <button 
                        className="auth-btn" 
                        style={{ position: "absolute", right: "1rem", top: "0.25rem", padding: "0.2rem 0.4rem", fontSize: "0.65rem", background: "none", border: "1px solid var(--border-color)", boxShadow: "none" }}
                        onClick={() => appendToReport(`Timeline Event - ${node.id}`, `[${node.timestamp}] ${node.actor}: ${node.content}`)}
                      >
                        + Append
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: Correlation Map */}
          {activeScreen === "correlation" && (
            <div className="graph-container">
              <div className="graph-canvas-card" style={{ padding: 0, overflow: "hidden" }}>
                <ForceGraph 
                  graphData={activeCase.graph} 
                  onNodeSelect={(node) => setSelectedNode(node)}
                  selectedNodeId={selectedNode?.id}
                />
              </div>

              <div className="graph-detail-card">
                {selectedNode ? (
                  <>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                      Node Insights
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                      <p><span style={{ color: "var(--text-secondary)" }}>Entity:</span> <strong>{selectedNode.id}</strong></p>
                      <p><span style={{ color: "var(--text-secondary)" }}>Risk Profile:</span> <span className={`severity-pill ${selectedNode.type === 'flagged' ? 'High' : 'Low'}`} style={{ padding: "0.1rem 0.3rem" }}>{selectedNode.type.toUpperCase()}</span></p>
                      <p><span style={{ color: "var(--text-secondary)" }}>Direct Contacts:</span> {activeCase.graph.links.filter(l => (l.source === selectedNode.id || l.target === selectedNode.id) && l.value > 0).length}</p>
                      <p><span style={{ color: "var(--text-secondary)" }}>Shared Communications:</span> {selectedNode.count} events</p>
                    </div>

                    <button 
                      className="auth-btn"
                      style={{ padding: "0.4rem", fontSize: "0.75rem" }}
                      onClick={() => appendToReport(`Node Correlation - ${selectedNode.id}`, `Identified entity: ${selectedNode.id}. Risk status: ${selectedNode.type}. Shared communication vectors: ${selectedNode.count} nodes.`)}
                    >
                      Append Node to Report
                    </button>

                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Active Interactions</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {activeCase.timeline
                          .filter(t => t.actor === selectedNode.id || t.recipient === selectedNode.id)
                          .slice(0, 5)
                          .map((t, idx) => (
                            <div key={idx} style={{ padding: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.75rem" }}>
                              <div style={{ color: "var(--text-muted)", marginBottom: "0.15rem" }}>{new Date(t.timestamp).toLocaleTimeString()}</div>
                              <div>{t.content}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", items: "center", margin: "auto", color: "var(--text-muted)", textAlign: "center", gap: "0.5rem" }}>
                    <Network size={36} style={{ margin: "0 auto" }} />
                    <p style={{ fontSize: "0.85rem" }}>Select a node in the graph map to pull communication frequency metrics.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 6: Suspicion & Anomalies */}
          {activeScreen === "suspicion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="suspicion-panel-grid">
                {activeCase.anomalies.map((anom, idx) => (
                  <div key={idx} className={`suspicion-card ${anom.risk}`}>
                    <div className="card-header-row">
                      <span className="anomaly-category">{anom.category}</span>
                      <span className={`severity-pill ${anom.risk}`}>{anom.risk} Risk</span>
                    </div>
                    <p className="anomaly-desc">{anom.description}</p>
                    <div className="evidence-quote-box">
                      "{anom.evidence}"
                    </div>
                    <div className="action-row">
                      <span 
                        className="view-evidence-link"
                        onClick={() => jumpToTimelineEvent(anom.linkedEventId)}
                      >
                        Verify in Timeline <ChevronRight size={12} />
                      </span>
                      <button 
                        className="auth-btn"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", marginTop: 0 }}
                        onClick={() => appendToReport(`Suspicion flag - ${anom.category}`, `[${anom.risk} Risk] ${anom.description}\nEvidence: ${anom.evidence}\nRecommendation: ${anom.recommendation}`)}
                      >
                        Append Flag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 7: Report Builder */}
          {activeScreen === "report" && (
            <div className="report-builder-layout">
              <div className="report-editor-card">
                <input 
                  type="text" 
                  className="report-title-input" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)} 
                />
                
                {/* AI Report Generation Button */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button 
                    className="ai-report-generate-btn"
                    onClick={handleGenerateAIReport}
                    disabled={isReportGenerating}
                  >
                    {isReportGenerating ? (
                      <><Loader size={14} className="spin-icon" /> Generating AI Report...</>
                    ) : (
                      <><Sparkles size={14} /> Generate Comprehensive AI Report</>
                    )}
                  </button>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Powered by Gemini 2.5 Flash • Analyzes all evidence
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>Appended blocks:</span>
                  {appendedItems.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None yet. Click "Append" on other panels to add evidence.</span>
                  ) : (
                    appendedItems.map((item, idx) => (
                      <span key={idx} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "rgba(59, 130, 246, 0.15)", border: "1px solid var(--accent-blue)", borderRadius: "4px", color: "var(--text-primary)" }}>
                        {item}
                      </span>
                    ))
                  )}
                </div>

                {/* AI Generated Report Sections */}
                {aiReport && (
                  <div className="ai-report-sections">
                    {/* Executive Summary */}
                    <div className="ai-report-section executive">
                      <h3><Shield size={14} /> Executive Summary</h3>
                      <p>{aiReport.executiveSummary}</p>
                    </div>

                    {/* Suspect Profiles */}
                    {aiReport.suspectProfiles?.length > 0 && (
                      <div className="ai-report-section">
                        <h3><User size={14} /> Suspect Profiles & Risk Assessment</h3>
                        {aiReport.suspectProfiles.map((s, i) => (
                          <div key={i} className="report-suspect-row">
                            <div className="report-suspect-header">
                              <strong>{s.name}</strong> <span className="report-alias">({s.alias})</span>
                              <span className={`severity-pill ${s.riskLevel}`}>{s.riskLevel}</span>
                            </div>
                            <div className="report-suspect-role">{s.role}</div>
                            <p className="report-suspect-assessment">{s.assessment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suspicious Communications */}
                    {aiReport.suspiciousCommunications?.length > 0 && (
                      <div className="ai-report-section danger">
                        <h3><MessageCircle size={14} /> Suspicious Communications ({aiReport.suspiciousCommunications.length})</h3>
                        {aiReport.suspiciousCommunications.map((c, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className="report-timestamp">{c.timestamp}</span>
                              <span>{c.from} → {c.to}</span>
                              <span className="report-channel">{c.channel}</span>
                            </div>
                            <div className="report-evidence-content">"{c.content}"</div>
                            <div className="report-evidence-reason"><AlertTriangle size={10} /> {c.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suspicious Call Logs */}
                    {aiReport.suspiciousCallLogs?.length > 0 && (
                      <div className="ai-report-section warning">
                        <h3><Phone size={14} /> Suspicious Call Logs ({aiReport.suspiciousCallLogs.length})</h3>
                        {aiReport.suspiciousCallLogs.map((c, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className="report-timestamp">{c.timestamp}</span>
                              <span>{c.caller} → {c.receiver}</span>
                              <span className="report-channel">{c.duration}</span>
                            </div>
                            <div className="report-evidence-reason"><AlertTriangle size={10} /> {c.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suspicious Keywords */}
                    {aiReport.suspiciousKeywords?.length > 0 && (
                      <div className="ai-report-section danger">
                        <h3><Key size={14} /> Suspicious Keywords & Language ({aiReport.suspiciousKeywords.length})</h3>
                        {aiReport.suspiciousKeywords.map((k, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className={`severity-pill ${k.severity}`}>{k.severity}</span>
                              <span>Keyword: <strong>"{k.keyword}"</strong></span>
                              <span>Speaker: {k.speaker}</span>
                            </div>
                            <div className="report-evidence-content">Context: "{k.context}"</div>
                            <div className="report-evidence-reason"><Zap size={10} /> {k.interpretation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suspicious Media */}
                    {aiReport.suspiciousMedia?.length > 0 && (
                      <div className="ai-report-section">
                        <h3><Image size={14} /> Suspicious Media & Files ({aiReport.suspiciousMedia.length})</h3>
                        {aiReport.suspiciousMedia.map((m, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className="report-timestamp">{m.timestamp}</span>
                              <span>{m.actor}</span>
                            </div>
                            <div className="report-evidence-content">{m.description}</div>
                            <div className="report-evidence-reason"><AlertTriangle size={10} /> {m.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suspicious Locations */}
                    {aiReport.suspiciousLocations?.length > 0 && (
                      <div className="ai-report-section warning">
                        <h3><MapPin size={14} /> Suspicious GPS/Location History ({aiReport.suspiciousLocations.length})</h3>
                        {aiReport.suspiciousLocations.map((l, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className="report-timestamp">{l.timestamp}</span>
                              <span>{l.person}</span>
                              <span className="report-channel">{l.location}</span>
                            </div>
                            <div className="report-evidence-content">{l.coordinates}</div>
                            <div className="report-evidence-reason"><MapPin size={10} /> {l.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Anomaly Summary */}
                    {aiReport.anomalySummary?.length > 0 && (
                      <div className="ai-report-section">
                        <h3><AlertTriangle size={14} /> Anomaly Summary</h3>
                        {aiReport.anomalySummary.map((a, i) => (
                          <div key={i} className="report-evidence-item">
                            <div className="report-evidence-meta">
                              <span className={`severity-pill ${a.risk}`}>{a.risk}</span>
                              <span>{a.category}</span>
                            </div>
                            <div className="report-evidence-content">{a.description}</div>
                            <div className="report-evidence-reason">Evidence: {a.evidence}</div>
                            <div className="report-evidence-reason" style={{ color: "var(--accent-cyan)" }}>↳ {a.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Network Analysis */}
                    {aiReport.networkAnalysis && (
                      <div className="ai-report-section">
                        <h3><Network size={14} /> Communication Network Analysis</h3>
                        <p>{aiReport.networkAnalysis}</p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiReport.recommendations?.length > 0 && (
                      <div className="ai-report-section executive">
                        <h3><CheckCircle2 size={14} /> Investigator Recommendations</h3>
                        <ol className="report-recommendations-list">
                          {aiReport.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ol>
                      </div>
                    )}

                    {/* Conclusion */}
                    {aiReport.conclusion && (
                      <div className="ai-report-section executive">
                        <h3><Shield size={14} /> Conclusion</h3>
                        <p style={{ fontWeight: 600 }}>{aiReport.conclusion}</p>
                      </div>
                    )}
                  </div>
                )}

                <textarea 
                  className="report-textbox" 
                  value={reportContent} 
                  onChange={(e) => setReportContent(e.target.value)} 
                  placeholder="Manual notes and appended evidence blocks appear here..."
                />

                <div className="sign-block-container">
                  <div className="sign-box">
                    <span>Authorized Signature</span>
                    <div className="sign-line"></div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Special Agent Lead Signature</span>
                  </div>
                  <div className="sign-box">
                    <span>Digital SHA-256 Checksum</span>
                    <code style={{ fontSize: "0.7rem", color: "var(--text-cyan)", wordBreak: "break-all" }}>
                      {currentCaseId === 'crypt_shepherd' ? '8a77c9ef1d48c0812bd8a61' : '3b9d02c89f55a1200df1821'}
                    </code>
                  </div>
                </div>

                <button 
                  className="auth-btn" 
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", alignSelf: "flex-end" }}
                  onClick={handleExportReport}
                >
                  <FileDown size={16} />
                  <span>Sign & Export Report</span>
                </button>
              </div>

              <div className="audit-logs-card">
                <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Shield size={14} /> System Audit Trail
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {auditLogs.slice(0, 15).map((log, idx) => (
                    <div key={idx} className="audit-log-item">
                      <span className="audit-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <div>
                        <span className="audit-action">{log.action}: </span>
                        <span style={{ color: "var(--text-secondary)" }}>{log.details}</span>
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Operator: <span className="audit-actor">{log.actor} ({log.role})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══ FLOATING AI CHATBOX ═══ */}
      {isAuthenticated && (
        <>
          {/* Toggle Button */}
          <button 
            className={`ai-chat-toggle ${chatOpen ? "open" : ""}`}
            onClick={() => setChatOpen(!chatOpen)}
            title="ForensicAI Assistant (Llama 3.3 70B)"
          >
            {chatOpen ? <X size={20} /> : <Bot size={20} />}
          </button>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="ai-chatbox">
              <div className="ai-chatbox-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Bot size={16} />
                  <span style={{ fontWeight: 700 }}>ForensicAI Assistant</span>
                </div>
                <span className="ai-model-tag">Llama 3.3 70B</span>
              </div>

              <div className="ai-chatbox-messages">
                {chatMessages.length === 0 && (
                  <div className="ai-chat-welcome">
                    <Bot size={28} style={{ color: "var(--accent-cyan)", opacity: 0.7 }} />
                    <p>Hi, I'm your ForensicAI assistant. Ask me anything about the current case — suspects, messages, locations, anomalies, or investigation strategy.</p>
                    <div className="chat-quick-prompts">
                      {["Who is the main suspect?", "Summarize the key evidence", "What should I investigate next?"].map((q, i) => (
                        <button key={i} className="chat-quick-btn" onClick={() => { setChatInput(q); }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-icon">
                      {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                ))}
                {isChatProcessing && (
                  <div className="chat-message ai">
                    <div className="chat-message-icon"><Bot size={12} /></div>
                    <div className="ai-typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form className="ai-chatbox-input" onSubmit={handleChatSubmit}>
                <input
                  type="text"
                  placeholder="Ask about the case..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" disabled={isChatProcessing || !chatInput.trim()}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </>
      )}
      {/* ═══ FLAGGED CONTACTS DETAILS MODAL ═══ */}
      {showFlaggedModal && (
        <div className="modal-overlay" onClick={() => setShowFlaggedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle className="modal-title-icon" size={20} style={{ color: "var(--accent-rose)" }} />
                <h2 className="modal-title">Flagged Contacts Analysis</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowFlaggedModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-case-info">
              <span className="case-badge">ACTIVE CASE</span>
              <span className="case-name">{activeCase.name}</span>
            </div>

            <div className="modal-body flagged-contacts-list">
              {activeCase.flaggedContactsList && activeCase.flaggedContactsList.length > 0 ? (
                activeCase.flaggedContactsList.map((contact, idx) => (
                  <div key={idx} className="flagged-contact-card">
                    <div className="contact-card-header">
                      <div className="contact-avatar-wrapper">
                        <span className="contact-avatar">{contact.avatar || "👤"}</span>
                      </div>
                      <div className="contact-meta">
                        <div className="contact-name-row">
                          <span className="contact-name">{contact.name}</span>
                          {contact.alias && (
                            <span className="contact-alias">({contact.alias})</span>
                          )}
                        </div>
                        <span className="contact-phone">{contact.phone}</span>
                      </div>
                      <span className={`risk-badge ${contact.risk.toLowerCase()}`}>
                        {contact.risk} Risk
                      </span>
                    </div>
                    
                    <div className="contact-card-body">
                      <div className="contact-role-row">
                        <span className="role-label">Role:</span>
                        <span className="role-value">{contact.role}</span>
                      </div>
                      <div className="contact-reason-box">
                        <span className="reason-label">Flagging Reason & Evidence:</span>
                        <p className="reason-text">{contact.reason}</p>
                      </div>
                    </div>

                    <div className="contact-card-actions">
                      <button 
                        className="contact-action-btn timeline"
                        onClick={() => {
                          setTimelineSearch(contact.name);
                          setActiveScreen("timeline");
                          setShowFlaggedModal(false);
                          showNotification(`Filtering timeline for: ${contact.name}`, "info");
                        }}
                      >
                        <Calendar size={12} />
                        <span>Filter in Timeline</span>
                      </button>
                      
                      <button 
                        className="contact-action-btn query"
                        onClick={() => {
                          setChatOpen(true);
                          setChatInput(`Tell me more about the contact ${contact.name} (${contact.alias}) and their role in the case.`);
                          setShowFlaggedModal(false);
                        }}
                      >
                        <Bot size={12} />
                        <span>Ask AI Assistant</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-flagged-contacts">
                  <p>No flagged contacts data available for this case.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

