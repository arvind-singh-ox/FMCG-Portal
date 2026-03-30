'use client'

const alerts = [
  { severity: 'critical', title: 'Roller #3 vibration exceeding trend', asset: 'Kiln Support Roller', time: '3 min ago', ack: false },
  { severity: 'warning', title: 'NOx levels at 96% of compliance limit', asset: 'Stack Emissions', time: '18 min ago', ack: false },
  { severity: 'warning', title: 'Clinker cooler fan #2 running hot', asset: 'Clinker Cooler', time: '42 min ago', ack: true },
  { severity: 'info', title: 'Raw mill separator speed optimized by AI', asset: 'Raw Mill', time: '1 hr ago', ack: true },
  { severity: 'info', title: 'Fuel blend ratio adjusted automatically', asset: 'Fuel System', time: '2 hr ago', ack: true },
]

const sevStyles = {
  critical: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
  warning: { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' },
  info: { bg: '#f0f9ff', color: '#3b82f6', border: '#bfdbfe' },
}

function AlertsPanel() {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Active Alerts & Notifications</h3>
        <span style={styles.count}>{alerts.filter(a => !a.ack).length} unacknowledged</span>
      </div>
      <div style={styles.list}>
        {alerts.map((a, i) => {
          const sv = sevStyles[a.severity]
          return (
            <div key={i} style={{ ...styles.alertItem, background: sv.bg, borderLeft: `3px solid ${sv.color}` }}>
              <div style={styles.alertMain}>
                <div style={{ ...styles.sevTag, background: sv.color }}>{a.severity.toUpperCase()}</div>
                <div style={styles.alertContent}>
                  <div style={styles.alertTitle}>{a.title}</div>
                  <div style={styles.alertMeta}>{a.asset} — {a.time}</div>
                </div>
              </div>
              <div style={styles.alertActions}>
                {!a.ack && <button style={styles.ackBtn}>Acknowledge</button>}
                {a.ack && <span style={styles.ackDone}>Acknowledged</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  count: { fontSize: '12px', fontWeight: 600, color: '#ef4444' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  alertItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px' },
  alertMain: { display: 'flex', alignItems: 'center', gap: '10px' },
  sevTag: { color: '#fff', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  alertContent: {},
  alertTitle: { fontSize: '13px', fontWeight: 500, color: '#1e293b' },
  alertMeta: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  alertActions: {},
  ackBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', color: '#475569', fontWeight: 500 },
  ackDone: { fontSize: '11px', color: '#16a34a', fontWeight: 500 },
}

export default AlertsPanel
