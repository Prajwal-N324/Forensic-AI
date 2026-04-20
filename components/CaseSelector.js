'use client';
import { useState } from 'react';
import styles from './CaseSelector.module.css';
import { CASE_SECTORS } from '@/lib/forensics/CaseFactory';

export default function CaseSelector({ history, onSelect, onUpload }) {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedSector, setSelectedSector] = useState('NARCOTICS');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Investigator <span className={styles.accent}>Vault</span></h1>
        <p className={styles.subtitle}>Select an existing forensic case or analyze a new UFDR export.</p>
      </div>

      <div className={styles.grid}>
        {/* Upload New Case */}
        <div 
          className={`${styles.card} ${styles.uploadCard}`}
          onClick={() => setShowUpload(true)}
        >
          <div className={styles.icon}>📁</div>
          <h3 className={styles.cardTitle}>Analyze New UFDR</h3>
          <p className={styles.cardDesc}>Upload an investigation extract to begin AI-powered correlation.</p>
        </div>

        {/* Existing Cases */}
        {history.map((item) => (
          <div 
            key={item.id} 
            className={styles.card}
            onClick={() => onSelect(item)}
          >
            <div className={styles.statusBadge}>{item.sector}</div>
            <div className={styles.icon}>🔬</div>
            <h3 className={styles.cardTitle}>{item.metadata.name}</h3>
            <p className={styles.cardDesc}>Suspect: {item.metadata.suspect}</p>
            <div className={styles.cardFooter}>
              <span>{new Date(item.analyzedAt?.seconds * 1000).toLocaleDateString()}</span>
              <span>{item.metadata.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload/Sector Selection Modal */}
      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => setShowUpload(false)}>✕</button>
            <h2 className={styles.modalTitle}>Forensic Sector Initialization</h2>
            <p className={styles.modalDesc}>Select the primary investigation sector to optimize AI extraction rules.</p>
            
            <div className={styles.sectorList}>
              {CASE_SECTORS.map(sector => (
                <button 
                  key={sector}
                  className={`${styles.sectorBtn} ${selectedSector === sector ? styles.activeSector : ''}`}
                  onClick={() => setSelectedSector(sector)}
                >
                  {sector}
                </button>
              ))}
            </div>

            <div className={styles.dropZone}>
              <div className={styles.dropIcon}>☁️</div>
              <p>Drag and drop UFDR file here</p>
              <span className={styles.dropNote}>Supported: .ufdr, .zip, .xml (Max 250MB)</span>
            </div>

            <button 
              className={styles.primaryBtn}
              onClick={() => onUpload(selectedSector)}
            >
              Start AI Analysis →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
