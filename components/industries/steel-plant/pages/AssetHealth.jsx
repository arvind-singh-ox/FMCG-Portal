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
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text><text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">Health</text></svg>)
}

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL PLANT CRITICAL ASSET DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Total Critical Assets', value: '42', color: ACCENT },
  { label: 'Overall Health Index', value: '88.4%', color: GREEN },
  { label: 'Assets at Risk', value: '4', color: RED },
  { label: 'MTBF (Avg)', value: '168 hrs', color: '#1e293b' },
  { label: 'MTTR (Avg)', value: '4.1 hrs', color: AMBER },
  { label: 'Availability', value: '97.2%', color: GREEN },
]

const criticalAssets = [
  {
    id: 'BF-01', name: 'Blast Furnace #1', area: 'Ironmaking', health: 86, availability: 99.2,
    status: 'Running', criticality: 'A — Line Critical',
    subAssets: [
      { name: 'Main Blower (5,200 kW)', health: 94, vib: 2.8, temp: 62, status: 'Normal', trend: [92, 93, 94, 93, 94, 94, 94] },
      { name: 'Hot Stove Battery (4 stoves)', health: 88, vib: 1.2, temp: 1340, status: 'Normal', trend: [86, 87, 88, 87, 88, 89, 88] },
      { name: 'TRT (Top Recovery Turbine)', health: 90, vib: 2.1, temp: 58, status: 'Normal', trend: [88, 89, 90, 89, 90, 91, 90] },
      { name: 'Charging System (Belt/Skip)', health: 82, vib: 3.5, temp: 48, status: 'Monitor', trend: [86, 85, 84, 83, 82, 82, 82] },
      { name: 'Hearth Refractory', health: 68, vib: 0, temp: 420, status: 'Warning', trend: [78, 76, 74, 72, 70, 68, 68] },
      { name: 'Cooling System (Staves)', health: 92, vib: 1.5, temp: 52, status: 'Normal', trend: [90, 91, 92, 91, 92, 92, 92] },
    ],
    kpis: { mtbf: 720, mttr: 2.8, oee: 94.2, failures12m: 3, pmCompliance: 96, costYTD: 4.2 },
  },
  {
    id: 'BOF-01', name: 'BOF Converter #1', area: 'Steelmaking', health: 91, availability: 96.8,
    status: 'Running', criticality: 'A — Line Critical',
    subAssets: [
      { name: 'Vessel & Trunnion Ring', health: 88, vib: 1.8, temp: 85, status: 'Normal', trend: [90, 89, 88, 89, 88, 88, 88] },
      { name: 'Oxygen Lance System', health: 92, vib: 2.2, temp: 68, status: 'Normal', trend: [90, 91, 92, 91, 92, 92, 92] },
      { name: 'Tilting Drive (Hydraulic)', health: 94, vib: 1.5, temp: 55, status: 'Normal', trend: [92, 93, 94, 93, 94, 94, 94] },
      { name: 'Fume Extraction Hood/ESP', health: 86, vib: 3.2, temp: 72, status: 'Normal', trend: [88, 87, 86, 87, 86, 86, 86] },
      { name: 'Refractory Lining (MgO-C)', health: 72, vib: 0, temp: 1650, status: 'Monitor', trend: [82, 80, 78, 76, 74, 72, 72] },
    ],
    kpis: { mtbf: 480, mttr: 3.5, oee: 88.5, failures12m: 5, pmCompliance: 94, costYTD: 6.8 },
  },
  {
    id: 'CCM-01', name: 'Continuous Caster #1', area: 'Casting', health: 89, availability: 97.5,
    status: 'Running', criticality: 'A — Line Critical',
    subAssets: [
      { name: 'Mold Assembly (Copper Plates)', health: 78, vib: 0.8, temp: 180, status: 'Monitor', trend: [85, 83, 81, 80, 79, 78, 78] },
      { name: 'Oscillation Mechanism', health: 92, vib: 1.8, temp: 52, status: 'Normal', trend: [90, 91, 92, 91, 92, 92, 92] },
      { name: 'Segment Rolls (8 segments)', health: 85, vib: 2.5, temp: 65, status: 'Normal', trend: [88, 87, 86, 85, 85, 85, 85] },
      { name: 'Tundish Car & Ladle Turret', health: 94, vib: 1.2, temp: 48, status: 'Normal', trend: [92, 93, 94, 93, 94, 94, 94] },
      { name: 'Secondary Cooling Sprays', health: 90, vib: 0.5, temp: 42, status: 'Normal', trend: [88, 89, 90, 89, 90, 90, 90] },
      { name: 'Strand Guide (Withdrawal Rolls)', health: 88, vib: 2.8, temp: 58, status: 'Normal', trend: [86, 87, 88, 87, 88, 88, 88] },
    ],
    kpis: { mtbf: 360, mttr: 4.2, oee: 91.8, failures12m: 6, pmCompliance: 92, costYTD: 8.5 },
  },
  {
    id: 'HSM-01', name: 'Hot Strip Mill', area: 'Rolling', health: 78, availability: 94.8,
    status: 'Warning', criticality: 'A — Line Critical',
    subAssets: [
      { name: 'Roughing Stand (R1-R2)', health: 86, vib: 3.2, temp: 65, status: 'Normal', trend: [88, 87, 86, 87, 86, 86, 86] },
      { name: 'Finishing Stands (F1-F7)', health: 71, vib: 5.8, temp: 82, status: 'Critical', trend: [82, 80, 78, 76, 74, 72, 71] },
      { name: 'Coiler #1 & #2', health: 88, vib: 2.4, temp: 55, status: 'Normal', trend: [86, 87, 88, 87, 88, 88, 88] },
      { name: 'Run-Out Table (ROT)', health: 92, vib: 1.8, temp: 48, status: 'Normal', trend: [90, 91, 92, 91, 92, 92, 92] },
      { name: 'Reheat Furnace (Walking Beam)', health: 84, vib: 2.2, temp: 1240, status: 'Normal', trend: [86, 85, 84, 85, 84, 84, 84] },
      { name: 'Descaler (High Pressure)', health: 80, vib: 3.5, temp: 52, status: 'Monitor', trend: [84, 83, 82, 81, 80, 80, 80] },
      { name: 'Hydraulic AGC System', health: 76, vib: 2.8, temp: 58, status: 'Monitor', trend: [82, 80, 78, 77, 76, 76, 76] },
    ],
    kpis: { mtbf: 120, mttr: 5.8, oee: 82.4, failures12m: 12, pmCompliance: 88, costYTD: 14.2 },
  },
  {
    id: 'COB-01', name: 'Coke Oven Battery #1', area: 'Coke Making', health: 92, availability: 98.5,
    status: 'Running', criticality: 'A — Line Critical',
    subAssets: [
      { name: 'Pusher Machine', health: 90, vib: 2.5, temp: 62, status: 'Normal', trend: [88, 89, 90, 89, 90, 90, 90] },
      { name: 'Quenching Car', health: 94, vib: 1.8, temp: 48, status: 'Normal', trend: [92, 93, 94, 93, 94, 94, 94] },
      { name: 'By-Product Plant', health: 88, vib: 2.2, temp: 55, status: 'Normal', trend: [86, 87, 88, 87, 88, 88, 88] },
      { name: 'Oven Battery (Refractory)', health: 95, vib: 0, temp: 1100, status: 'Normal', trend: [94, 95, 95, 95, 95, 95, 95] },
    ],
    kpis: { mtbf: 960, mttr: 2.2, oee: 96.2, failures12m: 2, pmCompliance: 98, costYTD: 2.8 },
  },
  {
    id: 'SNT-01', name: 'Sinter Plant', area: 'Ironmaking', health: 90, availability: 96.2,
    status: 'Running', criticality: 'B — Important',
    subAssets: [
      { name: 'Sinter Machine (Pallet)', health: 88, vib: 2.8, temp: 85, status: 'Normal', trend: [86, 87, 88, 87, 88, 88, 88] },
      { name: 'Ignition Hood', health: 92, vib: 1.5, temp: 1150, status: 'Normal', trend: [90, 91, 92, 91, 92, 92, 92] },
      { name: 'Sinter Cooler', health: 86, vib: 2.2, temp: 95, status: 'Normal', trend: [88, 87, 86, 87, 86, 86, 86] },
      { name: 'ESP (Electrostatic Precipitator)', health: 84, vib: 1.8, temp: 145, status: 'Normal', trend: [86, 85, 84, 85, 84, 84, 84] },
      { name: 'Main Exhaust Fan (2,800 kW)', health: 96, vib: 1.2, temp: 58, status: 'Normal', trend: [94, 95, 96, 95, 96, 96, 96] },
    ],
    kpis: { mtbf: 520, mttr: 3.8, oee: 90.5, failures12m: 4, pmCompliance: 95, costYTD: 3.5 },
  },
]

