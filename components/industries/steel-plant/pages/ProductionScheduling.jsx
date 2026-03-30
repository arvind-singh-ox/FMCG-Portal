'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

// ─── Scroll Reveal Hook ───
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
function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => {
    const duration = 1400
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setDisplay(numVal * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
}

// ─── Donut Chart ───
function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => {
    const duration = 1600
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimPct(pct * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [pct])
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
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

// ══════════════════════════════════════════
// ──── STEEL PRODUCTION SCHEDULING DATA ───
// ══════════════════════════════════════════

const shiftSummary = [
  { label: 'Current Shift', value: 'Day A (06:00 – 14:00)', color: ACCENT },
  { label: 'Heats Completed', value: '14 / 18', color: '#10b981' },
  { label: 'Crude Steel Produced', value: '3,680 MT', color: '#1e293b' },
  { label: 'Target Completion', value: '78%', color: ACCENT },
  { label: 'Schedule Adherence', value: '94.2%', color: '#10b981' },
  { label: 'Delay Accumulated', value: '22 min', color: '#f59e0b' },
]

// Gantt-style production line schedule
const productionLines = [
  {
    line: 'Blast Furnace #1',
    status: 'running',
    blocks: [
      { label: 'Tapping #28', start: 0, width: 15, color: '#10b981', status: 'done' },
      { label: 'Tapping #29', start: 17, width: 15, color: '#10b981', status: 'done' },
      { label: 'Tapping #30', start: 34, width: 15, color: ACCENT, status: 'active' },
      { label: 'Tapping #31', start: 52, width: 15, color: '#e2e8f0', status: 'planned' },
      { label: 'Tapping #32', start: 70, width: 15, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'Blast Furnace #2',
    status: 'running',
    blocks: [
      { label: 'Tapping #41', start: 0, width: 14, color: '#10b981', status: 'done' },
      { label: 'Tapping #42', start: 16, width: 14, color: '#10b981', status: 'done' },
      { label: 'Tapping #43', start: 32, width: 14, color: '#10b981', status: 'done' },
      { label: 'Tapping #44', start: 48, width: 14, color: ACCENT, status: 'active' },
      { label: 'Tapping #45', start: 65, width: 14, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'BOF Converter #1',
    status: 'running',
    blocks: [
      { label: 'Heat 1041', start: 0, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 1042', start: 12, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 1043', start: 24, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 1044', start: 36, width: 10, color: ACCENT, status: 'active' },
      { label: 'Heat 1045', start: 48, width: 10, color: '#e2e8f0', status: 'planned' },
      { label: 'Heat 1046', start: 60, width: 10, color: '#e2e8f0', status: 'planned' },
      { label: 'Heat 1047', start: 72, width: 10, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'BOF Converter #2',
    status: 'running',
    blocks: [
      { label: 'Heat 2038', start: 5, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 2039', start: 18, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 2040', start: 31, width: 10, color: '#10b981', status: 'done' },
      { label: 'Heat 2041', start: 44, width: 10, color: ACCENT, status: 'active' },
      { label: 'Heat 2042', start: 57, width: 10, color: '#e2e8f0', status: 'planned' },
      { label: 'Heat 2043', start: 70, width: 10, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'Continuous Caster #1',
    status: 'running',
    blocks: [
      { label: 'Seq 412', start: 0, width: 30, color: '#10b981', status: 'done' },
      { label: 'Grade Change', start: 32, width: 6, color: '#f59e0b', status: 'changeover' },
      { label: 'Seq 413', start: 40, width: 30, color: ACCENT, status: 'active' },
      { label: 'Seq 414', start: 72, width: 16, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'Continuous Caster #2',
    status: 'maintenance',
    blocks: [
      { label: 'Seq 318', start: 0, width: 28, color: '#10b981', status: 'done' },
      { label: 'Planned Maint.', start: 30, width: 20, color: '#ef4444', status: 'maintenance' },
      { label: 'Seq 319', start: 54, width: 30, color: '#e2e8f0', status: 'planned' },
    ],
  },
  {
    line: 'Hot Strip Mill',
    status: 'running',
    blocks: [
      { label: 'Campaign A', start: 0, width: 35, color: '#10b981', status: 'done' },
      { label: 'Roll Change', start: 37, width: 5, color: '#f59e0b', status: 'changeover' },
      { label: 'Campaign B', start: 44, width: 40, color: ACCENT, status: 'active' },
    ],
  },
]

// Heat tracking table
const heatTracker = [
  { heat: 'H-1044', grade: 'S355J2', weight: '265 MT', bof: 'Blowing', ladle: 'Waiting', caster: '—', eta: '18 min', status: 'active' },
  { heat: 'H-2041', grade: 'S275JR', weight: '258 MT', bof: 'Blowing', ladle: 'Waiting', caster: '—', eta: '22 min', status: 'active' },
  { heat: 'H-1043', grade: 'S355J2', weight: '262 MT', bof: 'Complete', ladle: 'Treatment', caster: 'Queued', eta: '8 min', status: 'in-transit' },
  { heat: 'H-2040', grade: 'API 5L X65', weight: '270 MT', bof: 'Complete', ladle: 'Complete', caster: 'Casting', eta: '—', status: 'casting' },
  { heat: 'H-1042', grade: 'S355J2', weight: '264 MT', bof: 'Complete', ladle: 'Complete', caster: 'Complete', eta: '—', status: 'done' },
  { heat: 'H-2039', grade: 'S275JR', weight: '260 MT', bof: 'Complete', ladle: 'Complete', caster: 'Complete', eta: '—', status: 'done' },
]

// Process flow stages
const processFlow = [
  { stage: 'Iron Making', unit: 'Blast Furnace', throughput: '285 TPH', utilization: 94, heats: '—', icon: 'BF' },
  { stage: 'Steelmaking', unit: 'BOF Converter', throughput: '265 MT/heat', utilization: 88, heats: '14 today', icon: 'SM' },
  { stage: 'Secondary Met.', unit: 'Ladle Furnace', throughput: '265 MT/heat', utilization: 82, heats: '12 treated', icon: 'LF' },
  { stage: 'Casting', unit: 'Continuous Caster', throughput: '238 TPH', utilization: 91, heats: '10 cast', icon: 'CC' },
  { stage: 'Rolling', unit: 'Hot Strip Mill', throughput: '218 TPH', utilization: 86, heats: '—', icon: 'RM' },
  { stage: 'Finishing', unit: 'Cooling & Coiling', throughput: '215 TPH', utilization: 92, heats: '—', icon: 'FN' },
]

// Downtime events
const downtimeEvents = [
  { time: '07:22', duration: '12 min', unit: 'BOF #1', reason: 'Lance tip change', type: 'planned', impact: 'Low' },
  { time: '09:45', duration: '8 min', unit: 'Caster #1', reason: 'Tundish change (sequence break)', type: 'planned', impact: 'Low' },
  { time: '11:18', duration: '22 min', unit: 'Caster #2', reason: 'Segment roller bearing alarm', type: 'unplanned', impact: 'Medium' },
  { time: '12:05', duration: '5 min', unit: 'Hot Strip Mill', reason: 'Roll gap sensor recalibration', type: 'unplanned', impact: 'Low' },
]

// Grade schedule
const gradeSchedule = [
  { order: 'ORD-4521', grade: 'S355J2', spec: 'EN 10025-2', qty: '1,200 MT', progress: 78, customer: 'ArcelorMittal Trading', due: '19 Mar', priority: 'high' },
  { order: 'ORD-4522', grade: 'S275JR', spec: 'EN 10025-2', qty: '850 MT', progress: 62, customer: 'Tata Steel Europe', due: '20 Mar', priority: 'medium' },
  { order: 'ORD-4523', grade: 'API 5L X65', spec: 'API 5L PSL2', qty: '620 MT', progress: 35, customer: 'Tenaris', due: '22 Mar', priority: 'high' },
  { order: 'ORD-4524', grade: 'S460ML', spec: 'EN 10025-4', qty: '480 MT', progress: 12, customer: 'SSAB', due: '25 Mar', priority: 'low' },
  { order: 'ORD-4525', grade: 'ASTM A572 Gr50', spec: 'ASTM A572', qty: '560 MT', progress: 0, customer: 'Nucor', due: '28 Mar', priority: 'low' },
]

// AI recommendations
const aiRecommendations = [
  { type: 'schedule', title: 'Reschedule Heat H-1047 to BOF #2', desc: 'BOF #2 will be idle for 14 min after H-2042. Moving H-1047 reduces idle time by 11 min and improves tap-to-tap cadence.', confidence: '93%', savings: '~8 MT additional output' },
  { type: 'grade', title: 'Group API 5L X65 heats in sequence', desc: 'Running 4 consecutive API heats avoids 2 grade changeovers on Caster #1. Estimated time savings: 32 min.', confidence: '91%', savings: '32 min saved' },
  { type: 'maintenance', title: 'Defer Caster #2 maintenance by 2 hours', desc: 'Current casting queue can accommodate delay. Deferring allows completion of Seq 318 without interruption. Risk: Low.', confidence: '88%', savings: '~45 MT throughput' },
  { type: 'energy', title: 'Align ladle preheating with BOF tapping', desc: 'Ladle #7 and #12 are being preheated 18 min early. Synchronizing with BOF schedule reduces gas consumption by 6%.', confidence: '95%', savings: '6% gas reduction' },
]

// ═══════════════════════════════════════
// ──── MAIN COMPONENT ──────────────────
// ═══════════════════════════════════════

export default function ProductionScheduling() {
  const [activeTab, setActiveTab] = useState('schedule')
  const tabs = [
    { key: 'schedule', label: 'Production Schedule' },
    { key: 'heats', label: 'Heat Tracker' },
    { key: 'orders', label: 'Order Book' },
  ]

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Production Scheduling & Monitoring</h1>
          <p style={st.sub}>AI-assisted steel production planning, heat tracking & order management</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Schedule</span>
          <span style={st.aiBadge}>AI Scheduler: Active</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Shift Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {shiftSummary.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {tabs.map((t) => (
          <button key={t.key} style={activeTab === t.key ? st.tabActive : st.tab} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ PRODUCTION SCHEDULE TAB ═══ */}
      {activeTab === 'schedule' && (
        <>
          {/* Gantt Chart */}
          <Section title="Production Line Schedule" badge="Gantt View — Today" icon="GN">
            <div style={st.card}>
              {/* Time header */}
              <div style={{ display: 'flex', marginBottom: '8px', paddingLeft: '160px' }}>
                {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((t, i) => (
                  <div key={i} style={{ flex: 1, fontSize: '10px', color: '#94a3b8', textAlign: 'left' }}>{t}</div>
                ))}
              </div>
              {/* Now indicator time */}
              <div style={{ position: 'relative', paddingLeft: '160px', marginBottom: '4px' }}>
                <div style={{ position: 'absolute', left: `calc(160px + ${((new Date().getHours() - 6) / 14) * 100}%)`, top: 0, bottom: 0, width: '2px', background: '#ef4444', zIndex: 5, borderRadius: '1px' }}>
                  <div style={{ position: 'absolute', top: '-14px', left: '-16px', fontSize: '9px', fontWeight: 700, color: '#ef4444', background: '#fff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #fee2e2', whiteSpace: 'nowrap' }}>NOW</div>
                </div>
              </div>
              {/* Lines */}
              {productionLines.map((line, li) => {
                const statusColor = line.status === 'running' ? '#10b981' : line.status === 'maintenance' ? '#ef4444' : '#f59e0b'
                return (
                  <div key={li} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', animation: `slideIn 0.7s ease ${li * 0.08}s both` }}>
                    <div style={{ width: '160px', flexShrink: 0, paddingRight: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{line.line}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                        <span style={{ fontSize: '10px', color: statusColor, fontWeight: 500, textTransform: 'capitalize' }}>{line.status}</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '32px', background: '#f8fafc', borderRadius: '6px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                      {line.blocks.map((block, bi) => (
                        <div key={bi} title={`${block.label} (${block.status})`} style={{
                          position: 'absolute', left: `${block.start}%`, width: `${block.width}%`, height: '100%',
                          background: block.color, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 600, color: block.status === 'planned' ? '#94a3b8' : '#fff',
                          overflow: 'hidden', whiteSpace: 'nowrap', padding: '0 4px',
                          border: block.status === 'active' ? `2px solid ${ACCENT}` : 'none',
                          boxShadow: block.status === 'active' ? `0 0 8px ${ACCENT}40` : 'none',
                        }}>
                          {block.width > 8 && block.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                {[
                  { color: '#10b981', label: 'Completed' },
                  { color: ACCENT, label: 'In Progress' },
                  { color: '#e2e8f0', label: 'Planned' },
                  { color: '#f59e0b', label: 'Changeover' },
                  { color: '#ef4444', label: 'Maintenance' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color }} />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Process Flow */}
          <Section title="Integrated Process Flow" badge="End-to-End Tracking" icon="PF">
            <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
              {processFlow.map((p, i) => {
                const utilColor = p.utilization >= 90 ? '#10b981' : p.utilization >= 80 ? ACCENT : '#f59e0b'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                    <div style={{ ...st.card, flex: 1, textAlign: 'center', position: 'relative', borderTop: `3px solid ${utilColor}` }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '11px', fontWeight: 800, color: ACCENT }}>{p.icon}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{p.stage}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>{p.unit}</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{p.throughput}</div>
                      <div style={{ margin: '8px auto', width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.utilization}%`, background: utilColor, borderRadius: '2px', transition: 'width 1.4s ease' }} />
                      </div>
                      <div style={{ fontSize: '10px', color: utilColor, fontWeight: 600 }}>{p.utilization}% utilization</div>
                      {p.heats !== '—' && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{p.heats}</div>}
                    </div>
                    {i < processFlow.length - 1 && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Downtime Events + AI Recommendations side by side */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            {/* Downtime Log */}
            <div style={{ flex: 1 }}>
              <Section title="Downtime Events" badge="Today" icon="DT">
                <div style={st.card}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {downtimeEvents.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', borderLeft: `3px solid ${d.type === 'planned' ? '#3b82f6' : '#ef4444'}`, animation: `slideIn 0.6s ease ${i * 0.1}s both` }}>
                        <div style={{ minWidth: '48px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{d.time}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{d.duration}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{d.unit}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{d.reason}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: d.type === 'planned' ? '#eff6ff' : '#fef2f2', color: d.type === 'planned' ? '#3b82f6' : '#ef4444', textTransform: 'uppercase' }}>{d.type}</span>
                          <span style={{ fontSize: '9px', color: d.impact === 'Medium' ? '#f59e0b' : '#94a3b8' }}>Impact: {d.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Planned</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}> 20 min</span></div>
                    <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Unplanned</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}> 27 min</span></div>
                    <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Availability Impact</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> -0.8%</span></div>
                  </div>
                </div>
              </Section>
            </div>

            {/* AI Recommendations */}
            <div style={{ flex: 1 }}>
              <Section title="AI Schedule Recommendations" badge="4 Active" icon="AI">
                <div style={st.card}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiRecommendations.map((rec, i) => {
                      const typeColors = { schedule: ACCENT, grade: '#10b981', maintenance: '#f59e0b', energy: '#3b82f6' }
                      return (
                        <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', borderLeft: `3px solid ${typeColors[rec.type]}`, border: '1px solid #f1f5f9', animation: `slideIn 0.6s ease ${i * 0.1}s both` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: typeColors[rec.type], padding: '2px 6px', borderRadius: '3px' }}>{rec.type}</span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</span>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>{rec.desc}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: {rec.confidence}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#10b981' }}>{rec.savings}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </>
      )}

      {/* ═══ HEAT TRACKER TAB ═══ */}
      {activeTab === 'heats' && (
        <Section title="Live Heat Tracker" badge="Real-Time Status" icon="HT">
          <div style={st.card}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 100px 80px 90px 100px 90px 70px 80px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Heat ID', 'Grade', 'Weight', 'BOF', 'Ladle Treatment', 'Caster', 'ETA', 'Status'].map((h) => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {heatTracker.map((h, i) => {
              const statusColors = { active: ACCENT, 'in-transit': '#f59e0b', casting: '#10b981', done: '#94a3b8' }
              const statusBg = { active: `${ACCENT}10`, 'in-transit': '#fef3c710', casting: '#f0fdf410', done: '#f8fafc' }
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '90px 100px 80px 90px 100px 90px 70px 80px', gap: '8px',
                  padding: '12px', borderRadius: '8px', background: statusBg[h.status], border: '1px solid #f1f5f9',
                  marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.08}s both`,
                  borderLeft: h.status === 'active' ? `3px solid ${ACCENT}` : h.status === 'casting' ? '3px solid #10b981' : '3px solid transparent'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{h.heat}</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{h.grade}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{h.weight}</div>
                  <div style={{ fontSize: '11px', color: h.bof === 'Blowing' ? ACCENT : h.bof === 'Complete' ? '#10b981' : '#94a3b8', fontWeight: 600 }}>{h.bof}</div>
                  <div style={{ fontSize: '11px', color: h.ladle === 'Treatment' ? '#f59e0b' : h.ladle === 'Complete' ? '#10b981' : '#94a3b8', fontWeight: 600 }}>{h.ladle}</div>
                  <div style={{ fontSize: '11px', color: h.caster === 'Casting' ? '#10b981' : h.caster === 'Complete' ? '#10b981' : '#94a3b8', fontWeight: 600 }}>{h.caster}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: h.eta === '—' ? '#94a3b8' : '#1e293b' }}>{h.eta}</div>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '10px', background: `${statusColors[h.status]}15`, color: statusColors[h.status], textTransform: 'uppercase' }}>{h.status}</span>
                  </div>
                </div>
              )
            })}
            {/* Summary */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Active Heats</span><span style={{ fontSize: '14px', fontWeight: 700, color: ACCENT }}> 2</span></div>
              <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>In Transit</span><span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}> 1</span></div>
              <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Casting</span><span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}> 1</span></div>
              <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Completed Today</span><span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}> 14</span></div>
              <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Avg Tap-to-Tap</span><span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}> 38 min</span></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ORDER BOOK TAB ═══ */}
      {activeTab === 'orders' && (
        <Section title="Production Order Book" badge="AI Prioritized" icon="OB">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gradeSchedule.map((order, i) => {
              const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
              return (
                <div key={i} style={{ ...st.card, display: 'flex', gap: '20px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderLeft: `3px solid ${priColors[order.priority]}` }}>
                  {/* Order Info */}
                  <div style={{ minWidth: '120px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{order.order}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Due: {order.due}</div>
                    <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: `${priColors[order.priority]}15`, color: priColors[order.priority], textTransform: 'uppercase', marginTop: '4px', display: 'inline-block' }}>{order.priority}</span>
                  </div>
                  {/* Grade & Spec */}
                  <div style={{ minWidth: '140px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: ACCENT }}>{order.grade}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{order.spec}</div>
                  </div>
                  {/* Customer */}
                  <div style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{order.customer}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{order.qty}</div>
                  </div>
                  {/* Progress */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Progress</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: order.progress >= 70 ? '#10b981' : order.progress >= 30 ? ACCENT : '#94a3b8' }}>{order.progress}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${order.progress}%`, background: order.progress >= 70 ? '#10b981' : order.progress >= 30 ? ACCENT : '#cbd5e1', borderRadius: '3px', transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                  {/* Donut */}
                  <div style={{ flexShrink: 0 }}>
                    <DonutChart value={order.progress} max={100} size={52} strokeWidth={5} color={order.progress >= 70 ? '#10b981' : ACCENT} />
                  </div>
                </div>
              )
            })}
          </div>
          {/* Order Summary */}
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '16px' }}>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Active Orders</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}> 5</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Quantity</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}> 3,710 MT</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>High Priority</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}> 2</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>On Schedule</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}> 4 / 5</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Grades Active</span><span style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}> 4</span></div>
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Scheduling Engine — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Optimizing across 7 production lines. Schedule adherence: 94.2%. 4 AI recommendations active — estimated combined benefit: +53 MT throughput and 32 min saved.
            Grade sequencing AI reduced changeovers by 18% this week. Predictive model for tap-to-tap time accuracy: 96.8%.
            Next schedule re-optimization: 45 minutes.
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
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },

  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },

  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },

  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
