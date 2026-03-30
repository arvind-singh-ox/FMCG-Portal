'use client'

import { useState, useRef, useEffect } from 'react'

const ACCENT = '#605dba'

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

function AnimatedValue({ value, decimals = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0, startTime = null
    const duration = 1200
    function step(ts) {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(start + (value - start) * ease)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{display.toFixed(decimals)}{suffix}</span>
}

function Sparkline({ data, color = ACCENT, w = 80, h = 24 }) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return <svg width={w} height={h} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>
}

function ProgressBar({ value, max = 100, color = ACCENT, h = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ background: '#e2e8f0', borderRadius: h / 2, height: h, width: '100%' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: h / 2, background: color, transition: 'width 1s ease' }} />
    </div>
  )
}

function Section({ children }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)' }}>
      {visible && children}
    </div>
  )
}

/* ── DATA ── */

const robots = [
  { id: 'ARM-01', name: 'Bag Palletizing Robot', model: 'FANUC M-410iC', location: 'Packing Plant', status: 'online', metric: '420 cycles/hr', uptime: 99.2, payload: '120 kg', lastMaint: '2026-02-28', type: 'static' },
  { id: 'ARM-02', name: 'Clinker Sampling Robot', model: 'ABB IRB 6700', location: 'Kiln Exit', status: 'online', metric: '288 samples/day', uptime: 98.8, payload: '150 kg', lastMaint: '2026-03-05', type: 'static' },
  { id: 'ARM-03', name: 'Refractory Inspection Arm', model: 'KUKA KR QUANTEC', location: 'Kiln Shell', status: 'maintenance', metric: '12 inspections/shift', uptime: 96.5, payload: '300 kg', lastMaint: '2026-03-18', type: 'static' },
  { id: 'ARM-04', name: 'Bag Quality Checker', model: 'Universal Robots UR10e', location: 'QC Station', status: 'online', metric: '360 bags/hr', uptime: 99.5, payload: '12.5 kg', lastMaint: '2026-03-10', type: 'static' },
  { id: 'ARM-05', name: 'Lab Sample Prep Robot', model: 'Yaskawa GP25', location: 'QC Lab', status: 'online', metric: '450 samples/day', uptime: 99.1, payload: '25 kg', lastMaint: '2026-03-01', type: 'static' },
  { id: 'ARM-06', name: 'Valve Maintenance Arm', model: 'FANUC CRX-25iA', location: 'Utility Section', status: 'standby', metric: '45 tasks/week', uptime: 97.8, payload: '25 kg', lastMaint: '2026-02-20', type: 'static' },
  { id: 'QUAD-01', name: 'Spot Inspection Robot', model: 'Boston Dynamics Spot', location: 'Plant-wide', status: 'online', metric: '8 patrol routes', uptime: 94.2, payload: '14 kg', lastMaint: '2026-03-12', type: 'mobile' },
  { id: 'HMD-01', name: 'Control Room Assistant', model: 'Figure 02', location: 'Control Room', status: 'online', metric: '150 interactions/day', uptime: 98.0, payload: '20 kg', lastMaint: '2026-03-15', type: 'mobile' },
]

