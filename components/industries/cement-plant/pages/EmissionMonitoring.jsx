'use client'
import React, { useState, useEffect, useRef } from 'react'

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
function AnimatedValue({ value, suffix = '', prefix = '', active = true, decimals }) {
  const [display, setDisplay] = useState(0)
  const numVal = parseFloat(String(value).replace(/,/g, ''))
  useEffect(() => {
    if (!active) return
    const duration = 1400
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(numVal * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal, active])
  const dec = decimals !== undefined ? decimals : (numVal >= 100 ? 0 : numVal >= 1 ? 1 : 3)
  const formatted = dec === 0 ? Math.round(display).toLocaleString() : display.toFixed(dec)
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
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * cWidth},${height - ((v - min) / range) * (height - 8)}`).join(' ')
  const areaPoints = `0,${height} ${points} ${cWidth},${height}`
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={cWidth} height={height}>
        <defs><linearGradient id={`ag-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
        <polygon points={areaPoints} fill={`url(#ag-${color.replace('#', '')})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  )
}

// ─── Gauge Chart (semicircle) ───
function GaugeChart({ value, max, unit, label, zones, size = 140 }) {
  const r = size * 0.35
  const cx = size / 2
  const cy = size * 0.48
  const arc = (from, to) => {
    const x1 = cx + r * Math.cos(Math.PI - from * Math.PI)
    const y1 = cy - r * Math.sin(Math.PI - from * Math.PI)
    const x2 = cx + r * Math.cos(Math.PI - to * Math.PI)
    const y2 = cy - r * Math.sin(Math.PI - to * Math.PI)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }
  const ratio = Math.min(value / max, 1)
  const needleAngle = Math.PI - ratio * Math.PI
  const nx = cx + (r - 8) * Math.cos(needleAngle)
  const ny = cy - (r - 8) * Math.sin(needleAngle)
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {zones.map((z, i) => (
          <path key={i} d={arc(z.from, z.to)} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e293b">{value}{unit}</text>
      </svg>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '-2px' }}>{label}</div>
    </div>
  )
}

// ─── Sparkline ───
function Sparkline({ data, color, w = 80, h = 24 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>
}

// ─── SPC Chart (Statistical Process Control) ───
function SPCChart({ data, ucl, lcl, target, title, unit, height = 140 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(400)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setCWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const padding = { top: 20, right: 12, bottom: 24, left: 42 }
  const w = cWidth - padding.left - padding.right
  const h = height - padding.top - padding.bottom
  const allVals = [...data, ucl, lcl, target]
  const max = Math.max(...allVals) + (ucl - lcl) * 0.15
  const min = Math.min(...allVals) - (ucl - lcl) * 0.15
  const range = max - min || 1
  const x = (i) => padding.left + (i / (data.length - 1)) * w
  const y = (v) => padding.top + (1 - (v - min) / range) * h
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const uclY = y(ucl), lclY = y(lcl), tgtY = y(target)
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{title}</div>
      <svg width={cWidth} height={height}>
        <rect x={padding.left} y={uclY} width={w} height={lclY - uclY} fill="#16a34a" opacity="0.06" />
        <line x1={padding.left} y1={uclY} x2={padding.left + w} y2={uclY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" />
        <line x1={padding.left} y1={lclY} x2={padding.left + w} y2={lclY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" />
        <line x1={padding.left} y1={tgtY} x2={padding.left + w} y2={tgtY} stroke="#16a34a" strokeWidth="1" strokeDasharray="6,3" />
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth="2" />
        {data.map((v, i) => {
          const oob = v > ucl || v < lcl
          return <circle key={i} cx={x(i)} cy={y(v)} r={oob ? 4 : 2.5} fill={oob ? '#ef4444' : ACCENT} stroke={oob ? '#fff' : 'none'} strokeWidth={oob ? 1.5 : 0} />
        })}
        <text x={padding.left - 4} y={uclY + 4} textAnchor="end" fontSize="9" fill="#ef4444">UCL</text>
        <text x={padding.left - 4} y={lclY + 4} textAnchor="end" fontSize="9" fill="#ef4444">LCL</text>
        <text x={padding.left - 4} y={tgtY + 4} textAnchor="end" fontSize="9" fill="#16a34a">TGT</text>
        <text x={cWidth - padding.right} y={uclY - 3} textAnchor="end" fontSize="9" fill="#ef4444">{ucl}{unit}</text>
        <text x={cWidth - padding.right} y={lclY + 12} textAnchor="end" fontSize="9" fill="#ef4444">{lcl}{unit}</text>
        <text x={cWidth - padding.right} y={tgtY - 3} textAnchor="end" fontSize="9" fill="#16a34a">{target}{unit}</text>
      </svg>
    </div>
  )
}

// ─── Stacked Bar Chart ───
function StackedBarChart({ data, height = 180 }) {
  const containerRef = useRef(null)
  const [cWidth, setCWidth] = useState(400)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setCWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const padding = { top: 10, right: 12, bottom: 28, left: 42 }
  const w = cWidth - padding.left - padding.right
  const h = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map(d => d.values.reduce((a, b) => a + b, 0))) * 1.1
  const barW = Math.min(w / data.length * 0.6, 36)
  const gap = w / data.length
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={cWidth} height={height}>
        {data.map((d, i) => {
          let cumY = 0
          return (
            <React.Fragment key={i}>
              {d.values.map((v, j) => {
                const barH = (v / maxVal) * h
                const yPos = padding.top + h - cumY - barH
                cumY += barH
                return <rect key={j} x={padding.left + i * gap + (gap - barW) / 2} y={yPos} width={barW} height={barH} fill={d.colors[j]} rx="2" opacity="0.85" />
              })}
              <text x={padding.left + i * gap + gap / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
            </React.Fragment>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Section Wrapper with Scroll Reveal ───
function Section({ title, icon, children, badge }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ ...s.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={s.sectionHeader}>
        <div style={s.sectionHeaderLeft}>{icon}<span style={s.sectionTitle}>{title}</span></div>
        {badge && <span style={s.sectionBadge}>{badge}</span>}
      </div>
      {visible && children}
    </div>
  )
}

// ═══════ DATA ═══════

const emissionKPIs = [
  { label: 'SO\u2082', value: 87, unit: 'mg/Nm\u00B3', limit: 200, status: 'compliant', trend: [102, 95, 91, 88, 90, 87], color: '#3b82f6' },
  { label: 'NO\u2093', value: 348, unit: 'mg/Nm\u00B3', limit: 600, status: 'compliant', trend: [380, 365, 355, 360, 352, 348], color: '#f59e0b' },
  { label: 'CO', value: 685, unit: 'mg/Nm\u00B3', limit: 1000, status: 'compliant', trend: [740, 720, 710, 695, 690, 685], color: '#8b5cf6' },
  { label: 'Dust/PM', value: 28, unit: 'mg/Nm\u00B3', limit: 30, status: 'warning', trend: [35, 32, 30, 29, 31, 28], color: '#ef4444' },
  { label: 'CO\u2082', value: 742, unit: 'kg/t clinker', limit: 900, status: 'compliant', trend: [780, 768, 755, 750, 748, 742], color: '#16a34a' },
  { label: 'Mercury (Hg)', value: 0.018, unit: 'mg/Nm\u00B3', limit: 0.05, status: 'compliant', trend: [0.024, 0.022, 0.020, 0.019, 0.019, 0.018], color: '#06b6d4' },
  { label: 'HCl', value: 6.2, unit: 'mg/Nm\u00B3', limit: 10, status: 'compliant', trend: [8.5, 7.8, 7.2, 6.8, 6.5, 6.2], color: '#ec4899' },
  { label: 'HF', value: 0.42, unit: 'mg/Nm\u00B3', limit: 1.0, status: 'compliant', trend: [0.55, 0.52, 0.48, 0.45, 0.43, 0.42], color: '#14b8a6' },
]

const dailySummary = [
  { hour: '00:00', so2: 92, nox: 355, co: 710, dust: 30, co2: 755 },
  { hour: '04:00', so2: 88, nox: 348, co: 695, dust: 28, co2: 748 },
  { hour: '08:00', so2: 95, nox: 370, co: 720, dust: 32, co2: 760 },
  { hour: '12:00', so2: 85, nox: 340, co: 680, dust: 27, co2: 740 },
  { hour: '16:00', so2: 90, nox: 352, co: 690, dust: 29, co2: 745 },
  { hour: '20:00', so2: 87, nox: 348, co: 685, dust: 28, co2: 742 },
]

const cemsStacks = [
  {
    name: 'Kiln Stack',
    status: 'online',
    flow: 285000, flowUnit: 'Nm\u00B3/hr',
    temp: 168, tempUnit: '\u00B0C',
    o2: 10.2, o2Unit: '%',
    moisture: 12.4, moistUnit: '%',
    opacity: 8.5, opacUnit: '%',
    so2: 87, nox: 348, dust: 28, co: 685,
  },
  {
    name: 'Raw Mill Stack',
    status: 'online',
    flow: 420000, flowUnit: 'Nm\u00B3/hr',
    temp: 128, tempUnit: '\u00B0C',
    o2: 14.8, o2Unit: '%',
    moisture: 8.2, moistUnit: '%',
    opacity: 5.2, opacUnit: '%',
    so2: 42, nox: 125, dust: 18, co: 320,
  },
  {
    name: 'Cement Mill Stack',
    status: 'online',
    flow: 185000, flowUnit: 'Nm\u00B3/hr',
    temp: 95, tempUnit: '\u00B0C',
    o2: 18.5, o2Unit: '%',
    moisture: 4.1, moistUnit: '%',
    opacity: 3.8, opacUnit: '%',
    so2: 12, nox: 45, dust: 15, co: 110,
  },
  {
    name: 'Coal Mill Stack',
    status: 'maintenance',
    flow: 0, flowUnit: 'Nm\u00B3/hr',
    temp: 42, tempUnit: '\u00B0C',
    o2: 20.9, o2Unit: '%',
    moisture: 2.0, moistUnit: '%',
    opacity: 0.5, opacUnit: '%',
    so2: 0, nox: 0, dust: 2, co: 0,
  },
]

const cemsEquipment = [
  { analyzer: 'SO\u2082 Analyzer (UV Fluorescence)', stack: 'Kiln Stack', calibration: '2026-03-10', nextCal: '2026-04-10', drift: 0.8, driftLimit: 2.0, status: 'ok' },
  { analyzer: 'NO\u2093 Analyzer (Chemiluminescence)', stack: 'Kiln Stack', calibration: '2026-03-12', nextCal: '2026-04-12', drift: 1.2, driftLimit: 2.5, status: 'ok' },
  { analyzer: 'Dust Monitor (Laser Scatter)', stack: 'Kiln Stack', calibration: '2026-03-08', nextCal: '2026-04-08', drift: 0.5, driftLimit: 2.0, status: 'ok' },
  { analyzer: 'CO Analyzer (NDIR)', stack: 'Kiln Stack', calibration: '2026-03-14', nextCal: '2026-04-14', drift: 1.8, driftLimit: 2.5, status: 'watch' },
  { analyzer: 'O\u2082 Analyzer (Paramagnetic)', stack: 'Kiln Stack', calibration: '2026-03-11', nextCal: '2026-04-11', drift: 0.3, driftLimit: 1.0, status: 'ok' },
  { analyzer: 'Flow Monitor (Pitot Tube)', stack: 'Kiln Stack', calibration: '2026-03-05', nextCal: '2026-04-05', drift: 1.1, driftLimit: 3.0, status: 'ok' },
  { analyzer: 'Opacity Monitor (Transmissometer)', stack: 'Raw Mill', calibration: '2026-03-09', nextCal: '2026-04-09', drift: 0.6, driftLimit: 2.0, status: 'ok' },
  { analyzer: 'Mercury Analyzer (AFS)', stack: 'Kiln Stack', calibration: '2026-03-02', nextCal: '2026-04-02', drift: 0.4, driftLimit: 1.0, status: 'ok' },
]

const co2Data = {
  specific: 742,
  grossEmission: 4850,
  netEmission: 4620,
  clinkerProduction: 6535,
  clinkerFactor: 0.72,
  thermalSubstitution: 18.5,
  altFuelCO2Saving: 8.2,
  scope1: 3680,
  scope2: 720,
  scope3: 220,
  monthlyTrend: [
    { month: 'Oct', specific: 785, gross: 5120 },
    { month: 'Nov', specific: 772, gross: 5010 },
    { month: 'Dec', specific: 760, gross: 4920 },
    { month: 'Jan', specific: 755, gross: 4880 },
    { month: 'Feb', specific: 748, gross: 4850 },
    { month: 'Mar', specific: 742, gross: 4850 },
  ],
  decarbTargets: [
    { year: '2025', target: 770, actual: 768, status: 'achieved' },
    { year: '2026', target: 740, actual: 742, status: 'on-track' },
    { year: '2027', target: 710, actual: null, status: 'planned' },
    { year: '2030', target: 650, actual: null, status: 'planned' },
  ],
  altFuels: [
    { fuel: 'Refuse Derived Fuel (RDF)', share: 8.2, co2Saved: 3.8, calorific: 3200 },
    { fuel: 'Biomass (Rice Husk)', share: 4.5, co2Saved: 2.1, calorific: 3400 },
    { fuel: 'Tyre Derived Fuel (TDF)', share: 3.1, co2Saved: 1.2, calorific: 7200 },
    { fuel: 'Industrial Waste Solvents', share: 2.7, co2Saved: 1.1, calorific: 4500 },
  ],
}

const dustData = {
  monitoring: [
    { point: 'Kiln Stack', pm10: 26, pm25: 12, tsp: 34, limit: 30, type: 'stack' },
    { point: 'Raw Mill Stack', pm10: 16, pm25: 8, tsp: 22, limit: 30, type: 'stack' },
    { point: 'Cement Mill Stack', pm10: 14, pm25: 6, tsp: 18, limit: 30, type: 'stack' },
    { point: 'Clinker Cooler', pm10: 18, pm25: 9, tsp: 24, limit: 50, type: 'fugitive' },
    { point: 'Crusher Area', pm10: 42, pm25: 18, tsp: 58, limit: 100, type: 'fugitive' },
    { point: 'Packing Plant', pm10: 35, pm25: 14, tsp: 48, limit: 75, type: 'fugitive' },
    { point: 'Ambient NE', pm10: 68, pm25: 32, tsp: 95, limit: 100, type: 'ambient' },
    { point: 'Ambient SW', pm10: 55, pm25: 26, tsp: 78, limit: 100, type: 'ambient' },
  ],
  baghouses: [
    { name: 'Kiln ESP', type: 'Electrostatic Precipitator', efficiency: 99.4, inlet: 4500, outlet: 28, fields: 4, status: 'ok', voltageKV: 52 },
    { name: 'Raw Mill Baghouse', type: 'Pulse Jet Bag Filter', efficiency: 99.7, inlet: 6200, outlet: 18, bags: 2880, status: 'ok', pressureDrop: 125 },
    { name: 'Cement Mill Baghouse', type: 'Pulse Jet Bag Filter', efficiency: 99.8, inlet: 5800, outlet: 15, bags: 2400, status: 'ok', pressureDrop: 118 },
    { name: 'Cooler Baghouse', type: 'Pulse Jet Bag Filter', efficiency: 99.5, inlet: 3800, outlet: 18, bags: 1920, status: 'ok', pressureDrop: 132 },
  ],
  filterStatus: [
    { compartment: 'CM-BH Comp 1', bags: 480, healthy: 468, damaged: 8, replaced: 4, lastInspection: '2026-03-05', pressureDrop: 120 },
    { compartment: 'CM-BH Comp 2', bags: 480, healthy: 475, damaged: 3, replaced: 2, lastInspection: '2026-03-05', pressureDrop: 115 },
    { compartment: 'CM-BH Comp 3', bags: 480, healthy: 472, damaged: 5, replaced: 3, lastInspection: '2026-03-05', pressureDrop: 122 },
    { compartment: 'CM-BH Comp 4', bags: 480, healthy: 470, damaged: 7, replaced: 3, lastInspection: '2026-03-05', pressureDrop: 128 },
    { compartment: 'CM-BH Comp 5', bags: 480, healthy: 476, damaged: 2, replaced: 2, lastInspection: '2026-03-05', pressureDrop: 112 },
  ],
  pressureTrend: [118, 120, 122, 125, 119, 121, 128, 124, 120, 122, 125, 130, 126, 122, 118, 120, 123, 125, 122, 120],
}

const regulatoryData = {
  cpcb: [
    { parameter: 'PM/Dust', limit: 30, unit: 'mg/Nm\u00B3', actual: 28, status: 'compliant' },
    { parameter: 'SO\u2082', limit: 100, unit: 'mg/Nm\u00B3', actual: 87, status: 'compliant' },
    { parameter: 'NO\u2093', limit: 600, unit: 'mg/Nm\u00B3', actual: 348, status: 'compliant' },
    { parameter: 'Mercury (Hg)', limit: 0.03, unit: 'mg/Nm\u00B3', actual: 0.018, status: 'compliant' },
    { parameter: 'HCl', limit: 10, unit: 'mg/Nm\u00B3', actual: 6.2, status: 'compliant' },
    { parameter: 'HF', limit: 1.0, unit: 'mg/Nm\u00B3', actual: 0.42, status: 'compliant' },
  ],
  euIed: [
    { parameter: 'PM/Dust', limit: 20, unit: 'mg/Nm\u00B3', actual: 28, status: 'exceedance' },
    { parameter: 'SO\u2082', limit: 50, unit: 'mg/Nm\u00B3', actual: 87, status: 'exceedance' },
    { parameter: 'NO\u2093', limit: 200, unit: 'mg/Nm\u00B3', actual: 348, status: 'exceedance' },
    { parameter: 'Mercury (Hg)', limit: 0.05, unit: 'mg/Nm\u00B3', actual: 0.018, status: 'compliant' },
    { parameter: 'HCl', limit: 10, unit: 'mg/Nm\u00B3', actual: 6.2, status: 'compliant' },
    { parameter: 'HF', limit: 1.0, unit: 'mg/Nm\u00B3', actual: 0.42, status: 'compliant' },
  ],
  who: [
    { parameter: 'PM2.5 (Ambient)', limit: 15, unit: '\u00B5g/m\u00B3', actual: 32, status: 'exceedance' },
    { parameter: 'PM10 (Ambient)', limit: 45, unit: '\u00B5g/m\u00B3', actual: 68, status: 'exceedance' },
    { parameter: 'SO\u2082 (24hr)', limit: 40, unit: '\u00B5g/m\u00B3', actual: 28, status: 'compliant' },
    { parameter: 'NO\u2082 (Annual)', limit: 10, unit: '\u00B5g/m\u00B3', actual: 18, status: 'exceedance' },
  ],
  complianceScore: 94.2,
  exceedances: [
    { date: '2026-03-14', parameter: 'Dust/PM', value: 35, limit: 30, duration: '18 min', cause: 'Baghouse compartment offline for maintenance', action: 'Compartment restored, dust normalized within 25 min' },
    { date: '2026-03-08', parameter: 'SO\u2082', value: 115, limit: 100, duration: '42 min', cause: 'High-sulfur coal batch from alternate supplier', action: 'Switched to primary coal supply, limestone injection increased' },
    { date: '2026-02-22', parameter: 'Dust/PM', value: 38, limit: 30, duration: '12 min', cause: 'ESP power supply trip on Field 3', action: 'Auto-restart initiated, manual inspection scheduled' },
  ],
  reports: [
    { type: 'Monthly Return (CPCB)', period: 'February 2026', due: '2026-03-15', submitted: '2026-03-14', status: 'submitted' },
    { type: 'Quarterly Return (SPCB)', period: 'Q4 2025', due: '2026-01-31', submitted: '2026-01-28', status: 'submitted' },
    { type: 'Annual Environment Statement', period: '2025', due: '2026-04-30', submitted: null, status: 'pending' },
    { type: 'Monthly Return (CPCB)', period: 'March 2026', due: '2026-04-15', submitted: null, status: 'in-progress' },
  ],
}

const aiAnalytics = {
  predictions: [
    { parameter: 'SO\u2082 (next 4hr)', predicted: 91, confidence: 94.2, model: 'iFactory-SO2-LSTM', direction: 'up', delta: '+4.6%' },
    { parameter: 'NO\u2093 (next 4hr)', predicted: 355, confidence: 92.8, model: 'iFactory-NOx-XGBoost', direction: 'up', delta: '+2.0%' },
    { parameter: 'Dust (next 4hr)', predicted: 26, confidence: 91.5, model: 'iFactory-PM-RF', direction: 'down', delta: '-7.1%' },
    { parameter: 'CO\u2082 Specific (next shift)', predicted: 738, confidence: 93.1, model: 'iFactory-CO2-GBR', direction: 'down', delta: '-0.5%' },
    { parameter: 'CO (next 4hr)', predicted: 670, confidence: 90.4, model: 'iFactory-CO-LSTM', direction: 'down', delta: '-2.2%' },
  ],
  anomalies: [
    { time: '14:22', parameter: 'SO\u2082', type: 'Spike Detected', severity: 'medium', value: '112 mg/Nm\u00B3', baseline: '85-92 mg/Nm\u00B3', rootCause: 'Sulfur content variation in coal feed detected by AI', action: 'Adjust limestone dosing +5% recommended' },
    { time: '11:45', parameter: 'Opacity', type: 'Gradual Drift', severity: 'low', value: '9.2%', baseline: '7-8.5%', rootCause: 'ESP field voltage declining on Field 2', action: 'Schedule ESP field inspection within 48hrs' },
    { time: '08:10', parameter: 'NO\u2093', type: 'Correlation Shift', severity: 'low', value: '372 mg/Nm\u00B3', baseline: '340-360 mg/Nm\u00B3', rootCause: 'Kiln burning zone temperature 15\u00B0C above setpoint', action: 'Reduce primary air fan speed by 2%' },
  ],
  recommendations: [
    { priority: 'high', title: 'Increase SNCR Urea Injection by 8%', reason: 'NOx trending upward due to increased kiln thermal load. AI model predicts NOx may reach 400 mg/Nm\u00B3 within 6 hours at current trajectory. SNCR optimization can reduce NOx by 15-20%.', impact: 'Reduce NO\u2093 by 50-70 mg/Nm\u00B3', model: 'NOx Reduction Optimizer', confidence: 93 },
    { priority: 'high', title: 'Switch to Low-Sulfur Coal Blend', reason: 'Current coal sulfur content at 1.8% vs target 1.2%. SO\u2082 approaching CPCB limit. Blending 60:40 primary-to-imported coal will bring sulfur to 1.3% within 2 hours.', impact: 'Reduce SO\u2082 by 25-35 mg/Nm\u00B3', model: 'Fuel-Emission Correlator', confidence: 91 },
    { priority: 'medium', title: 'Optimize Clinker Cooler Airflow', reason: 'Excess air from cooler increasing thermal NOx formation. Reducing cooler excess air by 5% will lower flame temperature while maintaining clinker cooling efficiency.', impact: 'Reduce NO\u2093 by 20-30 mg/Nm\u00B3', model: 'Process Optimization Engine', confidence: 88 },
    { priority: 'low', title: 'Increase Alternative Fuel Rate to 22%', reason: 'Current TSR at 18.5%. AI analysis shows potential to safely increase to 22% with minimal impact on clinker quality. This will reduce specific CO\u2082 by 12-15 kg/t clinker.', impact: 'Save 12-15 kg CO\u2082/t clinker', model: 'Alt Fuel Impact Predictor', confidence: 85 },
  ],
  correlations: [
    { factor: 'Coal Sulfur Content', param: 'SO\u2082', correlation: 0.94, impact: 'Strong positive — 0.1% sulfur increase leads to ~15 mg/Nm\u00B3 SO\u2082 rise' },
    { factor: 'Kiln Burning Zone Temp', param: 'NO\u2093', correlation: 0.87, impact: 'Strong positive — 10\u00B0C increase leads to ~18 mg/Nm\u00B3 NOx rise' },
    { factor: 'Alternative Fuel Rate', param: 'CO\u2082', correlation: -0.82, impact: 'Strong negative — 1% TSR increase reduces ~4 kg CO\u2082/t clinker' },
    { factor: 'Raw Mill Operation', param: 'SO\u2082', correlation: -0.71, impact: 'Moderate negative — raw mill running absorbs 30-40% of SO\u2082 from kiln gas' },
    { factor: 'ESP Voltage', param: 'Dust/PM', correlation: -0.89, impact: 'Strong negative — voltage drop of 5kV increases dust by ~8 mg/Nm\u00B3' },
    { factor: 'Excess O\u2082', param: 'CO', correlation: -0.76, impact: 'Moderate negative — incomplete combustion at low O\u2082 raises CO sharply' },
  ],
  forecast: {
    so2: [87, 89, 91, 93, 90, 88, 85, 83],
    nox: [348, 352, 355, 358, 354, 350, 345, 342],
    dust: [28, 27, 26, 25, 26, 27, 26, 25],
    labels: ['Now', '+1hr', '+2hr', '+3hr', '+4hr', '+5hr', '+6hr', '+7hr'],
  },
}

// ═══════ COMPONENT ═══════

function EmissionMonitoring() {
  const [tab, setTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: 'Emission Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { key: 'cems', label: 'CEMS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { key: 'co2', label: 'CO\u2082 & Carbon', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg> },
    { key: 'dust', label: 'Dust & Particulate', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><circle cx="5" cy="8" r="2" /><circle cx="19" cy="16" r="2" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="6" r="1.5" /></svg> },
    { key: 'compliance', label: 'Regulatory Compliance', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
    { key: 'ai', label: 'AI Analytics', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-2 4-4 4s-4-2.05-4-4a4 4 0 0 1 4-4z" /><path d="M12 10v12" /><path d="M6 16l6-4 6 4" /></svg> },
  ]

  return (
    <div>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" /><path d="m8 17 4 4 4-4" />
            </svg>
          </div>
          <div>
            <h1 style={s.pageTitle}>Emission Monitoring</h1>
            <p style={s.pageSubtitle}>Real-time emission tracking, CEMS data, and regulatory compliance management</p>
          </div>
        </div>
        <div style={s.headerActions}>
          <span style={s.liveBadge}>
            <span style={s.liveDot} /> CEMS Online
          </span>
          <span style={{ ...s.statusBadge, color: emissionKPIs.some(k => k.status === 'warning') ? '#f59e0b' : '#16a34a', background: emissionKPIs.some(k => k.status === 'warning') ? '#fffbeb' : '#f0fdf4', border: emissionKPIs.some(k => k.status === 'warning') ? '1px solid #fde68a' : '1px solid #bbf7d0' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            1 Parameter Near Limit
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {tabs.map((t) => (
          <button key={t.key} style={tab === t.key ? s.tabActive : s.tab} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── Emission Overview Tab ─── */}
      {tab === 'overview' && (
        <>
          <Section title="Real-Time Emission KPIs" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>} badge="Auto-refresh: 15s">
            <div style={s.kpiGrid}>
              {emissionKPIs.map((kpi) => {
                const pct = (kpi.value / kpi.limit) * 100
                const isWarn = kpi.status === 'warning'
                return (
                  <div key={kpi.label} style={s.kpiCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
                      <span style={{ fontSize: '9px', background: isWarn ? '#fffbeb' : '#f0fdf4', color: isWarn ? '#f59e0b' : '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, border: `1px solid ${isWarn ? '#fde68a' : '#bbf7d0'}` }}>
                        {isWarn ? 'WARNING' : 'COMPLIANT'}
                      </span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                      <AnimatedValue value={kpi.value} decimals={kpi.value < 1 ? 3 : kpi.value < 10 ? 1 : 0} />
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>{kpi.unit}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>Limit: {kpi.limit} {kpi.unit}</div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginBottom: '8px' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '2px', background: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#16a34a', transition: 'width 1s ease' }} />
                    </div>
                    <Sparkline data={kpi.trend} color={kpi.color} w={100} h={20} />
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Daily Emission Summary (24-Hour Profile)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} badge="Today">
            <div style={{ ...s.tableGrid, gridTemplateColumns: '80px repeat(5, 1fr)' }}>
              <span style={s.tableHead}>Time</span>
              <span style={s.tableHead}>SO&#x2082; (mg/Nm&#xB3;)</span>
              <span style={s.tableHead}>NO&#x2093; (mg/Nm&#xB3;)</span>
              <span style={s.tableHead}>CO (mg/Nm&#xB3;)</span>
              <span style={s.tableHead}>Dust (mg/Nm&#xB3;)</span>
              <span style={s.tableHead}>CO&#x2082; (kg/t)</span>
              {dailySummary.map((row) => (
                <React.Fragment key={row.hour}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{row.hour}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{row.so2}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{row.nox}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{row.co}</span>
                  <span style={{ fontSize: '12px', color: row.dust > 30 ? '#ef4444' : '#475569', fontWeight: row.dust > 30 ? 700 : 400, padding: '8px 0' }}>{row.dust}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{row.co2}</span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Emission Gauges" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
              <GaugeChart value={87} max={200} unit="" label={`SO\u2082 (mg/Nm\u00B3)`} zones={[{ from: 0, to: 0.5, color: '#16a34a' }, { from: 0.5, to: 0.8, color: '#f59e0b' }, { from: 0.8, to: 1, color: '#ef4444' }]} />
              <GaugeChart value={348} max={600} unit="" label={`NO\u2093 (mg/Nm\u00B3)`} zones={[{ from: 0, to: 0.5, color: '#16a34a' }, { from: 0.5, to: 0.8, color: '#f59e0b' }, { from: 0.8, to: 1, color: '#ef4444' }]} />
              <GaugeChart value={28} max={30} unit="" label={`Dust (mg/Nm\u00B3)`} zones={[{ from: 0, to: 0.6, color: '#16a34a' }, { from: 0.6, to: 0.85, color: '#f59e0b' }, { from: 0.85, to: 1, color: '#ef4444' }]} />
              <GaugeChart value={685} max={1000} unit="" label={`CO (mg/Nm\u00B3)`} zones={[{ from: 0, to: 0.5, color: '#16a34a' }, { from: 0.5, to: 0.8, color: '#f59e0b' }, { from: 0.8, to: 1, color: '#ef4444' }]} />
            </div>
          </Section>
        </>
      )}

      {/* ─── CEMS Tab ─── */}
      {tab === 'cems' && (
        <>
          <Section title="Stack Monitoring — Live Data" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>} badge={`${cemsStacks.filter(st => st.status === 'online').length}/${cemsStacks.length} Stacks Online`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {cemsStacks.map((stack) => {
                const isOnline = stack.status === 'online'
                return (
                  <div key={stack.name} style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1', borderLeft: `4px solid ${isOnline ? '#16a34a' : '#f59e0b'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{stack.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: isOnline ? '#16a34a' : '#f59e0b', background: isOnline ? '#f0fdf4' : '#fffbeb', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                        {stack.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: 'Flow Rate', value: stack.flow.toLocaleString(), unit: stack.flowUnit },
                        { label: 'Temperature', value: stack.temp, unit: stack.tempUnit },
                        { label: 'O\u2082', value: stack.o2, unit: stack.o2Unit },
                        { label: 'Moisture', value: stack.moisture, unit: stack.moistUnit },
                        { label: 'Opacity', value: stack.opacity, unit: stack.opacUnit },
                        { label: 'SO\u2082', value: stack.so2, unit: 'mg/Nm\u00B3' },
                        { label: 'NO\u2093', value: stack.nox, unit: 'mg/Nm\u00B3' },
                        { label: 'Dust', value: stack.dust, unit: 'mg/Nm\u00B3' },
                      ].map((p) => (
                        <div key={p.label} style={{ padding: '6px 0' }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.label}</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{p.value} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>{p.unit}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="CEMS Equipment Health" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>} badge={`${cemsEquipment.length} Analyzers`}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 90px 90px 80px 60px' }}>
              <span style={s.tableHead}>Analyzer</span>
              <span style={s.tableHead}>Stack</span>
              <span style={s.tableHead}>Last Cal.</span>
              <span style={s.tableHead}>Next Cal.</span>
              <span style={s.tableHead}>Drift</span>
              <span style={s.tableHead}>Status</span>
              {cemsEquipment.map((eq) => (
                <React.Fragment key={eq.analyzer}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{eq.analyzer}</span>
                  <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{eq.stack}</span>
                  <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{eq.calibration.slice(5)}</span>
                  <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{eq.nextCal.slice(5)}</span>
                  <span style={{ fontSize: '11px', padding: '8px 0' }}>
                    <span style={{ fontWeight: 600, color: eq.drift > eq.driftLimit * 0.75 ? '#f59e0b' : '#16a34a' }}>{eq.drift}%</span>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}> / {eq.driftLimit}%</span>
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: eq.status === 'ok' ? '#16a34a' : '#f59e0b', background: (eq.status === 'ok' ? '#16a34a' : '#f59e0b') + '15' }}>
                    {eq.status === 'ok' ? 'OK' : 'WATCH'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Stack Emission SPC Charts" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <SPCChart data={[92, 88, 95, 85, 90, 87, 91, 84, 89, 86, 93, 88, 115, 90, 86, 88, 91, 85, 87, 89]} ucl={100} lcl={40} target={75} title="SO\u2082 Emission (Kiln Stack)" unit=" mg/Nm\u00B3" />
              <SPCChart data={[380, 365, 370, 348, 355, 360, 345, 342, 358, 350, 368, 352, 348, 355, 340, 345, 358, 352, 348, 350]} ucl={600} lcl={200} target={400} title="NO\u2093 Emission (Kiln Stack)" unit=" mg/Nm\u00B3" />
            </div>
          </Section>
        </>
      )}

      {/* ─── CO₂ & Carbon Footprint Tab ─── */}
      {tab === 'co2' && (
        <>
          <Section title="Carbon Emission KPIs" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>} badge="YTD 2026">
            <div style={s.kpiGrid}>
              {[
                { label: 'Specific CO\u2082 Emission', value: co2Data.specific, unit: 'kg/t clinker', color: '#3b82f6', desc: 'Target: < 740 kg/t' },
                { label: 'Gross CO\u2082 Emission', value: co2Data.grossEmission, unit: 'tCO\u2082/day', color: '#f59e0b', desc: 'Total stack + process' },
                { label: 'Net CO\u2082 Emission', value: co2Data.netEmission, unit: 'tCO\u2082/day', color: '#16a34a', desc: 'After alt-fuel credits' },
                { label: 'Clinker Factor', value: co2Data.clinkerFactor, unit: '', color: ACCENT, desc: 'Clinker-to-cement ratio' },
                { label: 'Thermal Substitution Rate', value: co2Data.thermalSubstitution, unit: '%', color: '#06b6d4', desc: 'Alternative fuel share' },
                { label: 'Alt Fuel CO\u2082 Saving', value: co2Data.altFuelCO2Saving, unit: '%', color: '#ec4899', desc: 'vs 100% fossil fuel' },
              ].map((kpi) => (
                <div key={kpi.label} style={s.kpiCard}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                    <AnimatedValue value={kpi.value} decimals={kpi.value < 1 ? 2 : kpi.value < 100 ? 1 : 0} />
                    {kpi.unit && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>{kpi.unit}</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{kpi.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Scope 1 / 2 / 3 Breakdown" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              {[
                { scope: 'Scope 1 (Direct)', value: co2Data.scope1, pct: 79.6, color: '#ef4444', desc: 'Calcination + fuel combustion in kiln and preheater' },
                { scope: 'Scope 2 (Electricity)', value: co2Data.scope2, pct: 15.6, color: '#f59e0b', desc: 'Purchased electricity for mills, fans, conveyors' },
                { scope: 'Scope 3 (Indirect)', value: co2Data.scope3, pct: 4.8, color: '#3b82f6', desc: 'Transportation, upstream fuel, purchased materials' },
              ].map((sc) => (
                <div key={sc.scope} style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1', borderTop: `4px solid ${sc.color}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{sc.scope}</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>
                    <AnimatedValue value={sc.value} decimals={0} />
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>tCO&#x2082;/day</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: sc.color, marginBottom: '8px' }}>{sc.pct}% of total</div>
                  <div style={{ height: '6px', background: '#e8ecf1', borderRadius: '3px' }}>
                    <div style={{ width: `${sc.pct}%`, height: '100%', borderRadius: '3px', background: sc.color, transition: 'width 1.2s ease' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>{sc.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Specific CO\u2082 Trend (kg/t clinker)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}>
            <AreaChart data={co2Data.monthlyTrend.map(m => m.specific)} color={ACCENT} height={90} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 4px' }}>
              {co2Data.monthlyTrend.map(m => (
                <span key={m.month} style={{ fontSize: '10px', color: '#94a3b8' }}>{m.month}</span>
              ))}
            </div>
          </Section>

          <Section title="Decarbonization Roadmap" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {co2Data.decarbTargets.map((t) => {
                const colors = { achieved: '#16a34a', 'on-track': '#3b82f6', planned: '#94a3b8' }
                return (
                  <div key={t.year} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{t.year}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: colors[t.status], background: colors[t.status] + '15', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>{t.status.replace('-', ' ')}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Target: <strong style={{ color: '#1e293b' }}>{t.target} kg/t</strong></div>
                    {t.actual !== null && <div style={{ fontSize: '12px', color: '#64748b' }}>Actual: <strong style={{ color: colors[t.status] }}>{t.actual} kg/t</strong></div>}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Alternative Fuel Impact on CO\u2082" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>} badge={`TSR: ${co2Data.thermalSubstitution}%`}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 80px 100px 100px' }}>
              <span style={s.tableHead}>Alternative Fuel</span>
              <span style={s.tableHead}>Share (%)</span>
              <span style={s.tableHead}>CO&#x2082; Saved (%)</span>
              <span style={s.tableHead}>CV (kcal/kg)</span>
              {co2Data.altFuels.map((f) => (
                <React.Fragment key={f.fuel}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '10px 0' }}>{f.fuel}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '10px 0' }}>{f.share}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', padding: '10px 0' }}>{f.co2Saved}%</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '10px 0' }}>{f.calorific.toLocaleString()}</span>
                </React.Fragment>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── Dust & Particulate Tab ─── */}
      {tab === 'dust' && (
        <>
          <Section title="Particulate Monitoring Points" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="3" /><circle cx="5" cy="8" r="2" /><circle cx="19" cy="16" r="2" /></svg>} badge={`${dustData.monitoring.length} Points`}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 80px 80px 80px 80px 60px' }}>
              <span style={s.tableHead}>Monitoring Point</span>
              <span style={s.tableHead}>PM10</span>
              <span style={s.tableHead}>PM2.5</span>
              <span style={s.tableHead}>TSP</span>
              <span style={s.tableHead}>Limit</span>
              <span style={s.tableHead}>Status</span>
              {dustData.monitoring.map((pt) => {
                const exceed = pt.tsp > pt.limit
                return (
                  <React.Fragment key={pt.point}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>
                      {pt.point}
                      <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '6px', background: pt.type === 'stack' ? ACCENT + '15' : pt.type === 'fugitive' ? '#f59e0b15' : '#3b82f615', color: pt.type === 'stack' ? ACCENT : pt.type === 'fugitive' ? '#f59e0b' : '#3b82f6', padding: '1px 6px', borderRadius: '4px' }}>
                        {pt.type}
                      </span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{pt.pm10}</span>
                    <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{pt.pm25}</span>
                    <span style={{ fontSize: '12px', fontWeight: exceed ? 700 : 400, color: exceed ? '#ef4444' : '#475569', padding: '8px 0' }}>{pt.tsp}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', padding: '8px 0' }}>{pt.limit}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: exceed ? '#ef4444' : '#16a34a', background: (exceed ? '#ef4444' : '#16a34a') + '15' }}>
                      {exceed ? 'HIGH' : 'OK'}
                    </span>
                  </React.Fragment>
                )
              })}
            </div>
          </Section>

          <Section title="Baghouse / ESP Performance" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" /></svg>} badge="All Units Operational">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {dustData.baghouses.map((bh) => (
                <div key={bh.name} style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{bh.name}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{bh.type}</div>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>operational</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Efficiency</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{bh.efficiency}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Inlet / Outlet</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{bh.inlet.toLocaleString()} / {bh.outlet} mg</div>
                    </div>
                    {bh.bags && <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Filter Bags</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{bh.bags.toLocaleString()}</div>
                    </div>}
                    {bh.fields && <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>ESP Fields</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{bh.fields}</div>
                    </div>}
                    {bh.pressureDrop && <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Pressure Drop</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{bh.pressureDrop} mmWC</div>
                    </div>}
                    {bh.voltageKV && <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>Operating Voltage</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{bh.voltageKV} kV</div>
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Filter Bag Status — Cement Mill Baghouse" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 70px 70px 70px 70px 90px 90px' }}>
              <span style={s.tableHead}>Compartment</span>
              <span style={s.tableHead}>Total</span>
              <span style={s.tableHead}>Healthy</span>
              <span style={s.tableHead}>Damaged</span>
              <span style={s.tableHead}>Replaced</span>
              <span style={s.tableHead}>dP (mmWC)</span>
              <span style={s.tableHead}>Inspected</span>
              {dustData.filterStatus.map((fs) => (
                <React.Fragment key={fs.compartment}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{fs.compartment}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{fs.bags}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', padding: '8px 0' }}>{fs.healthy}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: fs.damaged > 5 ? '#ef4444' : '#f59e0b', padding: '8px 0' }}>{fs.damaged}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{fs.replaced}</span>
                  <span style={{ fontSize: '12px', color: '#475569', padding: '8px 0' }}>{fs.pressureDrop}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', padding: '8px 0' }}>{fs.lastInspection.slice(5)}</span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Pressure Drop Trend — Cement Mill Baghouse" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
            <SPCChart data={dustData.pressureTrend} ucl={140} lcl={100} target={120} title="Differential Pressure (mmWC)" unit=" mmWC" />
          </Section>
        </>
      )}

      {/* ─── Regulatory Compliance Tab ─── */}
      {tab === 'compliance' && (
        <>
          <Section title="Compliance Score" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} badge="CPCB Standards">
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <GaugeChart value={94.2} max={100} unit="%" label="Overall Compliance" size={160} zones={[{ from: 0, to: 0.6, color: '#ef4444' }, { from: 0.6, to: 0.85, color: '#f59e0b' }, { from: 0.85, to: 1, color: '#16a34a' }]} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {[
                    { label: 'CPCB Compliance', value: '6/6', color: '#16a34a' },
                    { label: 'EU IED Compliance', value: '3/6', color: '#f59e0b' },
                    { label: 'WHO Guidelines', value: '1/4', color: '#ef4444' },
                    { label: 'Days Since Exceedance', value: '3', color: '#3b82f6' },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e8ecf1' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="CPCB / SPCB Limits (Indian Standards)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} badge="100% Compliant">
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 100px 100px 80px' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>Limit</span>
              <span style={s.tableHead}>Actual</span>
              <span style={s.tableHead}>% of Limit</span>
              <span style={s.tableHead}>Status</span>
              {regulatoryData.cpcb.map((r) => {
                const pct = ((r.actual / r.limit) * 100).toFixed(0)
                return (
                  <React.Fragment key={r.parameter}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{r.parameter}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', padding: '8px 0' }}>{r.limit} {r.unit}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', padding: '8px 0' }}>{r.actual} {r.unit}</span>
                    <span style={{ fontSize: '12px', padding: '8px 0' }}>
                      <span style={{ display: 'inline-block', width: '40px', fontWeight: 600, color: parseInt(pct) > 90 ? '#ef4444' : parseInt(pct) > 75 ? '#f59e0b' : '#16a34a' }}>{pct}%</span>
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: '#16a34a', background: '#16a34a15' }}>PASS</span>
                  </React.Fragment>
                )
              })}
            </div>
          </Section>

          <Section title="EU IED Limits Comparison" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>} badge="Reference Only">
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 100px 80px' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>EU IED Limit</span>
              <span style={s.tableHead}>Actual</span>
              <span style={s.tableHead}>Status</span>
              {regulatoryData.euIed.map((r) => (
                <React.Fragment key={r.parameter}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{r.parameter}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', padding: '8px 0' }}>{r.limit} {r.unit}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: r.status === 'exceedance' ? '#ef4444' : '#1e293b', padding: '8px 0' }}>{r.actual} {r.unit}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: r.status === 'compliant' ? '#16a34a' : '#ef4444', background: (r.status === 'compliant' ? '#16a34a' : '#ef4444') + '15' }}>
                    {r.status === 'compliant' ? 'PASS' : 'EXCEED'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="WHO Air Quality Guidelines" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 100px 80px' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>WHO Guideline</span>
              <span style={s.tableHead}>Actual</span>
              <span style={s.tableHead}>Status</span>
              {regulatoryData.who.map((r) => (
                <React.Fragment key={r.parameter}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{r.parameter}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', padding: '8px 0' }}>{r.limit} {r.unit}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: r.status === 'exceedance' ? '#ef4444' : '#1e293b', padding: '8px 0' }}>{r.actual} {r.unit}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: r.status === 'compliant' ? '#16a34a' : '#ef4444', background: (r.status === 'compliant' ? '#16a34a' : '#ef4444') + '15' }}>
                    {r.status === 'compliant' ? 'PASS' : 'EXCEED'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Exceedance Log" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} badge={`${regulatoryData.exceedances.length} Events (Last 30 Days)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {regulatoryData.exceedances.map((exc, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{exc.date}</span>
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>{exc.parameter}: {exc.value} {exc.unit || 'mg/Nm\u00B3'} (limit: {exc.limit})</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', background: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e8ecf1' }}>Duration: {exc.duration}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>Cause: {exc.cause}</div>
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>Action: {exc.action}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Reporting Status" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 120px 100px 100px 80px' }}>
              <span style={s.tableHead}>Report Type</span>
              <span style={s.tableHead}>Period</span>
              <span style={s.tableHead}>Due Date</span>
              <span style={s.tableHead}>Submitted</span>
              <span style={s.tableHead}>Status</span>
              {regulatoryData.reports.map((rpt, i) => {
                const statusColors = { submitted: '#16a34a', pending: '#f59e0b', 'in-progress': '#3b82f6' }
                return (
                  <React.Fragment key={i}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{rpt.type}</span>
                    <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{rpt.period}</span>
                    <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{rpt.due}</span>
                    <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{rpt.submitted || '—'}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: statusColors[rpt.status], background: statusColors[rpt.status] + '15', textTransform: 'uppercase' }}>
                      {rpt.status}
                    </span>
                  </React.Fragment>
                )
              })}
            </div>
          </Section>
        </>
      )}

      {/* ─── AI Analytics Tab ─── */}
      {tab === 'ai' && (
        <>
          <Section title="AI Emission Predictions (Next 4-8 Hours)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-2 4-4 4s-4-2.05-4-4a4 4 0 0 1 4-4z" /><path d="M12 10v12" /><path d="M6 16l6-4 6 4" /></svg>} badge="Models Running">
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 80px 1fr 80px 80px' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>Predicted</span>
              <span style={s.tableHead}>Direction</span>
              <span style={s.tableHead}>Model</span>
              <span style={s.tableHead}>Confidence</span>
              <span style={s.tableHead}>Delta</span>
              {aiAnalytics.predictions.map((p) => (
                <React.Fragment key={p.parameter}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{p.parameter}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', padding: '8px 0' }}>{p.predicted}</span>
                  <span style={{ fontSize: '11px', padding: '8px 0' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.direction === 'up' ? '#ef4444' : '#16a34a'} strokeWidth="2.5">
                      {p.direction === 'up' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                    </svg>
                    <span style={{ fontSize: '10px', color: p.direction === 'up' ? '#ef4444' : '#16a34a', marginLeft: '2px' }}>{p.delta}</span>
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', padding: '8px 0', fontFamily: 'monospace' }}>{p.model}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: ACCENT, padding: '8px 0' }}>{p.confidence}%</span>
                  <span style={{ fontSize: '11px', color: p.direction === 'up' ? '#ef4444' : '#16a34a', padding: '8px 0', fontWeight: 600 }}>{p.delta}</span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Emission Forecast (8-Hour Horizon)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>SO&#x2082; Forecast (mg/Nm&#xB3;)</div>
                <AreaChart data={aiAnalytics.forecast.so2} color="#3b82f6" height={70} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>NO&#x2093; Forecast (mg/Nm&#xB3;)</div>
                <AreaChart data={aiAnalytics.forecast.nox} color="#f59e0b" height={70} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Dust Forecast (mg/Nm&#xB3;)</div>
                <AreaChart data={aiAnalytics.forecast.dust} color="#ef4444" height={70} />
              </div>
            </div>
          </Section>

          <Section title="Anomaly Detection" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} badge={`${aiAnalytics.anomalies.length} Detected Today`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiAnalytics.anomalies.map((a, i) => {
                const sevColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }
                return (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1', borderLeft: `4px solid ${sevColors[a.severity]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: sevColors[a.severity], background: sevColors[a.severity] + '15', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{a.severity}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{a.parameter} — {a.type}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{a.time}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px', fontSize: '11px' }}>
                      <div style={{ color: '#475569' }}>Value: <strong style={{ color: '#1e293b' }}>{a.value}</strong></div>
                      <div style={{ color: '#475569' }}>Baseline: <strong style={{ color: '#64748b' }}>{a.baseline}</strong></div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>Root Cause: {a.rootCause}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a' }}>Recommended: {a.action}</div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="AI Optimization Recommendations" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>} badge={`${aiAnalytics.recommendations.length} Active`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiAnalytics.recommendations.map((rec, i) => {
                const prioColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }
                return (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1', borderLeft: `4px solid ${prioColors[rec.priority]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: prioColors[rec.priority], background: prioColors[rec.priority] + '15', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{rec.priority}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{rec.title}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', background: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e8ecf1' }}>{rec.confidence}% confidence</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6', marginBottom: '8px' }}>{rec.reason}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '10px' }}>
                      <span style={{ color: '#64748b' }}>Impact: <strong style={{ color: '#16a34a' }}>{rec.impact}</strong></span>
                      <span style={{ color: '#64748b' }}>Model: <strong style={{ color: ACCENT }}>{rec.model}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Fuel-Emission Correlation Analysis" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '1fr 100px 80px 1fr' }}>
              <span style={s.tableHead}>Factor</span>
              <span style={s.tableHead}>Affects</span>
              <span style={s.tableHead}>Correlation</span>
              <span style={s.tableHead}>Impact Description</span>
              {aiAnalytics.correlations.map((c) => {
                const absCorr = Math.abs(c.correlation)
                const corrColor = absCorr > 0.8 ? '#ef4444' : absCorr > 0.6 ? '#f59e0b' : '#3b82f6'
                return (
                  <React.Fragment key={c.factor}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{c.factor}</span>
                    <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0' }}>{c.param}</span>
                    <span style={{ padding: '8px 0' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: corrColor }}>{c.correlation > 0 ? '+' : ''}{c.correlation.toFixed(2)}</span>
                    </span>
                    <span style={{ fontSize: '11px', color: '#475569', padding: '8px 0', lineHeight: '1.4' }}>{c.impact}</span>
                  </React.Fragment>
                )
              })}
            </div>
          </Section>

          <Section title="Model Performance & Data Pipeline" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { name: 'Training Data Points', value: '2.4M', desc: '24 months of CEMS + process data' },
                { name: 'Inference Frequency', value: 'Every 5 min', desc: 'Real-time CEMS + kiln process inputs' },
                { name: 'Avg. Prediction Error', value: '2.3%', desc: 'Across all 5 emission models' },
                { name: 'Last Model Retrain', value: '2 days ago', desc: 'Weekly automated retraining cycle' },
                { name: 'Data Sources', value: '9 Systems', desc: 'CEMS, DCS, Historian, SCADA, Weather, Coal Lab, LIMS, ERP, PLC' },
                { name: 'Alert Accuracy', value: '94.2%', desc: 'True positive rate for emission flags' },
              ].map((stat) => (
                <div key={stat.name} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{stat.name}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{stat.desc}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <style>{`
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

// ═══════ STYLES ═══════

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 500 },
  tabRow: { display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, color: '#1e293b' },
  sectionBadge: { fontSize: '10px', color: ACCENT, background: ACCENT + '12', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' },
  kpiCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1' },
  tableGrid: { display: 'grid', gap: '0', alignItems: 'center' },
  tableHead: { fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0', borderBottom: '2px solid #e8ecf1' },
  complianceCard: { background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1' },
}

export default EmissionMonitoring
