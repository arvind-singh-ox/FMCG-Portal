'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0); const numVal = parseFloat(String(value).replace(/,/g, '')); const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => { const duration = 1400, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
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
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span></div><div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL PLANT ENERGY DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Specific Energy (SEC)', value: '5.82 Gcal/TCS', color: '#1e293b' },
  { label: 'PAT Target', value: '5.90 Gcal/TCS', color: '#10b981' },
  { label: 'Electrical Load', value: '248 MW', color: ACCENT },
  { label: 'Captive Generation', value: '182 MW', color: '#10b981' },
  { label: 'Grid Import', value: '66 MW', color: '#f59e0b' },
  { label: 'Energy Cost Today', value: '₹3.42 Cr', color: '#1e293b' },
]

// ── SEC Breakdown by Process ──
const secBreakdown = [
  { process: 'Coke Making', sec: 0.62, unit: 'Gcal/TCS', share: 10.7, color: '#1e293b', trend: [0.65, 0.64, 0.63, 0.62, 0.63, 0.62, 0.62] },
  { process: 'Sintering', sec: 0.48, unit: 'Gcal/TCS', share: 8.2, color: '#ea580c', trend: [0.52, 0.50, 0.49, 0.48, 0.49, 0.48, 0.48] },
  { process: 'Ironmaking (BF)', sec: 2.85, unit: 'Gcal/TCS', share: 49.0, color: '#ef4444', trend: [2.92, 2.90, 2.88, 2.86, 2.85, 2.84, 2.85] },
  { process: 'Steelmaking (BOF)', sec: 0.18, unit: 'Gcal/TCS', share: 3.1, color: ACCENT, trend: [0.20, 0.19, 0.19, 0.18, 0.18, 0.18, 0.18] },
  { process: 'Continuous Casting', sec: 0.08, unit: 'Gcal/TCS', share: 1.4, color: '#3b82f6', trend: [0.09, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08] },
  { process: 'Hot Rolling', sec: 0.72, unit: 'Gcal/TCS', share: 12.4, color: '#f59e0b', trend: [0.76, 0.74, 0.73, 0.72, 0.73, 0.72, 0.72] },
  { process: 'Utilities (O₂, N₂, Water, Steam)', sec: 0.52, unit: 'Gcal/TCS', share: 8.9, color: '#10b981', trend: [0.55, 0.54, 0.53, 0.52, 0.53, 0.52, 0.52] },
  { process: 'Others (Lime, Power Plant Aux)', sec: 0.37, unit: 'Gcal/TCS', share: 6.4, color: '#94a3b8', trend: [0.40, 0.39, 0.38, 0.37, 0.38, 0.37, 0.37] },
]

// ── By-Product Gas Balance ──
const gasBalance = [
  { gas: 'BF Gas (BFG)', generated: 5840, recovered: 5380, flared: 460, cv: 3850, unit: 'kJ/Nm³', utilization: 92.1, consumers: 'Power Plant (62%), Hot Stoves (28%), Sinter (8%), Flare (2%)', color: '#ef4444' },
  { gas: 'Coke Oven Gas (COG)', generated: 1420, recovered: 1365, flared: 55, cv: 18200, unit: 'kJ/Nm³', utilization: 96.1, consumers: 'BF (PCI preheat 15%), Reheat Furnace (35%), Underfiring (40%), Flare (10%)', color: '#f59e0b' },
  { gas: 'LD Gas (BOFG)', generated: 680, recovered: 602, flared: 78, cv: 8200, unit: 'kJ/Nm³', utilization: 88.5, consumers: 'Power Plant (65%), Reheat Furnace (20%), Flare (15%)', color: ACCENT },
]

const gasUtilizationTrend = [89.5, 90.2, 91.0, 91.5, 91.8, 92.0, 92.1, 91.8, 92.2, 92.0, 91.9, 92.1]

