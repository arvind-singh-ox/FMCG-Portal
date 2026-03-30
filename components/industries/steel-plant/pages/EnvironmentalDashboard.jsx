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

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={label ? size/2-4 : size/2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// ENVIRONMENTAL COMPLIANCE DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Overall Compliance', value: '96.8%', color: GREEN },
  { label: 'Consent Valid Until', value: '31 Dec 2026', color: GREEN },
  { label: 'CEMS Uptime', value: '99.4%', color: GREEN },
  { label: 'Exceedances (30 days)', value: '0', color: GREEN },
  { label: 'Next SPCB Audit', value: '14 Apr 2026', color: AMBER },
  { label: 'ESG Rating', value: 'A (MSCI)', color: ACCENT },
]

// ── Environmental Compliance Scorecard ──
const complianceScore = [
  { category: 'Air Emissions (Stack)', score: 97, target: 95, items: 6, nonConf: 0, color: GREEN, trend: [94, 95, 96, 96, 97, 97, 97] },
  { category: 'Fugitive Emissions', score: 94, target: 90, items: 8, nonConf: 0, color: GREEN, trend: [88, 90, 91, 92, 93, 94, 94] },
  { category: 'Ambient Air Quality', score: 98, target: 95, items: 4, nonConf: 0, color: GREEN, trend: [96, 97, 97, 98, 98, 98, 98] },
  { category: 'Water / Effluent', score: 96, target: 95, items: 10, nonConf: 0, color: GREEN, trend: [92, 93, 94, 95, 96, 96, 96] },
  { category: 'Solid / Hazardous Waste', score: 92, target: 90, items: 6, nonConf: 1, color: AMBER, trend: [88, 89, 90, 91, 91, 92, 92] },
  { category: 'Noise', score: 100, target: 95, items: 4, nonConf: 0, color: GREEN, trend: [98, 99, 100, 100, 100, 100, 100] },
  { category: 'GHG / Carbon', score: 98, target: 95, items: 3, nonConf: 0, color: GREEN, trend: [94, 95, 96, 97, 98, 98, 98] },
  { category: 'Biodiversity & Green Belt', score: 95, target: 90, items: 3, nonConf: 0, color: GREEN, trend: [92, 93, 94, 94, 95, 95, 95] },
]

// ── Consent & Permit Status ──
const consentsPermits = [
  { permit: 'Consent to Operate (CTO)', authority: 'SPCB — Odisha', issued: '01 Jan 2025', valid: '31 Dec 2026', status: 'Active', conditions: 42, complied: 41, color: GREEN },
  { permit: 'Environment Clearance (EC)', authority: 'MoEFCC', issued: '15 Jun 2020', valid: '15 Jun 2030', status: 'Active', conditions: 38, complied: 38, color: GREEN },
  { permit: 'Hazardous Waste Authorization', authority: 'SPCB — Odisha', issued: '01 Apr 2025', valid: '31 Mar 2026', status: 'Active', conditions: 12, complied: 12, color: GREEN },
  { permit: 'Coastal Regulation Zone (CRZ)', authority: 'MoEFCC / OCZMA', issued: '01 Mar 2021', valid: '01 Mar 2031', status: 'Active', conditions: 8, complied: 8, color: GREEN },
  { permit: 'Forest Clearance (Stage-II)', authority: 'MoEFCC / State Forest', issued: '12 Aug 2019', valid: 'Perpetual', status: 'Active', conditions: 15, complied: 14, color: AMBER },
  { permit: 'Water Abstraction License', authority: 'Water Resources Dept', issued: '01 Jul 2024', valid: '30 Jun 2027', status: 'Active', conditions: 6, complied: 6, color: GREEN },
]

// ── Environmental Monitoring Calendar ──
const monitoringCalendar = [
  { activity: 'Stack Emission Testing (CEMS validation)', frequency: 'Quarterly', lastDone: '15 Feb 2026', nextDue: '15 May 2026', agency: 'NABL-accredited lab', status: 'Completed' },
  { activity: 'Ambient Air Quality (AAQ) Monitoring', frequency: 'Monthly', lastDone: '05 Mar 2026', nextDue: '05 Apr 2026', agency: 'In-house + Third-party', status: 'Completed' },
  { activity: 'Effluent / Water Quality Testing', frequency: 'Monthly', lastDone: '10 Mar 2026', nextDue: '10 Apr 2026', agency: 'NABL lab', status: 'Completed' },
  { activity: 'Noise Level Survey', frequency: 'Quarterly', lastDone: '20 Jan 2026', nextDue: '20 Apr 2026', agency: 'In-house', status: 'Due Soon' },
  { activity: 'Groundwater Quality Monitoring', frequency: 'Quarterly', lastDone: '01 Feb 2026', nextDue: '01 May 2026', agency: 'NABL lab', status: 'Completed' },
  { activity: 'Hazardous Waste Manifest Audit', frequency: 'Quarterly', lastDone: '28 Feb 2026', nextDue: '31 May 2026', agency: 'TSDF operator + SPCB', status: 'Completed' },
  { activity: 'Green Belt / Tree Census', frequency: 'Annual', lastDone: '15 Nov 2025', nextDue: '15 Nov 2026', agency: 'Forest Dept consultant', status: 'Completed' },
  { activity: 'SPCB Inspection (Surprise)', frequency: 'Random', lastDone: '22 Jan 2026', nextDue: '—', agency: 'SPCB Odisha', status: 'N/A' },
]

