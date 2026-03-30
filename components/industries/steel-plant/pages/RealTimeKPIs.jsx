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
function AnimatedValue({ value, suffix = '', prefix = '', decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => {
    const duration = 1400
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(numVal * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  const formatted = dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)
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
function DonutChart({ value, max, size = 80, strokeWidth = 8, color }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => {
    const duration = 1600
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimPct(pct * (1 - Math.pow(1 - p, 3)))
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
function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => {
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
  return (
    <svg width={size} height={size}>
      {[25, 50, 75, 100].map((lv) => (
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

// ─── Heatmap Cell (temperature gradient) ───
function HeatCell({ value, max, label, unit }) {
  const ratio = value / max
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

// ══════════════════════════════════
// ──── STEEL PLANT KPI DATA ───────
// ══════════════════════════════════

const productionData = [
  { label: 'Crude Steel Output', value: 262, unit: 'TPH', target: 270, trend: [248, 252, 258, 255, 260, 264, 262], ai: 'LSTM model: output stable for next 6hrs' },
  { label: 'Hot Metal Production', value: 285, unit: 'TPH', target: 290, trend: [275, 278, 280, 282, 286, 284, 285], ai: 'Iron ore blend optimized — yield +1.2%' },
  { label: 'Slab Casting Rate', value: 238, unit: 'TPH', target: 245, trend: [230, 235, 232, 236, 240, 237, 238], ai: 'Casting speed adjusted for grade change' },
  { label: 'Rolled Product Output', value: 218, unit: 'TPH', target: 225, trend: [208, 212, 215, 214, 220, 216, 218], ai: 'Rolling schedule AI optimized — ETA on target', warning: true },
]

// Blast Furnace zones — real temperature ranges for integrated steel plant
const bfZones = [
  { zone: 'Throat (Top)', temp: 250, max: 400 },
  { zone: 'Stack Upper', temp: 680, max: 900 },
  { zone: 'Stack Lower', temp: 1050, max: 1250 },
  { zone: 'Belly', temp: 1280, max: 1450 },
  { zone: 'Bosh', temp: 1520, max: 1700 },
  { zone: 'Tuyere Level', temp: 2100, max: 2400 },
  { zone: 'Hearth', temp: 1510, max: 1600 },
  { zone: 'Hot Blast', temp: 1180, max: 1300 },
]

const bfParams = [
  { label: 'Blast Volume', value: '4,850', unit: 'Nm³/min', range: '4500-5200' },
  { label: 'Hot Blast Temp', value: '1,180', unit: '°C', range: '1100-1250' },
  { label: 'Top Pressure', value: '2.35', unit: 'kg/cm²', range: '2.0-2.5' },
  { label: 'Coke Rate', value: '328', unit: 'kg/THM', range: '310-350' },
  { label: 'PCI Rate', value: '165', unit: 'kg/THM', range: '140-180' },
  { label: 'Slag Rate', value: '285', unit: 'kg/THM', range: '260-310' },
  { label: 'Burden Distribution', value: '2.4:1', unit: 'O/C', range: '2.2-2.6' },
  { label: 'Slag Basicity', value: '1.12', unit: 'CaO/SiO₂', range: '1.05-1.20' },
]

const energyData = [
  { label: 'Specific Energy (SEC)', value: 520, unit: 'kWh/MT', max: 600 },
  { label: 'BF Gas Recovery', value: 92.4, unit: '%', max: 100 },
  { label: 'Coke Oven Gas', value: 38.5, unit: 'Nm³/T', max: 50 },
  { label: 'LD Gas Recovery', value: 88.6, unit: '%', max: 100 },
  { label: 'Power Generation', value: 124, unit: 'MW', max: 150 },
  { label: 'Steam Generation', value: 245, unit: 'T/hr', max: 300 },
]

const energyTrend = [535, 528, 522, 530, 525, 518, 515, 520, 516, 512, 518, 520]

const qualityRadar = [
  { label: 'Chemistry', value: 94 },
  { label: 'Tensile', value: 91 },
  { label: 'Elongation', value: 88 },
  { label: 'Hardness', value: 93 },
  { label: 'Impact', value: 86 },
  { label: 'Surface', value: 95 },
]

const qualityParams = [
  { label: 'Carbon Content', value: '0.18%', status: 'good', range: '0.15-0.20%' },
  { label: 'Manganese', value: '1.42%', status: 'good', range: '1.30-1.60%' },
  { label: 'Sulphur', value: '0.008%', status: 'good', range: '<0.015%' },
  { label: 'Phosphorus', value: '0.012%', status: 'good', range: '<0.020%' },
  { label: 'Tensile Strength', value: '520 MPa', status: 'good', range: '490-550 MPa' },
  { label: 'Yield Strength', value: '415 MPa', status: 'good', range: '400-450 MPa' },
  { label: 'Elongation', value: '22.4%', status: 'good', range: '>18%' },
  { label: 'Charpy Impact (-20°C)', value: '148 J', status: 'good', range: '>120 J' },
]

const envData = [
  { label: 'CO₂', value: 1.85, limit: 2.1, unit: 'T/TCS' },
  { label: 'SO₂', value: 42, limit: 50, unit: 'mg/Nm³' },
  { label: 'NOx', value: 88, limit: 100, unit: 'mg/Nm³' },
  { label: 'PM (Stack)', value: 28, limit: 30, unit: 'mg/Nm³' },
  { label: 'Fugitive Dust', value: 1.8, limit: 3.0, unit: 'mg/m³' },
  { label: 'Water Consumption', value: 3.2, limit: 4.0, unit: 'm³/TCS' },
]

const equipData = [
  { asset: 'BF Main Blower', vib: 2.8, temp: 62, health: 96 },
  { asset: 'Hot Stove #1', vib: 1.2, temp: 1180, health: 94 },
  { asset: 'BOF Converter', vib: 3.6, temp: 78, health: 91 },
  { asset: 'Continuous Caster', vib: 2.4, temp: 58, health: 93 },
  { asset: 'Rolling Mill Stand #1', vib: 3.2, temp: 68, health: 89 },
  { asset: 'Rolling Mill Stand #3', vib: 5.1, temp: 82, health: 71 },
  { asset: 'Ladle Turret', vib: 2.9, temp: 64, health: 88 },
  { asset: 'Reheat Furnace', vib: 1.8, temp: 72, health: 92 },
]

const opsData = [
  { label: 'OEE', value: 85.1, target: 88 },
  { label: 'Availability', value: 94.7, target: 96 },
  { label: 'Yield Rate', value: 96.3, target: 97 },
  { label: 'Running Factor', value: 92.8, target: 95 },
]

// ── Steelmaking process KPIs (BOF / EAF) ──
const steelmakingData = [
  { label: 'BOF Blow Time', value: '16.2', unit: 'min', range: '14-18 min' },
  { label: 'Tap-to-Tap Time', value: '38', unit: 'min', range: '35-42 min' },
  { label: 'Oxygen Consumption', value: '52.4', unit: 'Nm³/T', range: '48-58' },
  { label: 'Hot Metal Ratio', value: '82.5', unit: '%', range: '78-88%' },
  { label: 'Lime Consumption', value: '42', unit: 'kg/T', range: '38-48' },
  { label: 'End-Point Carbon', value: '0.04', unit: '%', range: '0.03-0.06%' },
  { label: 'End-Point Temp', value: '1,652', unit: '°C', range: '1640-1680°C' },
  { label: 'Mn Recovery', value: '72', unit: '%', range: '65-80%' },
]

// ── Casting KPIs ──
const castingData = [
  { label: 'Casting Speed', value: 1.35, unit: 'm/min', max: 1.8 },
  { label: 'Mold Level Stability', value: 94.2, unit: '%', max: 100 },
  { label: 'Breakout Prediction', value: 99.1, unit: '% accuracy', max: 100 },
  { label: 'Tundish Superheat', value: 22, unit: '°C', max: 35 },
  { label: 'Slab Width Accuracy', value: 99.4, unit: '%', max: 100 },
  { label: 'Surface Defect Rate', value: 0.8, unit: '%', max: 3.0 },
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
    { key: 'all', label: 'All KPIs', count: 62 },
    { key: 'production', label: 'Production', count: 4 },
    { key: 'bf', label: 'Blast Furnace', count: 16 },
    { key: 'steelmaking', label: 'Steelmaking', count: 8 },
    { key: 'casting', label: 'Casting', count: 6 },
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
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Real-Time KPIs</h1>
          <p style={s.sub}>Live monitoring across 248 sensors with AI-driven steel process intelligence</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> 248 sensors active</span>
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

      {/* ═══ BLAST FURNACE ═══ */}
      {show('bf') && (
        <Section title="Blast Furnace Parameters" badge="Digital Twin Synced" icon="BF">
          <div style={s.row}>
            {/* Temperature Heatmap */}
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Blast Furnace Temperature Zones</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                {bfZones.map((z, i) => (
                  <div key={z.zone} style={{ animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <HeatCell value={z.temp} max={z.max} label={z.zone} unit="°C" />
                  </div>
                ))}
              </div>
            </div>
            {/* Live Parameters */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Live BF Operating Parameters</div>
              <div style={{ marginTop: '12px' }}>
                {bfParams.map((p, i) => (
                  <div key={p.label} style={{ ...s.paramRow, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }}>
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

      {/* ═══ STEELMAKING (BOF/EAF) ═══ */}
      {show('steelmaking') && (
        <Section title="Steelmaking (BOF / EAF)" badge="Process AI Active" icon="SM">
          <div style={s.grid4}>
            {steelmakingData.map((p, i) => (
              <div key={p.label} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                <div style={s.cardLabel}>{p.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', margin: '10px 0 6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{p.value}</span>
                  <span style={s.unitLabel}>{p.unit}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Range: {p.range}</div>
              </div>
            ))}
          </div>
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.aiRow}>
              <span style={s.aiChip}>AI</span>
              BOF endpoint prediction accuracy: 97.2% | Carbon hit rate: 94.8% | Temperature hit rate: 96.1% | Next heat ETA: 22 min | Recommended O₂ flow: 52.8 Nm³/T for target C 0.04%
            </div>
          </div>
        </Section>
      )}

      {/* ═══ CASTING ═══ */}
      {show('casting') && (
        <Section title="Continuous Casting" badge="Breakout Prediction AI" icon="CC">
          <div style={s.grid3}>
            {castingData.map((c, i) => {
              const pct = (c.value / c.max) * 100
              const color = c.label === 'Surface Defect Rate'
                ? (c.value < 1.0 ? '#16a34a' : c.value < 2.0 ? '#f59e0b' : '#ef4444')
                : (pct > 90 ? '#16a34a' : pct > 70 ? ACCENT : '#f59e0b')
              return (
                <div key={c.label} style={{ ...s.card, textAlign: 'center', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                  <div style={s.cardLabel}>{c.label}</div>
                  <div style={{ margin: '12px auto' }}>
                    <DonutChart value={pct} max={100} size={72} strokeWidth={6} color={color} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                    <AnimatedValue value={c.value} decimals={c.value % 1 !== 0 ? 1 : 0} /> <span style={s.unitLabel}>{c.unit}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Max: {c.max} {c.unit}</div>
                </div>
              )
            })}
          </div>
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.aiRow}>
              <span style={s.aiChip}>AI</span>
              Breakout prediction model — 99.1% accuracy | Last breakout prevented: 3 days ago (Strand #2) | Mold oscillation optimized via AI | Spray cooling adjusted for current grade (S355J2)
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ENERGY ═══ */}
      {show('energy') && (
        <Section title="Energy KPIs" badge="Gas Recovery Optimization" icon="EN">
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
              <div style={s.cardLabel}>24hr SEC Trend (kWh/TCS)</div>
              <div style={{ marginTop: '16px' }}>
                <AreaChart data={energyTrend} color={ACCENT} height={140} />
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div><div style={s.tinyLabel}>Peak</div><div style={s.tinyVal}>535 kWh/TCS</div></div>
                <div><div style={s.tinyLabel}>Low</div><div style={s.tinyVal}>512 kWh/TCS</div></div>
                <div><div style={s.tinyLabel}>Average</div><div style={s.tinyVal}>521 kWh/TCS</div></div>
                <div><div style={s.tinyLabel}>vs Target</div><div style={{ ...s.tinyVal, color: '#16a34a' }}>-3.6%</div></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ QUALITY ═══ */}
      {show('quality') && (
        <Section title="Steel Quality Parameters" badge="Spectrometry AI Analysis" icon="QC">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={s.cardLabel}>Quality Radar</div>
              <RadarChart data={qualityRadar} size={200} />
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>All parameters within grade specification</div>
            </div>
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Chemical & Mechanical Properties</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                {qualityParams.map((q, i) => (
                  <div key={q.label} style={{ ...s.qualityItem, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{q.label}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>IN SPEC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{q.value}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Spec: {q.range}</span>
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
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}><AnimatedValue value={e.value} decimals={e.value < 10 ? 1 : 0} /> <span style={s.unitLabel}>{e.unit}</span></div>
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
                    <div><div style={s.tinyLabel}>Temp</div><div style={{ fontSize: '13px', fontWeight: 600, color: eq.temp > 80 ? '#f59e0b' : '#1e293b' }}>{eq.temp}°C</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...s.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={s.tinyLabel}>MTBF</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 168 hrs</span></div>
            <div><span style={s.tinyLabel}>MTTR</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 4.1 hrs</span></div>
            <div><span style={s.tinyLabel}>Planned Downtime</span><span style={{ ...s.tinyVal, fontSize: '18px' }}> 6.2 hrs/wk</span></div>
            <div><span style={s.tinyLabel}>Unplanned</span><span style={{ ...s.tinyVal, fontSize: '18px', color: '#f59e0b' }}> 1.8 hrs/wk</span></div>
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
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine Summary — Steel Plant</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          Monitoring 248 sensors across 10 categories. 2 parameters need attention (Rolling Mill Stand #3 vibration, PM stack emissions near limit).
          Active models: LSTM hot metal forecasting, XGBoost BOF endpoint prediction (97.2% accuracy), CNN slab surface defect detection,
          Random Forest breakout prediction (99.1%), Neural Network energy optimizer, Reinforcement Learning caster speed controller.
          Next model retraining: 4 hours. Overall prediction accuracy: 96.4%.
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
