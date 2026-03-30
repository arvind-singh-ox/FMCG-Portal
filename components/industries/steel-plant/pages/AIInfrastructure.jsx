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

function loadColor(v) { return v > 80 ? RED : v > 60 ? AMBER : GREEN }

// ─── Live Load (fluctuating values like cement plant) ───
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
      <ProgressBar value={val} color={color} height={5} />
    </div>
  )
}

function LiveCounter({ base, increment = 1, interval = 3000, suffix = '', color = '#1e293b' }) {
  const [val, setVal] = useState(base)
  useEffect(() => { const t = setInterval(() => { setVal(v => v + Math.floor(Math.random() * increment * 2) + 1) }, interval); return () => clearInterval(t) }, [increment, interval])
  return <span style={{ fontSize: '22px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s ease' }}>{val.toLocaleString()}{suffix}</span>
}

function LiveValue({ base, range = 2, decimals = 0, suffix = '', color }) {
  const [val, setVal] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      setVal(base + (Math.random() * range * 2 - range))
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(t)
  }, [base, range])
  return <span style={{ fontVariantNumeric: 'tabular-nums', transition: 'all 0.3s ease', color }}>{decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}{suffix}</span>
}

const ServerIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
const BrainIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" /></svg>
const EdgeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>
const MonIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>

// ══════════════════════════════════════════════════
// STEEL PLANT AI INFRASTRUCTURE DATA
// ══════════════════════════════════════════════════

const serverEnvironments = [
  {
    name: 'PRODUCTION', status: 'Active', statusColor: GREEN, servers: 4,
    gpu: '8x NVIDIA A100 80GB (640 GB VRAM)', cpu: '2x AMD EPYC 9654 (192 cores)', ram: '2 TB DDR5 ECC', storage: '240 TB NVMe RAID-10', network: '100 Gbps InfiniBand',
    loads: { cpu: 62, gpu: 78, ram: 68, storage: 52 },
    uptime: '99.99% (385 days)', extra: [{ label: 'Active Models', value: '18' }, { label: 'Active Pipelines', value: '34' }],
    sparkData: [58, 62, 65, 60, 64, 68, 62, 66, 70, 64, 62, 65, 68, 64, 61, 62],
  },
  {
    name: 'QA / STAGING', status: 'Active', statusColor: GREEN, servers: 2,
    gpu: '4x NVIDIA A100 40GB', cpu: 'AMD EPYC 9554 (128 cores)', ram: '1 TB DDR5', storage: '100 TB NVMe', network: '25 Gbps Ethernet',
    loads: { cpu: 38, gpu: 42, ram: 35, storage: 28 },
    uptime: '99.95%', extra: [{ label: 'Models in Testing', value: '8' }, { label: 'Test Pipelines', value: '14' }],
    sparkData: [32, 36, 34, 40, 38, 42, 36, 38, 42, 38, 40, 38, 36, 38, 40, 38],
  },
  {
    name: 'DEVELOPMENT', status: 'Active', statusColor: BLUE, servers: 2,
    gpu: '4x NVIDIA A30 24GB', cpu: 'AMD EPYC 9354 (64 cores)', ram: '512 GB DDR5', storage: '50 TB NVMe', network: '25 Gbps Ethernet',
    loads: { cpu: 55, gpu: 58, ram: 42, storage: 32 },
    uptime: '99.90%', extra: [{ label: 'Active Experiments', value: '12' }, { label: 'Notebooks', value: '18' }],
    sparkData: [50, 54, 58, 52, 56, 54, 50, 55, 58, 54, 56, 55, 52, 54, 56, 55],
  },
  {
    name: 'DR (DISASTER RECOVERY)', status: 'Standby', statusColor: AMBER, servers: 2,
    gpu: '8x NVIDIA A100 80GB (mirror)', cpu: '2x AMD EPYC 9654 (192 cores)', ram: '2 TB DDR5 ECC', storage: '240 TB NVMe RAID-10', network: '100 Gbps InfiniBand',
    loads: { cpu: 6, gpu: 2, ram: 10, storage: 52 },
    uptime: 'Standby', extra: [{ label: 'Last Sync', value: '8 min ago' }, { label: 'RPO / RTO', value: '10m / 20m' }, { label: 'Replication', value: 'Active' }, { label: 'Failover', value: 'Automated' }],
    location: 'Secondary DC — 200 km separation',
    sparkData: [4, 5, 6, 4, 5, 3, 6, 5, 4, 7, 5, 6, 4, 5, 6, 6],
  },
]

