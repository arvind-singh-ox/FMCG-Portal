'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'

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
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * height}`).join(' ')
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height}>
        <defs><linearGradient id={`ag-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient></defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#ag-${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  )
}

function ProgressBar({ value, max = 100, color, height = 8 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} />
    </div>
  )
}

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

// ── DATA ──

const kpis = [
  { label: 'Planned Maintenance', value: '42', color: BLUE },
  { label: 'Unplanned Stops (MTD)', value: '2', color: RED },
  { label: 'PM Compliance', value: '96.8%', color: GREEN },
  { label: 'Avg Repair Time', value: '3.2 hrs', color: CYAN },
  { label: 'Backlog WOs', value: '8', color: AMBER },
  { label: 'Cost MTD', value: '1.24 Cr', color: ACCENT },
]

const weekSchedule = [
  { day: 'Mon 17', tasks: [{ name: 'Kiln bearing grease', type: 'preventive' }, { name: 'Coal mill inspection', type: 'predictive' }] },
  { day: 'Tue 18', tasks: [{ name: 'Gearbox oil sample', type: 'preventive' }, { name: 'Bag filter bag check', type: 'corrective' }] },
  { day: 'Wed 19', tasks: [{ name: 'Raw mill roller check', type: 'predictive' }, { name: 'Conveyor splice repair', type: 'corrective' }] },
  { day: 'Thu 20', tasks: [{ name: 'Cement mill media add', type: 'preventive' }] },
  { day: 'Fri 21', tasks: [{ name: 'PH cyclone cleaning', type: 'preventive' }, { name: 'Cooler grate inspect', type: 'predictive' }] },
  { day: 'Sat 22', tasks: [{ name: 'Electrical thermography', type: 'preventive' }] },
  { day: 'Sun 23', tasks: [{ name: 'WHR turbine inspect', type: 'predictive' }] },
]

const workOrders = [
  { wo: 'WO-2026-1041', equipment: 'Kiln Support Roller #3', type: 'predictive', priority: 'critical', team: 'Mech Team A', status: 'in-progress', created: '15 Mar', due: '18 Mar', estHrs: 8, actHrs: 4 },
  { wo: 'WO-2026-1040', equipment: 'Kiln Gearbox (Flender)', type: 'preventive', priority: 'high', team: 'Mech Team A', status: 'scheduled', created: '14 Mar', due: '20 Mar', estHrs: 12, actHrs: 0 },
  { wo: 'WO-2026-1039', equipment: 'Raw Mill Roller #2', type: 'predictive', priority: 'high', team: 'Mech Team B', status: 'scheduled', created: '13 Mar', due: '25 Mar', estHrs: 48, actHrs: 0 },
  { wo: 'WO-2026-1038', equipment: 'Cement Mill — Chamber 2', type: 'preventive', priority: 'medium', team: 'Mech Team B', status: 'open', created: '12 Mar', due: '19 Mar', estHrs: 6, actHrs: 0 },
  { wo: 'WO-2026-1037', equipment: 'PH Cyclone 4', type: 'corrective', priority: 'medium', team: 'Process Team', status: 'scheduled', created: '12 Mar', due: '21 Mar', estHrs: 4, actHrs: 0 },
  { wo: 'WO-2026-1036', equipment: 'Bag Filter — Comp. 5', type: 'corrective', priority: 'medium', team: 'Mech Team C', status: 'open', created: '11 Mar', due: '22 Mar', estHrs: 8, actHrs: 0 },
  { wo: 'WO-2026-1035', equipment: 'Conveyor Belt #7', type: 'corrective', priority: 'high', team: 'Mech Team C', status: 'completed', created: '10 Mar', due: '14 Mar', estHrs: 6, actHrs: 5 },
  { wo: 'WO-2026-1034', equipment: 'Cooler Grate Plate #17', type: 'predictive', priority: 'low', team: 'Mech Team A', status: 'open', created: '10 Mar', due: '28 Mar', estHrs: 4, actHrs: 0 },
  { wo: 'WO-2026-1033', equipment: 'Coal Mill Classifier', type: 'predictive', priority: 'low', team: 'Mech Team B', status: 'open', created: '09 Mar', due: '30 Mar', estHrs: 12, actHrs: 0 },
  { wo: 'WO-2026-1032', equipment: 'Electrical Panel — MCC 4', type: 'preventive', priority: 'medium', team: 'Elec Team', status: 'completed', created: '08 Mar', due: '12 Mar', estHrs: 3, actHrs: 2.5 },
  { wo: 'WO-2026-1031', equipment: 'WHR Steam Turbine', type: 'preventive', priority: 'medium', team: 'WHR Team', status: 'completed', created: '05 Mar', due: '10 Mar', estHrs: 16, actHrs: 14 },
  { wo: 'WO-2026-1030', equipment: 'Compressor #2 (Atlas)', type: 'preventive', priority: 'low', team: 'Utility Team', status: 'completed', created: '04 Mar', due: '08 Mar', estHrs: 8, actHrs: 7 },
]

