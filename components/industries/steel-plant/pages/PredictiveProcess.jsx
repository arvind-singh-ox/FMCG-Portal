'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null); const [w, setW] = useState(200)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text></svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// PREDICTIVE PROCESS DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Active Predictions', value: '18', color: ACCENT },
  { label: 'Avg Accuracy', value: '95.4%', color: GREEN },
  { label: 'Changes Implemented', value: '12 today', color: GREEN },
  { label: 'Prevented Incidents', value: '3', color: RED },
  { label: 'Cost Savings Today', value: '₹28.5L', color: '#1e293b' },
  { label: 'Models Running', value: '14', color: BLUE },
]

// ── Ironmaking Predictions ──
const ironmakingPredictions = [
  {
    id: 'PRD-BF-01', process: 'BF Hot Metal Silicon [Si]', model: 'LSTM Time-Series',
    current: '0.45%', predicted: '0.52%', horizon: 'Next cast (~90 min)',
    confidence: 94, accuracy: 94.2, trend: [0.42, 0.44, 0.46, 0.45, 0.48, 0.50, 0.52],
    actual: [0.42, 0.44, 0.46, 0.45], status: 'warning',
    recommendation: 'Silicon trending up — indicates furnace running hotter. AI recommends: (1) Increase blast moisture by 3 g/Nm³, (2) Reduce O₂ enrichment by 0.3%. Expected correction within 2 casts.',
    impact: 'Prevent HM [Si] exceedance (spec: 0.30–0.60%)',
    inputs: 'Blast volume, HBT, coke rate, burden distribution, previous 8 casts Si/Mn/S',
  },
  {
    id: 'PRD-BF-02', process: 'BF Thermal State Index', model: 'Random Forest Ensemble',
    current: '0.72 (Stable)', predicted: '0.68 (Slight Cooling)', horizon: '4–6 hours',
    confidence: 88, accuracy: 91.5, trend: [0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.68],
    actual: [0.75, 0.74, 0.73, 0.72], status: 'info',
    recommendation: 'Mild cooling trend detected — not yet actionable. Monitor next 2 casts. If Si drops below 0.38%, increase coke rate by 5 kg/THM as preemptive measure.',
    impact: 'Early warning — 4 hrs lead time before manual detection',
    inputs: 'Tuyere brightness, gas analysis (ηCO), HM temp, coke quality (CSR/CRI), PCI burnout',
  },
  {
    id: 'PRD-BF-03', process: 'BF Hanging / Slip Risk', model: 'CFD + Anomaly Detection',
    current: 'Low (Score: 0.12)', predicted: 'Moderate (Score: 0.38)', horizon: '6 hours',
    confidence: 88, accuracy: 89.2, trend: [0.08, 0.10, 0.12, 0.15, 0.22, 0.30, 0.38],
    actual: [0.08, 0.10, 0.12], status: 'warning',
    recommendation: 'Gas flow asymmetry developing in NW quadrant (stockline radar). Burden descent variance: 15%. AI suggests adjusting charging angle by 2° to redistribute gas flow. Implement before next charging cycle.',
    impact: 'Prevent slip event — avoid 2 hrs recovery + tuyere damage risk',
    inputs: 'Stockline profile (4-point radar), pressure drop, gas temp distribution, burden descent rate',
  },
]