const networkSecurity = [
  { label: 'Network Topology', value: 'Air-Gapped + DMZ', icon: '🔒' },
  { label: 'Firewall Rules', value: '62 active, 0 violations', icon: '🛡️' },
  { label: 'VPN Tunnels', value: '6 active (plant + DR + HQ)', icon: '🔗' },
  { label: 'SSL Certificates', value: '38, all valid', icon: '📜' },
  { label: 'Last Security Audit', value: '2026-03-05', icon: '🔍' },
  { label: 'Data Sovereignty', value: '100% on-premise, zero cloud', icon: '🏛️' },
]

const deployedModels = [
  { name: 'BF Silicon Predictor', arch: 'LSTM', framework: 'PyTorch', version: 'v4.2.1', metric: 'Accuracy', metricVal: '94.2%', latency: '12ms', throughput: '1,800 req/min', status: 'active' },
  { name: 'BF Thermal State Index', arch: 'Random Forest', framework: 'Scikit', version: 'v3.1.0', metric: 'Accuracy', metricVal: '91.5%', latency: '5ms', throughput: '3,600 req/min', status: 'active' },
  { name: 'BOF Endpoint (C + T)', arch: 'XGBoost + NN', framework: 'PyTorch', version: 'v5.0.2', metric: 'Hit Rate', metricVal: '97.2%', latency: '8ms', throughput: '120 req/min', status: 'active' },
  { name: 'Breakout Prediction (CNN)', arch: 'ResNet-34', framework: 'PyTorch', version: 'v3.4.0', metric: 'Accuracy', metricVal: '99.1%', latency: '25ms', throughput: '960 req/min', status: 'active' },
  { name: 'Slab Surface Defect Detector', arch: 'YOLOv8 + ResNet-50', framework: 'PyTorch', version: 'v4.2.0', metric: 'mAP', metricVal: '97.8%', latency: '45ms', throughput: '24 FPS', status: 'active' },
  { name: 'Rolling Mill Vibration Anomaly', arch: '1D-CNN + Envelope', framework: 'PyTorch', version: 'v3.2.1', metric: 'F1', metricVal: '96.4%', latency: '5ms', throughput: '4,800 req/min', status: 'active' },
  { name: 'Mechanical Property Predictor', arch: 'Neural Network', framework: 'PyTorch', version: 'v2.8.0', metric: 'MAE', metricVal: '±8 MPa', latency: '15ms', throughput: '480 req/min', status: 'active' },
  { name: 'Gas Network Optimizer', arch: 'LP + RL', framework: 'OR-Tools', version: 'v2.1.0', metric: 'Accuracy', metricVal: '98.1%', latency: '0.5s', throughput: '6 req/min', status: 'active' },
  { name: 'Refractory Wear Tracker', arch: 'Inverse HT + CNN', framework: 'PyTorch', version: 'v2.5.0', metric: 'Accuracy', metricVal: '91.4%', latency: '5s', throughput: '12 req/min', status: 'active' },
  { name: 'Roll Force Predictor', arch: 'Physics-Informed NN', framework: 'PyTorch', version: 'v3.0.1', metric: 'Accuracy', metricVal: '96.2%', latency: '4ms', throughput: '1,200 req/min', status: 'active' },
  { name: 'Solidification FEM Model', arch: 'FEM + Neural Net', framework: 'COMSOL + PyTorch', version: 'v1.8.0', metric: 'Accuracy', metricVal: '95.5%', latency: '1.5s', throughput: '40 req/min', status: 'active' },
  { name: 'ESP Performance Optimizer', arch: 'Bayesian + ML', framework: 'Scikit', version: 'v2.2.0', metric: 'Accuracy', metricVal: '88.4%', latency: '20ms', throughput: '180 req/min', status: 'active' },
  { name: 'Burden Distribution AI', arch: 'CFD + RL', framework: 'PyTorch', version: 'v2.0.0', metric: 'Improvement', metricVal: '-8 kg coke/THM', latency: '2.8s', throughput: 'Per charge', status: 'active' },
  { name: 'Combustion NOx Predictor', arch: 'Multi-output LSTM', framework: 'PyTorch', version: 'v2.4.0', metric: 'Accuracy', metricVal: '93.2%', latency: '10ms', throughput: '360 req/min', status: 'active' },
  { name: 'Inventory Forecasting', arch: 'LSTM + Lead-time', framework: 'PyTorch', version: 'v1.6.0', metric: 'Accuracy', metricVal: '92.8%', latency: '50ms', throughput: '60 req/min', status: 'active' },
  { name: 'Compliance Report Generator', arch: 'Fine-tuned Llama 3 8B', framework: 'vLLM', version: 'v1.2.0', metric: 'Quality', metricVal: 'Production', latency: '4.5s', throughput: '12 req/min', status: 'active' },
  { name: 'Plant Chat Assistant', arch: 'Fine-tuned Llama 3 70B', framework: 'vLLM', version: 'v2.0.0', metric: 'Quality', metricVal: 'Production', latency: '120ms', throughput: '40 req/min', status: 'active' },
  { name: 'Vision Inspection LLM', arch: 'LLaVA 1.6 13B', framework: 'vLLM', version: 'v1.5.0', metric: 'Quality', metricVal: 'Production', latency: '280ms', throughput: '18 req/min', status: 'active' },
]

