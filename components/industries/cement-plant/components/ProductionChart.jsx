'use client'

const ACCENT = '#605dba'

const dailyData = [
  { day: 'Mon', value: 4120, target: 4500 },
  { day: 'Tue', value: 4380, target: 4500 },
  { day: 'Wed', value: 4510, target: 4500 },
  { day: 'Thu', value: 4290, target: 4500 },
  { day: 'Fri', value: 4650, target: 4500 },
  { day: 'Sat', value: 4520, target: 4500 },
  { day: 'Sun', value: 4410, target: 4500 },
]

const maxVal = 5000

function ProductionChart() {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Weekly Production Output</h3>
          <p style={styles.sub}>Clinker production vs daily target (MT)</p>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: ACCENT }} /> Actual</span>
          <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#e8ecf1' }} /> Target</span>
        </div>
      </div>
      <div style={styles.chartArea}>
        {dailyData.map((d) => (
          <div key={d.day} style={styles.barGroup}>
            <div style={styles.barContainer}>
              <div style={{ ...styles.barTarget, height: `${(d.target / maxVal) * 100}%` }} />
              <div style={{
                ...styles.barActual,
                height: `${(d.value / maxVal) * 100}%`,
                background: d.value >= d.target ? ACCENT : '#f59e0b',
              }} />
            </div>
            <div style={styles.barLabel}>{d.day}</div>
            <div style={styles.barValue}>{(d.value / 1000).toFixed(1)}k</div>
          </div>
        ))}
      </div>
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Weekly Total</span>
          <span style={styles.summaryValue}>30,880 MT</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Avg Daily</span>
          <span style={styles.summaryValue}>4,411 MT</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Target Achievement</span>
          <span style={{ ...styles.summaryValue, color: '#16a34a' }}>98.0%</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  sub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },
  legend: { display: 'flex', gap: '14px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' },
  legendDot: { width: '8px', height: '8px', borderRadius: '2px', display: 'inline-block' },
  chartArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '8px', padding: '0 4px', marginBottom: '16px' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' },
  barContainer: { position: 'relative', width: '100%', height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  barTarget: { position: 'absolute', bottom: 0, width: '70%', background: '#f1f5f9', borderRadius: '4px 4px 0 0' },
  barActual: { position: 'relative', width: '50%', borderRadius: '4px 4px 0 0', zIndex: 1, transition: 'height 0.3s ease' },
  barLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: 500 },
  barValue: { fontSize: '10px', color: '#64748b', fontWeight: 600 },
  summary: { display: 'flex', gap: '24px', padding: '14px 0 0', borderTop: '1px solid #f1f5f9' },
  summaryItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  summaryLabel: { fontSize: '11px', color: '#94a3b8' },
  summaryValue: { fontSize: '15px', fontWeight: 700, color: '#1e293b' },
}

export default ProductionChart
