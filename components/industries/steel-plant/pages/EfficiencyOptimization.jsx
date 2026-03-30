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
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={label ? size/2-4 : size/2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span></div><div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// EFFICIENCY DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Plant OEE', value: '85.1%', color: ACCENT },
  { label: 'Yield Rate', value: '96.3%', color: GREEN },
  { label: 'Availability', value: '94.7%', color: GREEN },
  { label: 'Performance Rate', value: '92.8%', color: AMBER },
  { label: 'Quality Rate', value: '98.4%', color: GREEN },
  { label: 'AI Savings MTD', value: '₹2.8 Cr', color: '#1e293b' },
]

// ── OEE by Process Area ──
const oeeByArea = [
  { area: 'Coke Oven Battery', availability: 98.5, performance: 94.2, quality: 99.1, oee: 91.9, target: 92, trend: [89, 90, 91, 91, 92, 92, 92], color: '#1e293b' },
  { area: 'Sinter Plant', availability: 96.2, performance: 90.5, quality: 98.8, oee: 86.0, target: 88, trend: [83, 84, 85, 86, 85, 86, 86], color: '#ea580c' },
  { area: 'Blast Furnace #1', availability: 99.2, performance: 94.8, quality: 97.2, oee: 91.4, target: 92, trend: [88, 89, 90, 91, 91, 91, 91], color: RED },
  { area: 'Blast Furnace #2', availability: 98.8, performance: 93.5, quality: 97.8, oee: 90.3, target: 92, trend: [87, 88, 89, 90, 90, 90, 90], color: '#f97316' },
  { area: 'BOF / SMS', availability: 96.8, performance: 88.5, quality: 98.6, oee: 84.6, target: 88, trend: [81, 82, 83, 84, 85, 85, 85], color: ACCENT },
  { area: 'Continuous Caster #1', availability: 97.5, performance: 91.8, quality: 99.2, oee: 88.8, target: 90, trend: [85, 86, 87, 88, 89, 89, 89], color: BLUE },
  { area: 'Continuous Caster #2', availability: 92.4, performance: 88.2, quality: 98.5, oee: 80.3, target: 85, trend: [78, 79, 80, 80, 80, 80, 80], color: '#06b6d4' },
  { area: 'Hot Strip Mill', availability: 94.8, performance: 82.4, quality: 98.8, oee: 77.2, target: 85, trend: [74, 75, 76, 77, 77, 77, 77], color: AMBER },
]

// ── Yield Losses ──
const yieldLosses = [
  { stage: 'BF → Hot Metal', input: 10200, output: 9847, yield: 96.5, loss: 353, lossType: 'Slag iron loss, dust, flue dust', unit: 'T/day' },
  { stage: 'Hot Metal → Liquid Steel', input: 9847, output: 9520, yield: 96.7, loss: 327, lossType: 'BOF slag, splashing, iron oxide', unit: 'T/day' },
  { stage: 'Liquid Steel → Slabs', input: 9520, output: 9280, yield: 97.5, loss: 240, lossType: 'Tundish skull, ladle skull, crop ends', unit: 'T/day' },
  { stage: 'Slabs → Finished Product', input: 9280, output: 8940, yield: 96.3, loss: 340, lossType: 'Scale loss, crop, cobble, off-gauge', unit: 'T/day' },
]

const yieldTrend = [95.5, 95.8, 96.0, 96.1, 96.2, 96.3, 96.2, 96.3, 96.4, 96.3, 96.2, 96.3]

// ── Downtime Analysis ──
const downtimeBreakdown = [
  { category: 'Planned Maintenance', hours: 14.2, pct: 42.5, color: BLUE },
  { category: 'Equipment Failure', hours: 6.8, pct: 20.4, color: RED },
  { category: 'Changeover / Grade Change', hours: 5.2, pct: 15.6, color: AMBER },
  { category: 'Raw Material Delay', hours: 2.8, pct: 8.4, color: '#ea580c' },
  { category: 'Process Upset', hours: 2.4, pct: 7.2, color: ACCENT },
  { category: 'Utilities (Power/Water)', hours: 1.2, pct: 3.6, color: '#06b6d4' },
  { category: 'Others', hours: 0.8, pct: 2.4, color: '#94a3b8' },
]

const downtimeTrend = [38, 36, 35, 34, 33, 33.4, 32, 33, 34, 33, 33, 33.4]