const llmStack = [
  { label: 'Primary LLM', value: 'Llama 3 70B (fine-tuned on 8 years steel plant data)' },
  { label: 'Report LLM', value: 'Llama 3 8B (compliance & shift report generation)' },
  { label: 'Vision LLM', value: 'LLaVA 1.6 13B (thermal image + slab defect analysis)' },
  { label: 'Serving Engine', value: 'vLLM with PagedAttention + Continuous Batching' },
  { label: 'Embeddings', value: 'BGE-Large-EN-v1.5 for RAG' },
  { label: 'Vector DB', value: 'Milvus (on-premise, 2.4M vectors)' },
  { label: 'Context Window', value: '128K tokens (Llama 3 70B)' },
  { label: 'Training Data', value: '4.2M documents, 85 TB sensor data, 18K SOPs/manuals' },
  { label: 'Fine-tuning', value: 'LoRA on steel metallurgy, process control, safety procedures' },
  { label: 'RAG Sources', value: 'SOPs, IS/EN standards, equipment manuals, incident history, MSDS' },
]

const edgeNodes = [
  { name: 'Edge-Node-BF-01', type: 'NVIDIA Jetson AGX Orin 64GB', location: 'Blast Furnace #1', models: 4, gpu: 72, cpu: 48, ram: 78, temp: 62, inferRate: 280, status: 'Online' },
  { name: 'Edge-Node-BF-02', type: 'NVIDIA Jetson AGX Orin 64GB', location: 'Blast Furnace #2', models: 3, gpu: 65, cpu: 42, ram: 68, temp: 58, inferRate: 220, status: 'Online' },
  { name: 'Edge-Node-SMS-01', type: 'NVIDIA Jetson AGX Orin 64GB', location: 'BOF / Caster Area', models: 4, gpu: 68, cpu: 45, ram: 72, temp: 60, inferRate: 260, status: 'Online' },
  { name: 'Edge-Node-HSM-01', type: 'NVIDIA Jetson Orin NX 16GB', location: 'Hot Strip Mill', models: 2, gpu: 88, cpu: 65, ram: 85, temp: 68, inferRate: 150, status: 'Online' },
  { name: 'Edge-Node-Vision-01', type: 'NVIDIA A2 Server 16GB', location: 'Slab Inspection + Safety', models: 5, gpu: 91, cpu: 48, ram: 72, temp: 71, inferRate: 420, status: 'Online' },
  { name: 'Edge-Node-Vision-02', type: 'NVIDIA A2 Server 16GB', location: 'Conveyor + Tuyere Cameras', models: 3, gpu: 82, cpu: 42, ram: 65, temp: 65, inferRate: 340, status: 'Online' },
]

