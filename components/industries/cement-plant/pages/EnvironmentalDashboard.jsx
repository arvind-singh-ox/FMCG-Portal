'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'

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

// ─── Area Chart ───
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

// ─── Gauge ───
function GaugeChart({ value, min = 0, max = 100, unit = '', label, zones }) {
  const size = 110, cx = size / 2, cy = size / 2 + 5, r = 40
  const startAngle = Math.PI
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const needleAngle = startAngle - pct * Math.PI
  const nx = cx + (r - 8) * Math.cos(needleAngle)
  const ny = cy - (r - 8) * Math.sin(needleAngle)
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size / 2 + 18}>
        {zones && zones.map((z, i) => {
          const a1 = startAngle - (z.start / (max - min)) * Math.PI
          const a2 = startAngle - (z.end / (max - min)) * Math.PI
          const x1g = cx + r * Math.cos(a1), y1g = cy - r * Math.sin(a1)
          const x2g = cx + r * Math.cos(a2), y2g = cy - r * Math.sin(a2)
          return <path key={i} d={`M ${x1g} ${y1g} A ${r} ${r} 0 0 1 ${x2g} ${y2g}`} fill="none" stroke={z.color} strokeWidth="7" strokeLinecap="round" opacity="0.3" />
        })}
        <circle cx={cx} cy={cy} r="3.5" fill={ACCENT} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">{value}{unit}</text>
      </svg>
      {label && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '-2px' }}>{label}</div>}
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

const envKPIs = [
  { label: 'Overall Compliance', value: '98.1', suffix: '%', trend: +1.2, color: GREEN, sparkData: [95.2,95.8,96.4,96.9,97.2,97.6,97.9,98.1] },
  { label: 'CO2 Emission (today)', value: '842', suffix: ' kg/MT', trend: -3.4, color: BLUE, sparkData: [880,872,865,858,852,848,845,842] },
  { label: 'Stack NOx', value: '385', suffix: ' mg/Nm3', trend: +2.1, color: AMBER, sparkData: [362,368,372,375,378,380,382,385] },
  { label: 'Dust (PM)', value: '28', suffix: ' mg/Nm3', trend: -8.2, color: GREEN, sparkData: [38,36,34,32,31,30,29,28] },
  { label: 'SO2 Emission', value: '42', suffix: ' mg/Nm3', trend: -5.1, color: CYAN, sparkData: [52,50,48,46,45,44,43,42] },
  { label: 'Water Recycled', value: '92.4', suffix: '%', trend: +2.8, color: BLUE, sparkData: [86,87.5,88.8,89.6,90.2,91.0,91.8,92.4] },
]

const cemsReadings = [
  { parameter: 'Particulate Matter (PM)', current: 28, limit: 50, unit: 'mg/Nm3', avg24h: 26, trend: [32,30,28,27,26,28,29,28], status: 'normal' },
  { parameter: 'SO2 (Sulphur Dioxide)', current: 42, limit: 100, unit: 'mg/Nm3', avg24h: 40, trend: [48,45,44,42,41,42,43,42], status: 'normal' },
  { parameter: 'NOx (Nitrogen Oxides)', current: 385, limit: 400, unit: 'mg/Nm3', avg24h: 378, trend: [362,368,372,378,382,385,390,385], status: 'warning' },
  { parameter: 'CO (Carbon Monoxide)', current: 0.12, limit: 0.5, unit: '%', avg24h: 0.11, trend: [0.10,0.11,0.12,0.11,0.13,0.12,0.11,0.12], status: 'normal' },
  { parameter: 'HCl (Hydrogen Chloride)', current: 8.2, limit: 20, unit: 'mg/Nm3', avg24h: 7.8, trend: [7.5,7.8,8.0,8.1,8.2,8.0,7.9,8.2], status: 'normal' },
  { parameter: 'HF (Hydrogen Fluoride)', current: 0.4, limit: 1.0, unit: 'mg/Nm3', avg24h: 0.38, trend: [0.35,0.36,0.38,0.39,0.40,0.38,0.37,0.40], status: 'normal' },
  { parameter: 'Mercury (Hg)', current: 0.018, limit: 0.05, unit: 'mg/Nm3', avg24h: 0.016, trend: [0.015,0.016,0.017,0.018,0.017,0.018,0.019,0.018], status: 'normal' },
  { parameter: 'Stack Opacity', current: 8.2, limit: 20, unit: '%', avg24h: 7.5, trend: [7.0,7.2,7.5,7.8,8.0,8.2,8.1,8.2], status: 'normal' },
]