// ── Material Efficiency ──
const materialEfficiency = [
  { material: 'Iron Ore → Hot Metal', ratio: '1.62 T ore/T HM', target: '1.58', actual: 1.62, tgtNum: 1.58, maxNum: 1.80, saving: 'Reduce ore consumption 2.5% through higher sinter basicity', color: RED },
  { material: 'Coke Rate', ratio: '328 kg/THM', target: '315', actual: 328, tgtNum: 315, maxNum: 380, saving: 'PCI optimization + burden distribution AI saving 8 kg/THM', color: '#1e293b' },
  { material: 'Flux Consumption', ratio: '87 kg/THM', target: '80', actual: 87, tgtNum: 80, maxNum: 120, saving: 'Self-fluxing sinter optimization reduces external flux 8%', color: AMBER },
  { material: 'Scale Loss (Rolling)', ratio: '1.2%', target: '1.0', actual: 1.2, tgtNum: 1.0, maxNum: 2.0, saving: 'Descaler pressure optimization — AI detected nozzle blockage', color: BLUE },
  { material: 'Refractory Consumption', ratio: '8.5 kg/TCS', target: '7.5', actual: 8.5, tgtNum: 7.5, maxNum: 12, saving: 'Slag splashing AI extending BOF campaign by 150 heats', color: ACCENT },
  { material: 'Water Consumption', ratio: '3.2 m³/TCS', target: '3.0', actual: 3.2, tgtNum: 3.0, maxNum: 4.5, saving: 'Closed-loop cooling optimization — recycling rate 94.2%', color: GREEN },
]

// ── Throughput Optimization ──
const throughputData = [
  { unit: 'Blast Furnace #1', actual: 9847, target: 10000, capacity: 11000, utilization: 89.5, bottleneck: 'Hearth condition limiting productivity', trend: [9500, 9600, 9700, 9800, 9847] },
  { unit: 'Blast Furnace #2', actual: 8520, target: 9000, capacity: 10000, utilization: 85.2, bottleneck: 'Sinter quality variation', trend: [8200, 8300, 8400, 8500, 8520] },
  { unit: 'BOF Converters (2)', actual: 18200, target: 19000, capacity: 21000, utilization: 86.7, bottleneck: 'Tap-to-tap time optimization', trend: [17500, 17800, 18000, 18100, 18200] },
  { unit: 'Continuous Casters (2)', actual: 17800, target: 18500, capacity: 20000, utilization: 89.0, bottleneck: 'Caster #2 maintenance availability', trend: [17200, 17400, 17600, 17700, 17800] },
  { unit: 'Hot Strip Mill', actual: 15200, target: 16500, capacity: 18000, utilization: 84.4, bottleneck: 'F3 stand bearing — campaign limited', trend: [14800, 15000, 15100, 15200, 15200] },
]

// ── Benchmarking ──
const benchmarking = [
  { kpi: 'Coke Rate (kg/THM)', plant: 328, india: 380, world: 310, worldClass: 290, unit: 'kg/THM' },
  { kpi: 'Productivity (T/m³/day)', plant: 2.42, india: 2.1, world: 2.6, worldClass: 2.8, unit: 'T/m³/day' },
  { kpi: 'SEC (Gcal/TCS)', plant: 5.82, india: 6.5, world: 5.5, worldClass: 5.0, unit: 'Gcal/TCS' },
  { kpi: 'CO₂ Intensity (T/TCS)', plant: 1.85, india: 2.4, world: 1.8, worldClass: 1.6, unit: 'T/TCS' },
  { kpi: 'Yield (Overall %)', plant: 96.3, india: 93, world: 96, worldClass: 97.5, unit: '%' },
  { kpi: 'OEE (%)', plant: 85.1, india: 78, world: 86, worldClass: 92, unit: '%' },
  { kpi: 'Gas Utilization ηCO (%)', plant: 48.5, india: 45, world: 50, worldClass: 52, unit: '%' },
  { kpi: 'Water (m³/TCS)', plant: 3.2, india: 4.5, world: 3.0, worldClass: 2.5, unit: 'm³/TCS' },
]