// ── Electrical Energy ──
const electricalData = {
  totalLoad: 248,
  captive: 182,
  grid: 66,
  captiveSources: [
    { source: 'BFG-based Power Plant (TRT + Boiler)', capacity: 120, generation: 108, unit: 'MW', color: '#ef4444' },
    { source: 'COG-based Power Plant', capacity: 35, generation: 32, unit: 'MW', color: '#f59e0b' },
    { source: 'BOFG Recovery Power', capacity: 25, generation: 18, unit: 'MW', color: ACCENT },
    { source: 'Waste Heat Recovery (WHR)', capacity: 20, generation: 16, unit: 'MW', color: '#10b981' },
    { source: 'Solar (Rooftop + Ground)', capacity: 12, generation: 8, unit: 'MW', color: '#f59e0b' },
  ],
  consumers: [
    { area: 'BF Blowers & Auxiliary', load: 52, share: 21.0, color: '#ef4444' },
    { area: 'O₂ Plant (ASU)', load: 38, share: 15.3, color: '#3b82f6' },
    { area: 'Rolling Mill', load: 42, share: 16.9, color: '#f59e0b' },
    { area: 'Caster & SMS', load: 28, share: 11.3, color: ACCENT },
    { area: 'Sinter Plant', load: 22, share: 8.9, color: '#ea580c' },
    { area: 'Coke Oven', load: 18, share: 7.3, color: '#1e293b' },
    { area: 'Water & Cooling', load: 20, share: 8.1, color: '#10b981' },
    { area: 'Others (Lighting, Yard, Admin)', load: 28, share: 11.3, color: '#94a3b8' },
  ],
}

const electricalTrend = [255, 252, 250, 248, 252, 250, 248, 245, 248, 250, 249, 248]
const gridCostTrend = [7.8, 7.6, 7.5, 7.4, 7.2, 7.1, 7.0, 6.9, 6.8, 6.8, 6.7, 6.8]

// ── Steam & Thermal ──
const steamData = [
  { source: 'Waste Heat Boilers (BF/Sinter)', generation: 145, unit: 'T/hr', pressure: '40 bar', temp: '420°C', color: '#ef4444' },
  { source: 'COG-fired Boilers', generation: 85, unit: 'T/hr', pressure: '40 bar', temp: '400°C', color: '#f59e0b' },
  { source: 'Auxiliary Boilers (Backup)', generation: 15, unit: 'T/hr', pressure: '20 bar', temp: '250°C', color: '#94a3b8' },
]

const steamConsumers = [
  { consumer: 'Turbine Generators', usage: 160, unit: 'T/hr', share: 65.3 },
  { consumer: 'Process Heating (Degassing, Ladle Dry)', usage: 35, unit: 'T/hr', share: 14.3 },
  { consumer: 'Coke Oven Underfiring', usage: 22, unit: 'T/hr', share: 9.0 },
  { consumer: 'Deaerator & BFW System', usage: 18, unit: 'T/hr', share: 7.3 },
  { consumer: 'Miscellaneous (Tracing, Cleaning)', usage: 10, unit: 'T/hr', share: 4.1 },
]

// ── WHR (Waste Heat Recovery) ──
const whrSystems = [
  { system: 'TRT (Top-pressure Recovery Turbine)', source: 'BF Top Gas', recovery: 16.2, unit: 'MW', potential: 18, efficiency: 90, status: 'Running' },
  { system: 'Sinter Cooler WHR', source: 'Sinter Cooling Air', recovery: 8.4, unit: 'MW (thermal)', potential: 12, efficiency: 70, status: 'Running' },
  { system: 'CDQ (Coke Dry Quenching)', source: 'Red-hot Coke', recovery: 42, unit: 'T steam/hr', potential: 48, efficiency: 87.5, status: 'Running' },
  { system: 'BOF Gas Sensible Heat', source: 'LD Gas (1400°C)', recovery: 6.8, unit: 'MW (thermal)', potential: 10, efficiency: 68, status: 'Running' },
  { system: 'Reheat Furnace Recuperator', source: 'Flue Gas', recovery: 12.5, unit: 'MW (thermal)', potential: 15, efficiency: 83.3, status: 'Running' },
]

// ── Compressed Gases ──
const compressedGases = [
  { gas: 'Oxygen (O₂)', production: 2800, unit: 'Nm³/hr', sec: 0.48, secUnit: 'kWh/Nm³', consumers: 'BOF (65%), BF Enrichment (25%), Others (10%)', capacity: 3200 },
  { gas: 'Nitrogen (N₂)', production: 4500, unit: 'Nm³/hr', sec: 0.32, secUnit: 'kWh/Nm³', consumers: 'Purging (40%), Blanketing (35%), Instrumentation (25%)', capacity: 5000 },
  { gas: 'Argon (Ar)', production: 180, unit: 'Nm³/hr', sec: 0.85, secUnit: 'kWh/Nm³', consumers: 'AOD/VOD (60%), Ladle Stirring (40%)', capacity: 220 },
  { gas: 'Compressed Air', production: 8500, unit: 'Nm³/hr', sec: 0.12, secUnit: 'kWh/Nm³', consumers: 'Instrumentation (30%), Pneumatic (45%), Process (25%)', capacity: 10000 },
]

