'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

// Components
import CaseSelector from '@/components/CaseSelector';
import ParsingAnimation from '@/components/ParsingAnimation';
import ResultsTable from '@/components/ResultsTable'; // Need to create/refine this
import TimelineView from '@/components/TimelineView'; // Need to create/refine
import NetworkGraph from '@/components/NetworkGraph'; // Need to create/refine

// Services
import { analyzeNewUFDR, getCaseHistory } from '@/lib/forensics/ufdr-service';
import { scoreAllEntities } from '@/lib/forensics/suspicion-engine';

const VIEW_STATES = {
  SELECTING: 'SELECTING',
  PARSING: 'PARSING',
  INVESTIGATING: 'INVESTIGATING'
};

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const [viewState, setViewState] = useState(VIEW_STATES.SELECTING);
  const [history, setHistory] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [suspicion, setSuspicion] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingSector, setPendingSector] = useState(null);
  const isAdmin = user?.email?.toLowerCase() === 'prajwalndevang@gmail.com';

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const cases = await getCaseHistory();
    setHistory(cases);
  };

  const handleSelectCase = (caseData) => {
    setActiveCase(caseData);
    setSuspicion(scoreAllEntities(caseData));
    setViewState(VIEW_STATES.INVESTIGATING);
  };

  const handleStartAnalysis = (sector) => {
    setPendingSector(sector);
    setViewState(VIEW_STATES.PARSING);
  };

  const handleParsingComplete = async () => {
    try {
      const newCase = await analyzeNewUFDR(pendingSector);
      setActiveCase(newCase);
      setSuspicion(scoreAllEntities(newCase));
      setViewState(VIEW_STATES.INVESTIGATING);
      loadHistory(); // Update history list
    } catch (err) {
      console.error('Analysis failed', err);
      setViewState(VIEW_STATES.SELECTING);
    }
  };

  const handleExitCase = () => {
    setViewState(VIEW_STATES.SELECTING);
    setActiveCase(null);
    setSuspicion(null);
  };

  // --- Renderers ---

  if (viewState === VIEW_STATES.SELECTING) {
    return (
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.logo}>🔬 ForensicAI</div>
          <div className={styles.userSection}>
            {isAdmin && <Link href="/admin" className={styles.adminAccessBtn}>Admin Panel</Link>}
            <span>{user?.email}</span>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>
        <CaseSelector 
          history={history} 
          onSelect={handleSelectCase} 
          onUpload={handleStartAnalysis} 
        />
      </div>
    );
  }

  if (viewState === VIEW_STATES.PARSING) {
    return <ParsingAnimation onComplete={handleParsingComplete} />;
  }

  // Investigation Mode
  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo} onClick={handleExitCase}>
          <span>🔬</span>
          <span>ForensicAI</span>
        </div>
        <nav className={styles.sidebarNav}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'query', icon: '🔍', label: 'Query Engine' },
            { id: 'timeline', icon: '📅', label: 'Timeline' },
            { id: 'network', icon: '🕸️', label: 'Network Graph' },
            { id: 'suspicion', icon: '⚠️', label: 'Suspicion Report' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
          {isAdmin && (
            <Link href="/admin" className={styles.adminSidebarLink}>
              <span>⚙️</span>
              <span>Admin Panel</span>
            </Link>
          )}
          <button onClick={handleExitCase} className={styles.backLink}>← Exit Case</button>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.topBarCase}># {activeCase.metadata.id} · {activeCase.sector}</div>
            <div className={styles.topBarDevice}>{activeCase.metadata.name} · {activeCase.metadata.suspect}</div>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.topBarRiskBadge} data-level={suspicion?.suspect?.riskLevel.toLowerCase()}>
              {suspicion?.suspect?.riskLevel} RISK · {suspicion?.suspect?.score}/100
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && <OverviewTab activeCase={activeCase} suspicion={suspicion} />}
          {activeTab === 'query' && <QueryTab />}
          {activeTab === 'timeline' && <TimelineTab activeCase={activeCase} />}
          {activeTab === 'network' && <NetworkTab activeCase={activeCase} />}
          {activeTab === 'suspicion' && <SuspicionTab suspicion={suspicion} />}
        </div>
      </main>
    </div>
  );
}

