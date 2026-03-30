'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AnimatedValue({ value, decimals }) {
  const [display, setDisplay] = useState(0); const numVal = parseFloat(String(value).replace(/,/g, '')); const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : 1)
  useEffect(() => { const duration = 1400, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setDisplay(numVal * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [numVal])
  return <>{dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)}</>
}

function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null); const [w, setW] = useState(200)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.1, min = Math.min(...data) * 0.9, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+14} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div><span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span></div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// STEEL PLANT INVENTORY & LOGISTICS DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Total Inventory Value', value: '₹142.8 Cr', color: '#1e293b' },
  { label: 'Stockout Risk Items', value: '3', color: '#ef4444' },
  { label: 'Incoming Shipments', value: '12', color: '#3b82f6' },
  { label: 'Dispatches Today', value: '18', color: '#10b981' },
  { label: 'Yard Utilization', value: '78%', color: ACCENT },
  { label: 'Inventory Turnover', value: '8.4x', color: '#10b981' },
]

// ── Raw Material Inventory ──
const rawMaterialInventory = [
  { material: 'Iron Ore Fines (Sinter Feed)', stock: 48500, unit: 'MT', dailyUse: 5800, daysLeft: 8.4, minDays: 7, reorderPoint: 40600, maxCapacity: 85000, location: 'Stockyard Bay A1-A4', value: 24.2, trend: [52000, 50500, 49200, 48500] },
  { material: 'Iron Ore Pellets', stock: 12200, unit: 'MT', dailyUse: 1420, daysLeft: 8.6, minDays: 7, reorderPoint: 9940, maxCapacity: 25000, location: 'Stockyard Bay B1-B2', value: 12.8, trend: [14500, 13800, 12900, 12200] },
  { material: 'Iron Ore Lump', stock: 8400, unit: 'MT', dailyUse: 780, daysLeft: 10.8, minDays: 7, reorderPoint: 5460, maxCapacity: 18000, location: 'Stockyard Bay C1', value: 5.9, trend: [9800, 9200, 8800, 8400] },
  { material: 'Coking Coal (Imported)', stock: 22400, unit: 'MT', dailyUse: 2940, daysLeft: 7.6, minDays: 10, reorderPoint: 29400, maxCapacity: 60000, location: 'Coal Yard — Import Section', value: 38.1, trend: [28000, 26200, 24300, 22400] },
  { material: 'Coking Coal (Domestic)', stock: 13200, unit: 'MT', dailyUse: 1260, daysLeft: 10.5, minDays: 7, reorderPoint: 8820, maxCapacity: 30000, location: 'Coal Yard — Domestic', value: 8.6, trend: [15500, 14800, 14000, 13200] },
  { material: 'PCI Coal', stock: 9800, unit: 'MT', dailyUse: 1650, daysLeft: 5.9, minDays: 7, reorderPoint: 11550, maxCapacity: 20000, location: 'PCI Coal Silo', value: 5.4, trend: [13500, 12200, 11000, 9800] },
  { material: 'Limestone (BF Grade)', stock: 4200, unit: 'MT', dailyUse: 520, daysLeft: 8.1, minDays: 5, reorderPoint: 2600, maxCapacity: 12000, location: 'Flux Yard', value: 0.8, trend: [5200, 4800, 4500, 4200] },
  { material: 'Dolomite', stock: 2800, unit: 'MT', dailyUse: 350, daysLeft: 8.0, minDays: 5, reorderPoint: 1750, maxCapacity: 8000, location: 'Flux Yard', value: 0.6, trend: [3500, 3200, 3000, 2800] },
  { material: 'Scrap (HMS + Shredded)', stock: 6200, unit: 'MT', dailyUse: 1840, daysLeft: 3.4, minDays: 3, reorderPoint: 5520, maxCapacity: 15000, location: 'Scrap Yard', value: 16.1, trend: [8500, 7600, 6800, 6200] },
  { material: 'Ferro Alloys (FeMn, FeSi, SiMn)', stock: 480, unit: 'MT', dailyUse: 42, daysLeft: 11.4, minDays: 7, reorderPoint: 294, maxCapacity: 1200, location: 'Alloy Warehouse', value: 8.6, trend: [520, 510, 495, 480] },
]

