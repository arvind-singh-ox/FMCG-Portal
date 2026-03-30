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
  { label: 'Total Assets Monitored', value: '186', suffix: '', trend: +2.1, color: BLUE, sparkData: [172,175,178,180,182,184,185,186] },
  { label: 'Critical Assets', value: '24', suffix: '', trend: 0, color: ACCENT, sparkData: [24,24,24,24,24,24,24,24] },
  { label: 'Health Index (avg)', value: '94.2', suffix: '%', trend: +1.4, color: GREEN, sparkData: [91.5,92.0,92.6,93.1,93.5,93.8,94.0,94.2] },
  { label: 'MTBF (plant avg)', value: '2,840', suffix: ' hrs', trend: +5.2, color: CYAN, sparkData: [2520,2580,2640,2700,2740,2780,2810,2840] },
  { label: 'Predicted Failures', value: '3', suffix: '', trend: -25.0, color: AMBER, sparkData: [6,5,5,4,4,3,3,3] },
  { label: 'Assets at Risk', value: '5', suffix: '', trend: -16.7, color: RED, sparkData: [8,7,7,6,6,5,5,5] },
]

const criticalAssets = [
  { id: 'KLN-01', name: 'Rotary Kiln', health: 94.2, opHours: 48200, nextPM: '12 days', vibration: '3.2 mm/s', temp: '285°C (shell)', status: 'normal', mtbf: 4200 },
  { id: 'GBX-01', name: 'Kiln Gearbox (Flender)', health: 87.5, opHours: 42800, nextPM: '5 days', vibration: '4.8 mm/s', temp: '72°C (oil)', status: 'watch', mtbf: 3800 },
  { id: 'VRM-01', name: 'Raw Mill (Loesche VRM)', health: 91.8, opHours: 36500, nextPM: '18 days', vibration: '5.1 mm/s', temp: '92°C (bearing)', status: 'watch', mtbf: 3200 },
  { id: 'BML-01', name: 'Cement Ball Mill', health: 88.5, opHours: 52100, nextPM: '8 days', vibration: '2.8 mm/s', temp: '118°C (discharge)', status: 'normal', mtbf: 2800 },
  { id: 'PHF-01', name: 'PH Fan (ID Fan)', health: 96.1, opHours: 28400, nextPM: '22 days', vibration: '2.1 mm/s', temp: '68°C (bearing)', status: 'normal', mtbf: 5200 },
  { id: 'CML-01', name: 'Coal Mill (Vertical)', health: 93.4, opHours: 31200, nextPM: '15 days', vibration: '3.5 mm/s', temp: '76°C', status: 'normal', mtbf: 3600 },
  { id: 'CLR-01', name: 'Clinker Cooler (Grate)', health: 95.6, opHours: 44800, nextPM: '20 days', vibration: '1.8 mm/s', temp: '245°C (exit air)', status: 'normal', mtbf: 4800 },
  { id: 'BGF-01', name: 'Bag Filter (Pulse Jet)', health: 92.0, opHours: 22600, nextPM: '10 days', vibration: 'N/A', temp: '135°C (inlet)', status: 'normal', mtbf: 6200 },
]