// ── AI Improvement Roadmap ──
const aiRoadmap = [
  { initiative: 'BF Burden Distribution AI', status: 'Implemented', savings: '₹12.4L/day', timeline: 'Oct 2025', improvement: 'Coke rate -8 kg/THM', area: 'Ironmaking' },
  { initiative: 'BOF Endpoint Prediction', status: 'Implemented', savings: '₹8.2L/day', timeline: 'Nov 2025', improvement: 'Re-blow elimination, Mn recovery +3%', area: 'Steelmaking' },
  { initiative: 'Gas Network Optimizer', status: 'Implemented', savings: '₹18.2L/day', timeline: 'Dec 2025', improvement: 'Gas flaring -32%, grid import -4.2 MW', area: 'Energy' },
  { initiative: 'Rolling Schedule RL Agent', status: 'Pilot', savings: '₹5.8L/day (est)', timeline: 'Mar 2026', improvement: 'First-coil-right 98.4%, gauge deviation -50%', area: 'Rolling' },
  { initiative: 'Predictive Maintenance (Fleet)', status: 'Scaling', savings: '₹4.5L/day', timeline: 'Q2 2026', improvement: 'Unplanned downtime -44%', area: 'Maintenance' },
  { initiative: 'Autonomous Casting Control', status: 'R&D', savings: '₹8L/day (est)', timeline: 'Q4 2026', improvement: 'Breakout elimination + defect -40%', area: 'Casting' },
]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'HSM throughput bottleneck — F3 bearing + descaler limiting output', reason: 'HSM OEE at 77.2% is lowest across plant. Root cause: F3 stand vibration (bearing at 71% health) limiting speed by 12%, and descaler #2 nozzle blockage causing 8% extra scale loss. Fixing both restores throughput to 16,200 T/day (+1,000 T/day).', impact: '+1,000 T/day throughput, ₹45L/day revenue', model: 'Bottleneck Analyzer', confidence: 94 },
  { priority: 'high', title: 'BOF tap-to-tap optimization — reduce by 2.4 min/heat', reason: 'Current tap-to-tap 38 min vs best-practice 34 min. AI analysis: (1) Pre-charge scrap during tapping saves 1.2 min, (2) Faster slag splashing with optimized N₂ saves 0.8 min, (3) Automated sampling eliminates 0.4 min wait. Combined: +0.8 heats/day.', impact: '+0.8 heats/day = +212 T/day', model: 'Process Time Optimizer', confidence: 91 },
  { priority: 'medium', title: 'Reduce changeover time for grade transitions', reason: 'Grade changeover on Caster #1 averages 42 min (tundish change + ladle sequence). AI scheduling suggests grouping similar grades to reduce changeovers from 4/day to 2.5/day. SMED analysis identifies 12 min of non-value-added time per changeover.', impact: 'Save 63 min/day casting time', model: 'SMED + Schedule AI', confidence: 88 },
  { priority: 'medium', title: 'BF #2 sinter quality correlation — adjust basicity', reason: 'BF #2 OEE gap vs BF #1 (90.3% vs 91.4%) correlates with sinter RDI variation. Sinter basicity 1.81 → 1.90 will improve RDI from 28.2% to 24% (target <25%), restoring BF #2 permeability and productivity.', impact: 'BF #2 OEE: 90.3% → 92%', model: 'Sinter-BF Correlation AI', confidence: 87 },
  { priority: 'low', title: 'Caster #2 availability improvement plan', reason: 'Caster #2 availability at 92.4% vs #1 at 97.5%. Primary cause: segment roller failures (6 events in 12 months). AI recommends: (1) Upgrade to high-Cr rollers, (2) Install vibration monitoring on all segments, (3) Increase spray nozzle PM frequency.', impact: 'Caster #2 availability: 92.4% → 96%', model: 'Reliability AI', confidence: 85 },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function EfficiencyOptimization() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'oee', label: 'OEE Analysis' },
    { key: 'yield', label: 'Yield Optimization' },
    { key: 'downtime', label: 'Downtime Analysis' },
    { key: 'material', label: 'Material Efficiency' },
    { key: 'throughput', label: 'Throughput' },
    { key: 'benchmark', label: 'Benchmarking' },
    { key: 'roadmap', label: 'AI Roadmap' },
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
          <h1 style={st.title}>Efficiency Optimization</h1>
          <p style={st.sub}>AI optimization algorithms for energy, material & operational efficiency — Integrated Steel Plant</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Analytics</span>
          <span style={st.aiBadge}>Optimization AI: Active</span>
          <span style={st.timeBadge}>{new Date().toLocaleTimeString()}</span>
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

      {/* ═══ OEE ANALYSIS ═══ */}
      {show('oee') && (
        <Section title="OEE by Process Area" badge="8 Production Units" icon="OE">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {oeeByArea.map((area, i) => {
              const oeeColor = area.oee >= area.target ? GREEN : area.oee >= area.target - 5 ? AMBER : RED
              return (
                <div key={area.area} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both`, borderTop: `3px solid ${area.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.3' }}>{area.area}</div>
                    <DonutChart value={area.oee} max={100} size={48} strokeWidth={5} color={oeeColor} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '10px', marginBottom: '8px' }}>
                    <div><span style={{ color: '#94a3b8' }}>Avail</span><div style={{ fontWeight: 700, color: '#1e293b' }}>{area.availability}%</div></div>
                    <div><span style={{ color: '#94a3b8' }}>Perf</span><div style={{ fontWeight: 700, color: '#1e293b' }}>{area.performance}%</div></div>
                    <div><span style={{ color: '#94a3b8' }}>Quality</span><div style={{ fontWeight: 700, color: '#1e293b' }}>{area.quality}%</div></div>
                  </div>
                  <AreaChart data={area.trend} color={oeeColor} height={28} />
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Target: {area.target}% | Gap: {(area.target - area.oee).toFixed(1)}%</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ YIELD ═══ */}
      {show('yield') && (
        <Section title="Yield Optimization — Process Chain" badge="Overall: 96.3%" icon="YD">
          <div style={st.card}>
            <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
              {yieldLosses.map((y, i) => (
                <div key={y.stage} style={{ display: 'flex', alignItems: 'center', flex: 1, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '14px 8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{y.stage}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: y.yield >= 97 ? GREEN : ACCENT }}>{y.yield}%</div>
                    <div style={{ fontSize: '9px', color: RED, fontWeight: 600, marginTop: '2px' }}>Loss: {y.loss} T/day</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.3' }}>{y.lossType}</div>
                  </div>
                  {i < yieldLosses.length - 1 && <svg width="20" height="16" viewBox="0 0 20 16" style={{ flexShrink: 0, margin: '0 2px' }}><polyline points="4,8 14,8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /><polyline points="10,4 14,8 10,12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={st.cardLabel}>Overall Yield Trend (%) — 12 Months</div>
              <div style={{ marginTop: '6px' }}><AreaChart data={yieldTrend} color={GREEN} height={60} /></div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 96.3%</span></div>
                <div><span style={st.tinyLabel}>Total Loss</span><span style={{ ...st.tinyVal, color: RED }}> 1,260 T/day</span></div>
                <div><span style={st.tinyLabel}>Loss Value</span><span style={{ ...st.tinyVal, color: RED }}> ~₹5.7 Cr/day</span></div>
                <div><span style={st.tinyLabel}>YoY Improvement</span><span style={{ ...st.tinyVal, color: GREEN }}> +0.8%</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ DOWNTIME ═══ */}
      {show('downtime') && (
        <Section title="Downtime Analysis" badge="33.4 hrs/week Total" icon="DT">
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Downtime by Category (hrs/week)</div>
              {downtimeBreakdown.map((d, i) => (
                <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{d.category}</div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: '2px', transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{d.hours}h</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{d.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Total Downtime Trend (hrs/week) — 12 Months</div>
              <div style={{ marginTop: '12px' }}><AreaChart data={downtimeTrend} color={RED} height={100} /></div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 33.4 hrs/wk</span></div>
                <div><span style={st.tinyLabel}>Best</span><span style={{ ...st.tinyVal, color: GREEN }}> 32 hrs/wk</span></div>
                <div><span style={st.tinyLabel}>Target</span><span style={st.tinyVal}> 28 hrs/wk</span></div>
                <div><span style={st.tinyLabel}>YoY Change</span><span style={{ ...st.tinyVal, color: GREEN }}> -12.4%</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ MATERIAL EFFICIENCY ═══ */}
      {show('material') && (
        <Section title="Material Efficiency & Consumption Ratios" badge="6 Key Metrics" icon="ME">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {materialEfficiency.map((m, i) => (
              <div key={m.material} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${m.color}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{m.material}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{m.ratio}</div>
                <HBar label="Actual vs Target" value={m.actual} max={m.maxNum} unit="" color={m.actual <= m.tgtNum ? GREEN : AMBER} />
                <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px' }}>Target: {m.target}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '8px', background: `${ACCENT}06`, borderRadius: '6px', border: `1px solid ${ACCENT}12` }}>
                  <span style={{ background: ACCENT, color: '#fff', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '2px', flexShrink: 0, marginTop: '1px' }}>AI</span>
                  <span style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.4' }}>{m.saving}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ THROUGHPUT ═══ */}
      {show('throughput') && (
        <Section title="Throughput & Bottleneck Analysis" badge="5 Production Units" icon="TP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {throughputData.map((t, i) => {
              const utilColor = t.utilization >= 90 ? GREEN : t.utilization >= 85 ? ACCENT : AMBER
              return (
                <div key={t.unit} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${utilColor}` }}>
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{t.unit}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Capacity: {t.capacity.toLocaleString()} T/day</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', flex: 1 }}>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{t.actual.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Actual (T/day)</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{t.target.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Target</div></div>
                    <div><div style={{ fontSize: '18px', fontWeight: 700, color: utilColor }}>{t.utilization}%</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Utilization</div></div>
                  </div>
                  <div style={{ width: '120px' }}><AreaChart data={t.trend} color={utilColor} height={32} /></div>
                  <DonutChart value={t.utilization} max={100} size={52} strokeWidth={5} color={utilColor} />
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px' }}>AI</span>
              <span style={{ fontSize: '11px', color: '#4a5568' }}>Primary bottleneck: <strong>Hot Strip Mill</strong> at 84.4% utilization. Root causes: F3 bearing limiting speed (12% derating) + descaler pressure drop. Resolving both adds <strong>1,000 T/day</strong> throughput (₹45L/day revenue).</span>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ BENCHMARKING ═══ */}
      {show('benchmark') && (
        <Section title="Industry Benchmarking" badge="vs India / World / World-Class" icon="BM">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr) 0.5fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['KPI', 'Our Plant', 'India Avg', 'World Avg', 'World-Class', 'Unit'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {benchmarking.map((b, i) => {
              const isLowerBetter = b.kpi.includes('Coke') || b.kpi.includes('SEC') || b.kpi.includes('CO₂') || b.kpi.includes('Water')
              const vsWorld = isLowerBetter ? b.plant <= b.world : b.plant >= b.world
              return (
                <div key={b.kpi} style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr) 0.5fr', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.05}s both` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{b.kpi}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: vsWorld ? GREEN : AMBER }}>{b.plant}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{b.india}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{b.world}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: ACCENT }}>{b.worldClass}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{b.unit}</div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI ROADMAP ═══ */}
      {show('roadmap') && (
        <Section title="AI Improvement Roadmap" badge="6 Initiatives" icon="RD">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aiRoadmap.map((r, i) => {
              const statusColors = { 'Implemented': GREEN, 'Pilot': BLUE, 'Scaling': ACCENT, 'R&D': AMBER }
              const sc = statusColors[r.status]
              return (
                <div key={r.initiative} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${sc}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{r.initiative}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: sc, background: `${sc}15`, padding: '2px 8px', borderRadius: '10px' }}>{r.status}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '10px' }}>{r.area}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>{r.improvement}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: GREEN }}>{r.savings}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{r.timeline}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Total AI Savings </span><span style={{ ...st.tinyVal, color: GREEN }}>₹49.1L/day implemented</span></div>
            <div><span style={st.tinyLabel}>Annualized </span><span style={st.tinyVal}>~₹17.9 Cr/year</span></div>
            <div><span style={st.tinyLabel}>Pipeline </span><span style={st.tinyVal}>₹18.3L/day (est)</span></div>
            <div><span style={st.tinyLabel}>ROI </span><span style={{ ...st.tinyVal, color: GREEN }}>4.2x on AI investment</span></div>
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Efficiency Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Efficiency Optimization</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Analyzing 8 production units across OEE, yield, downtime, material consumption, and throughput. Active models: Bottleneck analyzer, Process time optimizer,
            SMED scheduler, Sinter-BF correlation AI, Reliability predictor. Plant OEE at 85.1% (India avg: 78%). Yield at 96.3% (saving 0.8% vs last year = ₹20.8 Cr/year).
            AI initiatives delivering ₹49.1L/day combined savings with 4.2x ROI. Primary bottleneck: HSM at 77.2% OEE — action plan in progress.
            Total downtime reduced 12.4% YoY. Next optimization cycle: 2 hours.
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
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