// ── Finished Product Inventory ──
const finishedGoods = [
  { product: 'HR Coils', grade: 'S355J2 / S275JR', stock: 8420, unit: 'MT', capacity: 15000, orders: 6200, daysStock: 4.2, value: 42.1, location: 'FG Yard — Bay 1-3', color: ACCENT },
  { product: 'HR Plates', grade: 'S355J2 / API 5L', stock: 3850, unit: 'MT', capacity: 8000, orders: 2800, daysStock: 5.5, value: 21.2, location: 'FG Yard — Bay 4-5', color: '#3b82f6' },
  { product: 'Slabs (Semi-Finished)', stock: 5200, unit: 'MT', capacity: 12000, orders: 3400, daysStock: 6.1, value: 23.4, location: 'Slab Yard', color: '#f59e0b' },
  { product: 'Billets', grade: 'S275JR / ASTM A36', stock: 2100, unit: 'MT', capacity: 5000, orders: 1500, daysStock: 5.6, value: 8.9, location: 'Billet Bay', color: '#10b981' },
  { product: 'Wire Rod', grade: 'SAE 1008 / 1010', stock: 1850, unit: 'MT', capacity: 4000, orders: 1200, daysStock: 6.2, value: 9.8, location: 'Rod Mill Yard', color: '#ea580c' },
]

// ── Spare Parts & MRO ──
const sparesParts = [
  { category: 'BF Refractories', items: 142, critical: 8, value: 4.2, stockHealth: 88, color: '#ef4444' },
  { category: 'Rolling Mill Rolls', items: 68, critical: 4, value: 8.5, stockHealth: 82, color: ACCENT },
  { category: 'Caster Segments & Molds', items: 95, critical: 6, value: 6.8, stockHealth: 78, color: '#f59e0b' },
  { category: 'BOF Lance Tips & Bricks', items: 52, critical: 3, value: 2.4, stockHealth: 92, color: '#10b981' },
  { category: 'Conveyor Belts & Idlers', items: 210, critical: 12, value: 3.2, stockHealth: 85, color: '#3b82f6' },
  { category: 'Electrical & Automation', items: 320, critical: 18, value: 5.8, stockHealth: 90, color: '#10b981' },
  { category: 'Hydraulic & Lubrication', items: 185, critical: 8, value: 2.1, stockHealth: 94, color: '#10b981' },
  { category: 'Safety & PPE', items: 240, critical: 0, value: 0.8, stockHealth: 96, color: '#10b981' },
]

// ── Incoming Shipments ──
const incomingShipments = [
  { id: 'SHP-4821', material: 'Imported Coking Coal (HCC)', quantity: '42,000 MT', source: 'BHP — Hay Point, Australia', vessel: 'MV Pacific Star', eta: '22 Mar 2026', port: 'Paradip', status: 'In Transit', progress: 72 },
  { id: 'SHP-4822', material: 'Iron Ore Pellets', quantity: '18,500 MT', source: 'KIOCL — Mangalore', vessel: 'Rake #4218', eta: '20 Mar 2026', port: 'Rail Siding', status: 'In Transit', progress: 85 },
  { id: 'SHP-4823', material: 'PCI Coal', quantity: '8,200 MT', source: 'South Africa — Richards Bay', vessel: 'MV Ocean Trader', eta: '25 Mar 2026', port: 'Haldia', status: 'Loading at Origin', progress: 35 },
  { id: 'SHP-4824', material: 'FeMn (HC)', quantity: '480 MT', source: 'MOIL — Nagpur', vessel: 'Truck Lot #42', eta: '19 Mar 2026', port: 'Road', status: 'Dispatched', progress: 92 },
  { id: 'SHP-4825', material: 'Limestone (BF Grade)', quantity: '3,200 MT', source: 'Birla Mining — Rajasthan', vessel: 'Rake #4220', eta: '21 Mar 2026', port: 'Rail Siding', status: 'In Transit', progress: 60 },
]

