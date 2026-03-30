'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const BLUE = '#3b82f6'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function Sparkline({ data, color, height = 32 }) {
  const ref = useRef(null); const [w, setW] = useState(120)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height}><defs><linearGradient id={`sp-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#sp-${color.replace('#','')})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg></div>)
}

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (<div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}><div style={sty.sectionHeader}><div style={sty.sectionIcon}>{icon}</div><h2 style={sty.sectionTitle}>{title}</h2></div>{visible && children}</div>)
}

function LiveCounter({ base, increment = 1, interval = 3000, color = '#1e293b' }) {
  const [val, setVal] = useState(base)
  useEffect(() => { const t = setInterval(() => { setVal(v => v + Math.floor(Math.random() * increment * 2) + 1) }, interval); return () => clearInterval(t) }, [increment, interval])
  return <span style={{ fontSize: '22px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s ease' }}>{val.toLocaleString()}</span>
}

const ReportIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
const StreamIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
const ChartIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>

// ══════════════════════════════════════════════════
// STEEL PLANT AI ANALYTICS DATA
// ══════════════════════════════════════════════════

const reportTemplates = [
  { name: 'Daily Production Summary', frequency: 'Daily', lastGenerated: 'Today, 06:00 AM', format: 'PDF', recipients: 14, status: 'active' },
  { name: 'BF Performance Analysis', frequency: 'Daily', lastGenerated: 'Today, 07:30 AM', format: 'Dashboard', recipients: 8, status: 'active' },
  { name: 'BOF Heat Analysis Report', frequency: 'Per Heat', lastGenerated: 'Today, 12:42 PM', format: 'PDF', recipients: 6, status: 'active' },
  { name: 'Steel Quality Report (MTC)', frequency: 'Per Coil/Plate', lastGenerated: 'Today, 11:15 AM', format: 'PDF', recipients: 10, status: 'active' },
  { name: 'Energy & SEC Report', frequency: 'Daily', lastGenerated: 'Today, 05:00 AM', format: 'Excel', recipients: 8, status: 'active' },
  { name: 'Emission Compliance Report', frequency: 'Monthly', lastGenerated: 'Mar 01, 2026', format: 'PDF', recipients: 12, status: 'active' },
  { name: 'Predictive Maintenance Report', frequency: 'Weekly', lastGenerated: 'Mar 16, 2026', format: 'Dashboard', recipients: 9, status: 'active' },
  { name: 'Raw Material Consumption Report', frequency: 'Daily', lastGenerated: 'Today, 06:30 AM', format: 'Excel', recipients: 7, status: 'active' },
  { name: 'Coke Rate Optimization Report', frequency: 'Weekly', lastGenerated: 'Mar 17, 2026', format: 'PDF', recipients: 5, status: 'active' },
  { name: 'Safety & Incident Report', frequency: 'Monthly', lastGenerated: 'Mar 01, 2026', format: 'PDF', recipients: 22, status: 'active' },
]

const recentReports = [
  { name: 'Daily Production Summary — Mar 19', type: 'Production', generatedAt: 'Today, 06:00 AM', size: '3.2 MB', format: 'PDF' },
  { name: 'BF #1 Performance — Shift A', type: 'Ironmaking', generatedAt: 'Today, 07:30 AM', size: '2.4 MB', format: 'Dashboard' },
  { name: 'BOF Heat H-1044 Analysis', type: 'Steelmaking', generatedAt: 'Today, 12:42 PM', size: '1.8 MB', format: 'PDF' },
  { name: 'Energy SEC — Week 12', type: 'Energy', generatedAt: 'Today, 05:00 AM', size: '4.2 MB', format: 'Excel' },
  { name: 'MTC — S355J2 Coil #42185', type: 'Quality', generatedAt: 'Today, 11:15 AM', size: '0.6 MB', format: 'PDF' },
  { name: 'Rolling Mill Vibration Trend', type: 'Maintenance', generatedAt: 'Yesterday, 06:00 PM', size: '1.2 MB', format: 'Excel' },
  { name: 'Gas Balance Optimization', type: 'Energy', generatedAt: 'Yesterday, 04:30 PM', size: '2.8 MB', format: 'Dashboard' },
  { name: 'Slab Surface Defect Analysis', type: 'Quality', generatedAt: 'Yesterday, 02:00 PM', size: '5.4 MB', format: 'PDF' },
]

// ── Real-Time Data Pipelines ──
const dataPipelines = [
  { name: 'Blast Furnace Sensors', source: 'OPC-UA / 380 tags', eventsPerMin: 18200, lag: '0.8ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'BOF / SMS', source: 'OPC-UA / 420 tags', eventsPerMin: 14800, lag: '1.2ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Continuous Caster', source: 'OPC-UA / 280 tags', eventsPerMin: 12400, lag: '1.5ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Hot Strip Mill', source: 'OPC-UA / 320 tags', eventsPerMin: 15600, lag: '1.8ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Coke Oven + Sinter', source: 'DCS / 328 tags', eventsPerMin: 8400, lag: '2.4ms', status: 'healthy', lastEvent: '< 1s ago' },
  { name: 'Environmental CEMS', source: 'CEMS / 148 tags', eventsPerMin: 2800, lag: '2.8ms', status: 'healthy', lastEvent: '1s ago' },
  { name: 'Energy Metering', source: 'Smart Meters / 2400 pts', eventsPerMin: 4800, lag: '3.2ms', status: 'healthy', lastEvent: '1s ago' },
  { name: 'AI Vision Cameras', source: 'RTSP / 32 cameras', eventsPerMin: 1920, lag: '85ms', status: 'healthy', lastEvent: '< 1s ago' },
]

// ── Predictive Analytics Models ──
const analyticsModels = [
  { name: 'BF Silicon Predictor', type: 'LSTM Time-Series', accuracy: '94.2%', accuracyNum: 94.2, predictions: 4280, lastRetrained: '6 hrs ago', color: RED },
  { name: 'BOF Endpoint (C + T)', type: 'XGBoost + NN', accuracy: '97.2%', accuracyNum: 97.2, predictions: 1840, lastRetrained: '2 hrs ago', color: GREEN },
  { name: 'Breakout Prediction', type: 'CNN Classification', accuracy: '99.1%', accuracyNum: 99.1, predictions: 8400, lastRetrained: '3 days ago', color: BLUE },
  { name: 'Mechanical Properties', type: 'Neural Network', accuracy: '94.8%', accuracyNum: 94.8, predictions: 3200, lastRetrained: '18 hrs ago', color: ACCENT },
  { name: 'Surface Defect Detector', type: 'YOLOv8 + ResNet', accuracy: '97.8%', accuracyNum: 97.8, predictions: 2840, lastRetrained: '5 days ago', color: AMBER },
  { name: 'Gas Network Optimizer', type: 'LP + RL', accuracy: '98.1%', accuracyNum: 98.1, predictions: 960, lastRetrained: 'Continuous', color: GREEN },
  { name: 'Vibration Anomaly', type: '1D-CNN + Envelope', accuracy: '96.4%', accuracyNum: 96.4, predictions: 4800, lastRetrained: '1 day ago', color: RED },
  { name: 'Inventory Forecasting', type: 'LSTM + Lead-time', accuracy: '92.8%', accuracyNum: 92.8, predictions: 420, lastRetrained: '12 hrs ago', color: AMBER },
]

// Anomaly score data
const anomalyData = [8, 12, 15, 10, 18, 28, 22, 14, 12, 45, 35, 20, 16, 12, 10, 25, 52, 42, 28, 18, 14, 11, 9, 12]
const anomalyThreshold = 40

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════

export default function AIAnalytics({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'custom')

  const TABS = [
    { key: 'custom', label: 'Custom AI Reports', icon: <ReportIcon /> },
    { key: 'realtime', label: 'Real-Time Data Analytics', icon: <StreamIcon /> },
  ]

  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}><ChartIcon /></div>
          <div>
            <h1 style={sty.pageTitle}>AI Analytics & Reporting</h1>
            <p style={sty.pageSub}>Custom AI reports, real-time data pipelines & predictive analytics — Steel Plant</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> Real-Time Analytics</span>
          <span style={{ ...sty.liveBadge, background: `${ACCENT}12`, color: ACCENT, borderColor: `${ACCENT}30` }}>18 AI Models | 8 Pipelines</span>
        </div>
      </div>

      <div style={sty.tabs}>
        {TABS.map(t => (<button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>))}
      </div>

      {activeTab === 'custom' && <CustomReportsTab />}
      {activeTab === 'realtime' && <RealTimeTab />}
    </div>
  )
}

// ═══ CUSTOM AI REPORTS TAB ═══
function CustomReportsTab() {
  return (
    <>
      <Section title="Report Templates — AI Auto-Generated" icon={<ReportIcon />}>
        <div style={sty.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 1fr 0.5fr 0.6fr 0.5fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
            {['Report Name', 'Frequency', 'Last Generated', 'Format', 'Recipients', 'Status'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
          </div>
          {reportTemplates.map((r, i) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 1fr 0.5fr 0.6fr 0.5fr', gap: '8px', padding: '12px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '3px', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.03}s` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{r.name}</div>
              <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 500 }}>{r.frequency}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{r.lastGenerated}</div>
              <div><span style={{ fontSize: '9px', fontWeight: 600, color: r.format === 'PDF' ? RED : r.format === 'Excel' ? GREEN : BLUE, background: (r.format === 'PDF' ? RED : r.format === 'Excel' ? GREEN : BLUE) + '12', padding: '2px 6px', borderRadius: '4px' }}>{r.format}</span></div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{r.recipients} users</div>
              <div><span style={{ fontSize: '9px', fontWeight: 600, color: r.status === 'active' ? GREEN : AMBER, background: (r.status === 'active' ? GREEN : AMBER) + '15', padding: '2px 6px', borderRadius: '10px' }}>{r.status}</span></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recently Generated Reports" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {recentReports.map((r, i) => {
            const typeColors = { Production: ACCENT, Ironmaking: RED, Steelmaking: BLUE, Energy: AMBER, Quality: GREEN, Maintenance: '#f97316', Compliance: '#06b6d4' }
            const tc = typeColors[r.type] || '#94a3b8'
            return (
              <div key={r.name} style={{ ...sty.card, animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.05}s`, borderLeft: `3px solid ${tc}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: tc, background: `${tc}12`, padding: '2px 6px', borderRadius: '4px' }}>{r.type}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: r.format === 'PDF' ? RED : r.format === 'Excel' ? GREEN : BLUE, background: (r.format === 'PDF' ? RED : r.format === 'Excel' ? GREEN : BLUE) + '12', padding: '2px 6px', borderRadius: '4px' }}>{r.format}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.4', marginBottom: '8px' }}>{r.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8' }}>
                  <span>{r.generatedAt}</span>
                  <span>{r.size}</span>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', background: 'none', border: `1px solid ${ACCENT}30`, borderRadius: '6px', padding: '5px 10px', fontSize: '10px', color: ACCENT, cursor: 'pointer', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
                  <DownloadIcon /> Download
                </button>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Report Builder — Create Custom Report" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>
        <div style={{ ...sty.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${ACCENT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>AI-Powered Report Builder</div>
          <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '480px', margin: '0 auto 18px', lineHeight: '1.6' }}>
            Select data sources, KPIs, time range, and AI narrative style. Reports auto-generated by iFactory-Report-LLM-7B with charts, trends, and recommendations.
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ New Report</button>
            <button style={{ background: '#fff', color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Schedule Report</button>
          </div>
        </div>
      </Section>
    </>
  )
}

// ═══ REAL-TIME DATA ANALYTICS TAB ═══
function RealTimeTab() {
  return (
    <>
      {/* Live Counter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '16px 24px', display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}><LiveCounter base={4821520} increment={18} interval={2000} color={ACCENT} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Events Processed Today</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={142850} increment={3} interval={3000} color={GREEN} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>AI Predictions Today</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={18420} increment={2} interval={4000} color={BLUE} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Reports Generated</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={2847} increment={1} interval={5000} color={AMBER} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Anomalies Detected</div></div>
      </div>

      <Section title="Data Pipelines — Real-Time Ingestion" icon={<StreamIcon />}>
        <div style={sty.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.5fr 0.6fr 0.7fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
            {['Pipeline', 'Source', 'Events/min', 'Lag', 'Status', 'Last Event'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
          </div>
          {dataPipelines.map((p, i) => {
            const statusColor = p.status === 'healthy' ? GREEN : p.status === 'warning' ? AMBER : RED
            return (
              <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.5fr 0.6fr 0.7fr', gap: '8px', padding: '12px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '3px', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.04}s` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{p.source}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>{p.eventsPerMin.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{p.lag}</div>
                <div><span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 6px', borderRadius: '10px' }}>{p.status}</span></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{p.lastEvent}</div>
              </div>
            )
          })}
        </div>
        <div style={{ ...sty.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
          <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Events/min</span><span style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}> {dataPipelines.reduce((s, p) => s + p.eventsPerMin, 0).toLocaleString()}</span></div>
          <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Avg Lag</span><span style={{ fontSize: '13px', fontWeight: 700, color: GREEN }}> 1.7ms</span></div>
          <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Pipelines Healthy</span><span style={{ fontSize: '13px', fontWeight: 700, color: GREEN }}> 8/8</span></div>
          <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Data Retention</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> 5 years</span></div>
        </div>
      </Section>

      <Section title="Predictive Analytics Models — Performance" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {analyticsModels.map((m, i) => (
            <div key={m.name} style={{ ...sty.card, animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.06}s`, borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{m.name}</div>
              <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 500, marginBottom: '8px' }}>{m.type}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <svg width="60" height="60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle cx="30" cy="30" r="24" fill="none" stroke={m.color} strokeWidth="5" strokeDasharray={`${(m.accuracyNum / 100) * 150.8} 150.8`} strokeLinecap="round" transform="rotate(-90 30 30)" />
                  <text x="30" y="33" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1e293b">{m.accuracy}</text>
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                <span>{m.predictions.toLocaleString()} pred</span>
                <span>{m.lastRetrained}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Anomaly Score — Last 24 Hours" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}>
        <div style={sty.card}>
          <div style={{ position: 'relative', height: '140px', padding: '0 4px' }}>
            {/* Threshold line */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${100 - (anomalyThreshold / 60) * 100}%`, height: '1px', background: RED, opacity: 0.4 }}>
              <span style={{ position: 'absolute', right: 0, top: '-14px', fontSize: '9px', color: RED, fontWeight: 600 }}>Threshold: {anomalyThreshold}</span>
            </div>
            {/* Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%' }}>
              {anomalyData.map((v, i) => {
                const isAbove = v >= anomalyThreshold
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '7px', fontWeight: 600, color: isAbove ? RED : '#94a3b8' }}>{v}</span>
                    <div style={{ width: '100%', height: `${(v / 60) * 100}%`, background: isAbove ? RED : ACCENT, borderRadius: '3px 3px 1px 1px', opacity: isAbove ? 1 : 0.6, transition: 'height 0.6s ease' }} />
                    <span style={{ fontSize: '7px', color: '#94a3b8' }}>{`${i}:00`}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Anomalies Detected</span><span style={{ fontSize: '13px', fontWeight: 700, color: RED }}> {anomalyData.filter(v => v >= anomalyThreshold).length}</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Peak Score</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> {Math.max(...anomalyData)}</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Avg Score</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> {Math.round(anomalyData.reduce((a, b) => a + b) / anomalyData.length)}</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Sources</span><span style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}> BF, HSM, BOF</span></div>
          </div>
        </div>
      </Section>

      {/* AI Footer */}
      <div style={{ display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Analytics Engine — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            10 report templates auto-generated by iFactory-Report-LLM-7B. 8 real-time data pipelines ingesting 78,920 events/min from 4,128 sensors.
            8 predictive analytics models with avg 96.4% accuracy. Anomaly detection engine monitoring 24/7 across BF, BOF, Caster, and HSM.
            Reports served to 14 user groups. All data stored on-premise with 5-year retention. API: 142 endpoints, 99.6% uptime.
          </div>
        </div>
      </div>
    </>
  )
}

const sty = {
  page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  section: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
}
