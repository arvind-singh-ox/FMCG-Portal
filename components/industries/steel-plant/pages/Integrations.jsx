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

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (<div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}><div style={sty.sectionHeader}><div style={sty.sectionIcon}>{icon}</div><h2 style={sty.sectionTitle}>{title}</h2></div>{visible && children}</div>)
}

function LiveCounter({ base, increment = 1, interval = 3000, suffix = '', color = '#1e293b' }) {
  const [val, setVal] = useState(base)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (!mounted) return; const t = setInterval(() => { setVal(v => v + Math.floor(Math.random() * increment * 2) + 1) }, interval); return () => clearInterval(t) }, [mounted, increment, interval])
  return <span style={{ fontSize: '22px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s ease' }}>{mounted ? val.toLocaleString() : base.toLocaleString()}{suffix}</span>
}

// ══════════════════════════════════════════════════
// STEEL PLANT SOFTWARE INTEGRATIONS
// ══════════════════════════════════════════════════

const softwareIntegrations = [
  {
    name: 'SAP PM (Plant Maintenance)',
    vendor: 'SAP SE', version: 'v2024.1', status: 'connected', lastSync: '5 min ago', dataFlow: '1,200 records/hr',
    description: 'Work order management, equipment master data, spare parts inventory. Bi-directional sync: AI-generated WOs posted to SAP PM, completion data flows back.',
    uptime: 99.5, color: BLUE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  },
  {
    name: 'SAP S/4HANA (ERP)',
    vendor: 'SAP SE', version: 'v2024.1', status: 'connected', lastSync: '2 min ago', dataFlow: '3,200 records/hr',
    description: 'Finance, procurement, inventory & production orders. Real-time material movement posting, cost center allocation, and purchase requisition for raw materials (coal, ore, ferro alloys).',
    uptime: 99.8, color: BLUE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    name: 'MES — Level 2 Automation',
    vendor: 'Primetals Technologies', version: 'v8.2', status: 'connected', lastSync: '< 1 min ago', dataFlow: '18,000 events/hr',
    description: 'Production tracking across BF, BOF, Caster & Mill. Heat tracking, charge mix calculation, quality data acquisition. Manages grade-wise production scheduling.',
    uptime: 99.9, color: GREEN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    name: 'Process Historian (AVEVA PI)',
    vendor: 'AVEVA (OSIsoft)', version: 'v2024', status: 'connected', lastSync: 'Real-time', dataFlow: '280,000 points/min',
    description: 'Time-series data from 4,128 sensor points. 5-year retention, 1-second resolution. Single source of truth for all process analytics, AI model training, and trend analysis.',
    uptime: 99.99, color: ACCENT,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    name: 'LIMS (Laboratory)',
    vendor: 'Thermo Fisher SampleManager', version: 'v12.3', status: 'connected', lastSync: '8 min ago', dataFlow: '480 samples/day',
    description: 'Spectrometer (OES), XRF, mechanical testing results. Auto-imports hot metal, steel, and slab chemistry for real-time quality feedback to BOF endpoint and caster AI.',
    uptime: 98.8, color: CYAN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6v7l4 9H5l4-9V3z" /><line x1="9" y1="3" x2="15" y2="3" /></svg>,
  },
  {
    name: 'CEMS — Emission Monitoring',
    vendor: 'Sick AG / ABB', version: 'v6.1', status: 'connected', lastSync: 'Real-time', dataFlow: '18 stacks, 1-min intervals',
    description: 'Continuous emission monitoring from 18 stacks. SO₂, NOx, PM, CO data transmitted to CPCB/SPCB server every 15 minutes. Auto-generates compliance reports.',
    uptime: 99.4, color: GREEN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16s1.5-2 4-2 4 2 4 2" /><path d="M12 12V2" /></svg>,
  },
  {
    name: 'Energy Management System (EMS)',
    vendor: 'Schneider Electric', version: 'v9.4', status: 'connected', lastSync: '< 1 min ago', dataFlow: '2,400 meters',
    description: 'Power metering, gas flow, steam measurement. Tracks SEC by process, gas balance optimization, demand-side management, and PAT scheme compliance.',
    uptime: 99.7, color: AMBER,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  },
  {
    name: 'Weighbridge & Gate System',
    vendor: 'Mettler Toledo', version: 'v4.2', status: 'connected', lastSync: '1 min ago', dataFlow: '220 trucks/day',
    description: 'RFID-enabled 4-weighbridge system for coal, ore, scrap inbound and finished product dispatch. Auto-posting to SAP with gate pass generation.',
    uptime: 99.3, color: CYAN,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="2" /><path d="M6 12h12" /></svg>,
  },
  {
    name: 'Power BI / Analytics',
    vendor: 'Microsoft', version: 'v2024.03', status: 'connected', lastSync: 'Real-time push', dataFlow: 'DirectQuery',
    description: 'Executive dashboards, KPI exports, and board-level reporting. DirectQuery mode for live data, scheduled refresh for month-end MIS and ESG reports.',
    uptime: 99.6, color: AMBER,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
  {
    name: 'GPS Fleet Tracking',
    vendor: 'Trimble / LocoNav', version: 'v3.1', status: 'connected', lastSync: 'Real-time', dataFlow: '85 vehicles',
    description: 'Real-time tracking of 85 vehicles — inbound raw material trucks, internal dumpers, finished goods transporters. Route optimization and delivery ETA prediction.',
    uptime: 99.1, color: ORANGE,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  },
]

// ══════════════════════════════════════════════════
// STEEL PLANT HARDWARE INTEGRATIONS
// ══════════════════════════════════════════════════

const hardwareIntegrations = [
  {
    name: 'PLC Network (Siemens S7-1500 + ABB AC500)',
    status: 'connected', protocol: 'OPC-UA / Profinet', scanRate: '100ms',
    description: '68 PLCs across all process areas — BF charging, hot stove cycling, BOF lance control, caster mold oscillation, rolling mill AGC, utilities.',
    color: BLUE,
    distribution: [
      { area: 'Blast Furnace (2)', count: 14 }, { area: 'Coke Oven', count: 8 }, { area: 'Sinter Plant', count: 6 },
      { area: 'BOF / SMS', count: 10 }, { area: 'Caster (2)', count: 8 }, { area: 'Hot Strip Mill', count: 12 },
      { area: 'Power Plant', count: 4 }, { area: 'Utilities / ASU', count: 6 },
    ],
    stats: [{ label: 'Total PLCs', value: '68' }, { label: 'Protocol', value: 'OPC-UA' }, { label: 'Scan Rate', value: '100ms' }, { label: 'Redundancy', value: 'Hot Standby' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /></svg>,
  },
  {
    name: 'DCS (ABB 800xA + Yokogawa CENTUM VP)',
    status: 'connected', protocol: 'Ethernet/IP + Vnet/IP', scanRate: '250ms',
    description: 'Distributed control for BF blast regulation, coke oven underfiring, sinter machine, reheat furnace zone control. 4,128 I/O points across dual-redundant controllers.',
    color: ORANGE,
    stats: [{ label: 'I/O Points', value: '4,128' }, { label: 'Redundancy', value: 'Dual Active' }, { label: 'Network', value: 'Fiber Ring' }, { label: 'Controllers', value: '12 pairs' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  },
  {
    name: 'SCADA Servers (Level 2)',
    status: 'connected', protocol: 'OPC-UA / DA', scanRate: '1 second',
    description: '6 redundant servers managing 68,000 live tags — process variables, alarms, events. Historian retention: 5 years. Serves data to iFactory AI platform.',
    color: ACCENT,
    servers: [
      { name: 'SCADA-SRV-01', role: 'BF Primary', cpu: 45, memory: 72 },
      { name: 'SCADA-SRV-02', role: 'SMS Primary', cpu: 42, memory: 68 },
      { name: 'SCADA-SRV-03', role: 'Rolling Primary', cpu: 52, memory: 75 },
      { name: 'SCADA-SRV-04', role: 'Historian #1', cpu: 58, memory: 78 },
      { name: 'SCADA-SRV-05', role: 'Historian #2', cpu: 55, memory: 74 },
      { name: 'SCADA-SRV-06', role: 'DR Standby', cpu: 12, memory: 28 },
    ],
    stats: [{ label: 'Servers', value: '6 (Redundant)' }, { label: 'Live Tags', value: '68,000' }, { label: 'Refresh Rate', value: '1 sec' }, { label: 'Retention', value: '5 years' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  },
  {
    name: 'IoT Sensor Gateway Network',
    status: 'connected', protocol: 'MQTT, Modbus TCP, OPC-UA, BACnet', scanRate: 'Event-driven',
    description: '4,128 sensors plant-wide via 12x Siemens IOT2050 + 4x Advantech ADAM gateways. Multi-protocol aggregation into unified MQTT broker for AI consumption.',
    color: GREEN,
    distribution: [
      { area: 'Temperature (Thermocouples)', count: 680 }, { area: 'Vibration (ICP/MEMS)', count: 420 },
      { area: 'Pressure', count: 380 }, { area: 'Flow (DP/Mag/Ultrasonic)', count: 520 },
      { area: 'Level (Radar/Guided Wave)', count: 285 }, { area: 'Gas Analyzers', count: 148 },
      { area: 'Weight / Load Cells', count: 245 }, { area: 'Other (Proximity, Speed)', count: 1450 },
    ],
    stats: [{ label: 'Total Sensors', value: '4,128' }, { label: 'Gateways', value: '16' }, { label: 'Protocols', value: '4 types' }, { label: 'Uptime', value: '99.6%' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg>,
  },
  {
    name: 'AI Vision Camera Network',
    status: 'connected', protocol: 'RTSP / GigE Vision', scanRate: '30 fps',
    description: '32 AI cameras — slab surface inspection (8), conveyor monitoring (4), safety zone (8), BF tuyere periscope (8), thermal (4). Edge AI on NVIDIA Jetson AGX Orin.',
    color: CYAN,
    detectionTypes: ['Slab surface defects (CNN)', 'Belt wear & misalignment', 'Safety PPE compliance', 'Tuyere raceway analysis', 'Thermal hot spots'],
    stats: [{ label: 'Cameras', value: '32' }, { label: 'Resolution', value: '4K + IR' }, { label: 'Edge AI', value: 'Jetson AGX Orin' }, { label: 'Detections/day', value: '2,840' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  },
  {
    name: 'Thermal Imaging Array',
    status: 'connected', protocol: 'GigE Vision / FLIR SDK', scanRate: 'Continuous',
    description: '14 FLIR cameras — BF shell scan (2), hearth monitoring (4), BOF vessel (2), reheat furnace (2), caster mold (2), electrical panels (2). Range: -20°C to 2000°C.',
    color: RED,
    stats: [{ label: 'Cameras', value: '14 (FLIR)' }, { label: 'Temp Range', value: '-20 to 2000°C' }, { label: 'Steel-Specific', value: 'BF/BOF rated' }, { label: 'Accuracy', value: '±2°C' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>,
  },
  {
    name: 'Vibration Monitoring System',
    status: 'connected', protocol: 'ICP / IEPE / 4-20mA', scanRate: 'Continuous (25.6 kHz)',
    description: '420 accelerometers (SKF IMx + Bently Nevada) on BF blowers, rolling mill stands, motors, gearboxes. Online FFT + envelope analysis at edge.',
    color: AMBER,
    stats: [{ label: 'Sensors', value: '420' }, { label: 'Brands', value: 'SKF + B&K' }, { label: 'Freq Range', value: '0.5 Hz–20 kHz' }, { label: 'Analysis', value: 'FFT + Envelope' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    name: 'Electromagnetic / Metal Detectors',
    status: 'connected', protocol: 'Relay + Modbus', scanRate: '<200ms response',
    description: '8 electromagnetic separators + 12 metal detectors on burden conveyors. Detects tramp iron/metal contamination to protect BF tuyeres and conveyor belts.',
    color: BLUE,
    stats: [{ label: 'EM Separators', value: '8' }, { label: 'Metal Detectors', value: '12' }, { label: 'Response', value: '<200ms' }, { label: 'Belt Stop', value: 'Auto' }],
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  },
]

// ── Integration KPIs ──
const integrationKPIs = [
  { label: 'Total Data Streams', value: '4,128', color: ACCENT },
  { label: 'Software Systems', value: '10', color: BLUE },
  { label: 'Hardware Systems', value: '8', color: GREEN },
  { label: 'Overall Uptime', value: '99.6%', color: GREEN },
  { label: 'Data Throughput', value: '2.4 GB/min', color: ACCENT },
  { label: 'Live Tags', value: '68,000', color: BLUE },
  { label: 'API Endpoints', value: '142', color: AMBER },
  { label: 'Last Incident', value: '45 days ago', color: GREEN },
]

// ══════════════════════════════════════════════════
// SAP PM MEASURING POINTS DATA
// ══════════════════════════════════════════════════

const sapPmKpis = [
  { label: 'Total Measuring Points', value: '2,847', color: ACCENT },
  { label: 'Active Readings', value: '2,812', color: GREEN },
  { label: 'Alerts Triggered', value: '14', color: AMBER },
  { label: 'SAP Synced', value: '99.8%', color: BLUE },
  { label: 'Auto Work Orders', value: '6', color: RED },
  { label: 'Overdue Readings', value: '3', color: ORANGE },
]

const measuringPointsTable = [
  { pointId: 'MP-SP-0012', equipment: 'BF-1 Top Gas Pressure Sensor', funcLoc: 'SP-BF1-TGP', parameter: 'Pressure', currentValue: '1.82 bar', threshold: '1.5–2.5 bar', status: 'Normal', lastReading: '2026-03-20 10:42:18', nextDue: '2026-03-20 11:42:18', sapNotification: '—' },
  { pointId: 'MP-SP-0034', equipment: 'SMS Ladle Crane Motor #2', funcLoc: 'SP-SMS-LCM2', parameter: 'Vibration', currentValue: '4.8 mm/s', threshold: '0–7.1 mm/s', status: 'Normal', lastReading: '2026-03-20 10:38:05', nextDue: '2026-03-20 14:38:05', sapNotification: '—' },
  { pointId: 'MP-SP-0056', equipment: 'HSM Stand #3 Work Roll Bearing', funcLoc: 'SP-HSM-WR3', parameter: 'Temperature', currentValue: '78°C', threshold: '40–85°C', status: 'Warning', lastReading: '2026-03-20 10:40:12', nextDue: '2026-03-20 11:40:12', sapNotification: '10004821' },
  { pointId: 'MP-SP-0078', equipment: 'Coke Oven Battery #2 Uptake', funcLoc: 'SP-COB2-UPT', parameter: 'Temperature', currentValue: '1,245°C', threshold: '1,100–1,300°C', status: 'Normal', lastReading: '2026-03-20 10:41:30', nextDue: '2026-03-20 11:41:30', sapNotification: '—' },
  { pointId: 'MP-SP-0091', equipment: 'BF-2 Cooling Water Flow', funcLoc: 'SP-BF2-CWF', parameter: 'Flow', currentValue: '342 m³/hr', threshold: '280–400 m³/hr', status: 'Normal', lastReading: '2026-03-20 10:39:55', nextDue: '2026-03-20 11:39:55', sapNotification: '—' },
  { pointId: 'MP-SP-0103', equipment: 'BOF Converter #1 Trunnion Motor', funcLoc: 'SP-BOF1-TRN', parameter: 'Current', currentValue: '186 A', threshold: '120–200 A', status: 'Warning', lastReading: '2026-03-20 10:37:44', nextDue: '2026-03-20 12:37:44', sapNotification: '10004819' },
  { pointId: 'MP-SP-0128', equipment: 'Sinter Plant Main Fan Bearing', funcLoc: 'SP-SNT-MFB', parameter: 'Vibration', currentValue: '11.2 mm/s', threshold: '0–7.1 mm/s', status: 'Critical', lastReading: '2026-03-20 10:35:22', nextDue: '2026-03-20 10:50:22', sapNotification: '10004825 (WO auto)' },
  { pointId: 'MP-SP-0145', equipment: 'HSM Coiler #1 Mandrel RPM', funcLoc: 'SP-HSM-CL1', parameter: 'RPM', currentValue: '1,480 rpm', threshold: '800–1,600 rpm', status: 'Normal', lastReading: '2026-03-20 10:43:01', nextDue: '2026-03-20 14:43:01', sapNotification: '—' },
  { pointId: 'MP-SP-0167', equipment: 'BF-1 Hot Blast Stove #3', funcLoc: 'SP-BF1-HBS3', parameter: 'Temperature', currentValue: '1,310°C', threshold: '1,200–1,350°C', status: 'Normal', lastReading: '2026-03-20 10:42:50', nextDue: '2026-03-20 11:42:50', sapNotification: '—' },
  { pointId: 'MP-SP-0189', equipment: 'SMS Continuous Caster Mold Oscillator', funcLoc: 'SP-SMS-CCM', parameter: 'Vibration', currentValue: '6.9 mm/s', threshold: '0–7.1 mm/s', status: 'Warning', lastReading: '2026-03-20 10:36:18', nextDue: '2026-03-20 11:36:18', sapNotification: '10004823' },
  { pointId: 'MP-SP-0204', equipment: 'Rolling Mill Hydraulic Press Unit', funcLoc: 'SP-HSM-HPU', parameter: 'Pressure', currentValue: '218 bar', threshold: '180–250 bar', status: 'Normal', lastReading: '2026-03-20 10:41:05', nextDue: '2026-03-20 14:41:05', sapNotification: '—' },
  { pointId: 'MP-SP-0221', equipment: 'Coke Oven Gas Holder Seal', funcLoc: 'SP-COG-GHS', parameter: 'Pressure', currentValue: '0.08 bar', threshold: '0.05–0.12 bar', status: 'Normal', lastReading: '2026-03-20 10:40:38', nextDue: '2026-03-20 12:40:38', sapNotification: '—' },
]

const sapTransactions = [
  { code: 'IK11', description: 'Create Measuring Point', usage: 'New sensor registration from iFactory' },
  { code: 'IK12', description: 'Change Measuring Point', usage: 'Update threshold, description, or status' },
  { code: 'IK17', description: 'Measuring Point List', usage: 'Bulk export/sync of all active points' },
  { code: 'IW31', description: 'Create Maintenance Order', usage: 'Auto-generated when alert threshold breached' },
  { code: 'IW32', description: 'Change Order', usage: 'Update WO status from field completion' },
  { code: 'IE03', description: 'Display Equipment', usage: 'Equipment master data lookup & validation' },
]

const sapSyncLog = [
  { timestamp: '2026-03-20 10:43:02', direction: '\u2192 SAP', transaction: 'IK12', data: 'MP-SP-0012 reading update (1.82 bar)', status: 'Success' },
  { timestamp: '2026-03-20 10:42:18', direction: '\u2192 SAP', transaction: 'IK12', data: 'MP-SP-0056 reading update (78\u00b0C)', status: 'Success' },
  { timestamp: '2026-03-20 10:40:55', direction: '\u2192 SAP', transaction: 'IW31', data: 'Auto WO for MP-SP-0128 (Vibration critical)', status: 'Success' },
  { timestamp: '2026-03-20 10:39:30', direction: '\u2190 SAP', transaction: 'IK17', data: 'Bulk sync 2,847 measuring points', status: 'Success' },
  { timestamp: '2026-03-20 10:38:12', direction: '\u2192 SAP', transaction: 'IK12', data: 'MP-SP-0103 reading update (186 A)', status: 'Success' },
  { timestamp: '2026-03-20 10:36:45', direction: '\u2190 SAP', transaction: 'IE03', data: 'Equipment master refresh SP-SNT-MFB', status: 'Success' },
  { timestamp: '2026-03-20 10:35:28', direction: '\u2192 SAP', transaction: 'IW31', data: 'Notification 10004825 created for sinter fan', status: 'Success' },
  { timestamp: '2026-03-20 10:34:10', direction: '\u2190 SAP', transaction: 'IW32', data: 'WO 10004802 marked complete (BF-2 pump seal)', status: 'Success' },
]

// ── SAP PM Measuring Points Detail Component ──
function SapPmDetail() {
  return (
    <div style={{ marginTop: '14px', borderTop: '1px solid #e8ecf1', paddingTop: '14px' }}>

      {/* Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${BLUE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>SAP PM Measuring Points Integration</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {sapPmKpis.map((k, i) => (
          <div key={k.label} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px', textAlign: 'center', borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Measuring Points Table */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Measuring Points Register</div>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e8ecf1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Point ID', 'Equipment', 'SAP Func. Location', 'Parameter', 'Current Value', 'Threshold', 'Status', 'Last Reading', 'Next Due', 'SAP Notification'].map(h => (
                  <th key={h} style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e8ecf1', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '8px', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measuringPointsTable.map((row, i) => {
                const statusColor = row.status === 'Normal' ? GREEN : row.status === 'Warning' ? AMBER : RED
                return (
                  <tr key={row.pointId} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '7px 6px', fontWeight: 600, color: ACCENT, fontFamily: 'monospace', fontSize: '9px' }}>{row.pointId}</td>
                    <td style={{ padding: '7px 6px', color: '#1e293b', fontWeight: 500, maxWidth: '180px' }}>{row.equipment}</td>
                    <td style={{ padding: '7px 6px', color: '#64748b', fontFamily: 'monospace', fontSize: '9px' }}>{row.funcLoc}</td>
                    <td style={{ padding: '7px 6px', color: '#1e293b' }}>{row.parameter}</td>
                    <td style={{ padding: '7px 6px', fontWeight: 700, color: '#1e293b' }}>{row.currentValue}</td>
                    <td style={{ padding: '7px 6px', color: '#94a3b8', fontSize: '9px' }}>{row.threshold}</td>
                    <td style={{ padding: '7px 6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${statusColor}15`, color: statusColor, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, fontSize: '9px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusColor }} />
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '7px 6px', color: '#94a3b8', fontSize: '9px', whiteSpace: 'nowrap' }}>{row.lastReading}</td>
                    <td style={{ padding: '7px 6px', color: '#94a3b8', fontSize: '9px', whiteSpace: 'nowrap' }}>{row.nextDue}</td>
                    <td style={{ padding: '7px 6px', color: row.sapNotification === '\u2014' ? '#cbd5e1' : RED, fontWeight: row.sapNotification === '\u2014' ? 400 : 600, fontSize: '9px' }}>{row.sapNotification}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Integration Flow */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Field Integration Flow</div>
        <div style={{ background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
            {/* Sensor */}
            <div style={{ textAlign: 'center', padding: '10px 16px', background: `${GREEN}12`, borderRadius: '10px', border: `1px solid ${GREEN}30`, minWidth: '110px' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: GREEN }}>Sensor</div>
              <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>4,128 points</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
              <svg width="60" height="28" viewBox="0 0 60 28"><path d="M0 10 H48 L42 5 M48 10 L42 15" stroke={ACCENT} strokeWidth="2" fill="none" /><text x="12" y="26" fontSize="9" fill="#94a3b8">Real-time</text></svg>
            </div>

            {/* Edge Gateway */}
            <div style={{ textAlign: 'center', padding: '10px 16px', background: `${ACCENT}12`, borderRadius: '10px', border: `1px solid ${ACCENT}30`, minWidth: '110px' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: ACCENT }}>Edge Gateway</div>
              <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>MQTT Broker</div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
              <svg width="70" height="28" viewBox="0 0 70 28"><path d="M0 10 H58 L52 5 M58 10 L52 15" stroke={ACCENT} strokeWidth="2" fill="none" /><text x="10" y="26" fontSize="9" fill="#94a3b8">Aggregated</text></svg>
            </div>

            {/* iFactory AI */}
            <div style={{ textAlign: 'center', padding: '10px 16px', background: `${BLUE}12`, borderRadius: '10px', border: `1px solid ${BLUE}30`, minWidth: '110px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: ACCENT, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, marginBottom: '4px' }}>AI</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: BLUE }}>iFactory AI</div>
              <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Analytics Engine</div>
            </div>

            {/* Bidirectional Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px' }}>
              <svg width="80" height="36" viewBox="0 0 80 36">
                <path d="M0 12 H60 L54 7 M60 12 L54 17" stroke={BLUE} strokeWidth="2" fill="none" />
                <path d="M80 24 H20 L26 19 M20 24 L26 29" stroke={GREEN} strokeWidth="2" fill="none" />
                <text x="14" y="8" fontSize="9" fill={BLUE} fontWeight="600">IK11 / IK12</text>
                <text x="30" y="35" fontSize="9" fill={GREEN} fontWeight="600">Batch Sync</text>
              </svg>
            </div>

            {/* SAP PM */}
            <div style={{ textAlign: 'center', padding: '10px 16px', background: `${BLUE}12`, borderRadius: '10px', border: `1px solid ${BLUE}30`, minWidth: '110px' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: BLUE }}>SAP PM</div>
              <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>IK11 / IK12 / IW31</div>
            </div>
          </div>

          {/* Sync mode labels */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>Real-time sync (sensor readings, alerts)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: BLUE }} />
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>Batch sync (master data, bulk export — every 30 min)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SAP Transaction Mapping + Sync Log side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px' }}>

        {/* SAP Transaction Mapping */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SAP Transaction Mapping</div>
          <div style={{ background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '12px' }}>
            {sapTransactions.map((t, i) => (
              <div key={t.code} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: i < sapTransactions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ background: `${ACCENT}15`, color: ACCENT, fontWeight: 700, fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace', flexShrink: 0 }}>{t.code}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{t.description}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>{t.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent SAP Sync Log */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent SAP Sync Log</div>
          <div style={{ borderRadius: '8px', border: '1px solid #e8ecf1', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Timestamp', 'Direction', 'Transaction', 'Data', 'Status'].map(h => (
                    <th key={h} style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e8ecf1', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '8px', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sapSyncLog.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '6px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '9px', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                    <td style={{ padding: '6px', fontWeight: 600, color: row.direction.includes('\u2192') ? BLUE : GREEN, fontSize: '10px' }}>{row.direction}</td>
                    <td style={{ padding: '6px' }}><span style={{ background: `${ACCENT}12`, color: ACCENT, fontWeight: 700, fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{row.transaction}</span></td>
                    <td style={{ padding: '6px', color: '#64748b', fontSize: '9px' }}>{row.data}</td>
                    <td style={{ padding: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: `${GREEN}15`, color: GREEN, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, fontSize: '9px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: GREEN }} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ───
export default function Integrations({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'hardware' ? 'hardware' : 'software')
  const [sapPmExpanded, setSapPmExpanded] = useState(false)

  const TABS = [
    { key: 'software', label: 'Software Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { key: 'hardware', label: 'Hardware Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg> },
  ]

  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>

      {/* Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Integrations Hub</h1>
            <p style={sty.pageSub}>Software & hardware ecosystem — Integrated Steel Plant</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> All Connected</span>
          <span style={{ ...sty.liveBadge, background: `${ACCENT}12`, color: ACCENT, borderColor: `${ACCENT}30` }}>18 Systems Online</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {integrationKPIs.map((k, i) => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '12px', textAlign: 'center', borderTop: `3px solid ${k.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={sty.tabs}>
        {TABS.map(t => (<button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>))}
      </div>

      {/* Live Counter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '16px 24px', display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}><LiveCounter base={2847520} increment={12} interval={2000} color={ACCENT} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Data Points Processed Today</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={142850} increment={3} interval={3000} color={GREEN} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>API Calls Today</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={18420} increment={1} interval={4000} color={BLUE} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>SAP Records Synced</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={4821} increment={2} interval={5000} color={AMBER} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>AI Inferences Today</div></div>
      </div>

      {/* SOFTWARE TAB */}
      {activeTab === 'software' && (
        <Section title={`Software Integrations — ${softwareIntegrations.length} Connected Systems`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {softwareIntegrations.map((s, i) => {
              const statusColor = s.status === 'connected' ? GREEN : s.status === 'degraded' ? AMBER : RED
              const isSapPm = s.name === 'SAP PM (Plant Maintenance)'
              return (
                <div key={s.name} style={{ ...sty.card, borderLeft: `4px solid ${s.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s`, ...((isSapPm || s.name === 'SAP S/4HANA (ERP)' || s.name === 'MES — Level 2 Automation') ? { gridColumn: '1 / -1' } : {}) }}>
                  {/* Row 1: Icon + Name + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.vendor} | {s.version}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${statusColor}12`, padding: '4px 12px', borderRadius: '20px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor, textTransform: 'uppercase' }}>{s.status}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>{s.description}</p>
                  {/* Row 2: Stats + Uptime bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSapPm ? '12px' : '0' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8' }}>
                      <span>Sync: <strong style={{ color: '#1e293b' }}>{s.lastSync}</strong></span>
                      <span>Flow: <strong style={{ color: '#1e293b' }}>{s.dataFlow}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                      <ProgressBar value={s.uptime} color={s.uptime > 99 ? GREEN : AMBER} height={5} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: GREEN, minWidth: '44px' }}>{s.uptime}%</span>
                    </div>
                  </div>
                  {/* SAP PM: Expand button + Detail */}
                  {isSapPm && (
                    <>
                      <button onClick={() => setSapPmExpanded(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', background: sapPmExpanded ? `${ACCENT}10` : '#f8fafc', border: `1px solid ${sapPmExpanded ? ACCENT + '30' : '#e8ecf1'}`, borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: sapPmExpanded ? ACCENT : '#64748b', transition: 'all 0.2s ease' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        {sapPmExpanded ? 'Collapse Measuring Points' : 'View SAP PM Measuring Points & Field Integration'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sapPmExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                      {sapPmExpanded && <SapPmDetail />}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* HARDWARE TAB */}
      {activeTab === 'hardware' && (
        <Section title={`Hardware Integrations — ${hardwareIntegrations.length} Connected Systems`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hardwareIntegrations.map((hw, i) => {
              const statusColor = hw.status === 'connected' ? GREEN : AMBER
              return (
                <div key={hw.name} style={{ ...sty.card, borderLeft: `4px solid ${hw.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${hw.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{hw.icon}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{hw.name}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Protocol: {hw.protocol} | Scan: {hw.scanRate}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: statusColor, textTransform: 'uppercase' }}>{hw.status}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>{hw.description}</p>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {hw.stats.map((s, si) => (
                      <div key={si} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px 10px', flex: '1 1 100px' }}>
                        <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{s.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Distribution or Servers */}
                  {hw.distribution && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {hw.distribution.map((d, di) => (
                        <span key={di} style={{ fontSize: '9px', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '10px' }}>{d.area}: <strong>{d.count}</strong></span>
                      ))}
                    </div>
                  )}
                  {hw.servers && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {hw.servers.map((srv, si) => (
                        <div key={si} style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{srv.name}</div>
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{srv.role}</div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <div style={{ flex: 1 }}><ProgressBar value={srv.cpu} color={srv.cpu > 80 ? AMBER : BLUE} height={3} /><div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '1px' }}>CPU {srv.cpu}%</div></div>
                            <div style={{ flex: 1 }}><ProgressBar value={srv.memory} color={srv.memory > 80 ? AMBER : ACCENT} height={3} /><div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '1px' }}>RAM {srv.memory}%</div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {hw.detectionTypes && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {hw.detectionTypes.map((dt, di) => (
                        <span key={di} style={{ fontSize: '9px', color: ACCENT, background: `${ACCENT}10`, padding: '3px 8px', borderRadius: '10px', fontWeight: 500 }}>{dt}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <div style={{ display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Integration Engine — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            18 systems connected: 10 software + 8 hardware. 4,128 sensor streams aggregated via 16 IoT gateways into unified MQTT broker.
            68 PLCs + 12 DCS controller pairs communicating via OPC-UA at 100ms scan rate. 68,000 live SCADA tags with 5-year historian.
            32 AI vision cameras processing 2,840 detections/day on edge. Overall integration uptime: 99.6%. Zero data loss in last 45 days.
            Steel-specific: BOF sublance integration, BF tuyere periscope feed, electromagnetic metal detectors, and high-temperature thermal array (up to 2000°C).
          </div>
        </div>
      </div>
    </div>
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
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  section: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
}
