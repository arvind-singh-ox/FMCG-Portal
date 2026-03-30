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

// ─── Helper: load color ───
function loadColor(v) { return v > 80 ? RED : v > 60 ? AMBER : GREEN }

// ─── SERVER DATA ───
const serverEnvironments = [
  {
    name: 'PRODUCTION', status: 'Active', statusColor: GREEN, servers: 4,
    gpu: '8x NVIDIA A100 80GB (640 GB VRAM)', cpu: '2x AMD EPYC 9654 (192 cores)', ram: '2 TB DDR5 ECC', storage: '200 TB NVMe RAID-10', network: '100 Gbps InfiniBand',
    loads: { cpu: 67, gpu: 82, ram: 71, storage: 48 },
    uptime: '99.99% (342 days)', extra: [{ label: 'Active Models', value: '14' }, { label: 'Active Pipelines', value: '28' }],
    sparkData: [62, 65, 68, 64, 67, 70, 66, 69, 72, 67, 65, 68, 71, 67, 64, 67],
  },
  {
    name: 'QA / STAGING', status: 'Active', statusColor: GREEN, servers: 2,
    gpu: '4x NVIDIA A100 40GB', cpu: 'AMD EPYC 9554 (128 cores)', ram: '1 TB DDR5', storage: '80 TB NVMe', network: '25 Gbps Ethernet',
    loads: { cpu: 34, gpu: 45, ram: 38, storage: 32 },
    uptime: '99.95%', extra: [{ label: 'Models in Testing', value: '6' }, { label: 'Test Pipelines', value: '12' }],
    sparkData: [30, 35, 32, 38, 34, 40, 36, 33, 38, 34, 37, 35, 32, 34, 36, 34],
  },
  {
    name: 'DEVELOPMENT', status: 'Active', statusColor: BLUE, servers: 2,
    gpu: '4x NVIDIA A30 24GB', cpu: 'AMD EPYC 9354 (64 cores)', ram: '512 GB DDR5', storage: '40 TB NVMe', network: '25 Gbps Ethernet',
    loads: { cpu: 52, gpu: 61, ram: 44, storage: 28 },
    uptime: '99.90%', extra: [{ label: 'Active Experiments', value: '8' }, { label: 'Notebooks', value: '12' }],
    sparkData: [48, 52, 55, 50, 58, 52, 49, 54, 60, 52, 56, 53, 50, 52, 55, 52],
  },
  {
    name: 'DR (DISASTER RECOVERY)', status: 'Standby', statusColor: AMBER, servers: 2,
    gpu: '8x NVIDIA A100 80GB (mirror)', cpu: '2x AMD EPYC 9654 (192 cores)', ram: '2 TB DDR5 ECC', storage: '200 TB NVMe RAID-10', network: '100 Gbps InfiniBand',
    loads: { cpu: 8, gpu: 2, ram: 12, storage: 48 },
    uptime: 'Standby', extra: [{ label: 'Last Sync', value: '12 min ago' }, { label: 'RPO / RTO', value: '15m / 30m' }, { label: 'Replication', value: 'Active' }, { label: 'Failover', value: 'Automated' }],
    location: 'Secondary Data Center (180 km away)',
    sparkData: [5, 6, 8, 5, 7, 4, 8, 6, 5, 9, 7, 8, 6, 5, 8, 8],
  },
]

const networkSecurity = [
  { label: 'Network Topology', value: 'Air-Gapped', icon: '🔒' },
  { label: 'Firewall Rules', value: '47 active, 0 violations', icon: '🛡️' },
  { label: 'VPN Tunnels', value: '4 active (plant sites)', icon: '🔗' },
  { label: 'SSL Certificates', value: '24, all valid', icon: '📜' },
  { label: 'Last Security Audit', value: '2026-03-01', icon: '🔍' },
  { label: 'Data Sovereignty', value: '100% on-premise, zero cloud', icon: '🏛️' },
]