const armJoints = [
  { id: 'ARM-01', joints: [45, -30, 120, 0, -45, 90], temps: [52, 58, 61, 48, 55, 50], torques: [65, 72, 58, 42, 38, 55], task: 'Palletizing Layer 3/5', progress: 60, tcp: { x: 1250, y: -340, z: 980 }, speed: 1800, maxSpeed: 2500, safety: 'green', cycles: [4.2, 4.1, 4.3, 4.0, 4.2, 4.1, 4.4, 4.2, 4.0, 4.3] },
  { id: 'ARM-02', joints: [90, -15, 85, 45, -60, 0], temps: [48, 52, 55, 46, 50, 47], torques: [45, 55, 62, 38, 42, 35], task: 'Sampling Cycle #142', progress: 78, tcp: { x: 890, y: 200, z: 1150 }, speed: 1200, maxSpeed: 2000, safety: 'green', cycles: [8.5, 8.2, 8.4, 8.6, 8.3, 8.1, 8.5, 8.4, 8.2, 8.3] },
  { id: 'ARM-03', joints: [0, 0, 0, 0, 0, 0], temps: [32, 32, 32, 32, 32, 32], torques: [0, 0, 0, 0, 0, 0], task: 'Scheduled Maintenance', progress: 0, tcp: { x: 0, y: 0, z: 0 }, speed: 0, maxSpeed: 2100, safety: 'yellow', cycles: [15.2, 14.8, 15.0, 15.5, 14.9, 15.1, 15.3, 14.7, 15.0, 15.2] },
  { id: 'ARM-04', joints: [30, -45, 110, 15, -30, 60], temps: [42, 45, 48, 40, 43, 41], torques: [22, 28, 18, 15, 20, 12], task: 'QC Scan Bag #2847', progress: 45, tcp: { x: 650, y: -120, z: 780 }, speed: 900, maxSpeed: 1500, safety: 'green', cycles: [3.8, 3.9, 3.7, 3.8, 4.0, 3.9, 3.7, 3.8, 3.9, 3.8] },
  { id: 'ARM-05', joints: [60, -20, 95, 30, -50, 45], temps: [44, 47, 50, 42, 46, 43], torques: [35, 42, 48, 30, 36, 28], task: 'Preparing Sample #S-0891', progress: 82, tcp: { x: 420, y: 180, z: 650 }, speed: 1100, maxSpeed: 1500, safety: 'green', cycles: [6.2, 6.0, 6.3, 6.1, 6.2, 5.9, 6.1, 6.3, 6.0, 6.2] },
  { id: 'ARM-06', joints: [0, -10, 5, 0, 0, 0], temps: [35, 36, 34, 33, 35, 34], torques: [5, 8, 3, 2, 4, 3], task: 'Standby — Awaiting Command', progress: 0, tcp: { x: 300, y: 0, z: 500 }, speed: 0, maxSpeed: 1500, safety: 'green', cycles: [12.5, 11.8, 12.2, 13.0, 12.8, 11.5, 12.0, 12.4, 12.1, 12.6] },
]

const palletPatterns = [
  { name: '5×4 Standard', rows: 5, cols: 4, total: 20 },
  { name: '4×5 Rotated', rows: 4, cols: 5, total: 20 },
  { name: '6×3 Compact', rows: 6, cols: 3, total: 18 },
  { name: 'Custom Interlock', rows: 5, cols: 4, total: 20 },
]

const faultLog = [
  { time: '14:32:05', robot: 'ARM-01', code: 'E-1042', desc: 'Vacuum pressure low — Cup #3 replaced', severity: 'warning' },
  { time: '11:15:22', robot: 'ARM-04', code: 'W-0208', desc: 'Cycle time deviation >5% — auto-corrected', severity: 'info' },
  { time: '09:48:10', robot: 'ARM-02', code: 'E-0515', desc: 'Sample gripper slip detected — recalibrated', severity: 'warning' },
  { time: '08:20:45', robot: 'ARM-05', code: 'I-0102', desc: 'Calibration routine completed successfully', severity: 'info' },
  { time: '07:05:30', robot: 'ARM-01', code: 'E-2001', desc: 'Emergency stop triggered — operator proximity', severity: 'critical' },
]

const maintenanceData = [
  { id: 'ARM-01', next: '2026-04-15', hours: 648, gearbox: 82, motorBrush: 71, cableHarness: 85000, vibration: [1.2, 1.3, 1.2, 1.4, 1.3, 1.5, 1.4], lube: 28 },
  { id: 'ARM-02', next: '2026-04-22', hours: 816, gearbox: 75, motorBrush: 65, cableHarness: 72000, vibration: [1.5, 1.6, 1.5, 1.7, 1.6, 1.8, 1.7], lube: 35 },
  { id: 'ARM-03', next: '2026-03-25', hours: 168, gearbox: 45, motorBrush: 40, cableHarness: 45000, vibration: [2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2], lube: 7 },
  { id: 'ARM-04', next: '2026-05-01', hours: 1080, gearbox: 91, motorBrush: 88, cableHarness: 92000, vibration: [0.8, 0.9, 0.8, 0.9, 0.8, 0.9, 0.8], lube: 42 },
  { id: 'ARM-05', next: '2026-04-10', hours: 528, gearbox: 78, motorBrush: 72, cableHarness: 78000, vibration: [1.0, 1.1, 1.0, 1.2, 1.1, 1.2, 1.1], lube: 22 },
  { id: 'ARM-06', next: '2026-04-28', hours: 960, gearbox: 88, motorBrush: 82, cableHarness: 88000, vibration: [0.6, 0.7, 0.6, 0.7, 0.6, 0.7, 0.6], lube: 38 },
]

