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
function AnimatedValue({ value, suffix = '', prefix = '', active = true }) {
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
  const formatted = numVal >= 100 ? Math.round(display).toLocaleString() : display.toFixed(1)
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
function GaugeChart({ value, max, unit, label, zones, size = 120 }) {
  const r = size * 0.38
  const cx = size / 2
  const cy = size * 0.55
  const startAngle = Math.PI
  const endAngle = 0
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
      <svg width={size} height={size * 0.65}>
        {zones.map((z, i) => (
          <path key={i} d={arc(z.from, z.to)} fill="none" stroke={z.color} strokeWidth="8" strokeLinecap="round" />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">{value}{unit}</text>
      </svg>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '-4px' }}>{label}</div>
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

const qualityKPIs = [
  { label: 'Free Lime (FCaO)', value: 1.12, unit: '%', target: '< 1.5%', status: 'ok', trend: [1.4, 1.3, 1.25, 1.18, 1.15, 1.12], color: '#16a34a' },
  { label: 'Blaine Fineness', value: 3280, unit: 'cm²/g', target: '3200-3400', status: 'ok', trend: [3150, 3200, 3250, 3260, 3270, 3280], color: '#3b82f6' },
  { label: '28-Day Strength', value: 48.6, unit: 'MPa', target: '> 42.5 MPa', status: 'ok', trend: [46.2, 47.1, 47.8, 48.0, 48.3, 48.6], color: ACCENT },
  { label: 'Clinker C3S', value: 62.4, unit: '%', target: '55-65%', status: 'ok', trend: [58, 60, 61, 61.8, 62.1, 62.4], color: '#f59e0b' },
  { label: 'Residue 45μ', value: 3.8, unit: '%', target: '< 5%', status: 'ok', trend: [5.2, 4.8, 4.5, 4.2, 4.0, 3.8], color: '#06b6d4' },
  { label: 'SO₃ Content', value: 2.42, unit: '%', target: '2.0-3.0%', status: 'ok', trend: [2.3, 2.35, 2.38, 2.40, 2.41, 2.42], color: '#8b5cf6' },
]

const xrfAnalysis = {
  clinker: [
    { oxide: 'CaO', value: 66.42, target: 66.5, range: '65.5-67.5', status: 'ok' },
    { oxide: 'SiO₂', value: 21.38, target: 21.5, range: '20.5-22.5', status: 'ok' },
    { oxide: 'Al₂O₃', value: 5.24, target: 5.3, range: '4.8-5.8', status: 'ok' },
    { oxide: 'Fe₂O₃', value: 3.52, target: 3.5, range: '3.0-4.0', status: 'ok' },
    { oxide: 'MgO', value: 1.68, target: 1.5, range: '< 2.0', status: 'watch' },
    { oxide: 'K₂O', value: 0.62, target: 0.6, range: '< 1.0', status: 'ok' },
    { oxide: 'Na₂O', value: 0.18, target: 0.2, range: '< 0.5', status: 'ok' },
    { oxide: 'SO₃', value: 0.84, target: 0.8, range: '< 1.0', status: 'ok' },
  ],
  moduli: [
    { name: 'Lime Saturation Factor (LSF)', value: 96.2, target: 96.0, range: '94-98', unit: '%' },
    { name: 'Silica Modulus (SM)', value: 2.44, target: 2.5, range: '2.3-2.7', unit: '' },
    { name: 'Alumina Modulus (AM)', value: 1.49, target: 1.5, range: '1.3-1.7', unit: '' },
  ],
}

const bogueMinerals = [
  { mineral: 'C₃S (Alite)', value: 62.4, ideal: '55-65%', desc: 'Primary strength-giving phase — controls early & ultimate strength', color: '#3b82f6' },
  { mineral: 'C₂S (Belite)', value: 14.8, ideal: '15-25%', desc: 'Contributes to long-term strength gain after 28 days', color: '#16a34a' },
  { mineral: 'C₃A (Aluminate)', value: 8.6, ideal: '6-12%', desc: 'Controls setting behavior — excess causes flash set risk', color: '#f59e0b' },
  { mineral: 'C₄AF (Ferrite)', value: 10.7, ideal: '8-13%', desc: 'Provides sulfate resistance — important for durability', color: '#8b5cf6' },
]

const cementTypes = [
  { type: 'OPC 43', blaine: 3050, setting: '130 min', strength3: 27.5, strength7: 37.0, strength28: 48.6, residue: 3.8, so3: 2.42, status: 'pass' },
  { type: 'OPC 53', blaine: 3350, setting: '110 min', strength3: 30.2, strength7: 40.5, strength28: 55.1, residue: 2.9, so3: 2.55, status: 'pass' },
  { type: 'PPC', blaine: 3400, setting: '155 min', strength3: 18.5, strength7: 30.2, strength28: 44.8, residue: 3.2, so3: 2.68, status: 'pass' },
  { type: 'PSC', blaine: 3200, setting: '170 min', strength3: 15.8, strength7: 26.4, strength28: 42.1, residue: 4.1, so3: 2.30, status: 'pass' },
]

const spcParams = [
  { title: 'Free Lime (FCaO)', data: [1.3, 1.25, 1.18, 1.22, 1.15, 1.12, 1.20, 1.08, 1.14, 1.10, 1.16, 1.12, 1.58, 1.11, 1.09, 1.13, 1.15, 1.10, 1.12, 1.08], ucl: 1.5, lcl: 0.5, target: 1.0, unit: '%' },
  { title: 'Blaine Fineness', data: [3220, 3250, 3270, 3240, 3280, 3300, 3260, 3290, 3310, 3275, 3285, 3295, 3150, 3280, 3300, 3270, 3290, 3310, 3280, 3295], ucl: 3400, lcl: 3100, target: 3280, unit: '' },
  { title: '28-Day Compressive Strength', data: [47.2, 47.8, 48.1, 47.5, 48.3, 48.6, 47.9, 48.8, 48.2, 48.5, 47.1, 48.4, 41.8, 48.7, 48.3, 48.9, 48.1, 48.6, 48.4, 48.2], ucl: 52.0, lcl: 42.5, target: 48.0, unit: 'MPa' },
  { title: 'SO₃ Content', data: [2.35, 2.38, 2.42, 2.40, 2.44, 2.41, 2.43, 2.39, 2.45, 2.42, 2.38, 2.41, 2.43, 2.40, 2.42, 2.44, 2.39, 2.41, 2.43, 2.40], ucl: 3.0, lcl: 2.0, target: 2.5, unit: '%' },
]

const labSamples = [
  { id: 'LAB-2847', time: '14:32', source: 'Kiln Feed', test: 'XRF Full Scan', lsf: 96.2, sm: 2.44, am: 1.49, status: 'pass', analyst: 'R. Sharma' },
  { id: 'LAB-2848', time: '14:45', source: 'Clinker Cooler', test: 'Free Lime + Mineralogy', fCaO: 1.12, c3s: 62.4, c2s: 14.8, status: 'pass', analyst: 'P. Kumar' },
  { id: 'LAB-2849', time: '15:02', source: 'Cement Mill 1', test: 'Blaine + PSD', blaine: 3280, residue45: 3.8, residue90: 0.4, status: 'pass', analyst: 'A. Singh' },
  { id: 'LAB-2850', time: '15:18', source: 'Cement Mill 2', test: 'SO₃ + LOI', so3: 2.42, loi: 2.1, ir: 0.8, status: 'pass', analyst: 'M. Gupta' },
  { id: 'LAB-2851', time: '15:35', source: 'Packing Plant', test: 'Strength Cube (28d)', strength: 48.6, setting: '135 min', soundness: 1.2, status: 'pass', analyst: 'V. Reddy' },
  { id: 'LAB-2852', time: '15:50', source: 'Kiln Feed', test: 'XRF Quick Scan', lsf: 95.8, sm: 2.41, am: 1.52, status: 'watch', analyst: 'R. Sharma' },
]

const aiPredictions = [
  { param: '28-Day Strength', predicted: 48.9, actual: 48.6, confidence: 96.2, model: 'iFactory-Strength-LSTM', trend: 'stable', deviation: 0.6 },
  { param: 'Free Lime', predicted: 1.10, actual: 1.12, confidence: 94.8, model: 'iFactory-FCaO-XGBoost', trend: 'improving', deviation: 1.8 },
  { param: 'Blaine Fineness', predicted: 3275, actual: 3280, confidence: 97.1, model: 'iFactory-Blaine-RF', trend: 'stable', deviation: 0.2 },
  { param: 'Setting Time', predicted: 132, actual: 135, confidence: 93.5, model: 'iFactory-Setting-LSTM', trend: 'stable', deviation: 2.2 },
  { param: 'SO₃ Content', predicted: 2.44, actual: 2.42, confidence: 95.6, model: 'iFactory-SO3-GBR', trend: 'stable', deviation: 0.8 },
]

const aiRecommendations = [
  { priority: 'high', title: 'Increase Separator Speed by 2.5%', reason: 'PSD analysis shows coarser tail trending upward. Blaine at 3280 — approaching lower control limit. Increasing separator speed will improve fineness uniformity.', impact: 'Improve Blaine by ~40 cm²/g', model: 'PSD Optimization Engine', confidence: 94 },
  { priority: 'medium', title: 'Adjust Raw Mix LSF from 96.2 to 96.8', reason: 'C₃S at 62.4% — slightly below optimal. Increasing LSF will boost alite content, improving early strength by ~1.2 MPa at 3-day.', impact: '+1.2 MPa 3-day strength', model: 'Clinker Mineralogy Predictor', confidence: 91 },
  { priority: 'medium', title: 'Reduce Gypsum Addition by 0.3%', reason: 'SO₃ at 2.42% and trending stable. Current gypsum dosing slightly above optimal for OPC 43 grade. Marginal reduction will save cost without affecting setting time.', impact: 'Save 0.3% gypsum per ton', model: 'Additive Optimizer', confidence: 88 },
  { priority: 'low', title: 'Schedule Cube Testing for Batch B-447', reason: 'AI model predicts 28-day strength for batch B-447 at 47.1 MPa — 1.4 MPa below recent average. Recommending early verification at 7-day mark.', impact: 'Early quality flag', model: 'Strength Prediction LSTM', confidence: 86 },
]

const complianceStandards = [
  { standard: 'IS 8112:2013', grade: 'OPC 43', params: ['Compressive Strength 28d > 43 MPa', 'Blaine > 2250 cm²/g', 'SO₃ < 3.0%', 'MgO < 6.0%'], status: 'compliant' },
  { standard: 'IS 12269:2013', grade: 'OPC 53', params: ['Compressive Strength 28d > 53 MPa', 'Blaine > 2250 cm²/g', 'SO₃ < 3.0%', 'Initial Setting > 30 min'], status: 'compliant' },
  { standard: 'IS 1489-1:2015', grade: 'PPC', params: ['Compressive Strength 28d > 33 MPa', 'Fly Ash 15-35%', 'SO₃ < 3.0%', 'Soundness < 10 mm'], status: 'compliant' },
  { standard: 'EN 197-1', grade: 'CEM I 42.5 R', params: ['2-Day Strength > 20 MPa', '28-Day Strength 42.5-62.5 MPa', 'SO₃ < 4.0%', 'Cl⁻ < 0.10%'], status: 'compliant' },
]

// ═══════ COMPONENT ═══════

function QualityPrediction() {
  const [tab, setTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: 'Quality Overview', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
    { key: 'xrf', label: 'XRF Analysis', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg> },
    { key: 'mineralogy', label: 'Clinker Mineralogy', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
    { key: 'cement', label: 'Cement Testing', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
    { key: 'spc', label: 'SPC Charts', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { key: 'lab', label: 'Lab Integration', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6v11l4 7H5l4-7V3z" /><line x1="9" y1="3" x2="15" y2="3" /></svg> },
    { key: 'ai', label: 'AI Predictions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-2 4-4 4s-4-2.05-4-4a4 4 0 0 1 4-4z" /><path d="M12 10v12" /><path d="M6 16l6-4 6 4" /></svg> },
  ]

  return (
    <div>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h1 style={s.pageTitle}>Quality Prediction & Control</h1>
            <p style={s.pageSubtitle}>AI-powered cement quality monitoring, XRF analysis, and predictive testing</p>
          </div>
        </div>
        <div style={s.headerActions}>
          <span style={s.liveBadge}>
            <span style={s.liveDot} /> Lab Online
          </span>
          <span style={s.statusBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            All Parameters Within Spec
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

      {/* ─── Overview Tab ─── */}
      {tab === 'overview' && (
        <>
          <Section title="Quality KPIs — Real-Time" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>} badge="Auto-refresh: 30s">
            <div style={s.kpiGrid}>
              {qualityKPIs.map((kpi) => (
                <div key={kpi.label} style={s.kpiCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
                    <span style={{ fontSize: '9px', background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>IN SPEC</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                    <AnimatedValue value={kpi.value} suffix={kpi.unit === '%' ? '%' : ''} />
                    {kpi.unit !== '%' && <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>{kpi.unit}</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>Target: {kpi.target}</div>
                  <Sparkline data={kpi.trend} color={kpi.color} w={100} h={20} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Compliance Status" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} badge="4 Standards Monitored">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {complianceStandards.map((cs) => (
                <div key={cs.standard} style={s.complianceCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{cs.standard}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{cs.grade}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {cs.status}
                    </span>
                  </div>
                  {cs.params.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '11px', color: '#475569' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      {p}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── XRF Analysis Tab ─── */}
      {tab === 'xrf' && (
        <>
          <Section title="X-Ray Fluorescence (XRF) — Clinker Oxide Composition" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>} badge="Last scan: 2 min ago">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Oxide Table */}
              <div>
                <div style={{ ...s.tableGrid, gridTemplateColumns: '80px 1fr 80px 80px 60px' }}>
                  <span style={s.tableHead}>Oxide</span>
                  <span style={s.tableHead}>Bar</span>
                  <span style={s.tableHead}>Actual</span>
                  <span style={s.tableHead}>Target</span>
                  <span style={s.tableHead}>Status</span>
                  {xrfAnalysis.clinker.map((ox) => {
                    const maxVal = 70
                    const barW = (ox.value / maxVal) * 100
                    const diffPct = Math.abs(ox.value - ox.target) / ox.target * 100
                    return (
                      <React.Fragment key={ox.oxide}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0' }}>{ox.oxide}</span>
                        <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '14px', position: 'relative' }}>
                            <div style={{ width: `${barW}%`, height: '100%', borderRadius: '4px', background: ox.status === 'watch' ? '#f59e0b' : ACCENT, transition: 'width 1s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', padding: '8px 0' }}>{ox.value}%</span>
                        <span style={{ fontSize: '11px', color: '#64748b', padding: '8px 0' }}>{ox.target}%</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: ox.status === 'ok' ? '#16a34a' : '#f59e0b', background: (ox.status === 'ok' ? '#16a34a' : '#f59e0b') + '15' }}>
                          {ox.status === 'ok' ? 'OK' : 'WATCH'}
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>

              {/* Moduli + Oxide Pie Visual */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Control Moduli</div>
                {xrfAnalysis.moduli.map((m) => {
                  const pct = ((m.value - parseFloat(m.range.split('-')[0])) / (parseFloat(m.range.split('-')[1]) - parseFloat(m.range.split('-')[0]))) * 100
                  return (
                    <div key={m.name} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>{m.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{m.value}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', position: 'relative' }}>
                        <div style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, height: '100%', borderRadius: '4px', background: ACCENT, transition: 'width 1s ease' }} />
                        <div style={{ position: 'absolute', left: '50%', top: '-2px', width: '2px', height: '12px', background: '#16a34a', borderRadius: '1px' }} title={`Target: ${m.target}`} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>Range: {m.range}</span>
                        <span style={{ fontSize: '9px', color: '#16a34a' }}>Target: {m.target}</span>
                      </div>
                    </div>
                  )
                })}

                <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8ecf1' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Oxide Distribution</div>
                  {xrfAnalysis.clinker.slice(0, 4).map((ox) => (
                    <div key={ox.oxide} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: ox.oxide === 'CaO' ? '#3b82f6' : ox.oxide === 'SiO₂' ? '#16a34a' : ox.oxide === 'Al₂O₃' ? '#f59e0b' : '#8b5cf6' }} />
                      <span style={{ fontSize: '11px', color: '#475569', flex: 1 }}>{ox.oxide}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{ox.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ─── Clinker Mineralogy Tab ─── */}
      {tab === 'mineralogy' && (
        <>
          <Section title="Bogue Mineral Composition" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>} badge="Calculated from XRF">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {bogueMinerals.map((m) => (
                <div key={m.mineral} style={s.mineralCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{m.mineral}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Ideal: {m.ideal}</div>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: m.color }}>{m.value}%</div>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ width: `${m.value}%`, height: '100%', borderRadius: '4px', background: m.color, transition: 'width 1.2s ease' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Mineral Phase Impact Matrix" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: '140px repeat(4, 1fr)' }}>
              <span style={s.tableHead}>Property</span>
              <span style={{ ...s.tableHead, color: '#3b82f6' }}>C₃S</span>
              <span style={{ ...s.tableHead, color: '#16a34a' }}>C₂S</span>
              <span style={{ ...s.tableHead, color: '#f59e0b' }}>C₃A</span>
              <span style={{ ...s.tableHead, color: '#8b5cf6' }}>C₄AF</span>
              {[
                { prop: 'Early Strength', vals: ['High', 'Low', 'Medium', 'Low'] },
                { prop: 'Ultimate Strength', vals: ['High', 'High', 'Low', 'Low'] },
                { prop: 'Heat of Hydration', vals: ['High', 'Low', 'Very High', 'Medium'] },
                { prop: 'Setting Rate', vals: ['Medium', 'Slow', 'Fast', 'Slow'] },
                { prop: 'Sulfate Resistance', vals: ['Good', 'Good', 'Poor', 'Excellent'] },
                { prop: 'Durability', vals: ['Good', 'Good', 'Moderate', 'Good'] },
              ].map((row) => (
                <React.Fragment key={row.prop}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.prop}</span>
                  {row.vals.map((v, i) => {
                    const colorMap = { 'High': '#16a34a', 'Very High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#94a3b8', 'Slow': '#94a3b8', 'Fast': '#ef4444', 'Good': '#16a34a', 'Excellent': '#3b82f6', 'Poor': '#ef4444', 'Moderate': '#f59e0b' }
                    return <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: colorMap[v] || '#64748b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{v}</span>
                  })}
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="Clinker Microscopy Observations" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { param: 'Alite Crystal Size', value: '25-40 μm', status: 'Normal', note: 'Hexagonal prismatic — well-formed crystals indicate proper burning' },
                { param: 'Belite Clusters', value: '< 15%', status: 'Good', note: 'Minimal clustering — indicates adequate kiln temperature & residence time' },
                { param: 'Free Lime Nodules', value: 'Rare', status: 'Good', note: 'No clusters visible — confirms complete calcination of raw meal' },
                { param: 'Periclase (MgO)', value: '< 1.5%', status: 'Normal', note: 'Fine dispersion — no risk of delayed expansion in hardened concrete' },
              ].map((obs) => (
                <div key={obs.param} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{obs.param}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>{obs.status}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: ACCENT, marginBottom: '6px' }}>{obs.value}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>{obs.note}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── Cement Testing Tab ─── */}
      {tab === 'cement' && (
        <>
          <Section title="Cement Grade-wise Physical Testing" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>} badge="4 Grades Active">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ ...s.tableGrid, gridTemplateColumns: '80px repeat(7, 1fr) 60px', minWidth: '800px' }}>
                <span style={s.tableHead}>Grade</span>
                <span style={s.tableHead}>Blaine (cm²/g)</span>
                <span style={s.tableHead}>Setting Time</span>
                <span style={s.tableHead}>3-Day (MPa)</span>
                <span style={s.tableHead}>7-Day (MPa)</span>
                <span style={s.tableHead}>28-Day (MPa)</span>
                <span style={s.tableHead}>Residue 45μ (%)</span>
                <span style={s.tableHead}>SO₃ (%)</span>
                <span style={s.tableHead}>Result</span>
                {cementTypes.map((ct) => (
                  <React.Fragment key={ct.type}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.type}</span>
                    <span style={{ fontSize: '12px', color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.blaine}</span>
                    <span style={{ fontSize: '12px', color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.setting}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.strength3}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.strength7}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.strength28}</span>
                    <span style={{ fontSize: '12px', color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.residue}</span>
                    <span style={{ fontSize: '12px', color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ct.so3}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', textTransform: 'uppercase' }}>pass</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Strength Development Gauges" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <GaugeChart value={27.5} max={60} unit=" MPa" label="3-Day Strength (OPC 43)" size={160} zones={[{ from: 0, to: 0.35, color: '#ef4444' }, { from: 0.35, to: 0.7, color: '#f59e0b' }, { from: 0.7, to: 1, color: '#16a34a' }]} />
              <GaugeChart value={37.0} max={60} unit=" MPa" label="7-Day Strength (OPC 43)" size={160} zones={[{ from: 0, to: 0.35, color: '#ef4444' }, { from: 0.35, to: 0.7, color: '#f59e0b' }, { from: 0.7, to: 1, color: '#16a34a' }]} />
              <GaugeChart value={48.6} max={60} unit=" MPa" label="28-Day Strength (OPC 43)" size={160} zones={[{ from: 0, to: 0.35, color: '#ef4444' }, { from: 0.35, to: 0.7, color: '#f59e0b' }, { from: 0.7, to: 1, color: '#16a34a' }]} />
              <GaugeChart value={3280} max={4000} unit="" label="Blaine Fineness (cm²/g)" size={160} zones={[{ from: 0, to: 0.4, color: '#ef4444' }, { from: 0.4, to: 0.75, color: '#f59e0b' }, { from: 0.75, to: 1, color: '#16a34a' }]} />
            </div>
          </Section>

          <Section title="Particle Size Distribution (PSD)" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { sieve: '90 μm', residue: 0.4, limit: '< 2.0%', status: 'pass' },
                { sieve: '45 μm', residue: 3.8, limit: '< 5.0%', status: 'pass' },
                { sieve: 'Median (D50)', residue: 14.2, limit: '12-18 μm', status: 'pass', isSize: true },
                { sieve: 'D10', residue: 2.1, limit: '1.5-3.0 μm', status: 'pass', isSize: true },
                { sieve: 'D90', residue: 42.5, limit: '35-50 μm', status: 'pass', isSize: true },
                { sieve: 'Uniformity (n)', residue: 1.05, limit: '0.9-1.2', status: 'pass', isSize: true },
              ].map((p) => (
                <div key={p.sieve} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{p.sieve}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{p.residue}{p.isSize ? (p.sieve.includes('n') ? '' : ' μm') : '%'}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>Limit: {p.limit}</div>
                  <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '9px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>PASS</span>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── SPC Charts Tab ─── */}
      {tab === 'spc' && (
        <>
          <Section title="Statistical Process Control (SPC) Charts" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} badge="Western Electric Rules Applied">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {spcParams.map((sp) => (
                <div key={sp.title} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e8ecf1' }}>
                  <SPCChart data={sp.data} ucl={sp.ucl} lcl={sp.lcl} target={sp.target} title={sp.title} unit={sp.unit} />
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                    <span>Cp: <strong style={{ color: '#1e293b' }}>1.45</strong></span>
                    <span>Cpk: <strong style={{ color: '#1e293b' }}>1.32</strong></span>
                    <span>Sigma: <strong style={{ color: '#1e293b' }}>3.8σ</strong></span>
                    <span style={{ marginLeft: 'auto', color: sp.data.some((v) => v > sp.ucl || v < sp.lcl) ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
                      {sp.data.some((v) => v > sp.ucl || v < sp.lcl) ? 'OOC Points Detected' : 'In Control'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Process Capability Summary" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}>
            <div style={{ ...s.tableGrid, gridTemplateColumns: 'repeat(7, 1fr)' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>Cp</span>
              <span style={s.tableHead}>Cpk</span>
              <span style={s.tableHead}>Sigma Level</span>
              <span style={s.tableHead}>OOC Count</span>
              <span style={s.tableHead}>Mean</span>
              <span style={s.tableHead}>Status</span>
              {[
                { name: 'Free Lime', cp: 1.45, cpk: 1.32, sigma: '3.8σ', ooc: 1, mean: '1.15%' },
                { name: 'Blaine', cp: 1.52, cpk: 1.41, sigma: '4.1σ', ooc: 1, mean: '3278 cm²/g' },
                { name: '28-Day Strength', cp: 1.38, cpk: 1.28, sigma: '3.6σ', ooc: 1, mean: '48.2 MPa' },
                { name: 'SO₃', cp: 1.85, cpk: 1.72, sigma: '4.8σ', ooc: 0, mean: '2.41%' },
              ].map((row) => (
                <React.Fragment key={row.name}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: row.cp >= 1.33 ? '#16a34a' : '#f59e0b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.cp}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: row.cpk >= 1.33 ? '#16a34a' : '#f59e0b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.cpk}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.sigma}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: row.ooc > 0 ? '#ef4444' : '#16a34a', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.ooc}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>{row.mean}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: row.cpk >= 1.33 ? '#16a34a' : '#f59e0b', background: (row.cpk >= 1.33 ? '#16a34a' : '#f59e0b') + '15', padding: '3px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center' }}>
                    {row.cpk >= 1.33 ? 'CAPABLE' : 'MARGINAL'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── Lab Integration Tab ─── */}
      {tab === 'lab' && (
        <>
          <Section title="Lab Sample Queue — Live" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M9 3h6v11l4 7H5l4-7V3z" /><line x1="9" y1="3" x2="15" y2="3" /></svg>} badge="6 Samples Today">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ ...s.tableGrid, gridTemplateColumns: '80px 60px 110px 160px 1fr 80px 80px', minWidth: '700px' }}>
                <span style={s.tableHead}>Sample ID</span>
                <span style={s.tableHead}>Time</span>
                <span style={s.tableHead}>Source</span>
                <span style={s.tableHead}>Test</span>
                <span style={s.tableHead}>Key Results</span>
                <span style={s.tableHead}>Analyst</span>
                <span style={s.tableHead}>Status</span>
                {labSamples.map((ls) => {
                  const results = []
                  if (ls.lsf) results.push(`LSF: ${ls.lsf}`, `SM: ${ls.sm}`, `AM: ${ls.am}`)
                  if (ls.fCaO) results.push(`FCaO: ${ls.fCaO}%`, `C₃S: ${ls.c3s}%`)
                  if (ls.blaine) results.push(`Blaine: ${ls.blaine}`, `R45: ${ls.residue45}%`)
                  if (ls.so3) results.push(`SO₃: ${ls.so3}%`, `LOI: ${ls.loi}%`)
                  if (ls.strength) results.push(`28d: ${ls.strength} MPa`, `Set: ${ls.setting}`)
                  return (
                    <React.Fragment key={ls.id}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: ACCENT, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ls.id}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ls.time}</span>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ls.source}</span>
                      <span style={{ fontSize: '11px', color: '#475569', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ls.test}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{results.join(' | ')}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ls.analyst}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textAlign: 'center', alignSelf: 'center', color: ls.status === 'pass' ? '#16a34a' : '#f59e0b', background: (ls.status === 'pass' ? '#16a34a' : '#f59e0b') + '15', textTransform: 'uppercase' }}>
                        {ls.status}
                      </span>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </Section>

          <Section title="Lab Equipment Status" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { name: 'XRF Spectrometer', model: 'PANalytical Axios', status: 'Online', uptime: '99.7%', lastCal: '2 days ago' },
                { name: 'Laser PSD Analyzer', model: 'Malvern Mastersizer', status: 'Online', uptime: '98.9%', lastCal: '5 days ago' },
                { name: 'Blaine Apparatus', model: 'Auto-Blaine PC', status: 'Online', uptime: '99.2%', lastCal: '1 day ago' },
                { name: 'Compression Machine', model: 'Controls Automax', status: 'Online', uptime: '99.5%', lastCal: '3 days ago' },
                { name: 'Vicat Apparatus', model: 'Auto-Vicat', status: 'Online', uptime: '99.1%', lastCal: '4 days ago' },
                { name: 'LOI / Oven', model: 'Carbolite CWF', status: 'Heating', uptime: '97.8%', lastCal: '7 days ago' },
              ].map((eq) => (
                <div key={eq.name} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e8ecf1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{eq.name}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: eq.status === 'Online' ? '#16a34a' : '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{eq.model}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span>Uptime: {eq.uptime}</span>
                    <span>Cal: {eq.lastCal}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ─── AI Predictions Tab ─── */}
      {tab === 'ai' && (
        <>
          <Section title="AI Quality Predictions — Live" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-2 4-4 4s-4-2.05-4-4a4 4 0 0 1 4-4z" /><path d="M12 10v12" /><path d="M6 16l6-4 6 4" /></svg>} badge="5 Models Active">
            <div style={{ ...s.tableGrid, gridTemplateColumns: '140px 90px 90px 80px 160px 70px 80px' }}>
              <span style={s.tableHead}>Parameter</span>
              <span style={s.tableHead}>AI Predicted</span>
              <span style={s.tableHead}>Lab Actual</span>
              <span style={s.tableHead}>Deviation</span>
              <span style={s.tableHead}>Model</span>
              <span style={s.tableHead}>Confidence</span>
              <span style={s.tableHead}>Trend</span>
              {aiPredictions.map((ap) => (
                <React.Fragment key={ap.param}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.param}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.predicted}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.actual}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: ap.deviation < 2 ? '#16a34a' : '#f59e0b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.deviation}%</span>
                  <span style={{ fontSize: '10px', color: '#64748b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.model}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: ap.confidence > 95 ? '#16a34a' : '#f59e0b', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{ap.confidence}%</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: ap.trend === 'improving' ? '#16a34a' : '#3b82f6', padding: '10px 0', borderBottom: '1px solid #f1f5f9', textTransform: 'capitalize' }}>{ap.trend}</span>
                </React.Fragment>
              ))}
            </div>
          </Section>

          <Section title="AI Optimization Recommendations" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>} badge={`${aiRecommendations.length} Active`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiRecommendations.map((rec, i) => {
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

          <Section title="Model Performance & Data Pipeline" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { name: 'Training Data Points', value: '1.2M', desc: '18 months of lab + process data' },
                { name: 'Inference Frequency', value: 'Every 15 min', desc: 'Real-time XRF + process inputs' },
                { name: 'Avg. Prediction Error', value: '1.1%', desc: 'Across all 5 quality models' },
                { name: 'Last Model Retrain', value: '3 days ago', desc: 'Weekly automated retraining cycle' },
                { name: 'Data Sources', value: '7 Systems', desc: 'XRF, LIMS, DCS, Historian, PSD, SCADA, ERP' },
                { name: 'Alert Accuracy', value: '96.8%', desc: 'True positive rate for quality flags' },
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
  mineralCard: { background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e8ecf1' },
}

export default QualityPrediction