// ── Environmental KPIs ──
const envKPIs = [
  { kpi: 'CO₂ Intensity', value: '1.85', unit: 'T CO₂/TCS', target: '1.90', trend: [1.92, 1.90, 1.88, 1.87, 1.86, 1.85], status: 'On Target', color: GREEN },
  { kpi: 'SO₂ Specific Emission', value: '0.42', unit: 'kg/TCS', target: '0.50', trend: [0.48, 0.46, 0.44, 0.43, 0.42, 0.42], status: 'On Target', color: GREEN },
  { kpi: 'PM Specific Emission', value: '0.38', unit: 'kg/TCS', target: '0.50', trend: [0.45, 0.43, 0.41, 0.40, 0.38, 0.38], status: 'On Target', color: GREEN },
  { kpi: 'Water Specific Consumption', value: '3.2', unit: 'm³/TCS', target: '3.5', trend: [3.6, 3.5, 3.4, 3.3, 3.2, 3.2], status: 'On Target', color: GREEN },
  { kpi: 'Solid Waste Recycling', value: '89.6', unit: '%', target: '85', trend: [84, 86, 87, 88, 89, 89.6], status: 'Above Target', color: GREEN },
  { kpi: 'Zero Liquid Discharge', value: '94.2', unit: '% recycled', target: '90', trend: [89, 90, 91, 92, 93, 94.2], status: 'Above Target', color: GREEN },
  { kpi: 'Green Belt Coverage', value: '34.8', unit: '% of area', target: '33', trend: [32, 33, 33.5, 34, 34.5, 34.8], status: 'Above Target', color: GREEN },
  { kpi: 'Specific Energy (SEC)', value: '5.82', unit: 'Gcal/TCS', target: '5.90', trend: [5.95, 5.92, 5.88, 5.85, 5.83, 5.82], status: 'On Target', color: GREEN },
]

// ── ESG Reporting ──
const esgMetrics = {
  environmental: [
    { metric: 'Scope 1 GHG Emissions', value: '6.74 MT CO₂e/year', yoy: '-3.6%' },
    { metric: 'Scope 2 GHG Emissions', value: '0.48 MT CO₂e/year', yoy: '-5.2%' },
    { metric: 'Renewable Energy Share', value: '4.4%', yoy: '+1.8%' },
    { metric: 'Water Withdrawal', value: '11.7M m³/year', yoy: '-6.1%' },
    { metric: 'Waste Diversion Rate', value: '89.6%', yoy: '+2.4%' },
    { metric: 'Environmental CAPEX', value: '₹142 Cr/year', yoy: '+8%' },
  ],
  social: [
    { metric: 'LTIFR (Lost Time Injury)', value: '0.28', yoy: '-15%' },
    { metric: 'CSR Spend', value: '₹48 Cr/year', yoy: '+12%' },
    { metric: 'Local Employment', value: '68%', yoy: '+3%' },
  ],
  governance: [
    { metric: 'Board ESG Committee', value: 'Active', yoy: '—' },
    { metric: 'CDP Score', value: 'B', yoy: 'B (maintained)' },
    { metric: 'MSCI ESG Rating', value: 'A', yoy: 'Upgraded from BBB' },
  ],
}