// ─── MODELS DATA ───
const deployedModels = [
  { name: 'Kiln Temperature Predictor', arch: 'LSTM', framework: 'PyTorch', version: 'v3.2.1', metric: 'Accuracy', metricVal: '97.2%', latency: '8ms', throughput: '2,400 req/min', status: 'active' },
  { name: 'Clinker Quality Classifier', arch: 'XGBoost', framework: 'Scikit', version: 'v2.8.0', metric: 'Accuracy', metricVal: '98.1%', latency: '3ms', throughput: '180 req/min', status: 'active' },
  { name: 'Equipment Failure Predictor', arch: 'Transformer', framework: 'PyTorch', version: 'v4.1.0', metric: 'Accuracy', metricVal: '94.8%', latency: '15ms', throughput: '960 req/min', status: 'active' },
  { name: 'Raw Mix Optimizer', arch: 'GBR Ensemble', framework: 'Scikit', version: 'v3.0.2', metric: 'Accuracy', metricVal: '96.5%', latency: '12ms', throughput: '120 req/min', status: 'active' },
  { name: 'Energy Consumption Forecaster', arch: 'Prophet + LSTM', framework: 'PyTorch', version: 'v2.5.1', metric: 'Accuracy', metricVal: '95.3%', latency: '20ms', throughput: '60 req/min', status: 'active' },
  { name: 'Emission Predictor (SO2/NOx)', arch: 'Multi-output LSTM', framework: 'PyTorch', version: 'v3.3.0', metric: 'Accuracy', metricVal: '93.8%', latency: '10ms', throughput: '240 req/min', status: 'active' },
  { name: 'Belt Wear Detector', arch: 'YOLOv8 + LLaVA', framework: 'PyTorch', version: 'v2.1.0', metric: 'mAP', metricVal: '96.2%', latency: '45ms', throughput: '24 FPS', status: 'active' },
  { name: 'Dust Monitor (Vision)', arch: 'ResNet-50', framework: 'PyTorch', version: 'v1.4.2', metric: 'Accuracy', metricVal: '94.5%', latency: '30ms', throughput: '24 FPS', status: 'active' },
  { name: 'Vibration Anomaly Detector', arch: '1D-CNN', framework: 'PyTorch', version: 'v2.6.1', metric: 'Accuracy', metricVal: '97.8%', latency: '5ms', throughput: '4,800 req/min', status: 'active' },
  { name: 'Coal Quality Analyzer', arch: 'Hyperspectral CNN', framework: 'PyTorch', version: 'v1.2.0', metric: 'Accuracy', metricVal: '92.4%', latency: '25ms', throughput: '60 req/min', status: 'active' },
  { name: 'Kiln Shell Scanner', arch: 'Thermal Vision YOLO', framework: 'PyTorch', version: 'v2.0.3', metric: 'mAP', metricVal: '95.1%', latency: '40ms', throughput: '8 FPS', status: 'active' },
  { name: 'Cement Strength Predictor', arch: 'CatBoost', framework: 'CatBoost', version: 'v3.1.0', metric: 'Accuracy', metricVal: '96.8%', latency: '4ms', throughput: '300 req/min', status: 'active' },
  { name: 'Process Anomaly (Multivariate)', arch: 'IsoForest + AutoEncoder', framework: 'PyTorch', version: 'v2.4.0', metric: 'F1', metricVal: '94.2%', latency: '6ms', throughput: '1,200 req/min', status: 'active' },
  { name: 'NLP Chat Assistant', arch: 'Fine-tuned Llama 3 70B', framework: 'vLLM', version: 'v1.5.0', metric: 'Quality', metricVal: 'Production', latency: '120ms', throughput: '40 req/min', status: 'active' },
]

const llmStack = [
  { label: 'Base Model', value: 'Llama 3 70B (fine-tuned on 5 years plant data)' },
  { label: 'Serving Engine', value: 'vLLM with PagedAttention' },
  { label: 'Embeddings', value: 'BGE-Large-EN for RAG' },
  { label: 'Vector DB', value: 'Milvus (on-premise)' },
  { label: 'Context Window', value: '128K tokens' },
  { label: 'Training Data', value: '2.8M documents, 45 TB sensor data' },
  { label: 'Fine-tuning', value: 'LoRA on domain-specific cement terminology' },
  { label: 'Languages', value: 'English, Hindi' },
]

const servingInfra = [
  { label: 'Inference Engine', value: 'NVIDIA Triton Inference Server' },
  { label: 'Load Balancer', value: 'HAProxy (active-passive)' },
  { label: 'Model Registry', value: 'MLflow (on-premise)' },
  { label: 'Feature Store', value: 'Feast (on-premise)' },
  { label: 'Monitoring', value: 'Prometheus + Grafana' },
  { label: 'CI/CD', value: 'GitLab CI (air-gapped)' },
]

