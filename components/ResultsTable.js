'use client';
import styles from './ResultsTable.module.css';

export default function ResultsTable({ results, type }) {
  if (!results || results.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <p>No extraction matches found for this query.</p>
      </div>
    );
  }

  if (type === 'find_calls') {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Direction</th>
              <th>Duration</th>
              <th>Timestamp</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td>
                  <div className={styles.entityName}>{r.name || 'Unknown'}</div>
                  <div className={styles.entitySub}>{r.from === '+393123456789' ? r.to : r.from}</div>
                </td>
                <td>
                  <span className={`${styles.badge} ${r.type === 'outgoing' ? styles.blue : styles.green}`}>
                    {r.type}
                  </span>
                </td>
                <td className={styles.mono}>{r.duration}s</td>
                <td className={styles.mono}>{new Date(r.timestamp).toLocaleString()}</td>
                <td>
                  {r.duration < 5 && <span className={styles.flag}>Flash Call</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'find_chats' || type === 'keyword_search') {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>From</th>
              <th>Platform</th>
              <th>Evidence Phrase</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td className={styles.entityName}>{r.platform} Node</td>
                <td><span className={styles.badge}>{r.platform}</span></td>
                <td className={styles.evidenceText}>"{r.text}"</td>
                <td className={styles.mono}>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.genericResults}>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