// ── PAT Scheme Performance ──
const patPerformance = {
  baseline: 6.18,
  target: 5.90,
  actual: 5.82,
  credits: 2840,
  unit: 'Gcal/TCS',
  yearlyTrend: [6.18, 6.10, 6.02, 5.95, 5.90, 5.88, 5.85, 5.84, 5.83, 5.82],
  milestones: [
    { year: '2021 (Baseline)', sec: 6.18 },
    { year: '2023', sec: 6.02 },
    { year: '2025 Target', sec: 5.90 },
    { year: 'Current', sec: 5.82 },
  ],
}

// ── Energy Cost Breakdown ──
const energyCost = {
  daily: 3.42,
  monthly: 102.6,
  perTCS: 3420,
  breakdown: [
    { item: 'Coal & Coke (Fuel)', cost: 1.85, share: 54.1, color: '#1e293b' },
    { item: 'Grid Electricity', cost: 0.62, share: 18.1, color: '#ef4444' },
    { item: 'Natural Gas (Backup)', cost: 0.18, share: 5.3, color: '#f59e0b' },
    { item: 'Oxygen & Gases', cost: 0.42, share: 12.3, color: '#3b82f6' },
    { item: 'Water & Cooling', cost: 0.15, share: 4.4, color: '#10b981' },
    { item: 'Others (Maintenance, Losses)', cost: 0.20, share: 5.8, color: '#94a3b8' },
  ],
}

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'Reduce BF gas flaring — shift 280 Nm³/min to Power Plant', reason: 'BF gas flaring at 7.9% (460 Nm³/min). Power Plant Turbine #2 running at 72% load — can absorb additional 280 Nm³/min BFG. AI gas network optimizer has scheduled load ramp for next 15 min.', impact: 'Save 4.2 MW grid import, ₹18.5L/day', model: 'Gas Network Optimizer', confidence: 95 },
  { priority: 'high', title: 'Optimize ASU load — shift O₂ production to off-peak tariff window', reason: 'O₂ plant consuming 38 MW. Grid electricity rate drops 22% between 22:00–06:00. AI recommends increasing O₂ production and tank storage during off-peak, reducing daytime ASU load by 15%.', impact: 'Energy cost saving: ₹4.8L/day', model: 'Load Scheduling AI', confidence: 92 },
  { priority: 'medium', title: 'TRT efficiency improvement — clean gas cleaning system', reason: 'TRT output at 16.2 MW vs 18 MW design. Pressure drop across dust catcher increased 12% over 3 weeks. Cleaning during next BF banking will restore TRT output to 17.5 MW.', impact: 'Additional 1.3 MW recovery', model: 'TRT Performance Model', confidence: 89 },
  { priority: 'medium', title: 'Reheat furnace — optimize zone temperatures for current gauge', reason: 'Rolling 8mm gauge (light product). Soaking zone at 1,240°C can be reduced to 1,220°C without affecting FDT. AI thermal model confirms no impact on mechanical properties for S355J2 at this gauge.', impact: 'Fuel saving: 3.2% on reheat', model: 'Furnace Thermal AI', confidence: 91 },
  { priority: 'low', title: 'Deploy VFD on cooling tower fan CT-04', reason: 'CT-04 running at constant speed (75 kW). Ambient temperature dropped 8°C this week. VFD control can reduce fan speed by 20%, saving 12 kW continuously. ROI: 4 months.', impact: 'Annual saving: ₹4.2L', model: 'Motor Efficiency AI', confidence: 87 },
]

