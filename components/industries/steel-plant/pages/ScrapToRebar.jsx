'use client'

import { useState, useEffect, useRef } from 'react'

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

function Section({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.08)
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: `all 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s`, marginBottom: '20px' }}>
      {children}
    </div>
  )
}

// ─── Animated Counter ───
function AnimatedValue({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  useEffect(() => {
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * numVal))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [numVal, duration])
  return <>{display.toLocaleString('en-IN')}</>
}

// ─── Live Clock ───
function useLocaleTime() {
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return timeStr
}

// ═══════════════════════════════════════════
// ── PROCESS FLOW VISUALIZATION ────────────
// ═══════════════════════════════════════════

const processStages = [
  { id: 1, name: 'Scrap Yard', temp: '—', metric: '248 MT', metricLabel: 'Loaded', color: '#64748b' },
  { id: 2, name: 'EAF Melting', temp: '1,640°C', metric: '42 MW', metricLabel: 'Power Draw', color: '#ef4444' },
  { id: 3, name: 'Ladle Refining', temp: '1,585°C', metric: '12 min', metricLabel: 'Remaining', color: '#f59e0b' },
  { id: 4, name: 'Billet Casting', temp: '1,520°C', metric: '2.4 m/min', metricLabel: 'Cast Speed', color: '#3b82f6' },
  { id: 5, name: 'Reheat Furnace', temp: '1,180°C', metric: '96 T/hr', metricLabel: 'Throughput', color: '#f97316' },
  { id: 6, name: 'Rolling Mill', temp: '1,050°C', metric: '18 m/s', metricLabel: 'Mill Speed', color: '#10b981' },
  { id: 7, name: 'Cooling Bed', temp: '380°C', metric: '94%', metricLabel: 'Occupancy', color: '#06b6d4' },
  { id: 8, name: 'Finished Rebar', temp: '45°C', metric: '1,280 MT', metricLabel: 'Today Output', color: '#16a34a' },
]