// ── Steelmaking Predictions ──
const steelmakingPredictions = [
  {
    id: 'PRD-BOF-01', process: 'BOF Endpoint Carbon [C]', model: 'XGBoost + Thermodynamic',
    current: '0.08% (mid-blow)', predicted: '0.04% (at endpoint)', horizon: '8 min (end of blow)',
    confidence: 97, accuracy: 97.2, trend: [0.45, 0.32, 0.22, 0.14, 0.08, 0.06, 0.04],
    actual: [0.45, 0.32, 0.22, 0.14, 0.08], status: 'normal',
    recommendation: 'On track for target [C] = 0.04%. Current O₂ flow optimal. Predicted blow end at 16.2 min. No lance adjustment needed. Mn recovery predicted at 72%.',
    impact: 'First-hit accuracy 97.2% — eliminates re-blowing, saves 1.8 min/heat',
    inputs: 'Off-gas CO/CO₂ ratio, sublance data, scrap mix, HM chemistry, lance height, O₂ flow',
  },
  {
    id: 'PRD-BOF-02', process: 'BOF Endpoint Temperature', model: 'Neural Network',
    current: '1,580°C (mid-blow)', predicted: '1,652°C (at endpoint)', horizon: '8 min',
    confidence: 96, accuracy: 96.1, trend: [1480, 1510, 1540, 1560, 1580, 1615, 1652],
    actual: [1480, 1510, 1540, 1560, 1580], status: 'normal',
    recommendation: 'Temperature on target (aim: 1,650°C ± 10°C). No coolant (ore/scrap) addition required. Heat H-1044 proceeding optimally.',
    impact: 'Temperature hit rate: 96.1% — avoids post-blow cooling delays',
    inputs: 'Bath temperature trajectory, exothermic heat balance, coolant additions, off-gas enthalpy',
  },
  {
    id: 'PRD-LF-01', process: 'Ladle Furnace — Desulphurization Prediction', model: 'Thermodynamic + ML',
    current: '[S] = 0.018%', predicted: '[S] = 0.008% after treatment', horizon: '12 min (LF treatment)',
    confidence: 92, accuracy: 93.8, trend: [0.025, 0.022, 0.018, 0.015, 0.012, 0.010, 0.008],
    actual: [0.025, 0.022, 0.018], status: 'normal',
    recommendation: 'CaO-Al₂O₃ slag conditioning on track. Predicted slag basicity: 3.8 (optimal for desulphurization). Argon stir rate adequate at 180 L/min. Final [S] = 0.008% meets S355J2 spec (<0.015%).',
    impact: 'Avoids re-treatment — saves 8 min LF time, prevents ladle skull buildup',
    inputs: 'Slag composition (XRF), metal temp, Ar flow, wire injection (CaSi), treatment time',
  },
]

// ── Casting Predictions ──
const castingPredictions = [
  {
    id: 'PRD-CC-01', process: 'Breakout Prediction', model: 'CNN + Thermocouple Pattern',
    current: 'Risk: 0.02%', predicted: 'Safe — no sticker pattern detected', horizon: 'Continuous (200ms)',
    confidence: 99, accuracy: 99.1, trend: [0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.02],
    actual: [0.01, 0.01, 0.02, 0.01, 0.02], status: 'normal',
    recommendation: 'All 4 strands operating normally. Mold thermocouple patterns within safe envelope. No sticker / hanger signatures detected. 8 breakouts prevented this year by this model.',
    impact: 'Single breakout costs ₹50L–1Cr + 8 hrs downtime. Model ROI: ₹4Cr/year',
    inputs: '96 mold thermocouples (per strand), mold level, casting speed, mold flux feed rate',
  },
  {
    id: 'PRD-CC-02', process: 'Slab Centerline Segregation', model: 'Solidification FEM + NN',
    current: 'C 1.0 (current settings)', predicted: 'C 0.8 (with EMS adjustment)', horizon: 'Next sequence',
    confidence: 93, accuracy: 94.5, trend: [1.2, 1.1, 1.0, 1.0, 0.9, 0.85, 0.8],
    actual: [1.2, 1.1, 1.0, 1.0], status: 'info',
    recommendation: 'For upcoming API 5L X65 sequence (tighter spec: ≤ C 1.0), increase mold EMS to 340A and final EMS to 480A. Model predicts C 0.8 segregation rating — 20% margin below spec limit.',
    impact: 'Ensure API grade internal quality compliance',
    inputs: 'Chemistry, superheat, casting speed, EMS current/frequency, secondary cooling profile',
  },
  {
    id: 'PRD-CC-03', process: 'Surface Defect Rate Prediction', model: 'CNN Vision + Process Correlation',
    current: '0.32%', predicted: '0.28% (after oscillation adjustment)', horizon: 'Next 2 hours',
    confidence: 91, accuracy: 92.8, trend: [0.45, 0.42, 0.38, 0.35, 0.32, 0.30, 0.28],
    actual: [0.45, 0.42, 0.38, 0.35, 0.32], status: 'normal',
    recommendation: 'Increase mold oscillation from 120 cpm to 135 cpm for current grade. AI analysis of 340 similar heats shows 22% reduction in oscillation marks. No impact on mold flux consumption.',
    impact: 'Defect rate: 0.32% → 0.28% — fewer surface conditioning required',
    inputs: 'CNN defect images (240K training set), oscillation parameters, mold flux type, casting speed',
  },
]

