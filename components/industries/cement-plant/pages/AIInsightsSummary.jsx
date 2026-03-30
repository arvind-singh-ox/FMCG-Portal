'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

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

// ─── Animated Counter ───
function AnimatedValue({ value, decimals = 1, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    const duration = 1400, startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setDisplay(numVal * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  return <>{numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(decimals)}{suffix}</>
}

// ─── Responsive Area Chart ───
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

// ─── Progress Bar ───
function ProgressBar({ value, max = 100, color, height = 8 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
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

// ── DATA ──

const aiKPIs = [
  { label: 'Total AI Insights Today', value: '847', suffix: '', trend: +12.4, color: '#3b82f6', sparkData: [620, 680, 710, 740, 780, 810, 830, 847] },
  { label: 'Critical Alerts Resolved', value: '94.2', suffix: '%', trend: +3.8, color: '#10b981', sparkData: [88, 89, 90, 91, 92, 93, 93.5, 94.2] },
  { label: 'Predictive Accuracy', value: '96.8', suffix: '%', trend: +1.2, color: '#8b5cf6', sparkData: [94.2, 94.5, 95.0, 95.4, 95.8, 96.2, 96.5, 96.8] },
  { label: 'Cost Savings (MTD)', value: '3.42', suffix: ' Cr', trend: +18.5, color: '#16a34a', sparkData: [0.4, 0.8, 1.2, 1.6, 2.0, 2.5, 3.0, 3.42] },
  { label: 'Downtime Prevented', value: '127', suffix: ' hrs', trend: +22.1, color: '#f59e0b', sparkData: [60, 72, 82, 90, 98, 108, 118, 127] },
  { label: 'Active ML Models', value: '24', suffix: '', trend: +4.3, color: ACCENT, sparkData: [18, 19, 20, 21, 22, 23, 23, 24] },
]

const liveInsights = [
  { time: '2 min ago', severity: 'critical', system: 'Kiln', title: 'Shell Temperature Anomaly Detected — Zone 4', desc: 'AI detected 12°C/hr rise rate at shell scanner position 14.2m. Predicted hot spot in ~6 hrs if current trend continues. Refractory thickness estimated at 82mm (threshold: 70mm).', model: 'LSTM Anomaly Detector', confidence: 96, action: 'Inspect refractory', impact: 'Prevent unplanned 48hr shutdown' },
  { time: '8 min ago', severity: 'high', system: 'Cement Mill', title: 'Grinding Efficiency Drop — Chamber 2 Media Wear', desc: 'Specific energy consumption increased from 26.8 to 28.4 kWh/MT over past 72 hrs. Vibration signature analysis indicates 9% ball charge depletion in Chamber 2.', model: 'DEM + Signal Processing', confidence: 92, action: 'Add 12 MT grinding media', impact: 'Save 1.6 kWh/MT (0.28 Cr/month)' },
  { time: '15 min ago', severity: 'high', system: 'Raw Mill', title: 'Roller Vibration Trending Upward', desc: 'Triaxial vibration on Roller #2 increased from 3.8 to 5.1 mm/s (threshold: 6.5 mm/s). Frequency analysis shows bearing inner race defect signature at 142 Hz.', model: 'FFT + Bearing Fault Classifier', confidence: 89, action: 'Schedule bearing inspection', impact: 'Prevent catastrophic failure (~2.1 Cr)' },
  { time: '22 min ago', severity: 'medium', system: 'Preheater', title: 'Cyclone 4 Pressure Drop Increasing', desc: 'Differential pressure across Cyclone 4 rose by 18% in 6 hrs. AI correlates with raw meal moisture increase (1.2% → 1.8%). Buildup risk elevated.', model: 'Physics-Informed Neural Net', confidence: 85, action: 'Check raw meal moisture control', impact: 'Avoid cyclone blockage (8hr production loss)' },
  { time: '35 min ago', severity: 'medium', system: 'Energy', title: 'Optimal ToD Scheduling Window Identified', desc: 'Grid tariff analysis + production buffer calculation shows raw mill can shift to 22:00-06:00 slot tomorrow. WHR + clinker buffer sufficient for 8hr gap.', model: 'RL Scheduler (PPO)', confidence: 94, action: 'Approve schedule shift', impact: 'Save 3.2 L/day on power cost' },
  { time: '41 min ago', severity: 'low', system: 'Quality', title: 'LSF Deviation Predicted for Next Batch', desc: 'Raw mix LSF trending from 96.2 to 94.8 based on limestone quality variance from Mine Block C. Corrective additive adjustment of +0.3% iron ore recommended.', model: 'Graph Neural Network', confidence: 91, action: 'Adjust raw mix ratio', impact: 'Maintain clinker quality (C3S > 58%)' },
  { time: '55 min ago', severity: 'low', system: 'Cooler', title: 'Clinker Cooler Efficiency Optimization', desc: 'AI identified that reducing undergrate fan #3 speed by 5% while increasing #5 by 3% improves heat recovery by 2.1% without affecting clinker temperature.', model: 'CFD Surrogate + Optimizer', confidence: 88, action: 'Apply fan speed adjustment', impact: 'Save 45 kW (+0.8% WHR efficiency)' },
  { time: '1.2 hr ago', severity: 'info', system: 'Fleet', title: 'Dispatch Route Optimization Applied', desc: 'Route optimizer rerouted 6 Mumbai-bound trucks via SH-60, reducing avg transit time by 24 min. GPS tracking confirms 3 trucks already on optimized route.', model: 'Graph Neural Net + OR', confidence: 93, action: 'Monitor transit times', impact: 'Save 8% diesel cost for this batch' },
]

const modelPerformance = [
  { name: 'Kiln Thermal Predictor', type: 'LSTM + Physics Residual', accuracy: 97.2, predictions: 2840, falsePositives: 12, latency: '3.2ms', lastRetrained: '2 days ago', status: 'active' },
  { name: 'Bearing Fault Classifier', type: 'CNN + FFT Features', accuracy: 95.8, predictions: 1420, falsePositives: 8, latency: '1.8ms', lastRetrained: '5 days ago', status: 'active' },
  { name: 'Quality Predictor (LSF/SM/AM)', type: 'Graph Neural Network', accuracy: 96.4, predictions: 960, falsePositives: 5, latency: '4.7ms', lastRetrained: '1 day ago', status: 'active' },
  { name: 'Energy Optimizer', type: 'PPO Reinforcement Learning', accuracy: 94.1, predictions: 480, falsePositives: 3, latency: '8.5ms', lastRetrained: '3 days ago', status: 'active' },
  { name: 'Anomaly Detector (Plant-wide)', type: 'VAE + Isolation Forest', accuracy: 97.8, predictions: 8520, falsePositives: 42, latency: '1.1ms', lastRetrained: '12 hrs ago', status: 'active' },
  { name: 'Demand Forecaster', type: 'XGBoost + LSTM Ensemble', accuracy: 93.5, predictions: 720, falsePositives: 6, latency: '2.4ms', lastRetrained: '1 day ago', status: 'active' },
  { name: 'Emission Predictor', type: 'Transformer Encoder', accuracy: 95.1, predictions: 1200, falsePositives: 9, latency: '3.8ms', lastRetrained: '4 days ago', status: 'active' },
  { name: 'Maintenance Scheduler', type: 'Constraint Optimization + ML', accuracy: 92.8, predictions: 340, falsePositives: 4, latency: '15ms', lastRetrained: '7 days ago', status: 'active' },
]

const trendCategories = [
  { category: 'Process Optimization', count: 312, trend: +15, color: '#3b82f6', insights: ['Kiln feed rate optimization (+4.2%)', 'Raw mill separator speed tuning', 'Cement fineness auto-control'] },
  { category: 'Predictive Maintenance', count: 186, trend: +22, color: '#ef4444', insights: ['Bearing failure predictions (14 saved)', 'Refractory wear monitoring', 'Gearbox oil analysis alerts'] },
  { category: 'Energy Efficiency', count: 142, trend: +18, color: '#10b981', insights: ['ToD scheduling saves 3.2 L/day', 'VFD optimization on 68 motors', 'WHR efficiency improved 2.1%'] },
  { category: 'Quality Control', count: 98, trend: +8, color: '#8b5cf6', insights: ['LSF deviation early warning', 'Blaine prediction accuracy 96%', 'Free lime reduction by 0.3%'] },
  { category: 'Safety & Environment', count: 64, trend: +5, color: '#f59e0b', insights: ['NOx spike prevention (12 events)', 'Dust emission threshold alerts', 'Hot zone proximity warnings'] },
  { category: 'Supply Chain', count: 45, trend: +12, color: '#06b6d4', insights: ['Route optimization (8% diesel saving)', 'Inventory reorder predictions', 'Demand surge early warning'] },
]

const weeklyTrend = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  critical: [8, 6, 9, 5, 7, 4, 3],
  high: [22, 18, 25, 20, 16, 14, 12],
  medium: [45, 52, 48, 55, 42, 38, 35],
  low: [85, 92, 88, 95, 78, 72, 68],
}

const nlpQueries = [
  { query: 'Why did kiln energy spike yesterday at 14:00?', answer: 'Coal moisture increased from 8.2% to 11.4% due to rain-exposed stockpile. Calorific value dropped by 340 kcal/kg, causing the DCS to increase feed rate by 12%. Recommendation: Use covered stockpile or switch to pet coke blending.', model: 'Llama 3 70B (Fine-tuned)', time: '1.2s' },
  { query: 'Predict cement mill output if we increase separator speed to 90 RPM', answer: 'At 90 RPM (current: 85): Blaine increases to ~3,680 cm²/g, throughput drops by ~8% to 165 TPH, specific power increases to 29.1 kWh/MT. 28-day strength improves by +1.2 MPa. Trade-off: Higher quality but lower output.', model: 'Physics-Informed GNN', time: '0.8s' },
  { query: 'What is the root cause of high free lime in yesterday\'s clinker?', answer: 'Root cause analysis (3 contributing factors): 1) LSF spiked to 98.4 at 10:22 due to high-grade limestone from Block C (CaO: 52.1%). 2) Kiln burning zone temp dropped 15°C at 10:45 (coal feeder trip, 4 min). 3) Raw meal quartz content was 1.2% above normal. Corrective: Blend Block C with Block A limestone at 60:40 ratio.', model: 'RAG + Llama 3 70B', time: '2.1s' },
  { query: 'Compare this month\'s performance with last month', answer: 'Key deltas: Production +3.8% (452K vs 435K MT), SEC -4.2% (78.2 vs 81.6 kWh/MT), Kiln uptime +1.1% (96.8% vs 95.7%), Quality rejections -62% (3 vs 8 batches), Energy cost -6.1% (7.98 vs 8.5 Cr). Biggest contributor: fuel mix optimization (AFR increased from 8% to 12%).', model: 'Analytics Engine + LLM', time: '1.5s' },
]

const TABS = [
  { key: 'live', label: 'Live Insights Feed', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { key: 'dashboard', label: 'Insights Dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { key: 'models', label: 'Model Performance', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg> },
  { key: 'trends', label: 'Trend Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
  { key: 'nlp', label: 'AI Q&A (NLP)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { key: 'actions', label: 'Action Tracker', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
]

// ─── MAIN ───
function AIInsightsSummary() {
  const [activeTab, setActiveTab] = useState('live')

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>AI Insights Summary</h1>
            <p style={sty.pageSub}>Real-time AI-generated insights, predictive alerts, model performance tracking & natural language plant queries</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> 24 Models Active</span>
          <span style={{ ...sty.liveBadge, background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}><span style={{ ...sty.liveDot, background: '#3b82f6' }} /> 847 Insights Today</span>
        </div>
      </div>

      <div style={sty.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'live' && <LiveTab />}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'trends' && <TrendsTab />}
      {activeTab === 'nlp' && <NLPTab />}
      {activeTab === 'actions' && <ActionsTab />}
    </div>
  )
}

// ─── LIVE TAB ───
function LiveTab() {
  return (
    <>
      {/* KPIs */}
      <Section title="AI Performance Overview" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={sty.kpiGrid}>
          {aiKPIs.map((kpi, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{kpi.label}</span>
                <span style={{ ...sty.trendBadge, color: '#16a34a', background: '#f0fdf4' }}>+{kpi.trend}%</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                <AnimatedValue value={kpi.value} suffix={kpi.suffix} />
              </div>
              <AreaChart data={kpi.sparkData} color={kpi.color} height={35} />
            </div>
          ))}
        </div>
      </Section>

      {/* Live Insights Feed */}
      <Section title="Live AI Insights Feed" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {liveInsights.map((insight, i) => {
            const sevColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981', info: '#94a3b8' }
            const color = sevColors[insight.severity]
            return (
              <div key={i} style={{ ...sty.insightCard, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ ...sty.statusPill, background: `${color}15`, color, fontSize: '10px', padding: '2px 8px' }}>{insight.severity}</span>
                      <span style={{ ...sty.statusPill, background: '#f1f5f9', color: '#64748b', fontSize: '10px', padding: '2px 8px' }}>{insight.system}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{insight.time}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{insight.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6', marginBottom: '6px' }}>{insight.desc}</div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Model: <span style={{ color: ACCENT, fontWeight: 600 }}>{insight.model}</span></span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: <span style={{ color: '#1e293b', fontWeight: 600 }}>{insight.confidence}%</span></span>
                      <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>Impact: {insight.impact}</span>
                    </div>
                  </div>
                  <button style={{ ...sty.actionBtn, borderColor: color, color }}>{insight.action}</button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

// ─── DASHBOARD TAB ───
function DashboardTab() {
  return (
    <>
      <Section title="Insight Categories Overview" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}>
        <div style={sty.grid3}>
          {trendCategories.map((cat, i) => (
            <div key={i} style={{ ...sty.catCard, borderLeft: `3px solid ${cat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{cat.category}</span>
                <span style={{ ...sty.trendBadge, color: '#16a34a', background: '#f0fdf4' }}>+{cat.trend}%</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: cat.color, marginBottom: '8px' }}>{cat.count}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>insights this month</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {cat.insights.map((ins, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                    {ins}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Weekly Severity Trend */}
      <Section title="Weekly Insight Volume by Severity" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', padding: '0 20px' }}>
          {weeklyTrend.days.map((day, i) => {
            const c = weeklyTrend.critical[i], h = weeklyTrend.high[i], m = weeklyTrend.medium[i], l = weeklyTrend.low[i]
            const total = c + h + m + l
            const maxTotal = 180
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '70%', height: `${(l / maxTotal) * 160}px`, background: '#10b981', borderRadius: '3px 3px 0 0', transition: 'height 1s ease' }} />
                  <div style={{ width: '70%', height: `${(m / maxTotal) * 160}px`, background: '#3b82f6', transition: 'height 1s ease' }} />
                  <div style={{ width: '70%', height: `${(h / maxTotal) * 160}px`, background: '#f59e0b', transition: 'height 1s ease' }} />
                  <div style={{ width: '70%', height: `${(c / maxTotal) * 160}px`, background: '#ef4444', borderRadius: '0 0 3px 3px', transition: 'height 1s ease' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{day}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
          {[{ label: 'Critical', color: '#ef4444' }, { label: 'High', color: '#f59e0b' }, { label: 'Medium', color: '#3b82f6' }, { label: 'Low', color: '#10b981' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── MODELS TAB ───
function ModelsTab() {
  return (
    <Section title="AI/ML Model Performance Tracker" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Models Deployed', value: '24', color: ACCENT },
          { label: 'Avg Accuracy', value: '96.8%', color: '#10b981' },
          { label: 'Total Predictions Today', value: '16,480', color: '#3b82f6' },
          { label: 'False Positive Rate', value: '0.54%', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Model Name', 'Architecture', 'Accuracy', 'Predictions', 'False +', 'Latency', 'Last Retrained', 'Status'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modelPerformance.map((m, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{m.name}</span></td>
                <td style={{ ...sty.td, fontSize: '10px', color: '#64748b' }}>{m.type}</td>
                <td style={sty.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ProgressBar value={m.accuracy} color={m.accuracy >= 96 ? '#10b981' : m.accuracy >= 93 ? '#f59e0b' : '#ef4444'} height={6} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', minWidth: '35px' }}>{m.accuracy}%</span>
                  </div>
                </td>
                <td style={sty.td}>{m.predictions.toLocaleString()}</td>
                <td style={sty.td}><span style={{ color: m.falsePositives > 10 ? '#f59e0b' : '#10b981' }}>{m.falsePositives}</span></td>
                <td style={sty.td}>{m.latency}</td>
                <td style={sty.td}><span style={{ fontSize: '10px', color: '#64748b' }}>{m.lastRetrained}</span></td>
                <td style={sty.td}>
                  <span style={{ ...sty.statusPill, background: '#10b98115', color: '#10b981' }}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ─── TRENDS TAB ───
function TrendsTab() {
  return (
    <>
      <Section title="Insight Trend Analysis" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>}>
        <div style={sty.row}>
          <div style={{ flex: 2 }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Monthly Insight Volume Trend</h4>
            <AreaChart data={[520, 580, 640, 690, 720, 780, 847]} color={ACCENT} height={100} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
              {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={sty.infoCard}>
              <h4 style={sty.infoTitle}>Trend Highlights</h4>
              {[
                { label: 'Insights Growth (6M)', value: '+62.8%', color: '#16a34a' },
                { label: 'Avg Resolution Time', value: '24 min', color: '#3b82f6' },
                { label: 'Auto-Applied Actions', value: '38%', color: ACCENT },
                { label: 'User Adoption Rate', value: '92%', color: '#f59e0b' },
                { label: 'ROI from AI', value: '4.2x', color: '#10b981' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{t.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: t.color }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Top Recurring Insights" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { rank: 1, title: 'Kiln shell temperature anomaly detection', freq: '~3x/day', system: 'Kiln', impact: 'Prevented 4 hot spots this month', color: '#ef4444' },
            { rank: 2, title: 'Raw mill vibration trending alerts', freq: '~2x/day', system: 'Raw Mill', impact: 'Bearing replacement scheduled proactively', color: '#f59e0b' },
            { rank: 3, title: 'Energy ToD scheduling optimization', freq: '1x/day', system: 'Energy', impact: '3.2 L/day average savings', color: '#10b981' },
            { rank: 4, title: 'Cement quality LSF deviation early warning', freq: '~2x/day', system: 'Quality', impact: 'Reduced quality rejections by 62%', color: '#8b5cf6' },
            { rank: 5, title: 'Fleet route optimization suggestions', freq: '~4x/day', system: 'Logistics', impact: '8% diesel cost reduction', color: '#06b6d4' },
          ].map((item) => (
            <div key={item.rank} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: item.color, flexShrink: 0 }}>
                {item.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{item.impact}</div>
              </div>
              <span style={{ ...sty.statusPill, background: '#f1f5f9', color: '#64748b', fontSize: '10px' }}>{item.system}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', minWidth: '55px', textAlign: 'right' }}>{item.freq}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── NLP TAB ───
function NLPTab() {
  return (
    <Section title="Natural Language Plant Queries (AI Q&A)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}>
      {/* LLM Info Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f5f3ff', border: '1px solid #e0daf5', borderRadius: '10px', marginBottom: '16px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: ACCENT }}>On-Premise LLM — Fine-tuned Llama 3 70B</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>All queries processed locally on A100 GPUs. RAG pipeline with plant-specific knowledge base (8,400+ documents). Zero cloud dependency.</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {nlpQueries.map((q, i) => (
          <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            {/* Question */}
            <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{q.query}</div>
            </div>
            {/* Answer */}
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{q.answer}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Model: <span style={{ color: ACCENT, fontWeight: 600 }}>{q.model}</span></span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Response: <span style={{ color: '#10b981', fontWeight: 600 }}>{q.time}</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── ACTIONS TAB ───
function ActionsTab() {
  const actions = [
    { id: 'ACT-1041', insight: 'Kiln shell hot spot prediction', action: 'Schedule refractory inspection', assignee: 'Maintenance Team A', deadline: 'Today 18:00', status: 'in-progress', priority: 'critical' },
    { id: 'ACT-1040', insight: 'Cement mill media wear detected', action: 'Procure 12 MT grinding media', assignee: 'Procurement', deadline: 'Tomorrow', status: 'pending', priority: 'high' },
    { id: 'ACT-1039', insight: 'Raw mill bearing defect signature', action: 'Bearing inspection during next stop', assignee: 'Maintenance Team B', deadline: 'Next shutdown', status: 'scheduled', priority: 'high' },
    { id: 'ACT-1038', insight: 'ToD scheduling optimization', action: 'Shift raw mill to off-peak hours', assignee: 'Control Room', deadline: 'Today 22:00', status: 'approved', priority: 'medium' },
    { id: 'ACT-1037', insight: 'LSF deviation prediction', action: 'Adjust raw mix iron ore +0.3%', assignee: 'Quality Lab', deadline: 'Immediate', status: 'completed', priority: 'medium' },
    { id: 'ACT-1036', insight: 'Cyclone 4 buildup risk', action: 'Check raw meal moisture control', assignee: 'Process Engineer', deadline: 'Today 16:00', status: 'in-progress', priority: 'medium' },
    { id: 'ACT-1035', insight: 'Cooler fan optimization', action: 'Apply fan speed adjustment', assignee: 'DCS Operator', deadline: 'Completed', status: 'completed', priority: 'low' },
    { id: 'ACT-1034', insight: 'Route optimization for dispatch', action: 'Reroute Mumbai trucks via SH-60', assignee: 'Logistics', deadline: 'Completed', status: 'completed', priority: 'low' },
  ]

  const statusColors = { 'in-progress': '#3b82f6', pending: '#f59e0b', scheduled: '#8b5cf6', approved: '#06b6d4', completed: '#10b981' }
  const priorityColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }

  return (
    <Section title="AI-Generated Action Tracker" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Actions (MTD)', value: '186', color: '#64748b' },
          { label: 'In Progress', value: '24', color: '#3b82f6' },
          { label: 'Completed', value: '148', color: '#10b981' },
          { label: 'Completion Rate', value: '79.6%', color: ACCENT },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['ID', 'Source Insight', 'Action Required', 'Assigned To', 'Deadline', 'Priority', 'Status'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{a.id}</span></td>
                <td style={{ ...sty.td, fontSize: '11px', color: '#64748b', maxWidth: '180px' }}>{a.insight}</td>
                <td style={sty.td}><span style={{ fontWeight: 500 }}>{a.action}</span></td>
                <td style={sty.td}>{a.assignee}</td>
                <td style={sty.td}><span style={{ fontSize: '11px' }}>{a.deadline}</span></td>
                <td style={sty.td}>
                  <span style={{ ...sty.statusPill, background: `${priorityColors[a.priority]}15`, color: priorityColors[a.priority] }}>{a.priority}</span>
                </td>
                <td style={sty.td}>
                  <span style={{ ...sty.statusPill, background: `${statusColors[a.status]}15`, color: statusColors[a.status] }}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
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
  row: { display: 'flex', gap: '16px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.7s ease both' },
  trendBadge: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  insightCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  catCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  infoCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', height: '100%' },
  infoTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  actionBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
}

export default AIInsightsSummary