const spareParts = [
  { name: 'Servo Motor (AC)', stock: 4, reorder: 2, leadTime: '6 weeks', unit: '₹2.8L', status: 'ok' },
  { name: 'Harmonic Gearbox', stock: 2, reorder: 2, leadTime: '8 weeks', unit: '₹4.5L', status: 'low' },
  { name: 'Teach Pendant', stock: 3, reorder: 1, leadTime: '3 weeks', unit: '₹1.2L', status: 'ok' },
  { name: 'Cable Harness Assembly', stock: 6, reorder: 3, leadTime: '4 weeks', unit: '₹85K', status: 'ok' },
  { name: 'Vacuum Gripper Assembly', stock: 2, reorder: 2, leadTime: '5 weeks', unit: '₹3.2L', status: 'low' },
  { name: 'Force/Torque Sensor', stock: 1, reorder: 2, leadTime: '10 weeks', unit: '₹6.5L', status: 'critical' },
  { name: 'Safety Light Curtain', stock: 3, reorder: 1, leadTime: '4 weeks', unit: '₹1.8L', status: 'ok' },
  { name: 'Encoder (Absolute)', stock: 5, reorder: 3, leadTime: '3 weeks', unit: '₹45K', status: 'ok' },
]

const spotWaypoints = [
  { x: 50, y: 40, label: 'Kiln Area' },
  { x: 150, y: 30, label: 'PH Tower' },
  { x: 250, y: 60, label: 'Raw Mill' },
  { x: 340, y: 40, label: 'Coal Mill' },
  { x: 420, y: 80, label: 'Packing' },
  { x: 350, y: 120, label: 'Silo Area' },
  { x: 200, y: 130, label: 'Substation' },
  { x: 100, y: 110, label: 'Workshop' },
]

const humanoidLogs = [
  { time: '14:45', query: 'What is current kiln temperature?', response: 'Burning zone: 1,420°C, stable within ±15°C', confidence: 96 },
  { time: '14:22', query: 'Show me raw mill vibration trend', response: 'Displayed 24hr trend — all within normal range', confidence: 94 },
  { time: '13:58', query: 'Schedule maintenance for ARM-03', response: 'Work order WO-2026-0892 created for refractory arm', confidence: 98 },
  { time: '13:30', query: 'Any emission alerts today?', response: 'No exceedances — SO₂: 87mg/Nm³, NOₓ: 348mg/Nm³', confidence: 97 },
  { time: '12:45', query: 'Production status update', response: 'Daily output: 3,240 MT (72% of target). Kiln running stable.', confidence: 95 },
]

const statusColor = (s) => s === 'online' ? '#10b981' : s === 'maintenance' ? '#f59e0b' : '#94a3b8'
const statusLabel = (s) => s === 'online' ? 'Online' : s === 'maintenance' ? 'Maintenance' : 'Standby'

