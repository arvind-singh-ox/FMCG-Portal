'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

// ─── Scroll Reveal Hook ───
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
function AnimatedValue({ value, suffix = '', prefix = '', decimals = 1 }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    const duration = 1400
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(numVal * eased)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal])
  const formatted = numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(decimals)
  return <>{prefix}{formatted}{suffix}</>
}

// ─── Responsive Area Chart ───
function AreaChart({ data, color, height = 50 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(200)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setCWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.1
  const min = Math.min(...data) * 0.9
  const range = max - min || 1
  const w = cWidth
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gradId = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gradId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Donut Chart ───
function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => {
    const duration = 1600
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimPct(pct * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [pct])
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || ACCENT} strokeWidth={strokeWidth}
        strokeDasharray={`${(animPct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>
      {label && <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}
    </svg>
  )
}

// ─── Horizontal Bar ───
function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 150 + delay)
    return () => clearTimeout(t)
  }, [value, max, delay])
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>
    </div>
  )
}

// ─── Gauge Chart (semicircle) ───
function GaugeChart({ value, min, max, unit, size = 140, color, zones }) {
  const [animVal, setAnimVal] = useState(min)
  useEffect(() => {
    const duration = 1600
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      setAnimVal(min + (value - min) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, min])
  const cx = size / 2, cy = size / 2 + 10
  const r = size / 2 - 18
  const range = max - min
  const angle = ((animVal - min) / range) * 180
  const needleX = cx + r * 0.75 * Math.cos((180 + angle) * Math.PI / 180)
  const needleY = cy + r * 0.75 * Math.sin((180 + angle) * Math.PI / 180)

  // Zone arcs
  const zoneArcs = (zones || []).map((z) => {
    const startAngle = ((z.from - min) / range) * 180
    const endAngle = ((z.to - min) / range) * 180
    const x1 = cx + r * Math.cos((180 + startAngle) * Math.PI / 180)
    const y1 = cy + r * Math.sin((180 + startAngle) * Math.PI / 180)
    const x2 = cx + r * Math.cos((180 + endAngle) * Math.PI / 180)
    const y2 = cy + r * Math.sin((180 + endAngle) * Math.PI / 180)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return <path key={z.from} d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" opacity="0.25" />
  })

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
      {/* Background arc */}
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
      {/* Zone arcs */}
      {zoneArcs}
      {/* Value arc */}
      {angle > 0 && (() => {
        const endX = cx + r * Math.cos((180 + angle) * Math.PI / 180)
        const endY = cy + r * Math.sin((180 + angle) * Math.PI / 180)
        const large = angle > 180 ? 1 : 0
        return <path d={`M${cx - r},${cy} A${r},${r} 0 ${large} 1 ${endX},${endY}`} fill="none" stroke={color || ACCENT} strokeWidth="10" strokeLinecap="round" />
      })()}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
      {/* Labels */}
      <text x={cx - r - 4} y={cy + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">{min}</text>
      <text x={cx + r + 4} y={cy + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">{max}</text>
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{numFmt(animVal)}</text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="10" fill="#94a3b8">{unit}</text>
    </svg>
  )
}

function numFmt(v) { return v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1) }

// ─── Radar Chart ───
function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => {
    const duration = 1400
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setAnimScale(1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [data])
  const cx = size / 2, cy = size / 2, r = size / 2 - 24
  const n = data.length
  const angle = (2 * Math.PI) / n
  const getPoint = (i, val) => {
    const a = angle * i - Math.PI / 2
    const dist = (val / 100) * r * animScale
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }
  }
  return (
    <svg width={size} height={size}>
      {[25, 50, 75, 100].map((lv) => (
        <polygon key={lv}
          points={Array.from({ length: n }, (_, i) => { const a = angle * i - Math.PI / 2; const d = (lv / 100) * r; return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}` }).join(' ')}
          fill="none" stroke="#e8ecf1" strokeWidth="0.5" />
      ))}
      {data.map((_, i) => {
        const a = angle * i - Math.PI / 2
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" />
      })}
      <polygon
        points={data.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}` }).join(' ')}
        fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />
      {data.map((d, i) => {
        const p = getPoint(i, d.value)
        const lp = { x: cx + (r + 16) * Math.cos(angle * i - Math.PI / 2), y: cy + (r + 16) * Math.sin(angle * i - Math.PI / 2) }
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={ACCENT} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Stacked Bar Chart ───
function StackedBar({ segments, height = 20 }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), 200); return () => clearTimeout(t) }, [])
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (
    <div style={{ display: 'flex', height: `${height}px`, borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
      {segments.map((seg, i) => (
        <div key={i} style={{
          width: anim ? `${(seg.value / total) * 100}%` : '0%',
          background: seg.color, transition: `width 1.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'
        }}>
          {(seg.value / total) * 100 > 10 ? `${Math.round((seg.value / total) * 100)}%` : ''}
        </div>
      ))}
    </div>
  )
}

// ─── Live Sparkline (simulated) ───
function Sparkline({ data, color, height = 32 }) {
  const ref = useRef(null)
  const [w, setW] = useState(100)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const max = Math.max(...data) * 1.05
  const min = Math.min(...data) * 0.95
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Last point dot */}
        {data.length > 0 && (() => {
          const lastX = w
          const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2
          return <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
        })()}
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════

const kilnOverview = {
  status: 'Running',
  uptime: 98.7,
  runHours: 7126,
  speed: 3.8,
  torque: 72,
  load: 87,
  feedRate: 245,
  burningZoneTemp: 1452,
  backEndTemp: 1050,
  exitGasTemp: 328,
}