// ── Dispatch & Outbound ──
const dispatches = [
  { id: 'DSP-8841', product: 'HR Coils — S355J2', qty: '420 MT', customer: 'ArcelorMittal Trading', destination: 'Mumbai Port (Export)', mode: 'Rail', status: 'Loading', progress: 45 },
  { id: 'DSP-8842', product: 'HR Plates — API 5L X65', qty: '280 MT', customer: 'Tenaris', destination: 'Chennai', mode: 'Road', status: 'Dispatched', progress: 100 },
  { id: 'DSP-8843', product: 'Slabs — S275JR', qty: '850 MT', customer: 'JSW Steel — Dolvi', destination: 'JNPT', mode: 'Rail', status: 'In Transit', progress: 68 },
  { id: 'DSP-8844', product: 'HR Coils — S275JR', qty: '560 MT', customer: 'Tata Steel BSL', destination: 'Jamshedpur', mode: 'Road', status: 'Ready for Dispatch', progress: 15 },
  { id: 'DSP-8845', product: 'Wire Rod — SAE 1008', qty: '320 MT', customer: 'Vindhya Telelinks', destination: 'Rewa', mode: 'Road', status: 'Dispatched', progress: 100 },
]

// ── Yard & Warehouse Utilization ──
const yardUtilization = [
  { area: 'Raw Material Stockyard', used: 128400, capacity: 180000, unit: 'MT', utilization: 71.3, color: '#10b981' },
  { area: 'Coal Yard', used: 45400, capacity: 55000, unit: 'MT', utilization: 82.5, color: '#f59e0b' },
  { area: 'Slab Yard', used: 5200, capacity: 12000, unit: 'MT', utilization: 43.3, color: '#10b981' },
  { area: 'Finished Goods Yard', used: 16220, capacity: 32000, unit: 'MT', utilization: 50.7, color: '#10b981' },
  { area: 'Scrap Yard', used: 6200, capacity: 15000, unit: 'MT', utilization: 41.3, color: '#10b981' },
  { area: 'Spares Warehouse', used: 78, capacity: 100, unit: '% capacity', utilization: 78, color: '#f59e0b' },
]

// ── Weighbridge & Traffic ──
const weighbridgeData = [
  { bridge: 'WB-01 (Main Gate)', vehiclesIn: 48, vehiclesOut: 42, avgWeighTime: '4.2 min', status: 'Online', queue: 3 },
  { bridge: 'WB-02 (Coal Gate)', vehiclesIn: 22, vehiclesOut: 18, avgWeighTime: '3.8 min', status: 'Online', queue: 1 },
  { bridge: 'WB-03 (Dispatch Gate)', vehiclesIn: 8, vehiclesOut: 28, avgWeighTime: '5.1 min', status: 'Online', queue: 4 },
  { bridge: 'WB-04 (Rail Siding)', vehiclesIn: 4, vehiclesOut: 3, avgWeighTime: '12 min', status: 'Online', queue: 0 },
]

