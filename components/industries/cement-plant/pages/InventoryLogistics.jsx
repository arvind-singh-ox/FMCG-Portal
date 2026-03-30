'use client'
import { useState, useEffect, useRef, Fragment } from 'react'

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

// ─── Donut Chart ───
function DonutChart({ value, max = 100, color, size = 60, label }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">
          {Math.round(value)}%
        </text>
      </svg>
      {label && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{label}</div>}
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

// ─── Section Wrapper ───
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

const warehouseData = [
  { id: 'WH-01', name: 'Clinker Silo A', type: 'Clinker', capacity: 50000, current: 38500, unit: 'MT', temp: 82, status: 'normal', inRate: 320, outRate: 285 },
  { id: 'WH-02', name: 'Clinker Silo B', type: 'Clinker', capacity: 50000, current: 42100, unit: 'MT', temp: 78, status: 'normal', inRate: 310, outRate: 290 },
  { id: 'WH-03', name: 'Cement Silo 1 (OPC-43)', type: 'Cement', capacity: 15000, current: 11200, unit: 'MT', temp: 45, status: 'normal', inRate: 180, outRate: 210 },
  { id: 'WH-04', name: 'Cement Silo 2 (OPC-53)', type: 'Cement', capacity: 15000, current: 4500, unit: 'MT', temp: 47, status: 'low', inRate: 160, outRate: 195 },
  { id: 'WH-05', name: 'Cement Silo 3 (PPC)', type: 'Cement', capacity: 20000, current: 16800, unit: 'MT', temp: 43, status: 'normal', inRate: 200, outRate: 175 },
  { id: 'WH-06', name: 'Gypsum Storage', type: 'Raw Material', capacity: 8000, current: 2100, unit: 'MT', temp: 32, status: 'critical', inRate: 0, outRate: 85 },
  { id: 'WH-07', name: 'Fly Ash Silo', type: 'Additive', capacity: 12000, current: 9400, unit: 'MT', temp: 38, status: 'normal', inRate: 150, outRate: 120 },
  { id: 'WH-08', name: 'Limestone Stockpile', type: 'Raw Material', capacity: 100000, current: 72000, unit: 'MT', temp: 28, status: 'normal', inRate: 1200, outRate: 980 },
]

const dispatchSchedule = [
  { id: 'DSP-1041', destination: 'Mumbai Distribution Hub', product: 'OPC-43', qty: 320, trucks: 8, status: 'loading', eta: '14:30', priority: 'high' },
  { id: 'DSP-1042', destination: 'Pune Dealer Network', product: 'PPC', qty: 480, trucks: 12, status: 'scheduled', eta: '16:00', priority: 'normal' },
  { id: 'DSP-1043', destination: 'Nashik Construction Site', product: 'OPC-53', qty: 160, trucks: 4, status: 'in-transit', eta: '11:45', priority: 'urgent' },
  { id: 'DSP-1044', destination: 'Ahmedabad Warehouse', product: 'OPC-43', qty: 640, trucks: 16, status: 'scheduled', eta: '18:00', priority: 'normal' },
  { id: 'DSP-1045', destination: 'Surat Retail Center', product: 'PPC', qty: 240, trucks: 6, status: 'loading', eta: '15:15', priority: 'high' },
  { id: 'DSP-1046', destination: 'Indore Bulk Terminal', product: 'OPC-43', qty: 800, trucks: 20, status: 'scheduled', eta: '20:00', priority: 'normal' },
]

const inboundShipments = [
  { id: 'INB-401', material: 'Limestone (High Grade)', source: 'Captive Mine - Block A', qty: 2400, vehicle: 'Belt Conveyor', eta: 'Continuous', status: 'active' },
  { id: 'INB-402', material: 'Gypsum', source: 'Gujarat Minerals Ltd.', qty: 500, vehicle: '12 Trucks', eta: '15:30 Today', status: 'in-transit' },
  { id: 'INB-403', material: 'Fly Ash', source: 'Thermal Power Station', qty: 800, vehicle: 'Rail (16 wagons)', eta: '09:00 Tomorrow', status: 'confirmed' },
  { id: 'INB-404', material: 'Pet Coke', source: 'Reliance Jamnagar', qty: 350, vehicle: '8 Tankers', eta: '17:00 Today', status: 'in-transit' },
  { id: 'INB-405', material: 'Iron Ore (Laterite)', source: 'Goa Mining Corp.', qty: 600, vehicle: 'Rail (10 wagons)', eta: '12:00 Tomorrow', status: 'confirmed' },
  { id: 'INB-406', material: 'Coal', source: 'Mahanadi Coalfields', qty: 1200, vehicle: 'Rail (24 wagons)', eta: '14:00 Tomorrow', status: 'dispatched' },
]

const fleetVehicles = [
  { id: 'TRK-001', type: 'Bulk Tanker', capacity: '40 MT', driver: 'Rajesh K.', status: 'loading', location: 'Silo 1 Bay', gps: true },
  { id: 'TRK-002', type: 'Bulk Tanker', capacity: '40 MT', driver: 'Suresh P.', status: 'in-transit', location: 'NH-48 KM 124', gps: true },
  { id: 'TRK-003', type: 'Bag Truck', capacity: '25 MT', driver: 'Amit V.', status: 'at-destination', location: 'Pune Dealer', gps: true },
  { id: 'TRK-004', type: 'Bulk Tanker', capacity: '40 MT', driver: 'Vijay M.', status: 'returning', location: 'NH-48 KM 56', gps: true },
  { id: 'TRK-005', type: 'Bag Truck', capacity: '25 MT', driver: 'Manoj D.', status: 'maintenance', location: 'Workshop Bay 3', gps: false },
  { id: 'TRK-006', type: 'Bulk Tanker', capacity: '40 MT', driver: 'Kiran S.', status: 'loading', location: 'Silo 3 Bay', gps: true },
  { id: 'TRK-007', type: 'Bag Truck', capacity: '25 MT', driver: 'Deepak R.', status: 'idle', location: 'Parking Bay', gps: true },
  { id: 'TRK-008', type: 'Bulk Tanker', capacity: '40 MT', driver: 'Anil G.', status: 'in-transit', location: 'SH-17 KM 89', gps: true },
]

const packingLines = [
  { id: 'PL-01', name: 'Packing Line 1 (Rotary)', product: 'OPC-43 (50kg)', speed: 2400, target: 2500, uptime: 96.2, bags: 18420, status: 'running' },
  { id: 'PL-02', name: 'Packing Line 2 (Rotary)', product: 'PPC (50kg)', speed: 2350, target: 2500, uptime: 94.8, bags: 17850, status: 'running' },
  { id: 'PL-03', name: 'Packing Line 3 (Electronic)', product: 'OPC-53 (50kg)', speed: 1800, target: 2000, uptime: 91.5, bags: 14200, status: 'running' },
  { id: 'PL-04', name: 'Bulk Loading 1', product: 'OPC-43 (Bulk)', speed: 120, target: 150, uptime: 98.1, bags: 0, status: 'running' },
  { id: 'PL-05', name: 'Bulk Loading 2', product: 'PPC (Bulk)', speed: 0, target: 150, uptime: 0, bags: 0, status: 'stopped' },
]

const dailyKPIs = [
  { label: 'Total Dispatch Today', value: '4,280', suffix: ' MT', trend: +3.2, icon: 'truck', color: '#3b82f6' },
  { label: 'Trucks Loaded', value: '107', suffix: '', trend: +5.1, icon: 'boxes', color: '#10b981' },
  { label: 'Avg Loading Time', value: '18.4', suffix: ' min', trend: -8.2, icon: 'clock', color: '#f59e0b' },
  { label: 'Inventory Turnover', value: '6.8', suffix: 'x', trend: +1.4, icon: 'refresh', color: '#8b5cf6' },
  { label: 'Pending Orders', value: '23', suffix: '', trend: -12.0, icon: 'list', color: '#ef4444' },
  { label: 'Fleet Utilization', value: '87.5', suffix: '%', trend: +2.8, icon: 'fleet', color: '#06b6d4' },
]

const kpiIcons = {
  truck: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  boxes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  refresh: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
  list: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  fleet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
}

const aiRecommendations = [
  { title: 'Gypsum Reorder Alert', desc: 'Gypsum stock at 26% — below 3-day safety buffer. Auto-PO recommended for 2,000 MT from Gujarat Minerals. Lead time: 48 hrs.', priority: 'critical', action: 'Generate PO' },
  { title: 'Route Optimization', desc: 'AI route analysis suggests shifting 4 Pune-bound trucks to SH-60 via Lonavala. Saves 22 min avg per trip and reduces diesel cost by 8%.', priority: 'high', action: 'Apply Route' },
  { title: 'Packing Line 5 Restart', desc: 'Bulk Loading 2 has been idle for 6 hrs. With 3 pending bulk orders (1,680 MT), restarting would reduce dispatch backlog by 40%.', priority: 'high', action: 'Restart Line' },
  { title: 'OPC-53 Stock Rebalancing', desc: 'OPC-53 silo at 30% while demand is trending up 12% WoW. Recommend increasing cement mill OPC-53 production to 60:40 ratio.', priority: 'medium', action: 'Adjust Mix' },
  { title: 'Truck Maintenance Scheduling', desc: 'TRK-005 overdue for 15,000 km service by 800 km. Scheduled maintenance will prevent fleet availability drop.', priority: 'medium', action: 'Schedule' },
  { title: 'Demand Forecast Update', desc: 'ML model predicts 15% demand surge for PPC next week (monsoon pre-season pattern). Recommend building 2-day extra buffer stock.', priority: 'high', action: 'Plan Buffer' },
]

// ─── TABS ───
const TABS = [
  { key: 'overview', label: 'Overview KPIs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
  { key: 'warehouse', label: 'Warehouse & Silos', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: 'dispatch', label: 'Dispatch & Orders', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> },
  { key: 'inbound', label: 'Inbound Supply', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg> },
  { key: 'fleet', label: 'Fleet & GPS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { key: 'packing', label: 'Packing & Loading', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
  { key: 'ai', label: 'AI Optimization', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg> },
]

// ─── MAIN COMPONENT ───
function InventoryLogistics() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scrollReveal { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      {/* Page Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Inventory & Logistics</h1>
            <p style={sty.pageSub}>End-to-end warehouse management, dispatch tracking, fleet monitoring & AI-optimized supply chain</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={sty.liveBadge}><span style={sty.liveDot} /> Live Tracking</span>
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

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'warehouse' && <WarehouseTab />}
      {activeTab === 'dispatch' && <DispatchTab />}
      {activeTab === 'inbound' && <InboundTab />}
      {activeTab === 'fleet' && <FleetTab />}
      {activeTab === 'packing' && <PackingTab />}
      {activeTab === 'ai' && <AITab />}
    </div>
  )
}

// ─── OVERVIEW TAB ───
function OverviewTab() {
  return (
    <>
      <Section title="Daily Performance KPIs" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
        <div style={sty.kpiGrid}>
          {dailyKPIs.map((kpi, i) => (
            <div key={i} style={{ ...sty.kpiCard, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ ...sty.kpiIcon, color: kpi.color }}>{kpiIcons[kpi.icon]}</div>
                <span style={{ ...sty.trendBadge, color: kpi.trend > 0 ? '#16a34a' : '#ef4444', background: kpi.trend > 0 ? '#f0fdf4' : '#fef2f2' }}>
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                </span>
              </div>
              <div style={sty.kpiValue}><AnimatedValue value={kpi.value} suffix={kpi.suffix} /></div>
              <div style={sty.kpiLabel}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Inventory Health Overview" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}>
        <div style={sty.row}>
          <div style={{ flex: 2 }}>
            <div style={sty.grid3}>
              {warehouseData.slice(0, 6).map((wh) => {
                const pct = (wh.current / wh.capacity) * 100
                const barColor = wh.status === 'critical' ? '#ef4444' : wh.status === 'low' ? '#f59e0b' : '#10b981'
                return (
                  <div key={wh.id} style={sty.miniCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{wh.name}</span>
                      <span style={{ ...sty.statusDotSmall, background: barColor }} />
                    </div>
                    <ProgressBar value={pct} color={barColor} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{(wh.current / 1000).toFixed(1)}K / {(wh.capacity / 1000).toFixed(0)}K MT</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: barColor }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={sty.infoCard}>
              <h4 style={sty.infoTitle}>Supply Chain Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Orders in Pipeline', value: '23', color: '#3b82f6' },
                  { label: 'Trucks En Route', value: '18', color: '#10b981' },
                  { label: 'Inbound Shipments', value: '6', color: '#f59e0b' },
                  { label: 'Delayed Deliveries', value: '2', color: '#ef4444' },
                  { label: 'Today\'s Revenue (est.)', value: '1.84 Cr', color: ACCENT },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

// ─── WAREHOUSE TAB ───
function WarehouseTab() {
  const [selected, setSelected] = useState(null)
  return (
    <Section title="Warehouse & Silo Management" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}>
      <div style={sty.grid4}>
        {warehouseData.map((wh) => {
          const pct = (wh.current / wh.capacity) * 100
          const barColor = wh.status === 'critical' ? '#ef4444' : wh.status === 'low' ? '#f59e0b' : '#10b981'
          const isSelected = selected === wh.id
          return (
            <div key={wh.id} style={{ ...sty.warehouseCard, borderColor: isSelected ? ACCENT : '#e8ecf1' }} onClick={() => setSelected(isSelected ? null : wh.id)}>
              {/* Silo Visual */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div style={{ position: 'relative', width: '50px', height: '70px' }}>
                  <div style={{ width: '50px', height: '60px', border: `2px solid ${barColor}`, borderRadius: '4px 4px 8px 8px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${pct}%`, background: `${barColor}20`, transition: 'height 1s ease' }} />
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '3px', background: barColor }} />
                  </div>
                  <div style={{ width: '56px', height: '10px', background: `${barColor}30`, borderRadius: '50%', position: 'absolute', bottom: '-4px', left: '-3px' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{wh.name}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>{wh.type} | {wh.id}</div>
              </div>
              <ProgressBar value={pct} color={barColor} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{(wh.current / 1000).toFixed(1)}K MT</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: barColor }}>{pct.toFixed(0)}%</span>
              </div>
              {isSelected && (
                <div style={{ marginTop: '10px', padding: '8px', background: '#f8fafc', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Capacity</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{(wh.capacity / 1000).toFixed(0)}K MT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Temperature</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{wh.temp}°C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>In Rate</span><span style={{ fontWeight: 600, color: '#10b981' }}>{wh.inRate} MT/hr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Out Rate</span><span style={{ fontWeight: 600, color: '#3b82f6' }}>{wh.outRate} MT/hr</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── DISPATCH TAB ───
function DispatchTab() {
  return (
    <Section title="Dispatch Schedule & Order Tracking" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Order ID', 'Destination', 'Product', 'Quantity', 'Trucks', 'Status', 'ETA', 'Priority'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dispatchSchedule.map((d) => {
              const statusColors = { loading: '#f59e0b', scheduled: '#3b82f6', 'in-transit': '#10b981' }
              const priorityColors = { urgent: '#ef4444', high: '#f59e0b', normal: '#10b981' }
              return (
                <tr key={d.id} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{d.id}</span></td>
                  <td style={sty.td}>{d.destination}</td>
                  <td style={sty.td}>{d.product}</td>
                  <td style={sty.td}>{d.qty} MT</td>
                  <td style={sty.td}>{d.trucks}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[d.status]}15`, color: statusColors[d.status] }}>
                      {d.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td style={sty.td}>{d.eta}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${priorityColors[d.priority]}15`, color: priorityColors[d.priority] }}>
                      {d.priority}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Dispatch Summary Cards */}
      <div style={{ ...sty.grid3, marginTop: '16px' }}>
        {[
          { label: 'Total Dispatched Today', value: '4,280 MT', sub: '107 trucks', color: '#10b981' },
          { label: 'In Transit', value: '1,820 MT', sub: '18 trucks active', color: '#3b82f6' },
          { label: 'Pending Dispatch', value: '2,160 MT', sub: '23 orders queued', color: '#f59e0b' },
        ].map((c, i) => (
          <div key={i} style={sty.summaryCard}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{c.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── INBOUND TAB ───
function InboundTab() {
  return (
    <Section title="Inbound Raw Material & Fuel Supply" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>}>
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Shipment ID', 'Material', 'Source', 'Quantity (MT)', 'Vehicle', 'ETA', 'Status'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inboundShipments.map((s) => {
              const statusColors = { active: '#10b981', 'in-transit': '#3b82f6', confirmed: '#8b5cf6', dispatched: '#f59e0b' }
              return (
                <tr key={s.id} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{s.id}</span></td>
                  <td style={sty.td}>{s.material}</td>
                  <td style={sty.td}>{s.source}</td>
                  <td style={sty.td}>{s.qty.toLocaleString()}</td>
                  <td style={sty.td}>{s.vehicle}</td>
                  <td style={sty.td}>{s.eta}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[s.status]}15`, color: statusColors[s.status] }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Material Pipeline Summary */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Incoming Material Pipeline (Next 48 hrs)</h4>
        <div style={sty.grid3}>
          {[
            { material: 'Limestone', qty: '2,400 MT', mode: 'Conveyor (Continuous)', color: '#64748b' },
            { material: 'Gypsum', qty: '500 MT', mode: '12 Trucks (Road)', color: '#f59e0b' },
            { material: 'Fly Ash', qty: '800 MT', mode: '16 Rail Wagons', color: '#8b5cf6' },
            { material: 'Pet Coke', qty: '350 MT', mode: '8 Tankers (Road)', color: '#ef4444' },
            { material: 'Iron Ore', qty: '600 MT', mode: '10 Rail Wagons', color: '#10b981' },
            { material: 'Coal', qty: '1,200 MT', mode: '24 Rail Wagons', color: '#3b82f6' },
          ].map((m, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.material}</span>
                <span style={{ ...sty.statusDotSmall, background: m.color }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: m.color }}>{m.qty}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{m.mode}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── FLEET TAB ───
function FleetTab() {
  return (
    <Section title="Fleet Management & GPS Tracking" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}>
      {/* Fleet Summary */}
      <div style={{ ...sty.grid3, marginBottom: '16px' }}>
        {[
          { label: 'Total Fleet', value: '48', sub: 'Registered vehicles', color: '#64748b' },
          { label: 'Active Now', value: '38', sub: '79% utilization', color: '#10b981' },
          { label: 'In Transit', value: '14', sub: 'GPS tracked', color: '#3b82f6' },
          { label: 'Loading', value: '8', sub: 'At plant bay', color: '#f59e0b' },
          { label: 'Maintenance', value: '3', sub: 'Workshop', color: '#ef4444' },
          { label: 'Idle', value: '5', sub: 'Available', color: '#94a3b8' },
        ].map((s, i) => (
          <div key={i} style={sty.summaryCard}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Vehicle Table */}
      <div style={sty.tableWrap}>
        <table style={sty.table}>
          <thead>
            <tr>
              {['Vehicle ID', 'Type', 'Capacity', 'Driver', 'Status', 'Location', 'GPS'].map((h) => (
                <th key={h} style={sty.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fleetVehicles.map((v) => {
              const statusColors = { loading: '#f59e0b', 'in-transit': '#10b981', 'at-destination': '#3b82f6', returning: '#8b5cf6', maintenance: '#ef4444', idle: '#94a3b8' }
              return (
                <tr key={v.id} style={sty.tr}>
                  <td style={sty.td}><span style={{ fontWeight: 600, color: ACCENT }}>{v.id}</span></td>
                  <td style={sty.td}>{v.type}</td>
                  <td style={sty.td}>{v.capacity}</td>
                  <td style={sty.td}>{v.driver}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusPill, background: `${statusColors[v.status]}15`, color: statusColors[v.status] }}>
                      {v.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td style={sty.td}>{v.location}</td>
                  <td style={sty.td}>
                    <span style={{ ...sty.statusDotSmall, background: v.gps ? '#10b981' : '#ef4444' }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* GPS Map Placeholder */}
      <div style={{ marginTop: '16px', padding: '32px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #e2e8f0', textAlign: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Live GPS Fleet Map</div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Real-time vehicle tracking with geofencing alerts — integrated with Google Maps / MapMyIndia</div>
      </div>
    </Section>
  )
}

// ─── PACKING TAB ───
function PackingTab() {
  return (
    <Section title="Packing & Bulk Loading Operations" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {packingLines.map((line) => {
          const speedPct = (line.speed / line.target) * 100
          const statusColor = line.status === 'running' ? '#10b981' : '#ef4444'
          return (
            <div key={line.id} style={sty.packingCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{line.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{line.product}</div>
                </div>
                <span style={{ ...sty.statusPill, background: `${statusColor}15`, color: statusColor }}>
                  {line.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Speed: {line.speed} {line.bags > 0 ? 'bags' : 'MT'}/hr</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: speedPct >= 90 ? '#10b981' : '#f59e0b' }}>{speedPct.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={speedPct} color={speedPct >= 90 ? '#10b981' : '#f59e0b'} />
                </div>
                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Uptime</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: line.uptime >= 95 ? '#10b981' : '#f59e0b' }}>{line.uptime}%</div>
                </div>
                {line.bags > 0 && (
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Today's Output</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{line.bags.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Packing Summary */}
      <div style={{ ...sty.grid3, marginTop: '16px' }}>
        {[
          { label: 'Total Bags Packed Today', value: '50,470', color: '#10b981' },
          { label: 'Bulk Loaded Today', value: '960 MT', color: '#3b82f6' },
          { label: 'Packing Efficiency', value: '93.8%', color: ACCENT },
        ].map((s, i) => (
          <div key={i} style={sty.summaryCard}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── AI TAB ───
function AITab() {
  return (
    <Section title="AI-Powered Supply Chain Optimization" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" /></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {aiRecommendations.map((rec, i) => {
          const priorityColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' }
          const color = priorityColors[rec.priority]
          return (
            <div key={i} style={{ ...sty.aiCard, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</span>
                    <span style={{ ...sty.statusPill, background: `${color}15`, color, fontSize: '10px', padding: '2px 8px' }}>{rec.priority}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.5' }}>{rec.desc}</div>
                </div>
                <button style={{ ...sty.actionBtn, borderColor: color, color }}>{rec.action}</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Models Active */}
      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8ecf1' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Active AI Models for Logistics</h4>
        <div style={sty.grid3}>
          {[
            { name: 'Demand Forecaster', model: 'XGBoost + LSTM', accuracy: '94.2%', status: 'active' },
            { name: 'Route Optimizer', model: 'Graph Neural Network', accuracy: '91.8%', status: 'active' },
            { name: 'Inventory Predictor', model: 'Prophet + LightGBM', accuracy: '93.5%', status: 'active' },
            { name: 'Loading Scheduler', model: 'Constraint Optimization', accuracy: '96.1%', status: 'active' },
            { name: 'Anomaly Detector', model: 'Isolation Forest', accuracy: '89.4%', status: 'active' },
            { name: 'Price Optimizer', model: 'Multi-Armed Bandit', accuracy: '87.6%', status: 'training' },
          ].map((m, i) => (
            <div key={i} style={sty.miniCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{m.name}</span>
                <span style={{ ...sty.statusDotSmall, background: m.status === 'active' ? '#10b981' : '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{m.model}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>{m.accuracy}</div>
            </div>
          ))}
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
  row: { display: 'flex', gap: '16px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', animation: 'fadeUp 0.7s ease both' },
  kpiIcon: { width: '36px', height: '36px', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' },
  kpiValue: { fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' },
  kpiLabel: { fontSize: '11px', color: '#94a3b8' },
  trendBadge: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  miniCard: { background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9' },
  infoCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #f1f5f9', height: '100%' },
  infoTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#1e293b' },
  summaryCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9', textAlign: 'center' },
  warehouseCard: { background: '#fff', borderRadius: '10px', padding: '14px', border: '2px solid #e8ecf1', cursor: 'pointer', transition: 'all 0.2s' },
  packingCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  aiCard: { background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #f1f5f9' },
  actionBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  tableWrap: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f8fafc', color: '#1e293b' },
  tr: { transition: 'background 0.15s' },
  statusPill: { display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
  statusDotSmall: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%' },
}

export default InventoryLogistics