const anomalies = [
  { time: '12 min ago', severity: 'critical', equipment: 'Kiln Support Roller #3', model: 'LSTM Vibration Predictor', desc: 'Bearing inner-race defect frequency detected at 142 Hz. RMS velocity trending from 3.2 to 4.8 mm/s over 48 hrs. Predicted to reach alarm threshold (6.5 mm/s) in ~72 hrs.', confidence: 96, action: 'Schedule bearing inspection during next planned stop' },
  { time: '28 min ago', severity: 'warning', equipment: 'Kiln Gearbox (Flender KMPS)', model: 'Acoustic Emission Classifier', desc: 'AE burst at 285 kHz with 78 dB energy — matches gear tooth micro-crack signature. Oil analysis shows Fe content rising (42 → 58 ppm in 2 weeks).', confidence: 91, action: 'Send oil sample to lab, inspect gear teeth via borescope' },
  { time: '45 min ago', severity: 'warning', equipment: 'Raw Mill Roller #2', model: 'Wear Rate Estimator (DEM)', desc: 'Grinding pressure signature indicates 8mm wear on roller surface (total worn: 32mm of 80mm available). Power draw increased 3.2% — consistent with wear model prediction.', confidence: 89, action: 'Plan roller surfacing in next shutdown (est. 4 days)' },
  { time: '1.2 hr ago', severity: 'warning', equipment: 'Cement Mill Chamber 2', model: 'Mill Power Signature Analyzer', desc: 'Specific energy consumption increased from 26.8 to 28.4 kWh/MT over 72 hrs. Grinding media charge estimated at 91% — below optimal 100%.', confidence: 92, action: 'Add 12 MT of 60mm grinding balls to Chamber 2' },
  { time: '1.8 hr ago', severity: 'info', equipment: 'Preheater Cyclone 4', model: 'Physics-Informed Neural Net', desc: 'Differential pressure increased 18% over 6 hrs. Correlates with raw meal moisture increase (1.2% → 1.8%). Buildup risk score: 62/100 (threshold: 75).', confidence: 85, action: 'Monitor pressure; check raw meal moisture control' },
  { time: '2.5 hr ago', severity: 'info', equipment: 'Coal Mill Outlet Temperature', model: 'Thermal Drift Detector', desc: 'Outlet temp drifting upward: 76°C → 82°C over 4 hrs. Hot gas damper position unchanged. Possible classifier seal leakage allowing hot gas bypass.', confidence: 82, action: 'Inspect classifier seal during next opportunity stop' },
  { time: '3 hr ago', severity: 'info', equipment: 'Cooler Grate Plate #17', model: 'IR + Wear Correlation Model', desc: 'Thermal imaging shows 15°C higher surface temp than adjacent plates. Estimated remaining thickness: 4mm (original: 12mm). Predicted life: ~30 days.', confidence: 80, action: 'Order replacement plate, schedule during next stop' },
  { time: '4 hr ago', severity: 'info', equipment: 'Bag Filter — Compartment 5', model: 'Differential Pressure Analyzer', desc: 'DP across compartment 5 is 12% higher than others (148 vs avg 132 mmWC). 8 of 288 bags may be damaged/clogged. No dust emission increase yet.', confidence: 78, action: 'Inspect bags in compartment 5 during next outage' },
]

const vibrationPoints = [
  { location: 'Kiln Support Roller #1 — DE', sensor: 'IMI 622B01', rms: 2.8, threshold: 6.5, freq: '118 Hz', condition: 'good', lastInspection: '05 Mar 2026', trend: [2.5,2.6,2.7,2.7,2.8,2.8,2.8,2.8] },
  { location: 'Kiln Support Roller #2 — NDE', sensor: 'IMI 622B01', rms: 3.1, threshold: 6.5, freq: '124 Hz', condition: 'good', lastInspection: '05 Mar 2026', trend: [2.8,2.9,3.0,3.0,3.1,3.1,3.1,3.1] },
  { location: 'Kiln Support Roller #3 — DE', sensor: 'IMI 622B01', rms: 4.8, threshold: 6.5, freq: '142 Hz', condition: 'alarm', lastInspection: '05 Mar 2026', trend: [3.2,3.5,3.8,4.0,4.2,4.4,4.6,4.8] },
  { location: 'Kiln Gearbox — Input Shaft', sensor: 'SKF CMSS 2200', rms: 3.5, threshold: 5.0, freq: '285 Hz', condition: 'watch', lastInspection: '01 Mar 2026', trend: [2.8,2.9,3.0,3.1,3.2,3.3,3.4,3.5] },
  { location: 'Raw Mill Main Drive — DE', sensor: 'B&K 4533-B', rms: 5.1, threshold: 7.0, freq: '48 Hz', condition: 'watch', lastInspection: '28 Feb 2026', trend: [4.2,4.4,4.5,4.7,4.8,4.9,5.0,5.1] },
  { location: 'Raw Mill Separator Motor', sensor: 'IMI 622B01', rms: 2.2, threshold: 5.0, freq: '85 Hz', condition: 'good', lastInspection: '28 Feb 2026', trend: [2.1,2.1,2.2,2.2,2.2,2.2,2.2,2.2] },
  { location: 'Cement Mill Main Drive — DE', sensor: 'SKF CMSS 2200', rms: 2.8, threshold: 6.0, freq: '24 Hz', condition: 'good', lastInspection: '25 Feb 2026', trend: [2.6,2.7,2.7,2.7,2.8,2.8,2.8,2.8] },
  { location: 'Cement Mill Separator', sensor: 'B&K 4533-B', rms: 1.9, threshold: 4.5, freq: '62 Hz', condition: 'good', lastInspection: '25 Feb 2026', trend: [1.8,1.8,1.9,1.9,1.9,1.9,1.9,1.9] },
  { location: 'PH ID Fan — DE Bearing', sensor: 'IMI 622B01', rms: 2.1, threshold: 5.5, freq: '25 Hz', condition: 'good', lastInspection: '20 Feb 2026', trend: [2.0,2.0,2.0,2.1,2.1,2.1,2.1,2.1] },
  { location: 'Coal Mill Drive — DE', sensor: 'SKF CMSS 2200', rms: 3.5, threshold: 5.5, freq: '32 Hz', condition: 'good', lastInspection: '22 Feb 2026', trend: [3.3,3.3,3.4,3.4,3.5,3.5,3.5,3.5] },
]