const zoneTemps = [
  { zone: 'Preheater Cyclone 1', temp: 328, target: 320, trend: [325, 330, 326, 328, 332, 329, 328], unit: '°C' },
  { zone: 'Preheater Cyclone 2', temp: 485, target: 480, trend: [478, 482, 490, 485, 483, 486, 485], unit: '°C' },
  { zone: 'Preheater Cyclone 3', temp: 628, target: 620, trend: [615, 622, 630, 625, 628, 626, 628], unit: '°C' },
  { zone: 'Preheater Cyclone 4', temp: 780, target: 770, trend: [772, 778, 785, 780, 776, 782, 780], unit: '°C' },
  { zone: 'Calciner', temp: 870, target: 860, trend: [858, 865, 872, 868, 870, 875, 870], unit: '°C' },
  { zone: 'Kiln Inlet', temp: 1050, target: 1040, trend: [1035, 1042, 1055, 1048, 1050, 1045, 1050], unit: '°C' },
  { zone: 'Transition Zone', temp: 1280, target: 1270, trend: [1265, 1275, 1285, 1278, 1280, 1282, 1280], unit: '°C' },
  { zone: 'Burning Zone', temp: 1452, target: 1450, trend: [1440, 1448, 1455, 1450, 1452, 1458, 1452], unit: '°C' },
]

const shellTemps = [
  { position: '0m', temp: 285, limit: 350 },
  { position: '5m', temp: 265, limit: 350 },
  { position: '10m', temp: 310, limit: 350 },
  { position: '15m', temp: 342, limit: 350 },
  { position: '20m', temp: 338, limit: 350 },
  { position: '25m', temp: 295, limit: 350 },
  { position: '30m', temp: 278, limit: 350 },
  { position: '35m', temp: 252, limit: 350 },
  { position: '40m', temp: 228, limit: 350 },
  { position: '45m', temp: 195, limit: 350 },
  { position: '50m', temp: 168, limit: 350 },
  { position: '55m', temp: 145, limit: 350 },
]

const combustionParams = [
  { label: 'Primary Air', value: 12.5, unit: '%', target: 12, trend: [12.1, 12.3, 12.8, 12.4, 12.5, 12.6, 12.5] },
  { label: 'Secondary Air Temp', value: 1085, unit: '°C', target: 1100, trend: [1070, 1078, 1090, 1082, 1085, 1088, 1085] },
  { label: 'Tertiary Air Temp', value: 820, unit: '°C', target: 830, trend: [810, 815, 825, 818, 820, 822, 820] },
  { label: 'Excess O2', value: 2.1, unit: '%', target: 2.0, trend: [1.8, 2.0, 2.3, 2.1, 2.0, 2.2, 2.1] },
  { label: 'CO at Preheater', value: 0.08, unit: '%', target: 0.1, trend: [0.06, 0.07, 0.09, 0.08, 0.07, 0.08, 0.08] },
  { label: 'NOx Emission', value: 480, unit: 'mg/Nm³', target: 500, trend: [460, 470, 490, 475, 480, 485, 480] },
]

const fuelData = {
  heatConsumption: 725,
  targetHeat: 710,
  coalFeedRate: 28.5,
  altFuelRate: 4.2,
  tsr: 14.7, // thermal substitution rate
  fuelMix: [
    { name: 'Petcoke', value: 52, color: '#1e293b' },
    { name: 'Coal', value: 28, color: ACCENT },
    { name: 'AFR (Tyres)', value: 8, color: '#f59e0b' },
    { name: 'AFR (RDF)', value: 7, color: '#16a34a' },
    { name: 'Biomass', value: 5, color: '#3b82f6' },
  ],
}

const coatingData = [
  { zone: 'Zone 1 (0-10m)', thickness: 85, stability: 'Stable', color: '#16a34a' },
  { zone: 'Zone 2 (10-20m)', thickness: 120, stability: 'Stable', color: '#16a34a' },
  { zone: 'Zone 3 (20-30m)', thickness: 145, stability: 'Building', color: '#3b82f6' },
  { zone: 'Zone 4 (30-40m)', thickness: 92, stability: 'Thinning', color: '#f59e0b' },
  { zone: 'Zone 5 (40-50m)', thickness: 68, stability: 'Stable', color: '#16a34a' },
]

const aiRecommendations = [
  { priority: 'high', title: 'Reduce Kiln Speed by 0.1 RPM', reason: 'Burning zone temp trending 8°C above optimal. Slight speed reduction will improve clinker quality and reduce free lime.', impact: 'Free lime reduction: -0.08%', model: 'LSTM Thermal Predictor', confidence: 94 },
  { priority: 'medium', title: 'Increase Secondary Air Damper to 78%', reason: 'O2 levels at 2.1% indicate slight excess. Better air distribution will improve combustion efficiency.', impact: 'Heat savings: ~3 kcal/kg', model: 'Combustion Optimizer NN', confidence: 89 },
  { priority: 'medium', title: 'Adjust Coal Fineness to 12% R90', reason: 'Current coal residue at 14% R90 causing incomplete combustion in calciner zone. Finer grinding recommended.', impact: 'CO reduction: -0.02%', model: 'Fuel Quality Predictor', confidence: 91 },
  { priority: 'low', title: 'Schedule Coating Inspection at Zone 4', reason: 'Shell temperature at 15m position approaching limit (342°C/350°C). Coating may be thinning — predictive model flags next 48hrs.', impact: 'Prevent refractory damage', model: 'Refractory Health CNN', confidence: 87 },
  { priority: 'info', title: 'TSR Increase Opportunity', reason: 'Stable kiln conditions allow TSR increase from 14.7% to 18%. RDF feed system capacity available.', impact: 'Cost savings: ~$2.4/ton', model: 'AFR Optimizer', confidence: 82 },
]

const processRadar = [
  { label: 'Temp Control', value: 92 },
  { label: 'Combustion', value: 88 },
  { label: 'Feed Stability', value: 95 },
  { label: 'Shell Health', value: 85 },
  { label: 'Emissions', value: 90 },
  { label: 'Energy', value: 87 },
]

