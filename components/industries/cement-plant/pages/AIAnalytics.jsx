'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const ORANGE = '#f97316'

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

// ─── Mini Sparkline ───
function Sparkline({ data, color, height = 32, width: forcedWidth }) {
  const ref = useRef(null)
  const [w, setW] = useState(forcedWidth || 120)
  useEffect(() => {
    if (forcedWidth) return
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [forcedWidth])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (
    <div ref={ref} style={{ width: forcedWidth || '100%' }}>
      <svg width={w} height={height}>
        <defs><linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#sp-${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── Progress Bar ───
function ProgressBar({ value, max = 100, color, height = 6, animated = false }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} />
    </div>
  )
}

// ─── Animated Value ───
function AnimatedValue({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseFloat(String(value).replace(/,/g, ''))
    if (isNaN(end)) { setDisplay(value); return }
    const duration = 1200
    const startTime = performance.now()
    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  if (typeof value === 'string' && isNaN(parseFloat(value.replace(/,/g, '')))) return <>{value}</>
  const num = typeof display === 'number' ? (String(value).includes('.') ? display.toFixed(1) : Math.round(display).toLocaleString()) : display
  return <>{num}{suffix}</>
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

// ─── SVG ICONS ───
const ChartIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const ReportIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
const StreamIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
const BrainIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" /></svg>
const DatabaseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>

// ─── REPORT TEMPLATES DATA ───
const reportTemplates = [
  { name: 'Daily Production Summary', frequency: 'Daily', lastGenerated: 'Today, 06:00 AM', format: 'PDF', recipients: 12, status: 'active' },
  { name: 'Kiln Performance Analysis', frequency: 'Daily', lastGenerated: 'Today, 07:30 AM', format: 'Dashboard', recipients: 8, status: 'active' },
  { name: 'Quality Control Report', frequency: 'Weekly', lastGenerated: 'Mar 17, 2026', format: 'PDF', recipients: 15, status: 'active' },
  { name: 'Energy Consumption Report', frequency: 'Daily', lastGenerated: 'Today, 05:00 AM', format: 'Excel', recipients: 6, status: 'active' },
  { name: 'Emission Compliance Report', frequency: 'Monthly', lastGenerated: 'Mar 01, 2026', format: 'PDF', recipients: 10, status: 'active' },
  { name: 'Maintenance Status Report', frequency: 'Weekly', lastGenerated: 'Mar 16, 2026', format: 'Dashboard', recipients: 9, status: 'active' },
  { name: 'Raw Material Usage Report', frequency: 'Daily', lastGenerated: 'Today, 06:30 AM', format: 'Excel', recipients: 7, status: 'paused' },
  { name: 'Safety Incident Report', frequency: 'Monthly', lastGenerated: 'Mar 01, 2026', format: 'PDF', recipients: 18, status: 'active' },
]

const recentReports = [
  { name: 'Daily Production Summary — Mar 19', type: 'Production', generatedAt: 'Today, 06:00 AM', size: '2.4 MB', format: 'PDF' },
  { name: 'Kiln Performance — Shift A', type: 'Performance', generatedAt: 'Today, 07:30 AM', size: '1.8 MB', format: 'Dashboard' },
  { name: 'Energy Consumption — Week 12', type: 'Energy', generatedAt: 'Today, 05:00 AM', size: '3.1 MB', format: 'Excel' },
  { name: 'Clinker Quality Analysis', type: 'Quality', generatedAt: 'Yesterday, 11:45 PM', size: '1.2 MB', format: 'PDF' },
  { name: 'Emission Monitoring — Daily', type: 'Compliance', generatedAt: 'Yesterday, 10:00 PM', size: '4.5 MB', format: 'PDF' },
  { name: 'Bearing Vibration Trend', type: 'Maintenance', generatedAt: 'Yesterday, 06:00 PM', size: '0.8 MB', format: 'Excel' },
  { name: 'Raw Mill Feed Optimization', type: 'Production', generatedAt: 'Yesterday, 04:30 PM', size: '1.5 MB', format: 'Dashboard' },
  { name: 'Packing Line Efficiency', type: 'Production', generatedAt: 'Yesterday, 02:00 PM', size: '2.0 MB', format: 'PDF' },
]

// ─── REAL-TIME DATA ───
const dataPipelines = [
  { name: 'Kiln Sensors', source: 'OPC-UA / 847 tags', eventsPerMin: 12400, lag: '1.2ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Raw Mill', source: 'OPC-UA / 324 tags', eventsPerMin: 5800, lag: '2.1ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Cement Mill', source: 'OPC-UA / 412 tags', eventsPerMin: 7200, lag: '1.8ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Packing', source: 'PLC / 186 tags', eventsPerMin: 3400, lag: '3.4ms', status: 'warning', lastEvent: '2s ago' },
  { name: 'Environmental', source: 'CEMS / 96 tags', eventsPerMin: 1800, lag: '2.6ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Energy', source: 'Smart Meters / 48 tags', eventsPerMin: 960, lag: '4.1ms', status: 'healthy', lastEvent: '1s ago' },
]

const analyticsModels = [
  { name: 'Clinker Quality Predictor', type: 'Regression', accuracy: '96.8%', accuracyNum: 96.8, predictions: 2840, lastRetrained: '2 days ago', color: GREEN },
  { name: 'Kiln Coating Detector', type: 'Classification', accuracy: '94.2%', accuracyNum: 94.2, predictions: 1420, lastRetrained: '5 days ago', color: BLUE },
  { name: 'Energy Optimizer', type: 'Reinforcement Learning', accuracy: '92.1%', accuracyNum: 92.1, predictions: 960, lastRetrained: '1 week ago', color: CYAN },
  { name: 'Bearing Failure Predictor', type: 'Anomaly Detection', accuracy: '97.5%', accuracyNum: 97.5, predictions: 4200, lastRetrained: '3 days ago', color: RED },
  { name: 'Emission Forecaster', type: 'Time Series', accuracy: '95.3%', accuracyNum: 95.3, predictions: 1680, lastRetrained: '4 days ago', color: AMBER },
  { name: 'Bag Weight Controller', type: 'PID + AI', accuracy: '99.1%', accuracyNum: 99.1, predictions: 8400, lastRetrained: '1 day ago', color: ACCENT },
]

// Anomaly score data over 24 hours
const anomalyData = [12, 15, 18, 14, 22, 35, 28, 19, 16, 42, 38, 25, 20, 17, 14, 30, 55, 48, 32, 21, 18, 15, 13, 16]
const anomalyThreshold = 40

// ─── MAIN ───
export default function AIAnalytics({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'custom')

  const TABS = [
    { key: 'custom', label: 'Custom AI Reports', icon: <ReportIcon /> },
    { key: 'realtime', label: 'Real-Time Data Analytics', icon: <StreamIcon /> },
  ]

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}><ChartIcon /></div>
          <div>
            <h1 style={sty.pageTitle}>AI Analytics & Reporting</h1>
            <p style={sty.pageSub}>Intelligent report generation and real-time data analytics for cement operations</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}>
            <span style={{ ...sty.liveDot, animation: 'pulse 2s infinite' }} /> Live
          </span>
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

      {activeTab === 'custom' && <CustomReportsTab />}
      {activeTab === 'realtime' && <RealtimeTab />}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// TAB 1: CUSTOM AI REPORTS
// ═══════════════════════════════════════════════════
function CustomReportsTab() {
  return (
    <>
      {/* KPI Cards */}
      <Section title="Report Generation Overview" icon={<ReportIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Reports Generated Today', value: '12', color: ACCENT },
            { label: 'Scheduled Reports', value: '8', color: BLUE },
            { label: 'Avg Generation Time', value: '4.2s', color: GREEN },
            { label: 'Data Sources Connected', value: '24', color: CYAN },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>{kpi.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Report Templates Grid */}
      <Section title="Report Templates" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {reportTemplates.map((tmpl, i) => {
            const freqColors = { Daily: BLUE, Weekly: AMBER, Monthly: ACCENT }
            const formatColors = { PDF: RED, Excel: GREEN, Dashboard: CYAN }
            return (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4', flex: 1 }}>{tmpl.name}</div>
                  <span style={{ ...sty.statusPill, background: tmpl.status === 'active' ? `${GREEN}15` : `${AMBER}15`, color: tmpl.status === 'active' ? GREEN : AMBER, flexShrink: 0, marginLeft: '8px' }}>
                    {tmpl.status}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ background: `${freqColors[tmpl.frequency]}12`, color: freqColors[tmpl.frequency], padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{tmpl.frequency}</span>
                  <span style={{ background: `${formatColors[tmpl.format]}12`, color: formatColors[tmpl.format], padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{tmpl.format}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                  <span>Last: <strong style={{ color: '#475569' }}>{tmpl.lastGenerated}</strong></span>
                  <span><strong style={{ color: '#475569' }}>{tmpl.recipients}</strong> recipients</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Recent Reports Table */}
      <Section title="Recent Reports" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Report Name', 'Type', 'Generated At', 'Size', 'Format', ''].map((h, i) => (
                  <th key={i} style={{ padding: '8px 6px', textAlign: 'left', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r, i) => {
                const formatColors = { PDF: RED, Excel: GREEN, Dashboard: CYAN }
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.03}s` }}>
                    <td style={{ padding: '8px 6px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '8px 6px' }}><span style={{ background: `${ACCENT}12`, color: ACCENT, padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{r.type}</span></td>
                    <td style={{ padding: '8px 6px', color: '#64748b' }}>{r.generatedAt}</td>
                    <td style={{ padding: '8px 6px', color: '#1e293b', fontWeight: 500 }}>{r.size}</td>
                    <td style={{ padding: '8px 6px' }}><span style={{ background: `${formatColors[r.format]}12`, color: formatColors[r.format], padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{r.format}</span></td>
                    <td style={{ padding: '8px 6px', cursor: 'pointer' }}><DownloadIcon /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Report Builder */}
      <Section title="Report Builder" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2" /><line x1="3" y1="22" x2="21" y2="22" /></svg>}>
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            {/* Date Range */}
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Date Range</label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>
            {/* Department */}
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Department</label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option>All Departments</option>
                <option>Kiln Operations</option>
                <option>Raw Mill</option>
                <option>Cement Mill</option>
                <option>Packing</option>
                <option>Quality Lab</option>
                <option>Maintenance</option>
              </select>
            </div>
            {/* Metrics */}
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Metrics</label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option>Production & Throughput</option>
                <option>Energy Consumption</option>
                <option>Quality Parameters</option>
                <option>Equipment Health</option>
                <option>Emissions & Compliance</option>
                <option>All Metrics</option>
              </select>
            </div>
            {/* Format */}
            <div>
              <label style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Format</label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option>PDF Report</option>
                <option>Excel Spreadsheet</option>
                <option>Interactive Dashboard</option>
                <option>CSV Export</option>
              </select>
            </div>
          </div>
          <button style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Generate Report
          </button>
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════
// TAB 2: REAL-TIME DATA ANALYTICS
// ═══════════════════════════════════════════════════
function RealtimeTab() {
  return (
    <>
      {/* KPI Cards */}
      <Section title="Live Data Overview" icon={<StreamIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Active Streams', value: '2,847', color: ACCENT },
            { label: 'Events / Second', value: '12,450', color: BLUE },
            { label: 'Avg Latency', value: '3.2ms', color: GREEN },
            { label: 'Data Processed Today', value: '4.8 TB', color: CYAN },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>{kpi.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Data Pipeline Status */}
      <Section title="Data Pipeline Status" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /></svg>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Pipeline', 'Source', 'Events/Min', 'Lag', 'Status', 'Last Event'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataPipelines.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.05}s` }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{p.name}</td>
                  <td style={{ padding: '10px 10px', color: '#64748b', fontSize: '10px' }}>{p.source}</td>
                  <td style={{ padding: '10px 10px', fontWeight: 700, color: ACCENT }}>{p.eventsPerMin.toLocaleString()}</td>
                  <td style={{ padding: '10px 10px', fontWeight: 500, color: '#1e293b' }}>{p.lag}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.status === 'healthy' ? GREEN : AMBER, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: p.status === 'healthy' ? GREEN : AMBER, textTransform: 'capitalize' }}>{p.status}</span>
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#64748b', fontSize: '10px' }}>{p.lastEvent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Analytics Models */}
      <Section title="Active ML Models" icon={<BrainIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {analyticsModels.map((m, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${m.color}`, animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
                  <div style={{ fontSize: '10px', color: m.color, fontWeight: 600, marginTop: '2px' }}>{m.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: m.color }}>{m.accuracy}</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</div>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <ProgressBar value={m.accuracyNum} color={m.color} height={4} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>Predictions today: <strong style={{ color: '#1e293b' }}>{m.predictions.toLocaleString()}</strong></span>
                <span>Retrained: <strong style={{ color: '#1e293b' }}>{m.lastRetrained}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Real-Time Anomaly Chart */}
      <Section title="Real-Time Anomaly Score — 24 Hours" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}>
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <AnomalyChart />
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <div style={{ width: '16px', height: '2px', background: ACCENT, borderRadius: '1px' }} /> Anomaly Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <div style={{ width: '16px', height: '2px', background: RED, borderRadius: '1px', borderTop: '1px dashed' + RED }} /> Threshold (40)
            </div>
          </div>
        </div>
      </Section>

      {/* Data Lake Stats */}
      <Section title="Data Lake Statistics" icon={<DatabaseIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Size', value: '48 TB', color: ACCENT, sparkData: [32, 35, 37, 38, 40, 42, 43, 44, 45, 46, 47, 48] },
            { label: 'Tables', value: '1,247', color: BLUE, sparkData: [980, 1020, 1060, 1100, 1120, 1150, 1180, 1200, 1220, 1235, 1240, 1247] },
            { label: 'Queries Today', value: '8,450', color: GREEN, sparkData: [200, 450, 820, 1400, 2100, 3200, 4500, 5600, 6400, 7200, 7800, 8450] },
            { label: 'Avg Query Time', value: '280ms', color: CYAN, sparkData: [320, 310, 290, 300, 285, 295, 275, 290, 280, 285, 278, 280] },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, marginBottom: '8px' }}>{stat.value}</div>
              <Sparkline data={stat.sparkData} color={stat.color} height={28} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── Anomaly Chart Component ───
function AnomalyChart() {
  const ref = useRef(null)
  const [w, setW] = useState(600)
  const chartHeight = 160
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const innerW = w - padding.left - padding.right
  const innerH = chartHeight - padding.top - padding.bottom
  const maxVal = 70
  const dataPoints = anomalyData.map((v, i) => ({
    x: padding.left + (i / (anomalyData.length - 1)) * innerW,
    y: padding.top + innerH - (v / maxVal) * innerH,
  }))
  const linePath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${dataPoints[dataPoints.length - 1].x},${padding.top + innerH} L${dataPoints[0].x},${padding.top + innerH} Z`
  const thresholdY = padding.top + innerH - (anomalyThreshold / maxVal) * innerH

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={chartHeight}>
        {/* Grid lines */}
        {[0, 20, 40, 60].map((v) => {
          const y = padding.top + innerH - (v / maxVal) * innerH
          return (
            <g key={v}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9">{v}</text>
            </g>
          )
        })}
        {/* Hour labels */}
        {[0, 6, 12, 18, 23].map((h) => {
          const x = padding.left + (h / (anomalyData.length - 1)) * innerW
          return <text key={h} x={x} y={chartHeight - 5} textAnchor="middle" fill="#94a3b8" fontSize="9">{h}:00</text>
        })}
        {/* Threshold line */}
        <line x1={padding.left} y1={thresholdY} x2={w - padding.right} y2={thresholdY} stroke={RED} strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={w - padding.right + 4} y={thresholdY + 3} fill={RED} fontSize="9" fontWeight="600">40</text>
        {/* Area fill */}
        <path d={areaPath} fill={`${ACCENT}15`} />
        {/* Line */}
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={anomalyData[i] >= anomalyThreshold ? 4 : 2.5} fill={anomalyData[i] >= anomalyThreshold ? RED : ACCENT} stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
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
  statusPill: { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
}