const sty = {
  page: { padding: '24px 28px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b', maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '2px 0 0' },
  live: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#16a34a' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' },
  tabs: { display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: 0 },
  tab: { padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer', border: 'none', background: 'transparent', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { padding: '8px 16px', fontSize: 13, fontWeight: 600, color: ACCENT, cursor: 'pointer', border: 'none', background: 'transparent', borderBottom: `2px solid ${ACCENT}`, transition: 'all 0.2s' },
  card: { background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 20 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  val: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  kpi: { background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #f1f5f9' },
  badge: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color, background: color + '15', padding: '3px 10px', borderRadius: 12 }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
}

/* ── TABS ── */

function FleetOverview() {
  return (
    <Section>
      <div style={sty.grid4}>
        {[
          { label: 'Total Robots', value: 8, color: ACCENT },
          { label: 'Online', value: 6, color: '#10b981' },
          { label: 'Avg Uptime', value: 97.9, suffix: '%', color: '#0ea5e9', decimals: 1 },
          { label: 'Tasks Today', value: 2847, color: '#8b5cf6' },
        ].map((k, i) => (
          <div key={i} style={sty.kpi}>
            <div style={sty.label}>{k.label}</div>
            <div style={{ ...sty.val, color: k.color }}><AnimatedValue value={k.value} decimals={k.decimals || 0} suffix={k.suffix || ''} /></div>
          </div>
        ))}
      </div>

      <div style={sty.grid2}>
        {robots.map((r, i) => (
          <div key={i} style={{ ...sty.card, borderLeft: `3px solid ${statusColor(r.status)}`, animation: `fadeUp 0.5s ease ${i * 0.05}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{r.id}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{r.model}</div>
              </div>
              <span style={sty.badge(statusColor(r.status))}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(r.status) }} />
                {statusLabel(r.status)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginRight: 3, verticalAlign: -1 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {r.location}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Payload: {r.payload}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.metric}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>Maint: {r.lastMaint}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>Uptime</span>
              <div style={{ flex: 1 }}><ProgressBar value={r.uptime} color={r.uptime > 98 ? '#10b981' : r.uptime > 95 ? '#f59e0b' : '#ef4444'} /></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: r.uptime > 98 ? '#10b981' : '#f59e0b' }}>{r.uptime}%</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function StaticArmsDashboard() {
  const [selectedArm, setSelectedArm] = useState(0)
  const arm = armJoints[selectedArm]
  const robot = robots[selectedArm]

  return (
    <Section>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {armJoints.map((a, i) => (
          <button key={i} onClick={() => setSelectedArm(i)} style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
            border: i === selectedArm ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
            background: i === selectedArm ? ACCENT + '10' : '#fff',
            color: i === selectedArm ? ACCENT : '#64748b',
          }}>
            {a.id}
          </button>
        ))}
      </div>

      <div style={{ ...sty.card, marginBottom: 16, borderLeft: `3px solid ${statusColor(robot.status)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{robot.name}</span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 10 }}>{robot.model}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={sty.badge(statusColor(robot.status))}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(robot.status) }} />
              {statusLabel(robot.status)}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Safety: <span style={{ color: arm.safety === 'green' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{arm.safety.toUpperCase()}</span></span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Current Task: <strong style={{ color: '#1e293b' }}>{arm.task}</strong></div>
        {arm.progress > 0 && <div style={{ marginTop: 8 }}><ProgressBar value={arm.progress} color={ACCENT} h={8} /><span style={{ fontSize: 11, color: '#64748b' }}>{arm.progress}%</span></div>}
      </div>

      <div style={sty.grid3}>
        {/* Joint Positions */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            Joint Positions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {arm.joints.map((angle, j) => (
              <div key={j} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>J{j + 1}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{angle}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* Motor Temperatures */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
            Motor Temperatures
          </div>
          {arm.temps.map((t, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#64748b', width: 28 }}>M{j + 1}</span>
              <div style={{ flex: 1 }}><ProgressBar value={t} max={85} color={t > 70 ? '#ef4444' : t > 55 ? '#f59e0b' : '#10b981'} /></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: t > 70 ? '#ef4444' : '#334155', width: 35 }}>{t}°C</span>
            </div>
          ))}
        </div>

        {/* Torque Load */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
            Joint Torque Load
          </div>
          {arm.torques.map((t, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#64748b', width: 28 }}>J{j + 1}</span>
              <div style={{ flex: 1 }}><ProgressBar value={t} color={t > 80 ? '#ef4444' : t > 60 ? '#f59e0b' : ACCENT} /></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#334155', width: 30 }}>{t}%</span>
            </div>
          ))}
        </div>

        {/* TCP Position */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>
            TCP Position
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[['X', arm.tcp.x], ['Y', arm.tcp.y], ['Z', arm.tcp.z]].map(([axis, val], i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{axis}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{val} <span style={{ fontSize: 10, color: '#94a3b8' }}>mm</span></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Speed</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: ACCENT }}>{arm.speed} <span style={{ fontSize: 10, color: '#94a3b8' }}>/ {arm.maxSpeed} mm/s</span></span>
          </div>
          <ProgressBar value={arm.speed} max={arm.maxSpeed} color={ACCENT} h={4} />
        </div>

        {/* Cycle Times */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Cycle Times (Last 10)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginBottom: 8 }}>
            {arm.cycles.map((c, i) => {
              const max = Math.max(...arm.cycles)
              const h = (c / max) * 50
              return <div key={i} style={{ flex: 1, height: h, background: ACCENT + '60', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: '#64748b' }}>{c}s</span>
              </div>
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
            <span>Avg: {(arm.cycles.reduce((a, b) => a + b, 0) / arm.cycles.length).toFixed(1)}s</span>
            <span>Best: {Math.min(...arm.cycles)}s</span>
          </div>
        </div>

        {/* Fault Log */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Recent Events
          </div>
          <div style={{ maxHeight: 140, overflow: 'auto' }}>
            {faultLog.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 11 }}>
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{f.time}</span>
                <span style={{ color: f.severity === 'critical' ? '#ef4444' : f.severity === 'warning' ? '#f59e0b' : '#0ea5e9', fontWeight: 600, width: 50 }}>{f.code}</span>
                <span style={{ color: '#334155' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function PalletizingOps() {
  const currentPattern = palletPatterns[0]
  const placed = 14
  return (
    <Section>
      <div style={sty.grid4}>
        {[
          { label: 'Bags/Hour', value: 420, color: ACCENT },
          { label: 'Today Output', value: 4640, color: '#10b981' },
          { label: 'Reject Rate', value: 0.3, suffix: '%', color: '#f59e0b', decimals: 1 },
          { label: 'Pallet Count', value: 232, color: '#0ea5e9' },
        ].map((k, i) => (
          <div key={i} style={sty.kpi}>
            <div style={sty.label}>{k.label}</div>
            <div style={{ ...sty.val, color: k.color }}><AnimatedValue value={k.value} decimals={k.decimals || 0} suffix={k.suffix || ''} /></div>
          </div>
        ))}
      </div>

      <div style={sty.grid2}>
        {/* Current Pallet */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Current Pallet — {currentPattern.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentPattern.cols}, 1fr)`, gap: 4, marginBottom: 12 }}>
            {Array.from({ length: currentPattern.total }).map((_, i) => (
              <div key={i} style={{
                height: 28, borderRadius: 4,
                background: i < placed ? ACCENT : '#e2e8f0',
                opacity: i < placed ? 1 : 0.4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: i < placed ? '#fff' : '#94a3b8', fontWeight: 600
              }}>
                {i < placed ? i + 1 : ''}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Progress: <strong style={{ color: ACCENT }}>{placed}/{currentPattern.total}</strong> bags placed</div>
          <ProgressBar value={placed} max={currentPattern.total} color={ACCENT} h={8} />
        </div>

        {/* Pallet Patterns */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Pallet Patterns</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {palletPatterns.map((p, i) => (
              <div key={i} style={{ background: i === 0 ? ACCENT + '10' : '#f8fafc', borderRadius: 8, padding: 10, border: i === 0 ? `1px solid ${ACCENT}40` : '1px solid #f1f5f9', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? ACCENT : '#334155' }}>{p.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.cols}, 1fr)`, gap: 2, margin: '6px auto', maxWidth: 80 }}>
                  {Array.from({ length: Math.min(p.total, 12) }).map((_, j) => (
                    <div key={j} style={{ height: 6, borderRadius: 1, background: i === 0 ? ACCENT : '#94a3b8', opacity: 0.5 }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{p.total} bags</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gripper Health */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Vacuum Gripper — 8 Suction Cups</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {[98, 97, 95, 99, 96, 82, 98, 97].map((v, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Cup {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: v > 90 ? '#10b981' : v > 80 ? '#f59e0b' : '#ef4444' }}>{v}%</div>
                <ProgressBar value={v} color={v > 90 ? '#10b981' : '#f59e0b'} h={3} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>Vacuum Pressure: <strong style={{ color: '#1e293b' }}>-0.82 bar</strong></span>
            <span style={sty.badge('#10b981')}>Normal</span>
          </div>
        </div>

        {/* Shift Production */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Shift Production</div>
          {[
            { shift: 'Morning (6AM–2PM)', bags: 1680, target: 1750, color: '#10b981' },
            { shift: 'Afternoon (2PM–10PM)', bags: 1540, target: 1750, color: '#0ea5e9' },
            { shift: 'Night (10PM–6AM)', bags: 1420, target: 1750, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>{s.shift}</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.bags.toLocaleString()} <span style={{ fontSize: 10, color: '#94a3b8' }}>/ {s.target.toLocaleString()}</span></span>
              </div>
              <ProgressBar value={s.bags} max={s.target} color={s.color} h={8} />
            </div>
          ))}
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 10, marginTop: 8, fontSize: 12, color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
            Total: 4,640 bags | Rejects: 14 (0.3%)
          </div>
        </div>
      </div>
    </Section>
  )
}

function MobileRobots() {
  return (
    <Section>
      <div style={sty.grid2}>
        {/* Spot Dashboard */}
        <div style={{ ...sty.card, gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>QUAD-01</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Boston Dynamics Spot</div>
            </div>
            <span style={sty.badge('#10b981')}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Patrolling
            </span>
          </div>

          {/* Patrol Map */}
          <div style={{ background: '#0f172a', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <svg width="100%" height="160" viewBox="0 0 480 160">
              {/* Patrol path */}
              <polyline points={spotWaypoints.map(w => `${w.x},${w.y}`).join(' ')} fill="none" stroke="#605dba40" strokeWidth="2" strokeDasharray="4,4" />
              {/* Animated current segment */}
              <line x1={spotWaypoints[2].x} y1={spotWaypoints[2].y} x2={spotWaypoints[3].x} y2={spotWaypoints[3].y} stroke="#10b981" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              </line>
              {/* Waypoints */}
              {spotWaypoints.map((w, i) => (
                <g key={i}>
                  <circle cx={w.x} cy={w.y} r={i === 2 ? 8 : 5} fill={i === 2 ? '#10b981' : '#605dba'} opacity={i === 2 ? 1 : 0.6}>
                    {i === 2 && <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />}
                  </circle>
                  <text x={w.x} y={w.y + 18} textAnchor="middle" fill="#94a3b8" fontSize="8">{w.label}</text>
                </g>
              ))}
              {/* Spot icon at current */}
              <text x={spotWaypoints[2].x} y={spotWaypoints[2].y - 14} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="700">SPOT</text>
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Battery', value: '78%', color: '#10b981' },
              { label: 'Distance Today', value: '4.2 km', color: ACCENT },
              { label: 'Anomalies', value: '3 found', color: '#f59e0b' },
            ].map((k, i) => (
              <div key={i} style={sty.kpi}>
                <div style={sty.label}>{k.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Today's Findings</div>
            {[
              { type: 'Thermal', desc: 'Hot spot detected on Motor B-12 bearing — 92°C', severity: 'warning' },
              { type: 'Gas', desc: 'All 24 gas leak checks — Clear', severity: 'ok' },
              { type: 'Visual', desc: 'Belt splice wear detected on CB-03 — 65% remaining', severity: 'warning' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 11 }}>
                <span style={sty.badge(f.severity === 'warning' ? '#f59e0b' : '#10b981')}>{f.type}</span>
                <span style={{ color: '#334155' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Humanoid Dashboard */}
        <div style={sty.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>HMD-01</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Figure 02 — Control Room</div>
            </div>
            <span style={sty.badge('#10b981')}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Interactions', value: '142', color: ACCENT },
              { label: 'NLP Accuracy', value: '96.2%', color: '#10b981' },
              { label: 'Tasks Queued', value: '3', color: '#0ea5e9' },
            ].map((k, i) => (
              <div key={i} style={sty.kpi}>
                <div style={sty.label}>{k.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Recent Interactions</div>
          {humanoidLogs.map((log, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{log.time}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#10b981' }}>{log.confidence}% confidence</span>
              </div>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 2 }}>Q: {log.query}</div>
              <div style={{ fontSize: 11, color: '#334155' }}>A: {log.response}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function PredictiveMaint() {
  return (
    <Section>
      <div style={sty.grid2}>
        {maintenanceData.map((m, i) => {
          const robot = robots.find(r => r.id === m.id)
          return (
            <div key={i} style={{ ...sty.card, animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{m.id}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{robot?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Next Service</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: m.hours < 200 ? '#ef4444' : '#1e293b' }}>{m.next}</div>
                  <div style={{ fontSize: 10, color: m.hours < 200 ? '#ef4444' : '#64748b' }}>{m.hours} hrs remaining</div>
                </div>
              </div>

              {[
                { label: 'Gearbox Wear', value: m.gearbox, inv: true },
                { label: 'Motor Brush Life', value: m.motorBrush, inv: true },
              ].map((item, j) => (
                <div key={j} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: item.value < 50 ? '#ef4444' : item.value < 70 ? '#f59e0b' : '#10b981' }}>{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} color={item.value < 50 ? '#ef4444' : item.value < 70 ? '#f59e0b' : '#10b981'} />
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>Cable Harness</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{(m.cableHarness / 1000).toFixed(0)}K / 100K cycles</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>Vibration (7d)</span>
                  <Sparkline data={m.vibration} color={m.vibration[6] > 3 ? '#ef4444' : '#10b981'} w={60} h={20} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, background: '#f8fafc', borderRadius: 6, padding: '6px 10px' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Lubrication</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: m.lube < 10 ? '#ef4444' : m.lube < 20 ? '#f59e0b' : '#10b981' }}>{m.lube} days remaining</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ ...sty.card, marginTop: 8 }}>
        <div style={sty.sectionTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M20 7h-4V3h-2v4H6V3H4v4H2v2h2v4H2v2h2v4h2v-4h8v4h2v-4h4v-2h-4V9h4z" /></svg>
          Spare Parts Inventory
        </div>
        <table style={sty.table}>
          <thead>
            <tr>
              <th style={sty.th}>Part</th>
              <th style={sty.th}>Stock</th>
              <th style={sty.th}>Reorder Level</th>
              <th style={sty.th}>Lead Time</th>
              <th style={sty.th}>Unit Cost</th>
              <th style={sty.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {spareParts.map((p, i) => (
              <tr key={i}>
                <td style={{ ...sty.td, fontWeight: 600 }}>{p.name}</td>
                <td style={{ ...sty.td, fontWeight: 600, color: p.stock <= p.reorder ? '#ef4444' : '#1e293b' }}>{p.stock}</td>
                <td style={sty.td}>{p.reorder}</td>
                <td style={sty.td}>{p.leadTime}</td>
                <td style={sty.td}>{p.unit}</td>
                <td style={sty.td}>
                  <span style={sty.badge(p.status === 'ok' ? '#10b981' : p.status === 'low' ? '#f59e0b' : '#ef4444')}>
                    {p.status === 'ok' ? 'In Stock' : p.status === 'low' ? 'Low' : 'Critical'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function SafetyCompliance() {
  return (
    <Section>
      <div style={sty.grid4}>
        {[
          { label: 'Safety Rating', value: 'A+', color: '#10b981' },
          { label: 'E-Stops This Month', value: '2', color: '#f59e0b' },
          { label: 'Days Since Incident', value: '142', color: '#10b981' },
          { label: 'Compliance Score', value: '99.2%', color: ACCENT },
        ].map((k, i) => (
          <div key={i} style={sty.kpi}>
            <div style={sty.label}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={sty.grid2}>
        {/* Safety Zone Map */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Robot Cell Safety Zones — ARM-01</div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Danger zone */}
            <rect x="100" y="40" width="200" height="120" rx="10" fill="#ef444415" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="105" y="56" fill="#ef4444" fontSize="9" fontWeight="600">DANGER ZONE</text>
            {/* Warning zone */}
            <rect x="60" y="20" width="280" height="160" rx="14" fill="#f59e0b08" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6,4" />
            <text x="65" y="36" fill="#f59e0b" fontSize="9" fontWeight="600">WARNING ZONE</text>
            {/* Safe zone */}
            <rect x="20" y="5" width="360" height="190" rx="18" fill="#10b98105" stroke="#10b981" strokeWidth="1" strokeDasharray="8,4" />
            <text x="25" y="18" fill="#10b981" fontSize="9" fontWeight="600">SAFE ZONE</text>
            {/* Robot arm */}
            <circle cx="200" cy="100" r="8" fill={ACCENT} />
            <line x1="200" y1="100" x2="240" y2="70" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
            <line x1="240" y1="70" x2="280" y2="90" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="280" cy="90" r="4" fill="#10b981">
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x="200" y="120" textAnchor="middle" fill={ACCENT} fontSize="9" fontWeight="600">ARM-01</text>
            {/* Light curtains */}
            {[[20, 60, 20, 140], [380, 60, 380, 140], [100, 5, 300, 5], [100, 195, 300, 195]].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </line>
            ))}
          </svg>
        </div>

        {/* Safety Systems */}
        <div style={sty.card}>
          <div style={sty.sectionTitle}>Safety Systems Status</div>
          {[
            { system: 'Light Curtain North', status: 'Active', color: '#10b981' },
            { system: 'Light Curtain South', status: 'Active', color: '#10b981' },
            { system: 'Light Curtain East', status: 'Active', color: '#10b981' },
            { system: 'Light Curtain West', status: 'Active', color: '#10b981' },
            { system: 'Floor Scanner (360°)', status: 'Active', color: '#10b981' },
            { system: 'Emergency Stop Chain', status: 'Ready', color: '#10b981' },
            { system: 'Speed Monitoring (SLS)', status: 'Active', color: '#10b981' },
            { system: 'Force Limiting (PFL)', status: 'Cobot Only', color: '#0ea5e9' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, color: '#334155' }}>{s.system}</span>
              <span style={sty.badge(s.color)}>{s.status}</span>
            </div>
          ))}

          <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Compliance Standards</div>
            {['ISO 10218-1:2011 — Industrial Robots Safety', 'ISO/TS 15066:2016 — Collaborative Robots', 'IEC 62443 — Industrial Cybersecurity', 'OSHA 1910.212 — Machine Guarding'].map((std, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155', marginBottom: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981" stroke="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                {std}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>E-Stop Events This Month</div>
            {[
              { date: '2026-03-07', robot: 'ARM-01', reason: 'Operator entered danger zone during palletizing', resolution: 'Safety briefing conducted' },
              { date: '2026-03-14', robot: 'ARM-04', reason: 'Material fell from conveyor near cobot workspace', resolution: 'Conveyor guard installed' },
            ].map((e, i) => (
              <div key={i} style={{ background: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 6, border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{e.date} — {e.robot}</span>
                </div>
                <div style={{ fontSize: 11, color: '#991b1b' }}>{e.reason}</div>
                <div style={{ fontSize: 10, color: '#10b981', marginTop: 3 }}>Resolution: {e.resolution}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: '#64748b' }}>
            <span>Last Audit: <strong>2026-02-15</strong></span>
            <span>Next Audit: <strong>2026-05-15</strong></span>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ── MAIN ── */

const tabs = [
  { key: 'fleet', label: 'Robot Control Center' },
  { key: 'arms', label: 'Static Arms — Live' },
  { key: 'palletizing', label: 'Palletizing Ops' },
  { key: 'mobile', label: 'Mobile Robots' },
  { key: 'maintenance', label: 'Predictive Maintenance' },
  { key: 'safety', label: 'Safety & Compliance' },
]

export default function Robotics({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'fleet')

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={sty.header}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <h1 style={sty.title}>Robotics & Automation</h1>
            <p style={sty.subtitle}>AI-powered robotic systems across cement manufacturing operations</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={sty.live}><span style={sty.dot} /> Live Data</span>
        </div>
      </div>

      <div style={sty.tabs}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={activeTab === t.key ? sty.tabActive : sty.tab}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'fleet' && <FleetOverview />}
      {activeTab === 'arms' && <StaticArmsDashboard />}
      {activeTab === 'palletizing' && <PalletizingOps />}
      {activeTab === 'mobile' && <MobileRobots />}
      {activeTab === 'maintenance' && <PredictiveMaint />}
      {activeTab === 'safety' && <SafetyCompliance />}
    </div>
  )
}
