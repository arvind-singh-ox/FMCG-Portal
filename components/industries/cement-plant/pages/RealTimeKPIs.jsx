'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

// ─── Scroll Reveal Hook ───
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ─── Animated Counter ───
function AnimatedValue({ value, suffix = '', prefix = '', active = true }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1400
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (numVal - start) * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  const formatted = numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(1)
  return <>{prefix}{formatted}{suffix}</>
}

// ─── Mini Area Chart (responsive) ───
function AreaChart({ data, color, height = 50 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(200)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setCWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.1
  const min = Math.min(...data) * 0.9
  const range = max - min || 1
  const w = cWidth
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gradId = `ag-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gradId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Donut Chart ───
function DonutChart({ value, max, size = 80, strokeWidth = 8, color, active = true }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1600
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimPct(start + (pct - start) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [pct])
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || ACCENT} strokeWidth={strokeWidth}
        strokeDasharray={`${(animPct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.3s' }} />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">of target</text>
    </svg>
  )
}

// ─── Radar Chart ───
function RadarChart({ data, size = 180, active = true }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => {
    if (!active) return
    const duration = 1400
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setAnimScale(1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [data])
  const cx = size / 2, cy = size / 2, r = size / 2 - 24
  const n = data.length
  const angle = (2 * Math.PI) / n
  const getPoint = (i, val) => {
    const a = angle * i - Math.PI / 2
    const dist = (val / 100) * r * animScale
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }
  }
  const gridLevels = [25, 50, 75, 100]
  return (
    <svg width={size} height={size}>
      {gridLevels.map((lv) => (
        <polygon key={lv}
          points={Array.from({ length: n }, (_, i) => { const a = angle * i - Math.PI / 2; const d = (lv / 100) * r; return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}` }).join(' ')}
          fill="none" stroke="#e8ecf1" strokeWidth="0.5" />
      ))}
      {data.map((_, i) => {
        const a = angle * i - Math.PI / 2
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" />
      })}
      <polygon
        points={data.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}` }).join(' ')}
        fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />
      {data.map((d, i) => {
        const p = getPoint(i, d.value)
        const lp = { x: cx + (r + 16) * Math.cos(angle * i - Math.PI / 2), y: cy + (r + 16) * Math.sin(angle * i - Math.PI / 2) }
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={ACCENT} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Horizontal Bar ───
function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 150 + delay)
    return () => clearTimeout(t)
  }, [value, max, delay])
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>
    </div>
  )
}

// ─── Heatmap Cell (temperature gradient: blue → green → amber → orange → red) ───
function HeatCell({ value, max, label, unit }) {
  const ratio = value / max
  // Temperature gradient: cool=blue, warm=green, hot=orange, very hot=deep red
  let bg, color
  if (ratio >= 0.9) { bg = '#dc262620'; color = '#dc2626' }
  else if (ratio >= 0.75) { bg = '#ea580c20'; color = '#ea580c' }
  else if (ratio >= 0.6) { bg = '#f59e0b18'; color = '#d97706' }
  else if (ratio >= 0.4) { bg = '#16a34a15'; color = '#16a34a' }
  else { bg = `${ACCENT}15`; color = ACCENT }
  return (
    <div style={{
      background: bg, borderRadius: '10px', padding: '14px 12px', textAlign: 'center',
      border: `1px solid ${color}25`, position: 'relative', overflow: 'hidden'
    }}>
      {/* Subtle temperature bar at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: `${ratio * 100}%`, height: '3px',
        background: `linear-gradient(90deg, ${ACCENT}, ${color})`, borderRadius: '0 3px 0 0',
        transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)'
      }} />
      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>{unit}</div>
    </div>
  )
}

// ─── DATA ───
const productionData = [
  { label: 'Clinker Output', value: 187.5, unit: 'TPH', target: 190, trend: [178, 182, 180, 185, 183, 188, 187.5], ai: 'LSTM model: stable output next 4hrs' },
  { label: 'Cement Grinding', value: 142.3, unit: 'TPH', target: 145, trend: [135, 138, 140, 137, 141, 143, 142.3], ai: 'Particle size NN: grinding optimized' },
  { label: 'Raw Mill Throughput', value: 298, unit: 'TPH', target: 310, trend: [308, 305, 302, 300, 296, 299, 298], ai: 'Classifier speed adjustment needed', warning: true },
  { label: 'Kiln Feed Rate', value: 245, unit: 'TPH', target: 250, trend: [240, 242, 246, 244, 243, 245, 245], ai: 'AI dosing controller active' },
]

const kilnZones = [
  { zone: 'Preheater Exit', temp: 328, max: 400 },
  { zone: 'Calciner', temp: 870, max: 1000 },
  { zone: 'Kiln Inlet', temp: 1050, max: 1200 },
  { zone: 'Transition', temp: 1280, max: 1500 },
  { zone: 'Burning Zone', temp: 1452, max: 1600 },
  { zone: 'Kiln Shell', temp: 285, max: 350 },
  { zone: 'Secondary Air', temp: 1085, max: 1200 },
  { zone: 'Clinker Cooler', temp: 120, max: 200 },
]

const kilnParams = [
  { label: 'Speed', value: '3.8', unit: 'RPM', range: '3.5-4.2' },
  { label: 'Torque', value: '72', unit: '%', range: '60-80' },
  { label: 'Feed Rate', value: '245', unit: 'TPH', range: '230-260' },
  { label: 'Draft', value: '-2.4', unit: 'mbar', range: '-3.0 to -1.5' },
  { label: 'Free Lime', value: '1.18', unit: '%', range: '<1.5' },
  { label: 'NOx Level', value: '480', unit: 'ppm', range: '<500' },
]

const energyData = [
  { label: 'Specific Heat', value: 725, unit: 'kcal/kg', max: 800 },
  { label: 'Electrical Energy', value: 78.2, unit: 'kWh/MT', max: 100 },
  { label: 'Thermal Load', value: 3.82, unit: 'Gcal/hr', max: 4.5 },
  { label: 'Power Factor', value: 0.94, unit: '', max: 1.0 },
  { label: 'WHR Output', value: 4.2, unit: 'MW', max: 5.0 },
  { label: 'Coal Mill', value: 28.5, unit: 'TPH', max: 35 },
]

const energyTrend = [76.2, 75.8, 74.1, 77.5, 80.3, 82.1, 79.4, 78.9, 77.2, 76.8, 75.5, 74.9]

const qualityRadar = [
  { label: 'Free Lime', value: 82 },
  { label: 'Fineness', value: 91 },
  { label: 'Strength', value: 95 },
  { label: 'LSF', value: 88 },
  { label: 'SM', value: 93 },
  { label: 'AM', value: 86 },
]

const qualityParams = [
  { label: 'Free Lime (f-CaO)', value: '1.18%', status: 'good', range: '<1.5%' },
  { label: 'Blaine Fineness', value: '3,280 cm²/g', status: 'good', range: '3000-3500' },
  { label: '28-Day Strength', value: '52.4 MPa', status: 'good', range: '>49 MPa' },
  { label: 'LSF', value: '95.2%', status: 'good', range: '93-97%' },
  { label: 'Silica Modulus', value: '2.42', status: 'good', range: '2.2-2.6' },
  { label: 'Alumina Modulus', value: '1.38', status: 'good', range: '1.2-1.6' },
  { label: 'C3S Content', value: '62.1%', status: 'good', range: '55-70%' },
  { label: 'Residue 45μ', value: '4.8%', status: 'good', range: '<6%' },
]

const envData = [
  { label: 'CO2', value: 0.62, limit: 0.80, unit: 'T/MT' },
  { label: 'NOx', value: 480, limit: 500, unit: 'mg/Nm³' },
  { label: 'SO2', value: 28, limit: 50, unit: 'mg/Nm³' },
  { label: 'PM', value: 18, limit: 30, unit: 'mg/Nm³' },
  { label: 'Opacity', value: 8, limit: 20, unit: '%' },
  { label: 'Water', value: 0.25, limit: 0.35, unit: 'm³/MT' },
]

const equipData = [
  { asset: 'Kiln Main Drive', vib: 3.8, temp: 68, health: 92 },
  { asset: 'Support Roller #1', vib: 2.1, temp: 62, health: 96 },
  { asset: 'Support Roller #3', vib: 4.2, temp: 74, health: 72 },
  { asset: 'Raw Mill Motor', vib: 2.8, temp: 58, health: 94 },
  { asset: 'Cement Mill #1', vib: 3.1, temp: 65, health: 89 },
  { asset: 'ID Fan', vib: 1.9, temp: 55, health: 97 },
  { asset: 'Cooler Fan', vib: 3.5, temp: 71, health: 78 },
  { asset: 'Coal Mill', vib: 2.4, temp: 60, health: 91 },
]

const opsData = [
  { label: 'OEE', value: 87.3, target: 90 },
  { label: 'Availability', value: 96.5, target: 97 },
  { label: 'Utilization', value: 92.1, target: 95 },
  { label: 'Running Factor', value: 94.8, target: 95 },
]

function RealTimeKPIs() {
  const [cat, setCat] = useState('all')
  const [animKey, setAnimKey] = useState(0)

  const switchCat = (c) => {
    setCat(c)
    setAnimKey((k) => k + 1)
  }

  const show = (c) => cat === 'all' || cat === c
  const categories = [
    { key: 'all', label: 'All KPIs', count: 48 },
    { key: 'production', label: 'Production', count: 4 },
    { key: 'kiln', label: 'Kiln', count: 14 },
    { key: 'energy', label: 'Energy', count: 6 },
    { key: 'quality', label: 'Quality', count: 8 },
    { key: 'environment', label: 'Environment', count: 6 },
    { key: 'equipment', label: 'Equipment', count: 8 },
    { key: 'operations', label: 'Efficiency', count: 4 },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleReveal { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Real-Time KPIs</h1>
          <p style={s.sub}>Live monitoring across 127 sensors with AI-driven insights</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> 127 sensors active</span>
          <span style={s.aiBadge}>AI Engine: Active</span>
          <span style={s.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div style={s.catBar}>
        {categories.map((c) => (
          <button key={c.key} style={cat === c.key ? s.catActive : s.catBtn} onClick={() => switchCat(c.key)}>
            {c.label} <span style={cat === c.key ? s.catCountActive : s.catCount}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* ═══ PRODUCTION ═══ */}
      {show('production') && (
        <Section title="Production KPIs" badge="LSTM Forecasting" icon="PR">
          <div style={s.grid4}>
            {productionData.map((kpi, i) => (
              <div key={kpi.label} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`, borderLeft: kpi.warning ? '3px solid #f59e0b' : '3px solid #16a34a' }}>
                <div style={s.cardHead}>
                  <span style={s.cardLabel}>{kpi.label}</span>
                  <DonutChart value={kpi.value} max={kpi.target} size={52} strokeWidth={5} color={kpi.warning ? '#f59e0b' : ACCENT} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', margin: '8px 0' }}>
                  <span style={s.bigVal}><AnimatedValue value={kpi.value} /></span>
                  <span style={s.unitLabel}>{kpi.unit}</span>
                </div>
                <AreaChart data={kpi.trend} color={kpi.warning ? '#f59e0b' : ACCENT} height={40} />
                <div style={s.aiRow}><span style={s.aiChip}>AI</span> {kpi.ai}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ KILN ═══ */}
      {show('kiln') && (
        <Section title="Kiln Parameters" badge="Digital Twin Synced" icon="KN">
          <div style={s.row}>
            {/* Temperature Heatmap */}
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Temperature Zones Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                {kilnZones.map((z, i) => (
                  <div key={z.zone} style={{ animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <HeatCell value={z.temp} max={z.max} label={z.zone} unit="°C" />
                  </div>
                ))}
              </div>
            </div>
            {/* Live Parameters */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Live Parameters</div>
              <div style={{ marginTop: '12px' }}>
                {kilnParams.map((p, i) => (
                  <div key={p.label} style={{ ...s.paramRow, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <span style={s.paramLabel}>{p.label}</span>
                    <span style={s.paramVal}>{p.value} <span style={s.paramUnit}>{p.unit}</span></span>
                    <span style={s.paramRange}>{p.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ENERGY ═══ */}
      {show('energy') && (
        <Section title="Energy KPIs" badge="Optimization Active" icon="EN">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Energy Breakdown</div>
              <div style={{ marginTop: '12px' }}>
                {energyData.map((e, i) => (
                  <HBar key={e.label} label={e.label} value={e.value} max={e.max} unit={e.unit}
                    color={e.value / e.max > 0.95 ? '#f59e0b' : ACCENT} delay={i * 150} />
                ))}
              </div>
            </div>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>24hr Energy Trend (kWh/MT)</div>
              <div style={{ marginTop: '16px' }}>
                <AreaChart data={energyTrend} color={ACCENT} height={140} />
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div><div style={s.tinyLabel}>Peak</div><div style={s.tinyVal}>82.1 kWh/MT</div></div>
                <div><div style={s.tinyLabel}>Low</div><div style={s.tinyVal}>74.1 kWh/MT</div></div>
                <div><div style={s.tinyLabel}>Average</div><div style={s.tinyVal}>77.4 kWh/MT</div></div>
                <div><div style={s.tinyLabel}>Savings</div><div style={{ ...s.tinyVal, color: '#16a34a' }}>-2.4%</div></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ QUALITY ═══ */}
      {show('quality') && (
        <Section title="Quality Parameters" badge="XRF/XRD AI Analysis" icon="QC">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={s.cardLabel}>Quality Radar</div>
              <RadarChart data={qualityRadar} size={200} />
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>All parameters within target range</div>
            </div>
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Detailed Quality Readings</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                {qualityParams.map((q, i) => (
                  <div key={q.label} style={{ ...s.qualityItem, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{q.label}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>IN RANGE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{q.value}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Range: {q.range}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ENVIRONMENT ═══ */}
      {show('environment') && (
        <Section title="Environmental Compliance" badge="CEMS Integrated" icon="EV">
          <div style={s.grid3}>
            {envData.map((e, i) => {
              const pct = (e.value / e.limit) * 100
              const color = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#16a34a'
              return (
                <div key={e.label} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`, textAlign: 'center' }}>
                  <div style={s.cardLabel}>{e.label}</div>
                  <div style={{ margin: '12px auto' }}>
                    <DonutChart value={pct} max={100} size={72} strokeWidth={6} color={color} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}><AnimatedValue value={e.value} /> <span style={s.unitLabel}>{e.unit}</span></div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Limit: {e.limit} {e.unit}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color, marginTop: '4px' }}>{pct > 90 ? 'Near Limit' : pct > 75 ? 'Moderate' : 'Compliant'}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ EQUIPMENT ═══ */}
      {show('equipment') && (
        <Section title="Equipment Health" badge="Predictive Maintenance AI" icon="EQ">
          <div style={s.grid4}>
            {equipData.map((eq, i) => {
              const hColor = eq.health > 85 ? '#16a34a' : eq.health > 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={eq.asset} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{eq.asset}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: hColor, background: hColor + '15', padding: '2px 8px', borderRadius: '10px' }}>{eq.health}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ height: '100%', width: `${eq.health}%`, background: hColor, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={s.tinyLabel}>Vibration</div><div style={{ fontSize: '13px', fontWeight: 600, color: eq.vib > 4 ? '#f59e0b' : '#1e293b' }}>{eq.vib} mm/s</div></div>
                    <div><div style={s.tinyLabel}>Bearing</div><div style={{ fontSize: '13px', fontWeight: 600, color: eq.temp > 70 ? '#f59e0b' : '#1e293b' }}>{eq.temp}°C</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...s.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={s.tinyLabel}>MTBF</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 142 hrs</span></div>
            <div><span style={s.tinyLabel}>MTTR</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 3.2 hrs</span></div>
            <div><span style={s.tinyLabel}>Planned Downtime</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 4.8 hrs/wk</span></div>
            <div><span style={s.tinyLabel}>Unplanned</span><span style={{ ...s.tinyVal, fontSize: '18px', color: '#16a34a' }}> 0.6 hrs/wk</span></div>
          </div>
        </Section>
      )}

      {/* ═══ OPERATIONS ═══ */}
      {show('operations') && (
        <Section title="Operational Efficiency" badge="AI Performance Optimizer" icon="OP">
          <div style={s.grid4}>
            {opsData.map((op, i) => (
              <div key={op.label} style={{ ...s.card, textAlign: 'center', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s both` }}>
                <div style={s.cardLabel}>{op.label}</div>
                <div style={{ margin: '14px auto' }}>
                  <DonutChart value={op.value} max={op.target} size={90} strokeWidth={8} color={op.value >= op.target * 0.95 ? '#16a34a' : ACCENT} />
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: {op.target}%</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <AIFooter />
    </div>
  )
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2>
        </div>
        <span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>
      </div>
      {visible && children}
    </div>
  )
}

function AIFooter() {
  const [ref, visible] = useScrollReveal(0.2)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={s.aiFooter}>
      <div style={s.aiFooterIcon}>AI</div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine Summary</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          Monitoring 127 sensors across 7 categories. 2 parameters need attention (Roller #3 vibration, NOx levels).
          Active models: LSTM time-series, Random Forest anomaly detection, XGBoost quality prediction, CNN thermal imaging, Neural Network energy optimizer.
          Next model retraining: 6 hours. Prediction accuracy: 96.8%.
        </div>
      </div>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },

  catBar: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' },
  catBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  catActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  catCount: { background: '#f1f5f9', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  catCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
  row: { display: 'flex', gap: '14px' },

  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  bigVal: { fontSize: '28px', fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  unitLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 400 },

  aiRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', marginTop: '8px', padding: '6px 0 0', borderTop: '1px solid #f1f5f9' },
  aiChip: { background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0 },

  paramRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' },
  paramLabel: { fontSize: '12px', color: '#64748b', flex: 1 },
  paramVal: { fontSize: '14px', fontWeight: 700, color: '#1e293b', flex: 1, textAlign: 'right' },
  paramUnit: { fontSize: '10px', color: '#94a3b8', fontWeight: 400 },
  paramRange: { fontSize: '10px', color: '#94a3b8', flex: 1, textAlign: 'right' },

  qualityItem: { background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e8ecf1' },

  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },

  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}

export default RealTimeKPIs