// ── Anomaly Detection ──
const anomalies = [
  { time: '8 min ago', asset: 'HSM-01 / F3 Stand', type: 'Vibration Anomaly', severity: 'critical', value: '5.8 mm/s (limit: 4.5)', ai: 'BPFI pattern at 142 Hz — bearing inner-race defect. Failure predicted in 72 hrs.', model: 'LSTM Envelope Analysis', confidence: 92 },
  { time: '25 min ago', asset: 'BF-01 / Hearth', type: 'Thermal Anomaly', severity: 'warning', value: 'TC-14 at 420°C (+8°C/week)', ai: 'Taphole region refractory at 62%. Erosion rate accelerating. Recommend shifting cast pattern.', model: 'Inverse Heat Transfer CNN', confidence: 89 },
  { time: '1 hr ago', asset: 'CCM-01 / Mold Plates', type: 'Wear Prediction', severity: 'warning', value: 'Copper plate wear 78% (1,850 heats)', ai: 'Mold life prediction: 220 heats remaining before surface roughness exceeds limit. Schedule change in next campaign break.', model: 'Mold Life Regression', confidence: 91 },
  { time: '2 hr ago', asset: 'BOF-01 / Refractory', type: 'Lining Wear', severity: 'warning', value: 'Barrel zone 185mm remaining (start: 350mm)', ai: 'Campaign at heat #1,420 of estimated 1,800. Slag splashing frequency should increase to extend life by 150 heats.', model: 'Refractory Wear NN', confidence: 88 },
  { time: '3 hr ago', asset: 'HSM-01 / Descaler', type: 'Pressure Drop', severity: 'info', value: 'Nozzle bank #2: 280 bar (spec: 320 bar)', ai: 'Nozzle clogging detected via flow pattern analysis. Schedule cleaning during next roll change.', model: 'Flow Anomaly Detection', confidence: 85 },
  { time: '4 hr ago', asset: 'HSM-01 / AGC Hydraulic', type: 'Oil Contamination', severity: 'info', value: 'ISO 4406: 20/18/15 (target: 18/16/13)', ai: 'Particle count trending up — filter bypass valve may be leaking. Oil analysis confirms 12% degradation.', model: 'Oil Analysis AI', confidence: 82 },
]

