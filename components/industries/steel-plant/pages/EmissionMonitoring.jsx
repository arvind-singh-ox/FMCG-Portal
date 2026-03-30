'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => { const duration = 1400, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
}

function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null); const [w, setW] = useState(200)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span></div><div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL PLANT EMISSIONS DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Overall Compliance', value: '96.8%', color: '#10b981' },
  { label: 'CO₂ Intensity', value: '1.85 T/TCS', color: '#1e293b' },
  { label: 'Active CEMS Stations', value: '18 / 18', color: '#10b981' },
  { label: 'Exceedances Today', value: '0', color: '#10b981' },
  { label: 'PAT Scheme Credits', value: '+2,840 tCO₂e', color: ACCENT },
  { label: 'Next SPCB Audit', value: '14 Apr 2026', color: '#f59e0b' },
]

// ── Stack Emissions (CEMS — Continuous Emission Monitoring) ──
const stackEmissions = [
  { source: 'Sinter Plant Stack', so2: 38, so2Limit: 100, nox: 72, noxLimit: 100, pm: 42, pmLimit: 50, co: 1850, coLimit: 5000, status: 'compliant', trend: [36, 38, 40, 37, 38, 39, 38] },
  { source: 'Coke Oven Battery #1', so2: 28, so2Limit: 50, nox: 45, noxLimit: 80, pm: 22, pmLimit: 30, co: 920, coLimit: 3000, status: 'compliant', trend: [25, 28, 30, 27, 28, 29, 28] },
  { source: 'Blast Furnace Cast House', so2: 12, so2Limit: 50, nox: 18, noxLimit: 50, pm: 35, pmLimit: 50, co: 480, coLimit: 2000, status: 'compliant', trend: [30, 32, 34, 36, 35, 34, 35] },
  { source: 'BOF / SMS Stack', so2: 22, so2Limit: 50, nox: 55, noxLimit: 80, pm: 28, pmLimit: 50, co: 650, coLimit: 3000, status: 'compliant', trend: [20, 22, 24, 23, 22, 21, 22] },
  { source: 'Reheat Furnace Stack', so2: 18, so2Limit: 50, nox: 85, noxLimit: 100, pm: 15, pmLimit: 50, co: 420, coLimit: 2000, status: 'warning', trend: [78, 80, 82, 84, 85, 86, 85] },
  { source: 'Power Plant Stack', so2: 145, so2Limit: 200, nox: 125, noxLimit: 150, pm: 38, pmLimit: 50, co: 280, coLimit: 1000, status: 'compliant', trend: [140, 142, 145, 148, 146, 145, 145] },
]

// ── Greenhouse Gas (GHG) Emissions ──
const ghgData = {
  totalCO2: 18450,
  unit: 'tCO₂/day',
  intensity: 1.85,
  intensityUnit: 'tCO₂/TCS',
  target: 1.90,
  breakdown: [
    { source: 'Blast Furnace (BF Gas)', value: 42, color: '#ef4444' },
    { source: 'Coke Oven (COG flaring)', value: 18, color: '#f59e0b' },
    { source: 'Sinter Plant', value: 14, color: '#ea580c' },
    { source: 'BOF / SMS', value: 10, color: ACCENT },
    { source: 'Power Plant', value: 9, color: '#3b82f6' },
    { source: 'Lime Kiln / Calcination', value: 5, color: '#10b981' },
    { source: 'Others (Transport, Utilities)', value: 2, color: '#94a3b8' },
  ],
  monthlyTrend: [1.92, 1.90, 1.88, 1.87, 1.86, 1.85, 1.84, 1.85, 1.86, 1.85, 1.84, 1.85],
}

// ── Fugitive Emissions ──
const fugitiveEmissions = [
  { area: 'Coke Oven Door Leakage', value: 2.8, limit: 5.0, unit: '%', method: 'Optical camera + EPA Method 303', status: 'compliant' },
  { area: 'Coke Oven Lid Leakage', value: 0.4, limit: 1.0, unit: '%', method: 'Visual inspection + AI', status: 'compliant' },
  { area: 'BF Cast House Fume', value: 1.2, limit: 3.0, unit: 'mg/m³', method: 'Fume extraction hood monitor', status: 'compliant' },
  { area: 'Sinter Cooler Windbox', value: 18, limit: 30, unit: 'mg/Nm³', method: 'Bag filter outlet CEMS', status: 'compliant' },
  { area: 'Coal Yard Dust', value: 1.5, limit: 3.0, unit: 'mg/m³', method: 'Ambient PM10 monitors', status: 'compliant' },
  { area: 'Slag Pit Steam/Fume', value: 0.8, limit: 2.0, unit: 'mg/m³', method: 'Area ambient monitor', status: 'compliant' },
  { area: 'BOF Roof Monitor', value: 22, limit: 30, unit: 'mg/Nm³', method: 'Secondary fume extraction ESP', status: 'warning' },
  { area: 'Raw Material Yard', value: 2.2, limit: 5.0, unit: 'mg/m³', method: 'PM2.5/PM10 ambient station', status: 'compliant' },
]

