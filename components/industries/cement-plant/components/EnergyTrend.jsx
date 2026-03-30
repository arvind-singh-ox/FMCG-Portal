'use client'

const ACCENT = '#605dba'

const hourlyData = [
  { time: '00:00', value: 76.2 }, { time: '02:00', value: 75.8 }, { time: '04:00', value: 74.1 },
  { time: '06:00', value: 77.5 }, { time: '08:00', value: 80.3 }, { time: '10:00', value: 82.1 },
  { time: '12:00', value: 79.4 }, { time: '14:00', value: 78.9 }, { time: '16:00', value: 77.2 },
  { time: '18:00', value: 76.8 }, { time: '20:00', value: 75.5 }, { time: '22:00', value: 74.9 },
]

const minV = 72
const maxV = 84
const range = maxV - minV

function EnergyTrend() {
  const points = hourlyData.map((d, i) => {
    const x = (i / (hourlyData.length - 1)) * 100
    const y = 100 - ((d.value - minV) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,100 ${points} 100,100`

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Energy Consumption Trend</h3>
          <p style={styles.sub}>24-hour energy usage pattern (kWh/MT)</p>
        </div>
        <div style={styles.badges}>
          <span style={styles.badgeGood}>Below Target</span>
          <span style={styles.currentVal}>Current: 74.9 kWh/MT</span>
        </div>
      </div>

      <div style={styles.chartWrap}>
        <div style={styles.yAxis}>
          <span>84</span><span>80</span><span>76</span><span>72</span>
        </div>
        <div style={styles.chartBody}>
          <div style={styles.gridLine} />
          <div style={{ ...styles.gridLine, top: '33%' }} />
          <div style={{ ...styles.gridLine, top: '66%' }} />
          <div style={{ ...styles.targetLine, top: `${100 - ((78 - minV) / range) * 100}%` }}>
            <span style={styles.targetLabel}>Target: 78 kWh/MT</span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
            <polygon points={areaPoints} fill={ACCENT} fillOpacity="0.08" />
            <polyline points={points} fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round" />
            {hourlyData.map((d, i) => {
              const x = (i / (hourlyData.length - 1)) * 100
              const y = 100 - ((d.value - minV) / range) * 100
              return <circle key={i} cx={x} cy={y} r="1.5" fill={d.value > 78 ? '#ef4444' : ACCENT} />
            })}
          </svg>
        </div>
      </div>

      <div style={styles.xAxis}>
        {hourlyData.filter((_, i) => i % 2 === 0).map((d) => (
          <span key={d.time} style={styles.xLabel}>{d.time}</span>
        ))}
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}><span style={styles.statLabel}>Peak</span><span style={styles.statVal}>82.1 kWh/MT at 10:00</span></div>
        <div style={styles.stat}><span style={styles.statLabel}>Low</span><span style={styles.statVal}>74.1 kWh/MT at 04:00</span></div>
        <div style={styles.stat}><span style={styles.statLabel}>Average</span><span style={styles.statVal}>77.4 kWh/MT</span></div>
        <div style={styles.stat}><span style={styles.statLabel}>Savings</span><span style={{ ...styles.statVal, color: '#16a34a' }}>-2.4% vs yesterday</span></div>
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  sub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },
  badges: { display: 'flex', alignItems: 'center', gap: '8px' },
  badgeGood: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 },
  currentVal: { fontSize: '13px', fontWeight: 700, color: ACCENT },
  chartWrap: { display: 'flex', height: '160px', gap: '8px', marginBottom: '4px' },
  yAxis: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', width: '28px', textAlign: 'right', padding: '2px 0' },
  chartBody: { flex: 1, position: 'relative', borderBottom: '1px solid #e8ecf1', borderLeft: '1px solid #e8ecf1' },
  gridLine: { position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' },
  targetLine: { position: 'absolute', left: 0, right: 0, borderTop: `1.5px dashed #ef4444`, pointerEvents: 'none' },
  targetLabel: { position: 'absolute', right: 0, top: '-14px', fontSize: '9px', color: '#ef4444', fontWeight: 600, background: '#fff', padding: '0 4px' },
  svg: { width: '100%', height: '100%', display: 'block' },
  xAxis: { display: 'flex', justifyContent: 'space-between', paddingLeft: '36px', marginBottom: '14px' },
  xLabel: { fontSize: '10px', color: '#94a3b8' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '14px 0 0', borderTop: '1px solid #f1f5f9' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statLabel: { fontSize: '11px', color: '#94a3b8' },
  statVal: { fontSize: '12px', fontWeight: 600, color: '#1e293b' },
}

export default EnergyTrend