const co2Breakdown = [
  { source: 'Calcination (CaCO3 → CaO)', value: 525, pct: 62, color: '#64748b' },
  { source: 'Fuel Combustion (Coal)', value: 195, pct: 23, color: '#ef4444' },
  { source: 'Fuel Combustion (Pet Coke)', value: 68, pct: 8, color: '#f59e0b' },
  { source: 'Electricity (Grid)', value: 42, pct: 5, color: '#3b82f6' },
  { source: 'Transport & Misc', value: 12, pct: 2, color: '#94a3b8' },
]

const waterData = {
  intake: 285, recycled: 263, discharged: 22, recycleRate: 92.4,
  sources: [
    { name: 'Borewell', qty: 180, pct: 63 },
    { name: 'Municipal Supply', qty: 65, pct: 23 },
    { name: 'Rainwater Harvest', qty: 40, pct: 14 },
  ],
  usage: [
    { name: 'Cooling (Kiln/Cooler)', qty: 120, pct: 42 },
    { name: 'Dust Suppression', qty: 55, pct: 19 },
    { name: 'Cement Mill Cooling', qty: 45, pct: 16 },
    { name: 'Plantation/Green Belt', qty: 35, pct: 12 },
    { name: 'Domestic/Canteen', qty: 30, pct: 11 },
  ],
}

const wasteData = [
  { type: 'Kiln Dust (CKD)', generated: 1200, recycled: 1140, unit: 'MT/month', method: 'Recycled back to raw mill', rate: 95 },
  { type: 'Used Oil', generated: 2.4, recycled: 2.4, unit: 'KL/month', method: 'Sent to authorized recycler', rate: 100 },
  { type: 'E-Waste', generated: 0.12, recycled: 0.12, unit: 'MT/month', method: 'CPCB authorized handler', rate: 100 },
  { type: 'Fly Ash (from WHR)', generated: 45, recycled: 45, unit: 'MT/month', method: 'Used as cement additive', rate: 100 },
  { type: 'Plastic Waste (AFR)', generated: 180, recycled: 180, unit: 'MT/month', method: 'Co-processed in kiln as fuel', rate: 100 },
  { type: 'Municipal Solid Waste', generated: 85, recycled: 85, unit: 'MT/month', method: 'Co-processed in kiln (RDF)', rate: 100 },
]

const complianceLog = [
  { date: '15 Mar 2026', agency: 'CPCB', type: 'Stack Emission Test', result: 'Passed', details: 'All parameters within limits. PM: 28 (limit 50), NOx: 385 (limit 400), SO2: 42 (limit 100)', status: 'passed' },
  { date: '10 Mar 2026', agency: 'SPCB', type: 'Ambient Air Quality', result: 'Passed', details: 'AAQ monitoring at 4 locations — PM10: 85 ug/m3 (limit 100), PM2.5: 42 (limit 60)', status: 'passed' },
  { date: '05 Mar 2026', agency: 'CPCB', type: 'CEMS Data Audit', result: 'Passed', details: 'Online CEMS data verified against manual isokinetic sampling. Deviation < 5%', status: 'passed' },
  { date: '28 Feb 2026', agency: 'SPCB', type: 'Water Discharge Test', result: 'Passed', details: 'ZLD compliance verified. No discharge to water body. Recycled: 92.4%', status: 'passed' },
  { date: '20 Feb 2026', agency: 'MoEFCC', type: 'EC Compliance Report', result: 'Submitted', details: 'Half-yearly EC compliance report submitted. Plantation: 108% of target (42 hectares)', status: 'submitted' },
  { date: '15 Feb 2026', agency: 'CPCB', type: 'Hazardous Waste Return', result: 'Filed', details: 'Annual HW return filed. All waste categories properly tracked and disposed via authorized facilities', status: 'submitted' },
]