// ── Water Discharge & Effluent ──
const waterData = [
  { param: 'Water Consumption', value: 3.2, limit: 4.0, unit: 'm³/TCS', trend: [3.5, 3.4, 3.3, 3.2, 3.3, 3.2, 3.2] },
  { param: 'Recycled Water %', value: 94.2, limit: 90, unit: '%', trend: [92, 93, 93, 94, 94, 94, 94] },
  { param: 'COD (Effluent)', value: 82, limit: 150, unit: 'mg/L', trend: [90, 88, 85, 82, 84, 83, 82] },
  { param: 'BOD (Effluent)', value: 18, limit: 30, unit: 'mg/L', trend: [22, 20, 19, 18, 18, 19, 18] },
  { param: 'TSS (Effluent)', value: 45, limit: 100, unit: 'mg/L', trend: [52, 50, 48, 45, 46, 45, 45] },
  { param: 'pH', value: 7.2, limit: 8.5, unit: '', trend: [7.0, 7.1, 7.2, 7.3, 7.2, 7.1, 7.2] },
  { param: 'Oil & Grease', value: 4.2, limit: 10, unit: 'mg/L', trend: [5.5, 5.0, 4.8, 4.2, 4.5, 4.3, 4.2] },
  { param: 'Phenol', value: 0.08, limit: 0.5, unit: 'mg/L', trend: [0.12, 0.10, 0.09, 0.08, 0.09, 0.08, 0.08] },
  { param: 'Cyanide', value: 0.02, limit: 0.2, unit: 'mg/L', trend: [0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02] },
  { param: 'Ammonia-N', value: 12, limit: 30, unit: 'mg/L', trend: [18, 15, 14, 12, 13, 12, 12] },
]

// ── Solid Waste & By-products ──
const solidWaste = [
  { waste: 'BF Slag', generated: 2850, recycled: 2710, rate: 95.1, use: 'Cement, road aggregate', color: '#10b981' },
  { waste: 'BOF Slag', generated: 1420, recycled: 1135, rate: 79.9, use: 'Road construction, landfill', color: '#f59e0b' },
  { waste: 'Mill Scale', generated: 380, recycled: 365, rate: 96.1, use: 'Sinter plant feed', color: '#10b981' },
  { waste: 'Flue Dust (ESP/BF)', generated: 520, recycled: 490, rate: 94.2, use: 'Sinter plant, pelletization', color: '#10b981' },
  { waste: 'Sludge (ETP/BF)', generated: 210, recycled: 145, rate: 69.0, use: 'Briquetting, landfill', color: '#ef4444' },
  { waste: 'Refractory Scrap', generated: 85, recycled: 52, rate: 61.2, use: 'Reprocessing, third-party', color: '#ef4444' },
]

// ── Regulatory Framework ──
const regulations = [
  { regulation: 'MoEFCC Emission Norms (2024)', scope: 'Stack emissions — PM, SO₂, NOx', compliance: 'Compliant', lastAudit: '12 Feb 2026', nextAudit: '14 Apr 2026' },
  { regulation: 'CPCB CEMS Mandate', scope: 'Real-time monitoring to SPCB server', compliance: 'Connected', lastAudit: 'Continuous', nextAudit: 'Real-time' },
  { regulation: 'PAT Scheme (Cycle VII)', scope: 'Specific energy consumption target', compliance: 'Overachieved', lastAudit: '28 Jan 2026', nextAudit: '30 Jun 2026' },
  { regulation: 'Zero Liquid Discharge (ZLD)', scope: 'Effluent recycling >90%', compliance: 'Compliant (94.2%)', lastAudit: '15 Mar 2026', nextAudit: '15 Jun 2026' },
  { regulation: 'Hazardous Waste Rules', scope: 'ETP sludge, used oil, spent refractory', compliance: 'Compliant', lastAudit: '01 Mar 2026', nextAudit: '01 Jun 2026' },
  { regulation: 'Carbon Credit (CCTS)', scope: 'GHG intensity reduction target', compliance: 'On Track', lastAudit: '15 Feb 2026', nextAudit: '15 Aug 2026' },
]

