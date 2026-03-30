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
// DIGITAL TWIN DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Twin Sync Status', value: 'Real-Time', color: GREEN },
  { label: 'Sensor Streams', value: '4,128', color: ACCENT },
  { label: 'Sync Latency', value: '1.5 ms', color: GREEN },
  { label: 'Model Accuracy', value: '96.4%', color: GREEN },
  { label: 'Active Simulations', value: '3', color: BLUE },
  { label: 'What-If Scenarios', value: '12 saved', color: '#1e293b' },
]

// ── Plant 3D Zone Map (simulated) ──
const plantZones3D = [
  { id: 'coke-oven', name: 'Coke Oven Battery', x: 5, y: 15, w: 14, h: 25, temp: 1100, status: 'normal', health: 92, sensors: 186, throughput: '1,420 T/day' },
  { id: 'sinter', name: 'Sinter Plant', x: 22, y: 15, w: 14, h: 25, temp: 1250, status: 'normal', health: 90, sensors: 142, throughput: '5,800 T/day' },
  { id: 'bf1', name: 'Blast Furnace #1', x: 39, y: 8, w: 10, h: 38, temp: 2150, status: 'warning', health: 86, sensors: 380, throughput: '9,847 T/day' },
  { id: 'bf2', name: 'Blast Furnace #2', x: 52, y: 8, w: 10, h: 38, temp: 2120, status: 'normal', health: 94, sensors: 340, throughput: '8,520 T/day' },
  { id: 'bof', name: 'BOF / SMS', x: 65, y: 15, w: 14, h: 25, temp: 1650, status: 'normal', health: 91, sensors: 420, throughput: '265 T/heat' },
  { id: 'caster', name: 'Caster #1 & #2', x: 82, y: 15, w: 14, h: 25, temp: 1520, status: 'normal', health: 89, sensors: 280, throughput: '238 TPH' },
  { id: 'hsm', name: 'Hot Strip Mill', x: 22, y: 55, w: 18, h: 22, temp: 1240, status: 'critical', health: 78, sensors: 320, throughput: '218 TPH' },
  { id: 'power', name: 'Power Plant', x: 44, y: 55, w: 14, h: 22, temp: 540, status: 'normal', health: 95, sensors: 165, throughput: '182 MW' },
  { id: 'asu', name: 'O₂ / N₂ Plant', x: 62, y: 55, w: 12, h: 22, temp: 25, status: 'normal', health: 96, sensors: 110, throughput: '2,800 Nm³/hr' },
  { id: 'stockyard', name: 'Stockyard', x: 78, y: 55, w: 16, h: 22, temp: 35, status: 'normal', health: 98, sensors: 85, throughput: '128,400 MT' },
]

// ── Live Process Flow ──
const processFlow = [
  { stage: 'Coal', next: 'Coke Oven', flow: '4,200 T/day', status: 'normal' },
  { stage: 'Coke Oven', next: 'Blast Furnace', flow: 'Coke: 3,280 T + COG', status: 'normal' },
  { stage: 'Sinter Plant', next: 'Blast Furnace', flow: 'Sinter: 5,800 T/day', status: 'normal' },
  { stage: 'Blast Furnace', next: 'BOF', flow: 'Hot Metal: 285 TPH', status: 'warning' },
  { stage: 'BOF', next: 'Caster', flow: 'Liquid Steel: 265 T/heat', status: 'normal' },
  { stage: 'Caster', next: 'Hot Strip Mill', flow: 'Slabs: 238 TPH', status: 'normal' },
  { stage: 'Hot Strip Mill', next: 'Finished Goods', flow: 'HRC/Plates: 218 TPH', status: 'critical' },
]