const monitoringMetrics = [
  { metric: 'Total GPU VRAM Utilized', value: '512 GB / 640 GB', pct: 80, color: AMBER, spark: [72, 75, 78, 80, 78, 82, 80, 79, 80, 82, 80, 78] },
  { metric: 'AI Inference Rate (Plant-wide)', value: '4,821 inf/min', pct: 68, color: GREEN, spark: [4200, 4400, 4600, 4800, 4500, 4700, 4821, 4600, 4800, 4750, 4821, 4800] },
  { metric: 'Model Serving Latency (P95)', value: '45ms', pct: 22, color: GREEN, spark: [48, 46, 45, 47, 44, 46, 45, 44, 45, 46, 45, 45] },
  { metric: 'Data Pipeline Throughput', value: '2.4 GB/min', pct: 65, color: GREEN, spark: [2.1, 2.2, 2.3, 2.4, 2.3, 2.4, 2.4, 2.3, 2.4, 2.5, 2.4, 2.4] },
  { metric: 'Model Drift Alerts (30 days)', value: '0', pct: 0, color: GREEN, spark: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { metric: 'Storage Utilization', value: '52%', pct: 52, color: GREEN, spark: [48, 49, 50, 51, 51, 52, 52, 52, 52, 52, 52, 52] },
]

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════

export default function AIInfrastructure() {
  const [activeTab, setActiveTab] = useState('servers')

  const TABS = [
    { key: 'servers', label: 'Server Infrastructure', icon: <ServerIcon /> },
    { key: 'models', label: 'AI Models & LLMs', icon: <BrainIcon /> },
    { key: 'edge', label: 'Edge Computing', icon: <EdgeIcon /> },
    { key: 'monitoring', label: 'System Monitoring', icon: <MonIcon /> },
  ]

  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}><ServerIcon /></div>
          <div>
            <h1 style={sty.pageTitle}>On-Premise AI Infrastructure</h1>
            <p style={sty.pageSub}>GPU servers, 18 AI models, 6 edge nodes, LLM stack — 100% on-premise, zero cloud</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> All Systems Online</span>
          <span style={{ ...sty.liveBadge, background: `${ACCENT}12`, color: ACCENT, borderColor: `${ACCENT}30` }}>640 GB VRAM | 18 Models</span>
        </div>
      </div>

      <div style={sty.tabs}>
        {TABS.map(t => (<button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>))}
      </div>

      {activeTab === 'servers' && <ServersTab />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'edge' && <EdgeTab />}
      {activeTab === 'monitoring' && <MonitoringTab />}
    </div>
  )
}