function ProcessFlow() {
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % processStages.length), 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Live Process Flow — Scrap to Rebar</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>End-to-end material tracking | Heat H-4218 | Fe 500D Grade</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>8/8 Online</span>
        </div>
      </div>

      {/* Process stages - grid layout to prevent overflow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '12px' }}>
        {processStages.map((stage, i) => (
          <div key={stage.id} style={{ position: 'relative' }}>
            <div style={{
              background: pulse === i ? `${stage.color}12` : '#f8fafc',
              border: `2px solid ${pulse === i ? stage.color : '#e8ecf1'}`,
              borderRadius: '10px',
              padding: '10px 6px',
              textAlign: 'center',
              transition: 'all 0.5s ease',
              boxShadow: pulse === i ? `0 4px 14px ${stage.color}20` : 'none',
            }}>
              {pulse === i && (
                <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', borderRadius: '50%', background: stage.color, border: '2px solid #fff', animation: 'pulseGlow 1s infinite', zIndex: 2 }} />
              )}
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage.name}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>{stage.temp}</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: stage.color, lineHeight: 1.1 }}>{stage.metric}</div>
              <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>{stage.metricLabel}</div>
            </div>
            {/* Arrow connector */}
            {i < processStages.length - 1 && (
              <div style={{ position: 'absolute', right: '-7px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <svg width="8" height="10" viewBox="0 0 8 10" fill={pulse > i ? '#10b981' : '#d1d5db'}><polygon points="0,0 8,5 0,10" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Material flow summary bar */}
      <div style={{ display: 'flex', gap: '0', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
        {processStages.map((stage, i) => (
          <div key={i} style={{ flex: 1, background: pulse >= i ? stage.color : '#e8ecf1', transition: 'background 0.5s', opacity: pulse >= i ? 1 : 0.3 }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '10px 14px', background: `${ACCENT}06`, borderRadius: '8px', border: `1px solid ${ACCENT}12` }}>
        <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }}>AI</span>
        <span style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.6' }}>Heat H-4218: Scrap charged 248 MT → EAF tap in 18 min → Billet: 130×130mm. Yield forecast: <strong style={{ color: '#10b981' }}>91.4%</strong> (vs 90.8% avg). Estimated completion: <strong>14:48 IST</strong>. All parameters within spec.</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── LIVE HEAT TIMER ───────────────────────
// ═══════════════════════════════════════════

function LiveHeatTimer() {
  const [seconds, setSeconds] = useState(34 * 60 + 27)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s < 52 * 60 ? s + 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const pct = (seconds / (52 * 60)) * 100
  const phase = m < 5 ? 'Charging' : m < 12 ? 'Boring' : m < 32 ? 'Melting' : m < 45 ? 'Refining' : 'Tapping'
  const phaseColors = { Charging: '#3b82f6', Boring: '#8b5cf6', Melting: '#ef4444', Refining: '#f59e0b', Tapping: '#10b981' }

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Heat H-4218</span>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#fff', background: phaseColors[phase], padding: '2px 8px', borderRadius: '6px', animation: 'pulse 2s infinite' }}>{phase}</span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>EAF #1 | 120 MT</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 800, color: phaseColors[phase], fontFamily: "'Courier New', monospace", lineHeight: 1 }}>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 52:00</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${phaseColors[phase]}cc, ${phaseColors[phase]})`, transition: 'width 1s linear' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {['Charging', 'Boring', 'Melting', 'Refining', 'Tapping'].map(p => (
          <span key={p} style={{ fontSize: '8px', fontWeight: phase === p ? 700 : 400, color: phase === p ? phaseColors[p] : '#cbd5e1' }}>{p}</span>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── SHIFT & SAFETY PANEL ──────────────────
// ═══════════════════════════════════════════

function ShiftSafetyPanel() {
  const [shiftInfo, setShiftInfo] = useState({ name: '', elapsed: '', remaining: '', progress: 0 })
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours()
      let shiftName, startH, endH
      if (h >= 6 && h < 14) { shiftName = 'Day Shift A'; startH = 6; endH = 14 }
      else if (h >= 14 && h < 22) { shiftName = 'Evening Shift B'; startH = 14; endH = 22 }
      else { shiftName = 'Night Shift C'; startH = 22; endH = 30 }
      const shiftStart = new Date(now); shiftStart.setHours(startH, 0, 0, 0)
      if (startH === 22 && h < 6) shiftStart.setDate(shiftStart.getDate() - 1)
      const totalSec = (endH - startH) * 3600
      const elapsedSec = Math.floor((now - shiftStart) / 1000)
      const remainSec = Math.max(totalSec - elapsedSec, 0)
      const fmt = (sec) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
      setShiftInfo({ name: shiftName, elapsed: fmt(elapsedSec), remaining: fmt(remainSec), progress: Math.min((elapsedSec / totalSec) * 100, 100) })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', gap: '14px' }}>
      {/* Shift Timer */}
      <div style={{ ...st.card, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{shiftInfo.name}</span>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '8px' }}>Active</span>
        </div>
        <div style={{ height: '5px', borderRadius: '3px', background: '#f1f5f9', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${shiftInfo.progress}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${ACCENT}, #7c3aed)`, transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>Elapsed</div><div style={{ fontSize: '15px', fontWeight: 700, color: ACCENT, fontFamily: "'Courier New', monospace" }}>{shiftInfo.elapsed}</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>Progress</div><div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{shiftInfo.progress.toFixed(1)}%</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>Remaining</div><div style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b', fontFamily: "'Courier New', monospace" }}>{shiftInfo.remaining}</div></div>
        </div>
      </div>

      {/* Safety */}
      <div style={{ ...st.card, flex: 0.6, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #bbf7d0', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Days Without LTI</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>142</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Near-miss: <strong style={{ color: '#f59e0b' }}>1</strong> | PPE: <strong style={{ color: '#10b981' }}>99.2%</strong></div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── KPI CARDS ─────────────────────────────
// ═══════════════════════════════════════════

const kpiData = [
  { label: 'Daily Production', value: 1280, unit: 'MT', target: '1,200 MT', trend: '+6.7%', trendUp: true, color: '#10b981', sparkData: [68, 72, 70, 75, 78, 80, 85] },
  { label: 'Metallic Yield', value: 91.4, unit: '%', target: '90.0%', trend: '+0.6%', trendUp: true, color: '#10b981', sparkData: [89, 90, 91, 90, 91, 92, 91] },
  { label: 'EAF Power (SEC)', value: 385, unit: 'kWh/MT', target: '< 400', trend: '-2.3%', trendUp: true, color: '#10b981', sparkData: [410, 405, 395, 398, 392, 388, 385] },
  { label: 'Tap-to-Tap Time', value: 52, unit: 'min', target: '55 min', trend: '-3 min', trendUp: true, color: '#10b981', sparkData: [58, 56, 55, 54, 53, 52, 52] },
  { label: 'Rebar Yield Rate', value: 96.8, unit: '%', target: '95.0%', trend: '+1.2%', trendUp: true, color: '#10b981', sparkData: [95, 95, 96, 96, 97, 96, 97] },
  { label: 'Cost per MT', value: 38450, unit: '₹', target: '₹39,500', trend: '-2.7%', trendUp: true, color: '#10b981', sparkData: [41000, 40200, 39800, 39200, 38800, 38600, 38450] },
  { label: 'Quality Pass Rate', value: 98.2, unit: '%', target: '97.0%', trend: '+0.4%', trendUp: true, color: '#10b981', sparkData: [97, 97, 98, 97, 98, 98, 98] },
  { label: 'Electrode Consumption', value: 1.42, unit: 'kg/MT', target: '< 1.6', trend: '-5.3%', trendUp: true, color: '#10b981', sparkData: [1.7, 1.65, 1.6, 1.55, 1.5, 1.45, 1.42] },
]

function KPICards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      {kpiData.map((kpi, i) => {
        const sparkMax = Math.max(...kpi.sparkData)
        const sparkMin = Math.min(...kpi.sparkData)
        const sparkW = 70, sparkH = 24
        const sparkPoints = kpi.sparkData.map((v, j) =>
          `${(j / (kpi.sparkData.length - 1)) * sparkW},${sparkH - ((v - sparkMin) / (sparkMax - sparkMin || 1)) * (sparkH - 4) - 2}`
        ).join(' ')

        return (
          <div key={i} className="ov-hover-card" style={{
            ...st.card, padding: '14px 16px', borderTop: `3px solid ${kpi.color}`,
            animation: `fadeUpIn 0.5s ease both`, animationDelay: `${i * 0.06}s`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{kpi.label}</div>
              <svg width={sparkW} height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`}>
                <defs><linearGradient id={`spk${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={kpi.color} stopOpacity="0.2" /><stop offset="100%" stopColor={kpi.color} stopOpacity="0" /></linearGradient></defs>
                <polygon points={`0,${sparkH} ${sparkPoints} ${sparkW},${sparkH}`} fill={`url(#spk${i})`} />
                <polyline points={sparkPoints} fill="none" stroke={kpi.color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
              {kpi.unit === '₹' && '₹'}<AnimatedValue value={kpi.value} />{kpi.unit !== '₹' && <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', marginLeft: '2px' }}>{kpi.unit}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Target: {kpi.target}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: kpi.trendUp ? '#10b981' : '#ef4444' }}>{kpi.trendUp ? '↑' : '↓'} {kpi.trend}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════
// ── EAF FURNACE MONITOR ───────────────────
// ═══════════════════════════════════════════

function EAFMonitor() {
  const [temps, setTemps] = useState({ bath: 1640, slag: 1580, shell: 285, roof: 420, offGas: 1250 })
  useEffect(() => {
    const t = setInterval(() => {
      setTemps(prev => ({
        bath: prev.bath + (Math.random() - 0.48) * 4,
        slag: prev.slag + (Math.random() - 0.5) * 3,
        shell: prev.shell + (Math.random() - 0.5) * 2,
        roof: prev.roof + (Math.random() - 0.5) * 3,
        offGas: prev.offGas + (Math.random() - 0.5) * 5,
      }))
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const phases = [
    { name: 'Charging', status: 'completed', progress: 100 },
    { name: 'Boring', status: 'completed', progress: 100 },
    { name: 'Melting', status: 'completed', progress: 100 },
    { name: 'Refining', status: 'in-progress', progress: 65 },
    { name: 'Tapping', status: 'pending', progress: 0 },
  ]

  const electrodeData = [
    { phase: 'A', voltage: '680 V', current: '48 kA', power: '32.6 MW', status: 'normal' },
    { phase: 'B', voltage: '675 V', current: '47 kA', power: '31.7 MW', status: 'normal' },
    { phase: 'C', voltage: '682 V', current: '49 kA', power: '33.4 MW', status: 'normal' },
  ]

  const chemComposition = [
    { element: 'C', current: '0.18%', target: '0.20–0.25%', status: 'adjusting' },
    { element: 'Mn', current: '0.62%', target: '0.60–0.80%', status: 'ok' },
    { element: 'Si', current: '0.21%', target: '0.15–0.30%', status: 'ok' },
    { element: 'S', current: '0.028%', target: '< 0.040%', status: 'ok' },
    { element: 'P', current: '0.022%', target: '< 0.040%', status: 'ok' },
  ]

  const statusColors = { completed: '#10b981', 'in-progress': '#f59e0b', pending: '#e2e8f0' }

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>EAF Furnace Monitor — Heat H-4218</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Electric Arc Furnace #1 | Capacity: 120 MT | Fe 500D Grade</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Bath Temp</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', fontFamily: "'Courier New', monospace" }}>{Math.round(temps.bath)}°C</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e8ecf1' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Slag</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', fontFamily: "'Courier New', monospace" }}>{Math.round(temps.slag)}°C</div>
          </div>
        </div>
      </div>

      {/* Heat Progress Timeline */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {phases.map((p, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '5px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{ width: `${p.progress}%`, height: '100%', borderRadius: '3px', background: statusColors[p.status], transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: '9px', fontWeight: p.status === 'in-progress' ? 700 : 500, color: p.status === 'in-progress' ? '#f59e0b' : '#94a3b8', marginTop: '3px', textAlign: 'center' }}>{p.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Left: Electrode + Temps */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Electrode Power Draw</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {electrodeData.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: ACCENT }}>{e.phase}</span>
                <span style={{ fontSize: '10px', color: '#64748b', flex: 1 }}>{e.voltage} | {e.current}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{e.power}</span>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', marginTop: '4px', background: '#f0fdf4', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Total Power</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>97.7 MW</span>
          </div>

          {/* Temperature readings */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginTop: '12px', marginBottom: '6px' }}>Live Temperature Readings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[
              { name: 'Shell', val: temps.shell, unit: '°C', max: 350, color: temps.shell > 320 ? '#f59e0b' : '#10b981' },
              { name: 'Roof', val: temps.roof, unit: '°C', max: 500, color: temps.roof > 450 ? '#f59e0b' : '#10b981' },
              { name: 'Off-Gas', val: temps.offGas, unit: '°C', max: 1400, color: '#64748b' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '6px', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '8px', color: '#94a3b8' }}>{t.name}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: t.color, fontFamily: "'Courier New', monospace" }}>{Math.round(t.val)}</div>
                <div style={{ fontSize: '8px', color: '#cbd5e1' }}>max {t.max}°C</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chemical Composition */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Chemical Composition <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>(Sample: 2 min ago)</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chemComposition.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '5px', background: c.status === 'adjusting' ? '#fef3c7' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: c.status === 'adjusting' ? '#d97706' : '#16a34a' }}>{c.element}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{c.current}</span>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>Spec: {c.target}</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', background: '#e8ecf1', marginTop: '3px' }}>
                    <div style={{ width: c.status === 'ok' ? '100%' : '72%', height: '100%', borderRadius: '2px', background: c.status === 'ok' ? '#10b981' : '#f59e0b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additions */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginTop: '12px', marginBottom: '6px' }}>Ferro-Alloy Additions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[
              { alloy: 'FeMn (HC)', added: '850 kg', target: '880 kg', done: true },
              { alloy: 'FeSi', added: '320 kg', target: '350 kg', done: false },
              { alloy: 'Coke (Carbon)', added: '140 kg', target: '160 kg', done: false },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500 }}>{a.alloy}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{a.added} / {a.target}</span>
                  <span style={{ fontSize: '8px', fontWeight: 600, color: a.done ? '#10b981' : '#f59e0b', background: a.done ? '#f0fdf4' : '#fffbeb', padding: '1px 5px', borderRadius: '4px' }}>{a.done ? 'Done' : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── SCRAP YARD INVENTORY ──────────────────
// ═══════════════════════════════════════════

function ScrapYardPanel() {
  const scrapGrades = [
    { grade: 'HMS-1 (Heavy Melting)', qty: '1,240 MT', pct: 35, quality: 'A', contam: '0.8%', price: '₹32,400/MT', color: '#10b981' },
    { grade: 'HMS-2 (Medium)', qty: '890 MT', pct: 25, quality: 'A', contam: '1.2%', price: '₹30,800/MT', color: '#3b82f6' },
    { grade: 'Shredded Scrap', qty: '680 MT', pct: 19, quality: 'B+', contam: '1.8%', price: '₹31,200/MT', color: '#8b5cf6' },
    { grade: 'Bundle Scrap', qty: '420 MT', pct: 12, quality: 'B', contam: '2.1%', price: '₹29,600/MT', color: '#f59e0b' },
    { grade: 'Turnings & Borings', qty: '320 MT', pct: 9, quality: 'C+', contam: '3.4%', price: '₹26,800/MT', color: '#94a3b8' },
  ]

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Scrap Yard Inventory & Mix</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Total: 3,550 MT | Avg contamination: 1.6% | 4.2 days coverage</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '3px 8px', borderRadius: '8px', border: '1px solid #dcfce7' }}>Healthy Stock</span>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#f59e0b', background: '#fffbeb', padding: '3px 8px', borderRadius: '8px', border: '1px solid #fed7aa' }}>2 Trucks Inbound</span>
        </div>
      </div>

      {/* Composition Bar */}
      <div style={{ height: '20px', borderRadius: '10px', display: 'flex', overflow: 'hidden', marginBottom: '12px', border: '1px solid #e8ecf1' }}>
        {scrapGrades.map((s, i) => (
          <div key={i} style={{ width: `${s.pct}%`, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{s.pct}%</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.5fr 0.8fr 1fr', gap: '6px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '4px' }}>
        {['Grade', 'Quantity', 'Quality', 'Contam.', 'Price'].map(h => (
          <div key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>
        ))}
      </div>
      {scrapGrades.map((s, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.5fr 0.8fr 1fr', gap: '6px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '3px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{s.grade}</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{s.qty}</div>
          <div><span style={{ fontSize: '9px', fontWeight: 600, color: s.quality === 'A' ? '#10b981' : s.quality.includes('B') ? '#f59e0b' : '#94a3b8', background: s.quality === 'A' ? '#f0fdf4' : s.quality.includes('B') ? '#fffbeb' : '#f8fafc', padding: '1px 6px', borderRadius: '6px' }}>{s.quality}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{s.contam}</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{s.price}</div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════
// ── ROLLING MILL & REBAR OUTPUT ───────────
// ═══════════════════════════════════════════

function RollingMillPanel() {
  const rebarSizes = [
    { dia: '8 mm', grade: 'Fe 500D', produced: '180 MT', speed: '22 m/s', surface: 'Pass', bundles: 96, color: '#10b981' },
    { dia: '10 mm', grade: 'Fe 500D', produced: '240 MT', speed: '20 m/s', surface: 'Pass', bundles: 128, color: '#10b981' },
    { dia: '12 mm', grade: 'Fe 500D', produced: '310 MT', speed: '18 m/s', surface: 'Pass', bundles: 124, color: '#10b981' },
    { dia: '16 mm', grade: 'Fe 500D', produced: '280 MT', speed: '15 m/s', surface: 'Pass', bundles: 84, color: '#10b981' },
    { dia: '20 mm', grade: 'Fe 550D', produced: '160 MT', speed: '12 m/s', surface: 'Hold', bundles: 38, color: '#f59e0b' },
    { dia: '25 mm', grade: 'Fe 500D', produced: '110 MT', speed: '10 m/s', surface: 'Pass', bundles: 22, color: '#10b981' },
  ]

  const prodHours = [
    { hour: '06', output: 95 }, { hour: '08', output: 142 }, { hour: '10', output: 178 },
    { hour: '12', output: 165 }, { hour: '14', output: 188 }, { hour: '16', output: 196 },
    { hour: '18', output: 180 }, { hour: 'Now', output: 136 },
  ]
  const maxHourly = Math.max(...prodHours.map(p => p.output))

  return (
    <div style={{ display: 'flex', gap: '14px' }}>
      <div style={{ ...st.card, flex: 1.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Rebar Production by Size</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Today — {rebarSizes.length} active sizes | 12m standard length</p>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>1,280 <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>MT</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '55px 65px 75px 65px 55px 55px', gap: '6px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', marginBottom: '3px' }}>
          {['Dia', 'Grade', 'Produced', 'Speed', 'Surface', 'Bundles'].map(h => (
            <div key={h} style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {rebarSizes.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '55px 65px 75px 65px 55px 55px', gap: '6px', padding: '8px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '2px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{r.dia}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{r.grade}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{r.produced}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{r.speed}</div>
            <div><span style={{ fontSize: '8px', fontWeight: 600, color: r.surface === 'Pass' ? '#10b981' : '#f59e0b', background: r.surface === 'Pass' ? '#f0fdf4' : '#fffbeb', padding: '1px 5px', borderRadius: '4px' }}>{r.surface}</span></div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{r.bundles}</div>
          </div>
        ))}
      </div>

      {/* Hourly Chart */}
      <div style={{ ...st.card, flex: 0.5 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Hourly Output</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '0 2px' }}>
          {prodHours.map((p, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#1e293b' }}>{p.output}</span>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${(p.output / maxHourly) * 120}px`, background: p.hour === 'Now' ? ACCENT : `${ACCENT}40`, transition: 'height 1s ease' }} />
              <span style={{ fontSize: '8px', color: '#94a3b8' }}>{p.hour}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '6px', background: '#f8fafc', borderRadius: '6px' }}>
          <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Avg</div><div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>160</div></div>
          <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Peak</div><div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>196</div></div>
          <div><div style={{ fontSize: '8px', color: '#94a3b8' }}>Target</div><div style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>150</div></div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── QUALITY TRACEABILITY ──────────────────
// ═══════════════════════════════════════════

function QualityTraceability() {
  const recentHeats = [
    { heat: 'H-4218', time: 'In Progress', grade: 'Fe 500D', yield: '—', uts: '—', elong: '—', bend: '—', status: 'in-progress' },
    { heat: 'H-4217', time: '11:42 AM', grade: 'Fe 500D', yield: '545 MPa', uts: '638 MPa', elong: '18.2%', bend: 'Pass', status: 'pass' },
    { heat: 'H-4216', time: '10:15 AM', grade: 'Fe 550D', yield: '592 MPa', uts: '685 MPa', elong: '16.8%', bend: 'Pass', status: 'pass' },
    { heat: 'H-4215', time: '08:48 AM', grade: 'Fe 500D', yield: '538 MPa', uts: '625 MPa', elong: '19.1%', bend: 'Pass', status: 'pass' },
    { heat: 'H-4214', time: '07:22 AM', grade: 'Fe 500D', yield: '542 MPa', uts: '631 MPa', elong: '17.5%', bend: 'Pass', status: 'pass' },
    { heat: 'H-4213', time: 'Yesterday', grade: 'Fe 500D', yield: '528 MPa', uts: '612 MPa', elong: '14.8%', bend: 'Retest', status: 'hold' },
  ]

  const statusColors = { pass: '#10b981', hold: '#f59e0b', 'in-progress': '#3b82f6' }
  const statusBg = { pass: '#f0fdf4', hold: '#fffbeb', 'in-progress': '#eff6ff' }

  return (
    <div style={{ display: 'flex', gap: '14px' }}>
      <div style={{ ...st.card, flex: 1.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Quality Traceability — Heat Wise</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Mechanical tests per BIS IS 1786:2008</p>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '3px 8px', borderRadius: '8px', border: '1px solid #dcfce7' }}>98.2% First-Pass</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 72px 62px 72px 72px 58px 50px 58px', gap: '4px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', marginBottom: '3px' }}>
          {['Heat', 'Time', 'Grade', 'Yield', 'UTS', 'Elong.', 'Bend', 'Status'].map(h => (
            <div key={h} style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {recentHeats.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 72px 62px 72px 72px 58px 50px 58px', gap: '4px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '2px', background: h.status === 'in-progress' ? '#eff6ff40' : '#fff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: ACCENT }}>{h.heat}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{h.time}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{h.grade}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{h.yield}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{h.uts}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{h.elong}</div>
            <div style={{ fontSize: '10px', color: h.bend === 'Retest' ? '#f59e0b' : '#64748b', fontWeight: h.bend === 'Retest' ? 600 : 400 }}>{h.bend}</div>
            <div><span style={{ fontSize: '8px', fontWeight: 600, color: statusColors[h.status], background: statusBg[h.status], padding: '1px 5px', borderRadius: '6px' }}>{h.status === 'in-progress' ? 'Running' : h.status === 'pass' ? 'Passed' : 'Hold'}</span></div>
          </div>
        ))}
      </div>

      {/* Compliance + Cost */}
      <div style={{ flex: 0.5, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={st.card}>
          <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>IS 1786 Compliance</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e8ecf1" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 42 * 0.982} ${2 * Math.PI * 42 * 0.018}`}
                strokeLinecap="round" transform="rotate(-90 50 50)" />
              <text x="50" y="47" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">98.2%</text>
              <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#94a3b8">Compliance</text>
            </svg>
          </div>
          {[{ label: 'Heats Tested', value: '56', color: '#1e293b' }, { label: 'First-Pass', value: '55', color: '#10b981' }, { label: 'Retest', value: '1', color: '#f59e0b' }, { label: 'Rejected', value: '0', color: '#ef4444' }].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: '11px' }}>
              <span style={{ color: '#64748b' }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div style={st.card}>
          <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Cost / MT Breakdown</h3>
          {[
            { item: 'Scrap Cost', value: '₹31,200', pct: 81, color: '#64748b' },
            { item: 'Power & Fuel', value: '₹3,850', pct: 10, color: '#f59e0b' },
            { item: 'Electrodes', value: '₹1,280', pct: 3.3, color: '#8b5cf6' },
            { item: 'Ferro Alloys', value: '₹1,420', pct: 3.7, color: '#3b82f6' },
            { item: 'Others', value: '₹700', pct: 2, color: '#94a3b8' },
          ].map((c, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{c.item}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>{c.value}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '2px', background: '#f1f5f9' }}>
                <div style={{ width: `${c.pct}%`, height: '100%', borderRadius: '2px', background: c.color }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #e8ecf1', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>Total</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: ACCENT }}>₹38,450</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── ENERGY & SUSTAINABILITY ───────────────
// ═══════════════════════════════════════════

function EnergySustainability() {
  const energyData = [
    { source: 'Grid Power', consumption: '42.6 MWh', cost: '₹3.2L', share: 52, color: '#3b82f6' },
    { source: 'Captive (DG)', consumption: '18.4 MWh', cost: '₹1.8L', share: 22, color: '#f59e0b' },
    { source: 'Waste Heat Recovery', consumption: '12.8 MWh', cost: '₹0.4L', share: 16, color: '#10b981' },
    { source: 'Solar Rooftop', consumption: '8.2 MWh', cost: '₹0', share: 10, color: '#06b6d4' },
  ]

  const emissions = [
    { param: 'CO₂ Intensity', value: '0.62 T/MT', limit: '< 0.80', pct: 77.5, color: '#10b981' },
    { param: 'Dust Emission', value: '24 mg/Nm³', limit: '< 50', pct: 48, color: '#10b981' },
    { param: 'Noise Level', value: '82 dB', limit: '< 85', pct: 96.5, color: '#f59e0b' },
    { param: 'Water Recycled', value: '92%', limit: 'Target 90%', pct: 92, color: '#10b981' },
  ]

  return (
    <div style={{ display: 'flex', gap: '14px' }}>
      <div style={{ ...st.card, flex: 1 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Energy Mix — Today</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {(() => { let cum = 0; const r = 46, circ = 2 * Math.PI * r; return energyData.map((e, i) => { const dash = (e.share / 100) * circ; const gap = circ - dash; const off = -cum * circ / 100; cum += e.share; return <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={e.color} strokeWidth="16" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off + circ / 4} /> }) })()}
              <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1e293b">82.0</text>
              <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">MWh</text>
            </svg>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {energyData.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: e.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '11px', color: '#1e293b' }}>{e.source}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{e.consumption}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>{e.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...st.card, flex: 1 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Emissions & Sustainability</h3>
        {emissions.map((e, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#1e293b' }}>{e.param}</span>
              <div style={{ display: 'flex', gap: '8px' }}><span style={{ fontSize: '12px', fontWeight: 700, color: e.color }}>{e.value}</span><span style={{ fontSize: '9px', color: '#94a3b8' }}>{e.limit}</span></div>
            </div>
            <div style={{ height: '5px', borderRadius: '3px', background: '#f1f5f9' }}>
              <div style={{ width: `${e.pct}%`, height: '100%', borderRadius: '3px', background: e.pct > 90 ? '#f59e0b' : e.color }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', padding: '8px 10px', background: `${ACCENT}06`, borderRadius: '6px', border: `1px solid ${ACCENT}12` }}>
          <span style={{ background: ACCENT, color: '#fff', fontSize: '7px', fontWeight: 800, padding: '2px 4px', borderRadius: '3px', flexShrink: 0, marginTop: '1px' }}>AI</span>
          <span style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>Waste heat recovery can increase 12% if BF gas bypass V-22 adjusted. Noise trending high — recommend idle mill deceleration.</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ── AI INSIGHTS ───────────────────────────
// ═══════════════════════════════════════════

function AIInsightsScrap() {
  const insights = [
    { type: 'yield', title: 'Increase HMS-1 ratio to 40% for next heat — yield gain +0.8%', desc: 'Scrap mix model analyzed 120 heats. At 40% HMS-1: predicted yield 92.2% (+₹180/MT cost, offset by +₹2.4L/day yield gain).', confidence: '93%', impact: '₹2.4L/day', color: '#10b981' },
    { type: 'process', title: 'Reduce EAF refining time by 2 min for Fe 500D heats', desc: 'SPC: Carbon target achieved 3.2 min early in 78% of last 50 heats. Shorter refining = +2 heats/day capacity.', confidence: '91%', impact: '+2 heats/day', color: ACCENT },
    { type: 'quality', title: '20mm rebar elongation trending towards lower spec limit', desc: 'SPC: elongation at 15.2% (min: 14.5%) with downward drift. Root cause: Si at 0.28% (upper range). Adjust FeSi.', confidence: '88%', impact: 'Prevent hold', color: '#f59e0b' },
    { type: 'maintenance', title: 'Rolling mill Stand #14 bearing replacement in 5 days', desc: 'Vibration: 3.8 mm/s (threshold: 4.5). Degradation: 0.14 mm/s per day. Schedule during next shutdown.', confidence: '89%', impact: 'Avoid 6hr down', color: '#ef4444' },
  ]

  const typeLabels = { yield: 'Yield Opt.', process: 'Process', quality: 'Quality', maintenance: 'Pred. Maint.' }

  return (
    <div style={st.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>AI Insights — Scrap-to-Rebar Optimization</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>ML models: 248 sensors + 3 years heat data</p>
        </div>
        <span style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{insights.length} actionable</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', borderLeft: `4px solid ${ins.color}`, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: ins.color, padding: '2px 6px', borderRadius: '3px' }}>{typeLabels[ins.type]}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', lineHeight: '1.3' }}>{ins.title}</span>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>{ins.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Confidence: <strong style={{ color: ACCENT }}>{ins.confidence}</strong></span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Impact: <strong style={{ color: '#10b981' }}>{ins.impact}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ fontSize: '9px', fontWeight: 600, color: '#fff', background: ACCENT, border: 'none', padding: '3px 10px', borderRadius: '5px', cursor: 'pointer' }}>Accept</button>
                <button style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', background: '#fff', border: '1px solid #e8ecf1', padding: '3px 10px', borderRadius: '5px', cursor: 'pointer' }}>Dismiss</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────
// ═══════════════════════════════════════════

export default function ScrapToRebar() {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const timeStr = useLocaleTime()

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => { setRefreshKey(k => k + 1); setRefreshing(false) }, 1200) }

  return (
    <>
      <style>{`
        @keyframes fadeUpIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes spinRefresh { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(96,93,186,0); } 50% { box-shadow: 0 0 12px 2px rgba(96,93,186,0.15); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .ov-hover-card { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); }
        .ov-hover-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(96,93,186,0.12) !important; border-color: #605dba30 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16" /><path d="M4 20V10l4-6h8l4 6v10" /><path d="M9 20v-6h6v6" /><line x1="12" y1="4" x2="12" y2="8" /></svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Scrap-to-Rebar Smart Manufacturing</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>End-to-end process tracking — EAF route | Scrap → Billet → Rebar</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' }} /> Live
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: '16px', border: '1px solid #e8ecf1', fontFamily: "'Courier New', monospace", fontWeight: 600 }}>H-4218 | Day-A | {timeStr}</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: refreshing ? ACCENT : '#fff', border: `1px solid ${ACCENT}40`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: refreshing ? '#fff' : ACCENT, cursor: 'pointer', fontWeight: 600 }} onClick={handleRefresh} disabled={refreshing}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={refreshing ? '#fff' : ACCENT} strokeWidth="2" style={refreshing ? { animation: 'spinRefresh 0.8s linear infinite' } : {}}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            {refreshing ? ' Refreshing...' : ' Refresh'}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> Export
          </button>
        </div>
      </div>

      <div key={refreshKey}>
        {/* Row 1: Heat Timer + Shift/Safety */}
        <Section delay={0}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div className="ov-hover-card" style={{ flex: 0.4, borderRadius: '12px' }}><LiveHeatTimer /></div>
            <div style={{ flex: 0.6, borderRadius: '12px' }}><ShiftSafetyPanel /></div>
          </div>
        </Section>

        <Section delay={0.03}><ProcessFlow /></Section>
        <Section delay={0.06}><KPICards /></Section>
        <Section delay={0.09}><EAFMonitor /></Section>
        <Section delay={0.12}><ScrapYardPanel /></Section>
        <Section delay={0.15}><RollingMillPanel /></Section>
        <Section delay={0.18}><QualityTraceability /></Section>
        <Section delay={0.21}><EnergySustainability /></Section>
        <Section delay={0.24}><AIInsightsScrap /></Section>

        {/* Footer */}
        <Section delay={0.27}>
          <div style={{ display: 'flex', gap: '12px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>AI</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '3px' }}>Scrap-to-Rebar AI Engine — Integrated Process Intelligence</div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
                Monitoring 248 sensors across EAF, LRF, CCM, RHF & Rolling Mill. Models: XGBoost (yield), LSTM (energy), Random Forest (scrap quality), CNN (surface defects). Accuracy: 96.8%. Today: 12 accepted, 3 pending. Month savings: ₹42.6L.
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}

const st = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
}