// ── Rolling Predictions ──
const rollingPredictions = [
  {
    id: 'PRD-RM-01', process: 'Mechanical Properties (ReH, Rm)', model: 'Microstructure-Property NN',
    current: 'ReH: 415 MPa | Rm: 520 MPa', predicted: 'ReH: 418 MPa | Rm: 524 MPa (next coil)', horizon: 'Per coil (~3 min)',
    confidence: 94, accuracy: 94.8, trend: [410, 412, 415, 418, 416, 418, 418],
    actual: [410, 412, 415], status: 'normal',
    recommendation: 'Properties on target for S355J2 (ReH ≥ 355 MPa). Current FDT 862°C and coiling temp 580°C produce fine ferrite-pearlite structure. No adjustment needed.',
    impact: 'First-coil-right rate: 98.4% — eliminates test coils and re-rolling',
    inputs: 'Chemistry, slab reheat temp, reduction schedule, FDT, coiling temp, cooling rate (ROT)',
  },
  {
    id: 'PRD-RM-02', process: 'Roll Force & Torque Prediction', model: 'Physics-Informed NN',
    current: 'F3: 28,500 kN | Torque: 142 kNm', predicted: 'F3: 29,200 kN for next gauge change (8mm → 6mm)', horizon: '15 min (next schedule)',
    confidence: 96, accuracy: 96.2, trend: [25200, 26800, 28500, 29200, 30100, 31500, 32800],
    actual: [25200, 26800, 28500], status: 'info',
    recommendation: 'Gauge change to 6mm will increase F3 force by 2.5%. AGC pre-set values updated. Roll wear compensation applied. No concern for roll force limit (35,000 kN).',
    impact: 'Reduces first-bar gauge deviation from ±0.08mm to ±0.04mm',
    inputs: 'Slab temp profile, reduction ratio per stand, roll gap, strip speed, work roll diameter',
  },
  {
    id: 'PRD-RM-03', process: 'Roll Wear & Campaign Life', model: 'Regression + Fatigue Model',
    current: 'Work roll wear: 0.42mm (of 4mm max)', predicted: 'Roll change needed at coil #285 (current: #218)', horizon: '67 coils (~3.4 hrs)',
    confidence: 89, accuracy: 91.2, trend: [0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48],
    actual: [0.12, 0.18, 0.24, 0.30, 0.36, 0.42], status: 'normal',
    recommendation: 'Roll change scheduled at coil #285 (3.4 hrs). Crown compensation active — CVC shifting at 12mm/coil. Surface roughness (Ra) still within spec at 1.8μm (limit: 2.5μm).',
    impact: 'Optimal roll change timing — no premature change, no quality loss',
    inputs: 'Rolled tonnage, strip width distribution, rolling force history, thermal crown model',
  },
]

// ── Cross-Process Predictions ──
const crossProcessPredictions = [
  {
    id: 'PRD-XP-01', process: 'Hot Metal → Steel → Slab Quality Chain', model: 'End-to-End Ensemble',
    prediction: 'Current HM chemistry (Si: 0.45%, S: 0.025%) + BOF blow plan → predicted slab [C]: 0.18%, [Mn]: 1.42%. Mechanical property forecast: ReH 415 MPa, Rm 520 MPa. Grade compliance: 99.2%.',
    confidence: 92, status: 'normal',
  },
  {
    id: 'PRD-XP-02', process: 'Energy-Production Optimization', model: 'Multi-Objective Optimizer',
    prediction: 'Shifting BOF heat schedule by 8 min aligns with off-peak grid tariff window (14:00–16:00). Simultaneously increases BF gas utilization by 2.4% through better Power Plant coordination. Net saving: ₹6.2L/day.',
    confidence: 90, status: 'normal',
  },
  {
    id: 'PRD-XP-03', process: 'Weather Impact on Operations', model: 'Weather-Process Correlation',
    prediction: 'Monsoon onset predicted in 12 days. AI models forecast: coal moisture +2.2% (coking time +3 min), sinter permeability -8%, conveyor belt slippage risk +15%. Pre-emptive actions recommended.',
    confidence: 85, status: 'info',
  },
]