const greenInitiatives = [
  { name: 'Alternative Fuel & Raw Material (AFR)', target: '15% TSR', current: '12% TSR', progress: 80, desc: 'Co-processing plastic waste, municipal solid waste, and biomass as kiln fuel', color: GREEN },
  { name: 'Green Belt Development', target: '45 hectares', current: '42 hectares', progress: 93, desc: '42 hectares planted with native species. 15,000+ trees in plant premises', color: GREEN },
  { name: 'Solar Power Installation', target: '2 MW', current: '0.48 MW', progress: 24, desc: 'Rooftop solar on packing plant and admin buildings. Phase 2: 1.5 MW ground mount', color: AMBER },
  { name: 'Waste Heat Recovery', target: '5 MW', current: '4.8 MW', progress: 96, desc: 'AQC + PH boiler generating 4.8 MW from kiln exhaust heat. Saves 0.92 Cr/month', color: GREEN },
  { name: 'Zero Liquid Discharge', target: '100%', current: '100%', progress: 100, desc: 'All wastewater treated via RO + MEE and recycled. Zero discharge to any water body', color: GREEN },
  { name: 'Biodiversity Conservation', target: '3 species', current: '3 species', progress: 100, desc: 'Butterfly garden, bird sanctuary, and medicinal plant nursery within green belt', color: GREEN },
]

