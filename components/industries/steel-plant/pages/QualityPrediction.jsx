'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => { const duration = 1400, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
}

function AreaChart({ data, color, height = 50 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(200)
  useEffect(() => { const el = containerRef.current; if (!el) return; const ro = new ResizeObserver(([e]) => setCWidth(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1, w = cWidth
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gradId = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={containerRef} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gradId})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} /><text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span></div><div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => { const duration = 1400, start = performance.now(); const step = (now) => { const p = Math.min((now - start) / duration, 1); setAnimScale(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [data])
  const cx = size / 2, cy = size / 2, r = size / 2 - 24, n = data.length, angle = (2 * Math.PI) / n
  const getPoint = (i, val) => { const a = angle * i - Math.PI / 2, dist = (val / 100) * r * animScale; return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) } }
  return (<svg width={size} height={size}>{[25, 50, 75, 100].map(lv => <polygon key={lv} points={Array.from({ length: n }, (_, i) => { const a = angle * i - Math.PI / 2, d = (lv / 100) * r; return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}` }).join(' ')} fill="none" stroke="#e8ecf1" strokeWidth="0.5" />)}{data.map((_, i) => { const a = angle * i - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" /> })}<polygon points={data.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}` }).join(' ')} fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />{data.map((d, i) => { const p = getPoint(i, d.value), lp = { x: cx + (r + 16) * Math.cos(angle * i - Math.PI / 2), y: cy + (r + 16) * Math.sin(angle * i - Math.PI / 2) }; return <g key={i}><circle cx={p.x} cy={p.y} r="3" fill={ACCENT} /><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text></g> })}</svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL QUALITY DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Grade Compliance', value: '98.4%', color: '#10b981' },
  { label: 'First-Pass Yield', value: '96.8%', color: ACCENT },
  { label: 'Defect Rate', value: '0.32%', color: '#10b981' },
  { label: 'Heats On-Spec', value: '47 / 48', color: '#1e293b' },
  { label: 'Active Grade', value: 'S355J2', color: ACCENT },
  { label: 'AI Prediction Accuracy', value: '97.2%', color: '#10b981' },
]

// ── Chemical Composition (Ladle Analysis) ──
const chemistryTarget = { grade: 'S355J2', spec: 'EN 10025-2' }
const chemistryData = [
  { element: 'C', actual: 0.18, aim: 0.17, min: 0.14, max: 0.20, unit: '%', predicted: 0.175, trend: [0.19, 0.18, 0.17, 0.18, 0.19, 0.17, 0.18] },
  { element: 'Mn', actual: 1.42, aim: 1.45, min: 1.30, max: 1.60, unit: '%', predicted: 1.44, trend: [1.38, 1.40, 1.44, 1.42, 1.45, 1.43, 1.42] },
  { element: 'Si', actual: 0.35, aim: 0.35, min: 0.20, max: 0.55, unit: '%', predicted: 0.34, trend: [0.32, 0.34, 0.36, 0.35, 0.33, 0.35, 0.35] },
  { element: 'S', actual: 0.008, aim: 0.010, min: 0, max: 0.015, unit: '%', predicted: 0.009, trend: [0.012, 0.010, 0.009, 0.008, 0.010, 0.009, 0.008] },
  { element: 'P', actual: 0.012, aim: 0.015, min: 0, max: 0.025, unit: '%', predicted: 0.013, trend: [0.015, 0.014, 0.013, 0.012, 0.014, 0.013, 0.012] },
  { element: 'Cr', actual: 0.08, aim: 0.08, min: 0, max: 0.15, unit: '%', predicted: 0.08, trend: [0.09, 0.08, 0.08, 0.08, 0.07, 0.08, 0.08] },
  { element: 'Ni', actual: 0.05, aim: 0.05, min: 0, max: 0.10, unit: '%', predicted: 0.05, trend: [0.06, 0.05, 0.05, 0.05, 0.04, 0.05, 0.05] },
  { element: 'Cu', actual: 0.12, aim: 0.12, min: 0, max: 0.35, unit: '%', predicted: 0.12, trend: [0.14, 0.13, 0.12, 0.12, 0.11, 0.12, 0.12] },
  { element: 'Al', actual: 0.032, aim: 0.030, min: 0.020, max: 0.050, unit: '%', predicted: 0.031, trend: [0.028, 0.030, 0.032, 0.031, 0.033, 0.032, 0.032] },
  { element: 'N', actual: 0.006, aim: 0.007, min: 0, max: 0.012, unit: '%', predicted: 0.006, trend: [0.008, 0.007, 0.006, 0.006, 0.007, 0.006, 0.006] },
]

// ── Mechanical Properties ──
const mechanicalData = [
  { property: 'Yield Strength (ReH)', actual: 415, aim: 400, min: 355, max: 500, unit: 'MPa', predicted: 418, trend: [405, 410, 418, 415, 420, 412, 415] },
  { property: 'Tensile Strength (Rm)', actual: 520, aim: 510, min: 470, max: 630, unit: 'MPa', predicted: 522, trend: [508, 515, 522, 520, 525, 518, 520] },
  { property: 'Elongation (A5)', actual: 22.4, aim: 22, min: 20, max: 35, unit: '%', predicted: 22.1, trend: [21.5, 22.0, 22.8, 22.4, 22.2, 22.6, 22.4] },
  { property: 'Charpy Impact (-20°C)', actual: 148, aim: 140, min: 27, max: 250, unit: 'J', predicted: 145, trend: [135, 142, 150, 148, 145, 152, 148] },
  { property: 'Hardness (HBW)', actual: 162, aim: 160, min: 140, max: 190, unit: 'HBW', predicted: 163, trend: [158, 160, 164, 162, 165, 160, 162] },
  { property: 'Rm/ReH Ratio', actual: 1.25, aim: 1.27, min: 1.10, max: 1.45, unit: '', predicted: 1.25, trend: [1.25, 1.26, 1.25, 1.25, 1.25, 1.26, 1.25] },
]

// ── Surface Defect Detection (CNN) ──
const surfaceDefects = [
  { type: 'Longitudinal Cracks', count: 0, severity: 'none', lastDetected: '—', color: '#10b981' },
  { type: 'Transverse Cracks', count: 0, severity: 'none', lastDetected: '—', color: '#10b981' },
  { type: 'Edge Cracks', count: 1, severity: 'minor', lastDetected: '2 hrs ago', color: '#f59e0b' },
  { type: 'Scale Pits', count: 3, severity: 'minor', lastDetected: '45 min ago', color: '#f59e0b' },
  { type: 'Roll Marks', count: 0, severity: 'none', lastDetected: '—', color: '#10b981' },
  { type: 'Scratches', count: 2, severity: 'cosmetic', lastDetected: '1.5 hr ago', color: '#3b82f6' },
  { type: 'Inclusions (Surface)', count: 0, severity: 'none', lastDetected: '—', color: '#10b981' },
  { type: 'Decarburization', count: 0, severity: 'none', lastDetected: '—', color: '#10b981' },
]

const defectRateTrend = [0.45, 0.42, 0.38, 0.35, 0.40, 0.36, 0.32, 0.35, 0.33, 0.30, 0.34, 0.32]

// ── Internal Quality (Ultrasonic) ──
const internalQuality = [
  { test: 'Centerline Segregation', rating: 'C 1.0', spec: '≤ C 1.5', status: 'pass', method: 'Mannesmann rating' },
  { test: 'Center Porosity', rating: 'C 0.5', spec: '≤ C 1.0', status: 'pass', method: 'Mannesmann rating' },
  { test: 'Inclusions (Macro)', rating: 'Clean', spec: 'Clean', status: 'pass', method: 'Baumann print' },
  { test: 'Inclusion Rating (Micro)', rating: 'A: 0.5, B: 1.0, C: 0, D: 0.5', spec: 'Each ≤ 1.5', status: 'pass', method: 'ASTM E45 Method A' },
  { test: 'Ultrasonic (Slab)', rating: '100% pass', spec: 'No echo > 50% DAC', status: 'pass', method: 'EN 10160 S2/E2' },
  { test: 'Grain Size (ASTM)', rating: '8.5', spec: '≥ 7.0', status: 'pass', method: 'ASTM E112' },
]

// ── Steel Grade Specifications Library ──
const gradeLibrary = [
  { grade: 'S355J2', spec: 'EN 10025-2', c: '≤0.20', mn: '≤1.60', reH: '≥355', rm: '470–630', a5: '≥20', charpy: '27J @ -20°C', active: true },
  { grade: 'S275JR', spec: 'EN 10025-2', c: '≤0.21', mn: '≤1.50', reH: '≥275', rm: '410–560', a5: '≥21', charpy: '27J @ +20°C', active: false },
  { grade: 'API 5L X65', spec: 'API 5L PSL2', c: '≤0.16', mn: '≤1.65', reH: '≥450', rm: '535–760', a5: '≥18', charpy: '27J @ -10°C', active: false },
  { grade: 'S460ML', spec: 'EN 10025-4', c: '≤0.16', mn: '≤1.70', reH: '≥460', rm: '540–720', a5: '≥17', charpy: '27J @ -50°C', active: false },
  { grade: 'ASTM A572 Gr50', spec: 'ASTM A572', c: '≤0.23', mn: '≤1.35', reH: '≥345', rm: '≥450', a5: '≥18', charpy: '—', active: false },
]

// ── Process Parameters Affecting Quality ──
const processInfluencers = [
  { param: 'Tundish Superheat', value: '22°C', target: '20–30°C', influence: 'Centerline segregation, inclusion flotation', status: 'good' },
  { param: 'Casting Speed', value: '1.35 m/min', target: '1.2–1.5 m/min', influence: 'Surface cracks, breakout risk', status: 'good' },
  { param: 'Mold Oscillation', value: '135 cpm', target: '120–150 cpm', influence: 'Oscillation marks, mold flux entrapment', status: 'good' },
  { param: 'Secondary Cooling', value: '0.82 L/kg', target: '0.75–0.90 L/kg', influence: 'Internal cracks, bulging', status: 'good' },
  { param: 'EMS (Electromagnetic Stirring)', value: '320 A', target: '280–350 A', influence: 'Equiaxed zone, segregation', status: 'good' },
  { param: 'Soft Reduction', value: '6.2 mm', target: '5–8 mm', influence: 'Center porosity, segregation', status: 'good' },
  { param: 'Reheat Furnace Temp', value: '1,240°C', target: '1220–1260°C', influence: 'Scale formation, grain size', status: 'good' },
  { param: 'Finishing Mill Temp', value: '862°C', target: '840–880°C', influence: 'Yield strength, grain refinement', status: 'good' },
  { param: 'Coiling Temperature', value: '580°C', target: '560–620°C', influence: 'Microstructure, mechanical properties', status: 'good' },
  { param: 'Cooling Rate (ROT)', value: '18°C/s', target: '15–25°C/s', influence: 'Phase transformation, strength', status: 'good' },
]

// ── Quality Radar ──
const qualityRadar = [
  { label: 'Chemistry', value: 96 },
  { label: 'Tensile', value: 93 },
  { label: 'Elongation', value: 91 },
  { label: 'Impact', value: 94 },
  { label: 'Surface', value: 88 },
  { label: 'Internal', value: 95 },
]

// ── SPC Control Charts Data ──
const spcData = {
  carbon: { values: [0.19, 0.18, 0.17, 0.18, 0.19, 0.17, 0.18, 0.16, 0.18, 0.17, 0.19, 0.18, 0.17, 0.18, 0.18], ucl: 0.20, lcl: 0.14, cl: 0.17 },
  yieldStrength: { values: [405, 410, 418, 415, 420, 412, 415, 408, 422, 416, 410, 415, 418, 412, 415], ucl: 500, lcl: 355, cl: 400 },
  tensile: { values: [508, 515, 522, 520, 525, 518, 520, 512, 528, 521, 516, 520, 524, 518, 520], ucl: 630, lcl: 470, cl: 510 },
}

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'Adjust Mn addition by +0.03% for next heat', reason: 'Yield strength prediction for heat H-1046 shows 408 MPa — near lower spec (355 MPa is minimum, but customer requires ≥400 MPa). Increasing Mn by 0.03% will raise predicted ReH to 418 MPa with 96% confidence.', impact: 'ReH +10 MPa, compliance assured', model: 'XGBoost Mechanical Predictor', confidence: 96 },
  { priority: 'high', title: 'Increase EMS current to 340A for API grade sequence', reason: 'Upcoming API 5L X65 grade requires tighter centerline segregation control (≤ C 1.0). Current EMS at 320A adequate for S355, but API requires higher stirring for equiaxed solidification.', impact: 'Segregation improvement: C 1.0 → C 0.5', model: 'Solidification Model', confidence: 93 },
  { priority: 'medium', title: 'Lower coiling temperature to 560°C for improved impact', reason: 'Charpy impact energy at -20°C trending downward (148J vs 152J last week). Lowering coiling temp by 20°C promotes finer ferrite-pearlite microstructure with better toughness.', impact: 'Charpy improvement: +12J predicted', model: 'Microstructure-Property NN', confidence: 89 },
  { priority: 'medium', title: 'Scale pit defect cluster detected — check descaler #2', reason: 'CNN vision system detected 3 scale pits in last 2 hours, all localized to strip center. Pattern correlates with descaler #2 nozzle pressure drop. Inspect nozzle bank B2-3 to B2-7.', impact: 'Surface defect rate: 0.32% → 0.18%', model: 'CNN Defect Detector v4.2', confidence: 91 },
  { priority: 'low', title: 'Optimize Al wire feed for N-control', reason: 'Nitrogen at 60 ppm — within spec but trending up from 55 ppm baseline. Increasing Al addition by 0.002% will improve AlN precipitation and lock free N, maintaining aging resistance.', impact: 'Free N reduction: 8 ppm', model: 'Thermodynamic Calculator', confidence: 87 },
]

// ── Certification & Test Status ──
const certStatus = [
  { test: 'Chemical Analysis (OES)', status: 'Complete', result: 'Pass', lab: 'Primary Lab', time: '12 min ago' },
  { test: 'Tensile Test', status: 'Complete', result: 'Pass', lab: 'Mechanical Lab', time: '28 min ago' },
  { test: 'Charpy Impact Test', status: 'Complete', result: 'Pass', lab: 'Mechanical Lab', time: '35 min ago' },
  { test: 'Hardness Test', status: 'Complete', result: 'Pass', lab: 'Mechanical Lab', time: '40 min ago' },
  { test: 'UT Inspection', status: 'In Progress', result: '—', lab: 'NDT Bay', time: 'ETA 15 min' },
  { test: 'Surface Inspection (Vision)', status: 'Complete', result: 'Pass (minor)', lab: 'Inline CNN', time: 'Real-time' },
  { test: 'Dimensional Check', status: 'Complete', result: 'Pass', lab: 'Gauge Station', time: '8 min ago' },
  { test: 'Mill Test Certificate', status: 'Pending UT', result: '—', lab: 'Auto-Gen', time: 'ETA 20 min' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function QualityPrediction() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Parameters' },
    { key: 'chemistry', label: 'Chemistry' },
    { key: 'mechanical', label: 'Mechanical' },
    { key: 'surface', label: 'Surface & Internal' },
    { key: 'spc', label: 'SPC Charts' },
    { key: 'process', label: 'Process Influence' },
    { key: 'grades', label: 'Grade Library' },
    { key: 'cert', label: 'Certification' },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scrollReveal { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .scroll-hidden { opacity:0; transform:translateY(40px); }
        .scroll-visible { animation:scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Quality Prediction & Control</h1>
          <p style={st.sub}>AI-based quality prediction, defect detection & SPC — Grade: {chemistryTarget.grade} ({chemistryTarget.spec})</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live QC</span>
          <span style={st.aiBadge}>Prediction AI: 97.2% accuracy</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ CHEMISTRY ═══ */}
      {show('chemistry') && (
        <Section title="Chemical Composition — Ladle Analysis" badge={`Grade: ${chemistryTarget.grade}`} icon="CH">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {chemistryData.map((c, i) => {
                  const range = c.max - c.min
                  const pos = ((c.actual - c.min) / range) * 100
                  const aimPos = ((c.aim - c.min) / range) * 100
                  const inSpec = c.actual >= c.min && c.actual <= c.max
                  return (
                    <div key={c.element} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #f1f5f9', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{c.element}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 600, color: inSpec ? '#10b981' : '#ef4444', background: inSpec ? '#f0fdf4' : '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>{inSpec ? 'IN SPEC' : 'OUT'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{c.actual}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{c.unit}</span>
                        <span style={{ fontSize: '10px', color: ACCENT, fontWeight: 600, marginLeft: 'auto' }}>AI: {c.predicted}</span>
                      </div>
                      {/* Spec range bar */}
                      <div style={{ position: 'relative', height: '8px', background: '#e8ecf1', borderRadius: '4px', overflow: 'visible', marginBottom: '4px' }}>
                        <div style={{ position: 'absolute', left: 0, width: '100%', height: '100%', background: '#dcfce7', borderRadius: '4px' }} />
                        <div style={{ position: 'absolute', left: `${Math.max(pos - 2, 0)}%`, width: '4px', height: '12px', top: '-2px', background: ACCENT, borderRadius: '2px' }} title={`Actual: ${c.actual}`} />
                        <div style={{ position: 'absolute', left: `${aimPos}%`, top: '-1px', width: '2px', height: '10px', background: '#94a3b8', borderRadius: '1px' }} title={`Aim: ${c.aim}`} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                        <span>{c.min}</span>
                        <span>Aim: {c.aim}</span>
                        <span>{c.max}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ ...st.card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={st.cardLabel}>Quality Radar</div>
              <RadarChart data={qualityRadar} size={200} />
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Overall Quality Score: 93 / 100</div>
              <div style={{ marginTop: '16px', width: '100%' }}>
                <div style={st.cardLabel}>Carbon Trend (Last 7 Heats)</div>
                <AreaChart data={chemistryData[0].trend} color={ACCENT} height={60} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ MECHANICAL ═══ */}
      {show('mechanical') && (
        <Section title="Mechanical Properties" badge="Lab Tested + AI Predicted" icon="MP">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {mechanicalData.map((m, i) => {
              const inSpec = m.actual >= m.min && m.actual <= m.max
              return (
                <div key={m.property} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.property}</span>
                    <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>IN SPEC</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{m.actual}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                    <span>AI Predicted: <strong style={{ color: ACCENT }}>{m.predicted}</strong></span>
                    <span>Spec: {m.min}–{m.max}</span>
                  </div>
                  <AreaChart data={m.trend} color={ACCENT} height={40} />
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ SURFACE & INTERNAL ═══ */}
      {show('surface') && (
        <>
          <Section title="Surface Defect Detection (CNN Vision)" badge="4 Cameras Active" icon="SD">
            <div style={st.row}>
              <div style={{ ...st.card, flex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {surfaceDefects.map((d, i) => (
                    <div key={d.type} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center', animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${d.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '16px', fontWeight: 800, color: d.color }}>{d.count}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{d.type}</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: d.color, textTransform: 'uppercase' }}>{d.severity}</div>
                      {d.lastDetected !== '—' && <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{d.lastDetected}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ ...st.card, marginTop: '14px', padding: '14px' }}>
                  <div style={st.cardLabel}>Defect Rate Trend (%) — Last 12 Shifts</div>
                  <AreaChart data={defectRateTrend} color={ACCENT} height={60} />
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 0.32%</span></div>
                    <div><span style={st.tinyLabel}>Best</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 0.30%</span></div>
                    <div><span style={st.tinyLabel}>Target</span><span style={st.tinyVal}> &lt;0.50%</span></div>
                    <div><span style={st.tinyLabel}>Trend</span><span style={{ ...st.tinyVal, color: '#10b981' }}> -29% month</span></div>
                  </div>
                </div>
              </div>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Internal Quality — Last Slab</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {internalQuality.map((q, i) => (
                    <div key={q.test} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{q.test}</span>
                        <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>PASS</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                        <span style={{ color: ACCENT, fontWeight: 600 }}>{q.rating}</span>
                        <span style={{ color: '#94a3b8' }}>{q.method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ SPC CHARTS ═══ */}
      {show('spc') && (
        <Section title="Statistical Process Control Charts" badge="Western Electric Rules" icon="SP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Carbon [C] (%)', data: spcData.carbon, color: ACCENT },
              { label: 'Yield Strength ReH (MPa)', data: spcData.yieldStrength, color: '#10b981' },
              { label: 'Tensile Strength Rm (MPa)', data: spcData.tensile, color: '#3b82f6' },
            ].map((chart, ci) => (
              <div key={chart.label} style={{ ...st.card, animation: `slideIn 0.7s ease ${ci * 0.12}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{chart.label}</span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                    <span style={{ color: '#ef4444' }}>UCL: {chart.data.ucl}</span>
                    <span style={{ color: '#94a3b8' }}>CL: {chart.data.cl}</span>
                    <span style={{ color: '#3b82f6' }}>LCL: {chart.data.lcl}</span>
                  </div>
                </div>
                {/* SPC Chart SVG */}
                <svg width="100%" viewBox="0 0 600 120" preserveAspectRatio="none" style={{ display: 'block' }}>
                  {/* UCL / CL / LCL lines */}
                  <line x1="0" y1="10" x2="600" y2="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                  {/* Data line */}
                  <polyline
                    points={chart.data.values.map((v, i) => {
                      const x = (i / (chart.data.values.length - 1)) * 580 + 10
                      const y = 110 - ((v - chart.data.lcl) / (chart.data.ucl - chart.data.lcl)) * 100
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none" stroke={chart.color} strokeWidth="2" strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {chart.data.values.map((v, i) => {
                    const x = (i / (chart.data.values.length - 1)) * 580 + 10
                    const y = 110 - ((v - chart.data.lcl) / (chart.data.ucl - chart.data.lcl)) * 100
                    return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={chart.color} strokeWidth="2" />
                  })}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Heat 1</span><span>Heat 15 (Latest)</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ PROCESS INFLUENCE ═══ */}
      {show('process') && (
        <Section title="Process Parameters Affecting Quality" badge="10 Key Influencers" icon="PI">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {processInfluencers.map((p, i) => (
              <div key={p.param} style={{ ...st.card, display: 'flex', gap: '12px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderLeft: '3px solid #10b981' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{p.param}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.4' }}>Influences: {p.influence}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}>{p.value}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Target: {p.target}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ GRADE LIBRARY ═══ */}
      {show('grades') && (
        <Section title="Steel Grade Specifications Library" badge="5 Grades Configured" icon="GL">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 80px 80px 80px 100px 80px 100px 60px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Grade', 'Standard', 'C max', 'Mn max', 'ReH min', 'Rm range', 'A5 min', 'Charpy', 'Status'].map(h => (
                <div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
              ))}
            </div>
            {gradeLibrary.map((g, i) => (
              <div key={g.grade} style={{ display: 'grid', gridTemplateColumns: '100px 100px 80px 80px 80px 100px 80px 100px 60px', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.08}s both`, background: g.active ? `${ACCENT}06` : '#fff', borderLeft: g.active ? `3px solid ${ACCENT}` : '3px solid transparent' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: g.active ? ACCENT : '#1e293b' }}>{g.grade}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{g.spec}</div>
                <div style={{ fontSize: '11px', color: '#1e293b' }}>{g.c}</div>
                <div style={{ fontSize: '11px', color: '#1e293b' }}>{g.mn}</div>
                <div style={{ fontSize: '11px', color: '#1e293b' }}>{g.reH}</div>
                <div style={{ fontSize: '11px', color: '#1e293b' }}>{g.rm}</div>
                <div style={{ fontSize: '11px', color: '#1e293b' }}>{g.a5}</div>
                <div style={{ fontSize: '10px', color: '#1e293b' }}>{g.charpy}</div>
                <div>{g.active ? <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>ACTIVE</span> : <span style={{ fontSize: '8px', color: '#94a3b8' }}>—</span>}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ CERTIFICATION ═══ */}
      {show('cert') && (
        <Section title="Test & Certification Status" badge="Mill Test Certificate" icon="TC">
          <div style={st.card}>
            {certStatus.map((c, i) => {
              const statusColor = c.status === 'Complete' ? '#10b981' : c.status === 'In Progress' ? '#f59e0b' : '#94a3b8'
              return (
                <div key={c.test} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{c.test}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{c.lab}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{c.status}</span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: c.result === 'Pass' ? '#10b981' : c.result === 'Pass (minor)' ? '#f59e0b' : '#94a3b8' }}>{c.result}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>{c.time}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Quality Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
            return (
              <div key={i} style={{ ...st.card, borderLeft: `4px solid ${priColors[rec.priority]}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: priColors[rec.priority], padding: '2px 6px', borderRadius: '3px' }}>{rec.priority}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{rec.model}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#4a5568', lineHeight: '1.6' }}>{rec.reason}</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: <strong style={{ color: ACCENT }}>{rec.confidence}%</strong></span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Impact: <strong style={{ color: '#10b981' }}>{rec.impact}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Quality Prediction & Control</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Active models: XGBoost mechanical property predictor (ReH accuracy ±8 MPa, Rm ±12 MPa), CNN surface defect detector v4.2 (precision 97.8%, recall 96.1%),
            Thermodynamic inclusion predictor, Neural network microstructure-property mapper, SPC anomaly detector with Western Electric rules.
            Grade compliance this month: 98.4% (1,247 / 1,267 heats). Surface defect rate reduced 29% vs. last month through AI-guided descaler and oscillation optimization.
            Mill test certificates auto-generated for 94% of shipments. Next model retraining: 6 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

const st = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  row: { display: 'flex', gap: '14px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