// ── Maintenance KPIs ──
const maintenanceKPIs = [
  { label: 'PM Compliance', value: 93.8, target: 95, unit: '%', trend: [90, 91, 92, 93, 93, 94, 93, 94, 93, 94, 94, 94] },
  { label: 'MTBF (All Assets)', value: 168, target: 180, unit: 'hrs', trend: [150, 155, 158, 162, 165, 168, 170, 168, 165, 168, 170, 168] },
  { label: 'MTTR', value: 4.1, target: 3.5, unit: 'hrs', trend: [5.2, 4.8, 4.6, 4.4, 4.2, 4.1, 4.0, 4.1, 4.2, 4.1, 4.0, 4.1] },
  { label: 'Unplanned Downtime', value: 1.8, target: 1.5, unit: 'hrs/wk', trend: [3.2, 2.8, 2.5, 2.2, 2.0, 1.8, 1.7, 1.8, 1.9, 1.8, 1.7, 1.8] },
  { label: 'PdM Accuracy', value: 94.2, target: 95, unit: '%', trend: [88, 89, 90, 91, 92, 93, 94, 93, 94, 94, 94, 94] },
  { label: 'Maint. Cost (YTD)', value: 39.8, target: 42, unit: '₹ Cr', trend: [3.2, 6.5, 10.1, 14.2, 18.5, 22.8, 27.2, 31.5, 35.2, 37.8, 39.0, 39.8] },
]