// ── Corrective Actions / NCR Log ──
const ncrLog = [
  { id: 'NCR-042', issue: 'ETP sludge recycling rate below 70% target (actual: 69%)', category: 'Waste', raised: '12 Mar 2026', dueDate: '15 Apr 2026', status: 'In Progress', action: 'Briquetting plant night-shift scheduling to process additional 40 MT/day', owner: 'Environment Dept' },
  { id: 'NCR-041', issue: 'Forest clearance condition #7 — compensatory afforestation shortfall', category: 'Forest', raised: '28 Feb 2026', dueDate: '30 Jun 2026', status: 'In Progress', action: '12 hectare plantation drive initiated with State Forest Dept', owner: 'CSR + Environment' },
  { id: 'NCR-039', issue: 'Coke oven door leakage above 5% during Feb (actual: 5.2%)', category: 'Air', raised: '05 Mar 2026', dueDate: '20 Mar 2026', status: 'Closed', action: 'Door sealing compound replaced on ovens #14, #22, #31. Retested: 2.8%', owner: 'Coke Oven Maintenance' },
]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'medium', title: 'Noise survey due in 32 days — schedule proactively', reason: 'Quarterly noise survey due 20 Apr 2026. Last survey showed DG set area at 82 dB(A) vs 85 dB(A) limit. AI recommends installing acoustic enclosure on DG-04 before survey — predicted reduction: 8 dB(A).', impact: 'Ensure noise compliance with margin', model: 'Compliance Calendar AI', confidence: 92 },
  { priority: 'medium', title: 'Accelerate compensatory afforestation for FC condition', reason: 'NCR-041 requires 12 hectare plantation by Jun 2026. Current progress: 4.2 hectares (35%). AI scheduling model suggests engaging additional contractor team to meet timeline.', impact: 'Avoid Forest Dept non-compliance', model: 'Project Timeline AI', confidence: 88 },
  { priority: 'low', title: 'CDP questionnaire optimization — target B to A- upgrade', reason: 'CDP score currently B. AI analysis of scoring criteria shows: (1) Scope 3 emissions disclosure gap, (2) Science-Based Target (SBTi) not yet committed, (3) TCFD alignment partial. Addressing these 3 items predicts A- rating.', impact: 'ESG rating improvement, investor confidence', model: 'ESG Scoring AI', confidence: 85 },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function EnvironmentalDashboard() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'scorecard', label: 'Compliance Scorecard' },
    { key: 'consents', label: 'Consents & Permits' },
    { key: 'calendar', label: 'Monitoring Calendar' },
    { key: 'kpis', label: 'Environmental KPIs' },
    { key: 'esg', label: 'ESG Reporting' },
    { key: 'ncr', label: 'NCR / CAPA' },
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
          <h1 style={st.title}>Environmental Compliance Dashboard</h1>
          <p style={st.sub}>AI-driven compliance tracking, consent management, ESG reporting & environmental KPIs</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> All Compliant</span>
          <span style={st.aiBadge}>Compliance AI: Active</span>
          <span style={st.timeBadge}>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ COMPLIANCE SCORECARD ═══ */}
      {show('scorecard') && (
        <Section title="Environmental Compliance Scorecard" badge="8 Categories" icon="SC">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {complianceScore.map((c, i) => (
              <div key={c.category} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderTop: `3px solid ${c.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.3', flex: 1 }}>{c.category}</div>
                  <DonutChart value={c.score} max={100} size={48} strokeWidth={5} color={c.color} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Items: {c.items}</span>
                  <span style={{ color: c.nonConf > 0 ? AMBER : GREEN, fontWeight: 600 }}>Non-Conf: {c.nonConf}</span>
                </div>
                <AreaChart data={c.trend} color={c.color} height={24} />
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Target: {c.target}%</div>
              </div>
            ))}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Overall Score </span><span style={{ ...st.tinyVal, color: GREEN }}>96.8%</span></div>
            <div><span style={st.tinyLabel}>Categories Compliant </span><span style={st.tinyVal}>8 / 8</span></div>
            <div><span style={st.tinyLabel}>Open Non-Conformances </span><span style={{ ...st.tinyVal, color: AMBER }}>1</span></div>
            <div><span style={st.tinyLabel}>Exceedances (30 days) </span><span style={{ ...st.tinyVal, color: GREEN }}>0</span></div>
          </div>
        </Section>
      )}

      {/* ═══ CONSENTS & PERMITS ═══ */}
      {show('consents') && (
        <Section title="Consents, Permits & Clearances" badge="6 Active" icon="CP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {consentsPermits.map((p, i) => (
              <div key={p.permit} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{p.permit}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{p.authority}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Valid: {p.issued} → {p.valid}</div>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>{p.status}</span>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: p.complied === p.conditions ? GREEN : AMBER }}>{p.complied} / {p.conditions}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Conditions Met</div>
                </div>
                <DonutChart value={p.complied} max={p.conditions} size={48} strokeWidth={5} color={p.color} label="met" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ MONITORING CALENDAR ═══ */}
      {show('calendar') && (
        <Section title="Environmental Monitoring Calendar" badge="8 Activities" icon="MC">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.6fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Activity', 'Frequency', 'Last Done', 'Next Due', 'Agency', 'Status'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {monitoringCalendar.map((m, i) => {
              const statusColor = m.status === 'Completed' ? GREEN : m.status === 'Due Soon' ? AMBER : '#94a3b8'
              return (
                <div key={m.activity} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 1fr 0.6fr', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.06}s both`, borderLeft: `3px solid ${statusColor}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.activity}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{m.frequency}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{m.lastDone}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: m.status === 'Due Soon' ? AMBER : '#1e293b' }}>{m.nextDue}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{m.agency}</div>
                  <div><span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{m.status}</span></div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ ENVIRONMENTAL KPIs ═══ */}
      {show('kpis') && (
        <Section title="Environmental Performance KPIs" badge="8 Key Metrics" icon="KP">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {envKPIs.map((k, i) => (
              <div key={k.kpi} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderTop: `3px solid ${k.color}` }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', lineHeight: '1.3' }}>{k.kpi}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{k.value}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> {k.unit}</span></div>
                <div style={{ fontSize: '9px', color: k.color, fontWeight: 600, marginTop: '2px', marginBottom: '8px' }}>{k.status} (Target: {k.target})</div>
                <AreaChart data={k.trend} color={k.color} height={28} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ ESG REPORTING ═══ */}
      {show('esg') && (
        <Section title="ESG Metrics & Reporting" badge="MSCI Rating: A" icon="ES">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { title: 'Environmental', data: esgMetrics.environmental, color: GREEN },
              { title: 'Social', data: esgMetrics.social, color: BLUE },
              { title: 'Governance', data: esgMetrics.governance, color: ACCENT },
            ].map((pillar, pi) => (
              <div key={pillar.title} style={{ ...st.card, animation: `slideIn 0.7s ease ${pi * 0.1}s both`, borderTop: `3px solid ${pillar.color}` }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{pillar.title}</div>
                {pillar.data.map((m, i) => (
                  <div key={m.metric} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{m.metric}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{m.value}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: m.yoy.includes('-') || m.yoy.includes('+') ? (m.metric.includes('Injury') || m.metric.includes('Withdrawal') || m.metric.includes('Emission') ? (m.yoy.includes('-') ? GREEN : RED) : (m.yoy.includes('+') ? GREEN : AMBER)) : '#94a3b8' }}>{m.yoy}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ ...st.card, marginTop: '14px', display: 'flex', gap: '32px' }}>
            <div><span style={st.tinyLabel}>MSCI ESG Rating </span><span style={{ ...st.tinyVal, color: GREEN }}>A (Upgraded)</span></div>
            <div><span style={st.tinyLabel}>CDP Score </span><span style={st.tinyVal}>B</span></div>
            <div><span style={st.tinyLabel}>Dow Jones SI </span><span style={st.tinyVal}>Eligible</span></div>
            <div><span style={st.tinyLabel}>BRSR Filing </span><span style={{ ...st.tinyVal, color: GREEN }}>Submitted</span></div>
            <div><span style={st.tinyLabel}>GRI Report </span><span style={{ ...st.tinyVal, color: GREEN }}>Published</span></div>
          </div>
        </Section>
      )}

      {/* ═══ NCR / CAPA ═══ */}
      {show('ncr') && (
        <Section title="Non-Conformance & Corrective Actions" badge={`${ncrLog.length} Active`} icon="NC">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ncrLog.map((n, i) => {
              const statusColor = n.status === 'Closed' ? GREEN : n.status === 'In Progress' ? AMBER : RED
              return (
                <div key={n.id} style={{ ...st.card, borderLeft: `4px solid ${statusColor}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{n.id}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{n.status}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '10px' }}>{n.category}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#94a3b8' }}>
                      <div>Raised: {n.raised}</div>
                      <div>Due: <strong style={{ color: '#1e293b' }}>{n.dueDate}</strong></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', marginBottom: '6px' }}>{n.issue}</div>
                  <div style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.5', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px' }}>Action: {n.action}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Owner: {n.owner}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Compliance Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high: RED, medium: AMBER, low: GREEN }
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
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: <strong style={{ color: ACCENT }}>{rec.confidence}%</strong> | Impact: <strong style={{ color: GREEN }}>{rec.impact}</strong></span>
              </div>
            )
          })}
        </div>
      </Section>

      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Environmental Compliance</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Tracking 8 compliance categories, 6 active consents (121 conditions), 8 monitoring activities, and 3 open NCRs.
            Overall compliance score: 96.8%. Zero exceedances in last 45 days. CEMS uptime: 99.4% (CPCB server connected).
            ESG metrics: MSCI A rating, CDP B score, BRSR submitted. CO₂ intensity at 1.85 T/TCS — below PAT target.
            AI proactively flagging upcoming deadlines, potential non-conformances, and ESG rating improvement opportunities.
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
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
