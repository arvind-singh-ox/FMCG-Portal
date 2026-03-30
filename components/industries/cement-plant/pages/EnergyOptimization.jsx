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

// ─── Gauge Chart (semicircle) ───
function GaugeChart({ value, min = 0, max = 100, unit = '', label, zones }) {
  const size = 120, cx = size / 2, cy = size / 2 + 5, r = 45
  const startAngle = Math.PI, endAngle = 0
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const needleAngle = startAngle - pct * Math.PI
  const nx = cx + (r - 8) * Math.cos(needleAngle)
  const ny = cy - (r - 8) * Math.sin(needleAngle)
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size / 2 + 20}>
        {zones && zones.map((z, i) => {
          const a1 = startAngle - (z.start / (max - min)) * Math.PI
          const a2 = startAngle - (z.end / (max - min)) * Math.PI
          const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1)
          const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2)
          return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={z.color} strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        })}
        <circle cx={cx} cy={cy} r="4" fill={ACCENT} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">{value}{unit}</text>
      </svg>
      {label && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '-4px' }}>{label}</div>}
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

const energyKPIs = [
  { label: 'Total Plant Power', value: '38.4', suffix: ' MW', trend: -2.1, color: '#3b82f6', sparkData: [40, 39.2, 38.8, 39.5, 38.1, 38.4, 37.9, 38.4] },
  { label: 'Specific Elec. Consumption', value: '78.2', suffix: ' kWh/MT', trend: -4.5, color: '#10b981', sparkData: [82, 81, 80.5, 79.8, 79.1, 78.6, 78.2, 78.2] },
  { label: 'Thermal Energy', value: '720', suffix: ' kcal/kg', trend: -1.8, color: '#f59e0b', sparkData: [740, 735, 732, 728, 725, 722, 720, 720] },
  { label: 'Power Factor', value: '0.96', suffix: '', trend: +1.2, color: '#8b5cf6', sparkData: [0.93, 0.94, 0.94, 0.95, 0.95, 0.96, 0.96, 0.96] },
  { label: 'WHR Generation', value: '4.8', suffix: ' MW', trend: +6.3, color: '#06b6d4', sparkData: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.8] },
  { label: 'Energy Cost Savings', value: '12.4', suffix: ' L/day', trend: +8.7, color: '#16a34a', sparkData: [8.2, 9.1, 9.8, 10.5, 11.2, 11.8, 12.1, 12.4] },
]

const departmentEnergy = [
  { name: 'Raw Mill', current: 18.2, target: 17.5, unit: 'kWh/MT', pct: 28, color: '#3b82f6', details: { motor: '2800 kW', load: '87%', vfd: 'Active' } },
  { name: 'Kiln & Preheater', current: 22.5, target: 21.0, unit: 'kWh/MT', pct: 34, color: '#ef4444', details: { motor: '450 kW', load: '92%', vfd: 'N/A' } },
  { name: 'Cement Mill', current: 28.4, target: 27.0, unit: 'kWh/MT', pct: 43, color: '#f59e0b', details: { motor: '3500 kW', load: '85%', vfd: 'Active' } },
  { name: 'Coal Mill', current: 4.8, target: 4.5, unit: 'kWh/MT', pct: 7, color: '#8b5cf6', details: { motor: '800 kW', load: '78%', vfd: 'Active' } },
  { name: 'Packing Plant', current: 2.1, target: 2.0, unit: 'kWh/MT', pct: 3, color: '#06b6d4', details: { motor: '380 kW', load: '72%', vfd: 'N/A' } },
  { name: 'Utilities & Lighting', current: 2.2, target: 2.0, unit: 'kWh/MT', pct: 3, color: '#64748b', details: { motor: '520 kW', load: '65%', vfd: 'Partial' } },
]

const thermalBreakdown = [
  { source: 'Coal', contribution: 55, kcal: 396, cost: 2.8, unit: 'Cr/month', trend: -2 },
  { source: 'Pet Coke', contribution: 25, kcal: 180, cost: 1.6, unit: 'Cr/month', trend: -1 },
  { source: 'AFR (Alt. Fuels)', contribution: 12, kcal: 86.4, cost: 0.3, unit: 'Cr/month', trend: +15 },
  { source: 'Biomass', contribution: 8, kcal: 57.6, cost: 0.2, unit: 'Cr/month', trend: +22 },
]