// ── Failure Mode Distribution ──
const failureModes = [
  { mode: 'Bearing Failure', count: 18, pct: 28.6, color: RED },
  { mode: 'Refractory Wear', count: 12, pct: 19.0, color: AMBER },
  { mode: 'Hydraulic Leak', count: 8, pct: 12.7, color: BLUE },
  { mode: 'Electrical / VFD Trip', count: 7, pct: 11.1, color: ACCENT },
  { mode: 'Fatigue / Crack', count: 6, pct: 9.5, color: '#ea580c' },
  { mode: 'Corrosion / Erosion', count: 5, pct: 7.9, color: '#06b6d4' },
  { mode: 'Overheating', count: 4, pct: 6.3, color: '#f97316' },
  { mode: 'Others', count: 3, pct: 4.8, color: '#94a3b8' },
]

// ── Spare Parts Criticality ──
const criticalSpares = [
  { part: 'BF Tuyere Cooler Assembly', asset: 'BF-01', stock: 4, min: 4, leadTime: '8 weeks', status: 'OK' },
  { part: 'Rolling Mill Work Roll (HSS)', asset: 'HSM-01', stock: 6, min: 8, leadTime: '12 weeks', status: 'LOW' },
  { part: 'Caster Mold Copper Plate Set', asset: 'CCM-01', stock: 2, min: 4, leadTime: '6 weeks', status: 'LOW' },
  { part: 'BOF Lance Tip (Nozzle)', asset: 'BOF-01', stock: 12, min: 8, leadTime: '2 weeks', status: 'OK' },
  { part: 'Hot Stove Checker Bricks', asset: 'BF-01', stock: 2400, min: 2000, leadTime: '16 weeks', status: 'OK' },
  { part: 'F-Stand Bearing (NU 2340)', asset: 'HSM-01', stock: 1, min: 2, leadTime: '4 weeks', status: 'CRITICAL' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function AssetHealth({ defaultTab }) {
  const [tab, setTab] = useState(defaultTab === 'anomaly' ? 'anomaly' : 'assets')
  const [selectedAsset, setSelectedAsset] = useState('HSM-01')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }

  const currentAsset = criticalAssets.find(a => a.id === selectedAsset) || criticalAssets[3]

  const tabs = [
    { key: 'assets', label: 'Asset Fleet' },
    { key: 'detail', label: 'Asset Detail' },
    { key: 'anomaly', label: 'Anomaly Detection' },
    { key: 'kpis', label: 'Maintenance KPIs' },
    { key: 'failures', label: 'Failure Analysis' },
    { key: 'spares', label: 'Critical Spares' },
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

      <div style={st.header}>
        <div>
          <h1 style={st.title}>Critical Asset Health Monitoring</h1>
          <p style={st.sub}>AI-driven asset tracking, anomaly detection & predictive maintenance — 42 critical assets</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Monitoring</span>
          <span style={{ ...st.liveBadge, background: '#fef2f2', color: RED, border: '1px solid #fecaca' }}><span style={{ ...st.liveDot, background: RED, animation: 'pulse 1.5s infinite' }} /> 4 At Risk</span>
          <span style={st.aiBadge}>PdM AI: Active</span>
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

      {/* ═══ ASSET FLEET ═══ */}
      {tab === 'assets' && (
        <Section title="Critical Asset Fleet" badge="6 Line-Critical Units" icon="AF">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {criticalAssets.map((asset, i) => {
              const hColor = asset.health > 85 ? GREEN : asset.health > 70 ? AMBER : RED
              const isSelected = asset.id === selectedAsset
              return (
                <div key={asset.id} onClick={() => { setSelectedAsset(asset.id); switchTab('detail') }} style={{ ...st.card, cursor: 'pointer', animation: `slideIn 0.7s ease ${i * 0.08}s both`, border: isSelected ? `2px solid ${ACCENT}` : '1px solid #e8ecf1', borderTop: `3px solid ${hColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT }}>{asset.id}</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: asset.status === 'Running' ? GREEN : AMBER, background: (asset.status === 'Running' ? GREEN : AMBER) + '15', padding: '2px 6px', borderRadius: '10px' }}>{asset.status}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{asset.name}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{asset.area} | {asset.criticality}</div>
                    </div>
                    <DonutChart value={asset.health} max={100} size={56} strokeWidth={5} color={hColor} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '10px' }}>
                    <div><span style={{ color: '#94a3b8' }}>Availability</span><div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{asset.availability}%</div></div>
                    <div><span style={{ color: '#94a3b8' }}>MTBF</span><div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{asset.kpis.mtbf}h</div></div>
                    <div><span style={{ color: '#94a3b8' }}>Sub-Assets</span><div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{asset.subAssets.length}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ ASSET DETAIL ═══ */}
      {tab === 'detail' && (
        <Section title={`${currentAsset.id}: ${currentAsset.name} — Sub-Asset Health`} badge={currentAsset.area} icon="AD">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentAsset.subAssets.map((sa, i) => {
              const hColor = sa.health > 85 ? GREEN : sa.health > 70 ? AMBER : RED
              return (
                <div key={sa.name} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderLeft: `4px solid ${hColor}` }}>
                  <DonutChart value={sa.health} max={100} size={56} strokeWidth={5} color={hColor} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{sa.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: hColor, background: `${hColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{sa.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Vibration: <strong style={{ color: sa.vib > 4 ? AMBER : '#1e293b' }}>{sa.vib} mm/s</strong></span>
                      <span style={{ color: '#64748b' }}>Temp: <strong style={{ color: sa.temp > 100 ? AMBER : '#1e293b' }}>{sa.temp.toLocaleString()}°C</strong></span>
                    </div>
                  </div>
                  <div style={{ width: '140px' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>Health Trend (7 weeks)</div>
                    <AreaChart data={sa.trend} color={hColor} height={32} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>MTBF</span><span style={st.tinyVal}> {currentAsset.kpis.mtbf} hrs</span></div>
            <div><span style={st.tinyLabel}>MTTR</span><span style={st.tinyVal}> {currentAsset.kpis.mttr} hrs</span></div>
            <div><span style={st.tinyLabel}>OEE</span><span style={st.tinyVal}> {currentAsset.kpis.oee}%</span></div>
            <div><span style={st.tinyLabel}>Failures (12m)</span><span style={{ ...st.tinyVal, color: currentAsset.kpis.failures12m > 8 ? RED : '#1e293b' }}> {currentAsset.kpis.failures12m}</span></div>
            <div><span style={st.tinyLabel}>PM Compliance</span><span style={st.tinyVal}> {currentAsset.kpis.pmCompliance}%</span></div>
            <div><span style={st.tinyLabel}>Maint Cost YTD</span><span style={st.tinyVal}> ₹{currentAsset.kpis.costYTD}Cr</span></div>
          </div>
        </Section>
      )}

      {/* ═══ ANOMALY DETECTION ═══ */}
      {tab === 'anomaly' && (
        <Section title="AI Anomaly Detection" badge={`${anomalies.length} Active`} icon="AN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {anomalies.map((a, i) => {
              const sevColors = { critical: RED, warning: AMBER, info: BLUE }
              const sc = sevColors[a.severity]
              return (
                <div key={i} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: sc, padding: '2px 6px', borderRadius: '3px' }}>{a.severity}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{a.asset}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>• {a.type}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: sc, marginBottom: '6px' }}>Value: {a.value}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 12px', background: `${ACCENT}08`, borderRadius: '8px', border: `1px solid ${ACCENT}15` }}>
                    <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }}>AI</span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.6' }}>{a.ai}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Model: {a.model} | Confidence: <strong style={{ color: ACCENT }}>{a.confidence}%</strong></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ MAINTENANCE KPIs ═══ */}
      {tab === 'kpis' && (
        <Section title="Maintenance Performance KPIs" badge="12-Month Trend" icon="KP">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {maintenanceKPIs.map((kpi, i) => {
              const atTarget = kpi.label.includes('Cost') ? kpi.value <= kpi.target : (kpi.label.includes('MTTR') || kpi.label.includes('Downtime')) ? kpi.value <= kpi.target : kpi.value >= kpi.target
              const col = atTarget ? GREEN : AMBER
              return (
                <div key={kpi.label} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderTop: `3px solid ${col}` }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{kpi.label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{kpi.value}<span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}> {kpi.unit}</span></span>
                    <span style={{ fontSize: '10px', color: col, fontWeight: 600 }}>{atTarget ? '✓ On Target' : '⚠ Below Target'}</span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px' }}>Target: {kpi.target} {kpi.unit}</div>
                  <AreaChart data={kpi.trend} color={col} height={40} />
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ FAILURE ANALYSIS ═══ */}
      {tab === 'failures' && (
        <Section title="Failure Mode Distribution (Last 12 Months)" badge="63 Events Analyzed" icon="FA">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              {failureModes.map((f, i) => (
                <div key={f.mode} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: f.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{f.mode}</div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: '2px', transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{f.count}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{f.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Key Insights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {[
                  { insight: 'Bearing failures account for 28.6% of all breakdowns. Rolling mill contributes 67% of bearing failures.', action: 'AI vibration monitoring reduced bearing failures by 35% vs last year.' },
                  { insight: 'Refractory wear is second highest (19%). BF hearth and BOF lining drive most costs.', action: 'Inverse heat transfer model + slag splashing AI extended BOF campaign by 150 heats.' },
                  { insight: 'Hydraulic leaks (12.7%) mainly from HSM AGC system. Oil contamination trending up.', action: 'Recommend upgrading to servo-hydraulic valves with integrated leak detection.' },
                  { insight: 'Electrical/VFD trips (11.1%) correlate with voltage sag events during BF blower starts.', action: 'UPS installation on critical VFDs will eliminate 80% of nuisance trips.' },
                ].map((ins, i) => (
                  <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', animation: `slideIn 0.6s ease ${i * 0.1}s both` }}>
                    <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.5', marginBottom: '6px' }}>{ins.insight}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px' }}>AI</span>
                      <span style={{ fontSize: '10px', color: ACCENT, fontWeight: 500 }}>{ins.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ CRITICAL SPARES ═══ */}
      {tab === 'spares' && (
        <Section title="Critical Spare Parts Status" badge="Long-Lead Items" icon="SP">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px 90px 70px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Spare Part', 'Asset', 'Stock', 'Min', 'Lead Time', 'Status'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {criticalSpares.map((sp, i) => {
              const statusColor = sp.status === 'OK' ? GREEN : sp.status === 'LOW' ? AMBER : RED
              return (
                <div key={sp.part} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px 90px 70px', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.06}s both`, borderLeft: `3px solid ${statusColor}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{sp.part}</div>
                  <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{sp.asset}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: sp.stock < sp.min ? RED : '#1e293b' }}>{sp.stock}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{sp.min}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{sp.leadTime}</div>
                  <div><span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{sp.status}</span></div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Critical Asset Health Monitoring</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 42 critical assets with 4,128 sensor points. Active models: LSTM envelope analysis for vibration, Inverse heat transfer CNN for refractory,
            Mold life regression, Oil analysis AI, Refractory wear neural network, Flow anomaly detection.
            PdM accuracy: 94.2%. Unplanned downtime reduced 44% this year through AI-driven predictive maintenance.
            Bearing failures down 35%. BOF campaign extended 150 heats via AI slag splashing optimization. Total maintenance cost YTD: ₹39.8 Cr (5% under budget).
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
