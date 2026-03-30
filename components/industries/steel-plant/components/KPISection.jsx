'use client'

import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

const allKPIs = [
  { id: 'crude-steel', label: 'Crude Steel Output', value: 6280, unit: 'MT', change: '+2.8%', up: true, target: 6000, sparkData: [58, 62, 59, 64, 61, 63, 62] },
  { id: 'furnace-uptime', label: 'Blast Furnace Uptime', value: 94.7, unit: '%', change: '+0.9%', up: true, target: 92, sparkData: [91, 93, 92, 95, 94, 93, 95] },
  { id: 'energy', label: 'Energy Consumption', value: 520, unit: 'kWh/MT', change: '-1.8%', up: false, target: 540, sparkData: [545, 538, 530, 528, 525, 522, 520] },
  { id: 'yield', label: 'Yield Rate', value: 96.3, unit: '%', change: '+0.4%', up: true, target: 95, sparkData: [94, 95, 96, 95, 96, 97, 96] },
  { id: 'oee', label: 'OEE', value: 85.1, unit: '%', change: '+1.7%', up: true, target: 82, sparkData: [80, 82, 83, 84, 83, 85, 85] },
  { id: 'mtbf', label: 'MTBF', value: 168, unit: 'hrs', change: '+5.2%', up: true, target: 150, sparkData: [145, 150, 155, 160, 158, 165, 168] },
  { id: 'safety', label: 'Safety Score', value: 98.8, unit: '%', change: '+0.3%', up: true, target: 97, sparkData: [97, 98, 97, 98, 99, 98, 99] },
  { id: 'emissions', label: 'CO₂ Emissions', value: 1.85, unit: 'T/MT', change: '-3.6%', up: false, target: 2.0, sparkData: [2.1, 2.0, 1.95, 1.92, 1.9, 1.88, 1.85] },
]

function AnimatedCounter({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}</>
}

function Sparkline({ data, color }) {
  const w = 80
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#sp-${color.replace('#', '')})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KPISection() {
  const [selectedKPIs, setSelectedKPIs] = useState(['crude-steel', 'furnace-uptime', 'energy', 'yield', 'oee', 'mtbf', 'safety', 'emissions'])
  const [showCustomize, setShowCustomize] = useState(false)

  const toggleKPI = (id) => {
    setSelectedKPIs((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }

  const activeKPIs = allKPIs.filter((k) => selectedKPIs.includes(k.id))

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Key Performance Indicators</h3>
          <p style={styles.subtitle}>Real-time overview of steel plant operational metrics</p>
        </div>
        <button style={styles.customizeBtn} onClick={() => setShowCustomize(!showCustomize)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Customize KPIs
        </button>
      </div>

      {showCustomize && (
        <div style={styles.customizePanel}>
          {allKPIs.map((kpi) => (
            <label key={kpi.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedKPIs.includes(kpi.id)}
                onChange={() => toggleKPI(kpi.id)}
              />
              {kpi.label}
            </label>
          ))}
        </div>
      )}

      {activeKPIs.length === 0 ? (
        <div style={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>No KPIs Selected</div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>Use the Customize KPIs button to select metrics.</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {activeKPIs.map((kpi, i) => (
            <div key={kpi.id} style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}>
              <div style={styles.cardTop}>
                <div style={styles.cardLabel}>{kpi.label}</div>
                <Sparkline data={kpi.sparkData} color={kpi.up ? (kpi.id === 'emissions' ? '#10b981' : ACCENT) : (kpi.id === 'energy' ? '#10b981' : '#ef4444')} />
              </div>
              <div style={styles.cardValue}>
                <AnimatedCounter value={kpi.value} decimals={kpi.value % 1 !== 0 ? 1 : 0} />
                <span style={styles.cardUnit}> {kpi.unit}</span>
              </div>
              <div style={styles.cardBottom}>
                <div style={styles.cardChange}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={(kpi.id === 'energy' || kpi.id === 'emissions') ? '#10b981' : (kpi.up ? '#10b981' : '#ef4444')} stroke="none">
                    {kpi.up
                      ? <polygon points="12,2 22,18 2,18" />
                      : <polygon points="12,22 22,6 2,6" />
                    }
                  </svg>
                  <span style={{ color: (kpi.id === 'energy' || kpi.id === 'emissions') ? '#10b981' : (kpi.up ? '#10b981' : '#ef4444'), fontSize: '11px', fontWeight: 600 }}>{kpi.change}</span>
                </div>
                <span style={styles.cardTarget}>Target: {kpi.target}{kpi.unit === '%' || kpi.unit === 'T/MT' ? kpi.unit : ` ${kpi.unit}`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  section: { marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  title: { margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: 700 },
  subtitle: { margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' },
  customizeBtn: { display: 'flex', alignItems: 'center', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  customizePanel: { display: 'flex', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4a5568', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8ecf1' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px', transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)', animation: 'fadeUpIn 0.5s ease both' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500 },
  cardValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' },
  cardUnit: { fontSize: '13px', fontWeight: 400, color: '#94a3b8' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardChange: { display: 'flex', alignItems: 'center', gap: '3px' },
  cardTarget: { fontSize: '10px', color: '#94a3b8' },
}

export default KPISection
