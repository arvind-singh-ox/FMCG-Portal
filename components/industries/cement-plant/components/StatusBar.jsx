'use client'

import { useState, useEffect } from 'react'

function StatusBar() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <div style={styles.label}>Last Updated</div>
        <div style={styles.value}>{timeStr}</div>
      </div>
      <div style={styles.item}>
        <div style={styles.label}>Data Freshness</div>
        <div style={{ ...styles.value, color: '#605dba' }}>Real-time</div>
      </div>
      <div style={styles.item}>
        <div style={styles.label}>System Status</div>
        <div style={styles.value}>Operational</div>
      </div>
      <div style={styles.item}>
        <div style={styles.label}>Coverage</div>
        <div style={styles.value}>Organization-wide</div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: '#f8fafc',
    border: '1px solid #e8ecf1',
    borderRadius: '10px',
    padding: '16px 24px',
    marginBottom: '20px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  value: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
}

export default StatusBar
