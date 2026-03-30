'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const ORANGE = '#f97316'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function Waveform({ data, color, height = 36 }) {
  const ref = useRef(null); const [w, setW] = useState(120)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height}><defs><linearGradient id={`wg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#wg-${color.replace('#','')})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg></div>)
}

function MiniHeatmap({ data }) {
  const cols = data[0]?.length || 8
  return (<div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px', borderRadius: '4px', overflow: 'hidden' }}>{data.flat().map((v, i) => { const t = Math.min(v / 100, 1); const c = t > 0.8 ? RED : t > 0.6 ? ORANGE : t > 0.3 ? AMBER : GREEN; return <div key={i} style={{ height: '10px', background: c, opacity: 0.3 + t * 0.7, borderRadius: '1px' }} /> })}</div>)
}

function MiniBars({ data, color }) {
  const max = Math.max(...data) * 1.1
  return (<div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '36px' }}>{data.map((v, i) => (<div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: color, borderRadius: '2px 2px 0 0', opacity: 0.4 + (v / max) * 0.6 }} />))}</div>)
}

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (<div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}><div style={sty.sectionHeader}><div style={sty.sectionIcon}>{icon}</div><h2 style={sty.sectionTitle}>{title}</h2></div>{visible && children}</div>)
}

// ══════════════════════════════════════════════════
// STEEL PLANT SENSOR DATA
// ══════════════════════════════════════════════════

const sensors = [
  {
    name: 'BF Stockline Radar',
    hardware: 'VEGA VEGAPULS 69 (79 GHz)',
    location: 'Blast Furnace #1 — Top cone, 4 probes at 90° intervals',
    installed: '4-point radar array through armored nozzles, dust-resistant ceramic antenna, compensated for 250°C gas temperature',
    whyItMatters: 'Maps burden surface profile in real-time. Detects channeling, hanging, and asymmetric descent within 30 seconds — prevents slips that can damage tuyeres and cause breakouts.',
    status: 'normal', zone: 'Blast Furnace', color: RED,
    readings: [{ label: 'Stockline', value: '1.2m', ok: true }, { label: 'Symmetry', value: '98.4%', ok: true }, { label: 'Descent Rate', value: '4.8 m/hr', ok: true }, { label: 'Scan Rate', value: '2 sec', ok: true }],
    vizType: 'waveform', vizData: [1.18, 1.22, 1.20, 1.19, 1.21, 1.20, 1.22, 1.18, 1.20, 1.21, 1.19, 1.20, 1.22, 1.20, 1.19],
  },
  {
    name: 'Tuyere Monitoring Camera',
    hardware: 'DIAS PYROVIEW 768N + Periscope Optics',
    location: 'Blast Furnace #1 — 8 tuyere peepholes (of 32 total)',
    installed: 'Water-cooled periscope with sapphire window, IR pyrometry + visible camera, 25fps continuous, AI raceway analysis',
    whyItMatters: 'Monitors raceway depth, shape, and brightness in real-time. AI detects tuyere burnout initiation, PCI lance blockage, and abnormal combustion patterns 15 minutes before alarms.',
    status: 'normal', zone: 'Blast Furnace', color: ORANGE,
    readings: [{ label: 'Raceway Depth', value: '1.8m', ok: true }, { label: 'Brightness', value: '2,180°C', ok: true }, { label: 'PCI Burnout', value: '92.4%', ok: true }, { label: 'Active Cams', value: '8/8', ok: true }],
    vizType: 'heatmap', vizData: [[85, 90, 88, 92, 95, 90, 88, 85], [82, 88, 86, 90, 92, 88, 85, 82], [80, 85, 84, 88, 90, 86, 82, 80]],
  },
  {
    name: 'Hearth Thermocouple Array',
    hardware: 'Type-K & Type-N Embedded Thermocouples (Heraeus)',
    location: 'BF #1 Hearth — 128 sensors in sidewall, bottom, and taphole region',
    installed: '128 thermocouples embedded at 3 depths (50mm, 150mm, 300mm from hot face) across 6 elevation levels. Connected via compensating cables to DCS.',
    whyItMatters: 'Primary hearth erosion monitoring system. AI inverse heat transfer model calculates remaining refractory thickness from temperature gradients. Taphole region at 62% — triggers campaign planning.',
    status: 'warning', zone: 'BF Hearth', color: RED,
    readings: [{ label: 'Max Temp', value: '420°C', ok: false }, { label: 'Avg Sidewall', value: '285°C', ok: true }, { label: 'Bottom', value: '180°C', ok: true }, { label: 'Sensors', value: '128/128', ok: true }],
    vizType: 'heatmap', vizData: [[35, 42, 55, 72, 85, 78, 62, 48], [30, 38, 50, 68, 82, 75, 58, 42], [25, 32, 45, 62, 78, 70, 52, 38]],
  },
  {
    name: 'BOF Sublance & Off-Gas Analyzer',
    hardware: 'Danieli Q-MIDAS Sublance + ABB ACF5000 Off-Gas',
    location: 'BOF Converter #1 — Sublance port + hood gas duct',
    installed: 'Sublance: disposable sensor cartridge (temp, carbon, oxygen) at 12m immersion. Off-gas: laser-based CO/CO₂/O₂ analysis at 1-second intervals.',
    whyItMatters: 'Enables AI endpoint prediction — 97.2% first-hit accuracy for carbon and temperature. Eliminated re-blowing, saving 1.8 min per heat and reducing Mn losses.',
    status: 'normal', zone: 'Steelmaking', color: ACCENT,
    readings: [{ label: '[C] End', value: '0.04%', ok: true }, { label: 'Bath Temp', value: '1,652°C', ok: true }, { label: 'CO/CO₂', value: '1.42', ok: true }, { label: 'Hit Rate', value: '97.2%', ok: true }],
    vizType: 'waveform', vizData: [65, 72, 78, 82, 85, 80, 75, 68, 62, 58, 52, 48, 42, 38, 35],
  },
  {
    name: 'Mold Level Sensor (Eddy Current)',
    hardware: 'Berthold LB 479 Radiometric + AMEPA Eddy Current',
    location: 'Continuous Caster #1 — Mold copper plate (all 4 strands)',
    installed: 'Non-contact eddy current sensor embedded in mold copper plate, 1000 Hz sampling. Backup: Co-60 radiometric level gauge.',
    whyItMatters: 'Mold level stability directly controls surface quality and breakout risk. AI breakout prediction system (99.1% accuracy) uses this sensor as primary input. Prevented 8 breakouts this year.',
    status: 'normal', zone: 'Casting', color: BLUE,
    readings: [{ label: 'Level', value: '78.2%', ok: true }, { label: 'Stability', value: '±1.2mm', ok: true }, { label: 'Breakout Risk', value: '0.02%', ok: true }, { label: 'Sampling', value: '1000 Hz', ok: true }],
    vizType: 'waveform', vizData: [78, 78.5, 77.8, 78.2, 78.4, 77.9, 78.1, 78.3, 77.8, 78.2, 78.5, 78.0, 78.2, 78.4, 78.1],
  },
  {
    name: 'Slab Surface Inspection (CNN)',
    hardware: 'ISRA VISION SURFACE MASTER + FLIR A8580',
    location: 'Continuous Caster Exit + Hot Rolling Mill Entry',
    installed: '8 high-speed line-scan cameras (4096 px, 120 Hz) + 2 thermal IR cameras. Edge AI: NVIDIA Jetson AGX Orin. CNN model trained on 240,000 defect images.',
    whyItMatters: 'Detects surface cracks, oscillation marks, inclusions, and scale defects at casting speed. Defect rate reduced 29% this quarter through real-time feedback to casting parameters.',
    status: 'normal', zone: 'Casting + Rolling', color: GREEN,
    readings: [{ label: 'Defect Rate', value: '0.32%', ok: true }, { label: 'Precision', value: '97.8%', ok: true }, { label: 'Recall', value: '96.1%', ok: true }, { label: 'Latency', value: '85ms', ok: true }],
    vizType: 'bars', vizData: [0.45, 0.42, 0.38, 0.35, 0.40, 0.36, 0.32, 0.35, 0.33, 0.30, 0.34, 0.32],
  },
  {
    name: 'Rolling Mill Vibration System',
    hardware: 'SKF Multilog IMx-16 + Bently Nevada 3500',
    location: 'Hot Strip Mill — 7 stands (F1-F7), backup rolls, spindles',
    installed: '64 accelerometers (ICP type) on bearing housings, gearboxes, and motor frames. Continuous monitoring at 25.6 kHz sampling.',
    whyItMatters: 'Stand #3 detected at 5.8 mm/s — pattern matches inner-race bearing defect. AI predicts failure in 72 hours. Scheduled replacement during next roll change saves ₹85L unplanned downtime.',
    status: 'critical', zone: 'Hot Rolling', color: RED,
    readings: [{ label: 'Stand #3', value: '5.8 mm/s', ok: false }, { label: 'Threshold', value: '4.5 mm/s', ok: true }, { label: 'BPFI', value: '142 Hz', ok: false }, { label: 'Sensors', value: '64/64', ok: true }],
    vizType: 'waveform', vizData: [2.8, 3.1, 3.4, 3.8, 4.2, 4.5, 4.8, 5.1, 5.4, 5.6, 5.8, 5.7, 5.8, 5.9, 5.8],
  },
  {
    name: 'Coke Oven Gas Analyzer',
    hardware: 'Siemens ULTRAMAT 23 + OXYMAT 6',
    location: 'Coke Oven Battery #1 — Collecting Main, By-Product Plant',
    installed: 'Extractive sampling at 6 points. NDIR/paramagnetic analysis of H₂, CH₄, CO, CO₂, O₂, H₂S. Auto-calibration every 4 hours.',
    whyItMatters: 'Real-time COG quality monitoring ensures safe utilization. H₂S alarm at 200 ppm triggers desulphurization plant bypass. AI correlates gas composition with coking time and coal blend.',
    status: 'normal', zone: 'Coke Oven', color: AMBER,
    readings: [{ label: 'H₂', value: '58.2%', ok: true }, { label: 'CH₄', value: '24.8%', ok: true }, { label: 'CO', value: '6.4%', ok: true }, { label: 'H₂S', value: '42 ppm', ok: true }],
    vizType: 'waveform', vizData: [58, 57.5, 58.2, 58.8, 57.8, 58.4, 58.2, 57.6, 58.0, 58.5, 57.9, 58.2, 58.4, 57.8, 58.2],
  },
  {
    name: 'LiDAR Stockpile Scanner',
    hardware: 'Riegl VZ-2000i + CloudCompare',
    location: 'Raw Material Stockyard — 4 scan positions covering 180,000 MT area',
    installed: '4 scanning positions on 18m towers. 360° scan every 12 seconds. IP67 enclosure, dust/rain resistant. ±5mm accuracy at 200m range.',
    whyItMatters: 'Replaces weekly manual surveying with continuous volume measurement. AI forecasts material consumption and triggers procurement 48 hours before stockout.',
    status: 'normal', zone: 'Stockyard', color: CYAN,
    readings: [{ label: 'Points', value: '4.8M', ok: true }, { label: 'Total Volume', value: '128,400 MT', ok: true }, { label: 'Capacity', value: '71.3%', ok: true }, { label: 'Scan Cycle', value: '12 sec', ok: true }],
    vizType: 'bars', vizData: [72, 68, 74, 70, 66, 72, 75, 71, 69, 73, 76, 74],
  },
  {
    name: 'Wearable Safety IoT (Personnel)',
    hardware: 'Dräger X-am 8000 + Quuppa UWB Tag',
    location: 'All Personnel — Integrated safety vests + helmet-mounted sensors',
    installed: '48 active units with 5-gas detector (CO, H₂S, O₂, LEL, SO₂), man-down sensor, UWB indoor positioning (±20cm), panic button, heat stress monitor.',
    whyItMatters: 'Real-time worker location in hazardous zones (BF cast house, coke oven top, gas holder area). Evacuated 5 workers from CO leak zone in 38 seconds last month.',
    status: 'normal', zone: 'Plant-wide', color: GREEN,
    readings: [{ label: 'Active', value: '48', ok: true }, { label: 'Hazard Zone', value: '4', ok: true }, { label: 'Gas Alerts', value: '0', ok: true }, { label: 'Zones', value: '12', ok: true }],
    vizType: 'bars', vizData: [48, 45, 50, 47, 48, 52, 50, 48, 46, 49, 51, 48],
  },
  {
    name: 'Electromagnetic Stirrer (EMS) Sensor',
    hardware: 'ABB AMS (Strand EMS) + Rotelec In-Mold EMS',
    location: 'Continuous Caster #1 — Mold EMS + Final EMS (4 strands)',
    installed: 'In-mold stirrer: 320A, 4 Hz. Final EMS: 450A, 6 Hz. Current, frequency, and magnetic field monitored at 100 Hz. Temperature sensors on coil cooling circuit.',
    whyItMatters: 'Controls solidification structure — equiaxed crystal ratio, centerline segregation, and porosity. AI adjusts EMS parameters per grade for optimal internal quality.',
    status: 'normal', zone: 'Casting', color: ACCENT,
    readings: [{ label: 'Mold Current', value: '320 A', ok: true }, { label: 'Final Current', value: '450 A', ok: true }, { label: 'Coil Temp', value: '58°C', ok: true }, { label: 'Equiaxed %', value: '68%', ok: true }],
    vizType: 'waveform', vizData: [318, 320, 322, 319, 321, 320, 318, 322, 320, 319, 321, 320, 318, 320, 322],
  },
  {
    name: 'Digital Twin Data Fusion Hub',
    hardware: 'Dell PowerEdge R750xa + TimescaleDB + OPC-UA Gateway',
    location: 'Server Room — Central Data Aggregation',
    installed: 'All 4,128 sensor streams fused via Kepware OPC-UA gateway into physics-based digital twin. LSTM + CFD models run at 1.5ms sync cycle.',
    whyItMatters: 'Unifies all sensor data into one coherent plant model. Enables cross-process optimization — e.g., correlating BF thermal state with BOF blow parameters and caster quality.',
    status: 'normal', zone: 'All Zones', color: BLUE,
    readings: [{ label: 'Streams', value: '4,128', ok: true }, { label: 'Sync', value: '99.8%', ok: true }, { label: 'Latency', value: '1.5 ms', ok: true }, { label: 'Models', value: '8 active', ok: true }],
    vizType: 'waveform', vizData: [99.5, 99.6, 99.7, 99.8, 99.7, 99.8, 99.6, 99.8, 99.7, 99.8, 99.8, 99.7, 99.8, 99.8, 99.8],
  },
]

const alerts = [
  { time: '2 min ago', severity: 'critical', msg: 'Rolling Mill Stand #3 vibration at 5.8 mm/s — bearing inner-race defect pattern confirmed by AI envelope analysis.', sensor: 'Vibration System' },
  { time: '12 min ago', severity: 'warning', msg: 'BF Hearth thermocouple T-14 at 420°C — taphole region refractory at 62%. Erosion rate 0.8mm/week.', sensor: 'Hearth TC Array' },
  { time: '25 min ago', severity: 'info', msg: 'LiDAR stockpile scan: Iron ore fines at 48,500 MT (57% capacity). PCI coal at 9,800 MT — below reorder point.', sensor: 'LiDAR Scanner' },
  { time: '38 min ago', severity: 'info', msg: 'Slab surface inspection: 3 scale pits detected on last slab — localized to strip center. Descaler #2 check recommended.', sensor: 'CNN Vision' },
  { time: '52 min ago', severity: 'warning', msg: 'BOF off-gas CO/CO₂ ratio spike during Heat H-1044. Blow dynamics adjusted automatically by AI endpoint controller.', sensor: 'BOF Off-Gas' },
  { time: '1h ago', severity: 'info', msg: 'Coke oven gas H₂S at 42 ppm — well within limit (200 ppm). Gas quality stable for BF injection use.', sensor: 'Gas Analyzer' },
]

const keyMetrics = [
  { label: 'Overall Sensor Uptime', value: '99.6%', color: GREEN },
  { label: 'Sensors Online', value: '4,128 / 4,156', color: BLUE },
  { label: 'AI Alerts Today', value: '42', color: ORANGE },
  { label: 'Critical Alerts', value: '1', color: RED },
  { label: 'Equipment Health Index', value: '92.8%', color: GREEN },
  { label: 'Emission Compliance', value: '96.8%', color: CYAN },
  { label: 'Data Throughput', value: '2.4 GB/min', color: ACCENT },
  { label: 'Edge Processing', value: '82% on-edge', color: AMBER },
]

const plantZones = [
  { name: 'Coke Oven', sensors: 186, status: 'normal', x: 2, y: 12, w: 12, h: 30 },
  { name: 'Sinter Plant', sensors: 142, status: 'normal', x: 16, y: 12, w: 12, h: 30 },
  { name: 'BF #1', sensors: 380, status: 'warning', x: 30, y: 5, w: 10, h: 42 },
  { name: 'BF #2', sensors: 340, status: 'normal', x: 42, y: 5, w: 10, h: 42 },
  { name: 'BOF / SMS', sensors: 420, status: 'normal', x: 54, y: 12, w: 14, h: 30 },
  { name: 'Caster', sensors: 280, status: 'normal', x: 70, y: 12, w: 12, h: 30 },
  { name: 'Rolling Mill', sensors: 320, status: 'critical', x: 84, y: 12, w: 13, h: 30 },
  { name: 'Stockyard', sensors: 85, status: 'normal', x: 2, y: 58, w: 18, h: 22 },
  { name: 'Power Plant', sensors: 165, status: 'normal', x: 22, y: 58, w: 14, h: 22 },
  { name: 'O₂ / Gas', sensors: 110, status: 'normal', x: 38, y: 58, w: 12, h: 22 },
  { name: 'Utilities', sensors: 180, status: 'normal', x: 52, y: 58, w: 14, h: 22 },
  { name: 'FG Yard', sensors: 48, status: 'normal', x: 68, y: 58, w: 12, h: 22 },
]

const edgeInfra = [
  { name: 'Edge-Node-01 (BF)', type: 'NVIDIA Jetson AGX Orin 64GB', gpuUtil: 72, cpuUtil: 48, ram: 78, temp: 62, status: 'Online', models: 4, inferRate: 280 },
  { name: 'Edge-Node-02 (BOF/Caster)', type: 'NVIDIA Jetson AGX Orin 64GB', gpuUtil: 65, cpuUtil: 42, ram: 68, temp: 58, status: 'Online', models: 3, inferRate: 220 },
  { name: 'Edge-Node-03 (Rolling Mill)', type: 'NVIDIA Jetson Orin NX 16GB', gpuUtil: 88, cpuUtil: 65, ram: 85, temp: 68, status: 'Online', models: 2, inferRate: 150 },
  { name: 'Edge-Node-04 (Vision/QC)', type: 'NVIDIA A2 Server 16GB', gpuUtil: 91, cpuUtil: 48, ram: 72, temp: 71, status: 'Online', models: 4, inferRate: 380 },
  { name: 'AI-Server-Primary', type: 'Dell R750xa + 2x A100 80GB', gpuUtil: 58, cpuUtil: 35, ram: 52, temp: 55, status: 'Online', models: 6, inferRate: 520 },
  { name: 'Data-Server-01', type: 'Dell R740xd (TimescaleDB)', gpuUtil: 0, cpuUtil: 62, ram: 78, temp: 48, status: 'Online', models: 0, inferRate: 0 },
]

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

export default function SmartSensors() {
  const [activeTab, setActiveTab] = useState('grid')

  const TABS = [
    { key: 'grid', label: 'Sensor Grid' },
    { key: 'map', label: 'Plant Map' },
    { key: 'alerts', label: 'Alerts & Metrics' },
    { key: 'infra', label: 'Edge Infrastructure' },
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
            <p style={sty.pageSub}>AI-integrated industrial IoT sensor network — 4,128 sensors across 12 plant zones</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> 4,128 Sensors Live</span>
          <span style={{ ...sty.liveBadge, background: '#fef2f2', color: RED, borderColor: '#fecaca' }}>
            <span style={{ ...sty.liveDot, background: RED, animation: 'pulse 1.5s infinite' }} /> 1 Critical
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={sty.tabs}>
        {TABS.map(t => (<button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.label}</button>))}
      </div>

      {activeTab === 'grid' && <SensorGridTab />}
      {activeTab === 'map' && <PlantMapTab />}
      {activeTab === 'alerts' && <AlertsMetricsTab />}
      {activeTab === 'infra' && <InfraTab />}
    </div>
  )
}

function SensorGridTab() {
  return (
    <Section title="Sensor Network — 12 Active Modules" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sensors.map((s, i) => {
          const statusColors = { normal: GREEN, warning: AMBER, critical: RED }
          const sc = statusColors[s.status]
          return (
            <div key={i} style={{ ...sty.sensorCard, borderLeft: `4px solid ${s.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{s.name}</span>
                    <span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{s.status}</span>
                    <span style={{ ...sty.statusPill, background: '#f1f5f9', color: '#64748b' }}>{s.zone}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: 600 }}>{s.hardware}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc, animation: s.status !== 'normal' ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontSize: '10px', color: sc, fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div><div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '1px' }}>INSTALLED AT</div><div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500 }}>{s.location}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop: '2px', flexShrink: 0 }}><circle cx="12" cy="12" r="3" /></svg>
                    <div><div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '1px' }}>SETUP</div><div style={{ fontSize: '11px', color: '#64748b' }}>{s.installed}</div></div>
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
              <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                  {s.readings.map((r, ri) => (
                    <div key={ri} style={{ background: r.ok ? '#f8fafc' : `${RED}08`, borderRadius: '8px', padding: '8px 12px', border: `1px solid ${r.ok ? '#f1f5f9' : `${RED}20`}`, minWidth: '90px', flex: '1 1 90px' }}>
                      <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>{r.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: r.ok ? '#1e293b' : RED }}>{r.value}</div>
                    </div>
                  ))}
                </div>
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