// ── Real-Time Physics Models ──
const physicsModels = [
  { name: 'BF Thermal Model', type: 'CFD + Heat Transfer', inputs: '128 thermocouples + blast params', output: 'Cohesive zone profile, refractory thickness map', accuracy: 94.2, latency: '2.8s', syncRate: '500ms', status: 'Running' },
  { name: 'BF Mass & Energy Balance', type: 'Rist Diagram + Stoichiometric', inputs: 'Burden comp, gas analysis, HM analysis', output: 'Fuel rate prediction, slag volume, ηCO', accuracy: 96.8, latency: '1.2s', syncRate: '30s', status: 'Running' },
  { name: 'BOF Endpoint Predictor', type: 'XGBoost + Thermodynamic', inputs: 'Sublance, off-gas CO/CO₂, scrap mix', output: '[C], [T] at endpoint, blow-end time', accuracy: 97.2, latency: '0.8s', syncRate: 'Per heat', status: 'Running' },
  { name: 'Solidification Model', type: 'FEM + Neural Network', inputs: 'Casting speed, superheat, cooling spray', output: 'Shell thickness, breakout risk, segregation', accuracy: 95.5, latency: '1.5s', syncRate: '1s', status: 'Running' },
  { name: 'Rolling Schedule Optimizer', type: 'Reinforcement Learning', inputs: 'Slab temp, gauge target, mill setup', output: 'Roll gap, speed, cooling schedule per stand', accuracy: 93.8, latency: '4.2s', syncRate: 'Per coil', status: 'Running' },
  { name: 'Gas Network Optimizer', type: 'Linear Programming', inputs: 'Gas holders, consumers, flare status', output: 'Optimal gas distribution, min flaring', accuracy: 98.1, latency: '0.5s', syncRate: '10s', status: 'Running' },
  { name: 'Refractory Wear Tracker', type: 'Inverse Heat Transfer + CNN', inputs: 'Hearth/BOF TCs, campaign history', output: 'Remaining lining mm, erosion rate, failure ETA', accuracy: 91.4, latency: '5s', syncRate: '1 min', status: 'Running' },
  { name: 'Microstructure-Property Map', type: 'Phase Field + Neural Network', inputs: 'Chemistry, rolling temps, cooling rate', output: 'Predicted ReH, Rm, elongation, grain size', accuracy: 94.8, latency: '3.5s', syncRate: 'Per coil', status: 'Running' },
]

// ── What-If Scenarios ──
const whatIfScenarios = [
  { id: 'WIF-01', name: 'Increase PCI to 180 kg/THM', created: '18 Mar', user: 'Process Team', status: 'Completed', result: 'Coke saving: 12 kg/THM. RAFT stable at 2,185°C. BF gas CV drops 3% — Power Plant turbine can compensate. Net benefit: ₹14.2L/day.', delta: { cokeRate: -12, fuelRate: -4, raft: +5, co2: -180 } },
  { id: 'WIF-02', name: 'Switch to 100% pellet burden', created: '17 Mar', user: 'Process Team', status: 'Completed', result: 'Not feasible. Permeability improves 18% but slag basicity drops below 1.0. Requires 42% more limestone, negating cost benefit. Recommend max 35% pellet.', delta: { cokeRate: -22, fuelRate: -15, slagRate: +85, co2: -420 } },
  { id: 'WIF-03', name: 'BF banking at current hearth state', created: '19 Mar', user: 'Maintenance', status: 'Running', result: 'Simulating 48-hour banking impact on hearth thermal profile. Preliminary: bottom temperature will drop 45°C, taphole region will stabilize. Restart ramp-up plan generated.', delta: null },
  { id: 'WIF-04', name: 'Reduce reheat furnace temp by 20°C for 8mm gauge', created: '19 Mar', user: 'Rolling Team', status: 'Completed', result: 'Feasible. FDT stays above 840°C. No impact on ReH (415 → 412 MPa, still above 355 min). Scale loss reduced 8%. Fuel saving: 3.2%.', delta: { fuelSaving: 3.2, scaleLoss: -8, reH: -3 } },
]

// ── Twin Sync Health ──
const syncHealth = [
  { system: 'DCS (Level 2)', streams: 2480, latency: '0.8ms', sync: 99.9, status: 'Online' },
  { system: 'PLC Network', streams: 1200, latency: '1.2ms', sync: 99.8, status: 'Online' },
  { system: 'SCADA Historian', streams: 4128, latency: '2.5ms', sync: 99.7, status: 'Online' },
  { system: 'Lab LIMS', streams: 85, latency: '45s', sync: 99.2, status: 'Online' },
  { system: 'Vision Cameras (AI)', streams: 48, latency: '85ms', sync: 99.5, status: 'Online' },
  { system: 'Weather Station', streams: 12, latency: '5s', sync: 100, status: 'Online' },
]

