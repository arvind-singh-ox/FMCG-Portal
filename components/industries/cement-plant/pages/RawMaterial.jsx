'use client'
import { useState, useEffect, useRef, Fragment } from 'react'

const ACCENT = '#605dba'

// ─── Scroll Reveal ───
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
function AnimatedValue({ value, decimals = 1, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    const duration = 1400, startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setDisplay(numVal * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  return <>{numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(decimals)}{suffix}</>
}

// ─── Responsive Area Chart ───
function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null)
  const [w, setW] = useState(200)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block' }}>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Donut Chart ───
function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => {
    const duration = 1600, startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimPct(pct * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || ACCENT} strokeWidth={strokeWidth}
        strokeDasharray={`${(animPct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>
      {label && <text x={size / 2} y={size / 2 + 13} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}
    </svg>
  )
}

// ─── HBar ───
function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
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

// ─── Stacked Bar ───
function StackedBar({ segments, height = 24 }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), 200); return () => clearTimeout(t) }, [])
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (
    <div style={{ display: 'flex', height: `${height}px`, borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
      {segments.map((seg, i) => (
        <div key={i} style={{
          width: anim ? `${(seg.value / total) * 100}%` : '0%',
          background: seg.color, transition: `width 1.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'
        }}>
          {(seg.value / total) * 100 > 8 ? `${Math.round((seg.value / total) * 100)}%` : ''}
        </div>
      ))}
    </div>
  )
}

