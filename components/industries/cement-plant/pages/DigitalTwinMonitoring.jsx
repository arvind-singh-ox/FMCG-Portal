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

// ─── Gauge Chart ───
function GaugeChart({ value, min = 0, max = 100, unit = '', label, zones }) {
  const size = 120, cx = size / 2, cy = size / 2 + 5, r = 45
  const startAngle = Math.PI
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
          const x1g = cx + r * Math.cos(a1), y1g = cy - r * Math.sin(a1)
          const x2g = cx + r * Math.cos(a2), y2g = cy - r * Math.sin(a2)
          return <path key={i} d={`M ${x1g} ${y1g} A ${r} ${r} 0 0 1 ${x2g} ${y2g}`} fill="none" stroke={z.color} strokeWidth="8" strokeLinecap="round" opacity="0.3" />
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

const twinKPIs = [
  { label: 'Model Sync Accuracy', value: '99.7', suffix: '%', trend: +0.2, color: '#10b981', sparkData: [99.1, 99.3, 99.4, 99.5, 99.6, 99.6, 99.7, 99.7] },
  { label: 'Sensor Data Streams', value: '2,847', suffix: '', trend: +1.8, color: '#3b82f6', sparkData: [2780, 2795, 2810, 2820, 2830, 2835, 2840, 2847] },
  { label: 'Prediction Accuracy', value: '96.4', suffix: '%', trend: +2.1, color: '#8b5cf6', sparkData: [93.8, 94.2, 94.8, 95.1, 95.6, 95.9, 96.2, 96.4] },
  { label: 'Simulation Latency', value: '1.2', suffix: ' ms', trend: -12.4, color: '#06b6d4', sparkData: [1.8, 1.6, 1.5, 1.4, 1.3, 1.3, 1.2, 1.2] },
  { label: 'What-If Scenarios Run', value: '1,248', suffix: '', trend: +18.5, color: '#f59e0b', sparkData: [820, 890, 960, 1020, 1080, 1140, 1190, 1248] },
  { label: 'Anomalies Predicted', value: '34', suffix: '', trend: +8.2, color: '#ef4444', sparkData: [22, 24, 26, 28, 29, 31, 33, 34] },
]

const plantAssets = [
  {
    id: 'KILN-01', name: 'Rotary Kiln', zone: 'Pyro Processing',
    sensors: 128, health: 94.2, temp: 1420, rpm: 3.8, load: 87,
    physics: { heatTransfer: 'CFD Navier-Stokes', refractory: 'Thermal FEM', coating: 'Phase-Change Model' },
    predictions: [
      { label: 'Shell Hot Spot (Zone 4)', time: '~18 hrs', confidence: 92, severity: 'high' },
      { label: 'Girth Gear Tooth Wear', time: '~45 days', confidence: 88, severity: 'medium' },
    ],
  },
  {
    id: 'PH-01', name: 'Preheater Tower', zone: 'Pyro Processing',
    sensors: 86, health: 97.1, temp: 870, rpm: 0, load: 82,
    physics: { gasFlow: 'k-epsilon Turbulence', cyclone: 'Euler-Lagrange Particle', thermal: 'Conjugate Heat Transfer' },
    predictions: [
      { label: 'Cyclone 4 Buildup Risk', time: '~72 hrs', confidence: 85, severity: 'medium' },
    ],
  },
  {
    id: 'RM-01', name: 'Raw Mill (VRM)', zone: 'Raw Grinding',
    sensors: 64, health: 91.8, temp: 92, rpm: 28, load: 85,
    physics: { grinding: 'DEM Particle Simulation', classifier: 'CFD Air Classification', vibration: 'Modal Harmonic Analysis' },
    predictions: [
      { label: 'Roller Wear Limit', time: '~60 days', confidence: 91, severity: 'medium' },
      { label: 'Louvre Ring Blockage', time: '~96 hrs', confidence: 78, severity: 'low' },
    ],
  },
  {
    id: 'CM-01', name: 'Cement Mill (Ball Mill)', zone: 'Finish Grinding',
    sensors: 52, health: 88.5, temp: 118, rpm: 15.2, load: 89,
    physics: { grinding: 'DEM Ball Trajectory', separator: 'Rosin-Rammler PSD', thermal: 'Heat Generation Model' },
    predictions: [
      { label: 'Diaphragm Slot Blockage', time: '~5 days', confidence: 86, severity: 'medium' },
      { label: 'Bearing Temp Rise', time: '~36 hrs', confidence: 94, severity: 'high' },
    ],
  },
  {
    id: 'CLR-01', name: 'Clinker Cooler', zone: 'Pyro Processing',
    sensors: 48, health: 95.6, temp: 245, rpm: 0, load: 78,
    physics: { heatExchange: 'Packed Bed Model', grate: 'Discrete Plate Dynamics', airFlow: 'Cross-Flow CFD' },
    predictions: [
      { label: 'Grate Plate #17 Wear', time: '~30 days', confidence: 82, severity: 'low' },
    ],
  },
  {
    id: 'CS-01', name: 'Coal Mill System', zone: 'Fuel Preparation',
    sensors: 38, health: 93.4, temp: 76, rpm: 22, load: 74,
    physics: { grinding: 'Population Balance Model', drying: 'Moisture Transport PDE', explosion: 'Dust Cloud LEL Model' },
    predictions: [
      { label: 'Classifier Blade Erosion', time: '~40 days', confidence: 80, severity: 'low' },
    ],
  },
]

const scenarioHistory = [
  { id: 'SC-1082', name: 'Increase kiln feed to 340 TPH', type: 'throughput', result: 'Feasible — clinker quality maintained if coal feed +4%', impact: '+6.2% production', status: 'approved', confidence: 94 },
  { id: 'SC-1081', name: 'Switch to 70:30 coal:petcoke ratio', type: 'fuel', result: 'Caution — NOx spike predicted at Zone 3 exit', impact: '-2.1% fuel cost', status: 'review', confidence: 87 },
  { id: 'SC-1080', name: 'Reduce PH fan speed by 3%', type: 'energy', result: 'Safe — kiln draft maintained, saves 95 kW', impact: '-1.8 kWh/MT', status: 'applied', confidence: 92 },
  { id: 'SC-1079', name: 'Delay raw mill maintenance by 7 days', type: 'maintenance', result: 'Risky — roller wear exceeds safe threshold by Day 5', impact: 'Potential 8hr unplanned stop', status: 'rejected', confidence: 89 },
  { id: 'SC-1078', name: 'Increase AFR substitution to 15%', type: 'fuel', result: 'Feasible — gradual ramp over 48hrs recommended', impact: '-0.4 Cr/month', status: 'approved', confidence: 91 },
  { id: 'SC-1077', name: 'Run cement mill at 95% load for 6hrs', type: 'throughput', result: 'Warning — bearing temp predicted to exceed 95°C at hour 4', impact: '+12% output short-term', status: 'rejected', confidence: 96 },
]

const physicsModels = [
  { name: 'Kiln Thermal CFD', engine: 'OpenFOAM + Custom Solver', meshElements: '4.2M', computeTime: '0.8s/step', gpu: 'NVIDIA A100', accuracy: '98.2%', status: 'running' },
  { name: 'Raw Mill DEM', engine: 'LIGGGHTS + GPU Acc.', meshElements: '12M particles', computeTime: '1.4s/step', gpu: 'NVIDIA A100', accuracy: '96.8%', status: 'running' },
  { name: 'Preheater Gas Flow', engine: 'Fluent UDF + k-epsilon', meshElements: '2.8M', computeTime: '0.6s/step', gpu: 'NVIDIA A100', accuracy: '97.1%', status: 'running' },
  { name: 'Clinker Cooler HX', engine: 'Custom Packed Bed', meshElements: '1.1M', computeTime: '0.3s/step', gpu: 'RTX 4090', accuracy: '95.4%', status: 'running' },
  { name: 'Cement Mill PSD', engine: 'Population Balance + DEM', meshElements: '8M particles', computeTime: '2.1s/step', gpu: 'NVIDIA A100', accuracy: '94.6%', status: 'running' },
  { name: 'Full Plant Thermal', engine: 'Modelica + FMI Co-sim', meshElements: '850 nodes', computeTime: '0.1s/step', gpu: 'CPU (128-core)', accuracy: '93.8%', status: 'running' },
]

const aiModels = [
  { name: 'Predictive Failure Engine', type: 'LSTM + Attention + Physics-Informed', params: '24M', inference: '3.2ms', accuracy: '96.4%', desc: 'Predicts equipment failures 6-72hrs ahead by combining sensor time-series with physics residuals' },
  { name: 'Process Optimizer', type: 'Multi-Objective RL (PPO)', params: '18M', inference: '8.5ms', accuracy: '94.1%', desc: 'Optimizes kiln feed, fuel mix, fan speeds simultaneously for min energy + max quality' },
  { name: 'Anomaly Detector', type: 'Variational Autoencoder + Isolation Forest', params: '8M', inference: '1.1ms', accuracy: '97.8%', desc: 'Detects subtle process deviations using unsupervised learning on 2,847 sensor streams' },
  { name: 'Quality Predictor', type: 'Graph Neural Network', params: '12M', inference: '4.7ms', accuracy: '95.2%', desc: 'Predicts clinker/cement quality (C3S, LSF, Blaine) from raw mix + kiln parameters' },
  { name: 'Digital Twin Calibrator', type: 'Bayesian Optimization + EnKF', params: '6M', inference: '15ms', accuracy: '99.1%', desc: 'Auto-calibrates physics models against live sensor data using Ensemble Kalman Filter' },
  { name: 'Scenario Evaluator', type: 'Monte Carlo Tree Search + Surrogate', params: '32M', inference: '120ms', accuracy: '92.8%', desc: 'Evaluates what-if scenarios using surrogate models trained on physics simulation results' },
]

const sensorNetwork = [
  { zone: 'Kiln Zone', count: 128, types: 'Thermocouple, Shell Scanner IR, Vibration, Load Cell, Pyrometer', protocol: 'OPC-UA + Modbus TCP', latency: '50ms', health: 99.2 },
  { zone: 'Preheater', count: 86, types: 'Thermocouple, Pressure Transmitter, Gas Analyzer (O2/CO/NOx)', protocol: 'OPC-UA', latency: '45ms', health: 98.8 },
  { zone: 'Raw Mill', count: 64, types: 'Vibration (triaxial), Acoustic Emission, Temperature, Power Meter', protocol: 'OPC-UA + MQTT', latency: '30ms', health: 97.5 },
  { zone: 'Cement Mill', count: 52, types: 'Vibration, Temperature, Sound Level, PSD Analyzer (laser)', protocol: 'OPC-UA', latency: '35ms', health: 96.8 },
  { zone: 'Clinker Cooler', count: 48, types: 'IR Camera, Thermocouple Array, Air Flow, Undergrate Pressure', protocol: 'Modbus TCP + MQTT', latency: '40ms', health: 99.0 },
  { zone: 'Fuel System', count: 38, types: 'Weigh Feeder, Moisture Probe, Calorimeter, Flow Meter', protocol: 'OPC-UA', latency: '25ms', health: 98.2 },
  { zone: 'Environmental', count: 28, types: 'CEMS (SO2/NOx/PM), Stack Flow, Opacity, Weather Station', protocol: 'Modbus RTU + OPC-UA', latency: '60ms', health: 97.9 },
  { zone: 'Electrical', count: 42, types: 'Power Analyzer, CT/PT, Harmonic Meter, PF Meter, Energy Meter', protocol: 'IEC 61850 + Modbus', latency: '20ms', health: 99.5 },
]

const TABS = [
  { key: 'overview', label: '3D Twin Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
  { key: 'assets', label: 'Asset Twins', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" /></svg> },
  { key: 'physics', label: 'Physics Engine', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> },
  { key: 'scenarios', label: 'What-If Scenarios', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { key: 'sensors', label: 'IoT Sensor Network', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg> },
  { key: 'ai', label: 'AI/ML Models', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg> },
  { key: 'infra', label: 'Compute Infrastructure', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg> },
]

// ─── MAIN ───
function DigitalTwinMonitoring() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes rotate3d { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes dataFlow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
      `}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Digital Twin Monitoring</h1>
            <p style={sty.pageSub}>Physics-based real-time simulation, predictive analytics, what-if scenarios & AI-driven process optimization</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ ...sty.liveBadge, background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}><span style={{ ...sty.liveDot, background: '#3b82f6' }} /> Twin Synced</span>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> 2,847 Sensors Live</span>
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
      {activeTab === 'assets' && <AssetsTab />}
      {activeTab === 'physics' && <PhysicsTab />}
      {activeTab === 'scenarios' && <ScenariosTab />}
      {activeTab === 'sensors' && <SensorsTab />}
      {activeTab === 'ai' && <AIModelsTab />}
      {activeTab === 'infra' && <InfraTab />}
    </div>
  )
}

// ─── OVERVIEW TAB ───
function OverviewTab() {
  return (
    <>
      <Section title="Digital Twin Performance KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={sty.kpiGrid}>
          {twinKPIs.map((kpi, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{kpi.label}</span>
                <span style={{ ...sty.trendBadge, color: kpi.label.includes('Latency') ? (kpi.trend < 0 ? '#16a34a' : '#ef4444') : (kpi.trend > 0 ? '#16a34a' : '#ef4444'), background: '#f0fdf4' }}>
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

      {/* Complete Plant Process Flow */}
      <Section title="Cement Plant Process Flow — Digital Twin" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}>
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e8ecf1 100%)', borderRadius: '12px', padding: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Grid background pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Overlay Stats */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px', zIndex: 2 }}>
            {[
              { label: 'Physics Models', value: '6 Active', color: '#605dba' },
              { label: 'Mesh Elements', value: '29.1M', color: '#3b82f6' },
              { label: 'Update Rate', value: '1.2ms', color: '#10b981' },
              { label: 'Sensors Online', value: '2,847', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '6px 12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Process Flow — Two Rows */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Row 1: Quarry → Crushing → Raw Material Storage → Raw Mill → Blending Silo → Preheater */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '10px' }}>
              {[
                { name: 'Limestone Quarry', temp: '', sensors: 12, color: '#78716c', icon: 'M4 20L12 4L20 20H4Z', health: 98 },
                null,
                { name: 'Crusher', temp: '', sensors: 18, color: '#a3a3a3', icon: 'M7 4H17L20 20H4L7 4Z', health: 96 },
                null,
                { name: 'Raw Material Store', temp: '28°C', sensors: 22, color: '#8b5cf6', icon: 'M3 10L12 3L21 10V20H3V10Z', health: 99 },
                null,
                { name: 'Raw Mill (VRM)', temp: '92°C', sensors: 64, color: '#a855f7', icon: 'M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2Z', health: 91.8 },
                null,
                { name: 'Blending Silo', temp: '55°C', sensors: 16, color: '#6366f1', icon: 'M8 2H16V20C16 21 15 22 12 22C9 22 8 21 8 20V2Z', health: 99.5 },
                null,
                { name: 'Preheater Tower', temp: '870°C', sensors: 86, color: '#ef4444', icon: 'M9 2H15V22H9V2Z', health: 97.1 },
              ].map((item, i) => {
                if (!item) return (
                  <svg key={`arr-${i}`} width="24" height="16" viewBox="0 0 24 16" fill="none" style={{ flexShrink: 0 }}>
                    <line x1="2" y1="8" x2="18" y2="8" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                    <polyline points="15 4 19 8 15 12" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                  </svg>
                )
                const healthColor = item.health >= 95 ? '#10b981' : item.health >= 90 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} style={{ background: '#fff', border: `1.5px solid ${item.color}30`, borderRadius: '10px', padding: '10px', minWidth: '110px', maxWidth: '130px', textAlign: 'center', position: 'relative', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '36px', height: '36px', margin: '0 auto 6px', borderRadius: '50%', background: `${item.color}15`, border: `1.5px solid ${item.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b', marginBottom: '2px', lineHeight: '1.2' }}>{item.name}</div>
                    {item.temp && <div style={{ fontSize: '9px', color: item.color, fontWeight: 700 }}>{item.temp}</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#64748b' }}>{item.sensors} sensors</span>
                      <span style={{ fontSize: '8px', color: healthColor, fontWeight: 600 }}>{item.health}%</span>
                    </div>
                    {/* Pulse indicator */}
                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: healthColor }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: healthColor, animation: 'pulse 2s infinite' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Connection line between rows (right side curving down) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '55px' }}>
              <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                <path d="M20 2 L20 26" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3">
                  <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1s" repeatCount="indefinite" />
                </path>
                <polyline points="16 20 20 26 24 20" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Row 2: Preheater(cont) → Kiln → Cooler → Clinker Silo → Cement Mill → Cement Silo → Packing → Dispatch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', direction: 'rtl' }}>
              {[
                { name: 'Rotary Kiln', temp: '1,420°C', sensors: 128, color: '#ef4444', icon: 'M2 12H22M2 12C2 8 4 6 6 6H18C20 6 22 8 22 12C22 16 20 18 18 18H6C4 18 2 16 2 12Z', health: 94.2 },
                null,
                { name: 'Clinker Cooler', temp: '245°C', sensors: 48, color: '#06b6d4', icon: 'M3 8H21V18H3V8ZM5 10V16M8 10V16M11 10V16M14 10V16M17 10V16', health: 95.6 },
                null,
                { name: 'Clinker Silo', temp: '82°C', sensors: 14, color: '#14b8a6', icon: 'M8 2H16V20C16 21 15 22 12 22C9 22 8 21 8 20V2Z', health: 99 },
                null,
                { name: 'Cement Mill', temp: '118°C', sensors: 52, color: '#f59e0b', icon: 'M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2Z', health: 88.5 },
                null,
                { name: 'Cement Silo', temp: '45°C', sensors: 18, color: '#3b82f6', icon: 'M8 2H16V20C16 21 15 22 12 22C9 22 8 21 8 20V2Z', health: 98 },
                null,
                { name: 'Packing Plant', temp: '', sensors: 24, color: '#16a34a', icon: 'M4 4H20V20H4V4ZM4 12H20M12 4V20', health: 96 },
                null,
                { name: 'Dispatch', temp: '', sensors: 8, color: '#84cc16', icon: 'M2 12L7 7V10H15V14H7V17L2 12ZM17 6H22V18H17', health: 99 },
              ].map((item, i) => {
                if (!item) return (
                  <svg key={`arr2-${i}`} width="24" height="16" viewBox="0 0 24 16" fill="none" style={{ flexShrink: 0, transform: 'scaleX(-1)' }}>
                    <line x1="2" y1="8" x2="18" y2="8" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                    <polyline points="15 4 19 8 15 12" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                  </svg>
                )
                const healthColor = item.health >= 95 ? '#10b981' : item.health >= 90 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} dir="ltr" style={{ background: '#fff', border: `1.5px solid ${item.color}30`, borderRadius: '10px', padding: '10px', minWidth: '110px', maxWidth: '130px', textAlign: 'center', position: 'relative', cursor: 'default', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '36px', height: '36px', margin: '0 auto 6px', borderRadius: '50%', background: `${item.color}15`, border: `1.5px solid ${item.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b', marginBottom: '2px', lineHeight: '1.2' }}>{item.name}</div>
                    {item.temp && <div style={{ fontSize: '9px', color: item.color, fontWeight: 700 }}>{item.temp}</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#64748b' }}>{item.sensors} sensors</span>
                      <span style={{ fontSize: '8px', color: healthColor, fontWeight: 600 }}>{item.health}%</span>
                    </div>
                    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: healthColor }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: healthColor, animation: 'pulse 2s infinite' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Supporting Systems Row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              {[
                { name: 'Coal Mill', sensors: 38, color: '#78716c', health: 93.4 },
                { name: 'WHR Power Plant', sensors: 22, color: '#06b6d4', health: 96 },
                { name: 'DG Set & Substation', sensors: 42, color: '#f59e0b', health: 99.5 },
                { name: 'CEMS / Stack', sensors: 28, color: '#10b981', health: 97.9 },
                { name: 'Water Treatment', sensors: 14, color: '#3b82f6', health: 98.2 },
                { name: 'Compressed Air', sensors: 10, color: '#94a3b8', health: 95 },
              ].map((sys, i) => {
                const hc = sys.health >= 95 ? '#10b981' : sys.health >= 90 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '95px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: sys.color }}>{sys.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>{sys.sensors} sensors</span>
                      <span style={{ fontSize: '8px', color: hc, fontWeight: 600 }}>{sys.health}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '10px', marginTop: '14px', position: 'relative', zIndex: 2 }}>
            Complete cement manufacturing process — 13 major units, 486 sub-systems, 2,847 IoT sensors | Powered by Three.js + WebGPU
          </div>
        </div>
      </Section>

      {/* Architecture */}
      <Section title="Digital Twin Architecture" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', padding: '16px 0' }}>
          {[
            { label: 'Physical Plant', sub: '2,847 Sensors', color: '#64748b' },
            { label: 'Edge Gateway', sub: 'NVIDIA Jetson', color: '#10b981' },
            { label: 'Data Lake', sub: 'TimescaleDB', color: '#3b82f6' },
            { label: 'Physics Engine', sub: 'OpenFOAM/DEM', color: '#8b5cf6' },
            { label: 'AI/ML Layer', sub: 'PyTorch + vLLM', color: '#f59e0b' },
            { label: 'Digital Twin', sub: 'Three.js + WebGPU', color: ACCENT },
            { label: 'Control Room', sub: 'React Dashboard', color: '#06b6d4' },
          ].map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ padding: '10px 14px', background: `${step.color}10`, border: `1px solid ${step.color}30`, borderRadius: '8px', textAlign: 'center', minWidth: '90px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: step.color }}>{step.label}</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{step.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <svg width="20" height="12" viewBox="0 0 24 14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="7" x2="18" y2="7" /><polyline points="14 3 18 7 14 11" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── ASSETS TAB ───
function AssetsTab() {
  const [selectedAsset, setSelectedAsset] = useState(null)
  return (
    <Section title="Asset Digital Twins" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>}>
      <div style={sty.grid2}>
        {plantAssets.map((asset) => {
          const healthColor = asset.health >= 95 ? '#10b981' : asset.health >= 90 ? '#f59e0b' : '#ef4444'
          const isSelected = selectedAsset === asset.id
          return (
            <div key={asset.id} style={{ ...sty.assetCard, borderColor: isSelected ? ACCENT : '#e8ecf1' }} onClick={() => setSelectedAsset(isSelected ? null : asset.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{asset.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{asset.id} | {asset.zone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: healthColor }}>{asset.health}%</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Health Score</div>
                </div>
              </div>
              <ProgressBar value={asset.health} color={healthColor} />

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                {asset.temp > 0 && (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    <span style={{ color: '#94a3b8' }}>Temp:</span> <span style={{ fontWeight: 600, color: asset.temp > 500 ? '#ef4444' : '#1e293b' }}>{asset.temp}°C</span>
                  </div>
                )}
                {asset.rpm > 0 && (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    <span style={{ color: '#94a3b8' }}>RPM:</span> <span style={{ fontWeight: 600 }}>{asset.rpm}</span>
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  <span style={{ color: '#94a3b8' }}>Load:</span> <span style={{ fontWeight: 600 }}>{asset.load}%</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  <span style={{ color: '#94a3b8' }}>Sensors:</span> <span style={{ fontWeight: 600 }}>{asset.sensors}</span>
                </div>
              </div>

              {/* Physics Models */}
              <div style={{ marginTop: '10px', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: ACCENT, marginBottom: '4px' }}>Physics Models</div>
                {Object.entries(asset.physics).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '2px 0' }}>
                    <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Predictions */}
              {asset.predictions.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>AI Predictions</div>
                  {asset.predictions.map((pred, pi) => {
                    const sevColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }
                    return (
                      <div key={pi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>
                        <span style={{ color: '#1e293b' }}>{pred.label}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>{pred.time}</span>
                          <span style={{ ...sty.statusPill, background: `${sevColors[pred.severity]}15`, color: sevColors[pred.severity], fontSize: '9px', padding: '1px 6px' }}>{pred.severity}</span>
                          <span style={{ color: '#94a3b8' }}>{pred.confidence}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── PHYSICS TAB ───
function PhysicsTab() {
  return (
    <Section title="Physics Simulation Engine" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Mesh Elements', value: '29.1M', color: '#3b82f6' },
          { label: 'Avg Compute Time', value: '0.92s/step', color: '#10b981' },
          { label: 'GPU Utilization', value: '78%', color: '#f59e0b' },
          { label: 'Model Accuracy', value: '96.0%', color: ACCENT },
        ].map((s, i) => (
          <div key={i} style={{ ...sty.summaryCard, flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Physics Models Table */}
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Model Name', 'Solver Engine', 'Mesh/Particles', 'Compute Time', 'GPU', 'Accuracy', 'Status'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {physicsModels.map((m, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{m.name}</span></td>
                <td style={sty.td}>{m.engine}</td>
                <td style={sty.td}>{m.meshElements}</td>
                <td style={sty.td}>{m.computeTime}</td>
                <td style={sty.td}>{m.gpu}</td>
                <td style={sty.td}><span style={{ fontWeight: 600, color: '#10b981' }}>{m.accuracy}</span></td>
                <td style={sty.td}>
                  <span style={{ ...sty.statusPill, background: '#10b98115', color: '#10b981' }}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simulation Methodology */}
      <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Simulation Methodology</h4>
        <div style={sty.grid3}>
          {[
            { name: 'CFD (Computational Fluid Dynamics)', desc: 'Navier-Stokes equations solved for gas/air flow in kiln, preheater cyclones, and cooler. RANS with k-epsilon turbulence closure.', icon: 'flow' },
            { name: 'DEM (Discrete Element Method)', desc: 'Particle-level simulation of raw meal in mills, clinker in cooler. Tracks individual particle collisions, trajectories, and breakage.', icon: 'particle' },
            { name: 'FEM (Finite Element Method)', desc: 'Structural stress analysis of kiln shell, thermal expansion modeling of refractory lining, modal analysis for vibration prediction.', icon: 'mesh' },
            { name: 'Thermodynamic Modeling', desc: 'Bogue equations for clinker phase prediction, enthalpy balance across pyro system, phase-change tracking for coating stability.', icon: 'thermo' },
            { name: 'Population Balance', desc: 'Particle size distribution evolution in mills. Breakage and selection functions calibrated from Bond work index tests.', icon: 'dist' },
            { name: 'Co-Simulation (FMI)', desc: 'Functional Mock-up Interface couples all sub-models into one full-plant digital twin. Modelica-based system-level orchestration.', icon: 'system' },
          ].map((m, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: ACCENT, marginBottom: '4px' }}>{m.name}</div>
              <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── SCENARIOS TAB ───
function ScenariosTab() {
  return (
    <Section title="What-If Scenario Analysis" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Scenarios Run (This Month)', value: '1,248', color: '#3b82f6' },
          { label: 'Approved & Applied', value: '312', color: '#10b981' },
          { label: 'Estimated Savings', value: '2.4 Cr/month', color: '#16a34a' },
          { label: 'Avg Confidence', value: '91.2%', color: ACCENT },
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
              {['ID', 'Scenario', 'Type', 'Simulation Result', 'Impact', 'Confidence', 'Status'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarioHistory.map((sc) => {
              const statusColors = { approved: '#10b981', applied: '#3b82f6', review: '#f59e0b', rejected: '#ef4444' }
              const typeColors = { throughput: '#3b82f6', fuel: '#f59e0b', energy: '#10b981', maintenance: '#8b5cf6' }
              return (
                <tr key={sc.id} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{sc.id}</span></td>
                  <td style={sty.td}><span style={{ fontWeight: 500 }}>{sc.name}</span></td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${typeColors[sc.type]}15`, color: typeColors[sc.type], fontSize: '10px' }}>{sc.type}</span>
                  </td>
                  <td style={{ ...sty.td, maxWidth: '220px', fontSize: '11px', color: '#64748b' }}>{sc.result}</td>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: sc.impact.includes('-') || sc.impact.includes('+') ? '#1e293b' : '#ef4444' }}>{sc.impact}</span></td>
                  <td style={sty.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ProgressBar value={sc.confidence} color={ACCENT} height={4} />
                      <span style={{ fontSize: '10px', color: '#64748b', minWidth: '28px' }}>{sc.confidence}%</span>
                    </div>
                  </td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[sc.status]}15`, color: statusColors[sc.status] }}>{sc.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ─── SENSORS TAB ───
function SensorsTab() {
  return (
    <Section title="IoT Sensor Network" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M5.12 19a7 7 0 0 1 0-14" /><path d="M18.88 5a7 7 0 0 1 0 14" /><circle cx="12" cy="12" r="3" /></svg>}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Sensors', value: '2,847', color: '#3b82f6' },
          { label: 'Online', value: '2,824 (99.2%)', color: '#10b981' },
          { label: 'Data Throughput', value: '1.2 GB/min', color: '#8b5cf6' },
          { label: 'Avg Latency', value: '38ms', color: '#06b6d4' },
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
              {['Zone', 'Sensors', 'Sensor Types', 'Protocol', 'Latency', 'Health'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensorNetwork.map((sn, i) => (
              <tr key={i} style={sty.tr}>
                <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{sn.zone}</span></td>
                <td style={sty.td}><span style={{ fontWeight: 700, color: '#1e293b' }}>{sn.count}</span></td>
                <td style={{ ...sty.td, fontSize: '10px', color: '#64748b', maxWidth: '240px' }}>{sn.types}</td>
                <td style={sty.td}><span style={{ fontSize: '10px' }}>{sn.protocol}</span></td>
                <td style={sty.td}>{sn.latency}</td>
                <td style={sty.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ProgressBar value={sn.health} color={sn.health >= 98 ? '#10b981' : '#f59e0b'} height={6} />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: sn.health >= 98 ? '#10b981' : '#f59e0b' }}>{sn.health}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Protocol Stack */}
      <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Industrial IoT Protocol Stack</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { name: 'OPC-UA', desc: 'Primary industrial protocol', color: '#3b82f6' },
            { name: 'Modbus TCP/RTU', desc: 'Legacy PLC integration', color: '#f59e0b' },
            { name: 'MQTT', desc: 'Lightweight telemetry', color: '#10b981' },
            { name: 'IEC 61850', desc: 'Electrical substation', color: '#8b5cf6' },
            { name: 'PROFINET', desc: 'Siemens PLC direct', color: '#06b6d4' },
            { name: 'EtherNet/IP', desc: 'Allen-Bradley devices', color: '#ef4444' },
          ].map((p, i) => (
            <div key={i} style={{ padding: '8px 14px', background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: '8px', minWidth: '120px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: p.color }}>{p.name}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── AI MODELS TAB ───
function AIModelsTab() {
  return (
    <Section title="AI/ML Models Powering the Digital Twin" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {aiModels.map((model, i) => (
          <div key={i} style={{ ...sty.aiModelCard, borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{model.name}</div>
                <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 600, marginTop: '2px' }}>{model.type}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Params</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>{model.params}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Inference</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{model.inference}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Accuracy</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>{model.accuracy}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>{model.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── INFRA TAB ───
function InfraTab() {
  return (
    <Section title="On-Premise Compute Infrastructure" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>}>
      <div style={sty.grid2}>
        {[
          {
            name: 'GPU Compute Cluster',
            specs: [
              { label: 'GPUs', value: '4x NVIDIA A100 80GB' },
              { label: 'VRAM Total', value: '320 GB HBM2e' },
              { label: 'Interconnect', value: 'NVLink 600 GB/s' },
              { label: 'Purpose', value: 'Physics simulation + AI inference' },
              { label: 'Utilization', value: '78%' },
            ],
            color: '#10b981', status: 'running',
          },
          {
            name: 'AI Inference Server',
            specs: [
              { label: 'GPUs', value: '2x NVIDIA L40S' },
              { label: 'VRAM Total', value: '96 GB' },
              { label: 'Framework', value: 'vLLM + TensorRT' },
              { label: 'Models Hosted', value: '6 active models' },
              { label: 'Throughput', value: '2,400 inferences/sec' },
            ],
            color: '#3b82f6', status: 'running',
          },
          {
            name: 'Time-Series Database',
            specs: [
              { label: 'Engine', value: 'TimescaleDB + InfluxDB' },
              { label: 'Storage', value: '48 TB NVMe RAID-10' },
              { label: 'Ingestion Rate', value: '1.2M points/sec' },
              { label: 'Retention', value: '5 years (tiered)' },
              { label: 'Query Latency', value: '< 5ms (p99)' },
            ],
            color: '#8b5cf6', status: 'running',
          },
          {
            name: 'Edge Computing Layer',
            specs: [
              { label: 'Devices', value: '12x NVIDIA Jetson AGX Orin' },
              { label: 'Placement', value: 'Per-zone (kiln, mill, etc.)' },
              { label: 'Processing', value: 'Real-time anomaly pre-filter' },
              { label: 'Latency', value: '< 10ms edge inference' },
              { label: 'Network', value: 'Industrial Ethernet (1 Gbps)' },
            ],
            color: '#f59e0b', status: 'running',
          },
          {
            name: 'Visualization Render Server',
            specs: [
              { label: 'GPU', value: '2x NVIDIA RTX 4090' },
              { label: 'Purpose', value: '3D twin rendering + streaming' },
              { label: 'Resolution', value: '4K @ 60fps WebRTC stream' },
              { label: 'Framework', value: 'Three.js + WebGPU backend' },
              { label: 'Clients', value: 'Up to 50 concurrent' },
            ],
            color: '#06b6d4', status: 'running',
          },
          {
            name: 'Network & Security',
            specs: [
              { label: 'Topology', value: 'Air-gapped OT network' },
              { label: 'Firewall', value: 'Palo Alto PA-5200 (DMZ)' },
              { label: 'Encryption', value: 'TLS 1.3 + WireGuard VPN' },
              { label: 'Backup', value: 'Daily snapshot + off-site' },
              { label: 'Compliance', value: 'IEC 62443 / NIST CSF' },
            ],
            color: '#ef4444', status: 'secured',
          },
        ].map((infra, i) => (
          <div key={i} style={{ ...sty.infraCard, borderLeft: `3px solid ${infra.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{infra.name}</div>
              <span style={{ ...sty.statusPill, background: `${infra.color}15`, color: infra.color }}>{infra.status}</span>
            </div>
            {infra.specs.map((sp, si) => (
              <div key={si} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
                <span style={{ color: '#94a3b8' }}>{sp.label}</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{sp.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Data Sovereignty */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>100% On-Premise Data Sovereignty</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>All sensor data, physics models, and AI inference run entirely within plant premises. Zero cloud dependency. Air-gapped OT/IT network with IEC 62443 compliance.</div>
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
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.7s ease both' },
  trendBadge: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  miniCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  assetCard: { background: '#fff', borderRadius: '10px', padding: '16px', border: '2px solid #e8ecf1', cursor: 'pointer', transition: 'all 0.2s' },
  aiModelCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  infraCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9' },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
}

export default DigitalTwinMonitoring
