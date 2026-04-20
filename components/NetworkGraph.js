'use client';
import { useEffect, useRef } from 'react';
import styles from './NetworkGraph.module.css';

export default function NetworkGraph({ activeCase }) {
  const suspectName = activeCase.metadata.suspect;
  const contacts = activeCase.contacts;

  // Simple circle layout for demo purposes (can expand to D3 force later)
  const cx = 350;
  const cy = 250;
  const radius = 180;

  return (
    <div className={styles.wrapper}>
      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={styles.suspectDot} /> Suspect</div>
        <div className={styles.legendItem}><span className={styles.contactDot} /> Associate</div>
        <div className={styles.legendItem}><span className={styles.foreignDot} /> Foreign Node</div>
      </div>

      <svg viewBox="0 0 700 500" className={styles.svg}>
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Links */}
        {contacts.map((contact, i) => {
          const angle = (i / contacts.length) * 2 * Math.PI;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const weight = Math.min(5, 1 + contact.callCount / 20);
          
          return (
            <line 
              key={`link-${i}`}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke="rgba(76, 201, 240, 0.2)"
              strokeWidth={weight}
              className={styles.link}
            />
          );
        })}

        {/* Association Nodes */}
        {contacts.map((contact, i) => {
          const angle = (i / contacts.length) * 2 * Math.PI;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const isForeign = contact.numbers[0].startsWith('+') && !contact.numbers[0].startsWith('+1') && !contact.numbers[0].startsWith('+91');

          return (
            <g key={`node-${i}`} className={styles.nodeGroup}>
              <circle 
                cx={x} cy={y} r={18} 
                className={`${styles.node} ${isForeign ? styles.foreignNode : styles.contactNode}`} 
              />
              <text x={x} y={y + 35} textAnchor="middle" className={styles.nodeLabel}>
                {contact.name.split(' ')[0]}
              </text>
              <text x={x} y={y + 48} textAnchor="middle" className={styles.nodeSub}>
                {contact.callCount} calls
              </text>
            </g>
          );
        })}

        {/* Primary Suspect Node */}
        <g className={styles.suspectGroup}>
          <circle cx={cx} cy={cy} r={35} className={styles.suspectNode} />
          <circle cx={cx} cy={cy} r={45} className={styles.suspectPulse} />
          <text x={cx} y={cy + 5} textAnchor="middle" className={styles.suspectIcon}>🎯</text>
          <text x={cx} y={cy + 75} textAnchor="middle" className={styles.suspectLabel}>{suspectName}</text>
          <text x={cx} y={cy + 90} textAnchor="middle" className={styles.suspectSub}>PRIMARY SUBJECT</text>
        </g>
      </svg>
    </div>
  );
}