const predictiveItems = [
  { equipment: 'Kiln Refractory — Zone 4', failure: 'Brick thickness below 70mm threshold', timeToFail: '~18 hrs', confidence: 92, action: 'Hot refractory repair (gunning) during planned slowdown', cost: '8.5 L', priority: 'critical', color: RED },
  { equipment: 'Kiln Gearbox — Pinion Teeth', failure: 'Micro-crack propagation on tooth #14', timeToFail: '~45 days', confidence: 88, action: 'Borescope inspection + oil analysis. Plan tooth replacement in next shutdown', cost: '12.4 L', priority: 'high', color: AMBER },
  { equipment: 'Raw Mill Roller #2 — Bearing', failure: 'Inner race spalling — vibration trending', timeToFail: '~60 days', confidence: 91, action: 'Replace bearing assembly during planned VRM stop', cost: '4.2 L', priority: 'high', color: AMBER },
  { equipment: 'Cement Mill — Grinding Media', failure: 'Ball charge depletion (91% of optimal)', timeToFail: 'Gradual efficiency loss', confidence: 94, action: 'Add 12 MT of 60mm balls to Chamber 2', cost: '2.8 L', priority: 'medium', color: BLUE },
  { equipment: 'PH Fan — Impeller', failure: 'Erosion on leading edges (2mm loss)', timeToFail: '~90 days', confidence: 82, action: 'Hard-face welding during next annual shutdown', cost: '3.5 L', priority: 'medium', color: BLUE },
  { equipment: 'Coal Mill — Classifier Blades', failure: 'Erosion reducing separation efficiency', timeToFail: '~40 days', confidence: 80, action: 'Replace 12 blades with ceramic-tipped version', cost: '1.8 L', priority: 'low', color: CYAN },
  { equipment: 'Cooler Fan Motor #3', failure: 'Winding insulation degradation (IR trending)', timeToFail: '~120 days', confidence: 78, action: 'Motor rewinding during next major outage', cost: '2.2 L', priority: 'low', color: CYAN },
  { equipment: 'Bag Filter — Pulse Valves', failure: '6 of 48 valves showing delayed response', timeToFail: '~30 days', confidence: 86, action: 'Replace diaphragms on compartments 3, 5, 7', cost: '0.45 L', priority: 'medium', color: BLUE },
]