function PlantMapTab() {
  return (
    <Section title="Steel Plant Layout — Sensor Zone Map" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}>
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div style={{ position: 'relative', height: '260px' }}>
          {plantZones.map((zone, i) => {
            const zoneColors = { normal: BLUE, warning: AMBER, critical: RED }
            const zc = zoneColors[zone.status]
            return (
              <div key={i} style={{ position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`, background: '#fff', border: `1.5px solid ${zc}40`, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b', textAlign: 'center' }}>{zone.name}</div>
                <div style={{ fontSize: '9px', color: zc, fontWeight: 600, marginTop: '2px' }}>{zone.sensors}</div>
                {zone.status !== 'normal' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: zc, marginTop: '4px', animation: 'pulse 1.5s infinite' }} />}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', position: 'relative' }}>
          {[{ label: 'Normal', color: BLUE }, { label: 'Warning', color: AMBER }, { label: 'Critical', color: RED }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} /><span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span></div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '16px' }}>
        {plantZones.map((z, i) => {
          const zc = z.status === 'critical' ? RED : z.status === 'warning' ? AMBER : BLUE
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '10px', textAlign: 'center', borderTop: `3px solid ${zc}` }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{z.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: zc, marginTop: '4px' }}>{z.sensors}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>sensors</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function AlertsMetricsTab() {
  return (
    <>
      <Section title="Key Metrics" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {keyMetrics.map((m, i) => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '16px', textAlign: 'center', borderTop: `3px solid ${m.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.06}s` }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Recent Sensor Alerts" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map((a, i) => {
            const sevColors = { critical: RED, warning: AMBER, info: BLUE }
            const sc = sevColors[a.severity]
            return (
              <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '14px 16px', borderLeft: `4px solid ${sc}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{a.severity}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.time}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: ACCENT, background: `${ACCENT}12`, padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{a.sensor}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.6' }}>{a.msg}</div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

function InfraTab() {
  return (
    <Section title="Edge & AI Infrastructure" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {edgeInfra.map((node, i) => {
          const gpuColor = node.gpuUtil > 85 ? AMBER : node.gpuUtil > 60 ? ACCENT : GREEN
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '16px', animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${GREEN}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{node.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{node.type}</div>
                </div>
                <span style={{ ...sty.statusPill, background: `${GREEN}15`, color: GREEN }}>{node.status}</span>
              </div>
              {node.gpuUtil > 0 && <div style={{ marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>GPU</span><span style={{ fontWeight: 600, color: gpuColor }}>{node.gpuUtil}%</span></div><ProgressBar value={node.gpuUtil} color={gpuColor} /></div>}
              <div style={{ marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>CPU</span><span style={{ fontWeight: 600 }}>{node.cpuUtil}%</span></div><ProgressBar value={node.cpuUtil} color={BLUE} /></div>
              <div style={{ marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}><span style={{ color: '#64748b' }}>RAM</span><span style={{ fontWeight: 600 }}>{node.ram}%</span></div><ProgressBar value={node.ram} color={ACCENT} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '10px' }}>
                <span style={{ color: '#64748b' }}>Models: <strong>{node.models}</strong></span>
                <span style={{ color: '#64748b' }}>Temp: <strong>{node.temp}°C</strong></span>
                {node.inferRate > 0 && <span style={{ color: ACCENT, fontWeight: 600 }}>{node.inferRate} inf/min</span>}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

const sty = {
  page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  section: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  sensorCard: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  statusPill: { fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' },
}