// ── AI Recommendations ──
const aiRecommendations = [
  { priority: 'critical', title: 'Urgent: PCI Coal stockout in 5.9 days — expedite SHP-4823', reason: 'PCI coal at 9,800 MT vs 11,550 MT reorder point. Daily consumption: 1,650 MT. Shipment SHP-4823 (8,200 MT) ETA 25 Mar — arrives at 2.8 days remaining. AI recommends: (1) Reduce PCI rate temporarily from 165 to 150 kg/THM, (2) Contact alternate supplier for 3,000 MT emergency lot.', impact: 'Prevent BF de-rating from PCI shortage', model: 'Inventory Forecasting LSTM', confidence: 96 },
  { priority: 'high', title: 'Imported coking coal — hedge procurement for Q2', reason: 'AI commodity price model predicts 8-12% price increase for Australian HCC in May-June based on China demand indicators, port congestion trends, and monsoon impact on Indian supply. Current spot: $215/MT CFR. Forward contract recommended.', impact: 'Potential saving: ₹6.2Cr on Q2 volume', model: 'Commodity Price Predictor', confidence: 88 },
  { priority: 'medium', title: 'Optimize scrap procurement mix — increase shredded share', reason: 'HMS scrap at 42% of mix is above optimal. Shredded scrap (currently 28%) has 12% better metallic yield and faster meltdown. AI recommends shifting to 35% HMS / 35% Shredded for next procurement cycle.', impact: 'BOF tap-to-tap: -1.8 min, metallic yield: +1.2%', model: 'Scrap Mix Optimizer', confidence: 91 },
  { priority: 'medium', title: 'FG yard congestion — prioritize DSP-8844 dispatch', reason: 'HR Coil inventory at 56% of FG yard capacity. 3 more coils scheduled from mill today. Expediting DSP-8844 (560 MT to Jamshedpur) clears Bay 2 for incoming production. Truck available at gate — approve for loading.', impact: 'FG yard utilization: 56% → 48%', model: 'Yard Optimization AI', confidence: 93 },
  { priority: 'low', title: 'Caster mold stock at 78% — reorder long-lead items', reason: 'Caster mold copper plates (4-week lead time) at 6 units vs minimum 8. Next planned mold change in 18 days. AI recommends ordering 4 plates now to maintain safety stock for campaign continuity.', impact: 'Prevent mold shortage during campaign', model: 'MRO Forecasting AI', confidence: 85 },
]