const spareParts = [
  { name: 'Kiln Support Roller Bearing (SKF)', partNo: 'SKF-23060-CC/W33', equipment: 'Kiln Rollers', stock: 2, reorder: 2, leadTime: '8 weeks', cost: '4.2 L', status: 'low' },
  { name: 'Girth Gear Segment', partNo: 'FLD-GG-2200', equipment: 'Kiln Gearbox', stock: 1, reorder: 1, leadTime: '16 weeks', cost: '18.5 L', status: 'low' },
  { name: 'Raw Mill Roller Tire', partNo: 'LOE-VRM-RT-42', equipment: 'Raw Mill VRM', stock: 1, reorder: 1, leadTime: '12 weeks', cost: '8.2 L', status: 'low' },
  { name: 'Cement Mill Grinding Balls (60mm)', partNo: 'GB-60-HCR', equipment: 'Cement Ball Mill', stock: 48, reorder: 20, leadTime: '2 weeks', cost: '0.12 L/MT', status: 'in-stock' },
  { name: 'PH Cyclone Cone Liner', partNo: 'CYC-CL-4500', equipment: 'Preheater', stock: 4, reorder: 2, leadTime: '6 weeks', cost: '2.8 L', status: 'in-stock' },
  { name: 'Bag Filter Bags (set of 288)', partNo: 'BF-PJ-288-PTFE', equipment: 'Bag Filter', stock: 1, reorder: 1, leadTime: '4 weeks', cost: '6.5 L', status: 'low' },
  { name: 'Conveyor Belt Roll (EP400/4)', partNo: 'CB-EP400-1200', equipment: 'Conveyors', stock: 3, reorder: 2, leadTime: '3 weeks', cost: '1.4 L', status: 'in-stock' },
  { name: 'Cooler Grate Plate', partNo: 'CG-GP-HC-28', equipment: 'Clinker Cooler', stock: 12, reorder: 8, leadTime: '4 weeks', cost: '0.35 L', status: 'in-stock' },
  { name: 'Coal Mill Table Segment', partNo: 'CM-TS-NiHard', equipment: 'Coal Mill', stock: 2, reorder: 2, leadTime: '10 weeks', cost: '3.8 L', status: 'low' },
  { name: 'Hydraulic Pump Assembly', partNo: 'HYD-PA-250', equipment: 'Raw Mill Hydraulic', stock: 1, reorder: 1, leadTime: '6 weeks', cost: '2.1 L', status: 'low' },
]

const costByType = [
  { type: 'Preventive', pct: 45, cost: '6.72 Cr', color: BLUE },
  { type: 'Predictive', pct: 25, cost: '3.74 Cr', color: ACCENT },
  { type: 'Corrective', pct: 20, cost: '2.99 Cr', color: AMBER },
  { type: 'Breakdown', pct: 10, cost: '1.49 Cr', color: RED },
]

const costByDept = [
  { dept: 'Kiln & Pyro', pct: 35, cost: '5.24 Cr', color: RED },
  { dept: 'Raw Mill', pct: 20, cost: '2.99 Cr', color: BLUE },
  { dept: 'Cement Mill', pct: 18, cost: '2.69 Cr', color: AMBER },
  { dept: 'Utilities & Electrical', pct: 15, cost: '2.24 Cr', color: CYAN },
  { dept: 'Packing & Dispatch', pct: 12, cost: '1.80 Cr', color: GREEN },
]