const whrSystems = [
  { name: 'AQC Boiler', capacity: '3.2 MW', generation: '2.8 MW', efficiency: 87.5, steamTemp: 310, steamPressure: 12.5, status: 'running' },
  { name: 'PH Boiler', capacity: '2.5 MW', generation: '2.0 MW', efficiency: 80.0, steamTemp: 280, steamPressure: 10.2, status: 'running' },
  { name: 'Steam Turbine', capacity: '5.0 MW', generation: '4.8 MW', efficiency: 96.0, steamTemp: 0, steamPressure: 0, status: 'running' },
]

const motorInventory = [
  { id: 'M-001', name: 'Raw Mill Main Drive', rating: '2800 kW', voltage: '6.6 kV', load: 87, efficiency: 95.2, vfd: true, savings: 4.2 },
  { id: 'M-002', name: 'Cement Mill Main Drive', rating: '3500 kW', voltage: '6.6 kV', load: 85, efficiency: 94.8, vfd: true, savings: 5.1 },
  { id: 'M-003', name: 'Kiln Main Drive', rating: '450 kW', voltage: '415 V', load: 92, efficiency: 93.5, vfd: false, savings: 0 },
  { id: 'M-004', name: 'Coal Mill Drive', rating: '800 kW', voltage: '6.6 kV', load: 78, efficiency: 94.1, vfd: true, savings: 1.8 },
  { id: 'M-005', name: 'PH Fan', rating: '1200 kW', voltage: '6.6 kV', load: 88, efficiency: 93.8, vfd: true, savings: 3.5 },
  { id: 'M-006', name: 'Cooler Vent Fan', rating: '650 kW', voltage: '6.6 kV', load: 75, efficiency: 94.5, vfd: true, savings: 2.1 },
  { id: 'M-007', name: 'Raw Mill Fan', rating: '1400 kW', voltage: '6.6 kV', load: 82, efficiency: 93.2, vfd: true, savings: 3.8 },
  { id: 'M-008', name: 'Cement Mill Separator', rating: '280 kW', voltage: '415 V', load: 70, efficiency: 92.8, vfd: true, savings: 0.9 },
]

const peakLoadData = {
  hours: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
  demand: [28.5, 26.2, 25.8, 32.4, 38.4, 37.8, 36.5, 38.1, 37.2, 35.6, 33.8, 30.2],
  grid: [24.0, 22.0, 21.5, 28.0, 33.6, 33.0, 31.7, 33.3, 32.4, 30.8, 29.0, 25.8],
  whr: [4.5, 4.2, 4.3, 4.4, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.4],
}

const costAnalysis = [
  { item: 'Grid Power Purchase', cost: 5.85, unit: '/kWh', monthly: '4.2 Cr', share: 52 },
  { item: 'DG Set Operation', cost: 18.50, unit: '/kWh', monthly: '0.8 Cr', share: 10 },
  { item: 'WHR Power (self)', cost: 1.20, unit: '/kWh', monthly: '-0.9 Cr (savings)', share: 0 },
  { item: 'Thermal Fuel (Coal)', cost: 2.80, unit: 'Cr/month', monthly: '2.8 Cr', share: 35 },
  { item: 'Thermal Fuel (Pet Coke)', cost: 1.60, unit: 'Cr/month', monthly: '1.6 Cr', share: 20 },
  { item: 'AFR + Biomass', cost: 0.50, unit: 'Cr/month', monthly: '0.5 Cr', share: 6 },
]

