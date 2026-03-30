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

// ── SOFTWARE INTEGRATIONS DATA ──
const softwareIntegrations = [
  {
    name: 'SAP S/4HANA',
    vendor: 'SAP SE',
    version: 'v2023.2',
    status: 'connected',
    lastSync: '2 min ago',
    dataFlow: '2,400 records/hr',
    description: 'ERP integration for finance, procurement & inventory. Syncs production orders, material movements, and cost centers in real-time.',
    uptime: 99.8,
    color: BLUE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    name: 'SAP PM (Plant Maintenance)',
    vendor: 'SAP SE',
    version: 'v2023.2',
    status: 'connected',
    lastSync: '5 min ago',
    dataFlow: '850 records/hr',
    description: 'Work order sync, equipment master data & maintenance history. Bi-directional sync for planned and corrective maintenance workflows.',
    uptime: 99.5,
    color: BLUE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  },
  {
    name: 'MES (Manufacturing Execution)',
    vendor: 'Siemens Opcenter',
    version: 'v14.1',
    status: 'connected',
    lastSync: '< 1 min ago',
    dataFlow: '12,000 events/hr',
    description: 'Real-time production tracking, batch management & quality data. Manages recipe execution and operator work instructions.',
    uptime: 99.9,
    color: GREEN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    name: 'ABB Ability SCADA',
    vendor: 'ABB Ltd.',
    version: 'v6.2.1',
    status: 'connected',
    lastSync: 'Real-time',
    dataFlow: '48,000 tags/sec',
    description: 'Process control data acquisition from kiln, raw mill & cement mill. Real-time supervisory control with alarm management.',
    uptime: 99.95,
    color: ORANGE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>,
  },
  {
    name: 'OSIsoft PI Historian',
    vendor: 'AVEVA (OSIsoft)',
    version: 'v2024',
    status: 'connected',
    lastSync: 'Real-time',
    dataFlow: '180,000 points/min',
    description: 'Time-series data storage with 2+ years history & trend analysis. Serves as the single source of truth for all process data.',
    uptime: 99.99,
    color: ACCENT,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    name: 'LIMS (Laboratory)',
    vendor: 'Thermo Fisher',
    version: 'v11.3',
    status: 'connected',
    lastSync: '12 min ago',
    dataFlow: '320 samples/day',
    description: 'Quality test results, raw material analysis & clinker chemistry. Auto-imports XRF/XRD results for real-time quality feedback.',
    uptime: 98.5,
    color: CYAN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v7l4 9H5l4-9V3z" /><line x1="9" y1="3" x2="15" y2="3" /></svg>,
  },
  {
    name: 'Maximo (Asset Management)',
    vendor: 'IBM',
    version: 'v8.4',
    status: 'connected',
    lastSync: '8 min ago',
    dataFlow: '1,200 records/hr',
    description: 'Asset registry, spare parts management & condition monitoring integration. Tracks full asset lifecycle and failure codes.',
    uptime: 99.2,
    color: BLUE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" /></svg>,
  },
  {
    name: 'Power BI / Analytics',
    vendor: 'Microsoft',
    version: 'v2024.03',
    status: 'connected',
    lastSync: 'Real-time push',
    dataFlow: 'Real-time push',
    description: 'Dashboard sync, KPI export & executive reporting. DirectQuery mode for live dashboards, scheduled refresh for historical.',
    uptime: 99.6,
    color: AMBER,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
  {
    name: 'CEMS (Emissions)',
    vendor: 'Sick AG',
    version: 'v5.1',
    status: 'connected',
    lastSync: 'Real-time',
    dataFlow: '4 stacks, 1-min intervals',
    description: 'Continuous emission monitoring & compliance reporting to CPCB/SPCB. Tracks SOx, NOx, PM, CO2 across all stacks.',
    uptime: 99.7,
    color: GREEN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16s1.5-2 4-2 4 2 4 2" /><path d="M12 12V2" /><path d="M5 19.5S3 22 3 22h18s-2-2.5-2-2.5" /></svg>,
  },
  {
    name: 'Weighbridge System',
    vendor: 'Mettler Toledo',
    version: 'v3.8',
    status: 'connected',
    lastSync: '1 min ago',
    dataFlow: '180 trucks/day',
    description: 'Inbound/outbound material weighment & truck tracking. RFID-enabled auto-capture with ERP posting and gate pass generation.',
    uptime: 99.3,
    color: CYAN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="2" /><path d="M6 12h12" /></svg>,
  },
]

// ── HARDWARE INTEGRATIONS DATA ──
const hardwareIntegrations = [
  {
    name: 'PLC Network (Siemens S7-1500)',
    status: 'connected',
    protocol: 'OPC-UA',
    scanRate: '100ms',
    description: '42 PLCs across plant controlling kiln drive, raw mill, cement mill, packing, utilities. Fully redundant with hot-standby.',
    color: BLUE,
    distribution: [
      { area: 'Kiln area', count: 8 },
      { area: 'Raw mill', count: 6 },
      { area: 'Cement mill', count: 6 },
      { area: 'Packing', count: 4 },
      { area: 'Coal mill', count: 3 },
      { area: 'Utilities', count: 8 },
      { area: 'WHR', count: 4 },
      { area: 'Conveyor', count: 3 },
    ],
    stats: [{ label: 'Total PLCs', value: '42' }, { label: 'Protocol', value: 'OPC-UA' }, { label: 'Scan Rate', value: '100ms' }, { label: 'Redundancy', value: 'Hot Standby' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /></svg>,
  },
  {
    name: 'DCS (ABB 800xA)',
    status: 'connected',
    protocol: 'Ethernet/IP',
    scanRate: '250ms',
    description: 'Central process control with 2,847 I/O points. Controls kiln firing, raw meal feed, cooler operation & coal mill.',
    color: ORANGE,
    stats: [{ label: 'I/O Points', value: '2,847' }, { label: 'Redundancy', value: 'Active/Standby' }, { label: 'Network', value: 'Dual Ring Ethernet' }, { label: 'Controllers', value: '6 pairs' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  },
  {
    name: 'SCADA Servers',
    status: 'connected',
    protocol: 'OPC-UA / DA',
    scanRate: '1 second',
    description: '4 redundant servers managing 48,000 live tags. Data refresh every 1 second. Historian retention: 5 years.',
    color: ACCENT,
    servers: [
      { name: 'SCADA-SRV-01', role: 'Primary', cpu: 42, memory: 68 },
      { name: 'SCADA-SRV-02', role: 'Secondary', cpu: 38, memory: 62 },
      { name: 'SCADA-SRV-03', role: 'Historian', cpu: 55, memory: 74 },
      { name: 'SCADA-SRV-04', role: 'DR Standby', cpu: 12, memory: 28 },
    ],
    stats: [{ label: 'Servers', value: '4 (Redundant)' }, { label: 'Live Tags', value: '48,000' }, { label: 'Refresh Rate', value: '1 sec' }, { label: 'Retention', value: '5 years' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  },
  {
    name: 'IoT Sensor Gateway',
    status: 'connected',
    protocol: 'MQTT, Modbus TCP, OPC-UA',
    scanRate: 'Event-driven',
    description: '486 IoT sensors plant-wide connected via 6x Siemens IOT2050 gateway devices. Multi-protocol data aggregation.',
    color: GREEN,
    distribution: [
      { area: 'Temperature', count: 142 },
      { area: 'Vibration', count: 96 },
      { area: 'Pressure', count: 84 },
      { area: 'Flow', count: 62 },
      { area: 'Level', count: 48 },
      { area: 'Gas analyzer', count: 32 },
      { area: 'Acoustic', count: 22 },
    ],
    stats: [{ label: 'Total Sensors', value: '486' }, { label: 'Gateways', value: '6x IOT2050' }, { label: 'Protocols', value: 'MQTT/Modbus/OPC' }, { label: 'Uptime', value: '99.8%' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    name: 'Smart Camera Network',
    status: 'connected',
    protocol: 'RTSP / GigE Vision',
    scanRate: '30 fps',
    description: '24 AI vision cameras with 4K resolution. Edge AI processing on NVIDIA Jetson for real-time anomaly detection.',
    color: CYAN,
    detectionTypes: ['Belt wear detection', 'Material flow analysis', 'Safety zone monitoring', 'Dust level monitoring'],
    stats: [{ label: 'Cameras', value: '24' }, { label: 'Resolution', value: '4K' }, { label: 'Edge AI', value: 'NVIDIA Jetson' }, { label: 'Detections/day', value: '1,240' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  },
  {
    name: 'Thermal Imaging Array',
    status: 'connected',
    protocol: 'GigE Vision / FLIR SDK',
    scanRate: 'Continuous',
    description: '8 FLIR cameras monitoring kiln shell, motor bearings & electrical panels. Temperature range: -20\u00B0C to 1500\u00B0C.',
    color: RED,
    stats: [{ label: 'Cameras', value: '8 (FLIR)' }, { label: 'Temp Range', value: '-20 to 1500\u00B0C' }, { label: 'Alert Mode', value: 'Per-zone threshold' }, { label: 'Accuracy', value: '\u00B12\u00B0C' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>,
  },
  {
    name: 'Vibration Monitoring System',
    status: 'connected',
    protocol: 'ICP / IEPE',
    scanRate: 'Continuous',
    description: '64 accelerometers (PCB Piezotronics). Continuous online monitoring with FFT analysis at edge. Frequency: 0.5 Hz - 20 kHz.',
    color: AMBER,
    stats: [{ label: 'Sensors', value: '64' }, { label: 'Brand', value: 'PCB Piezotronics' }, { label: 'Freq Range', value: '0.5 Hz - 20 kHz' }, { label: 'Analysis', value: 'FFT at edge' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    name: 'Weighing Systems',
    status: 'connected',
    protocol: 'Modbus RTU / Ethernet',
    scanRate: '500ms',
    description: 'Belt scales (12), truck scales (4), hopper scales (8), loss-in-weight feeders (6). Accuracy: \u00B10.25%. Auto-zero every 4hrs.',
    color: CYAN,
    stats: [{ label: 'Belt Scales', value: '12' }, { label: 'Truck Scales', value: '4' }, { label: 'Hopper Scales', value: '8' }, { label: 'Accuracy', value: '\u00B10.25%' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="2" /><path d="M6 12h12" /></svg>,
  },
]

// ─── MAIN ───
// ─── Live Counter (increments like real dashboard) ───
function LiveCounter({ base, increment = 1, interval = 3000, suffix = '', color = '#1e293b' }) {
  const [val, setVal] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      setVal(v => v + Math.floor(Math.random() * increment * 2) + 1)
    }, interval)
    return () => clearInterval(t)
  }, [increment, interval])
  return <span style={{ fontSize: '22px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s ease' }}>{val.toLocaleString()}{suffix}</span>
}

// ─── Live Mini Sparkline (random data updates) ───
function LiveSparkline({ color = ACCENT, width = 80, height = 24 }) {
  const [pts, setPts] = useState(() => Array.from({ length: 12 }, () => Math.random() * 0.6 + 0.2))
  useEffect(() => {
    const t = setInterval(() => {
      setPts(p => [...p.slice(1), Math.random() * 0.6 + 0.2])
    }, 2000)
    return () => clearInterval(t)
  }, [])
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * width} ${height - p * height}`).join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'all 0.5s ease' }} />
    </svg>
  )
}

// ─── Live Timestamp ───
function LiveTimestamp() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return <span>{time}</span>
}

function Integrations({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'software')

  const TABS = [
    { key: 'software', label: 'Software Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { key: 'hardware', label: 'Hardware Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /></svg> },
  ]

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes livePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }
        @keyframes dataFlow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
        @keyframes scanLine { 0% { left: 0; } 100% { left: 100%; } }
        @keyframes countUp { from { opacity:0.5; } to { opacity:1; } }
        .int-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(96,93,186,0.12) !important; border-color: ${ACCENT}40 !important; }
        .int-card:hover .card-glow { opacity: 1 !important; }
        .live-dot { animation: livePulse 2s infinite; }
        .data-bar { position: relative; overflow: hidden; }
        .data-bar::after { content: ''; position: absolute; top: 0; left: -30%; width: 30%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: scanLine 2s linear infinite; }
      `}</style>

      {/* Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v4" /><path d="M12 19v4" /><path d="M1 12h4" /><path d="M19 12h4" /><path d="M4.22 4.22l2.83 2.83" /><path d="M16.95 16.95l2.83 2.83" /><path d="M4.22 19.78l2.83-2.83" /><path d="M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Integrations Hub</h1>
            <p style={sty.pageSub}>Unified connectivity for plant-wide digital transformation</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={sty.liveBadge}><span className="live-dot" style={sty.liveDot} /> 12 Active Connections</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
            <LiveTimestamp />
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

      {activeTab === 'software' && <SoftwareTab />}
      {activeTab === 'hardware' && <HardwareTab />}
    </div>
  )
}

// ─── SAP S/4HANA Detail Panel ───
function SAPDetail() {
  return (
    <div style={{ marginTop: '14px', borderTop: `1px solid #f1f5f9`, paddingTop: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>SAP S/4HANA — Live Integration Dashboard</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Production Orders', value: '142', status: 'Synced', color: GREEN },
          { label: 'Material Movements', value: '1,840', status: 'Live', color: BLUE },
          { label: 'Cost Centers', value: '24', status: 'Active', color: ACCENT },
          { label: 'Purchase Orders', value: '67', status: 'Processing', color: AMBER },
          { label: 'Goods Receipts', value: '238', status: 'Synced', color: GREEN },
          { label: 'Invoice Postings', value: '89', status: 'Queued', color: CYAN },
        ].map((m, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{m.value}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: m.color }}>{m.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Recent Sync Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          { time: '2 sec ago', event: 'Material Movement 490123847 posted — Raw Mill limestone 240 MT', type: 'success' },
          { time: '18 sec ago', event: 'Production Order 100284 — Clinker output 4,520 MT confirmed', type: 'success' },
          { time: '45 sec ago', event: 'Cost allocation CO-PA — Energy cost center ₹2.4L distributed', type: 'success' },
          { time: '1 min ago', event: 'Purchase Order 4500012847 — Coal supply 800 MT acknowledged', type: 'info' },
          { time: '3 min ago', event: 'Goods Receipt 500089123 — Gypsum 120 MT quality released', type: 'success' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '6px 10px', background: i === 0 ? '#f0fdf4' : '#fff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '9px', color: '#94a3b8', minWidth: '60px', fontVariantNumeric: 'tabular-nums' }}>{e.time}</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.type === 'success' ? GREEN : BLUE, marginTop: '4px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>{e.event}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SAP PM Detail Panel ───
function SAPPMDetail() {
  return (
    <div style={{ marginTop: '14px', borderTop: `1px solid #f1f5f9`, paddingTop: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>SAP PM — Maintenance Integration Live View</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Open Work Orders', value: '38', color: AMBER },
          { label: 'Completed Today', value: '12', color: GREEN },
          { label: 'Equipment Masters', value: '1,247', color: ACCENT },
          { label: 'Notifications', value: '24', color: BLUE },
          { label: 'Planned Hours', value: '186', color: CYAN },
        ].map((m, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: m.color, marginTop: '4px' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Active Work Orders (Last Synced)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['WO #', 'Equipment', 'Type', 'Priority', 'Status', 'Due'].map(h => (
              <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '9px', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { wo: 'WO-4012', equip: 'Kiln Main Bearing', type: 'PM', priority: 'High', status: 'In Progress', due: 'Today', prColor: RED },
            { wo: 'WO-4008', equip: 'Raw Mill Gearbox', type: 'PdM', priority: 'Medium', status: 'Scheduled', due: 'Tomorrow', prColor: AMBER },
            { wo: 'WO-4015', equip: 'Cement Mill Liner', type: 'CM', priority: 'High', status: 'Open', due: 'Mar 20', prColor: RED },
            { wo: 'WO-3998', equip: 'Bag Filter Fan', type: 'PM', priority: 'Low', status: 'Completed', due: 'Completed', prColor: GREEN },
          ].map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
              <td style={{ padding: '6px 8px', fontWeight: 600, color: ACCENT }}>{r.wo}</td>
              <td style={{ padding: '6px 8px', color: '#1e293b' }}>{r.equip}</td>
              <td style={{ padding: '6px 8px' }}><span style={{ background: '#f0efff', color: ACCENT, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 600 }}>{r.type}</span></td>
              <td style={{ padding: '6px 8px', color: r.prColor, fontWeight: 600, fontSize: '10px' }}>{r.priority}</td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#64748b' }}>{r.status}</td>
              <td style={{ padding: '6px 8px', fontSize: '10px', color: '#64748b' }}>{r.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MES Detail Panel ───
function MESDetail() {
  return (
    <div style={{ marginTop: '14px', borderTop: `1px solid #f1f5f9`, paddingTop: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>MES — Manufacturing Execution Live Feed</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Active Batches', value: '6', color: GREEN },
          { label: 'Events/Hour', value: '12,480', color: ACCENT },
          { label: 'OEE (Current)', value: '87.3%', color: BLUE },
          { label: 'Downtime Today', value: '18 min', color: AMBER },
          { label: 'Quality Checks', value: '94', color: CYAN },
          { label: 'Alerts Active', value: '2', color: RED },
        ].map((m, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: m.color }}>{m.value}</span>
              <LiveSparkline color={m.color} width={40} height={16} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Production Line Status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { line: 'Kiln Line 1', batch: 'CLK-2026-0847', product: 'OPC Clinker', rate: '4,520 MT/day', status: 'Running', uptime: 98.2, color: GREEN },
          { line: 'Cement Mill 1', batch: 'CEM-2026-1204', product: 'OPC 53 Grade', rate: '180 MT/hr', status: 'Running', uptime: 94.5, color: GREEN },
          { line: 'Cement Mill 2', batch: 'CEM-2026-1205', product: 'PPC Blend', rate: '165 MT/hr', status: 'Running', uptime: 91.8, color: GREEN },
          { line: 'Packing Line 1-4', batch: 'PKG-2026-3841', product: 'OPC 53 (50kg bags)', rate: '2,400 bags/hr', status: 'Running', uptime: 96.1, color: GREEN },
          { line: 'Coal Mill', batch: null, product: 'Pulverized Coal', rate: '0 MT/hr', status: 'Scheduled Stop', uptime: 0, color: AMBER },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: l.status === 'Running' ? '#f0fdf4' : '#fffbeb', borderRadius: '8px', border: `1px solid ${l.status === 'Running' ? '#bbf7d0' : '#fef3c7'}` }}>
            <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{l.line}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{l.product} {l.batch ? `(${l.batch})` : ''}</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', minWidth: '100px', textAlign: 'right' }}>{l.rate}</div>
            <span style={{ fontSize: '10px', fontWeight: 600, color: l.color, minWidth: '80px', textAlign: 'right' }}>{l.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SOFTWARE INTEGRATIONS TAB ───
function SoftwareTab() {
  const [expanded, setExpanded] = useState({ 0: true, 1: false, 2: false })
  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))
  return (
    <>
      <Section title="Connected Software Systems" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
          {softwareIntegrations.map((s, i) => {
            const statusColor = s.status === 'connected' ? GREEN : s.status === 'syncing' ? AMBER : RED
            const statusLabel = s.status === 'connected' ? 'Connected' : s.status === 'syncing' ? 'Syncing' : 'Disconnected'
            return (
              <div className="int-card" key={i} style={{ ...sty.card, borderLeft: `4px solid ${s.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s`, cursor: 'default', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.vendor} &middot; {s.version}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LiveSparkline color={s.color} width={60} height={20} />
                    <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
                    <span style={{ ...sty.statusPill, background: `${statusColor}15`, color: statusColor }}>{statusLabel}</span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' }}>{s.description}</div>

                {/* Meta Row */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 10px', border: '1px solid #f1f5f9', flex: '1 1 auto' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Last Sync</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{s.lastSync}</div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 10px', border: '1px solid #f1f5f9', flex: '1 1 auto' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Data Flow</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{s.dataFlow}</div>
                  </div>
                </div>

                {/* Uptime Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Uptime</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: s.uptime >= 99.5 ? GREEN : s.uptime >= 98 ? AMBER : RED }}>{s.uptime}%</span>
                  </div>
                  <div className="data-bar"><ProgressBar value={s.uptime} color={s.uptime >= 99.5 ? GREEN : s.uptime >= 98 ? AMBER : RED} /></div>
                </div>

                {/* Expand button for first 3 */}
                {i < 3 && (
                  <button onClick={() => toggleExpand(i)} style={{ marginTop: '10px', background: 'none', border: `1px solid ${ACCENT}30`, borderRadius: '6px', padding: '5px 12px', fontSize: '10px', fontWeight: 600, color: ACCENT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" style={{ transform: expanded[i] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {expanded[i] ? 'Collapse Details' : 'View Live Dashboard'}
                  </button>
                )}

                {/* Detail Panels */}
                {i === 0 && expanded[0] && <SAPDetail />}
                {i === 1 && expanded[1] && <SAPPMDetail />}
                {i === 2 && expanded[2] && <MESDetail />}
              </div>
            )
          })}
        </div>
      </Section>

      {/* API Gateway & Data Flow */}
      <Section title="API Gateway & Data Pipeline" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} badge="Real-Time">
        {/* Main KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #605dba 0%, #7c7ae8 100%)', borderRadius: '12px', padding: '18px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total API Calls Today</div>
                <div style={{ marginTop: '6px' }}><LiveCounter base={245000} increment={12} interval={2000} color="#fff" /></div>
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>+18.2% vs yesterday</div>
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <div style={{ marginTop: '12px' }}><LiveSparkline color="rgba(255,255,255,0.6)" width={180} height={28} /></div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Success Rate</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: GREEN, marginTop: '4px' }}>99.94%</div>
                <div style={{ fontSize: '10px', color: GREEN, fontWeight: 500 }}>0 failed in last hour</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>
            <div style={{ marginTop: '8px' }}><LiveSparkline color={GREEN} width={160} height={24} /></div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Avg Latency</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: BLUE, marginTop: '4px' }}>12<span style={{ fontSize: '14px', fontWeight: 500 }}>ms</span></div>
                <div style={{ fontSize: '10px', color: BLUE, fontWeight: 500 }}>P99: 45ms | P95: 28ms</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
            </div>
            <div style={{ marginTop: '8px' }}><LiveSparkline color={BLUE} width={160} height={24} /></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Webhooks</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: CYAN }}>24</span>
              <LiveSparkline color={CYAN} width={60} height={20} />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>All responding</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Error Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: GREEN }}>0.06%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>
            </div>
            <div style={{ fontSize: '10px', color: GREEN, marginTop: '4px' }}>Below threshold (0.1%)</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Throughput</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: ACCENT }}>4.2K<span style={{ fontSize: '12px', fontWeight: 500 }}>/sec</span></span>
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Peak: 6.8K/sec at 14:00</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Queue Depth</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: AMBER }}>142</span>
              <LiveSparkline color={AMBER} width={60} height={20} />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Avg drain: 3.2sec</div>
          </div>
        </div>

        {/* Data Pipeline Visual */}
        <div style={{ background: '#0f172a', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Live Data Pipeline</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}><span className="live-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: GREEN, marginRight: '4px' }} />Healthy</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Uptime: 99.97%</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {[
              { label: 'IoT Sensors', value: '2,847', sub: '486 devices', color: CYAN },
              { label: 'Edge Gateway', value: '6 nodes', sub: '48K tags/sec', color: AMBER },
              { label: 'Data Lake', value: '2.4 TB/day', sub: 'Ingest rate', color: BLUE },
              { label: 'AI Engine', value: '8.2M', sub: 'Events/day', color: ACCENT },
              { label: 'API Gateway', value: '245K+', sub: 'Calls/day', color: GREEN },
              { label: 'Consumers', value: '24', sub: 'Webhooks', color: '#ec4899' },
            ].map((node, ni) => (
              <div key={ni} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: `${node.color}18`, border: `1px solid ${node.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: node.color }}>{node.value.split(' ')[0]}</span>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#e2e8f0' }}>{node.label}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>{node.sub}</div>
                </div>
                {ni < 5 && (
                  <svg width="24" height="12" style={{ flexShrink: 0 }}>
                    <line x1="0" y1="6" x2="20" y2="6" stroke={node.color} strokeWidth="1.5" strokeDasharray="4,3" style={{ animation: 'dataFlow 0.8s linear infinite' }} />
                    <polygon points="18,2 24,6 18,10" fill={node.color} opacity="0.6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row: Data Flow + Endpoints */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Data Flow Volume</div>
            {[
              { label: 'Inbound (Sensors → Platform)', value: '2.4 TB/day', pct: 92, color: BLUE },
              { label: 'Outbound (Platform → SAP/MES)', value: '180 GB/day', pct: 68, color: GREEN },
              { label: 'Internal Processing', value: '8.2M events/day', pct: 85, color: ACCENT },
              { label: 'Historian Archive', value: '1.8 TB/day', pct: 78, color: CYAN },
            ].map((f, fi) => (
              <div key={fi} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{f.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: f.color }}>{f.value}</span>
                </div>
                <div className="data-bar"><ProgressBar value={f.pct} color={f.color} /></div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf1' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Active API Endpoints</div>
            {[
              { endpoint: '/api/v2/kiln/telemetry', method: 'POST', calls: '42K/hr', status: 'healthy' },
              { endpoint: '/api/v2/quality/results', method: 'POST', calls: '1.2K/hr', status: 'healthy' },
              { endpoint: '/api/v2/sap/sync', method: 'PUT', calls: '2.4K/hr', status: 'healthy' },
              { endpoint: '/api/v2/emissions/cems', method: 'POST', calls: '4K/hr', status: 'healthy' },
              { endpoint: '/api/v2/maintenance/wo', method: 'GET', calls: '850/hr', status: 'healthy' },
              { endpoint: '/api/v2/inventory/stock', method: 'GET', calls: '620/hr', status: 'healthy' },
            ].map((ep, ei) => (
              <div key={ei} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: ei < 5 ? '1px solid #f8fafc' : 'none' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', background: ep.method === 'POST' ? GREEN : ep.method === 'PUT' ? AMBER : BLUE, padding: '2px 6px', borderRadius: '3px', minWidth: '32px', textAlign: 'center' }}>{ep.method}</span>
                <span style={{ fontSize: '11px', color: '#475569', flex: 1, fontFamily: 'monospace' }}>{ep.endpoint}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>{ep.calls}</span>
                <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN }} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}

// ─── HARDWARE INTEGRATIONS TAB ───
function HardwareTab() {
  return (
    <>
      <Section title="Hardware & Control System Integrations" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {hardwareIntegrations.map((hw, i) => {
            const statusColor = hw.status === 'connected' ? GREEN : hw.status === 'syncing' ? AMBER : RED
            return (
              <div className="int-card" key={i} style={{ ...sty.card, borderLeft: `4px solid ${hw.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s`, cursor: 'default', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${hw.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {hw.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{hw.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Protocol: {hw.protocol} &middot; Scan: {hw.scanRate}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LiveSparkline color={hw.color} width={60} height={20} />
                    <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
                    <span style={{ ...sty.statusPill, background: `${statusColor}15`, color: statusColor }}>Connected</span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' }}>{hw.description}</div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {hw.stats.map((st, si) => (
                    <div key={si} style={{ background: '#f8fafc', borderRadius: '6px', padding: '6px 10px', border: '1px solid #f1f5f9', flex: '1 1 90px', minWidth: '90px' }}>
                      <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{st.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{st.value}</div>
                    </div>
                  ))}
                </div>

                {/* Distribution (for PLC and IoT) */}
                {hw.distribution && (
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Distribution</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {hw.distribution.map((d, di) => (
                        <div key={di} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', borderRadius: '6px', padding: '5px 10px', border: '1px solid #e8ecf1' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: hw.color }}>{d.count}</span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{d.area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCADA Servers */}
                {hw.servers && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {hw.servers.map((srv, si) => (
                      <div key={si} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{srv.name}</div>
                        <div style={{ fontSize: '9px', color: ACCENT, fontWeight: 600, marginBottom: '8px' }}>{srv.role}</div>
                        <div style={{ marginBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>CPU</span>
                            <span style={{ fontSize: '9px', fontWeight: 600, color: srv.cpu > 70 ? AMBER : GREEN }}>{srv.cpu}%</span>
                          </div>
                          <ProgressBar value={srv.cpu} color={srv.cpu > 70 ? AMBER : GREEN} height={4} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>Memory</span>
                            <span style={{ fontSize: '9px', fontWeight: 600, color: srv.memory > 70 ? AMBER : GREEN }}>{srv.memory}%</span>
                          </div>
                          <ProgressBar value={srv.memory} color={srv.memory > 70 ? AMBER : GREEN} height={4} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detection Types (for Camera) */}
                {hw.detectionTypes && (
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>AI Detection Types</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {hw.detectionTypes.map((dt, di) => (
                        <span key={di} style={{ background: `${hw.color}12`, color: hw.color, fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>{dt}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* Network Topology */}
      <Section title="Network Topology" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Plant Backbone', value: '10 Gbps Fiber Ring', detail: 'Dual redundant fiber optic ring connecting all plant areas', color: ACCENT, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg> },
            { label: 'Control Network', value: '1 Gbps Redundant', detail: 'Isolated OT network for DCS/PLC communication', color: BLUE, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg> },
            { label: 'Field Bus', value: 'PROFINET / PROFIBUS', detail: 'Deterministic field-level communication for actuators and sensors', color: GREEN, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M4 9h16M4 15h16" /></svg> },
            { label: 'Wireless', value: 'Private 5G', detail: 'Dedicated 5G network for IoT sensors and mobile devices', color: ORANGE, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg> },
          ].map((n, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: `1px solid ${n.color}20`, borderLeft: `3px solid ${n.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${n.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.icon}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{n.label}</div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: n.color, marginBottom: '4px' }}>{n.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>{n.detail}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Edge Computing */}
      <Section title="Edge Computing Infrastructure" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
          {[
            { name: '3x NVIDIA Jetson AGX Orin', role: 'AI Vision Processing', description: 'Edge inference for smart cameras. Object detection, belt wear analysis, safety zone monitoring.', color: GREEN },
            { name: '2x Dell Edge 3000', role: 'Data Aggregation', description: 'Local data collection and pre-processing. Protocol translation, data buffering, event filtering.', color: BLUE },
            { name: '1x HPE EL8000', role: 'Local Historian', description: 'On-premise time-series database. 30-day high-res buffer before cloud archive. 99.99% availability.', color: ACCENT },
          ].map((e, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', borderLeft: `3px solid ${e.color}` }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{e.name}</div>
              <div style={{ fontSize: '10px', color: e.color, fontWeight: 600, marginBottom: '8px' }}>{e.role}</div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>{e.description}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
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
  card: { background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', textAlign: 'center' },
  statusPill: { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
}

export default Integrations
