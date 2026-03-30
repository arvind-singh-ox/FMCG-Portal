'use client'

const ACCENT = '#605dba'

const emissions = [
  { label: 'CO2', value: '0.62', unit: 'T/MT', limit: '0.80', pct: 77.5, status: 'good' },
  { label: 'NOx', value: '480', unit: 'ppm', limit: '500', pct: 96, status: 'warning' },
  { label: 'SO2', value: '28', unit: 'ppm', limit: '50', pct: 56, status: 'good' },
  { label: 'PM', value: '18', unit: 'mg/m3', limit: '30', pct: 60, status: 'good' },
]

const complianceScore = 94

function EnvironmentPanel() {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Environmental Compliance</h3>
          <p style={styles.sub}>Real-time emission monitoring and compliance status</p>
        </div>
        <div style={styles.scoreCircle}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#e8ecf1" strokeWidth="4" />
            <circle cx="30" cy="30" r="26" fill="none" stroke={ACCENT} strokeWidth="4"
              strokeDasharray={`${(complianceScore / 100) * 163.4} 163.4`}
              strokeLinecap="round" transform="rotate(-90 30 30)" />
          </svg>
          <div style={styles.scoreText}>{complianceScore}%</div>
          <div style={styles.scoreLabel}>Compliance</div>
        </div>
      </div>

      <div style={styles.emGrid}>
        {emissions.map((em) => (
          <div key={em.label} style={styles.emCard}>
            <div style={styles.emHeader}>
              <span style={styles.emName}>{em.label}</span>
              <span style={{ ...styles.emStatus, color: em.status === 'warning' ? '#f59e0b' : '#16a34a' }}>
                {em.status === 'warning' ? 'Near Limit' : 'Compliant'}
              </span>
            </div>
            <div style={styles.emValue}>{em.value} <span style={styles.emUnit}>{em.unit}</span></div>
            <div style={styles.emLimit}>Limit: {em.limit} {em.unit}</div>
            <div style={styles.emBar}>
              <div style={{
                ...styles.emFill,
                width: `${em.pct}%`,
                background: em.pct > 90 ? '#ef4444' : em.pct > 75 ? '#f59e0b' : ACCENT,
              }} />
            </div>
            <div style={styles.emPct}>{em.pct}% of limit</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  sub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },
  scoreCircle: { position: 'relative', width: '60px', height: '60px', textAlign: 'center' },
  scoreText: { position: 'absolute', top: '16px', left: 0, right: 0, fontSize: '14px', fontWeight: 800, color: ACCENT },
  scoreLabel: { position: 'absolute', top: '32px', left: 0, right: 0, fontSize: '8px', color: '#94a3b8', fontWeight: 500 },
  emGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  emCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' },
  emHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  emName: { fontSize: '14px', fontWeight: 700, color: '#1e293b' },
  emStatus: { fontSize: '10px', fontWeight: 600 },
  emValue: { fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  emUnit: { fontSize: '12px', fontWeight: 400, color: '#94a3b8' },
  emLimit: { fontSize: '11px', color: '#94a3b8', marginBottom: '8px' },
  emBar: { height: '5px', background: '#e8ecf1', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' },
  emFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  emPct: { fontSize: '10px', color: '#94a3b8' },
}

export default EnvironmentPanel
