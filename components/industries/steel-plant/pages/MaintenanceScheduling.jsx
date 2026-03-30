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
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text></svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// MAINTENANCE DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Open Work Orders', value: '28', color: AMBER },
  { label: 'Overdue', value: '3', color: RED },
  { label: 'Completed This Week', value: '42', color: GREEN },
  { label: 'PM Compliance', value: '93.8%', color: GREEN },
  { label: 'Backlog (Man-hrs)', value: '1,240', color: ACCENT },
  { label: 'Maint. Cost MTD', value: '₹3.8 Cr', color: '#1e293b' },
]

// ── Upcoming Scheduled Maintenance ──
const scheduledMaint = [
  { id: 'PM-4201', asset: 'BF #1 — Hot Stove #2', type: 'Preventive', task: 'Checker brick inspection + dome refractory survey', date: '20 Mar 2026', shift: 'Day', duration: '6 hrs', team: 'Refractory (4 persons)', priority: 'high', status: 'Scheduled', aiGenerated: false },
  { id: 'PM-4202', asset: 'HSM — F3 Stand', type: 'Predictive (AI)', task: 'Work roll bearing replacement — inner race defect detected by vibration AI', date: '20 Mar 2026', shift: 'Morning (Roll Change)', duration: '3 hrs', team: 'Mechanical (6 persons)', priority: 'critical', status: 'Scheduled', aiGenerated: true },
  { id: 'PM-4203', asset: 'Caster #1 — Mold', type: 'Campaign', task: 'Mold copper plate change + oscillation check (1,850 heats completed)', date: '22 Mar 2026', shift: 'Planned Stoppage', duration: '8 hrs', team: 'Caster Maint. (8 persons)', priority: 'high', status: 'Planned', aiGenerated: false },
  { id: 'PM-4204', asset: 'BOF #1 — Vessel', type: 'Preventive', task: 'Slag splashing + barrel zone thickness measurement (ultrasonic)', date: '21 Mar 2026', shift: 'Between heats', duration: '1.5 hrs', team: 'Refractory (3 persons)', priority: 'medium', status: 'Scheduled', aiGenerated: false },
  { id: 'PM-4205', asset: 'Sinter Plant — ESP', type: 'Predictive (AI)', task: 'Rapping system recalibration — dust cake resistance trending up per AI model', date: '23 Mar 2026', shift: 'Day', duration: '4 hrs', team: 'Electrical (3 persons)', priority: 'medium', status: 'Planned', aiGenerated: true },
  { id: 'PM-4206', asset: 'BF #1 — Charging Belt', type: 'Preventive', task: 'Belt alignment check + splice S4 inspection (68% health)', date: '24 Mar 2026', shift: 'Day', duration: '3 hrs', team: 'Conveyor Team (4 persons)', priority: 'medium', status: 'Planned', aiGenerated: false },
  { id: 'PM-4207', asset: 'Power Plant — TG #1', type: 'Preventive', task: 'Turbine governor calibration + bearing oil sampling', date: '25 Mar 2026', shift: 'Night', duration: '5 hrs', team: 'Turbine Team (4 persons)', priority: 'low', status: 'Planned', aiGenerated: false },
  { id: 'PM-4208', asset: 'HSM — Descaler #2', type: 'Predictive (AI)', task: 'Nozzle bank B2-3 to B2-7 cleaning — pressure drop detected by AI', date: '20 Mar 2026', shift: 'Roll change gap', duration: '1 hr', team: 'Hydraulic (2 persons)', priority: 'medium', status: 'Scheduled', aiGenerated: true },
]

