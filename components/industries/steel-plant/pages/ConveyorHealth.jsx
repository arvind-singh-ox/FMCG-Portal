'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => { const duration = 1400, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [numVal])
  return <>{numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(decimals)}</>
}

function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null); const [w, setW] = useState(200)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function CameraFeed({ camera, detections, imageUrl, status }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', aspectRatio: '16/10' }}>
      <img src={imageUrl} alt={camera} onLoad={() => setLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 0.85 : 0, transition: 'opacity 0.6s ease' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {detections.map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="none" stroke={d.color || '#00ff88'} strokeWidth="2" strokeDasharray={d.type === 'alert' ? '6,3' : 'none'} rx="2"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" /></rect>
            <rect x={d.x} y={d.y} width={d.labelW || 90} height="16" fill={d.color || '#00ff88'} rx="2" opacity="0.9" transform="translate(0,-16)" />
            <text x={d.x} y={d.y} fontSize="10" fontWeight="700" fill="#000" dx="4" dy="-4">{d.label} {d.confidence}%</text>
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ background: status === 'Active' ? '#16a34a' : '#ef4444', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{camera}</span>
      </div>
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}><span style={{ fontSize: '9px', fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: '4px' }}>LIVE AI</span></div>
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '9px', color: '#94a3b8', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>{new Date().toLocaleTimeString()}</span>
        <span style={{ fontSize: '9px', color: '#00ff88', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>{detections.length} detections</span>
      </div>
    </div>
  )
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL PLANT CONVEYOR DATA
// ════════════════════════════════════════════════

const conveyorBelts = [
  { id: 'SC-01', name: 'Iron Ore Sinter Feed', length: 380, width: 1600, speed: 3.2, health: 92, load: 85, temp: 48, vibration: 2.4, status: 'Running', material: 'Iron Ore Fines', lastInspection: '2 days ago', nextMaint: '15 days' },
  { id: 'SC-02', name: 'Coke Breeze Transfer', length: 220, width: 1200, speed: 2.5, health: 88, load: 72, temp: 42, vibration: 2.8, status: 'Running', material: 'Coke Breeze', lastInspection: '3 days ago', nextMaint: '22 days' },
  { id: 'SC-03', name: 'BF Charge Conveyor', length: 450, width: 1800, speed: 2.8, health: 71, load: 88, temp: 72, vibration: 4.8, status: 'Warning', material: 'Mixed Burden', lastInspection: '8 days ago', nextMaint: '4 days' },
  { id: 'SC-04', name: 'Hot Slab Transfer Roller', length: 120, width: 2200, speed: 1.5, health: 84, load: 65, temp: 285, vibration: 3.2, status: 'Running', material: 'Hot Slabs (800–1200°C)', lastInspection: '1 day ago', nextMaint: '10 days' },
  { id: 'SC-05', name: 'Coal Yard to Coke Oven', length: 520, width: 1400, speed: 3.0, health: 94, load: 78, temp: 38, vibration: 1.9, status: 'Running', material: 'Coking Coal', lastInspection: '1 day ago', nextMaint: '28 days' },
  { id: 'SC-06', name: 'Slag Granulation Belt', length: 180, width: 1200, speed: 2.0, health: 76, load: 60, temp: 95, vibration: 3.8, status: 'Warning', material: 'BF Slag', lastInspection: '5 days ago', nextMaint: '8 days' },
  { id: 'SC-07', name: 'Pellet Stockyard Stacker', length: 340, width: 1600, speed: 2.6, health: 96, load: 70, temp: 35, vibration: 1.6, status: 'Running', material: 'Iron Ore Pellets', lastInspection: '2 days ago', nextMaint: '32 days' },
  { id: 'SC-08', name: 'Finished Product Dispatch', length: 280, width: 1400, speed: 2.2, health: 91, load: 55, temp: 32, vibration: 2.0, status: 'Running', material: 'HRC / Plates', lastInspection: '1 day ago', nextMaint: '25 days' },
]

const cameraFeeds = [
  {
    camera: 'CAM-01: Coal Yard Feed Belt',
    imageUrl: '/images/steel-plant/steel2.png',
    status: 'Active',
    detections: [
      { x: '10%', y: '30%', w: '35%', h: '30%', label: 'Belt OK', confidence: 96, color: '#00ff88', labelW: 85 },
      { x: '50%', y: '20%', w: '25%', h: '25%', label: 'Material', confidence: 94, color: '#3b82f6', labelW: 80 },
      { x: '15%', y: '65%', w: '20%', h: '15%', label: 'Roller OK', confidence: 97, color: '#00ff88', labelW: 80 },
    ],
  },
  {
    camera: 'CAM-02: Hot Slab Roller Table',
    imageUrl: '/images/steel-plant/steel1.png',
    status: 'Active',
    detections: [
      { x: '12%', y: '25%', w: '30%', h: '35%', label: 'Slab Temp OK', confidence: 92, color: '#00ff88', labelW: 100 },
      { x: '48%', y: '30%', w: '28%', h: '28%', label: 'Scale Detect', confidence: 85, color: '#f59e0b', type: 'alert', labelW: 95 },
      { x: '80%', y: '55%', w: '15%', h: '18%', label: 'Roller Wear', confidence: 78, color: '#ef4444', type: 'alert', labelW: 90 },
    ],
  },
  {
    camera: 'CAM-03: BF Charge Belt Surface',
    imageUrl: '/images/steel-plant/steel2.png',
    status: 'Active',
    detections: [
      { x: '20%', y: '35%', w: '30%', h: '25%', label: 'Edge Wear', confidence: 87, color: '#f59e0b', type: 'alert', labelW: 90 },
      { x: '55%', y: '40%', w: '25%', h: '22%', label: 'Belt Surface', confidence: 91, color: '#00ff88', labelW: 95 },
    ],
  },
  {
    camera: 'CAM-04: Slag Belt Thermal',
    imageUrl: '/images/steel-plant/steel1.png',
    status: 'Active',
    detections: [
      { x: '15%', y: '30%', w: '35%', h: '30%', label: 'Heat Zone', confidence: 93, color: '#ef4444', type: 'alert', labelW: 85 },
      { x: '55%', y: '45%', w: '20%', h: '20%', label: 'Belt OK', confidence: 95, color: '#00ff88', labelW: 75 },
    ],
  },
]

const aiDetections = [
  { time: '14:38:22', camera: 'CAM-02', belt: 'SC-04', type: 'Roller surface wear — groove depth 2.4mm', severity: 'warning', confidence: 88, action: 'Schedule roller replacement during next slab gap' },
  { time: '14:32:05', camera: 'CAM-03', belt: 'SC-03', type: 'Belt edge wear detected — 15mm from edge', severity: 'warning', confidence: 87, action: 'Track alignment and schedule trim in 4 days' },
  { time: '14:25:18', camera: 'CAM-04', belt: 'SC-06', type: 'Thermal hotspot — belt surface 112°C (limit: 120°C)', severity: 'warning', confidence: 93, action: 'Increase water spray on slag cooling section' },
  { time: '14:18:42', camera: 'CAM-02', belt: 'SC-04', type: 'Scale buildup on roller #18', severity: 'info', confidence: 85, action: 'Descaler nozzle check recommended' },
  { time: '14:05:11', camera: 'CAM-01', belt: 'SC-05', type: 'Foreign object detection (metal piece)', severity: 'critical', confidence: 82, action: 'Metal detector alarm triggered — belt stopped 45s, cleared' },
  { time: '13:48:30', camera: 'CAM-01', belt: 'SC-05', type: 'Splice joint #3 checked — normal', severity: 'ok', confidence: 96, action: 'No action needed' },
  { time: '13:32:15', camera: 'CAM-03', belt: 'SC-03', type: 'Material spillage at transfer chute #2', severity: 'info', confidence: 89, action: 'Skirt rubber replacement recommended' },
]

const beltWearProfile = [94, 92, 90, 88, 85, 82, 78, 72, 68, 65, 70, 74, 78, 82, 85, 88, 90, 92, 94, 93]

const spliceHealth = [
  { id: 'S1', position: '0m', type: 'Vulcanized (Hot)', health: 97, age: '3 months', lastCheck: '2 days ago' },
  { id: 'S2', position: '90m', type: 'Mechanical (Flexco)', health: 82, age: '10 months', lastCheck: '1 week ago' },
  { id: 'S3', position: '180m', type: 'Vulcanized (Hot)', health: 94, age: '5 months', lastCheck: '2 days ago' },
  { id: 'S4', position: '270m', type: 'Mechanical (Flexco)', health: 68, age: '14 months', lastCheck: '2 weeks ago' },
  { id: 'S5', position: '360m', type: 'Vulcanized (Cold)', health: 90, age: '2 months', lastCheck: '2 days ago' },
]

const rollerHealth = [
  { section: 'Head Pulley (Drive)', bearing: 62, vibration: 3.1, temp: 58, health: 86 },
  { section: 'Tail Pulley (Take-up)', bearing: 48, vibration: 2.0, temp: 44, health: 94 },
  { section: 'Snub Roller', bearing: 44, vibration: 1.6, temp: 40, health: 96 },
  { section: 'Bend Pulley', bearing: 52, vibration: 2.2, temp: 46, health: 92 },
  { section: 'Carry Idlers 1-15', bearing: 55, vibration: 2.8, temp: 50, health: 88 },
  { section: 'Carry Idlers 16-30', bearing: 72, vibration: 4.5, temp: 68, health: 70 },
  { section: 'Impact Idlers', bearing: 58, vibration: 3.6, temp: 55, health: 80 },
  { section: 'Return Idlers', bearing: 46, vibration: 1.8, temp: 42, health: 94 },
]

const materialFlow = {
  throughput: 385,
  target: 420,
  loadProfile: [360, 375, 390, 400, 415, 410, 395, 385, 400, 392, 388, 385],
  volumeScan: [78, 82, 86, 90, 94, 92, 88, 84, 90, 87, 85, 86],
}

const steelConveyorChallenges = [
  { challenge: 'High Temperature Exposure', desc: 'Slag & hot slab belts operate near 100–300°C, causing accelerated rubber degradation and splice failure.', mitigation: 'Heat-resistant EP800/4 belt with ceramic lagging. AI thermal monitoring for hotspot detection.' },
  { challenge: 'Abrasive Material (Iron Ore / Sinter)', desc: 'Iron ore fines and sinter cause 3x faster wear vs limestone. Belt surface erosion rate: 0.8mm/month.', mitigation: 'AR400 wear-resistant covers. CNN surface analyzer tracks wear zones weekly.' },
  { challenge: 'Metal Contamination (Tramp Iron)', desc: 'Stray metal pieces in burden can puncture belts and damage idlers. Average 2.3 events/week.', mitigation: 'Electromagnetic separator + AI metal detector (response time <200ms).' },
  { challenge: 'Corrosive Environment (Slag / Gas)', desc: 'BF gas area conveyors exposed to CO, SO₂, and moisture causing corrosion of idler bearings.', mitigation: 'Sealed bearings (IP68), corrosion-resistant frames. Vibration AI detects early bearing corrosion.' },
]

const predictiveAlerts = [
  { belt: 'SC-03', component: 'Belt Surface (Zone 8-10)', prediction: 'Surface degradation reaching critical threshold in ~12 days at current load', model: 'CNN Surface Analyzer v4', confidence: 91, priority: 'high' },
  { belt: 'SC-03', component: 'Carry Idlers 16-30', prediction: 'Bearing failure predicted within 18 days — vibration trending exponentially', model: 'LSTM Vibration Predictor', confidence: 93, priority: 'high' },
  { belt: 'SC-06', component: 'Splice S4 (270m)', prediction: 'Mechanical splice fatigue — 68% health, failure risk in ~20 days under current load', model: 'Splice Health Classifier', confidence: 88, priority: 'high' },
  { belt: 'SC-06', component: 'Belt Cover (carry side)', prediction: 'Heat damage accelerating — rubber hardness increasing at 3 Shore A/month', model: 'Thermal Degradation NN', confidence: 85, priority: 'medium' },
  { belt: 'SC-04', component: 'Roller #18', prediction: 'Surface groove depth 2.4mm — will exceed 3mm limit in ~8 days at current tonnage', model: 'Roller Wear Regression', confidence: 82, priority: 'medium' },
  { belt: 'SC-01', component: 'Drive Motor (250kW)', prediction: 'Current draw trending up 4.2% over 14 days — check belt tension and alignment', model: 'Motor Analytics NN', confidence: 79, priority: 'low' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function ConveyorHealth() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const [selectedBelt, setSelectedBelt] = useState('SC-03')

  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (t) => tab === 'all' || tab === t

  const tabs = [
    { key: 'all', label: 'Full Overview', count: 48 },
    { key: 'vision', label: 'AI Vision', count: 8 },
    { key: 'fleet', label: 'Belt Fleet', count: 8 },
    { key: 'analysis', label: 'Belt Analysis', count: 12 },
    { key: 'rollers', label: 'Rollers & Pulleys', count: 8 },
    { key: 'challenges', label: 'Steel-Specific', count: 4 },
    { key: 'predictive', label: 'Predictive AI', count: 6 },
  ]

  const currentBelt = conveyorBelts.find(b => b.id === selectedBelt) || conveyorBelts[0]

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
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Conveyor Belt Health Monitoring</h1>
          <p style={s.sub}>AI Vision for wear detection, thermal monitoring & predictive maintenance — 8 conveyor systems</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> 4 Cameras Active</span>
          <span style={s.aiBadge}>YOLOv8 + CNN Active</span>
          <span style={{ ...s.aiBadge, background: '#16a34a15', color: '#16a34a' }}>6/8 Belts Running</span>
          <span style={s.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={s.statusBar}>
        {[
          { label: 'Total Conveyors', value: '8', icon: 'CV', color: ACCENT },
          { label: 'Avg Health', value: '86%', icon: 'AH', color: '#16a34a' },
          { label: 'AI Detections Today', value: '34', icon: 'DT', color: '#f59e0b' },
          { label: 'Critical Alerts', value: '1', icon: 'CA', color: '#ef4444' },
          { label: 'Total Length', value: '2,490m', icon: 'TL', color: '#3b82f6' },
          { label: 'Throughput', value: '385 TPH', icon: 'TP', color: ACCENT },
          { label: 'Cameras Online', value: '4/4', icon: 'CM', color: '#16a34a' },
          { label: 'Next Maintenance', value: '4 days', icon: 'NM', color: '#f59e0b' },
        ].map((item, i) => (
          <div key={item.label} style={{ ...s.statusItem, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
            <div style={{ ...s.statusIcon, background: item.color + '12', color: item.color }}>{item.icon}</div>
            <div><div style={s.statusLabel}>{item.label}</div><div style={s.statusValue}>{item.value}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.catBar}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? s.catActive : s.catBtn} onClick={() => switchTab(t.key)}>{t.label} <span style={tab === t.key ? s.catCountActive : s.catCount}>{t.count}</span></button>))}
      </div>

      {/* ═══ AI VISION ═══ */}
      {show('vision') && (
        <Section title="Live AI Vision Camera Feeds" badge="YOLOv8 + Thermal AI" icon="AV">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {cameraFeeds.map((feed, i) => (<div key={feed.camera} style={{ animation: `slideIn 0.7s ease ${i * 0.12}s both` }}><CameraFeed {...feed} /></div>))}
          </div>
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={s.cardLabel}>AI Detection Event Log</div>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>Last 2 hours | YOLOv8 + CNN Surface + Thermal AI</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.6fr 0.6fr 1.8fr 0.7fr 0.5fr 2fr', gap: '8px', padding: '8px 12px', background: ACCENT + '08', borderRadius: '8px 8px 0 0' }}>
              {['Time', 'Camera', 'Belt', 'Detection', 'Severity', 'Conf.', 'Action Taken'].map(h => (<span key={h} style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase' }}>{h}</span>))}
            </div>
            {aiDetections.map((d, i) => {
              const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6', ok: '#16a34a' }
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.6fr 0.6fr 1.8fr 0.7fr 0.5fr 2fr', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{d.time}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{d.camera}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{d.belt}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#1e293b' }}>{d.type}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: sevColors[d.severity], background: sevColors[d.severity] + '15', padding: '2px 6px', borderRadius: '4px', textAlign: 'center', textTransform: 'uppercase' }}>{d.severity}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: ACCENT }}>{d.confidence}%</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{d.action}</span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ BELT FLEET ═══ */}
      {show('fleet') && (
        <Section title="Conveyor Belt Fleet — Steel Plant" badge="8 Systems" icon="BF">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {conveyorBelts.map((belt, i) => {
              const hColor = belt.health > 85 ? '#16a34a' : belt.health > 70 ? '#f59e0b' : '#ef4444'
              const isSelected = belt.id === selectedBelt
              return (
                <div key={belt.id} onClick={() => setSelectedBelt(belt.id)} style={{ ...s.card, cursor: 'pointer', animation: `slideIn 0.7s ease ${i * 0.08}s both`, border: isSelected ? `2px solid ${ACCENT}` : '1px solid #e8ecf1', boxShadow: isSelected ? `0 0 0 3px ${ACCENT}15` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT }}>{belt.id}</span>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginTop: '2px', lineHeight: '1.3' }}>{belt.name}</div>
                    </div>
                    <DonutChart value={belt.health} max={100} size={48} strokeWidth={5} color={hColor} />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: belt.status === 'Running' ? '#16a34a' : '#f59e0b', background: (belt.status === 'Running' ? '#16a34a' : '#f59e0b') + '15', padding: '2px 6px', borderRadius: '10px' }}>{belt.status}</span>
                    <span style={{ fontSize: '8px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '10px' }}>{belt.material}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[{ l: 'Speed', v: `${belt.speed} m/s` }, { l: 'Load', v: `${belt.load}%` }, { l: 'Temp', v: `${belt.temp}°C` }].map(spec => (
                      <div key={spec.l}><div style={{ fontSize: '7px', color: '#94a3b8' }}>{spec.l}</div><div style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{spec.v}</div></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '8px', color: '#94a3b8' }}>
                    <span>Maint: {belt.nextMaint}</span>
                    <span>{belt.length}m × {belt.width}mm</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ BELT ANALYSIS ═══ */}
      {show('analysis') && (
        <Section title={`Belt Surface Analysis — ${currentBelt.id}: ${currentBelt.name}`} badge="CNN Surface Analyzer" icon="BA">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={s.cardLabel}>Belt Wear Profile (% remaining by zone)</div>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>20 zones across {currentBelt.length}m</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '140px', padding: '0 4px' }}>
                {beltWearProfile.map((w, i) => {
                  const col = w > 85 ? '#16a34a' : w > 70 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '8px', fontWeight: 600, color: col }}>{w}%</span>
                      <div style={{ width: '100%', height: `${w * 1.2}px`, background: `linear-gradient(to top, ${col}50, ${col})`, borderRadius: '3px 3px 1px 1px', transition: 'height 1.4s ease', minHeight: '4px' }} />
                      <span style={{ fontSize: '7px', color: '#94a3b8' }}>{i + 1}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={s.tinyLabel}>Min Wear </span><span style={{ ...s.tinyVal, color: '#ef4444' }}>65% (Zone 10)</span></div>
                <div><span style={s.tinyLabel}>Avg </span><span style={s.tinyVal}>83.5%</span></div>
                <div><span style={s.tinyLabel}>Critical Zones </span><span style={{ ...s.tinyVal, color: '#f59e0b' }}>3</span></div>
                <div><span style={s.tinyLabel}>AI Prediction </span><span style={{ ...s.tinyVal, color: ACCENT }}>Replace Zone 8-10 in ~12 days</span></div>
              </div>
            </div>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Splice Joint Health</div>
              <div style={{ marginTop: '12px' }}>
                {spliceHealth.map((sp, i) => {
                  const spColor = sp.health > 90 ? '#16a34a' : sp.health > 75 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={sp.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div><span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{sp.id} — {sp.position}</span><span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '8px' }}>{sp.type}</span></div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: spColor }}>{sp.health}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${sp.health}%`, background: spColor, borderRadius: '2px', transition: 'width 1.4s ease' }} /></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: '#94a3b8' }}><span>Age: {sp.age}</span><span>Checked: {sp.lastCheck}</span></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={s.cardLabel}>Material Flow & Volume Scan</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Current: <strong style={{ color: '#1e293b' }}>{materialFlow.throughput} TPH</strong></span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target: <strong style={{ color: '#16a34a' }}>{materialFlow.target} TPH</strong></span>
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}><div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Throughput (TPH) — Last 12hrs</div><AreaChart data={materialFlow.loadProfile} color={ACCENT} height={80} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Belt Load Profile (%) — Cross-Section Volume</div><AreaChart data={materialFlow.volumeScan} color="#3b82f6" height={80} /></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ROLLERS & PULLEYS ═══ */}
      {show('rollers') && (
        <Section title="Rollers, Pulleys & Idler Health" badge="Vibration + Thermal AI" icon="RL">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {rollerHealth.map((r, i) => {
              const hColor = r.health > 85 ? '#16a34a' : r.health > 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={r.section} style={{ ...s.card, animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderTop: `3px solid ${hColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{r.section}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: hColor, background: hColor + '15', padding: '2px 8px', borderRadius: '10px' }}>{r.health}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}><div style={{ height: '100%', width: `${r.health}%`, background: hColor, borderRadius: '2px', transition: 'width 1.4s ease' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', textAlign: 'center' }}>
                    <div><div style={{ fontSize: '15px', fontWeight: 700, color: r.bearing > 60 ? '#f59e0b' : '#1e293b' }}>{r.bearing}°C</div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Bearing</div></div>
                    <div><div style={{ fontSize: '15px', fontWeight: 700, color: r.vibration > 3.5 ? '#f59e0b' : '#1e293b' }}>{r.vibration}</div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Vib mm/s</div></div>
                    <div><div style={{ fontSize: '15px', fontWeight: 700, color: r.temp > 60 ? '#f59e0b' : '#1e293b' }}>{r.temp}°C</div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Surface</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...s.card, display: 'flex', gap: '32px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div><span style={s.tinyLabel}>Total Idlers </span><span style={s.tinyVal}>264</span></div>
            <div><span style={s.tinyLabel}>Flagged </span><span style={{ ...s.tinyVal, color: '#f59e0b' }}>12 (4.5%)</span></div>
            <div><span style={s.tinyLabel}>Avg Bearing Temp </span><span style={s.tinyVal}>52°C</span></div>
            <div><span style={s.tinyLabel}>Seized This Month </span><span style={{ ...s.tinyVal, color: '#ef4444' }}>3</span></div>
            <div><span style={s.tinyLabel}>Replaced This Month </span><span style={{ ...s.tinyVal, color: '#10b981' }}>8</span></div>
          </div>
        </Section>
      )}

      {/* ═══ STEEL-SPECIFIC CHALLENGES ═══ */}
      {show('challenges') && (
        <Section title="Steel Plant Conveyor Challenges" badge="Industry-Specific" icon="SP">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {steelConveyorChallenges.map((c, i) => (
              <div key={c.challenge} style={{ ...s.card, animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderLeft: `3px solid ${ACCENT}` }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{c.challenge}</div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '8px 10px', background: `${ACCENT}08`, borderRadius: '8px', border: `1px solid ${ACCENT}15` }}>
                  <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }}>AI</span>
                  <span style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.5' }}>{c.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ PREDICTIVE AI ═══ */}
      {show('predictive') && (
        <Section title="Predictive Maintenance Alerts" badge={`${predictiveAlerts.length} Active`} icon="AI">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {predictiveAlerts.map((a, i) => {
              const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
              return (
                <div key={i} style={{ ...s.card, borderLeft: `4px solid ${priColors[a.priority]}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: priColors[a.priority], padding: '2px 6px', borderRadius: '3px' }}>{a.priority}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>{a.belt}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{a.component}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{a.model}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#4a5568', lineHeight: '1.6' }}>{a.prediction}</p>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>AI Confidence: <strong style={{ color: ACCENT }}>{a.confidence}%</strong></span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <div style={s.aiFooter}>
        <div style={s.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Conveyor Belt Health Monitoring</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 8 conveyor systems (2,490m total) with 4 AI vision cameras, 264 idler sensors, and 16 belt monitoring points.
            Active models: YOLOv8 object detection (foreign objects, spillage), CNN surface wear analyzer v4 (accuracy 96.8%),
            LSTM vibration predictor for bearings, Thermal AI for hot material belts (slag/slab), Splice health classifier.
            Steel-specific: heat-resistant belt monitoring up to 300°C, electromagnetic metal detection with &lt;200ms response.
            Unplanned belt stoppages reduced 42% this quarter through predictive maintenance. Next model retraining: 4 hours.
          </div>
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
  statusBar: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '24px' },
  statusItem: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '10px 12px' },
  statusIcon: { width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, flexShrink: 0 },
  statusLabel: { fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' },
  statusValue: { fontSize: '14px', fontWeight: 700, color: '#1e293b' },
  catBar: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' },
  catBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  catActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  catCount: { background: '#f1f5f9', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  catCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  row: { display: 'flex', gap: '14px' },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