const aiRecommendations = [
  { title: 'Shift Raw Mill to Off-Peak Hours', impact: '3.2 L/day savings', desc: 'AI analysis shows shifting raw mill operation to 22:00-06:00 slot reduces power cost by 18% due to ToD tariff differential. Clinker buffer sufficient for 8-hr mill stoppage.', confidence: 94, priority: 'high', category: 'scheduling' },
  { title: 'Optimize PH Fan VFD Setpoint', impact: '1.8 kWh/MT reduction', desc: 'Current PH fan damper at 72% with VFD at 48Hz. Reducing to 46Hz with damper at 68% maintains draft while saving 85 kW continuously.', confidence: 91, priority: 'high', category: 'motor' },
  { title: 'Increase AFR Substitution to 18%', impact: '0.6 Cr/month savings', desc: 'Thermal profile analysis indicates kiln can handle 18% AFR (currently 12%) without impacting clinker quality. Gradually increase over 2 weeks.', confidence: 88, priority: 'medium', category: 'fuel' },
  { title: 'Cement Mill Grinding Media Charge', impact: '2.1 kWh/MT improvement', desc: 'Mill power draw signature indicates 8% media wear. Recommend adding 12 MT of 60mm balls to Chamber 1. Current SEC: 28.4, expected: 26.3 kWh/MT.', confidence: 92, priority: 'high', category: 'process' },
  { title: 'Install Solar PV on Packing Plant Roof', impact: '0.45 MW peak / 1.8 L annually', desc: 'Roof area analysis (AI vision) identifies 3,200 sq.m suitable for solar. At 150 W/sq.m, can generate 480 kWp. ROI: 3.2 years.', confidence: 85, priority: 'medium', category: 'renewable' },
  { title: 'Compressed Air Leak Detection', impact: '120 kW savings', desc: 'Ultrasonic analysis flagged 23 leak points in compressed air network. Fixing top 10 leaks (estimated 2-day effort) saves 120 kW / 8.6 L per month.', confidence: 96, priority: 'critical', category: 'utility' },
]