// ── Work Orders ──
const workOrders = [
  { id: 'WO-3085', asset: 'HSM — F3 Stand Bearing', type: 'Corrective (PdM)', priority: 'critical', status: 'Approved', created: '19 Mar', due: '20 Mar', assignee: 'Rajesh Kumar', cost: '₹8.5L', parts: 'Bearing NU 2340 (1 in stock)', progress: 25 },
  { id: 'WO-3082', asset: 'BF #1 — Taphole Drill', type: 'Corrective', priority: 'high', status: 'In Progress', created: '18 Mar', due: '19 Mar', assignee: 'Suresh Yadav', cost: '₹2.8L', parts: 'Drill bit set + mud gun nozzle', progress: 65 },
  { id: 'WO-3079', asset: 'Caster #1 — Segment #7 Roller', type: 'Corrective (PdM)', priority: 'high', status: 'In Progress', created: '17 Mar', due: '20 Mar', assignee: 'Amit Sharma', cost: '₹12.4L', parts: 'Segment roller assembly', progress: 40 },
  { id: 'WO-3076', asset: 'COB #1 — Pusher Ram Seal', type: 'Preventive', priority: 'medium', status: 'In Progress', created: '16 Mar', due: '21 Mar', assignee: 'Vikram Singh', cost: '₹1.2L', parts: 'Hydraulic seal kit', progress: 80 },
  { id: 'WO-3074', asset: 'HSM — AGC Hydraulic Filter', type: 'Predictive (AI)', priority: 'medium', status: 'Approved', created: '18 Mar', due: '22 Mar', assignee: 'Deepak Patel', cost: '₹0.4L', parts: 'Filter element (in stock)', progress: 10 },
  { id: 'WO-3071', asset: 'Sinter Cooler — Drive Chain', type: 'Preventive', priority: 'low', status: 'Planned', created: '15 Mar', due: '25 Mar', assignee: 'Manoj Tiwari', cost: '₹3.2L', parts: 'Chain links + sprocket', progress: 0 },
  { id: 'WO-3068', asset: 'BF #1 — Stave Cooling Pipe', type: 'Corrective', priority: 'high', status: 'Overdue', created: '12 Mar', due: '17 Mar', assignee: 'Ravi Gupta', cost: '₹5.8L', parts: 'Copper stave (long-lead)', progress: 30 },
  { id: 'WO-3065', asset: 'Power Plant — CT Fan Motor', type: 'Corrective', priority: 'low', status: 'Overdue', created: '10 Mar', due: '16 Mar', assignee: 'Sanjay Mishra', cost: '₹1.8L', parts: 'VFD module (ordered)', progress: 15 },
]

// ── Maintenance History (Last 30 Days) ──
const maintenanceHistory = [
  { id: 'WO-3060', asset: 'HSM — Work Roll Change (F1-F7)', type: 'Campaign', completed: '15 Mar', duration: '4.2 hrs', cost: '₹2.4L', outcome: 'Completed on schedule. New HSS rolls installed. Surface roughness within spec.' },
  { id: 'WO-3055', asset: 'BOF #1 — Lance Tip Replacement', type: 'Preventive', completed: '14 Mar', duration: '0.8 hrs', cost: '₹0.6L', outcome: '6-nozzle lance tip replaced. Old tip had 2 blocked nozzles affecting O₂ distribution.' },
  { id: 'WO-3048', asset: 'Caster #1 — Tundish Preheater', type: 'Corrective', completed: '12 Mar', duration: '3.5 hrs', cost: '₹1.8L', outcome: 'Burner ignition electrode replaced. Preheating cycle restored to spec.' },
  { id: 'WO-3042', asset: 'BF #1 — Main Blower Bearing', type: 'Predictive (AI)', completed: '10 Mar', duration: '6 hrs', cost: '₹15.2L', outcome: 'AI detected bearing defect 18 days early. Replaced during planned banking. Zero unplanned downtime.' },
  { id: 'WO-3038', asset: 'Sinter Plant — Ignition Hood Burner', type: 'Corrective', completed: '8 Mar', duration: '2 hrs', cost: '₹0.8L', outcome: 'Burner #4 flame failure — thermocouple replaced + gas valve serviced.' },
  { id: 'WO-3035', asset: 'Coke Oven — Quenching Car Wheel', type: 'Preventive', completed: '6 Mar', duration: '8 hrs', cost: '₹4.5L', outcome: 'Wheel set replaced (32,000 cycle life). Track alignment checked — within spec.' },
  { id: 'WO-3030', asset: 'HSM — Coiler Mandrel Expansion', type: 'Corrective', completed: '4 Mar', duration: '5 hrs', cost: '₹6.2L', outcome: 'Hydraulic expansion cylinder seal replaced. Coil wrapping quality restored.' },
  { id: 'WO-3025', asset: 'BF #1 — TRT Blade Inspection', type: 'Preventive', completed: '2 Mar', duration: '12 hrs', cost: '₹3.8L', outcome: 'Blade erosion within limits. Gas cleaning plant dust catcher cleaned — TRT output recovered 1.3 MW.' },
]