const clinkerQuality = [
  { label: 'Free Lime (f-CaO)', value: 1.18, unit: '%', target: '<1.5', status: 'good' },
  { label: 'Litre Weight', value: 1320, unit: 'g/L', target: '1250-1400', status: 'good' },
  { label: 'C3S Content', value: 62.1, unit: '%', target: '55-70', status: 'good' },
  { label: 'C2S Content', value: 14.8, unit: '%', target: '10-20', status: 'good' },
  { label: 'C3A Content', value: 7.2, unit: '%', target: '5-10', status: 'good' },
  { label: 'C4AF Content', value: 10.5, unit: '%', target: '8-13', status: 'good' },
]

const coolerData = {
  grateSpeed: 14.2,
  undergrate: 5800,
  clinkerTemp: 120,
  recuperation: 72,
  airFlow: [
    { fan: 'Fan 1', flow: 42000, target: 45000 },
    { fan: 'Fan 2', flow: 38500, target: 40000 },
    { fan: 'Fan 3', flow: 35200, target: 36000 },
    { fan: 'Fan 4', flow: 28800, target: 30000 },
    { fan: 'Fan 5', flow: 22100, target: 24000 },
  ],
}

const trendHistory = {
  burnZone: [1440, 1448, 1455, 1450, 1445, 1452, 1458, 1450, 1448, 1452, 1455, 1450, 1447, 1452, 1456, 1453, 1449, 1452, 1454, 1450, 1448, 1451, 1453, 1452],
  freeLime: [1.32, 1.28, 1.24, 1.20, 1.22, 1.18, 1.15, 1.18, 1.20, 1.18, 1.16, 1.18],
  heatRate: [735, 730, 728, 725, 722, 725, 728, 725, 720, 725, 722, 725],
  kilnDrive: [68, 70, 72, 71, 73, 72, 70, 72, 74, 72, 71, 72],
}

const edgeServers = [
  { name: 'Edge-Node-01 (Kiln)', type: 'NVIDIA Jetson AGX Orin', gpu: 'Orin 64GB', gpuUtil: 72, cpuUtil: 48, ram: 78, temp: 62, status: 'Online', ip: '10.0.1.101', models: 3, inferenceRate: 245 },
  { name: 'Edge-Node-02 (Cooler)', type: 'NVIDIA Jetson AGX Orin', gpu: 'Orin 64GB', gpuUtil: 58, cpuUtil: 35, ram: 62, temp: 55, status: 'Online', ip: '10.0.1.102', models: 2, inferenceRate: 180 },
  { name: 'Edge-Node-03 (Mill)', type: 'NVIDIA Jetson Orin NX', gpu: 'Orin NX 16GB', gpuUtil: 85, cpuUtil: 62, ram: 88, temp: 68, status: 'Online', ip: '10.0.1.103', models: 2, inferenceRate: 120 },
  { name: 'Edge-Node-04 (Vision)', type: 'NVIDIA A2 Server', gpu: 'A2 16GB', gpuUtil: 91, cpuUtil: 45, ram: 72, temp: 71, status: 'Online', ip: '10.0.1.104', models: 4, inferenceRate: 340 },
]

const onPremServers = [
  { name: 'AI-Server-Primary', type: 'Dell PowerEdge R750xa', gpu: '2x NVIDIA A100 80GB', gpuUtil: 64, cpuUtil: 38, ram: 52, disk: 34, temp: 58, status: 'Online', ip: '10.0.0.10', role: 'Model Training & LLM Inference' },
  { name: 'AI-Server-Secondary', type: 'Dell PowerEdge R750xa', gpu: '2x NVIDIA A100 80GB', gpuUtil: 42, cpuUtil: 28, ram: 45, disk: 28, temp: 52, status: 'Online', ip: '10.0.0.11', role: 'Redundancy & Batch Processing' },
  { name: 'Data-Server-01', type: 'Dell PowerEdge R740xd', gpu: 'None', gpuUtil: 0, cpuUtil: 55, ram: 68, disk: 62, temp: 48, status: 'Online', ip: '10.0.0.20', role: 'Time-Series DB & Historian' },
]

const llmModels = [
  { name: 'iFactory-Kiln-LLM-7B', baseModel: 'Llama 3 8B (Fine-tuned)', params: '7B', vram: '14 GB', quantization: 'GPTQ 4-bit', server: 'AI-Server-Primary', status: 'Serving', latency: 120, tokensPerSec: 85, context: '8K tokens', purpose: 'Kiln process reasoning, anomaly root-cause analysis, operator Q&A' },
  { name: 'iFactory-Vision-LLM-13B', baseModel: 'LLaVA 1.6 13B', params: '13B', vram: '28 GB', quantization: 'GPTQ 4-bit', server: 'AI-Server-Primary', status: 'Serving', latency: 280, tokensPerSec: 42, context: '4K tokens + image', purpose: 'Thermal image analysis, coating inspection, crack detection from camera feeds' },
  { name: 'iFactory-Report-LLM-7B', baseModel: 'Mistral 7B (Fine-tuned)', params: '7B', vram: '14 GB', quantization: 'AWQ 4-bit', server: 'AI-Server-Secondary', status: 'Serving', latency: 95, tokensPerSec: 110, context: '32K tokens', purpose: 'Auto-generate shift reports, compliance docs, maintenance summaries' },
  { name: 'iFactory-Embedding', baseModel: 'BGE-Large-EN-v1.5', params: '335M', vram: '1.2 GB', quantization: 'FP16', server: 'AI-Server-Primary', status: 'Serving', latency: 8, tokensPerSec: 2400, context: '512 tokens', purpose: 'RAG embeddings for plant SOPs, manuals, and historical incident database' },
]