function ServersTab() {
  return (
    <>
      <Section title="Server Environments — 10 Servers, 4 Environments" icon={<ServerIcon />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {serverEnvironments.map((env, i) => (
            <div key={env.name} style={{ ...sty.card, borderLeft: `4px solid ${env.statusColor}`, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', letterSpacing: '1px' }}>{env.name}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: env.statusColor, background: `${env.statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{env.status}</span>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>{env.servers} servers</span>
                  </div>
                  {env.location && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{env.location}</div>}
                </div>
                <div style={{ width: '140px' }}><Sparkline data={env.sparkData} color={env.statusColor} height={28} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px', fontSize: '10px' }}>
                <div><span style={{ color: '#94a3b8' }}>GPU</span><div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{env.gpu}</div></div>
                <div><span style={{ color: '#94a3b8' }}>CPU</span><div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{env.cpu}</div></div>
                <div><span style={{ color: '#94a3b8' }}>RAM</span><div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{env.ram}</div></div>
                <div><span style={{ color: '#94a3b8' }}>Storage</span><div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{env.storage}</div></div>
                <div><span style={{ color: '#94a3b8' }}>Uptime</span><div style={{ fontWeight: 600, color: GREEN, marginTop: '2px' }}>{env.uptime}</div></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                {['cpu', 'gpu', 'ram', 'storage'].map(k => (
                  <div key={k} style={{ flex: 1 }}>
                    <LiveLoadBar label={k} base={env.loads[k]} range={env.name === 'DR (DISASTER RECOVERY)' ? 2 : 5} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {env.extra.map((e, ei) => (<span key={ei} style={{ fontSize: '9px', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>{e.label}: <strong>{e.value}</strong></span>))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Network & Security" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {networkSecurity.map((n, i) => (
            <div key={n.label} style={{ ...sty.card, textAlign: 'center', animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.06}s` }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{n.icon}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{n.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{n.value}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function ModelsTab() {
  return (
    <>
      <Section title={`Deployed AI Models — ${deployedModels.length} Active`} icon={<BrainIcon />}>
        <div style={sty.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.6fr 0.5fr 0.6fr 0.5fr 0.7fr 0.4fr', gap: '6px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
            {['Model', 'Architecture', 'Framework', 'Version', 'Metric', 'Latency', 'Throughput', 'Status'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
          </div>
          {deployedModels.map((m, i) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.6fr 0.5fr 0.6fr 0.5fr 0.7fr 0.4fr', gap: '6px', padding: '10px 12px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '3px', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.03}s` }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{m.name}</div>
              <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 500 }}>{m.arch}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{m.framework}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{m.version}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: GREEN }}>{m.metricVal}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{m.latency}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{m.throughput}</div>
              <div><span style={{ fontSize: '8px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 6px', borderRadius: '4px' }}>{m.status}</span></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="LLM Stack — On-Premise Language Models" icon={<BrainIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {llmStack.map((l, i) => (
            <div key={l.label} style={{ ...sty.card, display: 'flex', gap: '12px', animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.05}s`, borderLeft: `3px solid ${ACCENT}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px' }}>{l.label}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b', lineHeight: '1.5' }}>{l.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function EdgeTab() {
  return (
    <Section title="Edge Computing Nodes — 6 Active" icon={<EdgeIcon />}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {edgeNodes.map((node, i) => (
          <div key={node.name} style={{ ...sty.card, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{node.name}</div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>{node.type}</div>
                <div style={{ fontSize: '9px', color: ACCENT, fontWeight: 500 }}>{node.location}</div>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 8px', borderRadius: '10px' }}>{node.status}</span>
            </div>
            {['gpu', 'cpu', 'ram'].map(k => (
              <div key={k} style={{ marginBottom: '6px' }}>
                <LiveLoadBar label={k} base={node[k]} range={4} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '10px' }}>
              <span style={{ color: '#64748b' }}>Models: <strong>{node.models}</strong></span>
              <span style={{ color: '#64748b' }}>Temp: <strong><LiveValue base={node.temp} range={3} suffix="°C" /></strong></span>
              <span style={{ color: ACCENT, fontWeight: 600 }}><LiveValue base={node.inferRate} range={15} suffix=" inf/min" /></span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...sty.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
        <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Edge VRAM</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> 224 GB</span></div>
        <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Edge Models</span><span style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}> 21</span></div>
        <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Total Inference Rate</span><span style={{ fontSize: '13px', fontWeight: 700, color: GREEN }}> 1,670 inf/min</span></div>
        <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Edge Processing</span><span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}> 82% on-edge</span></div>
      </div>
    </Section>
  )
}

function MonitoringTab() {
  return (
    <Section title="System Monitoring & Performance" icon={<MonIcon />}>
      {/* Live Counter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '16px 24px', display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}><LiveCounter base={4821520} increment={18} interval={2000} color={ACCENT} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>AI Inferences Today</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={2847200} increment={12} interval={2500} color={GREEN} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Data Points Ingested</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={18420} increment={2} interval={4000} color={BLUE} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Model Predictions</div></div>
        <div style={{ textAlign: 'center' }}><LiveCounter base={142850} increment={3} interval={3000} color={AMBER} /><div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>API Calls Served</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {monitoringMetrics.map((m, i) => (
          <div key={m.metric} style={{ ...sty.card, animation: 'fadeUp 0.6s ease both', animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{m.metric}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{m.value}</div>
            <Sparkline data={m.spark} color={m.color} height={28} />
            {m.pct > 0 && <div style={{ marginTop: '6px' }}><LiveLoadBar label="" base={m.pct} range={3} /></div>}
          </div>
        ))}
      </div>

      {/* AI Footer */}
      <div style={{ display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>On-Premise AI Infrastructure — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            10 servers across 4 environments (Production, QA, Dev, DR). 640 GB total GPU VRAM (8x A100 80GB production).
            18 AI models deployed — from LSTM silicon prediction (12ms) to fine-tuned Llama 3 70B plant assistant (120ms).
            6 edge nodes (Jetson AGX Orin + A2) processing 82% of inference at the edge. Zero cloud dependency — 100% air-gapped.
            LLM stack: Llama 3 70B + 8B + LLaVA 13B, all fine-tuned on 8 years of steel plant operational data.
            DR site 200km away with 10-min RPO, 20-min RTO, automated failover. Overall infra uptime: 99.99%.
          </div>
        </div>
      </div>
    </Section>
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
