'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className={styles.hero}>
      <div className={styles.ambientGlow} />
      
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>🔬</span>
          <span>ForensicAI <span className={styles.logoBold}>Query</span></span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/auth/login" className="btn btn-ghost">Investigator Login</Link>
          <Link href="/auth/signup" className="btn btn-primary">Request Access</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          AI-Powered Mobile Evidence Intelligence
        </div>
        
        <h1 className={styles.heroTitle}>
          Automating Forensic <br />
          <span className={styles.heroAccent}>Discovery with AI</span>
        </h1>
        
        <p className={styles.heroSub}>
          Transform complex UFDR artifacts into actionable intelligence. 
          Use natural language to query call logs, chats, and locations 
          across specialized investigation sectors.
        </p>

        <div className={styles.heroActions}>
          <Link href="/auth/login" className={`${styles.mainBtn} btn btn-primary`}>
            Launch Investigation Suite →
          </Link>
          <a href="#workflow" className={`btn btn-secondary ${styles.secBtn}`}>
            See Intelligence Pipeline ↓
          </a>
        </div>

        {/* Terminal Preview */}
        <div className={styles.queryPreview}>
          <div className={styles.queryPreviewBar}>
            <div className={styles.terminalDots}><span /><span /><span /></div>
            <div className={styles.terminalTitle}>forensics-ai --query "detect crypto activity"</div>
          </div>
          <div className={styles.queryPreviewBody}>
            <div className={styles.queryLine}>
              <span className={styles.termPrompt}>{'>'}</span> 
              <span className={styles.termText}>Initializing Naive Bayes classifier...</span>
            </div>
            <div className={styles.queryLine}>
              <span className={styles.termPrompt}>{'>'}</span> 
              <span className={styles.termText}>Extracting BTC/ETH addresses from chat logs...</span>
            </div>
            <div className={styles.queryLine}>
              <span className={styles.termSuccess}>[SUCCESS]</span> Found 12 suspicious transactions linked to Case-2024-FRAUD.
            </div>
            <div className={styles.queryLine}>
              <span className={styles.termWarning}>[NOTICE]</span> Anomaly Score: 88/100 (HIGH RISK)
            </div>
            <div className={styles.cursor} />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="badge badge-cyan">6-Layer Pipeline</span>
          <h2>The Intelligence Engine</h2>
          <p>The ForensicAI pipeline replaces manual filtering with multi-layered discovery.</p>
        </div>

        <div className={styles.featureGrid}>
          {[
            { title: 'Intent Recognition', desc: 'Naive Bayes classifies your natural language query intent instantly.', icon: '🧠', color: 'purple' },
            { title: 'Sector Logic', desc: 'Specialized analysis rules for Narcotics, Fraud, and Espionage.', icon: '🏗️', color: 'cyan' },
            { title: 'Anomaly Scoring', desc: 'Automated suspicion ranking based on communication patterns.', icon: '⚡', color: 'amber' },
            { title: 'Network Discovery', desc: 'Visualize relationship clusters and foreign contact nodes via D3.js.', icon: '🕸️', color: 'green' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <span>© 2026 ForensicAI Intelligence Systems. Restricted to verified personnel.</span>
          <span>Built for High-Speed Digital Investigation</span>
        </div>
      </footer>
    </main>
  );
}