const inferencePipelines = [
  { name: 'Thermal Anomaly Detection', type: 'Real-time', source: 'PLC/DCS → OPC-UA', edge: 'Edge-Node-01', model: 'LSTM Thermal', interval: '500ms', throughput: '2,000 infer/min', latency: '12ms', sla: '< 50ms' },
  { name: 'Kiln Shell IR Scanner', type: 'Real-time', source: 'IR Camera → RTSP', edge: 'Edge-Node-04', model: 'CNN Thermal', interval: '1 frame/sec', throughput: '60 infer/min', latency: '85ms', sla: '< 200ms' },
  { name: 'Combustion Optimizer', type: 'Periodic', source: 'Historian DB', edge: 'Edge-Node-01', model: 'NN Combustion', interval: '30s', throughput: '2 infer/min', latency: '450ms', sla: '< 2s' },
  { name: 'Quality Prediction (XRF)', type: 'Event-driven', source: 'Lab LIMS → API', edge: 'Edge-Node-03', model: 'XGBoost Quality', interval: 'On sample', throughput: '~4 infer/hr', latency: '25ms', sla: '< 1s' },
  { name: 'LLM Root-Cause Analysis', type: 'On-demand', source: 'Alert trigger', edge: 'AI-Server-Primary', model: 'iFactory-Kiln-LLM-7B', interval: 'Per alert', throughput: '~20/day', latency: '1.2s', sla: '< 5s' },
  { name: 'Vision Coating Inspection', type: 'Scheduled', source: 'Kiln Camera → RTSP', edge: 'Edge-Node-04', model: 'iFactory-Vision-LLM-13B', interval: '15 min', throughput: '96 infer/day', latency: '2.8s', sla: '< 10s' },
  { name: 'Auto Report Generation', type: 'Scheduled', source: 'Historian + Alerts', edge: 'AI-Server-Secondary', model: 'iFactory-Report-LLM-7B', interval: '8 hr (shift)', throughput: '3/day', latency: '4.5s', sla: '< 30s' },
]

