'use client'

import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

// ─── Animated Counter ───
function AnimatedValue({ value }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    const duration = 1600, startTime = performance.now()
    let raf
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(numVal * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [numVal])
  return numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(numVal < 1 ? 2 : 1)
}

// ─── Mini Sparkline ───
function Sparkline({ data, color, height = 28 }) {
  const ref = useRef(null)
  const [w, setW] = useState(100)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height}>
        <defs><linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#sp-${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="stroke-dasharray" from={`0 ${w * 2}`} to={`${w * 2} 0`} dur="1.5s" fill="freeze" />
        </polyline>
        <circle cx={w} cy={parseFloat(pts.split(' ').pop().split(',')[1])} r="3" fill={color}>
          <animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" />
        </circle>
      </svg>
    </div>
  )
}

const allKPIs = [
  { id: 'production', label: 'Daily Production', value: '4,520', unit: 'MT', change: '+3.2%', up: true, color: '#3b82f6', spark: [4280, 4350, 4410, 4380, 4450, 4490, 4520] },
  { id: 'kiln-uptime', label: 'Kiln Uptime', value: '96.5', unit: '%', change: '+1.1%', up: true, color: '#10b981', spark: [94.2, 94.8, 95.1, 95.5, 95.8, 96.2, 96.5] },
  { id: 'energy', label: 'Energy Consumption', value: '78.2', unit: 'kWh/MT', change: '-2.4%', up: false, color: '#f59e0b', spark: [82.1, 81.2, 80.5, 79.8, 79.2, 78.6, 78.2] },
  { id: 'quality', label: 'Quality Score', value: '98.1', unit: '%', change: '+0.5%', up: true, color: '#8b5cf6', spark: [97.2, 97.4, 97.6, 97.8, 97.9, 98.0, 98.1] },
  { id: 'oee', label: 'OEE', value: '87.3', unit: '%', change: '+2.1%', up: true, color: '#06b6d4', spark: [84.5, 85.2, 85.8, 86.1, 86.5, 87.0, 87.3] },
  { id: 'mtbf', label: 'MTBF', value: '142', unit: 'hrs', change: '+8.5%', up: true, color: '#10b981', spark: [118, 122, 128, 132, 135, 138, 142] },
  { id: 'safety', label: 'Safety Score', value: '99.2', unit: '%', change: '+0.1%', up: true, color: '#16a34a', spark: [98.8, 98.9, 99.0, 99.0, 99.1, 99.1, 99.2] },
  { id: 'emissions', label: 'CO2 Emissions', value: '0.62', unit: 'T/MT', change: '-4.1%', up: false, color: '#64748b', spark: [0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62] },
]

function KPISection() {
  const [selectedKPIs, setSelectedKPIs] = useState(['production', 'kiln-uptime', 'energy', 'quality', 'oee', 'mtbf', 'safety', 'emissions'])
  const [showCustomize, setShowCustomize] = useState(false)

  const toggleKPI = (id) => {
    setSelectedKPIs((prev) => prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id])
  }

  const activeKPIs = allKPIs.filter((k) => selectedKPIs.includes(k.id))

  return (
    <div style={styles.section}>
      <style>{`
        @keyframes kpiFadeIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes countPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.02); } }
        .kpi-card { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); cursor: default; }
        .kpi-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 30px rgba(96,93,186,0.12); border-color: #605dba30; }
        .kpi-card:hover .kpi-value { color: #605dba !important; }
      `}</style>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Key Performance Indicators</h3>
          <p style={styles.subtitle}>Real-time overview of your operational metrics</p>
        </div>
        <button style={styles.customizeBtn} onClick={() => setShowCustomize(!showCustomize)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Customize KPIs
        </button>
      </div>
      {showCustomize && (
        <div style={styles.customizePanel}>
          {allKPIs.map((kpi) => (
            <label key={kpi.id} style={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedKPIs.includes(kpi.id)} onChange={() => toggleKPI(kpi.id)} />
              {kpi.label}
            </label>
          ))}
        </div>
      )}
      <div style={styles.grid}>
        {activeKPIs.map((kpi, i) => (
          <div key={kpi.id} className="kpi-card" style={{ ...styles.card, animation: `kpiFadeIn 0.5s ease both`, animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${kpi.color}` }}>
            <div style={styles.cardLabel}>{kpi.label}</div>
            <div className="kpi-value" style={styles.cardValue}>
              <AnimatedValue value={kpi.value} /> <span style={styles.cardUnit}>{kpi.unit}</span>
            </div>
            <Sparkline data={kpi.spark} color={kpi.color} />
            <div style={{ ...styles.cardChange, marginTop: '8px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={kpi.up ? '#16a34a' : '#ef4444'} stroke="none">
                {kpi.up ? <polygon points="12,2 22,18 2,18" /> : <polygon points="12,22 22,6 2,6" />}
              </svg>
              <span style={{ color: kpi.up ? '#16a34a' : '#ef4444' }}>{kpi.change}</span>
              <span style={{ fontSize: '10px', color: '#cbd5e1', marginLeft: 'auto' }}>7d trend</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  section: { marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  title: { margin: 0, fontSize: '18px', color: '#1e293b' },
  subtitle: { margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' },
  customizeBtn: { display: 'flex', alignItems: 'center', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  customizePanel: { display: 'flex', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4a5568', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px', position: 'relative', overflow: 'hidden' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' },
  cardValue: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', transition: 'color 0.2s' },
  cardUnit: { fontSize: '13px', fontWeight: 400, color: '#94a3b8' },
  cardChange: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 },
}

export default KPISection