const thermalPoints = [
  { location: 'Kiln Shell — Zone 1 (Burning)', current: 312, threshold: 350, trendDir: 'up', camera: 'FLIR A700 #1', status: 'warning' },
  { location: 'Kiln Shell — Zone 2 (Transition)', current: 285, threshold: 320, trendDir: 'stable', camera: 'FLIR A700 #1', status: 'normal' },
  { location: 'Kiln Shell — Zone 3 (Calcining)', current: 248, threshold: 300, trendDir: 'stable', camera: 'FLIR A700 #2', status: 'normal' },
  { location: 'Kiln Shell — Zone 4 (Preheating)', current: 195, threshold: 260, trendDir: 'stable', camera: 'FLIR A700 #2', status: 'normal' },
  { location: 'Raw Mill Motor — DE Bearing', current: 92, threshold: 110, trendDir: 'up', camera: 'Spot check', status: 'watch' },
  { location: 'Cement Mill Motor — DE Bearing', current: 78, threshold: 100, trendDir: 'stable', camera: 'Spot check', status: 'normal' },
  { location: 'MCC Panel Room (avg)', current: 38, threshold: 55, trendDir: 'stable', camera: 'FLIR E8-XT', status: 'normal' },
  { location: 'Kiln Gearbox Oil', current: 72, threshold: 85, trendDir: 'up', camera: 'RTD sensor', status: 'watch' },
]

const lifecycle = [
  { id: 'KLN-01', name: 'Rotary Kiln Shell', installed: 'Jan 2012', lifeYears: 30, usedYears: 14, remainPct: 53, replaceCost: '18.5 Cr', condition: 94 },
  { id: 'GBX-01', name: 'Kiln Gearbox (Flender)', installed: 'Mar 2015', lifeYears: 20, usedYears: 11, remainPct: 45, replaceCost: '4.2 Cr', condition: 87 },
  { id: 'VRM-01', name: 'Raw Mill Grinding Table', installed: 'Jun 2018', lifeYears: 12, usedYears: 8, remainPct: 33, replaceCost: '2.8 Cr', condition: 91 },
  { id: 'BML-01', name: 'Cement Mill Shell + Liners', installed: 'Sep 2010', lifeYears: 25, usedYears: 16, remainPct: 36, replaceCost: '6.5 Cr', condition: 88 },
  { id: 'PHF-01', name: 'PH Fan Impeller', installed: 'Apr 2021', lifeYears: 8, usedYears: 5, remainPct: 37, replaceCost: '0.85 Cr', condition: 96 },
  { id: 'CML-01', name: 'Coal Mill Grinding Elements', installed: 'Nov 2020', lifeYears: 6, usedYears: 5, remainPct: 17, replaceCost: '1.2 Cr', condition: 93 },
  { id: 'CLR-01', name: 'Cooler Grate Plates (set)', installed: 'Aug 2023', lifeYears: 5, usedYears: 3, remainPct: 40, replaceCost: '1.8 Cr', condition: 95 },
  { id: 'BGF-01', name: 'Bag Filter Bags (full set)', installed: 'Feb 2024', lifeYears: 4, usedYears: 2, remainPct: 50, replaceCost: '0.65 Cr', condition: 92 },
]