// ─── EDGE DATA ───
const edgeNodes = [
  { name: 'Kiln Edge Node', device: 'NVIDIA Jetson AGX Orin 64GB', cameras: 8, sensors: 12, models: 4, modelNames: 'Kiln scanner, shell temp, flame analysis, NOx predictor', gpuUtil: 78, temp: 62, inferenceRate: '1,240/min', uptime: '99.98%', color: RED },
  { name: 'Raw Mill Edge', device: 'Jetson Orin NX 16GB', cameras: 4, sensors: 8, models: 3, modelNames: 'Raw mix analyzer, vibration, dust', gpuUtil: 65, temp: 55, inferenceRate: '680/min', uptime: '99.95%', color: ORANGE },
  { name: 'Cement Mill Edge', device: 'Jetson Orin NX 16GB', cameras: 4, sensors: 6, models: 3, modelNames: 'Fineness predictor, vibration, temperature', gpuUtil: 58, temp: 52, inferenceRate: '540/min', uptime: '99.92%', color: BLUE },
  { name: 'Conveyor Edge', device: 'Jetson AGX Orin 32GB', cameras: 6, sensors: 4, models: 2, modelNames: 'Belt wear detector, material flow', gpuUtil: 72, temp: 58, inferenceRate: '960/min', uptime: '99.96%', color: AMBER },
  { name: 'Packing Edge', device: 'Jetson Orin Nano 8GB', cameras: 2, sensors: 4, models: 2, modelNames: 'Bag counter, weight anomaly', gpuUtil: 42, temp: 45, inferenceRate: '320/min', uptime: '99.90%', color: GREEN },
  { name: 'Coal Mill Edge', device: 'Jetson Orin NX 16GB', cameras: 3, sensors: 6, models: 2, modelNames: 'Coal quality, temperature anomaly', gpuUtil: 55, temp: 50, inferenceRate: '480/min', uptime: '99.93%', color: CYAN },
]

const pipelineStages = [
  { name: 'Sensors', count: '2,847', rate: '1.2 GB/min', color: CYAN },
  { name: 'Edge AI', count: '6 nodes', rate: '4,220 inf/min', color: ORANGE },
  { name: 'Aggregation', count: 'OPC-UA', rate: '48K tags/sec', color: BLUE },
  { name: 'Central AI', count: '14 models', rate: '11,384 req/min', color: ACCENT },
  { name: 'Dashboard', count: 'Real-time', rate: '< 500ms E2E', color: GREEN },
]

// ─── MONITORING DATA ───
const serverHealthMatrix = [
  { name: 'PROD-01', cpu: 72, gpu: 85, ram: 68, temp: 64, fan: 72 },
  { name: 'PROD-02', cpu: 65, gpu: 80, ram: 74, temp: 62, fan: 68 },
  { name: 'PROD-03', cpu: 68, gpu: 78, ram: 70, temp: 60, fan: 65 },
  { name: 'PROD-04', cpu: 63, gpu: 84, ram: 72, temp: 66, fan: 74 },
  { name: 'QA-01', cpu: 38, gpu: 48, ram: 35, temp: 48, fan: 42 },
  { name: 'QA-02', cpu: 30, gpu: 42, ram: 40, temp: 45, fan: 40 },
  { name: 'DEV-01', cpu: 55, gpu: 64, ram: 42, temp: 52, fan: 50 },
  { name: 'DEV-02', cpu: 48, gpu: 58, ram: 46, temp: 50, fan: 48 },
  { name: 'DR-01', cpu: 8, gpu: 2, ram: 12, temp: 38, fan: 30 },
  { name: 'DR-02', cpu: 8, gpu: 2, ram: 12, temp: 36, fan: 28 },
]