const TABS = [
  { key: 'overview', label: 'Overview & Schedule', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg> },
  { key: 'wo', label: 'Work Orders', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: 'predictive', label: 'Predictive Schedule', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg> },
  { key: 'spares', label: 'Spare Parts', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
  { key: 'cost', label: 'Cost Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
]

function MaintenanceScheduling({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Maintenance & Work Orders</h1>
            <p style={sty.pageSub}>Preventive, predictive & corrective maintenance scheduling, work order tracking, spare parts & cost analysis</p>
          </div>
        </div>
        <span style={sty.liveBadge}><span style={sty.liveDot} /> 96.8% PM Compliance</span>
      </div>
      <div style={sty.tabs}>
        {TABS.map(t => <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>)}
      </div>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'wo' && <WOTab />}
      {activeTab === 'predictive' && <PredictiveTab />}
      {activeTab === 'spares' && <SparesTab />}
      {activeTab === 'cost' && <CostTab />}
    </div>
  )
}

function OverviewTab() {
  const typeColors = { preventive: BLUE, predictive: ACCENT, corrective: AMBER }
  return (
    <>
      <Section title="Maintenance KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={sty.kpiCard}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Weekly Maintenance Calendar" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {weekSchedule.map((d, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9', minHeight: '100px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>{d.day}</div>
              {d.tasks.map((t, j) => (
                <div key={j} style={{ padding: '4px 6px', marginBottom: '4px', borderRadius: '4px', background: `${typeColors[t.type]}10`, borderLeft: `2px solid ${typeColors[t.type]}`, fontSize: '10px', color: '#1e293b' }}>
                  {t.name}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', justifyContent: 'center' }}>
          {[{ label: 'Preventive', color: BLUE }, { label: 'Predictive', color: ACCENT }, { label: 'Corrective', color: AMBER }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} /><span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span></div>
          ))}
        </div>
      </Section>
    </>
  )
}

function WOTab() {
  const [showForm, setShowForm] = useState(false)
  const [newWO, setNewWO] = useState({ equipment: '', type: 'preventive', priority: 'medium', team: '', due: '', estHrs: '', description: '' })
  const [woList, setWoList] = useState(workOrders)

  const handleCreate = (e) => {
    e.preventDefault()
    const woNum = `WO-2026-${1042 + woList.length - workOrders.length}`
    const today = new Date()
    const created = `${today.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()]}`
    setWoList([{ wo: woNum, equipment: newWO.equipment, type: newWO.type, priority: newWO.priority, team: newWO.team, status: 'open', created, due: newWO.due, estHrs: parseFloat(newWO.estHrs) || 0, actHrs: 0 }, ...woList])
    setNewWO({ equipment: '', type: 'preventive', priority: 'medium', team: '', due: '', estHrs: '', description: '' })
    setShowForm(false)
  }

  const typeColors = { preventive: BLUE, predictive: ACCENT, corrective: AMBER, breakdown: RED }
  const priorityColors = { critical: RED, high: AMBER, medium: BLUE, low: GREEN }
  const statusColors = { open: AMBER, 'in-progress': BLUE, scheduled: ACCENT, completed: GREEN }

  return (
    <Section title="Work Order Tracker" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>}>
      {/* Create Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button onClick={() => setShowForm(!showForm)} style={sty.createBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showForm ? 'Cancel' : 'Create New Work Order'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} style={sty.woForm}>
          <div style={sty.woFormTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
            New Work Order
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={sty.formLabel}>Equipment / Asset *</label>
              <input style={sty.formInput} required placeholder="e.g. Kiln Support Roller #3" value={newWO.equipment} onChange={e => setNewWO({ ...newWO, equipment: e.target.value })} />
            </div>
            <div>
              <label style={sty.formLabel}>Assigned Team *</label>
              <input style={sty.formInput} required placeholder="e.g. Mech Team A" value={newWO.team} onChange={e => setNewWO({ ...newWO, team: e.target.value })} />
            </div>
            <div>
              <label style={sty.formLabel}>Type</label>
              <select style={sty.formInput} value={newWO.type} onChange={e => setNewWO({ ...newWO, type: e.target.value })}>
                <option value="preventive">Preventive</option>
                <option value="predictive">Predictive</option>
                <option value="corrective">Corrective</option>
                <option value="breakdown">Breakdown</option>
              </select>
            </div>
            <div>
              <label style={sty.formLabel}>Priority</label>
              <select style={sty.formInput} value={newWO.priority} onChange={e => setNewWO({ ...newWO, priority: e.target.value })}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={sty.formLabel}>Due Date *</label>
              <input style={sty.formInput} required placeholder="e.g. 25 Mar" value={newWO.due} onChange={e => setNewWO({ ...newWO, due: e.target.value })} />
            </div>
            <div>
              <label style={sty.formLabel}>Estimated Hours</label>
              <input style={sty.formInput} type="number" placeholder="e.g. 8" value={newWO.estHrs} onChange={e => setNewWO({ ...newWO, estHrs: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={sty.formLabel}>Description</label>
            <textarea style={{ ...sty.formInput, minHeight: '60px', resize: 'vertical' }} placeholder="Describe the work to be done..." value={newWO.description} onChange={e => setNewWO({ ...newWO, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={sty.cancelBtn}>Cancel</button>
            <button type="submit" style={sty.submitBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              Create Work Order
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead><tr>{['WO #', 'Equipment', 'Type', 'Priority', 'Team', 'Status', 'Created', 'Due', 'Est/Act Hrs'].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
          <tbody>
            {woList.map((w, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{w.wo}</span></td>
                <td style={sty.td}><span style={{ fontWeight: 500 }}>{w.equipment}</span></td>
                <td style={sty.td}><span style={{ ...sty.statusPill, background: `${typeColors[w.type]}15`, color: typeColors[w.type] }}>{w.type}</span></td>
                <td style={sty.td}><span style={{ ...sty.statusPill, background: `${priorityColors[w.priority]}15`, color: priorityColors[w.priority] }}>{w.priority}</span></td>
                <td style={sty.td}>{w.team}</td>
                <td style={sty.td}><span style={{ ...sty.statusPill, background: `${statusColors[w.status]}15`, color: statusColors[w.status] }}>{w.status}</span></td>
                <td style={sty.td}>{w.created}</td>
                <td style={sty.td}>{w.due}</td>
                <td style={sty.td}>{w.estHrs}h / {w.actHrs > 0 ? `${w.actHrs}h` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function PredictiveTab() {
  return (
    <Section title="AI-Predicted Maintenance Schedule" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {predictiveItems.map((p, i) => (
          <div key={i} style={{ ...sty.predCard, borderLeft: `3px solid ${p.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{p.equipment}</span>
                  <span style={{ ...sty.statusPill, background: `${p.color}15`, color: p.color }}>{p.priority}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Predicted failure: <span style={{ color: '#1e293b', fontWeight: 600 }}>{p.failure}</span></div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>{p.action}</div>
              </div>
              <div style={{ minWidth: '120px', textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: p.color }}>{p.timeToFail}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>to failure</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>Est. Cost: {p.cost}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>AI Confidence:</span>
              <ProgressBar value={p.confidence} color={ACCENT} height={4} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{p.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function SparesTab() {
  return (
    <Section title="Critical Spare Parts Inventory" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead><tr>{['Spare Part', 'Part No.', 'Equipment', 'Stock', 'Reorder Level', 'Lead Time', 'Unit Cost', 'Status'].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
          <tbody>
            {spareParts.map((s, i) => {
              const sc = s.status === 'in-stock' ? GREEN : s.status === 'low' ? AMBER : RED
              return (
                <tr key={i} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600 }}>{s.name}</span></td>
                  <td style={sty.td}><span style={{ fontSize: '10px', color: '#94a3b8' }}>{s.partNo}</span></td>
                  <td style={sty.td}>{s.equipment}</td>
                  <td style={sty.td}><span style={{ fontWeight: 700, color: s.stock <= s.reorder ? AMBER : '#1e293b' }}>{s.stock}</span></td>
                  <td style={sty.td}>{s.reorder}</td>
                  <td style={sty.td}>{s.leadTime}</td>
                  <td style={sty.td}>{s.cost}</td>
                  <td style={sty.td}><span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{s.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function CostTab() {
  return (
    <>
      <Section title="Maintenance Cost Analysis" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {[{ label: 'Annual Budget', value: '16.8 Cr', color: '#64748b' }, { label: 'YTD Actual', value: '14.94 Cr', color: ACCENT }, { label: 'Variance', value: '-1.86 Cr (under)', color: GREEN }, { label: 'Cost per MT Cement', value: '124', color: BLUE }].map((s, i) => (
            <div key={i} style={{ ...sty.summaryCard, flex: 1 }}><div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div><div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div></div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Cost by Maintenance Type</h4>
            <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
              {costByType.map((c, i) => <div key={i} style={{ width: `${c.pct}%`, background: c.color }} title={`${c.type}: ${c.pct}%`} />)}
            </div>
            {costByType.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: c.color }} />{c.type}</div>
                <span style={{ fontWeight: 600 }}>{c.cost} ({c.pct}%)</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Cost by Department</h4>
            {costByDept.map((d, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '12px' }}>
                  <span>{d.dept}</span><span style={{ fontWeight: 600, color: d.color }}>{d.cost} ({d.pct}%)</span>
                </div>
                <ProgressBar value={d.pct} max={40} color={d.color} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Monthly Cost Trend (Cr)</h4>
          <AreaChart data={[1.52,1.48,1.42,1.38,1.35,1.28,1.24]} color={ACCENT} height={80} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
            {['Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </Section>
    </>
  )
}

const sty = {
  page: { animation: 'fadeUp 0.6s ease' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionIcon: { width: '34px', height: '34px', borderRadius: '8px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', textAlign: 'center' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  predCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  woForm: { background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' },
  woFormTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' },
  formLabel: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' },
  formInput: { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#1e293b', background: '#fff', boxSizing: 'border-box', outline: 'none' },
  cancelBtn: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
}

export default MaintenanceScheduling