// ─── Radar Chart ───
function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => {
    const duration = 1400, start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setAnimScale(1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [data])
  const cx = size / 2, cy = size / 2, r = size / 2 - 24
  const n = data.length, angle = (2 * Math.PI) / n
  const getPoint = (i, val) => {
    const a = angle * i - Math.PI / 2, dist = (val / 100) * r * animScale
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }
  }
  return (
    <svg width={size} height={size}>
      {[25, 50, 75, 100].map(lv => (
        <polygon key={lv} points={Array.from({ length: n }, (_, i) => { const a = angle * i - Math.PI / 2; const d = (lv / 100) * r; return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}` }).join(' ')} fill="none" stroke="#e8ecf1" strokeWidth="0.5" />
      ))}
      {data.map((_, i) => { const a = angle * i - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" /> })}
      <polygon points={data.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}` }).join(' ')} fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />
      {data.map((d, i) => {
        const p = getPoint(i, d.value)
        const lp = { x: cx + (r + 16) * Math.cos(angle * i - Math.PI / 2), y: cy + (r + 16) * Math.sin(angle * i - Math.PI / 2) }
        return (<g key={i}><circle cx={p.x} cy={p.y} r="3" fill={ACCENT} /><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text></g>)
      })}
    </svg>
  )
}

// ─── Gauge Chart ───
function GaugeChart({ value, min, max, unit, size = 140, color, zones }) {
  const [animVal, setAnimVal] = useState(min)
  useEffect(() => {
    const duration = 1600, startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimVal(min + (value - min) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, min])
  const cx = size / 2, cy = size / 2 + 10, r = size / 2 - 18, range = max - min
  const angle = ((animVal - min) / range) * 180
  const needleX = cx + r * 0.75 * Math.cos((180 + angle) * Math.PI / 180)
  const needleY = cy + r * 0.75 * Math.sin((180 + angle) * Math.PI / 180)
  const zoneArcs = (zones || []).map(z => {
    const sa = ((z.from - min) / range) * 180, ea = ((z.to - min) / range) * 180
    const x1 = cx + r * Math.cos((180 + sa) * Math.PI / 180), y1 = cy + r * Math.sin((180 + sa) * Math.PI / 180)
    const x2 = cx + r * Math.cos((180 + ea) * Math.PI / 180), y2 = cy + r * Math.sin((180 + ea) * Math.PI / 180)
    return <path key={z.from} d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" opacity="0.25" />
  })
  const fmt = v => v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1)
  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
      {zoneArcs}
      {angle > 0 && (() => {
        const eX = cx + r * Math.cos((180 + angle) * Math.PI / 180), eY = cy + r * Math.sin((180 + angle) * Math.PI / 180)
        return <path d={`M${cx - r},${cy} A${r},${r} 0 ${angle > 180 ? 1 : 0} 1 ${eX},${eY}`} fill="none" stroke={color || ACCENT} strokeWidth="10" strokeLinecap="round" />
      })()}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
      <text x={cx - r - 4} y={cy + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">{min}</text>
      <text x={cx + r + 4} y={cy + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">{max}</text>
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{fmt(animVal)}</text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="10" fill="#94a3b8">{unit}</text>
    </svg>
  )
}

// ════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════

const rawMaterials = [
  { name: 'Limestone', stock: 28500, capacity: 40000, consumption: 320, unit: 'TPH', daysLeft: 3.7, quality: 94, siloLevel: 71, color: '#3b82f6', trend: [310, 318, 325, 320, 315, 322, 320] },
  { name: 'Clay / Shale', stock: 8200, capacity: 12000, consumption: 85, unit: 'TPH', daysLeft: 4.0, quality: 91, siloLevel: 68, color: '#f59e0b', trend: [80, 82, 88, 85, 83, 86, 85] },
  { name: 'Iron Ore', stock: 3100, capacity: 5000, consumption: 22, unit: 'TPH', daysLeft: 5.9, quality: 96, siloLevel: 62, color: '#ef4444', trend: [20, 21, 23, 22, 21, 22, 22] },
  { name: 'Silica Sand', stock: 4800, capacity: 8000, consumption: 35, unit: 'TPH', daysLeft: 5.7, quality: 98, siloLevel: 60, color: '#16a34a', trend: [32, 34, 36, 35, 33, 35, 35] },
  { name: 'Bauxite', stock: 1850, capacity: 3000, consumption: 12, unit: 'TPH', daysLeft: 6.4, quality: 93, siloLevel: 62, color: '#8b5cf6', trend: [11, 12, 13, 12, 11, 12, 12] },
  { name: 'Gypsum', stock: 5600, capacity: 8000, consumption: 28, unit: 'TPH', daysLeft: 8.3, quality: 97, siloLevel: 70, color: '#ea580c', trend: [26, 27, 29, 28, 27, 28, 28] },
]

const rawMixDesign = {
  target: { LSF: 95.0, SM: 2.40, AM: 1.35, CaO: 43.5, SiO2: 13.8, Al2O3: 3.6, Fe2O3: 2.7 },
  actual: { LSF: 95.2, SM: 2.42, AM: 1.38, CaO: 43.8, SiO2: 13.6, Al2O3: 3.7, Fe2O3: 2.68 },
  proportions: [
    { name: 'Limestone', value: 78, color: '#3b82f6' },
    { name: 'Clay', value: 12, color: '#f59e0b' },
    { name: 'Iron Ore', value: 4, color: '#ef4444' },
    { name: 'Silica Sand', value: 4, color: '#16a34a' },
    { name: 'Bauxite', value: 2, color: '#8b5cf6' },
  ],
}

const fuelInventory = [
  { name: 'Petcoke', stock: 4200, capacity: 6000, burnRate: 18.5, unit: 'TPH', daysLeft: 9.5, cv: 8200, color: '#1e293b', trend: [17.8, 18.2, 18.8, 18.5, 18.3, 18.6, 18.5] },
  { name: 'Coal (Indigenous)', stock: 3800, capacity: 5000, burnRate: 8.2, unit: 'TPH', daysLeft: 19.3, cv: 5400, color: ACCENT, trend: [7.8, 8.0, 8.5, 8.2, 8.1, 8.3, 8.2] },
  { name: 'Imported Coal', stock: 2100, capacity: 4000, burnRate: 4.8, unit: 'TPH', daysLeft: 18.2, cv: 6200, color: '#3b82f6', trend: [4.5, 4.6, 4.9, 4.8, 4.7, 4.8, 4.8] },
  { name: 'AFR - Tyres', stock: 850, capacity: 1500, burnRate: 2.4, unit: 'TPH', daysLeft: 14.8, cv: 7500, color: '#f59e0b', trend: [2.2, 2.3, 2.5, 2.4, 2.3, 2.4, 2.4] },
  { name: 'AFR - RDF', stock: 620, capacity: 1000, burnRate: 1.8, unit: 'TPH', daysLeft: 14.4, cv: 3800, color: '#16a34a', trend: [1.6, 1.7, 1.9, 1.8, 1.7, 1.8, 1.8] },
  { name: 'Biomass (Rice Husk)', stock: 480, capacity: 800, burnRate: 1.2, unit: 'TPH', daysLeft: 16.7, cv: 3200, color: '#ea580c', trend: [1.0, 1.1, 1.3, 1.2, 1.1, 1.2, 1.2] },
]

const fuelBlend = {
  mix: [
    { name: 'Petcoke', value: 50, color: '#1e293b' },
    { name: 'Coal (Ind)', value: 22, color: ACCENT },
    { name: 'Imported Coal', value: 13, color: '#3b82f6' },
    { name: 'AFR Tyres', value: 6.5, color: '#f59e0b' },
    { name: 'AFR RDF', value: 5, color: '#16a34a' },
    { name: 'Biomass', value: 3.5, color: '#ea580c' },
  ],
  totalFeedRate: 36.9,
  avgCV: 6180,
  targetCV: 6200,
  tsr: 14.7,
  targetTSR: 18.0,
  specificHeat: 725,
  targetHeat: 710,
}

const chemistryTrends = {
  LSF: [94.5, 94.8, 95.0, 95.3, 95.1, 95.2, 94.9, 95.2, 95.0, 95.1, 94.8, 95.2],
  SM: [2.38, 2.40, 2.42, 2.44, 2.41, 2.42, 2.40, 2.42, 2.43, 2.41, 2.39, 2.42],
  CaO: [43.2, 43.5, 43.8, 44.0, 43.7, 43.8, 43.6, 43.8, 43.9, 43.7, 43.5, 43.8],
}

const qualityRadar = [
  { label: 'LSF', value: 95 },
  { label: 'SM', value: 92 },
  { label: 'AM', value: 88 },
  { label: 'CaO', value: 96 },
  { label: 'Fineness', value: 90 },
  { label: 'Moisture', value: 85 },
]

const siloLevels = [
  { name: 'RM Silo A', level: 72, material: 'Raw Meal', capacity: '5,000 MT', temp: 85 },
  { name: 'RM Silo B', level: 58, material: 'Raw Meal', capacity: '5,000 MT', temp: 82 },
  { name: 'Limestone Bin', level: 71, material: 'Limestone', capacity: '800 MT', temp: 28 },
  { name: 'Coal Bin', level: 65, material: 'Coal Mix', capacity: '400 MT', temp: 42 },
  { name: 'Gypsum Hopper', level: 70, material: 'Gypsum', capacity: '200 MT', temp: 30 },
  { name: 'Clinker Silo', level: 82, material: 'Clinker', capacity: '15,000 MT', temp: 95 },
  { name: 'Cement Silo 1', level: 55, material: 'OPC 43', capacity: '8,000 MT', temp: 65 },
  { name: 'Cement Silo 2', level: 48, material: 'OPC 53', capacity: '8,000 MT', temp: 62 },
]

const rawMillParams = [
  { label: 'Feed Rate', value: 298, unit: 'TPH', target: 310, status: 'ok' },
  { label: 'Separator Speed', value: 82, unit: 'RPM', target: 85, status: 'ok' },
  { label: 'Mill Inlet Temp', value: 250, unit: '°C', target: 260, status: 'ok' },
  { label: 'Mill Outlet Temp', value: 95, unit: '°C', target: 90, status: 'watch' },
  { label: 'Residue 90μ', value: 14.2, unit: '%', target: 15, status: 'ok' },
  { label: 'Residue 212μ', value: 1.8, unit: '%', target: 2.0, status: 'ok' },
  { label: 'Mill Motor Load', value: 78, unit: '%', target: 80, status: 'ok' },
  { label: 'Fan Draft', value: -42, unit: 'mmWG', target: -45, status: 'ok' },
]

const dosingSystems = [
  { name: 'Limestone Feeder', setpoint: 248, actual: 245, unit: 'TPH', deviation: -1.2, mode: 'Auto (AI)', trend: [242, 246, 248, 245, 244, 246, 245] },
  { name: 'Clay Feeder', setpoint: 32, actual: 31.5, unit: 'TPH', deviation: -1.6, mode: 'Auto (AI)', trend: [30, 31, 33, 31.5, 31, 32, 31.5] },
  { name: 'Iron Ore Feeder', setpoint: 12, actual: 12.2, unit: 'TPH', deviation: +1.7, mode: 'Auto (AI)', trend: [11.5, 12, 12.5, 12.2, 12, 12.3, 12.2] },
  { name: 'Silica Sand Feeder', setpoint: 8, actual: 7.8, unit: 'TPH', deviation: -2.5, mode: 'Auto (AI)', trend: [7.5, 7.8, 8.2, 7.8, 7.6, 7.9, 7.8] },
  { name: 'Coal Feeder (Main)', setpoint: 28.5, actual: 28.3, unit: 'TPH', deviation: -0.7, mode: 'Auto (PID)', trend: [27.8, 28.2, 28.8, 28.3, 28.1, 28.4, 28.3] },
  { name: 'AFR Feeder', setpoint: 5.5, actual: 5.4, unit: 'TPH', deviation: -1.8, mode: 'Auto (AI)', trend: [5.0, 5.2, 5.6, 5.4, 5.3, 5.5, 5.4] },
]

const aiOptimizations = [
  { priority: 'high', title: 'Increase Silica Sand by 0.5 TPH', reason: 'SM trending below target (2.42 vs 2.40). XRF cross-belt analyzer shows SiO2 dropping in limestone batch. Compensate via silica sand feeder.', impact: 'SM correction: +0.04', model: 'Raw Mix Optimizer NN', confidence: 93 },
  { priority: 'medium', title: 'Switch to Imported Coal Batch #IC-2204', reason: 'Current indigenous coal CV dropped to 5,200 kcal/kg (lab result). Imported batch #IC-2204 tested at 6,400 kcal/kg — better blend efficiency.', impact: 'CV improvement: +180 kcal/kg', model: 'Fuel Quality Predictor', confidence: 88 },
  { priority: 'medium', title: 'Ramp AFR (RDF) to 2.2 TPH', reason: 'Kiln conditions stable, BZ temp 1452°C steady for 6hrs. Window to increase TSR from 14.7% to 16.1% without quality impact.', impact: 'Cost saving: ~$1.8/ton clinker', model: 'AFR Optimizer', confidence: 86 },
  { priority: 'low', title: 'Order Limestone Replenishment', reason: 'Current stock at 28,500 MT with 3.7 days remaining at current consumption. Lead time for delivery is 2 days. Trigger procurement.', impact: 'Prevent stockout', model: 'Inventory Predictor', confidence: 95 },
  { priority: 'info', title: 'Gypsum Moisture Alert', reason: 'Incoming gypsum batch showing 12.8% moisture vs normal 8-10%. Adjust dryer settings before feeding to cement mill.', impact: 'Quality protection', model: 'Material Quality LLM', confidence: 81 },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

function RawMaterial() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)

  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (t) => tab === 'all' || tab === t

  const tabs = [
    { key: 'all', label: 'Full Overview', count: 48 },
    { key: 'inventory', label: 'Raw Material Inventory', count: 6 },
    { key: 'mix', label: 'Mix Design', count: 8 },
    { key: 'fuel', label: 'Fuel Blend', count: 8 },
    { key: 'silos', label: 'Silos & Storage', count: 8 },
    { key: 'dosing', label: 'Dosing & Mill', count: 10 },
    { key: 'ai', label: 'AI Optimization', count: 8 },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes siloFill { from { height: 0; } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Raw Material & Fuel Blend</h1>
          <p style={s.sub}>AI-optimized raw mix dosing, fuel blending, and inventory management</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> XRF Analyzer: Online</span>
          <span style={s.aiBadge}>AI Mix Optimizer: Active</span>
          <span style={s.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div style={s.statusBar}>
        {[
          { label: 'Raw Mill Feed', value: '298 TPH', icon: 'RM', color: ACCENT },
          { label: 'Total Fuel Feed', value: '36.9 TPH', icon: 'FF', color: '#ea580c' },
          { label: 'TSR (Alt. Fuel)', value: '14.7%', icon: 'TS', color: '#16a34a' },
          { label: 'Sp. Heat Cons.', value: '725 kcal/kg', icon: 'SH', color: '#f59e0b' },
          { label: 'LSF', value: '95.2', icon: 'LS', color: '#3b82f6' },
          { label: 'Silica Modulus', value: '2.42', icon: 'SM', color: ACCENT },
          { label: 'Limestone Stock', value: '3.7 days', icon: 'LI', color: '#ef4444' },
          { label: 'AI Dosing Mode', value: 'Active', icon: 'AD', color: '#16a34a' },
        ].map((item, i) => (
          <div key={item.label} style={{ ...s.statusItem, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both` }}>
            <div style={{ ...s.statusIcon, background: item.color + '12', color: item.color }}>{item.icon}</div>
            <div>
              <div style={s.statusLabel}>{item.label}</div>
              <div style={s.statusValue}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div style={s.catBar}>
        {tabs.map(t => (
          <button key={t.key} style={tab === t.key ? s.catActive : s.catBtn} onClick={() => switchTab(t.key)}>
            {t.label} <span style={tab === t.key ? s.catCountActive : s.catCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ RAW MATERIAL INVENTORY ═══════════════ */}
      {show('inventory') && (
        <Section title="Raw Material Inventory" badge="Auto Procurement AI" icon="RM">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {rawMaterials.map((mat, i) => {
              const pct = (mat.stock / mat.capacity) * 100
              const stockColor = mat.daysLeft < 4 ? '#ef4444' : mat.daysLeft < 7 ? '#f59e0b' : '#16a34a'
              return (
                <div key={mat.name} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both`, borderLeft: `3px solid ${mat.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{mat.name}</span>
                    <DonutChart value={mat.quality} max={100} size={44} strokeWidth={4} color={mat.color} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={mat.stock} /></span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>MT</span>
                  </div>
                  {/* Stock bar */}
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: mat.color, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                    <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Capacity</div><div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{(mat.capacity / 1000).toFixed(0)}K MT</div></div>
                    <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Consumption</div><div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{mat.consumption} TPH</div></div>
                    <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Days Left</div><div style={{ fontSize: '11px', fontWeight: 700, color: stockColor }}>{mat.daysLeft} days</div></div>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>Consumption Trend (7d)</div>
                    <AreaChart data={mat.trend} color={mat.color} height={30} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══════════════ RAW MIX DESIGN ═══════════════ */}
      {show('mix') && (
        <Section title="Raw Mix Design & Chemistry" badge="XRF Cross-Belt Analyzer" icon="MX">
          <div style={s.row}>
            {/* Proportions */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Raw Mix Proportions</div>
              <div style={{ marginTop: '12px' }}>
                <StackedBar segments={rawMixDesign.proportions} height={32} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
                  {rawMixDesign.proportions.map(p => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color }} />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{p.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Moduli Comparison Table */}
              <div style={{ marginTop: '20px' }}>
                <div style={s.cardLabel}>Moduli & Oxide Comparison (Target vs Actual)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', gap: '4px', marginTop: '10px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', padding: '6px 0' }}>Parameter</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', padding: '6px 0' }}>Target</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', padding: '6px 0' }}>Actual</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', padding: '6px 0' }}>Status</span>
                  {Object.keys(rawMixDesign.target).map((key, i) => {
                    const t = rawMixDesign.target[key], a = rawMixDesign.actual[key]
                    const diff = Math.abs(a - t)
                    const ok = diff / t < 0.02
                    return (
                      <Fragment key={key}>
                        <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500, padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>{key}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>{t}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>{a}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: ok ? '#16a34a' : '#f59e0b', background: (ok ? '#16a34a' : '#f59e0b') + '15', padding: '3px 6px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center' }}>{ok ? 'OK' : 'WATCH'}</span>
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* Quality Radar + Trends */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Raw Meal Quality Index</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <RadarChart data={qualityRadar} size={200} />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>Overall Quality Score: 91.0 / 100</div>
              {/* Chemistry Trends */}
              <div style={{ marginTop: '16px' }}>
                <div style={s.cardLabel}>LSF Trend (12hr)</div>
                <AreaChart data={chemistryTrends.LSF} color={ACCENT} height={50} />
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={s.cardLabel}>CaO Trend (12hr)</div>
                <AreaChart data={chemistryTrends.CaO} color="#3b82f6" height={50} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ FUEL BLEND ═══════════════ */}
      {show('fuel') && (
        <Section title="Fuel Blend & Energy" badge="Cost Optimizer Active" icon="FB">
          <div style={s.row}>
            {/* Fuel Inventory */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Fuel Inventory & Burn Rate</div>
              <div style={{ marginTop: '12px' }}>
                {fuelInventory.map((fuel, i) => (
                  <div key={fuel.name} style={{ marginBottom: '14px', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: fuel.color }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{fuel.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>CV: {fuel.cv.toLocaleString()} kcal/kg</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{fuel.stock.toLocaleString()} MT</span>
                      </div>
                    </div>
                    <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(fuel.stock / fuel.capacity) * 100}%`, background: fuel.color, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '9px', color: '#94a3b8' }}>
                      <span>Burn: {fuel.burnRate} TPH</span>
                      <span style={{ color: fuel.daysLeft < 10 ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>{fuel.daysLeft} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Blend + Gauges */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Current Fuel Blend</div>
              <div style={{ marginTop: '12px' }}>
                <StackedBar segments={fuelBlend.mix} height={28} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {fuelBlend.mix.map(f => (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: f.color }} />
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{f.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{f.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Key Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={fuelBlend.avgCV} min={3000} max={8500} unit="kcal/kg avg" size={130} color={ACCENT}
                    zones={[{ from: 3000, to: 5000, color: '#ef4444' }, { from: 5000, to: 6500, color: '#f59e0b' }, { from: 6500, to: 8500, color: '#16a34a' }]} />
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Weighted Calorific Value</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={fuelBlend.tsr} min={0} max={30} unit="% TSR" size={130} color="#16a34a"
                    zones={[{ from: 0, to: 10, color: '#ef4444' }, { from: 10, to: 20, color: '#f59e0b' }, { from: 20, to: 30, color: '#16a34a' }]} />
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Thermal Substitution Rate</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={s.tinyLabel}>Total Feed </span><span style={s.tinyVal}>{fuelBlend.totalFeedRate} TPH</span></div>
                <div><span style={s.tinyLabel}>Sp. Heat </span><span style={{ ...s.tinyVal, color: fuelBlend.specificHeat > fuelBlend.targetHeat ? '#f59e0b' : '#16a34a' }}>{fuelBlend.specificHeat} kcal/kg</span></div>
                <div><span style={s.tinyLabel}>Target </span><span style={s.tinyVal}>{fuelBlend.targetHeat} kcal/kg</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ SILOS & STORAGE ═══════════════ */}
      {show('silos') && (
        <Section title="Silos & Storage Levels" badge="Ultrasonic Level Sensors" icon="SL">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {siloLevels.map((silo, i) => {
              const lvlColor = silo.level > 75 ? '#16a34a' : silo.level > 40 ? '#f59e0b' : '#ef4444'
              return (
                <div key={silo.name} style={{ ...s.card, textAlign: 'center', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{silo.name}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '12px' }}>{silo.material} | {silo.capacity}</div>
                  {/* Silo visual */}
                  <div style={{ width: '60px', height: '90px', margin: '0 auto', borderRadius: '6px 6px 12px 12px', border: '2px solid #e2e8f0', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: `${silo.level}%`,
                      background: `linear-gradient(to top, ${lvlColor}60, ${lvlColor}30)`,
                      transition: 'height 1.6s cubic-bezier(0.22,1,0.36,1)',
                      borderRadius: '0 0 10px 10px'
                    }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{silo.level}%</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px' }}>Temp: {silo.temp}°C</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══════════════ DOSING & RAW MILL ═══════════════ */}
      {show('dosing') && (
        <Section title="Dosing Systems & Raw Mill" badge="AI Auto-Dosing" icon="DS">
          <div style={s.row}>
            {/* Dosing Feeders */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={s.cardLabel}>Feeder Dosing Control</div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>All in AI Auto Mode</span>
              </div>
              {dosingSystems.map((ds, i) => {
                const devColor = Math.abs(ds.deviation) > 2 ? '#f59e0b' : '#16a34a'
                return (
                  <div key={ds.name} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{ds.name}</span>
                        <span style={{ fontSize: '9px', color: ACCENT, marginLeft: '8px', fontWeight: 600 }}>{ds.mode}</span>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: devColor, background: devColor + '15', padding: '2px 8px', borderRadius: '10px' }}>{ds.deviation > 0 ? '+' : ''}{ds.deviation}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                          <span>SP: {ds.setpoint} {ds.unit}</span>
                          <span>PV: <strong style={{ color: '#1e293b' }}>{ds.actual}</strong> {ds.unit}</span>
                        </div>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(ds.actual / (ds.setpoint * 1.2)) * 100}%`, background: devColor, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                        </div>
                      </div>
                      <div style={{ width: '80px' }}>
                        <AreaChart data={ds.trend} color={devColor} height={22} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Raw Mill Parameters */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Raw Mill Operating Parameters</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
                {rawMillParams.map((p, i) => {
                  const stColor = p.status === 'ok' ? '#16a34a' : '#f59e0b'
                  return (
                    <div key={p.label} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{p.label}</span>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: stColor, background: stColor + '15', padding: '2px 6px', borderRadius: '4px' }}>{p.status === 'ok' ? 'OK' : 'WATCH'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={Math.abs(p.value)} /></span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{p.unit}</span>
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Target: {p.target} {p.unit}</div>
                    </div>
                  )
                })}
              </div>
              {/* Mill Summary */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap' }}>
                <div><span style={s.tinyLabel}>Mill Status </span><span style={{ ...s.tinyVal, color: '#16a34a' }}>Running</span></div>
                <div><span style={s.tinyLabel}>Run Hours </span><span style={s.tinyVal}>6,842</span></div>
                <div><span style={s.tinyLabel}>Production </span><span style={s.tinyVal}>298 TPH</span></div>
                <div><span style={s.tinyLabel}>Power </span><span style={s.tinyVal}>3,200 kW</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ AI OPTIMIZATION ═══════════════ */}
      {show('ai') && (
        <Section title="AI Material & Fuel Optimization" badge="On-Premise LLM + ML" icon="AI">
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>AI-Generated Recommendations</div>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>Models: Raw Mix NN, Fuel Predictor, Inventory AI, Material Quality LLM</span>
            </div>
            {aiOptimizations.map((rec, i) => {
              const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#16a34a' }
              const pc = pColors[rec.priority]
              return (
                <div key={i} style={{
                  display: 'flex', gap: '14px', padding: '16px', marginBottom: '10px',
                  background: '#f8fafc', borderRadius: '10px', border: `1px solid ${pc}20`, borderLeft: `3px solid ${pc}`,
                  animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: pc, background: pc + '15', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{rec.priority}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{rec.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6, marginBottom: '8px' }}>{rec.reason}</div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>{rec.impact}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>Model: {rec.model}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: ACCENT }}>Confidence: {rec.confidence}%</span>
                    </div>
                  </div>
                  <button style={{ ...s.actionBtn, flexShrink: 0, alignSelf: 'center' }}>Apply</button>
                </div>
              )
            })}
          </div>

          {/* Data sovereignty */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', padding: '12px 16px', background: '#16a34a08', borderRadius: '8px', border: '1px solid #16a34a20' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#16a34a15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>All AI Processing On-Premise</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5 }}>
                XRF analyzer data, dosing setpoints, and fuel blend optimization run on local edge nodes. Material Quality LLM (7B) deployed on-premise A100 GPU for natural language insights. Zero cloud dependency.
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ─── AI Footer ─── */}
      <AIFooter />
    </div>
  )
}

// ─── Section ───
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

// ─── AI Footer ───
function AIFooter() {
  const [ref, visible] = useScrollReveal(0.2)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={s.aiFooter}>
      <div style={s.aiFooterIcon}>AI</div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Raw Material & Fuel AI Summary</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          Monitoring 6 raw materials, 6 fuel sources, 8 silos, and 6 dosing feeders in AI auto mode.
          XRF cross-belt analyzer providing real-time oxide analysis every 60 seconds. LSF at 95.2 (target 95.0) — within range.
          TSR at 14.7% with opportunity to increase to 16.1%. Limestone stock at 3.7 days — procurement alert generated.
          Active models: Raw Mix Optimizer NN, Fuel Quality Predictor, Inventory AI, Material Quality LLM (on-premise 7B).
          All processing air-gapped on local edge nodes and A100 servers.
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },

  statusBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  statusItem: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '12px 16px', flex: 1, minWidth: '140px' },
  statusIcon: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 },
  statusLabel: { fontSize: '10px', color: '#94a3b8' },
  statusValue: { fontSize: '15px', fontWeight: 700, color: '#1e293b' },

  catBar: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' },
  catBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  catActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  catCount: { background: '#f1f5f9', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  catCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },

  row: { display: 'flex', gap: '14px' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' },
  miniCard: { background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #e8ecf1' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },

  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },

  actionBtn: { background: ACCENT, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },

  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}

export default RawMaterial