const networkTopology = [
  { layer: 'Field Layer', devices: '127 sensors, 14 PLCs, 6 VFDs', protocol: 'Modbus TCP / Profinet', latency: '< 5ms' },
  { layer: 'Edge Layer', devices: '4 Edge Nodes (Jetson/A2)', protocol: 'OPC-UA / MQTT', latency: '< 15ms' },
  { layer: 'Plant Server', devices: '3 On-Premise Servers', protocol: 'gRPC / REST API', latency: '< 50ms' },
  { layer: 'Data Layer', devices: 'TimescaleDB, MinIO, Redis', protocol: 'PostgreSQL / S3 API', latency: '< 10ms' },
  { layer: 'Application', devices: 'iFactory Platform (this UI)', protocol: 'HTTPS / WebSocket', latency: '< 100ms' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

function KilnOptimization() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)

  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (t) => tab === 'all' || tab === t

  const tabs = [
    { key: 'all', label: 'Full Process View', count: 52 },
    { key: 'thermal', label: 'Thermal Profile', count: 8 },
    { key: 'combustion', label: 'Combustion', count: 6 },
    { key: 'fuel', label: 'Fuel & Energy', count: 7 },
    { key: 'quality', label: 'Clinker Quality', count: 6 },
    { key: 'cooler', label: 'Cooler', count: 6 },
    { key: 'ai', label: 'AI Optimization', count: 5 },
    { key: 'infra', label: 'Edge AI Infra', count: 14 },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Kiln Process Optimization</h1>
          <p style={s.sub}>AI-driven kiln monitoring, combustion control, and process optimization</p>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s infinite' }} /> Kiln: Running</span>
          <span style={s.aiBadge}>AI Optimizer: Active</span>
          <span style={s.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ─── Kiln Status Bar ─── */}
      <div style={s.statusBar}>
        {[
          { label: 'Kiln Speed', value: `${kilnOverview.speed} RPM`, icon: 'SP' },
          { label: 'Torque', value: `${kilnOverview.torque}%`, icon: 'TQ' },
          { label: 'Motor Load', value: `${kilnOverview.load}%`, icon: 'ML' },
          { label: 'Feed Rate', value: `${kilnOverview.feedRate} TPH`, icon: 'FR' },
          { label: 'Burning Zone', value: `${kilnOverview.burningZoneTemp}°C`, icon: 'BZ' },
          { label: 'Exit Gas', value: `${kilnOverview.exitGasTemp}°C`, icon: 'EG' },
          { label: 'Uptime', value: `${kilnOverview.uptime}%`, icon: 'UP' },
          { label: 'Run Hours', value: kilnOverview.runHours.toLocaleString(), icon: 'RH' },
        ].map((item, i) => (
          <div key={item.label} style={{ ...s.statusItem, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both` }}>
            <div style={s.statusIcon}>{item.icon}</div>
            <div>
              <div style={s.statusLabel}>{item.label}</div>
              <div style={s.statusValue}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Category Tabs ─── */}
      <div style={s.catBar}>
        {tabs.map((t) => (
          <button key={t.key} style={tab === t.key ? s.catActive : s.catBtn} onClick={() => switchTab(t.key)}>
            {t.label} <span style={tab === t.key ? s.catCountActive : s.catCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ THERMAL PROFILE ═══════════════ */}
      {show('thermal') && (
        <Section title="Thermal Profile" badge="Digital Twin Synced" icon="TP">
          {/* Zone Temperatures */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>Kiln Zone Temperature Profile</div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Preheater → Burning Zone</span>
            </div>
            {/* Visual temperature gradient bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              {zoneTemps.map((z, i) => {
                const ratio = z.temp / 1500
                const col = ratio > 0.85 ? '#dc2626' : ratio > 0.65 ? '#ea580c' : ratio > 0.45 ? '#f59e0b' : ratio > 0.3 ? '#16a34a' : ACCENT
                return <div key={i} style={{ flex: 1, background: col, transition: 'all 1s ease' }} />
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {zoneTemps.map((z, i) => {
                const diff = z.temp - z.target
                const diffColor = Math.abs(diff) > 15 ? '#f59e0b' : '#16a34a'
                return (
                  <div key={z.zone} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>{z.zone}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={z.temp} /></span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{z.unit}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>Target: {z.target}°C</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: diffColor }}>{diff > 0 ? '+' : ''}{diff}°C</span>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <Sparkline data={z.trend} color={ACCENT} height={24} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shell Temperature Scanner */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>Shell Temperature Scanner (IR Pyrometer)</div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>All within limits</span>
            </div>
            {/* Shell temp visualization */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '0 8px' }}>
              {shellTemps.map((st, i) => {
                const ratio = st.temp / st.limit
                const h = (st.temp / 350) * 100
                const col = ratio > 0.95 ? '#ef4444' : ratio > 0.85 ? '#f59e0b' : ratio > 0.6 ? '#ea580c' : ACCENT
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>{st.temp}°C</span>
                    <div style={{
                      width: '100%', height: `${h}%`, background: `linear-gradient(to top, ${col}40, ${col})`,
                      borderRadius: '4px 4px 2px 2px', transition: 'height 1.4s cubic-bezier(0.22,1,0.36,1)',
                      minHeight: '4px'
                    }} />
                    <span style={{ fontSize: '8px', color: '#94a3b8' }}>{st.position}</span>
                  </div>
                )
              })}
            </div>
            {/* Limit line label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', paddingLeft: '8px' }}>
              <div style={{ width: '20px', height: '2px', background: '#ef4444', borderRadius: '1px' }} />
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Alarm limit: 350°C</span>
            </div>
          </div>

          {/* 24hr Burning Zone Trend */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.cardLabel}>24hr Burning Zone Temperature Trend</div>
            <div style={{ marginTop: '12px' }}>
              <AreaChart data={trendHistory.burnZone} color="#dc2626" height={100} />
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div><span style={s.tinyLabel}>Min </span><span style={s.tinyVal}>1,440°C</span></div>
              <div><span style={s.tinyLabel}>Max </span><span style={s.tinyVal}>1,458°C</span></div>
              <div><span style={s.tinyLabel}>Avg </span><span style={s.tinyVal}>1,451°C</span></div>
              <div><span style={s.tinyLabel}>Std Dev </span><span style={s.tinyVal}>4.2°C</span></div>
              <div><span style={s.tinyLabel}>Stability </span><span style={{ ...s.tinyVal, color: '#16a34a' }}>Excellent</span></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ COMBUSTION ═══════════════ */}
      {show('combustion') && (
        <Section title="Combustion Control" badge="Neural Network Active" icon="CB">
          <div style={s.row}>
            {/* Gauges */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Key Combustion Gauges</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={2.1} min={0} max={5} unit="% O2" size={140} color="#3b82f6"
                    zones={[{ from: 0, to: 1.5, color: '#ef4444' }, { from: 1.5, to: 3, color: '#16a34a' }, { from: 3, to: 5, color: '#f59e0b' }]} />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Excess Oxygen</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={0.08} min={0} max={0.5} unit="% CO" size={140} color="#16a34a"
                    zones={[{ from: 0, to: 0.1, color: '#16a34a' }, { from: 0.1, to: 0.3, color: '#f59e0b' }, { from: 0.3, to: 0.5, color: '#ef4444' }]} />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>CO Level</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={480} min={0} max={800} unit="mg/Nm³" size={140} color={ACCENT}
                    zones={[{ from: 0, to: 400, color: '#16a34a' }, { from: 400, to: 600, color: '#f59e0b' }, { from: 600, to: 800, color: '#ef4444' }]} />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>NOx Emission</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <GaugeChart value={1085} min={800} max={1200} unit="°C" size={140} color="#ea580c"
                    zones={[{ from: 800, to: 950, color: '#3b82f6' }, { from: 950, to: 1100, color: '#16a34a' }, { from: 1100, to: 1200, color: '#ef4444' }]} />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Secondary Air</div>
                </div>
              </div>
            </div>
            {/* Parameters Table */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Combustion Parameters</div>
              <div style={{ marginTop: '12px' }}>
                {combustionParams.map((p, i) => {
                  const diff = p.value - p.target
                  const pct = (Math.abs(diff) / p.target) * 100
                  const statusColor = pct > 5 ? '#f59e0b' : '#16a34a'
                  return (
                    <div key={p.label} style={{ ...s.paramRow, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                      <div style={{ flex: 2 }}>
                        <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{p.label}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Target: {p.target} {p.unit}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{p.value}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}> {p.unit}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Sparkline data={p.trend} color={statusColor} height={24} />
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: statusColor + '15', padding: '2px 6px', borderRadius: '4px' }}>
                        {pct > 5 ? 'WATCH' : 'OK'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ FUEL & ENERGY ═══════════════ */}
      {show('fuel') && (
        <Section title="Fuel & Energy Management" badge="Cost Optimizer" icon="FE">
          <div style={s.row}>
            {/* Fuel Mix */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Fuel Mix Composition</div>
              <div style={{ marginTop: '14px' }}>
                <StackedBar segments={fuelData.fuelMix} height={28} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
                  {fuelData.fuelMix.map((f) => (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: f.color }} />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{f.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{f.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '18px' }}>
                <div style={s.miniCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Coal Feed Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={fuelData.coalFeedRate} /> <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>TPH</span></div>
                </div>
                <div style={s.miniCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>AFR Feed Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={fuelData.altFuelRate} /> <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>TPH</span></div>
                </div>
                <div style={s.miniCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>TSR (Thermal Substitution)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: ACCENT }}><AnimatedValue value={fuelData.tsr} suffix="%" /></div>
                </div>
                <div style={s.miniCard}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Target TSR</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>18.0%</div>
                </div>
              </div>
            </div>
            {/* Heat Consumption */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Specific Heat Consumption</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <GaugeChart value={fuelData.heatConsumption} min={600} max={850} unit="kcal/kg clinker" size={180} color={ACCENT}
                  zones={[{ from: 600, to: 700, color: '#16a34a' }, { from: 700, to: 750, color: '#f59e0b' }, { from: 750, to: 850, color: '#ef4444' }]} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target: {fuelData.targetHeat} kcal/kg</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#f59e0b', marginLeft: '12px' }}>+{fuelData.heatConsumption - fuelData.targetHeat} above target</span>
              </div>
              <div style={{ marginTop: '18px' }}>
                <div style={s.cardLabel}>24hr Heat Rate Trend</div>
                <div style={{ marginTop: '8px' }}>
                  <AreaChart data={trendHistory.heatRate} color={ACCENT} height={80} />
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <div style={s.cardLabel}>Kiln Drive Power Trend</div>
                <div style={{ marginTop: '8px' }}>
                  <AreaChart data={trendHistory.kilnDrive} color="#3b82f6" height={60} />
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ CLINKER QUALITY ═══════════════ */}
      {show('quality') && (
        <Section title="Clinker Quality Control" badge="XRF/XRD AI Analysis" icon="QC">
          <div style={s.row}>
            {/* Process Performance Radar */}
            <div style={{ ...s.card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={s.cardLabel}>Process Performance Index</div>
              <div style={{ marginTop: '8px' }}>
                <RadarChart data={processRadar} size={220} />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Overall Score: 89.5 / 100</div>
            </div>
            {/* Quality Parameters */}
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Clinker Mineralogy</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
                {clinkerQuality.map((q, i) => (
                  <div key={q.label} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{q.label}</span>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>IN RANGE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}><AnimatedValue value={q.value} /></span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{q.unit}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Range: {q.target}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={s.cardLabel}>Free Lime Trend (12hr)</div>
                <div style={{ marginTop: '8px' }}>
                  <AreaChart data={trendHistory.freeLime} color="#16a34a" height={70} />
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                  <div><span style={s.tinyLabel}>Current </span><span style={s.tinyVal}>1.18%</span></div>
                  <div><span style={s.tinyLabel}>12hr Avg </span><span style={s.tinyVal}>1.21%</span></div>
                  <div><span style={s.tinyLabel}>Target </span><span style={s.tinyVal}>&lt;1.5%</span></div>
                  <div><span style={s.tinyLabel}>Trend </span><span style={{ ...s.tinyVal, color: '#16a34a' }}>Improving</span></div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ REFRACTORY / COATING ═══════════════ */}
      {show('thermal') && (
        <Section title="Refractory & Coating Health" badge="CNN Thermal Analysis" icon="RF">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardLabel}>Coating Thickness by Zone</div>
              <div style={{ marginTop: '14px' }}>
                {coatingData.map((c, i) => (
                  <div key={c.zone} style={{ marginBottom: '14px', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>{c.zone}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{c.thickness} mm</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: c.color, background: c.color + '15', padding: '2px 8px', borderRadius: '10px' }}>{c.stability}</span>
                      </div>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(c.thickness / 200) * 100}%`, background: `linear-gradient(90deg, ${c.color}80, ${c.color})`, borderRadius: '4px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Refractory Summary</div>
              <div style={{ marginTop: '14px' }}>
                {[
                  { label: 'Avg Coating', value: '102 mm', color: '#16a34a' },
                  { label: 'Thinnest Point', value: '68 mm (Zone 5)', color: '#f59e0b' },
                  { label: 'Hot Spot Count', value: '1', color: '#f59e0b' },
                  { label: 'Refractory Age', value: '8.2 months', color: '#1e293b' },
                  { label: 'Next Inspection', value: '14 days', color: ACCENT },
                  { label: 'Lining Health', value: '87%', color: '#16a34a' },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both` }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ COOLER ═══════════════ */}
      {show('cooler') && (
        <Section title="Clinker Cooler Performance" badge="Heat Recovery AI" icon="CL">
          <div style={s.row}>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Cooler Overview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '14px' }}>
                {[
                  { label: 'Grate Speed', value: coolerData.grateSpeed, unit: 'strokes/min', color: ACCENT },
                  { label: 'Undergrate Pressure', value: coolerData.undergrate, unit: 'mmWG', color: '#3b82f6' },
                  { label: 'Clinker Exit Temp', value: coolerData.clinkerTemp, unit: '°C', color: '#16a34a' },
                  { label: 'Heat Recuperation', value: coolerData.recuperation, unit: '%', color: '#ea580c' },
                ].map((item, i) => (
                  <div key={item.label} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: item.color, marginTop: '4px' }}>
                      <AnimatedValue value={item.value} />
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardLabel}>Cooling Fan Air Flow</div>
              <div style={{ marginTop: '12px' }}>
                {coolerData.airFlow.map((f, i) => (
                  <HBar key={f.fan} label={f.fan} value={f.flow} max={f.target * 1.1} unit="Nm³/hr"
                    color={f.flow / f.target < 0.9 ? '#f59e0b' : ACCENT} delay={i * 120} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={s.tinyLabel}>Total Flow </span><span style={s.tinyVal}>166,600 Nm³/hr</span></div>
                <div><span style={s.tinyLabel}>Sp. Air </span><span style={s.tinyVal}>2.14 Nm³/kg</span></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ AI OPTIMIZATION ═══════════════ */}
      {show('ai') && (
        <Section title="AI Optimization Engine" badge="5 Active Models" icon="AI">
          {/* Recommendations */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>AI-Generated Recommendations</div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Auto-generated every 15 min</span>
            </div>
            {aiRecommendations.map((rec, i) => {
              const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#16a34a' }
              const pLabels = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW', info: 'INFO' }
              const pc = pColors[rec.priority]
              return (
                <div key={i} style={{
                  display: 'flex', gap: '14px', padding: '16px', marginBottom: '10px',
                  background: '#f8fafc', borderRadius: '10px', border: `1px solid ${pc}20`, borderLeft: `3px solid ${pc}`,
                  animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: pc, background: pc + '15', padding: '3px 8px', borderRadius: '4px' }}>{pLabels[rec.priority]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{rec.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6, marginBottom: '8px' }}>{rec.reason}</div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>{rec.impact}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>Model: {rec.model}</span>
                      <span style={{ fontSize: '9px', color: ACCENT, fontWeight: 600 }}>Confidence: {rec.confidence}%</span>
                    </div>
                  </div>
                  <button style={{ ...s.actionBtn, flexShrink: 0, alignSelf: 'center' }}>Apply</button>
                </div>
              )
            })}
          </div>

          {/* Model Status */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.cardLabel}>Active AI Models</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '14px' }}>
              {[
                { name: 'LSTM Thermal Predictor', accuracy: 96.8, lastTrain: '2hr ago', status: 'Active' },
                { name: 'Combustion Optimizer NN', accuracy: 94.2, lastTrain: '4hr ago', status: 'Active' },
                { name: 'Fuel Quality Predictor', accuracy: 91.5, lastTrain: '6hr ago', status: 'Retraining' },
                { name: 'Refractory Health CNN', accuracy: 89.3, lastTrain: '12hr ago', status: 'Active' },
                { name: 'AFR Optimizer', accuracy: 87.1, lastTrain: '8hr ago', status: 'Active' },
              ].map((model, i) => (
                <div key={model.name} style={{ ...s.miniCard, textAlign: 'center', animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both` }}>
                  <div style={{ margin: '4px auto 8px' }}>
                    <DonutChart value={model.accuracy} max={100} size={60} strokeWidth={5} color={model.accuracy > 90 ? '#16a34a' : ACCENT} label="accuracy" />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{model.name}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Last train: {model.lastTrain}</div>
                  <span style={{
                    display: 'inline-block', marginTop: '6px', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                    color: model.status === 'Active' ? '#16a34a' : '#f59e0b',
                    background: model.status === 'Active' ? '#f0fdf4' : '#fff7ed'
                  }}>{model.status}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ EDGE AI INFRASTRUCTURE ═══════════════ */}
      {show('infra') && (
        <Section title="On-Premise Edge AI Infrastructure" badge="All Systems Online" icon="SV">
          {/* Edge Nodes */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>Edge Computing Nodes</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>4/4 Online</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: ACCENT, background: ACCENT + '12', padding: '3px 8px', borderRadius: '6px' }}>885 infer/min total</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {edgeServers.map((srv, i) => {
                const gpuColor = srv.gpuUtil > 85 ? '#f59e0b' : srv.gpuUtil > 60 ? ACCENT : '#16a34a'
                return (
                  <div key={srv.name} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`, borderTop: `3px solid ${gpuColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{srv.name}</span>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '8px' }}>{srv.status}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '10px' }}>{srv.type}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>GPU: {srv.gpu}</div>
                    {/* GPU Utilization Bar */}
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>GPU</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: gpuColor }}>{srv.gpuUtil}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${srv.gpuUtil}%`, background: gpuColor, borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                    </div>
                    {/* CPU Bar */}
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>CPU</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>{srv.cpuUtil}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${srv.cpuUtil}%`, background: '#3b82f6', borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                    </div>
                    {/* RAM Bar */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>RAM</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>{srv.ram}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${srv.ram}%`, background: '#8b5cf6', borderRadius: '2px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', borderTop: '1px solid #e8ecf1', paddingTop: '6px' }}>
                      <span>{srv.temp}°C</span>
                      <span>{srv.models} models</span>
                      <span>{srv.inferenceRate}/min</span>
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px' }}>{srv.ip}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* On-Premise AI Servers */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>On-Premise AI Servers (Plant Data Center)</div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>Air-Gapped Network</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {onPremServers.map((srv, i) => (
                <div key={srv.name} style={{ ...s.miniCard, animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`, border: `1px solid ${ACCENT}25` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{srv.name}</span>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '8px' }}>{srv.status}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{srv.type}</div>
                  <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 600, marginBottom: '4px' }}>{srv.gpu}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '10px', fontStyle: 'italic' }}>{srv.role}</div>
                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: srv.gpuUtil > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '6px' }}>
                    {srv.gpuUtil > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: ACCENT }}>{srv.gpuUtil}%</div>
                        <div style={{ fontSize: '8px', color: '#94a3b8' }}>GPU</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6' }}>{srv.cpuUtil}%</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>CPU</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#8b5cf6' }}>{srv.ram}%</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>RAM</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{srv.disk}%</div>
                      <div style={{ fontSize: '8px', color: '#94a3b8' }}>Disk</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '8px', borderTop: '1px solid #e8ecf1', paddingTop: '6px' }}>IP: {srv.ip} | Temp: {srv.temp}°C</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ LLM MODELS DEPLOYED ═══════════════ */}
      {show('infra') && (
        <Section title="Deployed LLM Models (On-Premise)" badge="Private & Air-Gapped" icon="LM">
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>Local LLM Inference Endpoints</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: ACCENT, background: ACCENT + '12', padding: '3px 8px', borderRadius: '6px' }}>No data leaves plant network</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>vLLM Serving</span>
              </div>
            </div>
            {llmModels.map((llm, i) => (
              <div key={llm.name} style={{
                display: 'flex', gap: '16px', padding: '16px', marginBottom: '10px',
                background: '#f8fafc', borderRadius: '10px', border: `1px solid ${ACCENT}15`, borderLeft: `3px solid ${ACCENT}`,
                animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`
              }}>
                {/* Model Icon */}
                <div style={{ flexShrink: 0, width: '42px', height: '42px', borderRadius: '10px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>LLM</div>
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{llm.name}</span>
                    <span style={{
                      fontSize: '8px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                      color: '#16a34a', background: '#f0fdf4'
                    }}>{llm.status}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>Base: {llm.baseModel}</div>
                  <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: 1.6, marginBottom: '8px' }}>{llm.purpose}</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <MetricBadge label="Params" value={llm.params} />
                    <MetricBadge label="VRAM" value={llm.vram} />
                    <MetricBadge label="Quant" value={llm.quantization} />
                    <MetricBadge label="Context" value={llm.context} />
                    <MetricBadge label="Latency" value={`${llm.latency}ms`} />
                    <MetricBadge label="Throughput" value={`${llm.tokensPerSec} tok/s`} />
                    <MetricBadge label="Server" value={llm.server} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══════════════ INFERENCE PIPELINES ═══════════════ */}
      {show('infra') && (
        <Section title="Real-Time Inference Pipelines" badge="7 Active Pipelines" icon="PL">
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={s.cardLabel}>Edge-to-Model Data Flow</div>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>Sensor → OPC-UA → Edge Node → Model → Action</span>
            </div>
            {/* Pipeline table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.2fr 1fr 1fr 1fr 0.8fr', gap: '8px', padding: '8px 12px', background: ACCENT + '08', borderRadius: '8px 8px 0 0', marginBottom: '2px' }}>
              {['Pipeline', 'Type', 'Data Source', 'Edge / Server', 'Interval', 'Throughput', 'Latency', 'SLA'].map(h => (
                <span key={h} style={{ fontSize: '9px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {inferencePipelines.map((p, i) => {
              const typeColors = { 'Real-time': '#16a34a', 'Periodic': '#3b82f6', 'Event-driven': '#f59e0b', 'On-demand': ACCENT, 'Scheduled': '#8b5cf6' }
              return (
                <div key={p.name} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.2fr 1fr 1fr 1fr 0.8fr', gap: '8px',
                  padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center',
                  animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{p.model}</div>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: typeColors[p.type] || '#64748b', background: (typeColors[p.type] || '#64748b') + '15', padding: '2px 6px', borderRadius: '4px', textAlign: 'center' }}>{p.type}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{p.source}</span>
                  <span style={{ fontSize: '10px', color: '#1e293b', fontWeight: 500 }}>{p.edge}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{p.interval}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{p.throughput}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: ACCENT }}>{p.latency}</span>
                  <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600 }}>{p.sla}</span>
                </div>
              )
            })}
          </div>

          {/* Network Topology */}
          <div style={{ ...s.card, marginTop: '14px' }}>
            <div style={s.cardLabel}>Plant Network Architecture (Air-Gapped)</div>
            <div style={{ marginTop: '14px' }}>
              {networkTopology.map((layer, i) => (
                <div key={layer.layer} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: i < networkTopology.length - 1 ? '0' : '0' }}>
                  {/* Layer box */}
                  <div style={{
                    ...s.miniCard, flex: 1, display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                    animation: `slideIn 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s both`,
                    borderLeft: `3px solid ${[ACCENT, '#3b82f6', '#16a34a', '#8b5cf6', '#ea580c'][i]}`
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: [ACCENT, '#3b82f6', '#16a34a', '#8b5cf6', '#ea580c'][i] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: [ACCENT, '#3b82f6', '#16a34a', '#8b5cf6', '#ea580c'][i], flexShrink: 0 }}>
                      {['FL', 'EG', 'SV', 'DB', 'AP'][i]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{layer.layer}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{layer.devices}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 600 }}>{layer.protocol}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Latency: {layer.latency}</div>
                    </div>
                  </div>
                  {/* Arrow between layers */}
                  {i < networkTopology.length - 1 && (
                    <div style={{ width: '100%', flex: 0, display: 'flex', justifyContent: 'center', margin: '-4px 0', position: 'relative' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" style={{ display: 'block', margin: '0 auto' }}>
                        <path d="M10 4 L10 16 M6 12 L10 16 L14 12" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Data sovereignty note */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '16px', padding: '12px 16px', background: '#16a34a08', borderRadius: '8px', border: '1px solid #16a34a20' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#16a34a15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>Data Sovereignty: 100% On-Premise</div>
                <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5 }}>
                  All sensor data, AI models, LLM inference, and process analytics run entirely on plant-local servers.
                  No data transmitted to external cloud. Air-gapped network with zero internet dependency. Compliant with IEC 62443 industrial cybersecurity standards.
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ─── AI Footer ─── */}
      <AIFooter />
    </div>
  )
}

// ─── Metric Badge (inline key-value) ───
function MetricBadge({ label, value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}:</span>
      <span style={{ color: '#1e293b', fontWeight: 700 }}>{value}</span>
    </span>
  )
}

// ─── Section Wrapper ───
function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2>
        </div>
        <span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>
      </div>
      {visible && children}
    </div>
  )
}

// ─── AI Footer ───
function AIFooter() {
  const [ref, visible] = useScrollReveal(0.2)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={s.aiFooter}>
      <div style={s.aiFooterIcon}>AI</div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Kiln Optimization Engine Summary</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          Monitoring 52 parameters across thermal, combustion, fuel, quality, cooler, and infrastructure systems.
          On-premise AI stack: 4 edge nodes (NVIDIA Jetson/A2), 2 AI servers (4x A100 80GB), 3 locally-deployed LLMs (Kiln-LLM-7B, Vision-LLM-13B, Report-LLM-7B) via vLLM serving.
          7 inference pipelines active with sub-50ms edge latency. All data processing air-gapped — zero cloud dependency.
          5 ML models + 4 LLMs running 885 inferences/min. 1 high-priority recommendation pending. Next retraining: 4 hours.
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },

  statusBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  statusItem: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '12px 16px', flex: 1, minWidth: '140px' },
  statusIcon: { width: '32px', height: '32px', borderRadius: '8px', background: ACCENT + '12', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 },
  statusLabel: { fontSize: '10px', color: '#94a3b8' },
  statusValue: { fontSize: '15px', fontWeight: 700, color: '#1e293b' },

  catBar: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' },
  catBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  catActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  catCount: { background: '#f1f5f9', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  catCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },

  row: { display: 'flex', gap: '14px' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' },
  miniCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },

  paramRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f8fafc' },

  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },

  actionBtn: { background: ACCENT, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },

  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}

export default KilnOptimization