const alertHistory = [
  { time: '14 min ago', severity: 'warning', msg: 'PROD-02 GPU #3 temperature reached 82°C — fan speed increased to 85%.', resolution: 'Auto-mitigated' },
  { time: '1h ago', severity: 'info', msg: 'Model v3.2.1 (Kiln Temp Predictor) health check passed — latency 8ms, accuracy 97.2%.', resolution: 'N/A' },
  { time: '2h ago', severity: 'info', msg: 'Nightly incremental backup completed — 2.4 TB delta, 18 min duration.', resolution: 'N/A' },
  { time: '4h ago', severity: 'warning', msg: 'QA-01 storage utilization crossed 75% threshold — cleanup script triggered.', resolution: 'Auto-cleanup freed 4.2 TB' },
  { time: '6h ago', severity: 'info', msg: 'DR replication sync completed — RPO target met (12 min lag).', resolution: 'N/A' },
  { time: '8h ago', severity: 'critical', msg: 'PROD-01 NVMe drive #7 SMART warning — pre-failure predicted in 72 hrs.', resolution: 'Hot-spare activated, replacement scheduled' },
  { time: '12h ago', severity: 'info', msg: 'Model canary test passed — Emission Predictor v3.3.1 promoted to 10% traffic.', resolution: 'N/A' },
  { time: '18h ago', severity: 'warning', msg: 'InfiniBand link flap detected on PROD-03 port 2 — redundant path active.', resolution: 'Link restored after 4 sec' },
  { time: '1d ago', severity: 'info', msg: 'Weekly full backup completed — 48 TB total, verified checksums pass.', resolution: 'N/A' },
  { time: '2d ago', severity: 'info', msg: 'Blue-green deployment: Belt Wear Detector v2.1.0 rolled out to production.', resolution: 'N/A' },
]

const backupStatus = [
  { type: 'Daily Incremental', lastRun: '2h ago', size: '2.4 TB', status: 'success', next: 'Tonight 02:00' },
  { type: 'Weekly Full', lastRun: '3 days ago', size: '48 TB', status: 'success', next: 'Sunday 01:00' },
  { type: 'Monthly Archive', lastRun: '12 days ago', size: '48 TB → tape', status: 'success', next: 'Apr 1' },
]

const gpuCluster = [
  { id: 'A100-0', util: 85, temp: 64 }, { id: 'A100-1', util: 80, temp: 62 },
  { id: 'A100-2', util: 78, temp: 60 }, { id: 'A100-3', util: 84, temp: 66 },
  { id: 'A100-4', util: 88, temp: 68 }, { id: 'A100-5', util: 76, temp: 58 },
  { id: 'A100-6', util: 82, temp: 63 }, { id: 'A100-7', util: 79, temp: 61 },
]

const deploymentPipeline = {
  lastDeployment: '2 days ago',
  modelsInStaging: 2,
  pendingReview: 1,
  autoRollback: 'Enabled',
  blueGreen: 'Active',
  canaryTesting: '5% traffic',
}

// ─── SVG ICONS ───
const ServerIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
const CpuIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
const BrainIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" /></svg>
const EdgeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
const MonitorIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>

// ─── MAIN ───
function AIInfrastructure() {
  const [activeTab, setActiveTab] = useState('servers')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000)
    return () => clearInterval(interval)
  }, [])

  const TABS = [
    { key: 'servers', label: 'Server Infrastructure', icon: <ServerIcon /> },
    { key: 'models', label: 'AI Models & Serving', icon: <BrainIcon /> },
    { key: 'edge', label: 'Edge Computing', icon: <EdgeIcon /> },
    { key: 'monitoring', label: 'Monitoring & Operations', icon: <MonitorIcon /> },
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
          <div style={sty.headerIcon}><ServerIcon /></div>
          <div>
            <h1 style={sty.pageTitle}>On-Premise AI Infrastructure</h1>
            <p style={sty.pageSub}>Enterprise-grade, air-gapped AI platform — complete turn-key solution</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}>
            <span style={{ ...sty.liveDot, animation: 'pulse 2s infinite' }} /> All Systems Operational
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

      {activeTab === 'servers' && <ServersTab tick={tick} />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'edge' && <EdgeTab tick={tick} />}
      {activeTab === 'monitoring' && <MonitoringTab tick={tick} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// TAB 1: SERVER INFRASTRUCTURE
// ═══════════════════════════════════════════════════
function LiveLoad({ base, range = 4, interval = 3000 }) {
  const [val, setVal] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      setVal(Math.max(2, Math.min(99, base + Math.floor(Math.random() * range * 2) - range)))
    }, interval + Math.random() * 1000)
    return () => clearInterval(t)
  }, [base, range, interval])
  return { val, color: loadColor(val) }
}