// Sub-tabs
function TimelineTab({ activeCase }) {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>📅 Forensic Event Timeline</h2>
      <TimelineView activeCase={activeCase} />
    </div>
  );
}

function NetworkTab({ activeCase }) {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>🕸️ Relationship Discovery Graph</h2>
      <NetworkGraph activeCase={activeCase} />
    </div>
  );
}

function SuspicionTab({ suspicion }) {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>⚠️ Automated Suspicion Report</h2>
      <div className={styles.suspicionBoard}>
        <div className={styles.suspicionHero}>
          <div className={styles.heroScore} data-level={suspicion?.suspect?.riskLevel.toLowerCase()}>
            {suspicion?.suspect?.score}
          </div>
          <div>
            <div className={styles.heroLevel}>{suspicion?.suspect?.riskLevel} RISK PROFILE</div>
            <p className={styles.heroDesc}>Artificial Intelligence has identified {suspicion?.suspect?.flags.length} significant anomaly markers across the UFDR artifact set.</p>
          </div>
        </div>

        <div className={styles.fullFlagList}>
          {suspicion?.suspect?.flags.map((f, i) => (
            <div key={i} className={styles.fullFlagItem}>
              <div className={styles.flagScoreBadge}>+{f.points}</div>
              <div className={styles.flagMain}>
                <div className={styles.flagTitle}>{f.label}</div>
                <div className={styles.flagDetail}>{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function OverviewTab({ activeCase, suspicion }) {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Case Intelligence Summary</h2>
      
      <div className="grid-2">
        <div className="card">
          <h3 className={styles.cardHeader}>📱 Device Metadata</h3>
          <div className={styles.metaList}>
            {Object.entries({
              'Suspect Identity': activeCase.metadata.suspect,
              'Suspect Device': activeCase.metadata.deviceModel,
              'IMEI': activeCase.metadata.imei,
              'Analysis Date': new Date(activeCase.metadata.createdAt).toLocaleString(),
              'Investigator': activeCase.metadata.investigator,
            }).map(([k, v]) => (
              <div key={k} className={styles.metaRow}>
                <span className={styles.metaKey}>{k}</span>
                <span className={styles.metaValue}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className={styles.cardHeader}>⚠️ Automated Suspicion Scoring</h3>
          <div className={styles.riskDisplay}>
            <div className={styles.riskBigScore} data-level={suspicion?.suspect?.riskLevel.toLowerCase()}>
              {suspicion?.suspect?.score}
            </div>
            <div className={styles.riskMeta}>
              <div className={styles.riskLevel}>{suspicion?.suspect?.riskLevel} RISK PROFILE</div>
              <div className={styles.riskDesc}>Based on {suspicion?.suspect?.flags.length} anomaly detections</div>
            </div>
          </div>
          <div className={styles.flagList}>
            {suspicion?.suspect?.flags.slice(0, 3).map((f, i) => (
              <div key={i} className={styles.flagItem}>
                <span className={styles.flagPoints}>+{f.points}</span>
                <span className={styles.flagLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QueryTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    // API call to Layers 0-4
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.queryBarContainer}>
        <input 
          className={styles.queryInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the AI to investigate... (e.g. 'Show me late night calls')"
          onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
        />
        <button onClick={handleQuery} className={styles.queryBtn} disabled={loading}>
          {loading ? 'Analyzing...' : 'Investigate'}
        </button>
      </div>

      {result && (
        <div className={styles.queryResults}>
          <div className={styles.queryResultHeader}>
            <div>
              <div className={styles.intentBadge}>Intent Detected: {result.intent.intent}</div>
              <p className={styles.summaryText}>{result.summary}</p>
            </div>
            <div className={styles.confidenceScore}>
              <div className={styles.confidenceVal}>{result.intent.confidence}%</div>
              <div className={styles.confidenceLabel}>Confidence</div>
            </div>
          </div>
          
          <ResultsTable results={result.results} type={result.resultType} />
        </div>
      )}
    </div>
  );
}
