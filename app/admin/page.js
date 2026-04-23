'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

// We'll mock some admin data for now, but in a real app these would come from Firestore
const MOCK_STATS = {
  totalInvestigators: 12,
  totalCasesProcessed: 148,
  averageRiskScore: 64,
  activeSessions: 3,
  sectorDistribution: {
    narcotics: 45,
    fraud: 32,
    espionage: 23,
    cyber: 48
  }
};

const MOCK_INVESTIGATORS = [
  { id: 'INV-001', email: 'prajwalndevang@gmail.com', role: 'Master Admin', lastActive: 'Now', status: 'Active' },
  { id: 'INV-082', email: 'j.doe@interpol.int', role: 'Senior Agent', lastActive: '2h ago', status: 'Active' },
  { id: 'INV-104', email: 'm.smith@fbi.gov', role: 'Field Analyst', lastActive: '5h ago', status: 'Active' },
  { id: 'INV-209', email: 's.lee@scotlandyard.uk', role: 'Digital Forensic Specialist', lastActive: '1d ago', status: 'Inactive' },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Security Guard
  useEffect(() => {
    if (mounted && !loading) {
      if (!user || user.email.toLowerCase() !== 'prajwalndevang@gmail.com') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user || user.email.toLowerCase() !== 'prajwalndevang@gmail.com') {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
        <span style={{ marginLeft: '12px' }}>Verifying Master Credentials...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.ambientGlow} />
      
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.subtitle}>
            <span className={styles.liveIndicator}></span>
            Master Command Center
          </div>
          <h1>System <span className={styles.accent}>Oversight</span></h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard" className={styles.backBtn}>← Return to Investigation Suite</Link>
          <div className={styles.backBtn} style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}>
            System Secure
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Global Intelligence Metrics */}
        <div className={styles.overviewGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Investigators</div>
            <div className={styles.metricValue}>{MOCK_STATS.totalInvestigators}</div>
            <div className={styles.metricChange}>+2 this month</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Forensic Exports Parsed</div>
            <div className={styles.metricValue}>{MOCK_STATS.totalCasesProcessed}</div>
            <div className={styles.metricChange}>Across 4 sectors</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>System-Wide Avg Anomaly</div>
            <div className={styles.metricValue}>{MOCK_STATS.averageRiskScore}%</div>
            <div className={styles.metricChange}>Critical Threshold: 85%</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>System Latency</div>
            <div className={styles.metricValue}>142ms</div>
            <div className={styles.metricChange}>AI Load: Optimal</div>
          </div>
        </div>

        {/* Administrative Tools */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Administrative Tools</h2>
          </div>
          <div className={styles.toolsGrid}>
            <div className={styles.toolCard}>
              <span className={styles.toolIcon}>👥</span>
              <div className={styles.toolName}>Access Management</div>
              <p className={styles.toolDesc}>Approve pending investigator registrations or revoke credentials.</p>
            </div>
            <div className={styles.toolCard}>
              <span className={styles.toolIcon}>🔋</span>
              <div className={styles.toolName}>System Integrity</div>
              <p className={styles.toolDesc}>Run diagnostics on the intent recognition and NER pipelines.</p>
            </div>
            <div className={styles.toolCard}>
              <span className={styles.toolIcon}>🧹</span>
              <div className={styles.toolName}>Data Sanitization</div>
              <p className={styles.toolDesc}>Securely purge aged forensic evidence from the Firestore vault.</p>
            </div>
            <div className={styles.toolCard}>
              <span className={styles.toolIcon}>📢</span>
              <div className={styles.toolName}>Broadcast Alert</div>
              <p className={styles.toolDesc}>Send a high-priority system message to all online investigators.</p>
            </div>
          </div>
        </section>

        {/* Investigator Overview */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Authorized Investigators</h2>
            <Link href="/auth/signup" className={styles.actionBtn}>+ Register New Agent</Link>
          </div>
          <div className={styles.investigatorList}>
            <div className={`${styles.investigatorRow} ${styles.rowHeader}`}>
              <div>Investigator / ID</div>
              <div>Role</div>
              <div>Last Activity</div>
              <div style={{ textAlign: 'right' }}>Status / Action</div>
            </div>
            {MOCK_INVESTIGATORS.map((inv) => (
              <div key={inv.id} className={styles.investigatorRow}>
                <div className={styles.investigatorInfo}>
                  <div className={styles.investigatorId}>{inv.id}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{inv.email}</div>
                </div>
                <div>{inv.role}</div>
                <div>{inv.lastActive}</div>
                <div className={styles.rowActions}>
                  <span className={`${styles.statusBadge} ${inv.status === 'Active' ? styles.statusActive : ''}`}>
                    {inv.status}
                  </span>
                  <button className={styles.actionBtn} style={{ marginLeft: '16px' }}>Manage</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        FORENSIC AI COMMAND INTERFACE · VERSION 1.2.0 · INTERNAL ACCESS ONLY
      </footer>
    </div>
  );
}