// ── Shutdown Calendar ──
const shutdownCalendar = [
  { name: 'HSM Roll Change (Fortnightly)', date: '20 Mar 2026', duration: '4 hrs', scope: 'F1-F7 work roll change, backup roll inspection', status: 'Confirmed' },
  { name: 'Caster #1 Campaign Break', date: '22 Mar 2026', duration: '12 hrs', scope: 'Mold change, segment inspection, tundish replacement', status: 'Confirmed' },
  { name: 'BF #1 Banking (Quarterly)', date: '5 Apr 2026', duration: '48 hrs', scope: 'Tuyere inspection, hearth survey, cooling system flush, TRT blade check', status: 'Tentative' },
  { name: 'BOF #1 Reline (Annual)', date: '15 Jun 2026', duration: '14 days', scope: 'Full MgO-C reline, trunnion inspection, lance system overhaul', status: 'Planning' },
  { name: 'Power Plant TG Overhaul', date: '1 May 2026', duration: '7 days', scope: 'Turbine rotor inspection, governor calibration, condenser tube cleaning', status: 'Tentative' },
]

// ── Maintenance Cost Trend ──
const costTrend = [3.2, 3.5, 3.8, 4.1, 3.6, 3.4, 3.2, 3.8, 4.2, 3.5, 3.4, 3.8]
const plannedVsUnplanned = [
  { month: 'Oct', planned: 82, unplanned: 18 },
  { month: 'Nov', planned: 85, unplanned: 15 },
  { month: 'Dec', planned: 84, unplanned: 16 },
  { month: 'Jan', planned: 88, unplanned: 12 },
  { month: 'Feb', planned: 90, unplanned: 10 },
  { month: 'Mar', planned: 92, unplanned: 8 },
]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'critical', title: 'Expedite WO-3068 — BF stave cooling pipe overdue', reason: 'Stave cooling pipe leak on BF#1 Level 3 is causing localized shell temperature rise (285°C → 312°C in 5 days). If uncorrected, refractory damage will escalate repair cost from ₹5.8L to ₹45L+ for stave replacement.', impact: 'Prevent ₹40L escalation + BF slowdown', model: 'Risk Escalation AI', confidence: 95 },
  { priority: 'high', title: 'Combine PM-4206 and PM-4208 into single shutdown window', reason: 'BF charging belt inspection (PM-4206) and HSM descaler cleaning (PM-4208) are both scheduled for 20 Mar day shift. AI recommends combining into 4-hour window during HSM roll change — eliminates separate BF belt stoppage.', impact: 'Save 2 hrs production time', model: 'Schedule Optimizer', confidence: 92 },
  { priority: 'medium', title: 'Convert WO-3076 (pusher ram seal) to condition-based', reason: 'Historical data shows pusher ram seals have highly variable life (8,000–18,000 cycles). Current seal at 12,000 cycles with no leak detected. AI recommends switching from time-based to condition-based replacement using pressure decay monitoring.', impact: 'Reduce unnecessary PM by 30%', model: 'CBM Classifier', confidence: 88 },
  { priority: 'low', title: 'Redistribute maintenance workload — night shift underutilized', reason: 'Day shift backlog at 840 man-hrs vs night shift at 400 man-hrs. 3 medium-priority PMs can be safely shifted to night shift without safety concerns. AI crew scheduling suggests rebalancing.', impact: 'Reduce day shift backlog by 25%', model: 'Workforce AI', confidence: 86 },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function MaintenanceScheduling({ defaultTab }) {
  const [tab, setTab] = useState(defaultTab === 'wo' ? 'wo' : 'schedule')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }

  const tabs = [
    { key: 'schedule', label: 'Schedule' },
    { key: 'wo', label: 'Work Orders' },
    { key: 'history', label: 'History' },
    { key: 'shutdown', label: 'Shutdown Calendar' },
    { key: 'cost', label: 'Cost & KPIs' },
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
          <h1 style={st.title}>Maintenance Scheduling & History</h1>
          <p style={st.sub}>AI-powered maintenance planning, work order management & shutdown coordination</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> CMMS Live</span>
          <span style={{ ...st.liveBadge, background: '#fef2f2', color: RED, border: '1px solid #fecaca' }}>{summaryCards[1].value} Overdue</span>
          <span style={st.aiBadge}>Schedule AI: Active</span>
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

      {/* ═══ SCHEDULE ═══ */}
      {tab === 'schedule' && (
        <Section title="Upcoming Scheduled Maintenance" badge={`${scheduledMaint.length} Tasks`} icon="SC">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scheduledMaint.map((m, i) => {
              const priColors = { critical: RED, high: RED, medium: AMBER, low: GREEN }
              const pc = priColors[m.priority]
              return (
                <div key={m.id} style={{ ...st.card, borderLeft: `4px solid ${pc}`, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{m.id}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: pc, padding: '2px 6px', borderRadius: '3px' }}>{m.priority}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: m.type.includes('AI') ? ACCENT : '#64748b', background: m.type.includes('AI') ? `${ACCENT}15` : '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{m.type}</span>
                      {m.aiGenerated && <span style={{ fontSize: '8px', fontWeight: 800, color: '#fff', background: ACCENT, padding: '2px 5px', borderRadius: '3px' }}>AI</span>}
                      <span style={{ fontSize: '9px', color: m.status === 'Scheduled' ? GREEN : BLUE, fontWeight: 600 }}>{m.status}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.date}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{m.shift} | {m.duration}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: ACCENT, marginBottom: '4px' }}>{m.asset}</div>
                  <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.5', marginBottom: '6px' }}>{m.task}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Team: {m.team}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ WORK ORDERS ═══ */}
      {tab === 'wo' && (
        <Section title="Active Work Orders" badge={`${workOrders.length} Open`} icon="WO">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workOrders.map((wo, i) => {
              const priColors = { critical: RED, high: RED, medium: AMBER, low: GREEN }
              const statusColors = { 'Approved': BLUE, 'In Progress': ACCENT, 'Planned': '#94a3b8', 'Overdue': RED }
              const pc = priColors[wo.priority]
              const sc = statusColors[wo.status]
              return (
                <div key={wo.id} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.06}s both`, background: wo.status === 'Overdue' ? '#fef2f208' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{wo.id}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: pc, padding: '2px 6px', borderRadius: '3px' }}>{wo.priority}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: sc, background: `${sc}15`, padding: '2px 8px', borderRadius: '10px' }}>{wo.status}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '10px' }}>{wo.type}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Due: <strong style={{ color: wo.status === 'Overdue' ? RED : '#1e293b' }}>{wo.due}</strong></div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Created: {wo.created}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{wo.asset}</div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                    <span>Assignee: <strong style={{ color: '#1e293b' }}>{wo.assignee}</strong></span>
                    <span>Cost: <strong>{wo.cost}</strong></span>
                    <span>Parts: {wo.parts}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${wo.progress}%`, background: wo.progress >= 80 ? GREEN : wo.progress >= 40 ? ACCENT : AMBER, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b', minWidth: '30px' }}>{wo.progress}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Total Open </span><span style={st.tinyVal}>28</span></div>
            <div><span style={st.tinyLabel}>Critical </span><span style={{ ...st.tinyVal, color: RED }}>1</span></div>
            <div><span style={st.tinyLabel}>In Progress </span><span style={{ ...st.tinyVal, color: ACCENT }}>3</span></div>
            <div><span style={st.tinyLabel}>Overdue </span><span style={{ ...st.tinyVal, color: RED }}>3</span></div>
            <div><span style={st.tinyLabel}>AI-Generated </span><span style={{ ...st.tinyVal, color: ACCENT }}>8 (28.6%)</span></div>
          </div>
        </Section>
      )}

      {/* ═══ HISTORY ═══ */}
      {tab === 'history' && (
        <Section title="Maintenance History — Last 30 Days" badge="8 Recent" icon="HI">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {maintenanceHistory.map((h, i) => (
              <div key={h.id} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'flex-start', animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderLeft: `3px solid ${GREEN}` }}>
                <div style={{ minWidth: '80px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{h.id}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 6px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>Completed</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{h.asset}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5', marginBottom: '4px' }}>{h.outcome}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#94a3b8' }}>
                    <span>Type: <strong>{h.type}</strong></span>
                    <span>Duration: <strong>{h.duration}</strong></span>
                    <span>Cost: <strong>{h.cost}</strong></span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', minWidth: '60px', textAlign: 'right' }}>{h.completed}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ SHUTDOWN CALENDAR ═══ */}
      {tab === 'shutdown' && (
        <Section title="Planned Shutdown Calendar" badge="5 Upcoming" icon="SD">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shutdownCalendar.map((s, i) => {
              const statusColor = s.status === 'Confirmed' ? GREEN : s.status === 'Tentative' ? AMBER : BLUE
              return (
                <div key={s.name} style={{ ...st.card, borderLeft: `4px solid ${statusColor}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{s.name}</div>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>{s.status}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: ACCENT }}>{s.date}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Duration: {s.duration}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.5', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px' }}>Scope: {s.scope}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ COST & KPIs ═══ */}
      {tab === 'cost' && (
        <>
          <Section title="Maintenance Cost & Performance" badge="12-Month View" icon="CT">
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Monthly Maintenance Cost (₹ Cr)</div>
                <div style={{ marginTop: '8px' }}><AreaChart data={costTrend} color={ACCENT} height={80} /></div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div><span style={st.tinyLabel}>This Month</span><span style={st.tinyVal}> ₹3.8 Cr</span></div>
                  <div><span style={st.tinyLabel}>YTD</span><span style={st.tinyVal}> ₹39.8 Cr</span></div>
                  <div><span style={st.tinyLabel}>Budget</span><span style={st.tinyVal}> ₹42 Cr</span></div>
                  <div><span style={st.tinyLabel}>vs Budget</span><span style={{ ...st.tinyVal, color: GREEN }}> -5.2%</span></div>
                </div>
              </div>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Planned vs Unplanned Maintenance (%)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {plannedVsUnplanned.map((m, i) => (
                    <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '30px' }}>{m.month}</span>
                      <div style={{ flex: 1, display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${m.planned}%`, background: GREEN, transition: 'width 1.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#fff' }}>{m.planned}%</div>
                        <div style={{ width: `${m.unplanned}%`, background: RED, transition: 'width 1.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#fff' }}>{m.unplanned}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', justifyContent: 'center' }}>
                  {[{ color: GREEN, label: 'Planned' }, { color: RED, label: 'Unplanned' }].map(l => (<div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} /><span style={{ fontSize: '10px', color: '#64748b' }}>{l.label}</span></div>))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Key Maintenance KPIs" badge="Current Month" icon="KP">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {[
                { label: 'PM Compliance', value: 93.8, target: 95, unit: '%', color: AMBER },
                { label: 'Planned:Unplanned Ratio', value: 92, target: 95, unit: '% planned', color: GREEN },
                { label: 'Backlog (Weeks)', value: 2.4, target: 2.0, unit: 'weeks', color: AMBER },
                { label: 'Schedule Adherence', value: 88.5, target: 90, unit: '%', color: AMBER },
                { label: 'WO Completion Rate', value: 94.2, target: 95, unit: '%', color: GREEN },
                { label: 'Mean WO Age', value: 4.2, target: 5.0, unit: 'days', color: GREEN },
                { label: 'Emergency WO %', value: 6.8, target: 5.0, unit: '%', color: AMBER },
                { label: 'Wrench Time', value: 62, target: 65, unit: '%', color: AMBER },
              ].map((kpi, i) => {
                const atTarget = kpi.label.includes('Emergency') || kpi.label.includes('Backlog') || kpi.label.includes('Age') ? kpi.value <= kpi.target : kpi.value >= kpi.target
                return (
                  <div key={kpi.label} style={{ ...st.card, textAlign: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderTop: `3px solid ${atTarget ? GREEN : AMBER}` }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>{kpi.label}</div>
                    <DonutChart value={kpi.label.includes('Wrench') ? kpi.value : (kpi.label.includes('Backlog') || kpi.label.includes('Age') || kpi.label.includes('Emergency')) ? Math.max(0, 100 - (kpi.value / kpi.target * 100 - 100) * 5) : kpi.value} max={100} size={56} strokeWidth={5} color={atTarget ? GREEN : AMBER} />
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{kpi.value}<span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}> {kpi.unit}</span></div>
                    <div style={{ fontSize: '9px', color: atTarget ? GREEN : AMBER, fontWeight: 600, marginTop: '2px' }}>Target: {kpi.target} {kpi.unit}</div>
                  </div>
                )
              })}
            </div>
          </Section>
        </>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Maintenance Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { critical: RED, high: RED, medium: AMBER, low: GREEN }
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Maintenance Scheduling & Optimization</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Managing 28 open work orders across 42 critical assets. Active models: Schedule optimizer (constraint-based LP), Risk escalation AI, CBM classifier,
            Workforce load balancer, Shutdown scope optimizer. PM compliance at 93.8%. Planned-to-unplanned ratio improved from 82:18 to 92:8 over 6 months.
            AI-generated work orders account for 28.6% of total — with 94.2% predictive accuracy. Maintenance cost YTD: ₹39.8 Cr (5.2% under budget).
            Unplanned downtime reduced 44% this year through predictive maintenance integration.
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
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