const TABS = [
  { key: 'overview', label: 'Asset Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></svg> },
  { key: 'anomaly', label: 'Anomaly Detection', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg> },
  { key: 'vibration', label: 'Vibration Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { key: 'thermal', label: 'Thermal Monitoring', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg> },
  { key: 'lifecycle', label: 'Asset Lifecycle', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg> },
]

function AssetHealth({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" /></svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Critical Asset Health</h1>
            <p style={sty.pageSub}>Real-time equipment health monitoring, AI anomaly detection, vibration & thermal analysis, asset lifecycle tracking</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> 186 Assets Monitored</span>
          <span style={{ ...sty.liveBadge, background: '#fef2f2', color: RED, borderColor: '#fecaca' }}><span style={{ ...sty.liveDot, background: RED, animation: 'pulse 1.5s infinite' }} /> 3 Anomalies</span>
        </div>
      </div>
      <div style={sty.tabs}>
        {TABS.map(t => <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>)}
      </div>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'anomaly' && <AnomalyTab />}
      {activeTab === 'vibration' && <VibrationTab />}
      {activeTab === 'thermal' && <ThermalTab />}
      {activeTab === 'lifecycle' && <LifecycleTab />}
    </div>
  )
}

function OverviewTab() {
  return (
    <>
      <Section title="Asset Performance KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={sty.kpiGrid}>
          {kpis.map((k, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{k.label}</span>
                <span style={{ ...sty.trendBadge, color: k.trend <= 0 ? GREEN : k.trend > 3 ? AMBER : GREEN, background: k.trend <= 0 ? '#f0fdf4' : '#f0fdf4' }}>{k.trend > 0 ? '+' : ''}{k.trend}%</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}><AnimatedValue value={k.value} suffix={k.suffix} /></div>
              <AreaChart data={k.sparkData} color={k.color} height={35} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Critical Equipment Health" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {criticalAssets.map((a, i) => {
            const hc = a.health >= 95 ? GREEN : a.health >= 90 ? BLUE : a.health >= 85 ? AMBER : RED
            const sc = a.status === 'alarm' ? RED : a.status === 'watch' ? AMBER : GREEN
            return (
              <div key={i} style={{ ...sty.assetCard, borderLeft: `4px solid ${hc}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{a.id} | {a.opHours.toLocaleString()} operating hrs</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: hc }}>{a.health}%</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Health Score</div>
                  </div>
                </div>
                <ProgressBar value={a.health} color={hc} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Vibration', value: a.vibration },
                    { label: 'Temperature', value: a.temp },
                    { label: 'Next PM', value: a.nextPM },
                    { label: 'MTBF', value: `${a.mtbf.toLocaleString()} hrs` },
                  ].map((m, j) => (
                    <div key={j} style={{ background: '#f8fafc', borderRadius: '6px', padding: '4px 8px', border: '1px solid #f1f5f9', flex: '1 1 45%' }}>
                      <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ ...sty.statusPill, background: `${sc}15`, color: sc }}>{a.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

function AnomalyTab() {
  return (
    <Section title="AI-Detected Anomalies — Live Feed" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {anomalies.map((a, i) => {
          const sevColors = { critical: RED, warning: AMBER, info: BLUE }
          const c = sevColors[a.severity]
          return (
            <div key={i} style={{ ...sty.anomalyCard, borderLeft: `3px solid ${c}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ ...sty.statusPill, background: `${c}15`, color: c }}>{a.severity}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{a.equipment}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 600, marginBottom: '4px' }}>Model: {a.model}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6', marginBottom: '6px' }}>{a.desc}</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: <span style={{ fontWeight: 700, color: '#1e293b' }}>{a.confidence}%</span></span>
                    <ProgressBar value={a.confidence} color={ACCENT} height={4} />
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #f1f5f9', minWidth: '180px', marginLeft: '12px' }}>
                  <div style={{ fontSize: '9px', color: GREEN, fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Recommended Action</div>
                  <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.5' }}>{a.action}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function VibrationTab() {
  return (
    <Section title="Vibration Monitoring — All Critical Points" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {vibrationPoints.map((v, i) => {
          const pct = (v.rms / v.threshold) * 100
          const bc = v.condition === 'alarm' ? RED : v.condition === 'watch' ? AMBER : GREEN
          return (
            <div key={i} style={{ ...sty.vibRow, borderLeft: `3px solid ${bc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{v.location}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Sensor: {v.sensor} | Freq: {v.freq} | Last: {v.lastInspection}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ ...sty.statusPill, background: `${bc}15`, color: bc }}>{v.condition}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: bc }}>{v.rms}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>mm/s (limit: {v.threshold})</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={pct} color={bc} />
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', textAlign: 'right' }}>{pct.toFixed(0)}% of threshold</div>
                </div>
                <div style={{ width: '140px' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', marginBottom: '2px' }}>48h TREND</div>
                  <AreaChart data={v.trend} color={bc} height={28} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function ThermalTab() {
  return (
    <Section title="Thermal Monitoring — IR Camera + Sensors" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>}>
      {/* Kiln Shell Heatmap */}
      <div style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Kiln Shell Temperature Profile (IR Camera)</h4>
        <div style={{ display: 'flex', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {[180,195,210,225,240,248,260,272,285,295,305,312,308,298,285,270,255,240,225,210,195,185,175].map((t, i) => {
            const ratio = (t - 170) / 150
            const c = ratio > 0.85 ? RED : ratio > 0.65 ? '#f97316' : ratio > 0.45 ? AMBER : ratio > 0.25 ? '#84cc16' : GREEN
            return <div key={i} style={{ flex: 1, background: c, opacity: 0.5 + ratio * 0.5 }} title={`${t}°C`} />
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
          <span>Feed End (0m)</span><span>Zone 4</span><span>Zone 3</span><span>Zone 2 (Hot Spot: 312°C)</span><span>Zone 1</span><span>Discharge (68m)</span>
        </div>
      </div>

      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Monitoring Point', 'Current Temp', 'Threshold', 'Trend', 'Camera / Sensor', 'Status'].map(h => <th key={h} style={sty.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {thermalPoints.map((t, i) => {
              const pct = (t.current / t.threshold) * 100
              const tc = t.status === 'warning' ? RED : t.status === 'watch' ? AMBER : GREEN
              const arrow = t.trendDir === 'up' ? '/' : t.trendDir === 'down' ? '\\' : '—'
              return (
                <tr key={i} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600 }}>{t.location}</span></td>
                  <td style={sty.td}><span style={{ fontSize: '14px', fontWeight: 700, color: tc }}>{t.current}°C</span></td>
                  <td style={sty.td}>{t.threshold}°C</td>
                  <td style={sty.td}><span style={{ fontSize: '14px', color: t.trendDir === 'up' ? RED : GREEN }}>{arrow}</span> {t.trendDir}</td>
                  <td style={sty.td}><span style={{ fontSize: '11px', color: '#64748b' }}>{t.camera}</span></td>
                  <td style={sty.td}><span style={{ ...sty.statusPill, background: `${tc}15`, color: tc }}>{t.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function LifecycleTab() {
  const totalValue = lifecycle.reduce((s, a) => s + parseFloat(a.replaceCost), 0)
  return (
    <Section title="Asset Lifecycle & Replacement Planning" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Replacement Value', value: `${totalValue.toFixed(1)} Cr`, color: ACCENT },
          { label: 'Avg Remaining Life', value: '39%', color: AMBER },
          { label: 'Assets Nearing EOL (<20%)', value: '1', color: RED },
          { label: 'Next Major Replacement', value: 'Coal Mill (17%)', color: AMBER },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}><div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div><div style={{ fontSize: '18px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div></div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {lifecycle.map((a, i) => {
          const lc = a.remainPct > 40 ? GREEN : a.remainPct > 20 ? AMBER : RED
          return (
            <div key={i} style={{ ...sty.lifecycleCard, borderLeft: `3px solid ${lc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{a.id} | Installed: {a.installed}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: lc }}>{a.remainPct}%</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>remaining</div>
                </div>
              </div>
              <ProgressBar value={100 - a.remainPct} max={100} color={lc} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                <span>Life: {a.usedYears}/{a.lifeYears} yrs</span>
                <span>Condition: <span style={{ fontWeight: 600, color: a.condition >= 90 ? GREEN : AMBER }}>{a.condition}%</span></span>
                <span>Replace: <span style={{ fontWeight: 600, color: '#1e293b' }}>{a.replaceCost}</span></span>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
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
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.7s ease both' },
  trendBadge: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' },
  assetCard: { background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  anomalyCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  vibRow: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  lifecycleCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
}

export default AssetHealth