// ── Ambient Air Quality ──
const ambientAir = [
  { station: 'Upwind Station (Background)', pm25: 32, pm10: 58, so2: 8, nox: 14, co: 0.4 },
  { station: 'Plant Boundary — North', pm25: 48, pm10: 82, so2: 18, nox: 28, co: 0.8 },
  { station: 'Plant Boundary — South', pm25: 42, pm10: 75, so2: 15, nox: 22, co: 0.6 },
  { station: 'Colony / Township', pm25: 35, pm10: 62, so2: 10, nox: 16, co: 0.5 },
]
const ambientLimits = { pm25: 60, pm10: 100, so2: 80, nox: 80, co: 2.0 }

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'Reheat furnace NOx trending — adjust excess air ratio', reason: 'NOx at 85 mg/Nm³ (limit: 100). Trend shows +2 mg/Nm³ per day for last 4 days. AI predicts exceedance in 7 days at current rate. Reducing excess air from 4.2% to 3.5% will lower NOx by ~12 mg/Nm³.', impact: 'NOx reduction: 85 → 73 mg/Nm³', model: 'Combustion NOx Predictor', confidence: 93 },
  { priority: 'high', title: 'BOF secondary fume capture rate improvement needed', reason: 'Roof monitor PM at 22 mg/Nm³ (limit: 30). During BOF blowing, fugitive fume escaping at 8%. AI recommends increasing secondary hood fan speed from 85% to 92% during blow phase.', impact: 'Fugitive PM: -35%', model: 'CFD Fume Model', confidence: 90 },
  { priority: 'medium', title: 'Optimize sinter plant ESP rapping cycle', reason: 'ESP outlet PM increased from 38 to 42 mg/Nm³ over 2 weeks. Collecting electrode dust cake resistance increasing. Adjusting rapping intensity and frequency will restore PM to 35 mg/Nm³.', impact: 'PM reduction: 42 → 35 mg/Nm³', model: 'ESP Performance AI', confidence: 88 },
  { priority: 'medium', title: 'Carbon intensity reduction — increase BF gas recovery', reason: 'BF gas flaring at 8% of total generation (target: <5%). Gas holder level management AI can reduce flaring by 4.2% through better coordination with power plant load scheduling.', impact: 'CO₂ saving: 320 tCO₂/day', model: 'Gas Network Optimizer', confidence: 92 },
  { priority: 'low', title: 'ETP sludge recycling through briquetting plant', reason: 'ETP sludge recycling at 69% — lowest among all waste streams. New briquetting plant commissioned last month can process additional 40 MT/day. AI scheduling suggests night-shift briquetting window.', impact: 'Recycling: 69% → 88%', model: 'Waste Optimization AI', confidence: 85 },
]