// ── KPIs Trends ──
const inventoryTurnoverTrend = [7.8, 8.0, 8.1, 8.2, 8.3, 8.2, 8.4, 8.3, 8.5, 8.4, 8.3, 8.4]
const logisticsCostTrend = [142, 138, 135, 132, 130, 128, 126, 125, 124, 122, 123, 122]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function InventoryLogistics() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'raw', label: 'Raw Materials' },
    { key: 'fg', label: 'Finished Goods' },
    { key: 'spares', label: 'Spares & MRO' },
    { key: 'inbound', label: 'Incoming' },
    { key: 'outbound', label: 'Dispatches' },
    { key: 'yard', label: 'Yard & Traffic' },
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
          <h1 style={st.title}>Inventory & Logistics Optimization</h1>
          <p style={st.sub}>AI-driven stock forecasting, material handling & dispatch management — Integrated Steel Plant</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> Live Tracking</span>
          <span style={st.aiBadge}>Forecast AI: Active</span>
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
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ RAW MATERIALS ═══ */}
      {show('raw') && (
        <Section title="Raw Material Inventory" badge="10 Materials Tracked" icon="RM">
          <div style={st.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 70px 70px 90px 1fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
              {['Material', 'Stock (MT)', 'Daily Use', 'Days Left', 'Min Days', 'Value (₹Cr)', 'Stock Level'].map(h => (<div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>))}
            </div>
            {rawMaterialInventory.map((item, i) => {
              const barColor = item.daysLeft < item.minDays ? '#ef4444' : item.daysLeft < item.minDays * 1.5 ? '#f59e0b' : '#10b981'
              const pct = (item.stock / item.maxCapacity) * 100
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 70px 70px 90px 1fr', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.05}s both`, borderLeft: `3px solid ${barColor}` }}>
                  <div><div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.material}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>{item.location}</div></div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.stock.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.dailyUse.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: barColor }}>{item.daysLeft.toFixed(1)}d</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.minDays}d</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>₹{item.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: barColor, minWidth: '30px' }}>{Math.round(pct)}%</span>
                    {item.daysLeft < item.minDays && <span style={{ fontSize: '7px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 4px', borderRadius: '3px' }}>LOW</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, marginTop: '14px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}><div style={st.cardLabel}>Inventory Turnover Ratio — 12 Months</div><div style={{ marginTop: '8px' }}><AreaChart data={inventoryTurnoverTrend} color={ACCENT} height={60} /></div></div>
              <div style={{ flex: 1 }}><div style={st.cardLabel}>Logistics Cost (₹/MT) — 12 Months</div><div style={{ marginTop: '8px' }}><AreaChart data={logisticsCostTrend} color="#10b981" height={60} /></div></div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div><span style={st.tinyLabel}>Turnover</span><span style={st.tinyVal}> 8.4x (Target: 8.0x)</span></div>
              <div><span style={st.tinyLabel}>Logistics Cost</span><span style={{ ...st.tinyVal, color: '#10b981' }}> ₹122/MT (-14% YoY)</span></div>
              <div><span style={st.tinyLabel}>Carrying Cost</span><span style={st.tinyVal}> 2.8% of value/month</span></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ FINISHED GOODS ═══ */}
      {show('fg') && (
        <Section title="Finished Product Inventory" badge="5 Product Lines" icon="FG">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {finishedGoods.map((fg, i) => (
              <div key={fg.product} style={{ ...st.card, display: 'flex', gap: '20px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderLeft: `3px solid ${fg.color}` }}>
                <div style={{ minWidth: '160px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{fg.product}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{fg.grade}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{fg.location}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', flex: 1 }}>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{fg.stock.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Stock (MT)</div></div>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{fg.orders.toLocaleString()}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Booked Orders</div></div>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{fg.daysStock}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Days Stock</div></div>
                  <div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>₹{fg.value}Cr</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>Value</div></div>
                </div>
                <DonutChart value={fg.stock} max={fg.capacity} size={56} strokeWidth={5} color={fg.color} label="capacity" />
              </div>
            ))}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Total FG Stock </span><span style={st.tinyVal}>21,420 MT</span></div>
            <div><span style={st.tinyLabel}>Total Value </span><span style={st.tinyVal}>₹105.4 Cr</span></div>
            <div><span style={st.tinyLabel}>Booked vs Stock </span><span style={{ ...st.tinyVal, color: '#10b981' }}>70.2%</span></div>
            <div><span style={st.tinyLabel}>Avg Days Stock </span><span style={st.tinyVal}>5.5 days</span></div>
          </div>
        </Section>
      )}

      {/* ═══ SPARES & MRO ═══ */}
      {show('spares') && (
        <Section title="Spare Parts & MRO Inventory" badge="1,312 Items" icon="SP">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {sparesParts.map((sp, i) => {
              const hColor = sp.stockHealth > 90 ? '#10b981' : sp.stockHealth > 80 ? ACCENT : sp.stockHealth > 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={sp.category} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderTop: `3px solid ${sp.color}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px', lineHeight: '1.3' }}>{sp.category}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <DonutChart value={sp.stockHealth} max={100} size={52} strokeWidth={5} color={hColor} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{sp.items}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Total Items</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: '#64748b' }}>Critical: <strong style={{ color: sp.critical > 5 ? '#ef4444' : '#1e293b' }}>{sp.critical}</strong></span>
                    <span style={{ color: '#64748b' }}>Value: <strong>₹{sp.value}Cr</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Total Items </span><span style={st.tinyVal}>1,312</span></div>
            <div><span style={st.tinyLabel}>Critical Items </span><span style={{ ...st.tinyVal, color: '#ef4444' }}>59</span></div>
            <div><span style={st.tinyLabel}>Total Value </span><span style={st.tinyVal}>₹33.6 Cr</span></div>
            <div><span style={st.tinyLabel}>Avg Stock Health </span><span style={{ ...st.tinyVal, color: '#10b981' }}>88%</span></div>
          </div>
        </Section>
      )}

      {/* ═══ INCOMING SHIPMENTS ═══ */}
      {show('inbound') && (
        <Section title="Incoming Shipments" badge={`${incomingShipments.length} Active`} icon="IN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incomingShipments.map((s, i) => (
              <div key={s.id} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${s.progress > 80 ? '#10b981' : s.progress > 50 ? ACCENT : '#f59e0b'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{s.id}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: s.status === 'Dispatched' ? '#10b981' : s.status === 'In Transit' ? ACCENT : '#f59e0b', background: (s.status === 'Dispatched' ? '#10b981' : s.status === 'In Transit' ? ACCENT : '#f59e0b') + '15', padding: '2px 8px', borderRadius: '10px' }}>{s.status}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>{s.material}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: ACCENT }}>{s.quantity}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ETA: {s.eta}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                  <span>Source: {s.source}</span>
                  <span>Transport: {s.vessel}</span>
                  <span>Port/Mode: {s.port}</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.progress}%`, background: s.progress > 80 ? '#10b981' : ACCENT, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>{s.progress}% complete</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ DISPATCHES ═══ */}
      {show('outbound') && (
        <Section title="Outbound Dispatches" badge="Today" icon="OB">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dispatches.map((d, i) => {
              const statusColor = d.status === 'Dispatched' ? '#10b981' : d.status === 'In Transit' ? ACCENT : d.status === 'Loading' ? '#f59e0b' : '#3b82f6'
              return (
                <div key={d.id} style={{ ...st.card, display: 'flex', gap: '16px', alignItems: 'center', animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderLeft: `3px solid ${statusColor}` }}>
                  <div style={{ minWidth: '80px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{d.id}</div>
                    <span style={{ fontSize: '8px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 6px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>{d.status}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{d.product}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{d.customer} → {d.destination} ({d.mode})</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: ACCENT, minWidth: '80px', textAlign: 'right' }}>{d.qty}</div>
                  <div style={{ minWidth: '80px' }}>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${d.progress}%`, background: statusColor, borderRadius: '3px', transition: 'width 1.4s ease' }} />
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', textAlign: 'right' }}>{d.progress}%</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '14px' }}>
            <div><span style={st.tinyLabel}>Dispatches Today </span><span style={st.tinyVal}>18</span></div>
            <div><span style={st.tinyLabel}>Total Dispatched </span><span style={{ ...st.tinyVal, color: '#10b981' }}>2,430 MT</span></div>
            <div><span style={st.tinyLabel}>Pending Loading </span><span style={{ ...st.tinyVal, color: '#f59e0b' }}>3</span></div>
            <div><span style={st.tinyLabel}>On-Time Delivery </span><span style={{ ...st.tinyVal, color: '#10b981' }}>94.8%</span></div>
          </div>
        </Section>
      )}

      {/* ═══ YARD & TRAFFIC ═══ */}
      {show('yard') && (
        <>
          <Section title="Yard & Warehouse Utilization" badge="6 Areas" icon="YD">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {yardUtilization.map((y, i) => (
                <div key={y.area} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.08}s both`, borderTop: `3px solid ${y.color}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{y.area}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{y.used.toLocaleString()}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>of {y.capacity.toLocaleString()} {y.unit}</div>
                    </div>
                    <DonutChart value={y.utilization} max={100} size={52} strokeWidth={5} color={y.color} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Weighbridge & Traffic" badge="4 Active" icon="WB">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {weighbridgeData.map((wb, i) => (
                <div key={wb.bridge} style={{ ...st.card, animation: `slideIn 0.7s ease ${i * 0.1}s both`, borderTop: '3px solid #10b981' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>{wb.bridge}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>In</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{wb.vehiclesIn}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Out</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{wb.vehiclesOut}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Avg Time</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{wb.avgWeighTime}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Queue</span><span style={{ fontWeight: 600, color: wb.queue > 3 ? '#f59e0b' : '#1e293b' }}>{wb.queue}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <Section title="AI Inventory & Logistics Recommendations" badge={`${aiRecommendations.length} Active`} icon="AI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {aiRecommendations.map((rec, i) => {
            const priColors = { critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Engine — Inventory & Logistics Optimization</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Tracking 10 raw materials, 5 finished product lines, 1,312 spare parts, 12 incoming shipments, and 4 weighbridges.
            Active models: LSTM inventory forecaster (lead-time aware), Commodity price predictor (Australian HCC, iron ore), Scrap mix optimizer,
            Yard space allocation AI, Dispatch priority optimizer, MRO criticality classifier.
            Inventory turnover improved to 8.4x (from 7.8x last year). Logistics cost reduced 14% YoY to ₹122/MT.
            Stockout events reduced 68% through AI-driven reorder point optimization. Total inventory value: ₹142.8 Cr.
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
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  tinyLabel: { fontSize: '10px', color: '#94a3b8' },
  tinyVal: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