const TABS = [
  { key: 'overview', label: 'Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { key: 'cems', label: 'Stack Emissions (CEMS)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 18l4-12 4 12" /><path d="M2 12h20" /></svg> },
  { key: 'carbon', label: 'Carbon Footprint', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> },
  { key: 'water', label: 'Water Management', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg> },
  { key: 'waste', label: 'Waste & Circular Economy', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg> },
  { key: 'compliance', label: 'Regulatory Compliance', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  { key: 'green', label: 'Green Initiatives', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L2 21l.73-2.64C4.24 13.5 7 8 17 8z" /><path d="M17 8c4 0 6 2 6 6" /></svg> },
]

// ─── MAIN ───
function EnvironmentalDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Environmental Dashboard</h1>
            <p style={sty.pageSub}>Real-time emission monitoring, carbon footprint tracking, water management, waste circularity & regulatory compliance</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> CEMS Online</span>
          <span style={{ ...sty.liveBadge, background: '#eff6ff', color: BLUE, borderColor: '#bfdbfe' }}>
            <span style={{ ...sty.liveDot, background: BLUE }} /> 98.1% Compliant
          </span>
        </div>
      </div>

      <div style={sty.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'cems' && <CEMSTab />}
      {activeTab === 'carbon' && <CarbonTab />}
      {activeTab === 'water' && <WaterTab />}
      {activeTab === 'waste' && <WasteTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
      {activeTab === 'green' && <GreenTab />}
    </div>
  )
}

// ─── OVERVIEW TAB ───
function OverviewTab() {
  return (
    <>
      <Section title="Environmental Performance KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={sty.kpiGrid}>
          {envKPIs.map((kpi, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{kpi.label}</span>
                <span style={{ ...sty.trendBadge, color: kpi.trend < 0 ? GREEN : kpi.trend > 2 ? AMBER : GREEN, background: kpi.trend < 0 ? '#f0fdf4' : kpi.trend > 2 ? '#fffbeb' : '#f0fdf4' }}>
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

      {/* Quick CEMS Status */}
      <Section title="Stack Emission Status (Live)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M8 18l4-12 4 12" /></svg>}>
        <div style={sty.grid4}>
          {cemsReadings.slice(0, 4).map((p, i) => {
            const pctUsed = (p.current / p.limit) * 100
            const barColor = pctUsed > 90 ? RED : pctUsed > 75 ? AMBER : GREEN
            return (
              <div key={i} style={sty.miniCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{p.parameter}</span>
                  <span style={{ ...sty.statusDot, background: barColor }} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: barColor, marginBottom: '4px' }}>{p.current} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{p.unit}</span></div>
                <ProgressBar value={pctUsed} color={barColor} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Limit: {p.limit}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: barColor }}>{pctUsed.toFixed(0)}% of limit</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

// ─── CEMS TAB ───
function CEMSTab() {
  return (
    <Section title="Continuous Emission Monitoring System (CEMS)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M8 18l4-12 4 12" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cemsReadings.map((p, i) => {
          const pctUsed = (p.current / p.limit) * 100
          const barColor = pctUsed > 90 ? RED : pctUsed > 75 ? AMBER : GREEN
          return (
            <div key={i} style={{ ...sty.cemsRow, borderLeft: `3px solid ${barColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{p.parameter}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>24h Avg: {p.avg24h} {p.unit} | Regulatory Limit: {p.limit} {p.unit}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: barColor }}>{p.current}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.unit}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Usage of regulatory limit</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: barColor }}>{pctUsed.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={pctUsed} color={barColor} />
                </div>
                <div style={{ width: '180px' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '2px' }}>24h TREND</div>
                  <AreaChart data={p.trend} color={barColor} height={30} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CEMS Hardware Info */}
      <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>CEMS Hardware Configuration</h4>
        <div style={sty.grid3}>
          {[
            { label: 'Analyzer', value: 'Gasmet DX4000 FTIR', detail: '25+ gas species simultaneously' },
            { label: 'Dust Monitor', value: 'SICK FWE200', detail: 'Scattering light, cross-stack' },
            { label: 'Flow Meter', value: 'SICK FLOWSIC100', detail: 'Ultrasonic, transit-time' },
            { label: 'Data Logger', value: 'Envea DACS', detail: 'CPCB-certified, auto-upload' },
            { label: 'Calibration', value: 'Auto every 4 hrs', detail: 'Zero/span with certified gas' },
            { label: 'Data Upload', value: 'CPCB Server (real-time)', detail: 'Via GPRS/Ethernet to OCEMS' },
          ].map((h, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>{h.label}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{h.value}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{h.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── CARBON TAB ───
function CarbonTab() {
  return (
    <Section title="Carbon Footprint & CO2 Tracking" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>}>
      <div style={sty.row}>
        <div style={{ flex: 1 }}>
          {/* Gauges */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
            <GaugeChart value={842} min={700} max={1000} unit=" kg" label="CO2 per MT Cement"
              zones={[{ start: 0, end: 100, color: GREEN }, { start: 100, end: 200, color: AMBER }, { start: 200, end: 300, color: RED }]} />
            <GaugeChart value={12} min={0} max={30} unit="%" label="TSR (Alt. Fuel Rate)"
              zones={[{ start: 0, end: 10, color: RED }, { start: 10, end: 20, color: AMBER }, { start: 20, end: 30, color: GREEN }]} />
            <GaugeChart value={0.68} min={0} max={1} unit="" label="Clinker Factor"
              zones={[{ start: 0, end: 0.33, color: GREEN }, { start: 0.33, end: 0.66, color: AMBER }, { start: 0.66, end: 1, color: RED }]} />
          </div>

          {/* CO2 Breakdown */}
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>CO2 Source Breakdown (kg/MT cement)</h4>
          {co2Breakdown.map((c, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: c.color }} />
                  <span style={{ fontSize: '12px', color: '#1e293b' }}>{c.source}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{c.value} kg ({c.pct}%)</span>
              </div>
              <ProgressBar value={c.pct} max={65} color={c.color} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={sty.infoCard}>
            <h4 style={sty.infoTitle}>Carbon Reduction Roadmap</h4>
            {[
              { year: '2024 (Baseline)', value: '890 kg/MT', color: '#64748b' },
              { year: '2025 (Actual)', value: '862 kg/MT', color: AMBER },
              { year: '2026 (Current)', value: '842 kg/MT', color: BLUE },
              { year: '2027 (Target)', value: '800 kg/MT', color: GREEN },
              { year: '2030 (Target)', value: '700 kg/MT', color: GREEN },
              { year: '2050 (Net Zero)', value: '0 kg/MT', color: ACCENT },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{r.year}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Monthly CO2 Trend (kg/MT)</h4>
            <AreaChart data={[880,872,865,858,852,848,842]} color={BLUE} height={80} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
              {['Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── WATER TAB ───
function WaterTab() {
  return (
    <Section title="Water Management & ZLD Compliance" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Daily Intake', value: `${waterData.intake} KL`, color: BLUE },
          { label: 'Recycled', value: `${waterData.recycled} KL`, color: GREEN },
          { label: 'Recycle Rate', value: `${waterData.recycleRate}%`, color: GREEN },
          { label: 'Discharged', value: `${waterData.discharged} KL`, color: CYAN },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={sty.row}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Water Sources</h4>
          {waterData.sources.map((s, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', color: '#1e293b' }}>{s.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: BLUE }}>{s.qty} KL ({s.pct}%)</span>
              </div>
              <ProgressBar value={s.pct} max={70} color={BLUE} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Water Usage</h4>
          {waterData.usage.map((u, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', color: '#1e293b' }}>{u.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: CYAN }}>{u.qty} KL ({u.pct}%)</span>
              </div>
              <ProgressBar value={u.pct} max={50} color={CYAN} />
            </div>
          ))}
        </div>
      </div>

      {/* ZLD Process */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>Zero Liquid Discharge (ZLD) — 100% Compliant</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>All wastewater treated via ETP + RO + MEE system. Treated water recycled for cooling and dust suppression. Zero discharge to any water body.</div>
        </div>
      </div>
    </Section>
  )
}

// ─── WASTE TAB ───
function WasteTab() {
  return (
    <Section title="Waste Management & Circular Economy" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Waste Type', 'Generated', 'Recycled/Disposed', 'Method', 'Recovery Rate'].map(h => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wasteData.map((w, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: '#1e293b' }}>{w.type}</span></td>
                <td style={sty.td}>{w.generated} {w.unit}</td>
                <td style={sty.td}>{w.recycled} {w.unit}</td>
                <td style={{ ...sty.td, fontSize: '11px', color: '#64748b' }}>{w.method}</td>
                <td style={sty.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ProgressBar value={w.rate} color={w.rate >= 95 ? GREEN : AMBER} height={6} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: w.rate >= 95 ? GREEN : AMBER, minWidth: '30px' }}>{w.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AFR Co-Processing */}
      <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Co-Processing in Kiln (AFR Program)</h4>
        <div style={sty.grid3}>
          {[
            { name: 'Plastic Waste (MLP/HDPE)', qty: '180 MT/month', saved: '126 MT coal equivalent', color: BLUE },
            { name: 'Municipal Solid Waste (RDF)', qty: '85 MT/month', saved: '42 MT coal equivalent', color: GREEN },
            { name: 'Biomass (Rice Husk/Sawdust)', qty: '120 MT/month', saved: '72 MT coal equivalent', color: AMBER },
          ].map((a, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{a.name}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: a.color }}>{a.qty}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Displaces: {a.saved}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── COMPLIANCE TAB ───
function ComplianceTab() {
  return (
    <Section title="Regulatory Compliance Log" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Date', 'Agency', 'Test/Report Type', 'Result', 'Details'].map(h => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complianceLog.map((c, i) => {
              const statusColors = { passed: GREEN, submitted: BLUE, failed: RED }
              return (
                <tr key={i} style={sty.tr}>
                  <td style={sty.td}>{c.date}</td>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{c.agency}</span></td>
                  <td style={sty.td}>{c.type}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[c.status]}15`, color: statusColors[c.status] }}>{c.result}</span>
                  </td>
                  <td style={{ ...sty.td, fontSize: '11px', color: '#64748b', maxWidth: '300px' }}>{c.details}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Regulatory Bodies */}
      <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Applicable Regulations</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { name: 'CPCB (Air/Water)', color: RED },
            { name: 'SPCB (State Board)', color: AMBER },
            { name: 'MoEFCC (EC Conditions)', color: GREEN },
            { name: 'DGMS (Mining Safety)', color: BLUE },
            { name: 'BIS (Product Quality)', color: ACCENT },
            { name: 'OSHAS / ISO 14001', color: CYAN },
          ].map((r, i) => (
            <div key={i} style={{ padding: '6px 14px', background: `${r.color}08`, border: `1px solid ${r.color}25`, borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: r.color }}>{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── GREEN TAB ───
function GreenTab() {
  return (
    <Section title="Green Initiatives & Sustainability Programs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L2 21l.73-2.64C4.24 13.5 7 8 17 8z" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {greenInitiatives.map((g, i) => (
          <div key={i} style={{ ...sty.greenCard, borderLeft: `3px solid ${g.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{g.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{g.desc}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: g.color }}>{g.progress}%</div>
              </div>
            </div>
            <ProgressBar value={g.progress} color={g.color} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Current: <span style={{ color: '#1e293b', fontWeight: 600 }}>{g.current}</span></span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target: <span style={{ color: '#1e293b', fontWeight: 600 }}>{g.target}</span></span>
            </div>
          </div>
        ))}
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
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  miniCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  infoCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', height: '100%' },
  infoTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  cemsRow: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  greenCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%' },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
}

export default EnvironmentalDashboard
