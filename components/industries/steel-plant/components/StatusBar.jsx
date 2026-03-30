'use client'

const ACCENT = '#605dba'

function StatusBar() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const items = [
    { label: 'Last Updated', value: timeStr },
    { label: 'Data Freshness', value: 'Real-time', color: '#16a34a' },
    { label: 'Furnace Status', value: 'Running', color: '#16a34a' },
    { label: 'System Status', value: 'Operational', color: '#16a34a' },
    { label: 'Active Sensors', value: '248 / 256', color: ACCENT },
    { label: 'Coverage', value: 'Organization-wide' },
  ]

  return (
    <div style={styles.container}>
      {items.map((item, i) => (
        <div key={i} style={styles.item}>
          <div style={styles.label}>{item.label}</div>
          <div style={{ ...styles.value, ...(item.color ? { color: item.color } : {}) }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
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
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  value: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
}

export default StatusBar
