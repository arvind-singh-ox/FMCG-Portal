'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const ORANGE = '#f97316'

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

// ─── Mini Waveform ───
function Waveform({ data, color, height = 36 }) {
  const ref = useRef(null)
  const [w, setW] = useState(120)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height}>
        <defs><linearGradient id={`wg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#wg-${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── Mini Heatmap ───
function MiniHeatmap({ data }) {
  const cols = data[0]?.length || 8
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px', borderRadius: '4px', overflow: 'hidden' }}>
      {data.flat().map((v, i) => {
        const t = Math.min(v / 100, 1)
        const c = t > 0.8 ? RED : t > 0.6 ? ORANGE : t > 0.3 ? AMBER : GREEN
        return <div key={i} style={{ height: '10px', background: c, opacity: 0.3 + t * 0.7, borderRadius: '1px' }} />
      })}
    </div>
  )
}

// ─── Mini Bars ───
function MiniBars({ data, color }) {
  const max = Math.max(...data) * 1.1
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '36px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: color, borderRadius: '2px 2px 0 0', opacity: 0.4 + (v / max) * 0.6, transition: 'height 0.6s ease' }} />
      ))}
    </div>
  )
}

// ─── Progress Bar ───
function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} />
    </div>
  )
}

// ─── Section ───
function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={sty.sectionHeader}>
        <div style={sty.sectionIcon}>{icon}</div>
        <h2 style={sty.sectionTitle}>{title}</h2>
      </div>
      {visible && children}
    </div>
  )
}

// ── SENSOR DATA ──
const sensors = [
  {
    name: 'Motion Amplification Camera',
    hardware: 'RDI Technologies Iris MX',
    location: 'Kiln Support Roller #3 — Bearing Housing',
    installed: 'Tripod-mounted, 4.2m from roller, 120fps capture',
    whyItMatters: 'Detects micro-vibrations invisible to naked eye. Predicted bearing failure 3 weeks early last quarter — saved 2.1 Cr unplanned downtime.',
    status: 'normal', zone: 'Kiln Drive', color: BLUE,
    readings: [{ label: 'Dominant Freq', value: '142 Hz', ok: true }, { label: 'Amplitude', value: '0.08 mm', ok: true }, { label: 'RMS Velocity', value: '3.2 mm/s', ok: true }, { label: 'Threshold', value: '6.5 mm/s', ok: true }],
    vizType: 'waveform', vizData: [2.1,3.4,2.8,4.1,3.2,2.5,3.8,4.5,3.1,2.9,3.6,4.2,3.0,2.7,3.9],
  },
  {
    name: 'Acoustic Emission Sensor',
    hardware: 'Mistras PCI-2 + R15I-AST',
    location: 'Kiln Girth Gear — Tooth Mesh Zone',
    installed: 'Magnetic mount on gearbox housing, waveguide coupling',
    whyItMatters: 'Listens for ultrasonic stress waves from micro-cracks forming inside gear teeth. Current spike at 285 kHz matches inner-race defect pattern.',
    status: 'warning', zone: 'Kiln Gearbox', color: ORANGE,
    readings: [{ label: 'Hit Rate', value: '2,840/hr', ok: false }, { label: 'AE Energy', value: '78 dB', ok: false }, { label: 'Peak Freq', value: '285 kHz', ok: false }, { label: 'Limit', value: '60 dB', ok: true }],
    vizType: 'waveform', vizData: [12,8,15,22,18,35,28,14,9,42,16,11,25,19,8],
  },
  {
    name: 'Fiber Optic DTS',
    hardware: 'Yokogawa DTSX3000 + SMF-28 Fiber',
    location: 'Kiln Shell — Full circumference loop (2.4 km)',
    installed: 'Fiber bonded to kiln shell surface in ceramic conduit, 480 sensing zones at 0.5m resolution',
    whyItMatters: 'Maps entire kiln temperature profile in real-time. Detects refractory thinning, coating loss, and ring formation before they become visible.',
    status: 'normal', zone: 'Pyro Section', color: RED,
    readings: [{ label: 'Zones', value: '480', ok: true }, { label: 'Max Temp', value: '342°C', ok: true }, { label: 'Avg Shell', value: '285°C', ok: true }, { label: 'Hot Spot', value: 'Zone 287', ok: true }],
    vizType: 'heatmap', vizData: [[45,52,68,82,95,88,72,58],[38,48,62,78,92,85,68,52],[32,42,55,72,88,80,62,48]],
  },
  {
    name: 'Hyperspectral Camera',
    hardware: 'Specim FX17 + NIR Range (900-1700nm)',
    location: 'Raw Mill Discharge Conveyor — Belt surface scan',
    installed: 'Overhead gantry mount, 1.8m above belt, line-scan at 120 Hz across full belt width',
    whyItMatters: 'Scans mineral composition of every gram of raw meal in real-time. Detects limestone quality shifts 20 minutes before they reach the kiln.',
    status: 'normal', zone: 'Raw Mill Exit', color: ACCENT,
    readings: [{ label: 'Spectral Bands', value: '224', ok: true }, { label: 'CaO', value: '43.2%', ok: true }, { label: 'SiO2', value: '13.8%', ok: true }, { label: 'Accuracy', value: '97.2%', ok: true }],
    vizType: 'heatmap', vizData: [[30,45,60,35,50,70,40,55],[25,40,55,30,45,65,35,50],[35,50,65,40,55,75,45,60]],
  },
  {
    name: 'AI Vision Dust Monitor',
    hardware: 'FLIR A615 + Custom CNN Model',
    location: 'Clinker Cooler Discharge + Packing Plant Roof',
    installed: '3 IP cameras with edge AI (Jetson Orin), analyzing dust plume density via computer vision',
    whyItMatters: 'Replaces manual opacity readings. AI detects fugitive dust events in < 2 seconds, triggers water spray suppression automatically.',
    status: 'normal', zone: 'Cooler + Packing', color: GREEN,
    readings: [{ label: 'PM10', value: '42 ug/m3', ok: true }, { label: 'PM2.5', value: '18 ug/m3', ok: true }, { label: 'Visibility', value: '94%', ok: true }, { label: 'Limit', value: '100 ug/m3', ok: true }],
    vizType: 'bars', vizData: [35,42,38,45,52,48,44,40,36,42,50,46],
  },
  {
    name: 'LiDAR Volume Scanner',
    hardware: 'Velodyne VLP-32C + CloudCompare',
    location: 'Limestone Stockpile #1 & Clinker Silo Top',
    installed: 'Rotating scanner on 12m pole, 360° scan every 8 seconds, rain/dust resistant IP67',
    whyItMatters: 'Replaces manual surveying. Calculates exact tonnage in stockpiles for inventory management. Accuracy within ±5mm over 100m range.',
    status: 'normal', zone: 'Stockyard', color: CYAN,
    readings: [{ label: 'Point Cloud', value: '2.4M pts', ok: true }, { label: 'Volume', value: '72,400 MT', ok: true }, { label: 'Capacity', value: '72%', ok: true }, { label: 'Scan Time', value: '8 sec', ok: true }],
    vizType: 'bars', vizData: [72,68,74,70,66,72,75,71,69,73,76,74],
  },
  {
    name: 'Smart FTIR Gas Analyzer',
    hardware: 'Gasmet DX4000 + Heated Sample Line',
    location: 'Stack (CEMS), Kiln Inlet, Preheater Exit',
    installed: 'Extractive sampling at 180°C, 3-point multiplexed analysis, auto-calibration every 4 hrs',
    whyItMatters: 'Monitors 25+ gas species simultaneously. AI correlates NOx spikes with fuel quality changes and adjusts combustion parameters in real-time.',
    status: 'warning', zone: 'Stack CEMS', color: AMBER,
    readings: [{ label: 'O2', value: '2.8%', ok: true }, { label: 'CO', value: '0.12%', ok: true }, { label: 'NOx', value: '385 mg/Nm3', ok: false }, { label: 'Limit', value: '400 mg/Nm3', ok: true }],
    vizType: 'waveform', vizData: [380,392,385,398,405,395,388,410,402,390,385,395,400,392,388],
  },
  {
    name: 'Thermal Imaging System',
    hardware: 'FLIR A700 + Continuous Rotation Scanner',
    location: 'Kiln Shell — Full length scan (68m)',
    installed: 'Fixed mount at 15m distance, continuous 360° shell scan as kiln rotates, 640x480 IR resolution',
    whyItMatters: 'Hot spot at Zone 4 (312°C, +12°C/hr) indicates refractory wear. AI predicts brick failure in ~18 hrs if trend continues.',
    status: 'critical', zone: 'Kiln Shell', color: RED,
    readings: [{ label: 'Hot Spot', value: '312°C', ok: false }, { label: 'Avg Shell', value: '285°C', ok: true }, { label: 'Rise Rate', value: '+12°C/hr', ok: false }, { label: 'Brick Est.', value: '82mm', ok: false }],
    vizType: 'heatmap', vizData: [[50,60,75,92,98,95,80,65],[45,55,70,88,95,90,75,60],[40,50,65,82,90,85,70,55]],
  },
  {
    name: 'Wearable Safety IoT',
    hardware: 'Honeywell BW Flex + UWB Tag',
    location: 'All Personnel — Safety vests with integrated sensors',
    installed: '24 active units with gas detector (H2S, CO, LEL), fall sensor, UWB positioning (±30cm), panic button',
    whyItMatters: 'Real-time worker location tracking with automatic hazard zone alerts. Evacuated 3 workers from gas leak zone in 45 seconds last month.',
    status: 'normal', zone: 'Plant-wide', color: GREEN,
    readings: [{ label: 'Active Workers', value: '24', ok: true }, { label: 'In Hazard Zone', value: '2', ok: true }, { label: 'Gas Alerts', value: '0', ok: true }, { label: 'Coverage', value: '8 zones', ok: true }],
    vizType: 'bars', vizData: [24,22,25,23,24,26,24,23,25,24,22,24],
  },
  {
    name: 'Digital Twin Data Fusion',
    hardware: 'Custom Edge Server + TimescaleDB',
    location: 'Server Room — Central Data Aggregation',
    installed: 'All 2,847 sensor streams fused via OPC-UA gateway into physics-based digital twin simulation (1.2ms sync)',
    whyItMatters: 'Combines all sensor data into one unified plant model. Enables what-if scenarios and predictive maintenance across all equipment.',
    status: 'normal', zone: 'All Zones', color: BLUE,
    readings: [{ label: 'Streams', value: '2,847', ok: true }, { label: 'Sync', value: '99.7%', ok: true }, { label: 'Latency', value: '1.2 ms', ok: true }, { label: 'Models', value: '6 active', ok: true }],
    vizType: 'waveform', vizData: [99.2,99.4,99.5,99.3,99.6,99.7,99.5,99.6,99.7,99.4,99.6,99.7,99.5,99.6,99.7],
  },
]

const alerts = [
  { time: '2 min ago', severity: 'critical', msg: 'Kiln shell Zone 4 — hot spot 312°C, rising +12°C/hr. Thermal camera + fiber optic DTS both confirm.', sensor: 'Thermal + DTS' },
  { time: '8 min ago', severity: 'warning', msg: 'Acoustic emission spike on Kiln gearbox — 42 dB AE burst at 285 kHz. Possible tooth crack initiation.', sensor: 'Acoustic Emission' },
  { time: '15 min ago', severity: 'warning', msg: 'Stack NOx trending up: 385 → 405 mg/Nm3 in 30 min. Correlates with coal moisture increase.', sensor: 'Gas Analyzer' },
  { time: '22 min ago', severity: 'info', msg: 'LiDAR stockpile scan complete — limestone volume: 72,400 MT (72% capacity).', sensor: 'LiDAR' },
  { time: '35 min ago', severity: 'info', msg: 'Motion amplification detected 0.08mm bearing wobble on Raw Mill roller #2. Within limits but trending.', sensor: 'Motion Amp' },
  { time: '1h ago', severity: 'info', msg: 'Hyperspectral scan: raw meal CaO stable at 43.2%, SiO2 at 13.8%. Quality within spec.', sensor: 'Hyperspectral' },
]

const keyMetrics = [
  { label: 'Overall Sensor Uptime', value: '99.4%', color: GREEN },
  { label: 'Sensors Online', value: '2,847 / 2,864', color: BLUE },
  { label: 'AI Alerts Today', value: '34', color: ORANGE },
  { label: 'Critical Alerts', value: '2', color: RED },
  { label: 'Equipment Health Index', value: '94.2%', color: GREEN },
  { label: 'Emission Compliance', value: '98.1%', color: CYAN },
  { label: 'Data Throughput', value: '1.2 GB/min', color: ACCENT },
  { label: 'Edge Processing', value: '78% on-edge', color: AMBER },
]

const plantZones = [
  { name: 'Quarry', sensors: 42, status: 'normal', x: 2, y: 15, w: 11, h: 28 },
  { name: 'Raw Mill', sensors: 64, status: 'normal', x: 15, y: 12, w: 11, h: 30 },
  { name: 'Blending', sensors: 16, status: 'normal', x: 28, y: 18, w: 9, h: 22 },
  { name: 'Preheater', sensors: 86, status: 'warning', x: 39, y: 5, w: 9, h: 42 },
  { name: 'Kiln', sensors: 128, status: 'critical', x: 50, y: 18, w: 18, h: 22 },
  { name: 'Cooler', sensors: 48, status: 'normal', x: 70, y: 18, w: 10, h: 22 },
  { name: 'Cement Mill', sensors: 52, status: 'normal', x: 82, y: 12, w: 11, h: 30 },
  { name: 'Packing', sensors: 24, status: 'normal', x: 70, y: 58, w: 12, h: 20 },
  { name: 'Coal Mill', sensors: 38, status: 'normal', x: 39, y: 58, w: 12, h: 20 },
  { name: 'Stack', sensors: 28, status: 'warning', x: 54, y: 58, w: 9, h: 20 },
]

// ─── MAIN ───
function SmartSensors() {
  const [activeTab, setActiveTab] = useState('grid')

  const TABS = [
    { key: 'grid', label: 'Sensor Grid', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
    { key: 'map', label: 'Plant Map', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
    { key: 'alerts', label: 'Alerts & Metrics', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg> },
    { key: 'infra', label: 'Edge Infrastructure', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg> },
  ]

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Smart Sensors Monitoring</h1>
            <p style={sty.pageSub}>AI-powered industrial IoT sensor network — real-time diagnostics, predictive alerts & digital twin integration</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> 2,847 Sensors Live</span>
          <span style={{ ...sty.liveBadge, background: '#fef2f2', color: RED, borderColor: '#fecaca' }}>
            <span style={{ ...sty.liveDot, background: RED, animation: 'pulse 1.5s infinite' }} /> 2 Critical
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={sty.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'grid' && <SensorGridTab />}
      {activeTab === 'map' && <PlantMapTab />}
      {activeTab === 'alerts' && <AlertsMetricsTab />}
      {activeTab === 'infra' && <InfraTab />}
    </div>
  )
}

// ─── SENSOR GRID TAB ───
function SensorGridTab() {
  return (
    <Section title="Sensor Network — 10 Active Modules" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sensors.map((s, i) => {
          const statusColors = { normal: GREEN, warning: AMBER, critical: RED }
          const sc = statusColors[s.status]
          return (
            <div key={i} style={{ ...sty.sensorCard, borderLeft: `4px solid ${s.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s` }}>
              {/* Row 1: Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{s.name}</span>
                    <span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{s.status}</span>
                    <span style={{ ...sty.statusPill, background: '#f1f5f9', color: '#64748b' }}>{s.zone}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: 600, marginBottom: '2px' }}>{s.hardware}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc, animation: s.status !== 'normal' ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontSize: '10px', color: sc, fontWeight: 700 }}>LIVE</span>
                </div>
              </div>

              {/* Row 2: Location + Installation + Why It Matters */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '1px' }}>INSTALLED AT</div>
                      <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500 }}>{s.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></svg>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '1px' }}>SETUP</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{s.installed}</div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#fefce8', borderRadius: '8px', padding: '10px', border: '1px solid #fef08a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    <span style={{ fontSize: '10px', color: '#ca8a04', fontWeight: 700 }}>WHY IT MATTERS</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#713f12', lineHeight: '1.5' }}>{s.whyItMatters}</div>
                </div>
              </div>

              {/* Row 3: Live Readings + Visualization */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                {/* Readings */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                  {s.readings.map((r, ri) => (
                    <div key={ri} style={{ background: r.ok ? '#f8fafc' : `${RED}08`, borderRadius: '8px', padding: '8px 12px', border: `1px solid ${r.ok ? '#f1f5f9' : `${RED}20`}`, minWidth: '90px', flex: '1 1 90px' }}>
                      <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>{r.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: r.ok ? '#1e293b' : RED }}>{r.value}</div>
                    </div>
                  ))}
                </div>
                {/* Visualization */}
                <div style={{ width: '200px', minWidth: '200px', background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>LIVE SIGNAL</div>
                  {s.vizType === 'waveform' && <Waveform data={s.vizData} color={s.color} height={40} />}
                  {s.vizType === 'heatmap' && <MiniHeatmap data={s.vizData} />}
                  {s.vizType === 'bars' && <MiniBars data={s.vizData} color={s.color} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── PLANT MAP TAB ───
function PlantMapTab() {
  return (
    <Section title="Plant Layout — Sensor Zone Map" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}>
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div style={{ position: 'relative', height: '240px' }}>
          {plantZones.map((zone, i) => {
            const zoneColors = { normal: BLUE, warning: AMBER, critical: RED }
            const zc = zoneColors[zone.status]
            return (
              <div key={i} style={{
                position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`,
                background: '#fff', border: `1.5px solid ${zc}40`, borderRadius: '8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'default',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b', textAlign: 'center' }}>{zone.name}</div>
                <div style={{ fontSize: '9px', color: zc, fontWeight: 600, marginTop: '2px' }}>{zone.sensors} sensors</div>
                {zone.status !== 'normal' && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: zc, marginTop: '4px', animation: 'pulse 1.5s infinite' }} />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', position: 'relative' }}>
          {[{ label: 'Normal', color: BLUE }, { label: 'Warning', color: AMBER }, { label: 'Critical', color: RED }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '16px' }}>
        {plantZones.map((z, i) => {
          const zc = z.status === 'critical' ? RED : z.status === 'warning' ? AMBER : GREEN
          return (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{z.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: zc, margin: '4px 0' }}>{z.sensors}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>sensors</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── ALERTS & METRICS TAB ───
function AlertsMetricsTab() {
  return (
    <>
      <Section title="Real-Time AI Alerts" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((a, i) => {
            const sevColors = { critical: RED, warning: AMBER, info: BLUE }
            const c = sevColors[a.severity]
            return (
              <div key={i} style={{ ...sty.alertCard, borderLeft: `3px solid ${c}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ ...sty.statusPill, background: `${c}15`, color: c }}>{a.severity}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.sensor}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.time}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.6' }}>{a.msg}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Key Performance Metrics" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
          {keyMetrics.map((m, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── INFRA TAB ───
function InfraTab() {
  return (
    <Section title="Edge Computing Infrastructure" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {[
          { name: 'NVIDIA Jetson AGX Orin', role: 'Edge AI Inference', count: '12 nodes', specs: ['Per-zone deployment', 'Real-time anomaly pre-filter', '< 10ms edge inference', 'Industrial Ethernet 1 Gbps'], load: 78, color: GREEN },
          { name: 'NVIDIA A100 GPU Server', role: 'Central AI + Physics Sim', count: '4x A100 80GB', specs: ['NVLink 600 GB/s', 'Physics simulation + ML training', 'vLLM inference server', '2,400 inferences/sec'], load: 82, color: BLUE },
          { name: 'TimescaleDB Cluster', role: 'Time-Series Database', count: '48 TB NVMe', specs: ['1.2M data points/sec ingestion', '< 5ms query latency (p99)', '5-year retention (tiered)', 'Real-time downsampling'], load: 65, color: ACCENT },
          { name: 'OPC-UA Gateway', role: 'Protocol Translation', count: '4 gateways', specs: ['OPC-UA, Modbus TCP/RTU', 'MQTT, PROFINET, IEC 61850', 'EtherNet/IP bridge', '< 20ms end-to-end latency'], load: 45, color: CYAN },
          { name: 'Network & Security', role: 'Air-Gapped OT Network', count: 'DMZ Architecture', specs: ['Palo Alto PA-5200 firewall', 'TLS 1.3 + WireGuard VPN', 'IEC 62443 compliance', 'Daily snapshot backup'], load: 0, color: RED },
          { name: 'Visualization Server', role: '3D Twin Rendering', count: '2x RTX 4090', specs: ['Three.js + WebGPU backend', '4K @ 60fps WebRTC stream', 'Up to 50 concurrent clients', 'Real-time point cloud'], load: 58, color: AMBER },
        ].map((infra, i) => (
          <div key={i} style={{ ...sty.infraCard, borderLeft: `3px solid ${infra.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{infra.name}</div>
                <div style={{ fontSize: '10px', color: infra.color, fontWeight: 600 }}>{infra.role}</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>{infra.count}</span>
            </div>
            {infra.load > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Load</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: infra.load > 80 ? AMBER : GREEN }}>{infra.load}%</span>
                </div>
                <ProgressBar value={infra.load} color={infra.load > 80 ? AMBER : GREEN} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {infra.specs.map((sp, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: infra.color, flexShrink: 0, opacity: 0.6 }} />
                  {sp}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Data Sovereignty */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>100% On-Premise Data Sovereignty</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>All 2,847 sensor streams processed locally. Zero cloud dependency. Air-gapped OT/IT network with IEC 62443 compliance.</div>
        </div>
      </div>
    </Section>
  )
}

// ─── STYLES ───
const sty = {
  page: { animation: 'fadeUp 0.6s ease' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionIcon: { width: '34px', height: '34px', borderRadius: '8px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' },
  sensorCard: { background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  alertCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  infraCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  statusPill: { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
}

export default SmartSensors