// ── CO₂ intensity trend ──
const co2IntensityTrend = [1.92, 1.90, 1.88, 1.87, 1.86, 1.85, 1.84, 1.85, 1.86, 1.85, 1.84, 1.85]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function EmissionMonitoring() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Parameters' },
    { key: 'stack', label: 'Stack Emissions' },
    { key: 'ghg', label: 'GHG / CO₂' },
    { key: 'fugitive', label: 'Fugitive Emissions' },
    { key: 'water', label: 'Water & Effluent' },
    { key: 'waste', label: 'Solid Waste' },
    { key: 'ambient', label: 'Ambient Air' },
    { key: 'regulatory', label: 'Regulatory' },
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

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Emissions Monitoring & Compliance</h1>
          <p style={st.sub}>AI-powered real-time emission tracking, GHG reporting & regulatory compliance — Integrated Steel Plant</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> 18 CEMS Online</span>
          <span style={st.aiBadge}>CPCB Server: Connected</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ STACK EMISSIONS ═══ */}
      {show('stack') && (
        <Section title="Stack Emissions — CEMS Real-Time" badge="6 Monitoring Points" icon="SE">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stackEmissions.map((s, i) => {
              const so2Pct = (s.so2 / s.so2Limit) * 100
              const noxPct = (s.nox / s.noxLimit) * 100
              const pmPct = (s.pm / s.pmLimit) * 100
              const worstPct = Math.max(so2Pct, noxPct, pmPct)
              const borderColor = worstPct > 90 ? '#ef4444' : worstPct > 75 ? '#f59e0b' : '#10b981'
              return (
                <div key={s.source} style={{ ...st.card, borderLeft: `4px solid ${borderColor}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{s.source}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: borderColor, background: `${borderColor}15`, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>{s.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'SO₂', value: s.so2, limit: s.so2Limit, unit: 'mg/Nm³' },
                      { label: 'NOx', value: s.nox, limit: s.noxLimit, unit: 'mg/Nm³' },
                      { label: 'PM', value: s.pm, limit: s.pmLimit, unit: 'mg/Nm³' },
                      { label: 'CO', value: s.co, limit: s.coLimit, unit: 'mg/Nm³' },
                    ].map((p) => {
                      const pct = (p.value / p.limit) * 100
                      const col = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#10b981'
                      return (
                        <div key={p.label} style={{ textAlign: 'center' }}>
                          <DonutChart value={pct} max={100} size={60} strokeWidth={5} color={col} />
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{p.value} <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>{p.unit}</span></div>
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{p.label} | Limit: {p.limit}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>NOx Trend (7 days)</div>
                    <AreaChart data={s.trend} color={borderColor} height={32} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ GHG / CO₂ ═══ */}
      {show('ghg') && (
        <Section title="Greenhouse Gas Emissions" badge="Carbon Accounting" icon="GH">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={ghgData.totalCO2} decimals={0} /></div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{ghgData.unit}</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: ghgData.intensity <= ghgData.target ? '#10b981' : '#ef4444' }}><AnimatedValue value={ghgData.intensity} decimals={2} /></div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{ghgData.intensityUnit} (Target: {ghgData.target})</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: '10px', padding: '16px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>+2,840</div>
                  <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>tCO₂e PAT Credits Earned</div>
                </div>
              </div>
              <div style={st.cardLabel}>CO₂ Source Breakdown</div>
              <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', marginTop: '8px' }}>
                {ghgData.breakdown.map((b, i) => (<div key={i} style={{ width: `${b.value}%`, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#fff', transition: 'width 1.4s ease' }}>{b.value > 8 ? `${b.value}%` : ''}</div>))}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {ghgData.breakdown.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: b.color }} /><span style={{ fontSize: '10px', color: '#64748b' }}>{b.source}: {b.value}%</span></div>))}
              </div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>CO₂ Intensity Trend (tCO₂/TCS) — 12 Months</div>
              <div style={{ marginTop: '12px' }}><AreaChart data={co2IntensityTrend} color={ACCENT} height={120} /></div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 1.85 tCO₂/TCS</span></div>
                <div><span style={st.tinyLabel}>Best</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 1.84</span></div>
                <div><span style={st.tinyLabel}>Target</span><span style={st.tinyVal}> 1.90</span></div>
                <div><span style={st.tinyLabel}>YoY Change</span><span style={{ ...st.tinyVal, color: '#10b981' }}> -3.6%</span></div>
              </div>
              <div style={{ ...st.aiRow, marginTop: '12px' }}><span style={st.aiChip}>AI</span> CO₂ intensity reduced 3.6% YoY through PCI optimization, BF gas recovery, and WHR plant commissioning. On track to meet PAT Cycle VII target of 1.90 tCO₂/TCS.</div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ FUGITIVE EMISSIONS ═══ */}
      {show('fugitive') && (
        <Section title="Fugitive Emissions Monitoring" badge="8 Area Monitors" icon="FG">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {fugitiveEmissions.map((f, i) => {
              const pct = (f.value / f.limit) * 100
              const col = pct > 75 ? '#f59e0b' : '#10b981'
              return (
                <div key={f.area} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderTop: `3px solid ${col}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginBottom: '6px', lineHeight: '1.3' }}>{f.area}</div>
                  <DonutChart value={pct} max={100} size={56} strokeWidth={5} color={col} />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{f.value} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>{f.unit}</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Limit: {f.limit} {f.unit}</div>
                  <div style={{ fontSize: '8px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{f.method}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ WATER & EFFLUENT ═══ */}
      {show('water') && (
        <Section title="Water & Effluent Monitoring" badge="ZLD Compliant" icon="WA">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {waterData.map((w, i) => {
              const pct = w.param === 'Recycled Water %' ? ((100 - w.value) / (100 - w.limit)) * 100 : (w.value / w.limit) * 100
              const col = w.param === 'Recycled Water %' ? (w.value >= w.limit ? '#10b981' : '#f59e0b') : (pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981')
              return (
                <div key={w.param} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', lineHeight: '1.3' }}>{w.param}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{w.value}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> {w.unit}</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Limit: {w.limit} {w.unit}</div>
                  <div style={{ marginTop: '8px' }}><AreaChart data={w.trend} color={col} height={28} /></div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={st.aiRow}><span style={st.aiChip}>AI</span> Steel plant water recycling at 94.2% — exceeds ZLD norm of 90%. Phenol and cyanide levels (coke oven effluent) reduced 35% this quarter through AI-optimized biological treatment dosing. COD at 82 mg/L — 45% below limit.</div>
          </div>
        </Section>
      )}

      {/* ═══ SOLID WASTE ═══ */}
      {show('waste') && (
        <Section title="Solid Waste & By-Product Utilization" badge="Circular Economy" icon="SW">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {solidWaste.map((w, i) => (
              <div key={w.waste} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${w.color}` }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{w.waste}</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{w.generated.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Generated (MT/day)</div></div>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{w.recycled.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Recycled (MT/day)</div></div>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${w.rate}%`, background: w.color, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ fontWeight: 600, color: w.color }}>{w.rate}% recycled</span>
                  <span style={{ color: '#94a3b8' }}>{w.use}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Total Generated </span><span style={st.tinyVal}>5,465 MT/day</span></div>
            <div><span style={st.tinyLabel}>Total Recycled </span><span style={{ ...st.tinyVal, color: '#10b981' }}>4,897 MT/day</span></div>
            <div><span style={st.tinyLabel}>Overall Recycling Rate </span><span style={{ ...st.tinyVal, color: '#10b981' }}>89.6%</span></div>
            <div><span style={st.tinyLabel}>Landfill Diversion </span><span style={st.tinyVal}>568 MT/day</span></div>
          </div>
        </Section>
      )}

      {/* ═══ AMBIENT AIR ═══ */}
      {show('ambient') && (
        <Section title="Ambient Air Quality Monitoring" badge="4 AAQMS Stations" icon="AA">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(5, 1fr)', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Station', 'PM2.5 (μg/m³)', 'PM10 (μg/m³)', 'SO₂ (μg/m³)', 'NOx (μg/m³)', 'CO (mg/m³)'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>))}
            </div>
            {ambientAir.map((a, i) => (
              <div key={a.station} style={{ display: 'grid', gridTemplateColumns: '200px repeat(5, 1fr)', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.08}s both` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{a.station}</div>
                {[
                  { v: a.pm25, l: ambientLimits.pm25 },
                  { v: a.pm10, l: ambientLimits.pm10 },
                  { v: a.so2, l: ambientLimits.so2 },
                  { v: a.nox, l: ambientLimits.nox },
                  { v: a.co, l: ambientLimits.co },
                ].map((p, pi) => {
                  const pct = (p.v / p.l) * 100
                  const col = pct > 80 ? '#f59e0b' : '#10b981'
                  return (<div key={pi} style={{ fontSize: '13px', fontWeight: 600, color: col }}>{p.v} <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>/ {p.l}</span></div>)
                })}
              </div>
            ))}
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px' }}>NAAQS limits shown. All stations within Industrial Area standards (CPCB 2009).</div>
          </div>
        </Section>
      )}

      {/* ═══ REGULATORY ═══ */}
      {show('regulatory') && (
        <Section title="Regulatory Compliance Status" badge="6 Active Regulations" icon="RG">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {regulations.map((r, i) => {
              const compColor = r.compliance.includes('Compliant') || r.compliance.includes('Connected') || r.compliance.includes('Overachieved') || r.compliance.includes('On Track') ? '#10b981' : '#f59e0b'
              return (
                <div key={r.regulation} style={{ ...st.card, display: 'flex', alignItems: 'center', gap: '16px', animation: `slideIn 0.6s ease ${i * 0.08}s both`, borderLeft: `3px solid ${compColor}` }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{r.regulation}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{r.scope}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: compColor, background: `${compColor}15`, padding: '3px 10px', borderRadius: '10px' }}>{r.compliance}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Last Audit: {r.lastAudit}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>Next: {r.nextAudit}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Emission Optimization Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
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
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Impact: <strong style={{ color: '#10b981' }}>{rec.impact}</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Emissions Monitoring & Compliance</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 18 CEMS stations, 8 fugitive monitors, 4 AAQMS stations, and effluent quality in real-time. Data transmitted to CPCB/SPCB server every 15 minutes.
            Active models: Combustion NOx predictor, ESP performance optimizer, CFD fume capture model, Gas network optimizer for CO₂ reduction, Biological treatment dosing AI.
            CO₂ intensity reduced 3.6% year-over-year. Zero exceedances in last 45 days. PAT Scheme Cycle VII target overachieved — 2,840 tCO₂e credits earned.
            Solid waste recycling rate: 89.6%. Water recycling: 94.2% (ZLD compliant). Next SPCB audit: 14 Apr 2026.
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
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  row: { display: 'flex', gap: '14px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', marginTop: '8px', padding: '6px 0 0', borderTop: '1px solid #f1f5f9' },
  aiChip: { background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0 },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