const TABS = [
  { key: 'overview', label: 'Energy Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
  { key: 'electrical', label: 'Electrical Systems', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  { key: 'thermal', label: 'Thermal Energy', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg> },
  { key: 'whr', label: 'Waste Heat Recovery', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg> },
  { key: 'motors', label: 'Motors & VFDs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83" /></svg> },
  { key: 'cost', label: 'Cost Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: 'ai', label: 'AI Optimization', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg> },
]

// ─── MAIN COMPONENT ───
function EnergyOptimization() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      {/* Page Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Energy Optimization</h1>
            <p style={sty.pageSub}>Electrical & thermal energy monitoring, WHR systems, motor efficiency & AI-driven cost optimization</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> Real-Time Metering</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={sty.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'electrical' && <ElectricalTab />}
      {activeTab === 'thermal' && <ThermalTab />}
      {activeTab === 'whr' && <WHRTab />}
      {activeTab === 'motors' && <MotorsTab />}
      {activeTab === 'cost' && <CostTab />}
      {activeTab === 'ai' && <AITab />}
    </div>
  )
}

// ─── OVERVIEW TAB ───
function OverviewTab() {
  return (
    <>
      <Section title="Plant Energy KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}>
        <div style={sty.kpiGrid}>
          {energyKPIs.map((kpi, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{kpi.label}</span>
                <span style={{ ...sty.trendBadge, color: kpi.trend < 0 ? '#16a34a' : kpi.trend > 0 ? '#16a34a' : '#64748b', background: '#f0fdf4' }}>
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                <AnimatedValue value={kpi.value} suffix={kpi.suffix} />
              </div>
              <AreaChart data={kpi.sparkData} color={kpi.color} height={35} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Energy Distribution by Department" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>}>
        <div style={sty.row}>
          {/* Stacked bar visual */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              {departmentEnergy.map((d, i) => (
                <div key={i} style={{ width: `${d.pct}%`, background: d.color, transition: 'width 1s ease' }} title={`${d.name}: ${d.pct}%`} />
              ))}
            </div>
            <div style={sty.grid3}>
              {departmentEnergy.map((d, i) => (
                <div key={i} style={sty.miniCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Current</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: d.current > d.target ? '#ef4444' : '#10b981' }}>{d.current} {d.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Target</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{d.target} {d.unit}</span>
                  </div>
                  <ProgressBar value={d.current} max={d.target * 1.2} color={d.current > d.target ? '#ef4444' : '#10b981'} />
                  <div style={{ marginTop: '8px', padding: '6px', background: '#f8fafc', borderRadius: '4px', fontSize: '10px', color: '#64748b' }}>
                    Motor: {d.details.motor} | Load: {d.details.load} | VFD: {d.details.vfd}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

// ─── ELECTRICAL TAB ───
function ElectricalTab() {
  return (
    <>
      <Section title="Load Profile & Peak Demand" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
        <div style={sty.row}>
          <div style={{ flex: 2 }}>
            {/* 24-hour load chart */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>24-Hour Load Profile (MW)</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '150px' }}>
                {peakLoadData.hours.map((h, i) => {
                  const total = peakLoadData.demand[i]
                  const whr = peakLoadData.whr[i]
                  const grid = peakLoadData.grid[i]
                  const maxVal = 42
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80%', height: `${(whr / maxVal) * 150}px`, background: '#06b6d4', borderRadius: '3px 3px 0 0', transition: 'height 1s ease' }} />
                        <div style={{ width: '80%', height: `${(grid / maxVal) * 150}px`, background: '#3b82f6', borderRadius: '0', transition: 'height 1s ease' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>{h}:00</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Grid Power</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#06b6d4' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>WHR Power</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={sty.infoCard}>
              <h4 style={sty.infoTitle}>Power Supply Summary</h4>
              {[
                { label: 'Contract Demand', value: '42 MVA', color: '#1e293b' },
                { label: 'Peak Demand Today', value: '38.4 MW', color: '#ef4444' },
                { label: 'Load Factor', value: '86.2%', color: '#10b981' },
                { label: 'Power Factor', value: '0.96', color: '#8b5cf6' },
                { label: 'WHR Contribution', value: '12.5%', color: '#06b6d4' },
                { label: 'Grid Tariff (avg)', value: '5.85/kWh', color: '#f59e0b' },
                { label: 'ToD Benefit', value: '0.42/kWh', color: '#16a34a' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{r.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Power Quality & Harmonics" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}>
        <div style={sty.grid3}>
          {[
            { label: 'Voltage (R-Y-B)', value: '6.58 / 6.61 / 6.55 kV', status: 'normal', detail: 'Unbalance: 0.4%' },
            { label: 'THD Voltage', value: '3.2%', status: 'normal', detail: 'Limit: <5% (IEEE 519)' },
            { label: 'THD Current', value: '7.8%', status: 'warning', detail: 'Limit: <8% — near threshold' },
            { label: 'Frequency', value: '49.98 Hz', status: 'normal', detail: 'Grid sync: stable' },
            { label: 'Neutral Current', value: '12.4 A', status: 'normal', detail: 'Within limits' },
            { label: 'Earth Leakage', value: '0.8 mA', status: 'normal', detail: 'Threshold: 30 mA' },
          ].map((pq, i) => {
            const statusColor = pq.status === 'normal' ? '#10b981' : pq.status === 'warning' ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} style={sty.miniCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{pq.label}</span>
                  <span style={{ ...sty.statusDotSmall, background: statusColor }} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{pq.value}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{pq.detail}</div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

// ─── THERMAL TAB ───
function ThermalTab() {
  return (
    <>
      <Section title="Thermal Energy & Fuel Mix" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>}>
        <div style={sty.row}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <GaugeChart value={720} min={650} max={800} unit=" kcal/kg" label="Specific Heat Consumption"
                zones={[{ start: 0, end: 50, color: '#10b981' }, { start: 50, end: 100, color: '#f59e0b' }, { start: 100, end: 150, color: '#ef4444' }]} />
              <GaugeChart value={12} min={0} max={30} unit="%" label="TSR (Thermal Substitution)"
                zones={[{ start: 0, end: 10, color: '#ef4444' }, { start: 10, end: 20, color: '#f59e0b' }, { start: 20, end: 30, color: '#10b981' }]} />
              <GaugeChart value={94.2} min={80} max={100} unit="%" label="Combustion Efficiency"
                zones={[{ start: 0, end: 7, color: '#ef4444' }, { start: 7, end: 14, color: '#f59e0b' }, { start: 14, end: 20, color: '#10b981' }]} />
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Fuel Mix Breakdown</h4>
            {thermalBreakdown.map((fuel, i) => {
              const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']
              return (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[i] }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{fuel.source}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{fuel.kcal} kcal/kg</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{fuel.contribution}%</span>
                      <span style={{ fontSize: '10px', color: fuel.trend > 0 ? '#16a34a' : '#ef4444' }}>{fuel.trend > 0 ? '+' : ''}{fuel.trend}%</span>
                    </div>
                  </div>
                  <ProgressBar value={fuel.contribution} max={60} color={colors[i]} />
                </div>
              )
            })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={sty.infoCard}>
              <h4 style={sty.infoTitle}>Thermal Performance Metrics</h4>
              {[
                { label: 'Kiln Feed Rate', value: '320 TPH', color: '#1e293b' },
                { label: 'Clinker Production', value: '205 TPH', color: '#10b981' },
                { label: 'Coal Feed Rate', value: '28.5 TPH', color: '#3b82f6' },
                { label: 'Pet Coke Feed Rate', value: '8.2 TPH', color: '#f59e0b' },
                { label: 'AFR Feed Rate', value: '4.8 TPH', color: '#8b5cf6' },
                { label: 'Preheater Exit Temp', value: '328°C', color: '#ef4444' },
                { label: 'Cooler Exit Air Temp', value: '245°C', color: '#06b6d4' },
                { label: 'Radiation Losses', value: '4.2%', color: '#64748b' },
                { label: 'False Air Ingress', value: '6.8%', color: '#f59e0b' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

// ─── WHR TAB ───
function WHRTab() {
  return (
    <Section title="Waste Heat Recovery Power Plant" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {[
          { label: 'Total WHR Capacity', value: '5.0 MW', color: '#06b6d4' },
          { label: 'Current Generation', value: '4.8 MW', color: '#10b981' },
          { label: 'Today\'s Generation', value: '98.4 MWh', color: '#3b82f6' },
          { label: 'Monthly Savings', value: '0.92 Cr', color: '#16a34a' },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {whrSystems.map((sys) => {
          const efficiency = sys.efficiency
          const effColor = efficiency >= 90 ? '#10b981' : efficiency >= 80 ? '#f59e0b' : '#ef4444'
          return (
            <div key={sys.name} style={sty.packingCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{sys.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Capacity: {sys.capacity}</div>
                </div>
                <span style={{ ...sty.statusPill, background: '#f0fdf415', color: '#10b981' }}>{sys.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Generation: {sys.generation}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: effColor }}>{efficiency}%</span>
                  </div>
                  <ProgressBar value={efficiency} color={effColor} />
                </div>
                {sys.steamTemp > 0 && (
                  <>
                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Steam Temp</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>{sys.steamTemp}°C</div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Pressure</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>{sys.steamPressure} bar</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* WHR Process Flow */}
      <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>WHR Process Flow</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['Kiln Exhaust (328°C)', 'AQC Boiler', 'PH Boiler', 'Steam Header', 'Steam Turbine', '4.8 MW Output'].map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '8px 14px', background: i === arr.length - 1 ? '#10b98120' : '#fff', border: `1px solid ${i === arr.length - 1 ? '#10b981' : '#e8ecf1'}`, borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: i === arr.length - 1 ? '#10b981' : '#1e293b' }}>
                {step}
              </div>
              {i < arr.length - 1 && (
                <svg width="16" height="12" viewBox="0 0 24 14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="7" x2="18" y2="7" /><polyline points="14 3 18 7 14 11" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── MOTORS TAB ───
function MotorsTab() {
  return (
    <Section title="Motor Inventory & VFD Performance" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></svg>}>
      {/* Summary */}
      <div style={{ ...sty.grid3, marginBottom: '16px' }}>
        {[
          { label: 'Total Motors Monitored', value: '142', color: '#64748b' },
          { label: 'VFD Equipped', value: '68 (48%)', color: '#8b5cf6' },
          { label: 'VFD Energy Savings', value: '21.4 L/month', color: '#16a34a' },
          { label: 'Avg Motor Efficiency', value: '93.8%', color: '#3b82f6' },
          { label: 'Overloaded Motors', value: '3', color: '#ef4444' },
          { label: 'Maintenance Due', value: '8', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={sty.summaryCard}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Motor Table */}
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Motor ID', 'Equipment', 'Rating', 'Voltage', 'Load %', 'Efficiency', 'VFD', 'Savings (L/month)'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {motorInventory.map((m) => {
              const loadColor = m.load >= 90 ? '#ef4444' : m.load >= 80 ? '#f59e0b' : '#10b981'
              return (
                <tr key={m.id} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{m.id}</span></td>
                  <td style={sty.td}>{m.name}</td>
                  <td style={sty.td}>{m.rating}</td>
                  <td style={sty.td}>{m.voltage}</td>
                  <td style={sty.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ProgressBar value={m.load} color={loadColor} height={6} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: loadColor, minWidth: '30px' }}>{m.load}%</span>
                    </div>
                  </td>
                  <td style={sty.td}>{m.efficiency}%</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: m.vfd ? '#10b98115' : '#f1f5f9', color: m.vfd ? '#10b981' : '#94a3b8' }}>
                      {m.vfd ? 'Active' : 'No'}
                    </span>
                  </td>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: m.savings > 0 ? '#16a34a' : '#94a3b8' }}>{m.savings > 0 ? m.savings : '-'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ─── COST TAB ───
function CostTab() {
  return (
    <Section title="Energy Cost Analysis" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Energy Cost (Monthly)', value: '8.9 Cr', color: '#ef4444' },
          { label: 'WHR Savings', value: '-0.92 Cr', color: '#16a34a' },
          { label: 'Net Energy Cost', value: '7.98 Cr', color: '#1e293b' },
          { label: 'Cost per MT Cement', value: '532', color: ACCENT },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cost Breakdown Table */}
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Cost Component', 'Unit Rate', 'Monthly Cost', 'Share %'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costAnalysis.map((c, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: '#1e293b' }}>{c.item}</span></td>
                <td style={sty.td}>{c.cost} {c.unit}</td>
                <td style={sty.td}><span style={{ fontWeight: 600, color: c.monthly.includes('-') ? '#16a34a' : '#1e293b' }}>{c.monthly}</span></td>
                <td style={sty.td}>
                  {c.share > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ProgressBar value={c.share} max={60} color={ACCENT} height={6} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', minWidth: '25px' }}>{c.share}%</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost Trend */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Monthly Energy Cost Trend (Cr)</h4>
        <AreaChart data={[9.8, 9.5, 9.3, 9.1, 9.0, 8.9, 8.9]} color={ACCENT} height={80} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
          {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </Section>
  )
}

// ─── AI TAB ───
function AITab() {
  return (
    <Section title="AI-Powered Energy Optimization" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>}>
      {/* Potential Savings Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>Total AI-Identified Savings Potential</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Based on 6 optimization recommendations analyzed by on-premise AI models</div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>18.6 L/month</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {aiRecommendations.map((rec, i) => {
          const priorityColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' }
          const categoryColors = { scheduling: '#8b5cf6', motor: '#3b82f6', fuel: '#f59e0b', process: '#10b981', renewable: '#06b6d4', utility: '#ef4444' }
          const color = priorityColors[rec.priority]
          return (
            <div key={i} style={{ ...sty.aiCard, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</span>
                    <span style={{ ...sty.statusPill, background: `${color}15`, color, fontSize: '10px', padding: '2px 8px' }}>{rec.priority}</span>
                    <span style={{ ...sty.statusPill, background: `${categoryColors[rec.category]}15`, color: categoryColors[rec.category], fontSize: '10px', padding: '2px 8px' }}>{rec.category}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '6px' }}>{rec.desc}</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>Impact: {rec.impact}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Confidence: {rec.confidence}%</span>
                    <ProgressBar value={rec.confidence} color={ACCENT} height={4} />
                  </div>
                </div>
                <button style={{ ...sty.actionBtn, borderColor: color, color, marginLeft: '12px' }}>Apply</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Models */}
      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8ecf1' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>On-Premise AI Models for Energy</h4>
        <div style={sty.grid3}>
          {[
            { name: 'Load Forecaster', model: 'LSTM + Attention', accuracy: '96.2%', status: 'active' },
            { name: 'ToD Scheduler', model: 'Reinforcement Learning', accuracy: '93.8%', status: 'active' },
            { name: 'Motor Anomaly Detector', model: 'Autoencoder + IF', accuracy: '91.5%', status: 'active' },
            { name: 'Fuel Mix Optimizer', model: 'Multi-Obj. GA', accuracy: '94.1%', status: 'active' },
            { name: 'WHR Predictor', model: 'XGBoost Ensemble', accuracy: '92.7%', status: 'active' },
            { name: 'Demand Response', model: 'Deep Q-Network', accuracy: '89.3%', status: 'training' },
          ].map((m, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.name}</span>
                <span style={{ ...sty.statusDotSmall, background: m.status === 'active' ? '#10b981' : '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{m.model}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>{m.accuracy}</div>
            </div>
          ))}
        </div>
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
  miniCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  infoCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', height: '100%' },
  infoTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  packingCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  aiCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  actionBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
  statusDotSmall: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%' },
}

export default EnergyOptimization
