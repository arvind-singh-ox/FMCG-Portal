'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' })
    obs.observe(el); return () => obs.disconnect()
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
  return (<svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} /><text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function HBar({ label, value, max, unit, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 150 + delay); return () => clearTimeout(t) }, [value, max, delay])
  return (<div style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span><span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{value} {unit}</span></div><div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${w}%`, background: color || ACCENT, borderRadius: '3px', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }} /></div></div>)
}

function StackedBar({ segments, height = 24 }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnim(true), 200); return () => clearTimeout(t) }, [])
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (<div style={{ display: 'flex', height: `${height}px`, borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>{segments.map((seg, i) => (<div key={i} style={{ width: anim ? `${(seg.value / total) * 100}%` : '0%', background: seg.color, transition: `width 1.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden' }}>{(seg.value / total) * 100 > 8 ? `${Math.round((seg.value / total) * 100)}%` : ''}</div>))}</div>)
}

function RadarChart({ data, size = 180 }) {
  const [animScale, setAnimScale] = useState(0)
  useEffect(() => { const duration = 1400, start = performance.now(); const step = (now) => { const p = Math.min((now - start) / duration, 1); setAnimScale(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [data])
  const cx = size / 2, cy = size / 2, r = size / 2 - 24, n = data.length, angle = (2 * Math.PI) / n
  const getPoint = (i, val) => { const a = angle * i - Math.PI / 2, dist = (val / 100) * r * animScale; return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) } }
  return (<svg width={size} height={size}>{[25, 50, 75, 100].map(lv => <polygon key={lv} points={Array.from({ length: n }, (_, i) => { const a = angle * i - Math.PI / 2, d = (lv / 100) * r; return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}` }).join(' ')} fill="none" stroke="#e8ecf1" strokeWidth="0.5" />)}{data.map((_, i) => { const a = angle * i - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e8ecf1" strokeWidth="0.5" /> })}<polygon points={data.map((d, i) => { const p = getPoint(i, d.value); return `${p.x},${p.y}` }).join(' ')} fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5" />{data.map((d, i) => { const p = getPoint(i, d.value), lp = { x: cx + (r + 16) * Math.cos(angle * i - Math.PI / 2), y: cy + (r + 16) * Math.sin(angle * i - Math.PI / 2) }; return <g key={i}><circle cx={p.x} cy={p.y} r="3" fill={ACCENT} /><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#64748b" fontWeight="500">{d.label}</text></g> })}</svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════
// RAW MATERIAL & FUEL BLEND DATA
// ════════════════════════════════════════

const summaryCards = [
  { label: 'Iron Ore Consumed', value: '12,450 MT', color: '#ea580c' },
  { label: 'Coke Consumed', value: '3,280 MT', color: '#1e293b' },
  { label: 'PCI Coal', value: '1,650 MT', color: ACCENT },
  { label: 'Flux (Lime + Dolo)', value: '620 MT', color: '#f59e0b' },
  { label: 'Scrap Charged', value: '1,840 MT', color: '#3b82f6' },
  { label: 'Blend Compliance', value: '97.2%', color: '#10b981' },
]

// ── Iron Ore Burden ──
const burdenMix = [
  { name: 'Sinter', value: 68, color: '#ea580c' },
  { name: 'Pellets', value: 18, color: ACCENT },
  { name: 'Lump Ore', value: 10, color: '#3b82f6' },
  { name: 'Flux (Limestone)', value: 2.5, color: '#f59e0b' },
  { name: 'Flux (Dolomite)', value: 1.5, color: '#10b981' },
]

const sinterQuality = [
  { label: 'Fe (Total Iron)', value: 56.8, unit: '%', target: '55–58', max: 65, color: '#ea580c' },
  { label: 'FeO', value: 8.2, unit: '%', target: '7–10', max: 15, color: '#f59e0b' },
  { label: 'SiO₂', value: 5.4, unit: '%', target: '4.5–6.0', max: 8, color: '#64748b' },
  { label: 'Al₂O₃', value: 2.1, unit: '%', target: '1.5–2.5', max: 4, color: '#64748b' },
  { label: 'CaO', value: 9.8, unit: '%', target: '9–11', max: 14, color: '#3b82f6' },
  { label: 'MgO', value: 2.4, unit: '%', target: '2–3', max: 4, color: '#10b981' },
  { label: 'Basicity (CaO/SiO₂)', value: 1.81, unit: '', target: '1.7–2.0', max: 2.5, color: ACCENT },
  { label: 'Tumbler Index (TI)', value: 72.5, unit: '%', target: '>70', max: 85, color: '#10b981' },
  { label: 'Reducibility (RI)', value: 68.4, unit: '%', target: '>65', max: 80, color: '#10b981' },
  { label: 'RDI (-3.15mm)', value: 28.2, unit: '%', target: '<30', max: 40, color: '#f59e0b' },
]

const pelletQuality = [
  { label: 'Fe Content', value: '66.2%', spec: '64–67%', status: 'good' },
  { label: 'SiO₂', value: '2.8%', spec: '<3.5%', status: 'good' },
  { label: 'Al₂O₃', value: '0.9%', spec: '<1.5%', status: 'good' },
  { label: 'CCS (Cold Crushing Strength)', value: '265 kg/pellet', spec: '>250', status: 'good' },
  { label: 'Reducibility', value: '78.4%', spec: '>75%', status: 'good' },
  { label: 'Swelling Index', value: '14.2%', spec: '<18%', status: 'good' },
  { label: 'Porosity', value: '26.8%', spec: '24–30%', status: 'good' },
  { label: 'Supplier', value: 'KIOCL / LKAB', spec: '—', status: 'info' },
]

const lumpOreQuality = [
  { label: 'Fe Content', value: '62.4%', spec: '60–64%', status: 'good' },
  { label: 'Al₂O₃', value: '2.2%', spec: '<3%', status: 'good' },
  { label: 'Size Range', value: '10–40 mm', spec: '10–35 mm', status: 'warning' },
  { label: 'Moisture', value: '4.8%', spec: '<6%', status: 'good' },
  { label: 'LOI', value: '2.1%', spec: '<3%', status: 'good' },
  { label: 'Source', value: 'Odisha / Jharkhand', spec: '—', status: 'info' },
]

// ── Coke & Coal ──
const cokeQuality = [
  { label: 'CSR (Coke Strength after Reaction)', value: 68.5, unit: '%', target: '>65', max: 80 },
  { label: 'CRI (Coke Reactivity Index)', value: 21.2, unit: '%', target: '<25', max: 35 },
  { label: 'M40 (Drum Strength)', value: 86.4, unit: '%', target: '>84', max: 95 },
  { label: 'M10 (Abrasion Index)', value: 5.8, unit: '%', target: '<7', max: 10 },
  { label: 'Ash Content', value: 12.4, unit: '%', target: '<13', max: 16 },
  { label: 'Sulphur', value: 0.62, unit: '%', target: '<0.65', max: 1.0 },
  { label: 'Volatile Matter', value: 0.9, unit: '%', target: '<1.0', max: 2.0 },
  { label: 'Fixed Carbon', value: 86.8, unit: '%', target: '>86', max: 92 },
  { label: 'Moisture', value: 3.2, unit: '%', target: '<4', max: 6 },
  { label: 'Mean Size', value: 48.5, unit: 'mm', target: '47–52', max: 60 },
]

const coalBlend = [
  { name: 'Prime Coking (Jharia)', value: 35, color: '#1e293b' },
  { name: 'Medium Coking (Bokaro)', value: 25, color: '#475569' },
  { name: 'Imported (Australia HCC)', value: 28, color: ACCENT },
  { name: 'Semi-Soft Coking', value: 8, color: '#f59e0b' },
  { name: 'Stamp-Charge Additive', value: 4, color: '#10b981' },
]

const coalProperties = [
  { label: 'Volatile Matter (daf)', value: '26.8%', spec: '24–30%', status: 'good' },
  { label: 'Ash Content', value: '9.6%', spec: '<10%', status: 'good' },
  { label: 'Sulphur', value: '0.58%', spec: '<0.65%', status: 'good' },
  { label: 'Fluidity (ddpm)', value: '820', spec: '>500', status: 'good' },
  { label: 'Free Swelling Index (FSI)', value: '7.5', spec: '>6.5', status: 'good' },
  { label: 'Crucible Swelling Number', value: '7.0', spec: '>6.0', status: 'good' },
  { label: 'Mean Reflectance (Ro)', value: '1.12', spec: '1.0–1.3', status: 'good' },
  { label: 'Phosphorus', value: '0.025%', spec: '<0.04%', status: 'good' },
]

// ── PCI (Pulverized Coal Injection) ──
const pciData = [
  { label: 'PCI Rate', value: '165', unit: 'kg/THM', range: '140–180' },
  { label: 'Burnout Rate', value: '92.4', unit: '%', range: '>90%' },
  { label: 'Grind Fineness (75μm pass)', value: '82', unit: '%', range: '>80%' },
  { label: 'Volatile Matter', value: '18.5', unit: '%', range: '16–22%' },
  { label: 'Ash Content', value: '8.8', unit: '%', range: '<10%' },
  { label: 'Moisture', value: '1.2', unit: '%', range: '<2%' },
  { label: 'Calorific Value', value: '7,250', unit: 'kcal/kg', range: '>7000' },
  { label: 'Replacement Ratio', value: '0.87', unit: 'kg coke/kg PCI', range: '0.8–0.95' },
]

// ── Flux Materials ──
const fluxMaterials = [
  { name: 'BF Grade Limestone', cao: 50.2, mgo: 2.1, sio2: 2.8, addition: '52 kg/THM', stock: '4,200 MT', daysRemaining: 8 },
  { name: 'Dolomite', cao: 29.8, mgo: 20.4, sio2: 1.5, addition: '35 kg/THM', stock: '2,800 MT', daysRemaining: 12 },
  { name: 'Quartzite', cao: 1.2, mgo: 0.5, sio2: 96.4, addition: '8 kg/THM', stock: '1,500 MT', daysRemaining: 22 },
  { name: 'Dunite (MgO source)', cao: 0.8, mgo: 46.2, sio2: 39.5, addition: '15 kg/THM', stock: '1,200 MT', daysRemaining: 10 },
]

// ── Scrap Mix (for BOF) ──
const scrapMix = [
  { name: 'HMS (Heavy Melting Scrap)', value: 42, color: '#1e293b' },
  { name: 'Shredded Scrap', value: 28, color: ACCENT },
  { name: 'Plate & Structural', value: 15, color: '#3b82f6' },
  { name: 'Returns (Internal)', value: 10, color: '#10b981' },
  { name: 'Pig Iron (Cold)', value: 5, color: '#f59e0b' },
]

const scrapQuality = [
  { label: 'Metallic Yield', value: '94.2%', spec: '>92%', status: 'good' },
  { label: 'Bulk Density', value: '0.85 T/m³', spec: '0.7–1.0', status: 'good' },
  { label: 'Cu (Tramp Element)', value: '0.12%', spec: '<0.20%', status: 'good' },
  { label: 'Cr (Residual)', value: '0.08%', spec: '<0.15%', status: 'good' },
  { label: 'Non-Metallic Content', value: '2.4%', spec: '<5%', status: 'good' },
  { label: 'Moisture', value: '3.8%', spec: '<6%', status: 'good' },
]

// ── Inventory & Forecasting ──
const inventoryData = [
  { material: 'Iron Ore Fines (Sinter Feed)', stock: 48500, dailyUse: 5800, daysRemaining: 8.4, minDays: 7, color: '#ea580c' },
  { material: 'Pellets', stock: 12200, dailyUse: 1420, daysRemaining: 8.6, minDays: 7, color: ACCENT },
  { material: 'Lump Ore', stock: 8400, dailyUse: 780, daysRemaining: 10.8, minDays: 7, color: '#3b82f6' },
  { material: 'Coking Coal', stock: 35600, dailyUse: 4200, daysRemaining: 8.5, minDays: 10, color: '#1e293b' },
  { material: 'PCI Coal', stock: 9800, dailyUse: 1650, daysRemaining: 5.9, minDays: 7, color: '#f59e0b' },
  { material: 'Limestone', stock: 4200, dailyUse: 520, daysRemaining: 8.1, minDays: 5, color: '#94a3b8' },
  { material: 'Dolomite', stock: 2800, dailyUse: 350, daysRemaining: 8.0, minDays: 5, color: '#94a3b8' },
  { material: 'Scrap', stock: 6200, dailyUse: 1840, daysRemaining: 3.4, minDays: 3, color: '#ef4444' },
]

// ── Quality Radar ──
const qualityRadar = [
  { label: 'Sinter', value: 88 },
  { label: 'Pellets', value: 94 },
  { label: 'Coke', value: 91 },
  { label: 'PCI', value: 86 },
  { label: 'Flux', value: 92 },
  { label: 'Scrap', value: 89 },
]

// ── Blend Trend ──
const sinterRatioTrend = [66, 67, 68, 67, 69, 68, 70, 68, 67, 68, 69, 68]
const cokeRateTrend = [335, 332, 330, 328, 330, 328, 326, 328, 325, 328, 327, 328]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'high', title: 'Increase pellet ratio to 22% for permeability improvement', reason: 'Current pellet quality (Fe: 66.2%, RI: 78.4%) supports higher charging. Gas utilization ηCO can improve 1.5–2% with better stack permeability from higher pellet share.', impact: 'Coke saving: ~5 kg/THM', model: 'Burden Optimizer AI', confidence: 93 },
  { priority: 'high', title: 'PCI coal switch — blend 20% high-VM coal for burnout', reason: 'Current PCI burnout at 92.4%. Adding 20% high-volatile coal (VM 32%) to the PCI blend will improve combustion kinetics at tuyere level. AI simulation shows burnout improving to 95%.', impact: 'PCI rate +8 kg/THM, coke saving ₹8.2L/day', model: 'PCI Combustion NN', confidence: 91 },
  { priority: 'medium', title: 'Adjust sinter basicity from 1.81 to 1.90', reason: 'BF slag basicity running at lower end (B₂: 1.07). Increasing sinter basicity will reduce limestone addition by 6 kg/THM and lower slag volume, improving productivity.', impact: 'Slag reduction: 12 kg/THM', model: 'Slag Chemistry Optimizer', confidence: 88 },
  { priority: 'medium', title: 'Expedite PCI coal procurement — stock at 5.9 days', reason: 'PCI coal inventory below 7-day safety threshold. Current consumption: 1,650 MT/day. AI forecasts stockout risk in 4.2 days accounting for supply variability.', impact: 'Prevent BF de-rating', model: 'Inventory Forecasting AI', confidence: 96 },
  { priority: 'low', title: 'Reduce lump ore fines (-10mm) content', reason: 'Current lump ore batch has 18% fines < 10mm vs spec 12%. Screen at yard before charging to improve burden permeability and reduce BF pressure drop.', impact: 'Permeability gain: +3%', model: 'Burden Quality AI', confidence: 85 },
]

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════

export default function RawMaterial() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Materials' },
    { key: 'iron-ore', label: 'Iron Ore & Burden' },
    { key: 'coke-coal', label: 'Coke & Coal' },
    { key: 'pci', label: 'PCI' },
    { key: 'flux', label: 'Flux Materials' },
    { key: 'scrap', label: 'Scrap (BOF)' },
    { key: 'inventory', label: 'Inventory' },
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
          <h1 style={st.title}>Raw Material & Fuel Blend Optimization</h1>
          <p style={st.sub}>AI-assisted blend predictions, quality tracking & inventory management</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Feed</span>
          <span style={st.aiBadge}>Blend AI: Active</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ IRON ORE & BURDEN ═══ */}
      {show('iron-ore') && (
        <>
          <Section title="Blast Furnace Burden Composition" badge="Charging Model Active" icon="BD">
            <div style={st.row}>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Burden Mix (% of Metallic Charge)</div>
                <StackedBar segments={burdenMix} height={28} />
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {burdenMix.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: b.color }} /><span style={{ fontSize: '11px', color: '#64748b' }}>{b.name}: {b.value}%</span></div>))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={st.cardLabel}>Sinter Ratio Trend (% in Burden) — 12 Days</div>
                  <div style={{ marginTop: '8px' }}><AreaChart data={sinterRatioTrend} color="#ea580c" height={80} /></div>
                </div>
              </div>
              <div style={{ ...st.card, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={st.cardLabel}>Raw Material Quality Radar</div>
                <RadarChart data={qualityRadar} size={200} />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Overall Blend Score: 90.0 / 100</div>
              </div>
            </div>
          </Section>

          <Section title="Sinter Quality Parameters" badge="Lab LIMS Linked" icon="SN">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {sinterQuality.map((s, i) => (
                <div key={s.label} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', lineHeight: '1.3' }}>{s.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{s.value}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> {s.unit}</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Target: {s.target}</div>
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((s.value / s.max) * 100, 100)}%`, background: s.color, borderRadius: '2px', transition: 'width 1.4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div style={st.row}>
            <div style={{ flex: 1 }}>
              <Section title="Pellet Quality" badge="Incoming QC" icon="PL">
                <div style={st.card}>
                  {pelletQuality.map((q, i) => (
                    <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                      <span style={{ fontSize: '12px', color: '#64748b', flex: 1 }}>{q.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', flex: 1, textAlign: 'right' }}>{q.value}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', flex: 1, textAlign: 'right' }}>{q.spec}</span>
                      {q.status !== 'info' && <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>OK</span>}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
            <div style={{ flex: 1 }}>
              <Section title="Lump Ore Quality" badge="Yard Sampling" icon="LO">
                <div style={st.card}>
                  {lumpOreQuality.map((q, i) => (
                    <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                      <span style={{ fontSize: '12px', color: '#64748b', flex: 1 }}>{q.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', flex: 1, textAlign: 'right' }}>{q.value}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', flex: 1, textAlign: 'right' }}>{q.spec}</span>
                      {q.status === 'good' && <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>OK</span>}
                      {q.status === 'warning' && <span style={{ fontSize: '8px', fontWeight: 600, color: '#f59e0b', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>CHECK</span>}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </>
      )}

      {/* ═══ COKE & COAL ═══ */}
      {show('coke-coal') && (
        <>
          <Section title="Coke Quality Parameters" badge="Coke Oven Battery #1" icon="CK">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {cokeQuality.map((c, i) => {
                const isLowerBetter = c.label.includes('CRI') || c.label.includes('M10') || c.label.includes('Ash') || c.label.includes('Sulphur') || c.label.includes('Volatile') || c.label.includes('Moisture')
                const barColor = isLowerBetter ? (c.value / c.max > 0.75 ? '#f59e0b' : '#10b981') : (c.value / c.max > 0.8 ? '#10b981' : '#f59e0b')
                return (
                  <div key={c.label} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.06}s both` }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', lineHeight: '1.3' }}>{c.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{c.value}<span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> {c.unit}</span></div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Target: {c.target}</div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((c.value / c.max) * 100, 100)}%`, background: barColor, borderRadius: '2px', transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ ...st.card, marginTop: '14px' }}>
              <div style={st.cardLabel}>Coke Rate Trend (kg/THM) — 12 Days</div>
              <div style={{ marginTop: '8px' }}><AreaChart data={cokeRateTrend} color={ACCENT} height={80} /></div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div><span style={st.tinyLabel}>Current</span><span style={st.tinyVal}> 328 kg/THM</span></div>
                <div><span style={st.tinyLabel}>Best</span><span style={{ ...st.tinyVal, color: '#10b981' }}> 325 kg/THM</span></div>
                <div><span style={st.tinyLabel}>Target</span><span style={st.tinyVal}> &lt;330</span></div>
                <div><span style={st.tinyLabel}>Week Trend</span><span style={{ ...st.tinyVal, color: '#10b981' }}> -2.1%</span></div>
              </div>
            </div>
          </Section>

          <Section title="Coal Blend for Coke Making" badge="Stamp Charge Battery" icon="CB">
            <div style={st.row}>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Coal Blend Composition</div>
                <StackedBar segments={coalBlend} height={28} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {coalBlend.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: b.color }} /><span style={{ fontSize: '10px', color: '#64748b' }}>{b.name}: {b.value}%</span></div>))}
                </div>
                <div style={{ ...st.aiRow, marginTop: '12px' }}><span style={st.aiChip}>AI</span> Blend optimized for CSR &gt;65 and CRI &lt;25. Imported HCC share increased 3% this week due to lower domestic coal fluidity.</div>
              </div>
              <div style={{ ...st.card, flex: 1 }}>
                <div style={st.cardLabel}>Blended Coal Properties</div>
                {coalProperties.map((q, i) => (
                  <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                    <span style={{ fontSize: '12px', color: '#64748b', flex: 1 }}>{q.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{q.value}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginLeft: '12px' }}>{q.spec}</span>
                    <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>OK</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ PCI ═══ */}
      {show('pci') && (
        <Section title="Pulverized Coal Injection (PCI)" badge="Injection System Active" icon="PC">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {pciData.map((p, i) => (
              <div key={p.label} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.3' }}>{p.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{p.value}<span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}> {p.unit}</span></div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Range: {p.range}</div>
              </div>
            ))}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={st.aiRow}><span style={st.aiChip}>AI</span> PCI replacement ratio at 0.87 — above average. Finer grinding to 60μm (from 75μm) predicted to increase burnout to 95% and enable PCI rate up to 180 kg/THM. Energy model confirms RAFT stability.</div>
          </div>
        </Section>
      )}

      {/* ═══ FLUX ═══ */}
      {show('flux') && (
        <Section title="Flux Materials" badge="Basicity Control AI" icon="FX">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {fluxMaterials.map((f, i) => (
              <div key={f.name} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>{f.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>CaO</span><span style={{ fontWeight: 600 }}>{f.cao}%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>MgO</span><span style={{ fontWeight: 600 }}>{f.mgo}%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>SiO₂</span><span style={{ fontWeight: 600 }}>{f.sio2}%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '4px' }}><span style={{ color: '#64748b' }}>Addition Rate</span><span style={{ fontWeight: 600, color: ACCENT }}>{f.addition}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Stock</span><span style={{ fontWeight: 600 }}>{f.stock}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Days Remaining</span><span style={{ fontWeight: 600, color: f.daysRemaining < 7 ? '#f59e0b' : '#10b981' }}>{f.daysRemaining}d</span></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ SCRAP ═══ */}
      {show('scrap') && (
        <Section title="Scrap Mix (BOF Charge)" badge="Hot Metal:Scrap Ratio 82:18" icon="SC">
          <div style={st.row}>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Scrap Mix Composition</div>
              <StackedBar segments={scrapMix} height={28} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {scrapMix.map((b, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: b.color }} /><span style={{ fontSize: '10px', color: '#64748b' }}>{b.name}: {b.value}%</span></div>))}
              </div>
              <div style={{ ...st.aiRow, marginTop: '12px' }}><span style={st.aiChip}>AI</span> Current scrap mix contains 15% heavy melting scrap (up from 12%). BOF lance height adjusted -50mm for first 3 min of blow to improve melting kinetics. Cu residual within spec.</div>
            </div>
            <div style={{ ...st.card, flex: 1 }}>
              <div style={st.cardLabel}>Scrap Quality Check</div>
              {scrapQuality.map((q, i) => (
                <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc', animation: `slideIn 0.6s ease ${i * 0.06}s both` }}>
                  <span style={{ fontSize: '12px', color: '#64748b', flex: 1 }}>{q.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{q.value}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginLeft: '12px' }}>{q.spec}</span>
                  <span style={{ fontSize: '8px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>OK</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ═══ INVENTORY ═══ */}
      {show('inventory') && (
        <Section title="Raw Material Inventory & Forecast" badge="AI Procurement Forecasting" icon="IV">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 100px 100px 100px 80px 1fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Material', 'Stock (MT)', 'Daily Use', 'Days Left', 'Min Days', 'Stock Level'].map((h) => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
              ))}
            </div>
            {inventoryData.map((item, i) => {
              const pct = (item.daysRemaining / (item.minDays * 2)) * 100
              const barColor = item.daysRemaining < item.minDays ? '#ef4444' : item.daysRemaining < item.minDays * 1.5 ? '#f59e0b' : '#10b981'
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 100px 100px 100px 80px 1fr', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.06}s both`, borderLeft: `3px solid ${barColor}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.material}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.stock.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.dailyUse.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: barColor }}>{item.daysRemaining.toFixed(1)}d</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.minDays}d</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                    </div>
                    {item.daysRemaining < item.minDays && <span style={{ fontSize: '8px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>LOW</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ AI RECOMMENDATIONS (always visible) ═══ */}
      <Section title="AI Blend Optimization Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
            return (
              <div key={i} style={{ ...st.card, borderLeft: `4px solid ${priColors[rec.priority]}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: priColors[rec.priority], padding: '2px 6px', borderRadius: '3px' }}>{rec.priority}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{rec.model}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#4a5568', lineHeight: '1.6' }}>{rec.reason}</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: <strong style={{ color: ACCENT }}>{rec.confidence}%</strong></span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Impact: <strong style={{ color: '#10b981' }}>{rec.impact}</strong></span>
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Raw Material & Fuel Blend Optimization</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 8 material streams with 42 quality parameters. Active models: XGBoost burden optimizer, Neural Network coal blend predictor (CSR accuracy: 94.1%),
            PCI combustion simulator, Inventory forecasting LSTM (procurement lead-time aware), Slag chemistry predictor.
            Current blend compliance: 97.2%. Coke rate reduced 7 kg/THM this month through AI-driven blend adjustments.
            Estimated annual saving: ₹28Cr. Next blend re-optimization: 2 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

const st = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  cardLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' },
  row: { display: 'flex', gap: '14px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', marginTop: '8px', padding: '6px 0 0', borderTop: '1px solid #f1f5f9' },
  aiChip: { background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0 },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
