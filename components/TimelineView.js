'use client';
import styles from './TimelineView.module.css';

export default function TimelineView({ activeCase }) {
  // Combine all events: calls, messages, locations
  const events = [
    ...activeCase.calls.map(c => ({
      id: c.id,
      timestamp: new Date(c.timestamp),
      type: 'CALL',
      label: `${c.type.toUpperCase()} CALL`,
      detail: `${c.name || c.to} · ${c.duration}s`,
      color: '#4cc9f0'
    })),
    ...activeCase.chats.flatMap(chat => chat.messages.map(m => ({
      id: m.id,
      timestamp: new Date(m.timestamp),
      type: 'MESSAGE',
      label: `${chat.platform.toUpperCase()} MESSAGE`,
      detail: m.text,
      color: '#7209b7'
    }))),
    ...activeCase.locations.map(l => ({
      id: l.id,
      timestamp: new Date(l.timestamp),
      type: 'LOCATION',
      label: 'LOCATION UPDATE',
      detail: l.label,
      color: '#f72585'
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {events.map((ev, idx) => (
          <div key={ev.id} className={styles.eventItem}>
            <div className={styles.timeColumn}>
              <div className={styles.date}>{ev.timestamp.toLocaleDateString()}</div>
              <div className={styles.time}>{ev.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            
            <div className={styles.connection}>
              <div className={styles.dot} style={{ borderColor: ev.color }} />
              {idx < events.length - 1 && <div className={styles.line} />}
            </div>

            <div className={styles.body}>
              <div className={styles.badge} style={{ background: `${ev.color}20`, color: ev.color }}>
                {ev.type}
              </div>
              <div className={styles.label}>{ev.label}</div>
              <div className={styles.detail}>{ev.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