const syncLatencyTrend = [1.8, 1.6, 1.5, 1.4, 1.5, 1.6, 1.5, 1.4, 1.5, 1.5, 1.4, 1.5]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'Digital twin predicts BF slip event in next 6 hours', reason: 'CFD gas flow model detects asymmetric gas distribution developing in NW quadrant. Burden descent rate variance: 15% (threshold: 10%). Historical pattern match: 72% probability of slip event. Recommend preemptive burden distribution adjustment.', impact: 'Prevent slip — avoid 2 hrs recovery time', model: 'BF CFD + Pattern Matching', confidence: 88 },
  { priority: 'medium', title: 'Optimize BOF blow profile for current scrap mix', reason: 'Digital twin thermodynamic model shows current lance program is sub-optimal for 15% HMS scrap mix. Simulated alternative: lower lance 50mm for first 3 min, increase O₂ by 2 Nm³/T. Predicted improvement: blow time -1.2 min, Mn recovery +3%.', impact: 'Productivity gain: +0.8 heats/day', model: 'BOF Thermodynamic Twin', confidence: 92 },
  { priority: 'low', title: 'Caster digital twin — suggest EMS parameter change for API grade', reason: 'Solidification model predicts centerline segregation C 1.2 for upcoming API 5L X65 sequence at current EMS settings. Increasing mold EMS from 320A to 340A and final EMS from 450A to 480A will reduce to C 0.8.', impact: 'Internal quality improvement for high-spec grade', model: 'Solidification FEM Twin', confidence: 94 },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function DigitalTwin3D() {
  const [tab, setTab] = useState('twin')
  const [animKey, setAnimKey] = useState(0)
  const [selectedZone, setSelectedZone] = useState(null)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }

  const tabs = [
    { key: 'twin', label: '3D Plant View' },
    { key: 'models', label: 'Physics Models' },
    { key: 'whatif', label: 'What-If Scenarios' },
    { key: 'sync', label: 'Data Sync Health' },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 8px rgba(96,93,186,0.2); } 50% { box-shadow: 0 0 20px rgba(96,93,186,0.4); } }
        @keyframes scrollReveal { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .scroll-hidden { opacity:0; transform:translateY(40px); }
        .scroll-visible { animation:scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      <div style={st.header}>
        <div>
          <h1 style={st.title}>3D Real-Time Steel Plant Simulation</h1>
          <p style={st.sub}>AI-driven digital twin — interactive process visualization, physics models & predictive scenarios</p>
        </div>
        <div style={st.headerRight}>
          <span style={{ ...st.liveBadge, animation: 'glow 2s infinite' }}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Twin Synced</span>
          <span style={st.aiBadge}>8 Physics Models Active</span>
          <span style={st.timeBadge}>Sync: 1.5ms | {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ 3D PLANT VIEW ═══ */}
      {tab === 'twin' && (
        <>
          <Section title="Interactive Plant Digital Twin" badge="10 Process Zones — Live" icon="3D">
            <div style={{ position: 'relative', background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', borderRadius: '14px', padding: '24px', border: '1px solid #334155', overflow: 'hidden', minHeight: '340px' }}>
              {/* Grid overlay */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'linear-gradient(#605dba 1px, transparent 1px), linear-gradient(90deg, #605dba 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {/* Perspective text */}
              <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '10px', color: '#605dba80', fontWeight: 700, letterSpacing: '2px' }}>DIGITAL TWIN — INTEGRATED STEEL PLANT</div>
              <div style={{ position: 'absolute', top: '12px', right: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '9px', color: '#10b981', background: '#10b98120', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>LIVE 3D</span>
                <span style={{ fontSize: '9px', color: '#605dba', background: '#605dba20', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>4,128 Sensors</span>
              </div>

              {/* Process zones */}
              <div style={{ position: 'relative', height: '280px', marginTop: '20px' }}>
                {plantZones3D.map((zone, i) => {
                  const zoneColors = { normal: '#10b98180', warning: '#f59e0b80', critical: '#ef444480' }
                  const borderColors = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
                  const isSelected = selectedZone === zone.id
                  return (
                    <div key={zone.id} onClick={() => setSelectedZone(isSelected ? null : zone.id)} style={{
                      position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`,
                      background: isSelected ? `${ACCENT}30` : 'rgba(30,41,59,0.8)', border: `1.5px solid ${isSelected ? ACCENT : borderColors[zone.status]}`,
                      borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(4px)',
                      boxShadow: isSelected ? `0 0 20px ${ACCENT}40` : zone.status !== 'normal' ? `0 0 12px ${borderColors[zone.status]}30` : 'none',
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: '1.2' }}>{zone.name}</div>
                      <div style={{ fontSize: '8px', color: borderColors[zone.status], fontWeight: 600, marginTop: '3px' }}>{zone.health}% | {zone.temp.toLocaleString()}°C</div>
                      {zone.status !== 'normal' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: borderColors[zone.status], marginTop: '3px', animation: 'pulse 1.5s infinite' }} />}
                    </div>
                  )
                })}

                {/* Flow arrows (simplified) */}
                {[
                  { x1: 19, y1: 27, x2: 22, y2: 27 },
                  { x1: 36, y1: 27, x2: 39, y2: 27 },
                  { x1: 49, y1: 27, x2: 52, y2: 27 },
                  { x1: 62, y1: 27, x2: 65, y2: 27 },
                  { x1: 79, y1: 27, x2: 82, y2: 27 },
                  { x1: 39, y1: 46, x2: 32, y2: 55 },
                ].map((arrow, i) => (
                  <svg key={i} style={{ position: 'absolute', left: `${arrow.x1}%`, top: `${arrow.y1}%`, width: `${arrow.x2 - arrow.x1 + 2}%`, height: '10px', overflow: 'visible' }}>
                    <line x1="0" y1="5" x2="100%" y2="5" stroke="#605dba40" strokeWidth="2" strokeDasharray="4,3" />
                  </svg>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px', position: 'relative' }}>
                {[{ label: 'Normal', color: GREEN }, { label: 'Warning', color: AMBER }, { label: 'Critical', color: RED }, { label: 'Selected', color: ACCENT }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} /><span style={{ fontSize: '10px', color: '#94a3b8' }}>{l.label}</span></div>
                ))}
              </div>
            </div>

            {/* Selected Zone Detail */}
            {selectedZone && (() => {
              const zone = plantZones3D.find(z => z.id === selectedZone)
              if (!zone) return null
              const hColor = zone.health > 85 ? GREEN : zone.health > 70 ? AMBER : RED
              return (
                <div style={{ ...st.card, marginTop: '14px', borderLeft: `4px solid ${hColor}`, animation: 'fadeUp 0.5s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{zone.name}</div>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: hColor, background: `${hColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{zone.status.toUpperCase()}</span>
                    </div>
                    <DonutChart value={zone.health} max={100} size={60} strokeWidth={5} color={hColor} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{zone.health}%</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Health</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{zone.temp.toLocaleString()}°C</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Peak Temp</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{zone.sensors}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Sensors</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{zone.throughput}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Throughput</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: GREEN }}>99.8%</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Twin Sync</div></div>
                  </div>
                </div>
              )
            })()}
          </Section>

          {/* Process Flow */}
          <Section title="Live Material & Energy Flow" badge="End-to-End Tracking" icon="FL">
            <div style={st.card}>
              <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
                {processFlow.map((p, i) => {
                  const sc = p.status === 'critical' ? RED : p.status === 'warning' ? AMBER : GREEN
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                      <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: '8px', border: `1px solid ${sc}30`, borderTop: `3px solid ${sc}` }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{p.stage}</div>
                        <div style={{ fontSize: '9px', color: sc, fontWeight: 600, marginTop: '2px' }}>{p.flow}</div>
                      </div>
                      {i < processFlow.length - 1 && (
                        <svg width="20" height="16" viewBox="0 0 20 16" style={{ flexShrink: 0, margin: '0 2px' }}><polyline points="4,8 14,8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /><polyline points="10,4 14,8 10,12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ PHYSICS MODELS ═══ */}
      {tab === 'models' && (
        <Section title="Real-Time Physics & AI Models" badge="8 Active" icon="PM">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {physicsModels.map((m, i) => (
              <div key={m.name} style={{ ...st.card, borderLeft: `4px solid ${ACCENT}`, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{m.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 8px', borderRadius: '10px' }}>{m.status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{m.type}</div>
                  </div>
                  <DonutChart value={m.accuracy} max={100} size={52} strokeWidth={5} color={m.accuracy > 95 ? GREEN : ACCENT} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>INPUTS</div>
                    <div style={{ fontSize: '11px', color: '#1e293b' }}>{m.inputs}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>OUTPUTS</div>
                    <div style={{ fontSize: '11px', color: '#1e293b' }}>{m.output}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#64748b' }}>
                  <span>Accuracy: <strong style={{ color: GREEN }}>{m.accuracy}%</strong></span>
                  <span>Latency: <strong>{m.latency}</strong></span>
                  <span>Sync: <strong>{m.syncRate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ WHAT-IF SCENARIOS ═══ */}
      {tab === 'whatif' && (
        <Section title="What-If Scenario Simulator" badge={`${whatIfScenarios.length} Scenarios`} icon="WI">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {whatIfScenarios.map((s, i) => {
              const statusColor = s.status === 'Completed' ? GREEN : s.status === 'Running' ? ACCENT : '#94a3b8'
              return (
                <div key={s.id} style={{ ...st.card, borderLeft: `4px solid ${statusColor}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{s.id}</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{s.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#94a3b8' }}>
                      <div>Created: {s.created}</div>
                      <div>By: {s.user}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.6', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '8px' }}>{s.result}</div>
                  {s.delta && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {Object.entries(s.delta).map(([key, val]) => (
                        <span key={key} style={{ fontSize: '10px', fontWeight: 600, color: val < 0 ? GREEN : val > 0 ? AMBER : '#94a3b8', background: (val < 0 ? GREEN : val > 0 ? AMBER : '#94a3b8') + '12', padding: '3px 8px', borderRadius: '6px' }}>
                          {key}: {val > 0 ? '+' : ''}{val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, marginTop: '14px', textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Create New What-If Scenario</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Simulate process changes against the live digital twin before implementing on plant</div>
            <button style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Scenario</button>
          </div>
        </Section>
      )}

      {/* ═══ DATA SYNC HEALTH ═══ */}
      {tab === 'sync' && (
        <Section title="Digital Twin Data Sync Health" badge="All Systems Online" icon="SY">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 90px 80px 80px 80px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Data Source', 'Streams', 'Latency', 'Sync %', 'Status'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {syncHealth.map((s, i) => (
              <div key={s.system} style={{ display: 'grid', gridTemplateColumns: '180px 90px 80px 80px 80px', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.06}s both`, borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{s.system}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{s.streams.toLocaleString()}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: parseFloat(s.latency) > 10 ? AMBER : '#1e293b' }}>{s.latency}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: GREEN }}>{s.sync}%</div>
                <div><span style={{ fontSize: '9px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 8px', borderRadius: '10px' }}>{s.status}</span></div>
              </div>
            ))}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={st.cardLabel}>Sync Latency Trend (ms) — Last 12 Hours</div>
            <div style={{ marginTop: '8px' }}><AreaChart data={syncLatencyTrend} color={ACCENT} height={60} /></div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 1.5 ms</span></div>
              <div><span style={st.tinyLabel}>Average</span><span style={st.tinyVal}> 1.5 ms</span></div>
              <div><span style={st.tinyLabel}>P99</span><span style={st.tinyVal}> 2.8 ms</span></div>
              <div><span style={st.tinyLabel}>Uptime</span><span style={{ ...st.tinyVal, color: GREEN }}> 99.97%</span></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="Digital Twin AI Insights" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high: RED, medium: AMBER, low: GREEN }
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
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Impact: <strong style={{ color: GREEN }}>{rec.impact}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Digital Twin Engine — Integrated Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Real-time digital twin synchronized with 4,128 sensor streams at 1.5ms latency. 8 physics/AI models running continuously:
            BF thermal CFD, mass-energy balance, BOF endpoint predictor, solidification FEM, rolling RL optimizer, gas network LP, refractory CNN, microstructure mapper.
            Overall model accuracy: 96.4%. 12 what-if scenarios simulated this month — 3 implemented, generating ₹28L/day combined benefit.
            Twin uptime: 99.97%. Next planned model retraining: 4 hours.
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
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
