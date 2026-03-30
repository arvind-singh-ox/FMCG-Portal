'use client'
import { useState, useEffect, useRef } from 'react'

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
function AnimatedValue({ value, decimals = 1 }) {
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
  return <>{numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(decimals)}</>
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
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>
      {label && <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}
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

// ─── AI Vision Camera Feed with bounding boxes ───
function CameraFeed({ camera, detections, imageUrl, status }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', aspectRatio: '16/10' }}>
      {/* Camera image */}
      <img
        src={imageUrl}
        alt={camera}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 0.85 : 0 , transition: 'opacity 0.6s ease' }}
      />
      {/* Overlay gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
      {/* AI Detection bounding boxes */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {detections.map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="none" stroke={d.color || '#00ff88'} strokeWidth="2" strokeDasharray={d.type === 'alert' ? '6,3' : 'none'} rx="2">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x={d.x} y={d.y} width={d.labelW || 90} height="16" fill={d.color || '#00ff88'} rx="2" opacity="0.9" transform="translate(0,-16)" />
            <text x={d.x} y={d.y} fontSize="10" fontWeight="700" fill="#000" dx="4" dy="-4">{d.label} {d.confidence}%</text>
          </g>
        ))}
      </svg>
      {/* Camera info overlay */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ background: status === 'Active' ? '#16a34a' : '#ef4444', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{camera}</span>
      </div>
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <span style={{ fontSize: '9px', fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: '4px' }}>LIVE AI</span>
      </div>
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '9px', color: '#94a3b8', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>{new Date().toLocaleTimeString()}</span>
        <span style={{ fontSize: '9px', color: '#00ff88', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>{detections.length} detections</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════

const conveyorBelts = [
  { id: 'CB-01', name: 'Limestone Feed Conveyor', length: 240, width: 1200, speed: 2.8, health: 94, load: 78, temp: 42, vibration: 2.1, status: 'Running', material: 'Limestone', lastInspection: '3 days ago', nextMaint: '12 days' },
  { id: 'CB-02', name: 'Raw Mill Discharge', length: 180, width: 1000, speed: 2.2, health: 87, load: 65, temp: 38, vibration: 2.8, status: 'Running', material: 'Raw Meal', lastInspection: '1 day ago', nextMaint: '28 days' },
  { id: 'CB-03', name: 'Clinker Transport', length: 320, width: 1400, speed: 1.8, health: 72, load: 82, temp: 68, vibration: 4.5, status: 'Warning', material: 'Clinker', lastInspection: '7 days ago', nextMaint: '5 days' },
  { id: 'CB-04', name: 'Coal Feed Belt', length: 150, width: 800, speed: 1.5, health: 91, load: 55, temp: 35, vibration: 1.8, status: 'Running', material: 'Coal/Petcoke', lastInspection: '2 days ago', nextMaint: '21 days' },
  { id: 'CB-05', name: 'Cement Dispatch', length: 200, width: 1000, speed: 2.0, health: 96, load: 70, temp: 34, vibration: 1.5, status: 'Running', material: 'Cement', lastInspection: '1 day ago', nextMaint: '35 days' },
  { id: 'CB-06', name: 'Additive Conveyor', length: 120, width: 600, speed: 1.2, health: 88, load: 42, temp: 32, vibration: 2.4, status: 'Running', material: 'Gypsum/Fly Ash', lastInspection: '4 days ago', nextMaint: '18 days' },
]

const cameraFeeds = [
  {
    camera: 'CAM-01: Limestone Feed Entry',
    imageUrl: '/images/cement-plant/conveyer1.webp',
    status: 'Active',
    detections: [
      { x: '15%', y: '35%', w: '30%', h: '25%', label: 'Belt OK', confidence: 97, color: '#00ff88', labelW: 85 },
      { x: '55%', y: '20%', w: '20%', h: '18%', label: 'Material', confidence: 95, color: '#3b82f6', labelW: 80 },
    ],
  },
  {
    camera: 'CAM-02: Clinker Transfer Point',
    imageUrl: '/images/cement-plant/conveyer3.png',
    status: 'Active',
    detections: [
      { x: '20%', y: '30%', w: '35%', h: '30%', label: 'Edge Wear', confidence: 88, color: '#f59e0b', type: 'alert', labelW: 95 },
      { x: '60%', y: '45%', w: '22%', h: '20%', label: 'Misalign', confidence: 82, color: '#ef4444', type: 'alert', labelW: 85 },
      { x: '10%', y: '60%', w: '18%', h: '15%', label: 'Roller OK', confidence: 96, color: '#00ff88', labelW: 80 },
    ],
  },
  {
    camera: 'CAM-03: Coal Belt Surface',
    imageUrl: '/images/cement-plant/conveyer4.webp',
    status: 'Active',
    detections: [
      { x: '25%', y: '40%', w: '28%', h: '22%', label: 'Surface OK', confidence: 94, color: '#00ff88', labelW: 90 },
      { x: '58%', y: '25%', w: '25%', h: '30%', label: 'Flow Normal', confidence: 91, color: '#3b82f6', labelW: 95 },
    ],
  },
  {
    camera: 'CAM-04: Dispatch Belt Scanner',
    imageUrl: '/images/cement-plant/con2.png',
    status: 'Active',
    detections: [
      { x: '12%', y: '28%', w: '40%', h: '35%', label: 'Belt OK', confidence: 98, color: '#00ff88', labelW: 80 },
      { x: '55%', y: '50%', w: '30%', h: '20%', label: 'Load Scan', confidence: 93, color: '#8b5cf6', labelW: 85 },
    ],
  },
]

const aiDetections = [
  { time: '14:32:18', camera: 'CAM-02', belt: 'CB-03', type: 'Edge Wear Detected', severity: 'warning', confidence: 88, action: 'Schedule inspection within 5 days' },
  { time: '14:28:05', camera: 'CAM-02', belt: 'CB-03', type: 'Belt Misalignment (12mm)', severity: 'critical', confidence: 82, action: 'Auto-alert sent to maintenance' },
  { time: '14:15:42', camera: 'CAM-01', belt: 'CB-01', type: 'Foreign Object Near Edge', severity: 'warning', confidence: 79, action: 'Operator notified — cleared' },
  { time: '13:58:11', camera: 'CAM-03', belt: 'CB-04', type: 'Surface Crack (micro)', severity: 'info', confidence: 74, action: 'Logged — monitor on next scan' },
  { time: '13:42:30', camera: 'CAM-04', belt: 'CB-05', type: 'Splice Joint Checked', severity: 'ok', confidence: 96, action: 'No action needed' },
  { time: '13:20:15', camera: 'CAM-01', belt: 'CB-01', type: 'Material Spillage (minor)', severity: 'info', confidence: 85, action: 'Cleanup crew dispatched' },
  { time: '12:55:08', camera: 'CAM-02', belt: 'CB-03', type: 'Vibration Anomaly', severity: 'warning', confidence: 91, action: 'Vibration team dispatched' },
]

const beltWearProfile = [92, 94, 91, 88, 85, 82, 78, 72, 68, 75, 80, 85, 88, 91, 94, 93, 90, 87, 84, 80]

const spliceHealth = [
  { id: 'S1', position: '0m', type: 'Vulcanized', health: 98, age: '2 months', lastCheck: '3 days ago' },
  { id: 'S2', position: '60m', type: 'Mechanical', health: 85, age: '8 months', lastCheck: '1 week ago' },
  { id: 'S3', position: '120m', type: 'Vulcanized', health: 92, age: '4 months', lastCheck: '3 days ago' },
  { id: 'S4', position: '180m', type: 'Mechanical', health: 78, age: '11 months', lastCheck: '2 weeks ago' },
  { id: 'S5', position: '240m', type: 'Vulcanized', health: 95, age: '1 month', lastCheck: '3 days ago' },
]

const rollerHealth = [
  { section: 'Head Pulley', bearing: 58, vibration: 2.8, temp: 52, health: 88 },
  { section: 'Tail Pulley', bearing: 48, vibration: 1.9, temp: 45, health: 94 },
  { section: 'Drive Roller', bearing: 62, vibration: 3.2, temp: 58, health: 82 },
  { section: 'Snub Roller', bearing: 44, vibration: 1.5, temp: 40, health: 96 },
  { section: 'Idler Set 1-10', bearing: 52, vibration: 2.4, temp: 48, health: 90 },
  { section: 'Idler Set 11-20', bearing: 68, vibration: 4.1, temp: 65, health: 72 },
  { section: 'Impact Idlers', bearing: 55, vibration: 3.8, temp: 54, health: 78 },
  { section: 'Return Idlers', bearing: 46, vibration: 1.8, temp: 42, health: 93 },
]

const materialFlow = {
  throughput: 245,
  target: 260,
  loadProfile: [220, 235, 248, 255, 260, 258, 245, 240, 252, 248, 245, 250],
  volumeScan: [82, 85, 88, 92, 95, 93, 88, 85, 90, 88, 86, 89],
}

const predictiveAlerts = [
  { belt: 'CB-03', component: 'Belt Surface (Zone 7-9)', prediction: 'Surface degradation reaching threshold in ~18 days', model: 'CNN Surface Analyzer', confidence: 89, priority: 'high' },
  { belt: 'CB-03', component: 'Idler Set 11-20', prediction: 'Bearing failure predicted within 25 days based on vibration trend', model: 'LSTM Vibration Predictor', confidence: 92, priority: 'high' },
  { belt: 'CB-06', component: 'Splice S4 (180m)', prediction: 'Mechanical splice fatigue — replacement recommended within 30 days', model: 'Splice Health Classifier', confidence: 85, priority: 'medium' },
  { belt: 'CB-01', component: 'Drive Motor', prediction: 'Current draw trending up 3.2% — check belt tension and alignment', model: 'Motor Analytics NN', confidence: 78, priority: 'low' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

function ConveyorHealth() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const [selectedBelt, setSelectedBelt] = useState('CB-03')

  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (t) => tab === 'all' || tab === t

  const tabs = [
    { key: 'all', label: 'Full Overview', count: 38 },
    { key: 'vision', label: 'AI Vision', count: 8 },
    { key: 'fleet', label: 'Belt Fleet', count: 6 },
    { key: 'analysis', label: 'Belt Analysis', count: 10 },
    { key: 'rollers', label: 'Rollers & Pulleys', count: 8 },
    { key: 'predictive', label: 'Predictive AI', count: 6 },
  ]

  const currentBelt = conveyorBelts.find(b => b.id === selectedBelt) || conveyorBelts[0]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Conveyor Belt Health</h1>
          <p style={s.sub}>AI Vision monitoring, surface analysis, and predictive maintenance for 6 conveyor systems</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> 4 Cameras Active</span>
          <span style={s.aiBadge}>YOLOv8 + CNN Active</span>
          <span style={{ ...s.aiBadge, background: '#16a34a15', color: '#16a34a' }}>5/6 Belts Running</span>
          <span style={s.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div style={s.statusBar}>
        {[
          { label: 'Total Conveyors', value: '6', icon: 'CV', color: ACCENT },
          { label: 'Avg Health', value: '88%', icon: 'AH', color: '#16a34a' },
          { label: 'AI Detections Today', value: '23', icon: 'DT', color: '#f59e0b' },
          { label: 'Critical Alerts', value: '1', icon: 'CA', color: '#ef4444' },
          { label: 'Total Length', value: '1,210m', icon: 'TL', color: '#3b82f6' },
          { label: 'Throughput', value: '245 TPH', icon: 'TP', color: ACCENT },
          { label: 'Cameras Online', value: '4/4', icon: 'CM', color: '#16a34a' },
          { label: 'Next Maintenance', value: '5 days', icon: 'NM', color: '#f59e0b' },
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
        {tabs.map((t) => (
          <button key={t.key} style={tab === t.key ? s.catActive : s.catBtn} onClick={() => switchTab(t.key)}>
            {t.label} <span style={tab === t.key ? s.catCountActive : s.catCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ AI VISION FEEDS ═══════════════ */}
      {show('vision') && (
        <Section title="Live AI Vision Camera Feeds" badge="YOLOv8 Real-Time" icon="AV">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {cameraFeeds.map((feed, i) => (
              <div key={feed.camera} style={{ animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                <CameraFeed {...feed} />
              </div>
            ))}
          </div>

          {/* AI Detection Log */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={s.cardLabel}>AI Detection Event Log</div>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>Last 2 hours | YOLOv8 + CNN Surface Analyzer</span>
            </div>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.6fr 0.6fr 1.5fr 0.7fr 0.6fr 2fr', gap: '8px', padding: '8px 12px', background: ACCENT + '08', borderRadius: '8px 8px 0 0' }}>
              {['Time', 'Camera', 'Belt', 'Detection', 'Severity', 'Conf.', 'Action Taken'].map(h => (
                <span key={h} style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {aiDetections.map((d, i) => {
              const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6', ok: '#16a34a' }
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '0.8fr 0.6fr 0.6fr 1.5fr 0.7fr 0.6fr 2fr', gap: '8px',
                  padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center',
                  animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`
                }}>
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

      {/* ═══════════════ BELT FLEET ═══════════════ */}
      {show('fleet') && (
        <Section title="Conveyor Belt Fleet" badge="6 Active Systems" icon="BF">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {conveyorBelts.map((belt, i) => {
              const hColor = belt.health > 85 ? '#16a34a' : belt.health > 70 ? '#f59e0b' : '#ef4444'
              const isSelected = belt.id === selectedBelt
              return (
                <div key={belt.id} onClick={() => setSelectedBelt(belt.id)} style={{
                  ...s.card, cursor: 'pointer', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both`,
                  border: isSelected ? `2px solid ${ACCENT}` : '1px solid #e8ecf1',
                  boxShadow: isSelected ? `0 0 0 3px ${ACCENT}15` : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT }}>{belt.id}</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{belt.name}</div>
                    </div>
                    <DonutChart value={belt.health} max={100} size={52} strokeWidth={5} color={hColor} />
                  </div>
                  {/* Status badge */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: belt.status === 'Running' ? '#16a34a' : '#f59e0b', background: (belt.status === 'Running' ? '#16a34a' : '#f59e0b') + '15', padding: '2px 8px', borderRadius: '10px' }}>{belt.status}</span>
                    <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{belt.material}</span>
                  </div>
                  {/* Quick specs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { l: 'Speed', v: `${belt.speed} m/s` },
                      { l: 'Load', v: `${belt.load}%` },
                      { l: 'Temp', v: `${belt.temp}°C` },
                      { l: 'Length', v: `${belt.length}m` },
                      { l: 'Width', v: `${belt.width}mm` },
                      { l: 'Vibration', v: `${belt.vibration} mm/s` },
                    ].map(spec => (
                      <div key={spec.l}>
                        <div style={{ fontSize: '8px', color: '#94a3b8' }}>{spec.l}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{spec.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '9px', color: '#94a3b8' }}>
                    <span>Inspected: {belt.lastInspection}</span>
                    <span>Maint: {belt.nextMaint}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══════════════ BELT ANALYSIS (for selected belt) ═══════════════ */}
      {show('analysis') && (
        <Section title={`Belt Surface Analysis — ${currentBelt.id}: ${currentBelt.name}`} badge="CNN Surface Analyzer" icon="BA">
          <div style={s.row}>
            {/* Wear Profile */}
            <div style={{ ...s.card, flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={s.cardLabel}>Belt Wear Profile (% remaining by zone)</div>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>20 zones across {currentBelt.length}m</span>
              </div>
              {/* Wear bar visualization */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '140px', padding: '0 4px' }}>
                {beltWearProfile.map((w, i) => {
                  const col = w > 85 ? '#16a34a' : w > 70 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '8px', fontWeight: 600, color: col }}>{w}%</span>
                      <div style={{
                        width: '100%', height: `${w * 1.2}px`, background: `linear-gradient(to top, ${col}50, ${col})`,
                        borderRadius: '3px 3px 1px 1px', transition: 'height 1.4s cubic-bezier(0.22,1,0.36,1)', minHeight: '4px'
                      }} />
                      <span style={{ fontSize: '7px', color: '#94a3b8' }}>{i + 1}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={s.tinyLabel}>Min Wear </span><span style={{ ...s.tinyVal, color: '#ef4444' }}>68% (Zone 9)</span></div>
                <div><span style={s.tinyLabel}>Avg Wear </span><span style={s.tinyVal}>84.5%</span></div>
                <div><span style={s.tinyLabel}>Critical Zones </span><span style={{ ...s.tinyVal, color: '#f59e0b' }}>2</span></div>
                <div><span style={s.tinyLabel}>AI Prediction </span><span style={{ ...s.tinyVal, color: ACCENT }}>Replace Zone 7-9 in ~45 days</span></div>
              </div>
            </div>
            {/* Splice Health */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Splice Joint Health</div>
              <div style={{ marginTop: '12px' }}>
                {spliceHealth.map((sp, i) => {
                  const spColor = sp.health > 90 ? '#16a34a' : sp.health > 75 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={sp.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{sp.id} — {sp.position}</span>
                          <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '8px' }}>{sp.type}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: spColor }}>{sp.health}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${sp.health}%`, background: spColor, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: '#94a3b8' }}>
                        <span>Age: {sp.age}</span>
                        <span>Checked: {sp.lastCheck}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Material Flow */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={s.cardLabel}>Material Flow & Volume Scan</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Current: <strong style={{ color: '#1e293b' }}>{materialFlow.throughput} TPH</strong></span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target: <strong style={{ color: '#16a34a' }}>{materialFlow.target} TPH</strong></span>
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Throughput (TPH) — Last 12hrs</div>
                <AreaChart data={materialFlow.loadProfile} color={ACCENT} height={80} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Belt Load Profile (%) — Cross-Section Volume</div>
                <AreaChart data={materialFlow.volumeScan} color="#3b82f6" height={80} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ ROLLERS & PULLEYS ═══════════════ */}
      {show('rollers') && (
        <Section title="Rollers, Pulleys & Idler Health" badge="Vibration + Thermal AI" icon="RL">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {rollerHealth.map((r, i) => {
              const hColor = r.health > 85 ? '#16a34a' : r.health > 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={r.section} style={{ ...s.card, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both`, borderTop: `3px solid ${hColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{r.section}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: hColor, background: hColor + '15', padding: '2px 8px', borderRadius: '10px' }}>{r.health}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ height: '100%', width: `${r.health}%`, background: hColor, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: r.bearing > 60 ? '#f59e0b' : '#1e293b' }}>{r.bearing}°C</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>Bearing</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: r.vibration > 3.5 ? '#f59e0b' : '#1e293b' }}>{r.vibration}</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>Vib mm/s</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: r.temp > 60 ? '#f59e0b' : '#1e293b' }}>{r.temp}°C</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>Surface</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Summary Bar */}
          <div style={{ ...s.card, display: 'flex', gap: '32px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div><span style={s.tinyLabel}>Total Idlers </span><span style={s.tinyVal}>186</span></div>
            <div><span style={s.tinyLabel}>Flagged </span><span style={{ ...s.tinyVal, color: '#f59e0b' }}>8 (4.3%)</span></div>
            <div><span style={s.tinyLabel}>Replaced This Month </span><span style={s.tinyVal}>3</span></div>
            <div><span style={s.tinyLabel}>MTBF (Idlers) </span><span style={s.tinyVal}>4,200 hrs</span></div>
            <div><span style={s.tinyLabel}>Avg Bearing Temp </span><span style={s.tinyVal}>52°C</span></div>
            <div><span style={s.tinyLabel}>Thermal Scan </span><span style={{ ...s.tinyVal, color: '#16a34a' }}>Last: 4hrs ago</span></div>
          </div>
        </Section>
      )}

      {/* ═══════════════ PREDICTIVE AI ═══════════════ */}
      {show('predictive') && (
        <Section title="Predictive Maintenance AI" badge="On-Premise LLM + ML" icon="PM">
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>AI-Predicted Failures & Recommendations</div>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>Models running on Edge-Node-01 & AI-Server-Primary</span>
            </div>
            {predictiveAlerts.map((alert, i) => {
              const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }
              const pc = pColors[alert.priority]
              return (
                <div key={i} style={{
                  display: 'flex', gap: '14px', padding: '16px', marginBottom: '10px',
                  background: '#f8fafc', borderRadius: '10px', border: `1px solid ${pc}20`, borderLeft: `3px solid ${pc}`,
                  animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: pc, background: pc + '15', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{alert.priority}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{alert.belt} — {alert.component}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6, marginBottom: '6px' }}>{alert.prediction}</div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>Model: {alert.model}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: ACCENT }}>Confidence: {alert.confidence}%</span>
                    </div>
                  </div>
                  <button style={{ ...s.actionBtn, flexShrink: 0, alignSelf: 'center' }}>Schedule</button>
                </div>
              )
            })}
          </div>

          {/* AI Models Used */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.cardLabel}>Conveyor AI Model Stack (On-Premise)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '14px' }}>
              {[
                { name: 'YOLOv8 Object Detector', type: 'Real-time Vision', accuracy: 95.2, device: 'Edge-Node-04 (A2 GPU)', purpose: 'Belt surface defects, foreign objects, misalignment' },
                { name: 'CNN Surface Analyzer', type: 'Image Classification', accuracy: 92.8, device: 'Edge-Node-04 (A2 GPU)', purpose: 'Wear pattern, crack detection, splice health' },
                { name: 'LSTM Vibration Predictor', type: 'Time-Series', accuracy: 93.5, device: 'Edge-Node-01 (Orin)', purpose: 'Bearing failure prediction, idler degradation' },
                { name: 'iFactory-Conv-LLM-7B', type: 'On-Premise LLM', accuracy: 89.0, device: 'AI-Server-Primary (A100)', purpose: 'Root-cause analysis, maintenance report generation, operator Q&A' },
              ].map((model, i) => (
                <div key={model.name} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                  <div style={{ textAlign: 'center', margin: '4px auto 8px' }}>
                    <DonutChart value={model.accuracy} max={100} size={56} strokeWidth={5} color={model.accuracy > 90 ? '#16a34a' : ACCENT} label="accuracy" />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', textAlign: 'center', marginBottom: '4px' }}>{model.name}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: ACCENT, textAlign: 'center', marginBottom: '6px' }}>{model.type}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', lineHeight: 1.5, marginBottom: '6px' }}>{model.purpose}</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', borderTop: '1px solid #e8ecf1', paddingTop: '6px' }}>{model.device}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Data sovereignty */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', padding: '12px 16px', background: '#16a34a08', borderRadius: '8px', border: '1px solid #16a34a20' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#16a34a15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>All Vision AI runs 100% On-Premise</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5 }}>
                Camera feeds processed on edge nodes (NVIDIA Jetson/A2). LLM inference on local A100 servers.
                No video or image data leaves the plant network. Compliant with plant security policy and IEC 62443.
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

// ─── Section Wrapper ───
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
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Conveyor Health AI Summary</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          Monitoring 6 conveyor systems (1,210m total) with 4 AI vision cameras running YOLOv8 real-time detection.
          23 AI detections today, 1 critical alert (CB-03 misalignment). CNN surface analyzer tracking wear across 20 zones per belt.
          On-premise LLM (iFactory-Conv-LLM-7B) generating root-cause analysis and maintenance reports on local A100 GPU.
          Predictive models forecast 2 maintenance events in next 30 days. All processing air-gapped — zero cloud dependency.
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
  miniCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },

  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },

  actionBtn: { background: ACCENT, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },

  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}

export default ConveyorHealth
