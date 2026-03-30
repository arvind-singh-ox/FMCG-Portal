'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function AreaChart({ data, color, height = 50 }) {
  const ref = useRef(null); const [w, setW] = useState(200)
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect() }, [])
  const max = Math.max(...data) * 1.05, min = Math.min(...data) * 0.95, range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ')
  const gid = `ac-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`
  return (<div ref={ref} style={{ width: '100%' }}><svg width={w} height={height} style={{ display: 'block' }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs><polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gid})`} /><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg></div>)
}

function DonutChart({ value, max, size = 80, strokeWidth = 8, color, label }) {
  const [animPct, setAnimPct] = useState(0); const pct = (value / max) * 100
  useEffect(() => { const duration = 1600, startTime = performance.now(); const step = (now) => { const p = Math.min((now - startTime) / duration, 1); setAnimPct(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [pct])
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r
  return (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||ACCENT} strokeWidth={strokeWidth} strokeDasharray={`${(animPct/100)*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} /><text x={size/2} y={label ? size/2-4 : size/2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1e293b">{Math.round(animPct)}%</text>{label && <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="8" fill="#94a3b8">{label}</text>}</svg>)
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (<div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div><h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2></div>{badge && <span style={{ background: ACCENT+'12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}</div>{visible && children}</div>)
}

// ════════════════════════════════════════════════
// PREDICTIVE ANALYTICS DATA
// ════════════════════════════════════════════════

const summaryCards = [
  { label: 'Active Forecasts', value: '24', color: ACCENT },
  { label: 'Forecast Accuracy', value: '94.8%', color: GREEN },
  { label: 'Horizon Range', value: '1 hr – 90 days', color: BLUE },
  { label: 'Value Generated MTD', value: '₹4.2 Cr', color: '#1e293b' },
  { label: 'Incidents Prevented', value: '18', color: RED },
  { label: 'Models Active', value: '14', color: GREEN },
]

// ── Production Forecasts ──
const productionForecasts = [
  { name: 'Hot Metal Production (T/day)', current: 9847, forecast24h: 10050, forecast7d: 9920, forecast30d: 10100, accuracy: 95.2, trend: [9500, 9600, 9700, 9800, 9847, 9900, 10050], confidence: '±180 T', model: 'LSTM + Seasonal Decomposition', color: RED },
  { name: 'Crude Steel Output (T/day)', current: 10200, forecast24h: 10380, forecast7d: 10250, forecast30d: 10450, accuracy: 94.8, trend: [9800, 9900, 10000, 10100, 10200, 10300, 10380], confidence: '±220 T', model: 'XGBoost + Calendar Features', color: ACCENT },
  { name: 'Rolled Product Dispatch (T/day)', current: 8940, forecast24h: 9100, forecast7d: 9050, forecast30d: 9200, accuracy: 93.5, trend: [8600, 8700, 8800, 8900, 8940, 9000, 9100], confidence: '±250 T', model: 'Prophet + LSTM Hybrid', color: BLUE },
  { name: 'Coke Production (T/day)', current: 3280, forecast24h: 3310, forecast7d: 3290, forecast30d: 3320, accuracy: 96.1, trend: [3200, 3230, 3250, 3270, 3280, 3290, 3310], confidence: '±45 T', model: 'ARIMA + ML Correction', color: '#1e293b' },
]

// ── Quality Forecasts ──
const qualityForecasts = [
  { name: 'Hot Metal Silicon [Si]', current: '0.45%', nextCast: '0.43%', next4h: '0.48%', trend: [0.42, 0.44, 0.46, 0.45, 0.44, 0.43, 0.43], accuracy: 94.2, horizon: '90 min (per cast)', model: 'LSTM (18,400 casts training)', insight: 'Slight cooling trend — next cast Si predicted lower. No action needed if stays within 0.30–0.60%.', color: GREEN },
  { name: 'Steel Carbon [C] at BOF End', current: '0.04%', nextHeat: '0.04%', next4h: '0.04%', trend: [0.06, 0.05, 0.04, 0.05, 0.04, 0.04, 0.04], accuracy: 97.2, horizon: '8 min (per blow)', model: 'XGBoost + Thermodynamic', insight: 'Endpoint prediction on target. First-hit rate 97.2% — no re-blow expected.', color: BLUE },
  { name: 'Yield Strength ReH (MPa)', current: '415', nextCoil: '418', next4h: '416', trend: [410, 412, 415, 418, 416, 418, 418], accuracy: 94.8, horizon: '3 min (per coil)', model: 'Microstructure NN', insight: 'Properties stable for S355J2. Current FDT and coiling temp producing optimal ferrite-pearlite.', color: ACCENT },
  { name: 'Surface Defect Rate (%)', current: '0.32', nextShift: '0.28', nextWeek: '0.25', trend: [0.45, 0.42, 0.38, 0.35, 0.32, 0.30, 0.28], accuracy: 92.8, horizon: '8 hrs (per shift)', model: 'CNN Vision + Process Correlation', insight: 'Descaler #2 fix and oscillation adjustment predicted to reduce defects by 12%.', color: AMBER },
]

// ── Energy & Cost Forecasts ──
const energyForecasts = [
  { name: 'Specific Energy (Gcal/TCS)', current: 5.82, forecast24h: 5.80, forecast7d: 5.78, forecast30d: 5.75, accuracy: 95.5, trend: [5.92, 5.88, 5.85, 5.83, 5.82, 5.81, 5.80], unit: 'Gcal/TCS', insight: 'Downward trend continues. CDQ commissioning and gas recovery improvements driving SEC reduction.', color: GREEN },
  { name: 'Grid Import (MW)', current: 66, forecast24h: 62, forecast7d: 64, forecast30d: 60, accuracy: 92.4, trend: [72, 70, 68, 66, 64, 62, 62], unit: 'MW', insight: 'Grid import reducing as captive generation increases. Solar + WHR contributing additional 4 MW.', color: BLUE },
  { name: 'Gas Flaring Rate (%)', current: 7.9, forecast24h: 6.5, forecast7d: 5.8, forecast30d: 5.0, accuracy: 91.8, trend: [10.2, 9.5, 8.8, 8.2, 7.9, 7.2, 6.5], unit: '%', insight: 'Gas network optimizer reducing flaring steadily. Target <5% achievable by end of month.', color: AMBER },
  { name: 'Energy Cost (₹ Cr/day)', current: 3.42, forecast24h: 3.38, forecast7d: 3.35, forecast30d: 3.28, accuracy: 90.5, trend: [3.58, 3.52, 3.48, 3.44, 3.42, 3.40, 3.38], unit: '₹ Cr', insight: 'Off-peak tariff optimization and gas recovery driving cost down 4.1% vs last month.', color: '#1e293b' },
]

// ── Maintenance & Failure Forecasts ──
const maintenanceForecasts = [
  { asset: 'HSM — F3 Stand Bearing', failureProbability: 87, timeToFailure: '72 hrs', confidence: 92, model: 'LSTM Envelope + Weibull', severity: 'critical', recommendation: 'Schedule replacement during next roll change (tomorrow 06:00). Bearing NU 2340 in inventory.', trend: [15, 22, 35, 48, 62, 75, 87] },
  { asset: 'BF #1 — Hearth Refractory (Taphole)', failureProbability: 38, timeToFailure: '60 days', confidence: 87, model: 'Inverse Heat Transfer + CNN', severity: 'warning', recommendation: 'Refractory at 62%. Shift cast pattern to reduce TH#2 usage. Full assessment during quarterly banking.', trend: [12, 18, 22, 28, 32, 35, 38] },
  { asset: 'BOF #1 — Vessel Refractory (Barrel)', failureProbability: 28, timeToFailure: '380 heats (~25 days)', confidence: 88, model: 'Refractory Wear NN', severity: 'info', recommendation: 'Lining at 185mm remaining (start: 350mm). Increase slag splashing frequency to extend campaign 150 heats.', trend: [8, 12, 15, 18, 22, 25, 28] },
  { asset: 'Caster #1 — Mold Copper Plates', failureProbability: 45, timeToFailure: '220 heats (~15 days)', confidence: 91, model: 'Mold Life Regression', severity: 'warning', recommendation: 'Surface roughness trending up. Schedule mold change during next campaign break (22 Mar).', trend: [10, 18, 25, 32, 38, 42, 45] },
  { asset: 'Sinter Plant — ESP Collecting Plates', failureProbability: 22, timeToFailure: '45 days', confidence: 85, model: 'ESP Performance AI', severity: 'info', recommendation: 'Dust cake resistance increasing. Rapping intensity adjustment in 5 days will extend life.', trend: [5, 8, 12, 15, 18, 20, 22] },
  { asset: 'Power Plant — TG #1 Bearing', failureProbability: 12, timeToFailure: '120 days', confidence: 82, model: 'Vibration Trend Regression', severity: 'info', recommendation: 'Normal wear pattern. Next overhaul aligned with planned TG shutdown (1 May).', trend: [3, 5, 7, 8, 10, 11, 12] },
]

// ── Demand & Market Forecasts ──
const demandForecasts = [
  { product: 'HR Coils', currentOrders: '6,200 MT', forecast30d: '7,400 MT', forecast90d: '8,100 MT', trend: 'up', growth: '+19.4%', confidence: 88, insight: 'Infrastructure push driving HRC demand. Q2 seasonal uptick expected.' },
  { product: 'HR Plates (API)', currentOrders: '2,800 MT', forecast30d: '3,200 MT', forecast90d: '3,800 MT', trend: 'up', growth: '+35.7%', insight: 'Oil & gas capex recovery. API 5L X65 demand from Tenaris/Welspun pipeline.' },
  { product: 'Slabs (Export)', currentOrders: '3,400 MT', forecast30d: '3,100 MT', forecast90d: '2,800 MT', trend: 'down', growth: '-17.6%', confidence: 82, insight: 'EU CBAM implementation reducing slab exports. Shift to domestic value-added products.' },
  { product: 'Wire Rod', currentOrders: '1,200 MT', forecast30d: '1,350 MT', forecast90d: '1,500 MT', trend: 'up', growth: '+25%', confidence: 85, insight: 'Construction season demand. Fastener and wire drawing sectors growing.' },
]

// ── Commodity Price Forecasts ──
const commodityForecasts = [
  { commodity: 'Australian HCC ($/MT CFR)', current: 215, forecast30d: 228, forecast90d: 245, trend: [198, 205, 210, 215, 220, 228, 235], accuracy: 85, insight: 'China restocking + monsoon India supply disruption. Recommend forward contract for Q2 volume.' },
  { commodity: 'Iron Ore 62% Fe ($/MT)', current: 108, forecast30d: 112, forecast90d: 105, trend: [102, 105, 108, 110, 112, 110, 108], accuracy: 82, insight: 'Short-term spike on China stimulus, reversal expected as port inventories build.' },
  { commodity: 'Steel HRC Price (₹/MT)', current: 52500, forecast30d: 54200, forecast90d: 56800, trend: [48000, 49500, 51000, 52500, 53500, 54200, 55000], accuracy: 80, insight: 'Domestic demand strong. Import duties and safeguard measures supporting prices.' },
  { commodity: 'Natural Gas ($/MMBtu)', current: 2.85, forecast30d: 3.10, forecast90d: 3.45, trend: [2.40, 2.55, 2.70, 2.85, 2.95, 3.10, 3.20], accuracy: 78, insight: 'Winter depletion of European stocks. LNG diversion impacting Asian spot.' },
]

// ── Weather & External Impact ──
const weatherImpact = [
  { factor: 'Monsoon Onset', forecast: '12 days (est. 31 Mar)', impact: 'Coal moisture +2.2%, sinter permeability -8%, conveyor slippage +15%', severity: 'high', preparation: 'Pre-stock 15 days coal buffer, install belt anti-slip devices, increase sinter drying time' },
  { factor: 'Cyclone Risk (Bay of Bengal)', forecast: 'Low — next 30 days', impact: 'Port operations — Paradip/Haldia may close 2-3 days if cyclone forms', severity: 'low', preparation: 'Import coal vessel SHP-4821 scheduled before monsoon window' },
  { factor: 'Grid Power Availability', forecast: '98.5% reliability next 30 days', impact: 'Peak demand season may cause 2-3 hrs load shedding in April', severity: 'medium', preparation: 'Ensure captive power at 182 MW. Test DG backup weekly.' },
  { factor: 'Water Availability (River)', forecast: 'Adequate through June', impact: 'Post-monsoon reservoir at 82% — no water shortage expected', severity: 'low', preparation: 'Water recycling at 94.2% — maintain current ZLD operations' },
]

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

export default function PredictiveAnalytics() {
  const [tab, setTab] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1) }
  const show = (c) => tab === 'all' || tab === c

  const tabs = [
    { key: 'all', label: 'All Forecasts' },
    { key: 'production', label: 'Production' },
    { key: 'quality', label: 'Quality' },
    { key: 'energy', label: 'Energy & Cost' },
    { key: 'maintenance', label: 'Failure Prediction' },
    { key: 'demand', label: 'Demand & Market' },
    { key: 'weather', label: 'External Factors' },
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

      <div style={st.header}>
        <div>
          <h1 style={st.title}>Predictive Analytics</h1>
          <p style={st.sub}>AI forecasting for production, quality, energy, maintenance, demand & external factors</p>
        </div>
        <div style={st.headerRight}>
          <span style={st.liveBadge}><span style={{ ...st.liveDot, animation: 'pulse 2s infinite' }} /> 24 Active Forecasts</span>
          <span style={st.aiBadge}>Avg Accuracy: 94.8%</span>
          <span style={st.timeBadge}>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {summaryCards.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (<button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => switchTab(t.key)}>{t.label}</button>))}
      </div>

      {/* ═══ PRODUCTION FORECASTS ═══ */}
      {show('production') && (
        <Section title="Production Volume Forecasts" badge="4 KPIs" icon="PR">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {productionForecasts.map((f, i) => (
              <div key={f.name} style={{ ...st.card, borderLeft: `4px solid ${f.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{f.name}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{f.model} | Confidence: {f.confidence}</div>
                  </div>
                  <DonutChart value={f.accuracy} max={100} size={48} strokeWidth={5} color={f.color} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Current</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{f.current.toLocaleString()}</div></div>
                  <div style={{ background: `${ACCENT}08`, borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${ACCENT}20` }}><div style={{ fontSize: '9px', color: ACCENT }}>24h Forecast</div><div style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{f.forecast24h.toLocaleString()}</div></div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>7-Day</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{f.forecast7d.toLocaleString()}</div></div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>30-Day</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{f.forecast30d.toLocaleString()}</div></div>
                </div>
                <AreaChart data={f.trend} color={f.color} height={40} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ QUALITY FORECASTS ═══ */}
      {show('quality') && (
        <Section title="Quality Prediction & Forecasting" badge="4 Parameters" icon="QF">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {qualityForecasts.map((q, i) => (
              <div key={q.name} style={{ ...st.card, borderLeft: `4px solid ${q.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{q.name}</span>
                      <span style={{ fontSize: '9px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{q.horizon}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: ACCENT, fontWeight: 500 }}>{q.model}</div>
                  </div>
                  <DonutChart value={q.accuracy} max={100} size={52} strokeWidth={5} color={q.color} label="accuracy" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Current</div><div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{q.current}</div></div>
                  <div style={{ background: `${ACCENT}08`, borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${ACCENT}20` }}><div style={{ fontSize: '9px', color: ACCENT }}>Next Predicted</div><div style={{ fontSize: '20px', fontWeight: 700, color: ACCENT }}>{q.nextCast || q.nextHeat || q.nextCoil || q.nextShift}</div></div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>4-Hour Forecast</div><div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{q.next4h || q.nextWeek}</div></div>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><AreaChart data={q.trend} color={q.color} height={36} /></div>
                  <div style={{ flex: 1, padding: '8px 12px', background: `${ACCENT}06`, borderRadius: '8px', border: `1px solid ${ACCENT}15` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}><span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px' }}>AI</span><span style={{ fontSize: '9px', color: ACCENT, fontWeight: 600 }}>INSIGHT</span></div>
                    <div style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>{q.insight}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ ENERGY & COST ═══ */}
      {show('energy') && (
        <Section title="Energy & Cost Forecasts" badge="4 Metrics" icon="EN">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {energyForecasts.map((e, i) => (
              <div key={e.name} style={{ ...st.card, borderLeft: `4px solid ${e.color}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{e.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Current</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{e.current}</div></div>
                  <div style={{ textAlign: 'center', background: `${ACCENT}08`, borderRadius: '6px', padding: '4px' }}><div style={{ fontSize: '9px', color: ACCENT }}>24h</div><div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}>{e.forecast24h}</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>7-Day</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{e.forecast7d}</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>30-Day</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{e.forecast30d}</div></div>
                </div>
                <AreaChart data={e.trend} color={e.color} height={36} />
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', lineHeight: '1.5' }}>{e.insight}</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Accuracy: {e.accuracy}% | Unit: {e.unit}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ FAILURE PREDICTION ═══ */}
      {show('maintenance') && (
        <Section title="Equipment Failure Prediction" badge="6 Assets Tracked" icon="FP">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {maintenanceForecasts.map((m, i) => {
              const sevColors = { critical: RED, warning: AMBER, info: BLUE }
              const sc = sevColors[m.severity]
              return (
                <div key={m.asset} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: sc, padding: '2px 6px', borderRadius: '3px' }}>{m.severity}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{m.asset}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{m.model} | Confidence: {m.confidence}%</div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <DonutChart value={m.failureProbability} max={100} size={56} strokeWidth={5} color={sc} label="P(fail)" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 12px' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Failure Probability</div><div style={{ fontSize: '18px', fontWeight: 700, color: sc }}>{m.failureProbability}%</div></div>
                        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 12px' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Time to Failure</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{m.timeToFailure}</div></div>
                      </div>
                    </div>
                    <div style={{ width: '140px' }}><div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '2px' }}>Risk Trend</div><AreaChart data={m.trend} color={sc} height={32} /></div>
                  </div>
                  <div style={{ padding: '8px 10px', background: `${ACCENT}06`, borderRadius: '6px', border: `1px solid ${ACCENT}15` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}><span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px' }}>AI</span><span style={{ fontSize: '9px', color: ACCENT, fontWeight: 600 }}>RECOMMENDATION</span></div>
                    <div style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>{m.recommendation}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ DEMAND & MARKET ═══ */}
      {show('demand') && (
        <>
          <Section title="Product Demand Forecasts" badge="4 Product Lines" icon="DF">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {demandForecasts.map((d, i) => {
                const trendColor = d.trend === 'up' ? GREEN : RED
                return (
                  <div key={d.product} style={{ ...st.card, borderLeft: `4px solid ${trendColor}`, animation: `slideIn 0.7s ease ${i * 0.08}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{d.product}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: trendColor }}>{d.growth} {d.trend === 'up' ? '↑' : '↓'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '6px', padding: '8px' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Current Orders</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{d.currentOrders}</div></div>
                      <div style={{ textAlign: 'center', background: `${ACCENT}08`, borderRadius: '6px', padding: '8px' }}><div style={{ fontSize: '9px', color: ACCENT }}>30-Day</div><div style={{ fontSize: '14px', fontWeight: 700, color: ACCENT }}>{d.forecast30d}</div></div>
                      <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '6px', padding: '8px' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>90-Day</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{d.forecast90d}</div></div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>{d.insight}</div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Commodity Price Forecasts" badge="AI Procurement Intelligence" icon="CP">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {commodityForecasts.map((c, i) => {
                const direction = c.forecast30d > c.current ? AMBER : GREEN
                return (
                  <div key={c.commodity} style={{ ...st.card, borderLeft: `4px solid ${direction}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>{c.commodity}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>Current</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{typeof c.current === 'number' && c.current > 1000 ? c.current.toLocaleString() : c.current}</div></div>
                      <div style={{ textAlign: 'center', background: `${direction}08`, borderRadius: '6px', padding: '4px' }}><div style={{ fontSize: '9px', color: direction }}>30-Day</div><div style={{ fontSize: '16px', fontWeight: 700, color: direction }}>{typeof c.forecast30d === 'number' && c.forecast30d > 1000 ? c.forecast30d.toLocaleString() : c.forecast30d}</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: '#94a3b8' }}>90-Day</div><div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{typeof c.forecast90d === 'number' && c.forecast90d > 1000 ? c.forecast90d.toLocaleString() : c.forecast90d}</div></div>
                    </div>
                    <AreaChart data={c.trend} color={direction} height={32} />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>{c.insight}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Accuracy: {c.accuracy}%</div>
                  </div>
                )
              })}
            </div>
          </Section>
        </>
      )}

      {/* ═══ EXTERNAL FACTORS ═══ */}
      {show('weather') && (
        <Section title="External Factors & Weather Impact" badge="4 Factors Monitored" icon="WX">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weatherImpact.map((w, i) => {
              const sevColors = { high: RED, medium: AMBER, low: GREEN }
              const sc = sevColors[w.severity]
              return (
                <div key={w.factor} style={{ ...st.card, borderLeft: `4px solid ${sc}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: sc, padding: '2px 6px', borderRadius: '3px' }}>{w.severity}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{w.factor}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: ACCENT }}>{w.forecast}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '10px', background: '#fef2f208', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>IMPACT</div>
                      <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: '1.5' }}>{w.impact}</div>
                    </div>
                    <div style={{ padding: '10px', background: `${GREEN}06`, borderRadius: '8px', border: `1px solid ${GREEN}15` }}>
                      <div style={{ fontSize: '9px', color: GREEN, fontWeight: 600, marginBottom: '3px' }}>PREPARATION</div>
                      <div style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.5' }}>{w.preparation}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* AI Footer */}
      <div style={st.aiFooter}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Predictive Analytics Engine — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            24 active forecasts across 7 categories. Models: LSTM production forecasting (95.2%), XGBoost quality prediction (97.2%), Prophet energy trends,
            Weibull failure probability, commodity price regression, weather-process correlation. Forecast horizons: 1 hour to 90 days.
            Value generated this month: ₹4.2 Cr through early warnings, procurement timing, and production optimization.
            18 potential incidents prevented through proactive forecasting. Average accuracy: 94.8%. Next model ensemble retraining: 4 hours.
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
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  aiFooter: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