// ── Trends ──
const secTrend = [5.95, 5.92, 5.90, 5.88, 5.86, 5.85, 5.84, 5.83, 5.82, 5.83, 5.82, 5.82]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function EnergyOptimization() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'sec', label: 'SEC Breakdown' },
    { key: 'gas', label: 'Gas Balance' },
    { key: 'electrical', label: 'Electrical' },
    { key: 'steam', label: 'Steam & WHR' },
    { key: 'gases', label: 'O₂ / N₂ / Ar' },
    { key: 'pat', label: 'PAT Scheme' },
    { key: 'cost', label: 'Energy Cost' },
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
          <h1 style={st.title}>Energy Optimization</h1>
          <p style={st.sub}>AI-powered energy consumption analysis, gas balance optimization & cost reduction — Integrated Steel Plant</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Metering</span>
          <span style={st.aiBadge}>Energy AI: Active</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ SEC BREAKDOWN ═══ */}
      {show('sec') && (
        <Section title="Specific Energy Consumption Breakdown" badge="8 Process Units" icon="SE">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 2 }}>
              {secBreakdown.map((p, i) => (
                <div key={p.process} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.process}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.share}% of total SEC</div>
                  </div>
                  <div style={{ width: '120px' }}><AreaChart data={p.trend} color={p.color} height={24} /></div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{p.sec}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{p.unit}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e8ecf1' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Total SEC</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: ACCENT }}>5.82 Gcal/TCS</span>
              </div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>SEC Trend (Gcal/TCS) — 12 Months</div>
              <div style={{ marginTop: '12px' }}><AreaChart data={secTrend} color={ACCENT} height={120} /></div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 5.82</span></div>
                <div><span style={st.tinyLabel}>Best</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 5.82</span></div>
                <div><span style={st.tinyLabel}>PAT Target</span><span style={st.tinyVal}> 5.90</span></div>
                <div><span style={st.tinyLabel}>YoY</span><span style={{ ...st.tinyVal, color: '#10b981' }}> -2.2%</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ GAS BALANCE ═══ */}
      {show('gas') && (
        <Section title="By-Product Gas Balance & Recovery" badge="3 Gas Systems" icon="GB">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {gasBalance.map((g, i) => (
              <div key={g.gas} style={{ ...st.card, borderLeft: `4px solid ${g.color}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{g.gas}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: g.utilization > 92 ? '#10b981' : '#f59e0b', background: (g.utilization > 92 ? '#10b981' : '#f59e0b') + '15', padding: '3px 10px', borderRadius: '10px' }}>Utilization: {g.utilization}%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '10px' }}>
                  <div><div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{g.generated.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Generated (Nm³/min)</div></div>
                  <div><div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{g.recovered.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Recovered</div></div>
                  <div><div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{g.flared}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Flared (Nm³/min)</div></div>
                  <div><div style={{ fontSize: '20px', fontWeight: 700, color: ACCENT }}>{g.cv.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>CV ({g.unit})</div></div>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px' }}>Consumers: {g.consumers}</div>
              </div>
            ))}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={st.cardLabel}>Overall Gas Utilization Rate (%) — 12 Months</div>
            <div style={{ marginTop: '8px' }}><AreaChart data={gasUtilizationTrend} color="#10b981" height={60} /></div>
            <div style={{ ...st.aiRow, marginTop: '10px' }}><span style={st.aiChip}>AI</span> Gas utilization improved from 89.5% to 92.1% through AI-driven coordination between gas holders, power plant, and process consumers. Flaring reduced 32% this year. Annual energy saving: ₹18.2Cr.</div>
          </div>
        </Section>
      )}

      {/* ═══ ELECTRICAL ═══ */}
      {show('electrical') && (
        <Section title="Electrical Energy Management" badge="248 MW Total Load" icon="EL">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Captive Power Generation</div>
              <div style={{ marginTop: '8px' }}>
                {electricalData.captiveSources.map((s, i) => (
                  <HBar key={s.source} label={s.source} value={s.generation} max={s.capacity} unit={s.unit} color={s.color} delay={i * 120} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <div><span style={st.tinyLabel}>Captive Total</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 182 MW</span></div>
                <div><span style={st.tinyLabel}>Grid Import</span><span style={{ ...st.tinyVal, color: '#f59e0b' }}> 66 MW</span></div>
                <div><span style={st.tinyLabel}>Self-Sufficiency</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 73.4%</span></div>
              </div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Electrical Load by Area</div>
              <div style={{ marginTop: '8px' }}>
                {electricalData.consumers.map((c, i) => (
                  <HBar key={c.area} label={`${c.area} (${c.share}%)`} value={c.load} max={55} unit="MW" color={c.color} delay={i * 100} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}><div style={st.cardLabel}>Total Load Trend (MW) — 12hrs</div><div style={{ marginTop: '8px' }}><AreaChart data={electricalTrend} color={ACCENT} height={60} /></div></div>
              <div style={{ flex: 1 }}><div style={st.cardLabel}>Grid Tariff Trend (₹/kWh) — 12 Months</div><div style={{ marginTop: '8px' }}><AreaChart data={gridCostTrend} color="#10b981" height={60} /></div></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ STEAM & WHR ═══ */}
      {show('steam') && (
        <>
          <Section title="Steam Generation & Distribution" badge="245 T/hr" icon="ST">
            <div style={st.row}>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Steam Sources</div>
                {steamData.map((s, i) => (
                  <div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.6s ease ${i * 0.08}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} /><span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{s.source}</span></div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{s.generation} {s.unit}</span>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>{s.pressure}, {s.temp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Steam Consumers</div>
                {steamConsumers.map((c, i) => (
                  <HBar key={c.consumer} label={`${c.consumer} (${c.share}%)`} value={c.usage} max={170} unit={c.unit} color={ACCENT} delay={i * 120} />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Waste Heat Recovery (WHR) Systems" badge="5 Active" icon="WH">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {whrSystems.map((w, i) => (
                <div key={w.system} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderTop: '3px solid #10b981' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginBottom: '4px', lineHeight: '1.3' }}>{w.system}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '8px' }}>Source: {w.source}</div>
                  <DonutChart value={w.efficiency} max={100} size={56} strokeWidth={5} color="#10b981" />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{w.recovery} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>{w.unit}</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Potential: {w.potential} {w.unit}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ═══ O₂ / N₂ / Ar ═══ */}
      {show('gases') && (
        <Section title="Industrial Gas Production (ASU)" badge="4 Gas Systems" icon="IG">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {compressedGases.map((g, i) => (
              <div key={g.gas} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderTop: `3px solid ${ACCENT}` }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{g.gas}</div>
                <DonutChart value={g.production} max={g.capacity} size={56} strokeWidth={5} color={ACCENT} label="capacity" />
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{g.production.toLocaleString()} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>{g.unit}</span></div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>SEC: {g.sec} {g.secUnit}</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', lineHeight: '1.4' }}>{g.consumers}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ PAT SCHEME ═══ */}
      {show('pat') && (
        <Section title="PAT Scheme Performance (Cycle VII)" badge="Target Overachieved" icon="PT">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                {patPerformance.milestones.map((m, i) => (
                  <div key={m.year} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '14px', animation: `slideIn 0.7s ease ${i * 0.1}s both`, border: m.year === 'Current' ? `2px solid ${ACCENT}` : '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: m.year === 'Current' ? '#10b981' : '#1e293b' }}>{m.sec}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{m.year}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>+2,840</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>tCO₂e Credits Earned</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>1.36%</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>Below Target (Overachieved)</div>
                </div>
              </div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>SEC Reduction Journey (Gcal/TCS)</div>
              <div style={{ marginTop: '12px' }}><AreaChart data={patPerformance.yearlyTrend} color="#10b981" height={120} /></div>
              <div style={{ ...st.aiRow, marginTop: '10px' }}><span style={st.aiChip}>AI</span> PAT Cycle VII target of 5.90 Gcal/TCS overachieved by 1.36%. Key contributors: BF gas recovery (+32%), CDQ commissioning, TRT optimization, and AI-driven load scheduling. Credits valued at ~₹1.4Cr at current market rate.</div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ ENERGY COST ═══ */}
      {show('cost') && (
        <Section title="Energy Cost Analysis" badge="₹3.42 Cr/day" icon="EC">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Daily Energy Cost Breakdown</div>
              <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', marginTop: '8px', marginBottom: '8px' }}>
                {energyCost.breakdown.map((b, i) => (<div key={i} style={{ width: `${b.share}%`, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#fff' }}>{b.share > 8 ? `${b.share}%` : ''}</div>))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {energyCost.breakdown.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: b.color }} /><span style={{ fontSize: '12px', color: '#64748b' }}>{b.item}</span></div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>₹{b.cost} Cr</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '18px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>₹{energyCost.daily}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Cr / Day</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '18px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>₹{energyCost.monthly}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Cr / Month</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '18px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: ACCENT }}>₹{energyCost.perTCS.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>per TCS</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: '10px', padding: '18px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>-8.4%</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>vs Last Year</div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Energy Optimization Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Energy Optimization</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 8 process units, 3 by-product gas systems, 5 captive power sources, 5 WHR systems, and 4 industrial gas plants.
            Active models: Gas network optimizer (real-time LP), Load scheduling AI (tariff-aware), TRT performance predictor, Furnace thermal model,
            Motor efficiency classifier, SEC forecaster (LSTM). SEC reduced from 6.18 to 5.82 Gcal/TCS (-5.8%) over PAT Cycle VII.
            Gas utilization improved to 92.1% — annual saving ₹18.2Cr. Energy cost reduced 8.4% YoY. Total daily energy cost: ₹3.42 Cr.
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
