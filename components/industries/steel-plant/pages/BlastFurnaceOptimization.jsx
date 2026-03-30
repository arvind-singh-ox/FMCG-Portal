'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => {
    const duration = 1400, startTime = performance.now()
    const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
}

function AreaChart({ data, color, height = 50 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(200)
  useEffect(() => { const el = containerRef.current; if (!el) return; const ro = new ResizeObserver(([e]) => setCWidth(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1, w = cWidth
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gradId = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={containerRef} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gradId})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0)
  const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function GaugeChart({ value, min, max, unit, size = 140, color, zones }) {
  const [animVal, setAnimVal] = useState(min)
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimVal(min + (value - min) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [value, min])
  const cx = size/2, cy = size/2 + 10, r = size/2 - 18, range = max - min, angle = ((animVal - min) / range) * 180
  const needleX = cx + r * 0.75 * Math.cos((180 + angle) * Math.PI / 180), needleY = cy + r * 0.75 * Math.sin((180 + angle) * Math.PI / 180)
  const zoneArcs = (zones || []).map((z) => {
    const sa = ((z.from - min) / range) * 180, ea = ((z.to - min) / range) * 180
    const x1 = cx + r * Math.cos((180+sa)*Math.PI/180), y1 = cy + r * Math.sin((180+sa)*Math.PI/180)
    const x2 = cx + r * Math.cos((180+ea)*Math.PI/180), y2 = cy + r * Math.sin((180+ea)*Math.PI/180)
    return <path key={z.from} d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" opacity="0.25" />
  })
  const numFmt = (v) => v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1)
  return (<svg width={size} height={size/2+30} viewBox={`0 0 ${size} ${size/2+30}`}><path d={`M${cx-r},${cy} A${r},${r} 0 0 1 ${cx+r},${cy}`} fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />{zoneArcs}{angle > 0 && (() => { const eX = cx+r*Math.cos((180+angle)*Math.PI/180), eY = cy+r*Math.sin((180+angle)*Math.PI/180); return <path d={`M${cx-r},${cy} A${r},${r} 0 0 1 ${eX},${eY}`} fill="none" stroke={color||ACCENT} strokeWidth="10" strokeLinecap="round" /> })()}<line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="2" strokeLinecap="round" /><circle cx={cx} cy={cy} r="4" fill="#1e293b" /><text x={cx-r-4} y={cy+16} fontSize="9" fill="#94a3b8" textAnchor="middle">{min}</text><text x={cx+r+4} y={cy+16} fontSize="9" fill="#94a3b8" textAnchor="middle">{max}</text><text x={cx} y={cy-14} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{numFmt(animVal)}</text><text x={cx} y={cy+2} textAnchor="middle" fontSize="10" fill="#94a3b8">{unit}</text></svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value/max)*100), 150+delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}><span style={{ fontSize:'12px', color:'#64748b' }}>{label}</span><span style={{ fontSize:'12px', fontWeight:700, color:'#1e293b' }}>{value} {unit}</span></div><div style={{ height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}><div style={{ height:'100%', width:`${w}%`, background:color||ACCENT, borderRadius:'3px', transition:'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function HeatCell({ value, max, label, unit }) {
  const ratio = value / max
  let bg, color
  if (ratio >= 0.9) { bg = '#dc262620'; color = '#dc2626' } else if (ratio >= 0.75) { bg = '#ea580c20'; color = '#ea580c' } else if (ratio >= 0.6) { bg = '#f59e0b18'; color = '#d97706' } else if (ratio >= 0.4) { bg = '#16a34a15'; color = '#16a34a' } else { bg = `${ACCENT}15`; color = ACCENT }
  return (<div style={{ background:bg, borderRadius:'10px', padding:'14px 12px', textAlign:'center', border:`1px solid ${color}25`, position:'relative', overflow:'hidden' }}><div style={{ position:'absolute', bottom:0, left:0, width:`${ratio*100}%`, height:'3px', background:`linear-gradient(90deg, ${ACCENT}, ${color})`, borderRadius:'0 3px 0 0', transition:'width 1.2s ease' }} /><div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'6px', fontWeight:500 }}>{label}</div><div style={{ fontSize:'22px', fontWeight:800, color, lineHeight:1 }}>{value.toLocaleString()}</div><div style={{ fontSize:'9px', color:'#94a3b8', marginTop:'4px' }}>{unit}</div></div>)
}

function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => { const duration = 1400, start = performance.now(); const step = (now) => { const p = Math.min((now-start)/duration, 1); setAnimScale(1-Math.pow(1-p,3)); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [data])
  const cx = size/2, cy = size/2, r = size/2 - 24, n = data.length, angle = (2*Math.PI)/n
  const getPoint = (i, val) => { const a = angle*i - Math.PI/2, dist = (val/100)*r*animScale; return { x: cx+dist*Math.cos(a), y: cy+dist*Math.sin(a) } }
  return (<svg width={size} height={size}>{[25,50,75,100].map(lv => <polygon key={lv} points={Array.from({length:n},(_,i) => { const a=angle*i-Math.PI/2, d=(lv/100)*r; return `${cx+d*Math.cos(a)},${cy+d*Math.sin(a)}` }).join(' ')} fill="none" stroke="#e8ecf1" strokeWidth="0.5" />)}{data.map((_,i) => { const a=angle*i-Math.PI/2; return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" /> })}<polygon points={data.map((d,i) => { const p=getPoint(i,d.value); return `${p.x},${p.y}` }).join(' ')} fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />{data.map((d,i) => { const p=getPoint(i,d.value), lp={ x:cx+(r+16)*Math.cos(angle*i-Math.PI/2), y:cy+(r+16)*Math.sin(angle*i-Math.PI/2) }; return <g key={i}><circle cx={p.x} cy={p.y} r="3" fill={ACCENT} /><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text></g> })}</svg>)
}

function StackedBar({ segments, height = 20 }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), 200); return () => clearTimeout(t) }, [])
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (<div style={{ display:'flex', height:`${height}px`, borderRadius:'6px', overflow:'hidden', background:'#f1f5f9' }}>{segments.map((seg, i) => (<div key={i} style={{ width:anim ? `${(seg.value/total)*100}%` : '0%', background:seg.color, transition:`width 1.4s cubic-bezier(0.22,1,0.36,1) ${i*0.15}s`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden' }}>{(seg.value/total)*100 > 10 ? `${Math.round((seg.value/total)*100)}%` : ''}</div>))}</div>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom:'24px' }}><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}><div style={{ display:'flex', alignItems:'center', gap:'10px' }}><div style={{ width:'30px', height:'30px', borderRadius:'8px', background:ACCENT+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:800, color:ACCENT }}>{icon}</div><h2 style={{ margin:0, fontSize:'16px', fontWeight:600, color:'#1e293b' }}>{title}</h2></div><span style={{ background:ACCENT+'12', color:ACCENT, fontSize:'10px', fontWeight:700, padding:'4px 10px', borderRadius:'12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════
// BLAST FURNACE DATA
// ════════════════════════════════════════

const bfOverview = {
  status: 'Running', workingVolume: '3,200 m³', uptime: 99.2, campaign: 'Campaign 14 — Day 1,847',
  productivity: 2.42, hotMetalTemp: 1502, siliconAvg: 0.45, fuelRate: 498, cokeRate: 328, pciRate: 165,
}

const temperatureZones = [
  { zone: 'Stockline (Top)', temp: 180, max: 300, trend: [172, 178, 182, 180, 176, 180, 180] },
  { zone: 'Upper Stack', temp: 620, max: 900, trend: [605, 612, 618, 625, 620, 618, 620] },
  { zone: 'Lower Stack', temp: 1080, max: 1300, trend: [1060, 1072, 1085, 1078, 1080, 1082, 1080] },
  { zone: 'Belly', temp: 1320, max: 1500, trend: [1305, 1312, 1325, 1318, 1320, 1322, 1320] },
  { zone: 'Bosh', temp: 1580, max: 1800, trend: [1565, 1572, 1585, 1578, 1580, 1582, 1580] },
  { zone: 'Tuyere / Raceway', temp: 2150, max: 2400, trend: [2120, 2138, 2155, 2148, 2150, 2145, 2150] },
  { zone: 'Hearth Sidewall', temp: 420, max: 600, trend: [410, 415, 422, 418, 420, 425, 420] },
  { zone: 'Hearth Bottom', temp: 280, max: 450, trend: [272, 275, 282, 278, 280, 285, 280] },
]

const blastParams = [
  { label: 'Blast Volume', value: '4,850', unit: 'Nm³/min', range: '4500–5200', status: 'normal' },
  { label: 'Hot Blast Temp', value: '1,185', unit: '°C', range: '1100–1250', status: 'normal' },
  { label: 'Top Pressure', value: '2.35', unit: 'kg/cm²', range: '2.0–2.5', status: 'normal' },
  { label: 'O₂ Enrichment', value: '4.2', unit: '%', range: '2–6', status: 'normal' },
  { label: 'Blast Moisture', value: '18', unit: 'g/Nm³', range: '10–25', status: 'normal' },
  { label: 'Wind Rate', value: '1.52', unit: 'Nm³/min/m³', range: '1.3–1.7', status: 'normal' },
  { label: 'Tuyere Velocity', value: '235', unit: 'm/s', range: '200–260', status: 'normal' },
  { label: 'RAFT', value: '2,185', unit: '°C', range: '2100–2300', status: 'normal' },
]

const burdenComposition = [
  { name: 'Sinter', value: 68, color: '#ea580c' },
  { name: 'Pellets', value: 18, color: ACCENT },
  { name: 'Lump Ore', value: 10, color: '#3b82f6' },
  { name: 'Flux (Limestone)', value: 2.5, color: '#f59e0b' },
  { name: 'Flux (Dolomite)', value: 1.5, color: '#10b981' },
]

const cokeQuality = [
  { label: 'CSR (Coke Strength after Reaction)', value: 68.5, unit: '%', target: '>65%', max: 80 },
  { label: 'CRI (Coke Reactivity Index)', value: 21.2, unit: '%', target: '<25%', max: 35 },
  { label: 'M40 (Drum Strength)', value: 86.4, unit: '%', target: '>84%', max: 95 },
  { label: 'M10 (Abrasion Index)', value: 5.8, unit: '%', target: '<7%', max: 10 },
  { label: 'Ash Content', value: 12.4, unit: '%', target: '<13%', max: 16 },
  { label: 'Moisture', value: 3.2, unit: '%', target: '<5%', max: 6 },
]

const hotMetalQuality = [
  { label: 'Carbon (C)', value: '4.52%', range: '4.2–4.8%', status: 'good' },
  { label: 'Silicon (Si)', value: '0.45%', range: '0.30–0.60%', status: 'good' },
  { label: 'Manganese (Mn)', value: '0.32%', range: '0.20–0.50%', status: 'good' },
  { label: 'Sulphur (S)', value: '0.025%', range: '<0.035%', status: 'good' },
  { label: 'Phosphorus (P)', value: '0.085%', range: '<0.120%', status: 'good' },
  { label: 'Titanium (Ti)', value: '0.065%', range: '<0.100%', status: 'good' },
  { label: 'Hot Metal Temp', value: '1,502°C', range: '1480–1520°C', status: 'good' },
  { label: 'Desulphurization η', value: '92.4%', range: '>90%', status: 'good' },
]

const slagChemistry = [
  { label: 'CaO', value: 38.2, unit: '%', range: '35–42' },
  { label: 'SiO₂', value: 34.1, unit: '%', range: '32–38' },
  { label: 'Al₂O₃', value: 16.8, unit: '%', range: '14–19' },
  { label: 'MgO', value: 8.5, unit: '%', range: '7–10' },
  { label: 'Basicity (B₂)', value: 1.12, unit: 'CaO/SiO₂', range: '1.05–1.20' },
  { label: 'Basicity (B₄)', value: 1.08, unit: '', range: '1.00–1.15' },
]

const gasAnalysis = [
  { label: 'CO', value: 22.8, unit: '%', max: 30 },
  { label: 'CO₂', value: 21.5, unit: '%', max: 30 },
  { label: 'H₂', value: 4.2, unit: '%', max: 8 },
  { label: 'N₂', value: 51.5, unit: '%', max: 60 },
  { label: 'η CO (Gas Utilization)', value: 48.5, unit: '%', max: 55 },
  { label: 'Calorific Value', value: 3850, unit: 'kJ/Nm³', max: 4500 },
]

const energyKPIs = [
  { label: 'Total Fuel Rate', value: 498, unit: 'kg/THM', max: 550 },
  { label: 'Coke Rate', value: 328, unit: 'kg/THM', max: 380 },
  { label: 'PCI Rate', value: 165, unit: 'kg/THM', max: 200 },
  { label: 'Nut Coke Ratio', value: 5, unit: '%', max: 10 },
  { label: 'Slag Rate', value: 285, unit: 'kg/THM', max: 350 },
  { label: 'Productivity', value: 2.42, unit: 'T/m³/day', max: 3.0 },
]

const energyTrend = [508, 502, 498, 505, 500, 496, 498, 492, 495, 498, 500, 498]

const processRadar = [
  { label: 'Thermal State', value: 92 },
  { label: 'Gas Flow', value: 88 },
  { label: 'Burden Descent', value: 94 },
  { label: 'Hearth Health', value: 86 },
  { label: 'Hot Metal Quality', value: 93 },
  { label: 'Slag Control', value: 90 },
]

const hearth = {
  erosionZones: [
    { zone: 'Bottom Center', remaining: 82, original: 100, color: '#10b981' },
    { zone: 'Bottom Corner', remaining: 68, original: 100, color: '#f59e0b' },
    { zone: 'Sidewall Lower', remaining: 74, original: 100, color: '#f59e0b' },
    { zone: 'Sidewall Upper', remaining: 88, original: 100, color: '#10b981' },
    { zone: 'Taphole Region', remaining: 62, original: 100, color: '#ef4444' },
    { zone: 'Elephant Foot', remaining: 71, original: 100, color: '#f59e0b' },
  ],
  campaign: { day: 1847, target: 2500, lastReline: 'Jan 2021' },
}

const anomalyStatus = [
  { name: 'Channeling', status: 'None', color: '#10b981', desc: 'Gas distribution normal — no channeling detected' },
  { name: 'Hanging', status: 'None', color: '#10b981', desc: 'Burden descent smooth — stockline stable at 1.2m' },
  { name: 'Slipping', status: 'Minor', color: '#f59e0b', desc: 'Small slip event 2 hrs ago — resolved. Coke layer adjustment made.' },
  { name: 'Scaffolding', status: 'None', color: '#10b981', desc: 'Wall temperature profile uniform — no scaffold buildup' },
  { name: 'Hearth Erosion', status: 'Monitor', color: '#f59e0b', desc: 'Taphole region refractory at 62% — within campaign plan' },
  { name: 'Tuyere Burnout', status: 'None', color: '#10b981', desc: 'All 32 tuyeres operational — no leakage detected' },
]

const aiRecommendations = [
  { priority: 'high', title: 'Reduce Coke Rate by 8 kg/THM via PCI Optimization', reason: 'Current PCI injection achieving 92% burnout. AI model predicts increasing PCI rate from 165 to 175 kg/THM with finer grinding (75μm → 60μm) will maintain RAFT while reducing coke by 8 kg/THM.', impact: 'Cost saving: ₹12.4L/day', model: 'XGBoost Fuel Optimizer', confidence: 93 },
  { priority: 'high', title: 'Adjust Burden Distribution — Increase Ore/Coke at Wall', reason: 'Gas utilization (ηCO) at 48.5% can be improved. Shifting O/C from 2.4:1 to 2.6:1 at wall region will redirect gas flow for better heat exchange in stack.', impact: 'ηCO improvement: +1.8%', model: 'CFD-Neural Network', confidence: 91 },
  { priority: 'medium', title: 'Increase Hot Blast Temperature by 15°C', reason: 'Hot stove dome temp has headroom (1,320°C vs 1,400°C design). Increasing HBT from 1,185°C to 1,200°C will reduce coke rate by ~5 kg/THM with no refractory risk.', impact: 'Coke saving: 5 kg/THM', model: 'Thermal Balance Model', confidence: 94 },
  { priority: 'medium', title: 'Optimize Casting Schedule for Hearth Protection', reason: 'Taphole #2 erosion at 62%. AI recommends alternating between TH#1 and TH#3 more frequently, limiting TH#2 to 2 casts/day until next planned repair.', impact: 'Extend hearth life: +60 days', model: 'Refractory Wear CNN', confidence: 87 },
  { priority: 'low', title: 'Increase Pellet Ratio from 18% to 22%', reason: 'Pellet quality improved (Fe: 66.2%, reducibility 78%). Higher pellet ratio will improve permeability and gas flow, compensating for lower sinter quality this week.', impact: 'Permeability gain: +4%', model: 'Burden Optimization AI', confidence: 85 },
]

const hotStoves = [
  { id: 'Stove #1', phase: 'On-Blast', domeTemp: 1340, gridTemp: 320, efficiency: 88, timeRemaining: '18 min' },
  { id: 'Stove #2', phase: 'On-Gas (Heating)', domeTemp: 1180, gridTemp: 280, efficiency: 92, timeRemaining: '42 min' },
  { id: 'Stove #3', phase: 'On-Gas (Heating)', domeTemp: 1050, gridTemp: 245, efficiency: 90, timeRemaining: '68 min' },
  { id: 'Stove #4', phase: 'Changeover', domeTemp: 1320, gridTemp: 315, efficiency: 87, timeRemaining: '3 min' },
]

const siliconTrend = [0.52, 0.48, 0.44, 0.46, 0.42, 0.45, 0.48, 0.44, 0.46, 0.45, 0.43, 0.45]

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export default function BlastFurnaceOptimization() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Parameters' },
    { key: 'thermal', label: 'Thermal State' },
    { key: 'burden', label: 'Burden & Raw Materials' },
    { key: 'output', label: 'Hot Metal & Slag' },
    { key: 'gas', label: 'Gas Analysis' },
    { key: 'hearth', label: 'Hearth Health' },
    { key: 'stoves', label: 'Hot Stoves' },
  ]

  return (
    <div key={animKey} style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scrollReveal { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .scroll-hidden { opacity:0; transform:translateY(40px); }
        .scroll-visible { animation:scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Blast Furnace Optimization</h1>
          <p style={st.sub}>AI-driven temperature, burden, gas & hearth optimization for BF #1 ({bfOverview.workingVolume})</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation:'pulse 2s infinite' }} /> {bfOverview.status}</span>
          <span style={st.aiBadge}>Digital Twin: Synced</span>
          <span style={st.timeBadge}>{bfOverview.campaign}</span>
        </div>
      </div>

      {/* Overview KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'12px', marginBottom:'24px', animation:'fadeUp 0.6s ease both' }}>
        {[
          { label: 'Uptime', value: `${bfOverview.uptime}%`, color: '#10b981' },
          { label: 'Productivity', value: `${bfOverview.productivity} T/m³/d`, color: ACCENT },
          { label: 'Hot Metal Temp', value: `${bfOverview.hotMetalTemp.toLocaleString()}°C`, color: '#1e293b' },
          { label: 'Silicon [Si]', value: `${bfOverview.siliconAvg}%`, color: '#10b981' },
          { label: 'Total Fuel Rate', value: `${bfOverview.fuelRate} kg/THM`, color: '#1e293b' },
          { label: 'Coke Rate', value: `${bfOverview.cokeRate} kg/THM`, color: ACCENT },
        ].map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign:'center', borderTop:`3px solid ${s.color}`, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
            <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.3px' }}>{s.label}</div>
            <div style={{ fontSize:'18px', fontWeight:700, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Filter */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', flexWrap:'wrap' }}>
        {tabs.map((t) => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ THERMAL STATE ═══ */}
      {show('thermal') && (
        <>
          <Section title="Blast Furnace Temperature Profile" badge="128 Thermocouples" icon="TH">
            <div style={st.row}>
              <div style={{ ...st.card, flex: 2 }}>
                <div style={st.cardLabel}>Temperature Zones Heatmap</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginTop:'12px' }}>
                  {temperatureZones.map((z, i) => (<div key={z.zone} style={{ animation:`slideIn 0.7s ease ${i*0.1}s both` }}><HeatCell value={z.temp} max={z.max} label={z.zone} unit="°C" /></div>))}
                </div>
              </div>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Live Blast Parameters</div>
                <div style={{ marginTop:'12px' }}>
                  {blastParams.map((p, i) => (
                    <div key={p.label} style={{ ...st.paramRow, animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                      <span style={st.paramLabel}>{p.label}</span>
                      <span style={st.paramVal}>{p.value} <span style={st.paramUnit}>{p.unit}</span></span>
                      <span style={st.paramRange}>{p.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Key Gauges" badge="Real-Time" icon="GG">
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <div style={{ ...st.card, textAlign:'center' }}>
                <div style={st.cardLabel}>RAFT (°C)</div>
                <GaugeChart value={2185} min={1900} max={2400} unit="°C" size={150} color={ACCENT} zones={[{ from:1900, to:2050, color:'#3b82f6' },{ from:2050, to:2250, color:'#16a34a' },{ from:2250, to:2400, color:'#ef4444' }]} />
              </div>
              <div style={{ ...st.card, textAlign:'center' }}>
                <div style={st.cardLabel}>Hot Blast Temp (°C)</div>
                <GaugeChart value={1185} min={900} max={1300} unit="°C" size={150} color="#10b981" zones={[{ from:900, to:1050, color:'#3b82f6' },{ from:1050, to:1250, color:'#16a34a' },{ from:1250, to:1300, color:'#ef4444' }]} />
              </div>
              <div style={{ ...st.card, textAlign:'center' }}>
                <div style={st.cardLabel}>Top Pressure (kg/cm²)</div>
                <GaugeChart value={2.35} min={1.5} max={3.0} unit="kg/cm²" size={150} color={ACCENT} zones={[{ from:1.5, to:2.0, color:'#3b82f6' },{ from:2.0, to:2.6, color:'#16a34a' },{ from:2.6, to:3.0, color:'#ef4444' }]} />
              </div>
              <div style={{ ...st.card, textAlign:'center' }}>
                <div style={st.cardLabel}>Silicon Prediction</div>
                <GaugeChart value={0.45} min={0.1} max={0.8} unit="%" size={150} color="#10b981" zones={[{ from:0.1, to:0.3, color:'#3b82f6' },{ from:0.3, to:0.6, color:'#16a34a' },{ from:0.6, to:0.8, color:'#ef4444' }]} />
              </div>
            </div>
          </Section>

          <Section title="Silicon Trend & Fuel Rate (24hr)" badge="AI Prediction Active" icon="TR">
            <div style={st.row}>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Hot Metal Silicon [Si] (%) — Last 12 Casts</div>
                <div style={{ marginTop:'12px' }}><AreaChart data={siliconTrend} color={ACCENT} height={100} /></div>
                <div style={{ display:'flex', gap:'20px', marginTop:'10px', borderTop:'1px solid #f1f5f9', paddingTop:'10px' }}>
                  <div><div style={st.tinyLabel}>Current</div><div style={st.tinyVal}>0.45%</div></div>
                  <div><div style={st.tinyLabel}>Average</div><div style={st.tinyVal}>0.46%</div></div>
                  <div><div style={st.tinyLabel}>AI Predicted Next</div><div style={{ ...st.tinyVal, color:ACCENT }}>0.43%</div></div>
                  <div><div style={st.tinyLabel}>Target</div><div style={st.tinyVal}>0.30–0.60%</div></div>
                </div>
              </div>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Total Fuel Rate (kg/THM) — 24 Hours</div>
                <div style={{ marginTop:'12px' }}><AreaChart data={energyTrend} color="#10b981" height={100} /></div>
                <div style={{ display:'flex', gap:'20px', marginTop:'10px', borderTop:'1px solid #f1f5f9', paddingTop:'10px' }}>
                  <div><div style={st.tinyLabel}>Current</div><div style={st.tinyVal}>498 kg/THM</div></div>
                  <div><div style={st.tinyLabel}>Average</div><div style={st.tinyVal}>500 kg/THM</div></div>
                  <div><div style={st.tinyLabel}>Best Today</div><div style={{ ...st.tinyVal, color:'#10b981' }}>492 kg/THM</div></div>
                  <div><div style={st.tinyLabel}>Target</div><div style={st.tinyVal}>&lt;500</div></div>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ BURDEN & RAW MATERIALS ═══ */}
      {show('burden') && (
        <>
          <Section title="Burden Composition" badge="Charging Model Active" icon="BD">
            <div style={st.row}>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Burden Mix</div>
                <StackedBar segments={burdenComposition} height={28} />
                <div style={{ display:'flex', gap:'12px', marginTop:'10px', flexWrap:'wrap' }}>
                  {burdenComposition.map((b, i) => (<div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'10px', height:'10px', borderRadius:'3px', background:b.color }} /><span style={{ fontSize:'11px', color:'#64748b' }}>{b.name}: {b.value}%</span></div>))}
                </div>
                <div style={{ ...st.aiRow, marginTop:'12px' }}><span style={st.aiChip}>AI</span> Burden distribution optimized for current sinter quality (FeO: 8.2%). O/C ratio: 2.4:1 at center, 2.8:1 at wall.</div>
              </div>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Coke Quality Parameters</div>
                <div style={{ marginTop:'8px' }}>
                  {cokeQuality.map((c, i) => (<HBar key={c.label} label={c.label} value={c.value} max={c.max} unit={c.unit} color={(c.label.includes('CRI') || c.label.includes('M10') || c.label.includes('Ash') || c.label.includes('Moisture')) ? (c.value/c.max > 0.8 ? '#f59e0b' : '#10b981') : (c.value/c.max > 0.8 ? '#10b981' : '#f59e0b')} delay={i*120} />))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ HOT METAL & SLAG ═══ */}
      {show('output') && (
        <>
          <Section title="Hot Metal Chemistry" badge="Spectrometer Linked" icon="HM">
            <div style={st.row}>
              <div style={{ ...st.card, flex:2 }}>
                <div style={st.cardLabel}>Chemical Composition — Last Cast</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px', marginTop:'12px' }}>
                  {hotMetalQuality.map((q, i) => (
                    <div key={q.label} style={{ background:'#f8fafc', borderRadius:'8px', padding:'10px 12px', border:'1px solid #e8ecf1', animation:`slideIn 0.7s ease ${i*0.08}s both` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'12px', color:'#64748b' }}>{q.label}</span>
                        <span style={{ fontSize:'9px', fontWeight:600, color:'#16a34a', background:'#f0fdf4', padding:'2px 6px', borderRadius:'4px' }}>IN SPEC</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:'4px' }}>
                        <span style={{ fontSize:'16px', fontWeight:700, color:'#1e293b' }}>{q.value}</span>
                        <span style={{ fontSize:'10px', color:'#94a3b8' }}>Spec: {q.range}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...st.card, flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={st.cardLabel}>Process Health Radar</div>
                <RadarChart data={processRadar} size={200} />
                <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>Overall BF Score: 90.5 / 100</div>
              </div>
            </div>
          </Section>

          <Section title="Slag Chemistry" badge="Basicity Control AI" icon="SG">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'14px' }}>
              {slagChemistry.map((s, i) => (
                <div key={s.label} style={{ ...st.card, textAlign:'center', animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                  <div style={st.cardLabel}>{s.label}</div>
                  <div style={{ fontSize:'28px', fontWeight:800, color:'#1e293b', margin:'8px 0' }}>{s.value}<span style={{ fontSize:'13px', color:'#94a3b8', fontWeight:400 }}> {s.unit}</span></div>
                  <div style={{ fontSize:'10px', color:'#94a3b8' }}>Range: {s.range}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ═══ GAS ANALYSIS ═══ */}
      {show('gas') && (
        <Section title="Top Gas Analysis & Energy" badge="Gas Chromatograph" icon="GA">
          <div style={st.row}>
            <div style={{ ...st.card, flex:1 }}>
              <div style={st.cardLabel}>Top Gas Composition</div>
              <div style={{ marginTop:'12px' }}>{gasAnalysis.map((g, i) => (<HBar key={g.label} label={g.label} value={g.value} max={g.max} unit={g.unit} color={g.label.includes('η') ? '#10b981' : ACCENT} delay={i*120} />))}</div>
            </div>
            <div style={{ ...st.card, flex:1 }}>
              <div style={st.cardLabel}>Energy & Fuel KPIs</div>
              <div style={{ marginTop:'12px' }}>{energyKPIs.map((e, i) => (<HBar key={e.label} label={e.label} value={e.value} max={e.max} unit={e.unit} color={e.value/e.max > 0.9 ? '#f59e0b' : ACCENT} delay={i*120} />))}</div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ HEARTH HEALTH ═══ */}
      {show('hearth') && (
        <>
          <Section title="Hearth Refractory Health" badge={`Campaign Day ${hearth.campaign.day}`} icon="HR">
            <div style={st.row}>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Refractory Remaining (% of Original)</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', marginTop:'12px' }}>
                  {hearth.erosionZones.map((z, i) => (
                    <div key={z.zone} style={{ textAlign:'center', animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                      <DonutChart value={z.remaining} max={z.original} size={72} strokeWidth={6} color={z.color} />
                      <div style={{ fontSize:'11px', fontWeight:600, color:'#1e293b', marginTop:'6px' }}>{z.zone}</div>
                      <div style={{ fontSize:'10px', color:z.color, fontWeight:600 }}>{z.remaining}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'20px', marginTop:'14px', paddingTop:'10px', borderTop:'1px solid #f1f5f9' }}>
                  <div><span style={st.tinyLabel}>Campaign Day</span><span style={st.tinyVal}> {hearth.campaign.day}</span></div>
                  <div><span style={st.tinyLabel}>Target Life</span><span style={st.tinyVal}> {hearth.campaign.target} days</span></div>
                  <div><span style={st.tinyLabel}>Last Reline</span><span style={st.tinyVal}> {hearth.campaign.lastReline}</span></div>
                  <div><span style={st.tinyLabel}>Progress</span><span style={{ ...st.tinyVal, color:ACCENT }}> {Math.round((hearth.campaign.day/hearth.campaign.target)*100)}%</span></div>
                </div>
              </div>
              <div style={{ ...st.card, flex:1 }}>
                <div style={st.cardLabel}>Anomaly Detection Status</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'12px' }}>
                  {anomalyStatus.map((a, i) => (
                    <div key={a.name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #f1f5f9', animation:`slideIn 0.6s ease ${i*0.08}s both` }}>
                      <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:a.color, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:'12px', fontWeight:600, color:'#1e293b' }}>{a.name}</span>
                          <span style={{ fontSize:'9px', fontWeight:600, color:a.color, background:`${a.color}15`, padding:'2px 8px', borderRadius:'10px' }}>{a.status}</span>
                        </div>
                        <div style={{ fontSize:'10px', color:'#64748b', marginTop:'2px' }}>{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ HOT STOVES ═══ */}
      {show('stoves') && (
        <Section title="Hot Stove Battery" badge="4 Stoves — Auto-Cycling" icon="HS">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px' }}>
            {hotStoves.map((s, i) => {
              const phaseColor = s.phase.includes('On-Blast') ? '#ef4444' : s.phase.includes('Changeover') ? '#f59e0b' : '#10b981'
              return (
                <div key={s.id} style={{ ...st.card, borderTop:`3px solid ${phaseColor}`, animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <span style={{ fontSize:'14px', fontWeight:700, color:'#1e293b' }}>{s.id}</span>
                    <span style={{ fontSize:'9px', fontWeight:600, color:phaseColor, background:`${phaseColor}15`, padding:'3px 8px', borderRadius:'10px' }}>{s.phase}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}><span style={{ color:'#64748b' }}>Dome Temp</span><span style={{ fontWeight:600, color:'#1e293b' }}>{s.domeTemp.toLocaleString()}°C</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}><span style={{ color:'#64748b' }}>Grid Temp</span><span style={{ fontWeight:600, color:'#1e293b' }}>{s.gridTemp}°C</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}><span style={{ color:'#64748b' }}>Efficiency</span><span style={{ fontWeight:600, color:'#10b981' }}>{s.efficiency}%</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}><span style={{ color:'#64748b' }}>Time Remaining</span><span style={{ fontWeight:600, color:ACCENT }}>{s.timeRemaining}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS (always visible) ═══ */}
      <Section title="AI Optimization Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' }
            return (
              <div key={i} style={{ ...st.card, borderLeft:`4px solid ${priColors[rec.priority]}`, animation:`slideIn 0.7s ease ${i*0.1}s both` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', color:'#fff', background:priColors[rec.priority], padding:'2px 6px', borderRadius:'3px' }}>{rec.priority}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{rec.title}</span>
                  </div>
                  <span style={{ fontSize:'10px', color:'#94a3b8', background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px' }}>{rec.model}</span>
                </div>
                <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#4a5568', lineHeight:'1.6' }}>{rec.reason}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:'16px' }}>
                    <span style={{ fontSize:'10px', color:'#94a3b8' }}>Confidence: <strong style={{ color:ACCENT }}>{rec.confidence}%</strong></span>
                    <span style={{ fontSize:'10px', color:'#94a3b8' }}>Impact: <strong style={{ color:'#10b981' }}>{rec.impact}</strong></span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize:'13px', fontWeight:600, color:'#1e293b', marginBottom:'4px' }}>AI Engine — Blast Furnace Optimization</div>
          <div style={{ fontSize:'12px', color:'#64748b', lineHeight:1.6 }}>
            Monitoring 128 thermocouples, 32 tuyere sensors, 8 gas analyzers, and 24 burden probes. Active AI models: LSTM silicon predictor (accuracy: 94.2%),
            CFD-Neural Network burden distribution optimizer, XGBoost fuel rate optimizer, CNN refractory wear tracker, Reinforcement Learning hot stove cycling controller.
            Digital twin synchronized at 500ms intervals. Coke rate reduced by 12 kg/THM this month vs. baseline through AI-driven PCI and burden optimization.
            Estimated annual saving: ₹42Cr. Next model retraining: 3 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

const st = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title: { margin:0, fontSize:'22px', fontWeight:700, color:'#1e293b' },
  sub: { margin:'2px 0 0', fontSize:'13px', color:'#94a3b8' },
  headerRight: { display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' },
  liveBadge: { display:'flex', alignItems:'center', gap:'6px', background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'16px', padding:'5px 12px', fontSize:'11px', fontWeight:600 },
  liveDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#16a34a' },
  aiBadge: { background:ACCENT+'15', color:ACCENT, fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'16px' },
  timeBadge: { fontSize:'11px', color:'#94a3b8', background:'#f8fafc', padding:'5px 12px', borderRadius:'16px', border:'1px solid #e8ecf1' },
  card: { background:'#fff', border:'1px solid #e8ecf1', borderRadius:'12px', padding:'18px' },
  cardLabel: { fontSize:'12px', color:'#94a3b8', fontWeight:500, marginBottom:'4px' },
  row: { display:'flex', gap:'14px' },
  tab: { background:'#fff', border:'1px solid #e8ecf1', borderRadius:'8px', padding:'7px 14px', fontSize:'12px', color:'#64748b', cursor:'pointer', fontWeight:500 },
  tabActive: { background:ACCENT, border:`1px solid ${ACCENT}`, borderRadius:'8px', padding:'7px 14px', fontSize:'12px', color:'#fff', cursor:'pointer', fontWeight:600 },
  paramRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f8fafc' },
  paramLabel: { fontSize:'12px', color:'#64748b', flex:1 },
  paramVal: { fontSize:'14px', fontWeight:700, color:'#1e293b', flex:1, textAlign:'right' },
  paramUnit: { fontSize:'10px', color:'#94a3b8', fontWeight:400 },
  paramRange: { fontSize:'10px', color:'#94a3b8', flex:1, textAlign:'right' },
  tinyLabel: { fontSize:'10px', color:'#94a3b8' },
  tinyVal: { fontSize:'13px', fontWeight:700, color:'#1e293b' },
  aiRow: { display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', color:'#64748b', marginTop:'8px', padding:'6px 0 0', borderTop:'1px solid #f1f5f9' },
  aiChip: { background:ACCENT, color:'#fff', fontSize:'8px', fontWeight:800, padding:'2px 5px', borderRadius:'3px', flexShrink:0 },
  aiFooter: { display:'flex', gap:'14px', background:'#fff', border:`1px solid ${ACCENT}30`, borderRadius:'12px', padding:'18px', marginTop:'10px' },
  aiFooterIcon: { width:'36px', height:'36px', borderRadius:'8px', background:ACCENT, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800, flexShrink:0 },
}