// ── Model Performance Dashboard ──
const modelPerformance = [
  { model: 'BF Silicon Predictor', type: 'LSTM', accuracy: 94.2, mae: '0.038% Si', retrainCycle: '24 hrs', lastRetrain: '6 hrs ago', dataPoints: '18,400 casts', drift: 'None' },
  { model: 'BOF Endpoint (C)', type: 'XGBoost', accuracy: 97.2, mae: '0.005% C', retrainCycle: '12 hrs', lastRetrain: '2 hrs ago', dataPoints: '12,600 heats', drift: 'None' },
  { model: 'BOF Endpoint (T)', type: 'Neural Net', accuracy: 96.1, mae: '6.2°C', retrainCycle: '12 hrs', lastRetrain: '2 hrs ago', dataPoints: '12,600 heats', drift: 'None' },
  { model: 'Breakout Prediction', type: 'CNN', accuracy: 99.1, mae: 'N/A (binary)', retrainCycle: '7 days', lastRetrain: '3 days ago', dataPoints: '2.4M frames', drift: 'None' },
  { model: 'Mech. Properties (ReH)', type: 'NN', accuracy: 94.8, mae: '8.2 MPa', retrainCycle: '48 hrs', lastRetrain: '18 hrs ago', dataPoints: '42,000 coils', drift: 'None' },
  { model: 'Surface Defect CNN', type: 'ResNet-50', accuracy: 97.8, mae: 'N/A (classification)', retrainCycle: '14 days', lastRetrain: '5 days ago', dataPoints: '240K images', drift: 'Minimal' },
  { model: 'Roll Force Predictor', type: 'Physics-NN', accuracy: 96.2, mae: '420 kN', retrainCycle: '24 hrs', lastRetrain: '8 hrs ago', dataPoints: '85,000 passes', drift: 'None' },
  { model: 'Gas Network Optimizer', type: 'LP', accuracy: 98.1, mae: '12 Nm³/min', retrainCycle: 'Real-time', lastRetrain: 'Continuous', dataPoints: 'Live stream', drift: 'N/A' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function PredictiveProcess() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Predictions' },
    { key: 'iron', label: 'Ironmaking' },
    { key: 'steel', label: 'Steelmaking' },
    { key: 'cast', label: 'Casting' },
    { key: 'roll', label: 'Rolling' },
    { key: 'cross', label: 'Cross-Process' },
    { key: 'models', label: 'Model Performance' },
  ]

  const renderPrediction = (p, i) => {
    const statusColors = { normal: GREEN, warning: AMBER, info: BLUE, critical: RED }
    const sc = statusColors[p.status]
    return (
      <div key={p.id} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{p.id}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: sc, background: `${sc}15`, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>{p.status}</span>
              <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{p.model}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{p.process}</div>
          </div>
          <DonutChart value={p.confidence} max={100} size={52} strokeWidth={5} color={p.confidence > 93 ? GREEN : ACCENT} />
        </div>

        {/* Current → Predicted */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>CURRENT</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{p.current}</div>
          </div>
          <div style={{ padding: '10px 12px', background: `${ACCENT}08`, borderRadius: '8px', border: `1px solid ${ACCENT}20` }}>
            <div style={{ fontSize: '9px', color: ACCENT, fontWeight: 600, marginBottom: '3px' }}>PREDICTED</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>{p.predicted}</div>
          </div>
          <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>HORIZON</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.horizon}</div>
          </div>
        </div>

        {/* Trend Chart */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>Actual (solid) + Predicted (dotted)</div>
            <AreaChart data={p.trend} color={sc} height={40} />
          </div>
          <div style={{ width: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Accuracy</span><span style={{ fontWeight: 700, color: GREEN }}>{p.accuracy}%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Confidence</span><span style={{ fontWeight: 700, color: ACCENT }}>{p.confidence}%</span></div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div style={{ padding: '10px 12px', background: `${ACCENT}06`, borderRadius: '8px', border: `1px solid ${ACCENT}15`, marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px' }}>AI</span>
            <span style={{ fontSize: '10px', color: ACCENT, fontWeight: 700 }}>RECOMMENDED ACTION</span>
          </div>
          <div style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.6' }}>{p.recommendation}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
          <span style={{ color: '#94a3b8' }}>Impact: <strong style={{ color: GREEN }}>{p.impact}</strong></span>
          <span style={{ color: '#94a3b8' }}>Inputs: {p.inputs.substring(0, 60)}...</span>
        </div>
      </div>
    )
  }

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

      <div style={st.header}>
        <div>
          <h1 style={st.title}>Predictive Process Changes</h1>
          <p style={st.sub}>AI predictions for process adjustments based on real-time data — Integrated Steel Plant</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> 14 Models Active</span>
          <span style={st.aiBadge}>Prediction Engine: 95.4% avg accuracy</span>
          <span style={st.timeBadge}>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {show('iron') && (
        <Section title="Ironmaking Predictions" badge="Blast Furnace" icon="BF">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{ironmakingPredictions.map(renderPrediction)}</div>
        </Section>
      )}

      {show('steel') && (
        <Section title="Steelmaking Predictions" badge="BOF + Ladle Furnace" icon="SM">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{steelmakingPredictions.map(renderPrediction)}</div>
        </Section>
      )}

      {show('cast') && (
        <Section title="Casting Predictions" badge="Continuous Caster" icon="CC">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{castingPredictions.map(renderPrediction)}</div>
        </Section>
      )}

      {show('roll') && (
        <Section title="Rolling Predictions" badge="Hot Strip Mill" icon="RM">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{rollingPredictions.map(renderPrediction)}</div>
        </Section>
      )}

      {show('cross') && (
        <Section title="Cross-Process Predictions" badge="End-to-End Intelligence" icon="XP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {crossProcessPredictions.map((p, i) => {
              const sc = p.status === 'normal' ? GREEN : BLUE
              return (
                <div key={p.id} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{p.id}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{p.process}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{p.model}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: GREEN }}>{p.confidence}%</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.6', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>{p.prediction}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {show('models') && (
        <Section title="Model Performance Dashboard" badge="8 Production Models" icon="MP">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 80px 80px 100px 60px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Model', 'Type', 'Accuracy', 'MAE', 'Retrain', 'Last Trained', 'Data Points', 'Drift'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {modelPerformance.map((m, i) => (
              <div key={m.model} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 80px 80px 80px 100px 60px', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.05}s both`, borderLeft: `3px solid ${m.accuracy > 96 ? GREEN : ACCENT}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.model}</div>
                <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 500 }}>{m.type}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: GREEN }}>{m.accuracy}%</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{m.mae}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{m.retrainCycle}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{m.lastRetrain}</div>
                <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500 }}>{m.dataPoints}</div>
                <div><span style={{ fontSize: '9px', fontWeight: 600, color: m.drift === 'None' ? GREEN : AMBER, background: (m.drift === 'None' ? GREEN : AMBER) + '15', padding: '2px 6px', borderRadius: '10px' }}>{m.drift}</span></div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Predictive Process Changes</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            14 production AI models running across ironmaking, steelmaking, casting, and rolling. Average prediction accuracy: 95.4%.
            Key models: LSTM silicon predictor (94.2%), XGBoost BOF endpoint (97.2%), CNN breakout prediction (99.1%, 8 breakouts prevented this year),
            Microstructure-property NN (94.8%), Physics-informed roll force predictor (96.2%).
            12 AI-recommended process changes implemented today — combined savings: ₹28.5L. 3 incidents prevented through early prediction.
            All models within drift tolerance. Next batch retraining: 4 hours.
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
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