function LiveLoadBar({ label, base, range = 4 }) {
  const { val, color } = LiveLoad({ base, range })
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s ease' }}>{val}%</span>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '3px' }}>
        <ProgressBar value={val} color={color} height={6} />
      </div>
    </div>
  )
}

function ServersTab({ tick }) {
  return (
    <>
      <Section title="Environment Overview — 4 Server Environments" icon={<ServerIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {serverEnvironments.map((env, i) => (
            <div key={i} style={{ background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 50%, #f0efff 100%)', borderRadius: '14px', padding: '20px', border: `2px solid ${env.statusColor}25`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.1}s`, boxShadow: '0 2px 12px rgba(96,93,186,0.08)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${env.statusColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={env.statusColor} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><circle cx="6" cy="6" r="1" /><circle cx="6" cy="18" r="1" /></svg>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', letterSpacing: '0.5px' }}>{env.name}</span>
                  <span style={{ ...sty.statusPill, background: `${env.statusColor}15`, color: env.statusColor, fontSize: '9px' }}>{env.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: env.statusColor, animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '9px', color: env.statusColor, fontWeight: 700 }}>LIVE</span>
                </div>
              </div>

              {/* Server count + uptime */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', flex: 1, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Servers</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{env.servers}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', flex: 1, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Uptime</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: GREEN }}>{env.uptime}</div>
                </div>
              </div>

              {/* Specs */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
                {[
                  { label: 'GPU', value: env.gpu },
                  { label: 'CPU', value: env.cpu },
                  { label: 'RAM', value: env.ram },
                  { label: 'Storage', value: env.storage },
                  { label: 'Network', value: env.network },
                ].map((spec, si) => (
                  <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', padding: '2px 0' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: '56px' }}>{spec.label}</span>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{spec.value}</span>
                  </div>
                ))}
                {env.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', padding: '2px 0' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: '56px' }}>Location</span>
                    <span style={{ color: AMBER, fontWeight: 600 }}>{env.location}</span>
                  </div>
                )}
              </div>

              {/* Live Load bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {Object.entries(env.loads).map(([key, val]) => (
                  <LiveLoadBar key={key} label={key} base={val} range={key === 'storage' ? 1 : 5} />
                ))}
              </div>

              {/* Sparkline */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', marginBottom: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px' }}>CPU LOAD (24H)</div>
                <Sparkline data={env.sparkData} color={env.statusColor} height={28} />
              </div>

              {/* Extra info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {env.extra.map((ex, ei) => (
                  <div key={ei} style={{ background: `${ACCENT}08`, borderRadius: '6px', padding: '6px 10px', flex: '1 1 auto', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{ex.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>{ex.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Network & Security" icon={<ShieldIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {networkSecurity.map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Data sovereignty banner */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>100% On-Premise Data Sovereignty</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>All AI models, data, and infrastructure operate within the plant's air-gapped network. Zero cloud dependency. Full compliance with data localization requirements.</div>
          </div>
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════
// TAB 2: AI MODELS & SERVING
// ═══════════════════════════════════════════════════
function ModelsTab() {
  return (
    <>
      <Section title="Deployed Models — 14 Production Models" icon={<BrainIcon />}>
        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total Models', value: '14', color: ACCENT },
            { label: 'Avg Accuracy', value: '95.9%', color: GREEN },
            { label: 'Avg Latency', value: '21.6ms', color: BLUE },
            { label: 'Total Throughput', value: '11,384 req/min', color: CYAN },
            { label: 'GPU Memory Used', value: '542 GB', color: ORANGE },
            { label: 'Uptime', value: '99.99%', color: GREEN },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{kpi.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Models table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Model', 'Architecture', 'Framework', 'Version', 'Metric', 'Score', 'Latency', 'Throughput', 'Status'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 6px', textAlign: 'left', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployedModels.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.03}s` }}>
                  <td style={{ padding: '8px 6px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '8px 6px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{m.name}</td>
                  <td style={{ padding: '8px 6px', color: ACCENT, fontWeight: 500 }}>{m.arch}</td>
                  <td style={{ padding: '8px 6px', color: '#64748b' }}>{m.framework}</td>
                  <td style={{ padding: '8px 6px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#64748b' }}>{m.version}</span></td>
                  <td style={{ padding: '8px 6px', color: '#94a3b8', fontSize: '9px' }}>{m.metric}</td>
                  <td style={{ padding: '8px 6px', fontWeight: 700, color: GREEN }}>{m.metricVal}</td>
                  <td style={{ padding: '8px 6px', color: '#1e293b', fontWeight: 500 }}>{m.latency}</td>
                  <td style={{ padding: '8px 6px', color: '#1e293b' }}>{m.throughput}</td>
                  <td style={{ padding: '8px 6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: GREEN }}>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* LLM Stack */}
      <Section title="LLM Stack — On-Premise Large Language Model" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}>
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#e0e7ff' }}>Llama 3 70B — Plant AI Assistant</div>
              <div style={{ fontSize: '11px', color: '#a5b4fc' }}>Fine-tuned on 5 years of cement plant operational data</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} /> Serving
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {llmStack.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '9px', color: '#818cf8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#e0e7ff' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Model Serving Infrastructure */}
      <Section title="Model Serving Infrastructure" icon={<CpuIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {servingInfra.map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════
// TAB 3: EDGE COMPUTING
// ═══════════════════════════════════════════════════
function EdgeTab({ tick }) {
  return (
    <>
      <Section title="Edge Nodes — 6 Nodes Across Plant" icon={<EdgeIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {edgeNodes.map((node, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', borderLeft: `4px solid ${node.color}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.08}s` }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{node.name}</div>
                  <div style={{ fontSize: '10px', color: node.color, fontWeight: 600 }}>{node.device}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '9px', color: GREEN, fontWeight: 700 }}>ONLINE</span>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: '#fff', borderRadius: '6px', padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Cameras</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{node.cameras}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '6px', padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Sensors</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{node.sensors}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '6px', padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Models</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}>{node.models}</div>
                </div>
              </div>

              {/* GPU + Temp bars */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>GPU UTILIZATION</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: loadColor(node.gpuUtil) }}>{node.gpuUtil}%</span>
                </div>
                <ProgressBar value={node.gpuUtil} color={loadColor(node.gpuUtil)} height={5} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>TEMPERATURE</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: node.temp > 65 ? AMBER : GREEN }}>{node.temp}°C</span>
                </div>
                <ProgressBar value={node.temp} max={100} color={node.temp > 65 ? AMBER : GREEN} height={5} />
              </div>

              {/* Bottom info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Inference: </span>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{node.inferenceRate}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Uptime: </span>
                  <span style={{ color: GREEN, fontWeight: 600 }}>{node.uptime}</span>
                </div>
              </div>

              {/* Model names */}
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>{node.modelNames}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Edge-to-Server Pipeline */}
      <Section title="Edge-to-Server Data Pipeline" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', justifyContent: 'center' }}>
          {pipelineStages.map((stage, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: `2px solid ${stage.color}30`, textAlign: 'center', minWidth: '130px', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stage.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stage.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></>}
                    {i === 1 && <><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></>}
                    {i === 2 && <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /></>}
                    {i === 3 && <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44" /></>}
                    {i === 4 && <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>}
                  </svg>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{stage.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: stage.color, margin: '4px 0' }}>{stage.count}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{stage.rate}</div>
              </div>
              {i < pipelineStages.length - 1 && (
                <svg width="32" height="20" viewBox="0 0 32 20" style={{ flexShrink: 0 }}>
                  <line x1="2" y1="10" x2="24" y2="10" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
                  <polygon points="24,5 32,10 24,15" fill="#cbd5e1" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
          {[
            { label: 'End-to-End Latency', value: '< 500ms', color: GREEN },
            { label: 'Data Processed', value: '1.2 GB/min', color: BLUE },
            { label: 'Edge Processing Ratio', value: '78% on-edge', color: ORANGE },
            { label: 'Central Processing', value: '22% server', color: ACCENT },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════
// TAB 4: MONITORING & OPERATIONS
// ═══════════════════════════════════════════════════
function MonitoringTab({ tick }) {
  return (
    <>
      {/* Server Health Matrix */}
      <Section title="Server Health Matrix" icon={<MonitorIcon />}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Server', 'CPU %', 'GPU %', 'RAM %', 'Temp °C', 'Fan %', 'Status'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serverHealthMatrix.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                  {['cpu', 'gpu', 'ram', 'temp', 'fan'].map((key) => (
                    <td key={key} style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px' }}><ProgressBar value={s[key]} color={loadColor(s[key])} height={4} /></div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: loadColor(s[key]) }}>{s[key]}{key === 'temp' ? '°C' : '%'}</span>
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.name.startsWith('DR') ? AMBER : GREEN, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: s.name.startsWith('DR') ? AMBER : GREEN }}>{s.name.startsWith('DR') ? 'Standby' : 'Active'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* GPU Cluster Heatmap */}
      <Section title="GPU Cluster Utilization — 8x A100 Production" icon={<CpuIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
          {gpuCluster.map((gpu, i) => {
            const utilColor = loadColor(gpu.util)
            const tempColor = gpu.temp > 65 ? AMBER : GREEN
            return (
              <div key={i} style={{ background: '#0f172a', borderRadius: '10px', padding: '14px', border: `1px solid ${utilColor}30`, textAlign: 'center', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>{gpu.id}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: utilColor, marginBottom: '4px' }}>{gpu.util}%</div>
                <div style={{ marginBottom: '6px' }}><ProgressBar value={gpu.util} color={utilColor} height={4} /></div>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>UTILIZATION</div>
                <div style={{ marginTop: '8px', padding: '4px 8px', background: '#1e293b', borderRadius: '6px', display: 'inline-block' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: tempColor }}>{gpu.temp}°C</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Alert History */}
      <Section title="Alert History — Last 10 Alerts" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alertHistory.map((a, i) => {
            const sevColors = { critical: RED, warning: AMBER, info: BLUE }
            const c = sevColors[a.severity]
            return (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9', borderLeft: `3px solid ${c}`, animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.03}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ ...sty.statusPill, background: `${c}15`, color: c }}>{a.severity}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.time}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: GREEN, fontWeight: 500 }}>{a.resolution}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.6' }}>{a.msg}</div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Backup Status + Deployment Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0' }}>
        <Section title="Backup Status" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {backupStatus.map((b, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{b.type}</span>
                  <span style={{ ...sty.statusPill, background: `${GREEN}15`, color: GREEN }}>Success</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#64748b' }}>
                  <span>Last: <strong>{b.lastRun}</strong></span>
                  <span>Size: <strong>{b.size}</strong></span>
                  <span>Next: <strong>{b.next}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Storage utilization */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Storage Utilization</div>
            {[
              { env: 'Production', used: 96, total: 200, color: ACCENT },
              { env: 'QA/Staging', used: 25.6, total: 80, color: BLUE },
              { env: 'Development', used: 11.2, total: 40, color: GREEN },
              { env: 'DR (Mirror)', used: 96, total: 200, color: AMBER },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{s.env}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{s.used} / {s.total} TB ({Math.round((s.used / s.total) * 100)}%)</span>
                </div>
                <ProgressBar value={s.used} max={s.total} color={s.color} height={5} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Deployment Pipeline" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /></svg>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Last Deployment', value: deploymentPipeline.lastDeployment, color: '#1e293b' },
              { label: 'Models in Staging', value: deploymentPipeline.modelsInStaging, color: AMBER },
              { label: 'Pending Review', value: deploymentPipeline.pendingReview, color: ORANGE },
              { label: 'Auto-Rollback', value: deploymentPipeline.autoRollback, color: GREEN },
              { label: 'Blue-Green Deployment', value: deploymentPipeline.blueGreen, color: GREEN },
              { label: 'Canary Testing', value: deploymentPipeline.canaryTesting, color: BLUE },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Deployment flow */}
          <div style={{ marginTop: '16px', padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>Deployment Flow</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {['Dev Branch', 'Unit Tests', 'QA Deploy', 'Integration Tests', 'Canary (5%)', 'Blue-Green', 'Production'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: i < 6 ? `${GREEN}15` : `${ACCENT}15`, color: i < 6 ? GREEN : ACCENT, padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap' }}>{step}</span>
                  {i < 6 && <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="0,2 8,6 0,10" fill="#cbd5e1" /></svg>}
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
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

export default AIInfrastructure
