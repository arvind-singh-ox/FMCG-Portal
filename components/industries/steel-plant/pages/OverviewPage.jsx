'use client'

import { useState, useEffect } from 'react'
import StatusBar from '@/components/industries/steel-plant/components/StatusBar'
import KPISection from '@/components/industries/steel-plant/components/KPISection'

const ACCENT = '#605dba'

const countryLocaleMap = {
  '+91': { locale: 'en-IN', tz: 'Asia/Kolkata' },
  '+1': { locale: 'en-US', tz: 'America/New_York' },
  '+44': { locale: 'en-GB', tz: 'Europe/London' },
  '+61': { locale: 'en-AU', tz: 'Australia/Sydney' },
  '+49': { locale: 'de-DE', tz: 'Europe/Berlin' },
  '+33': { locale: 'fr-FR', tz: 'Europe/Paris' },
  '+81': { locale: 'ja-JP', tz: 'Asia/Tokyo' },
  '+86': { locale: 'zh-CN', tz: 'Asia/Shanghai' },
  '+971': { locale: 'en-AE', tz: 'Asia/Dubai' },
  '+65': { locale: 'en-SG', tz: 'Asia/Singapore' },
}

function getUserMeta() {
  if (typeof document === 'undefined') return {}
  try {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('user_meta='))
    if (cookie) return JSON.parse(atob(cookie.split('=')[1]))
  } catch {}
  return {}
}

function useLocaleTime() {
  const user = getUserMeta()
  const code = user.countryCode || '+91'
  const { locale, tz } = countryLocaleMap[code] || countryLocaleMap['+91']
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [locale, tz])
  return { timeStr, tz }
}

/* ── Production Chart (SVG area chart) ── */
function ProductionChart() {
  const data = [
    { label: '06:00', value: 780 },
    { label: '08:00', value: 820 },
    { label: '10:00', value: 890 },
    { label: '12:00', value: 860 },
    { label: '14:00', value: 920 },
    { label: '16:00', value: 950 },
    { label: '18:00', value: 910 },
  ]
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value)) - 50
  const w = 500, h = 180
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / (max - min)) * (h - 20) - 10}`).join(' ')

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Steel Production Trend</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Crude steel output (MT) — Today</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>6,280 MT</div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>+2.8% vs yesterday</div>
          </div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 20}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h + 10} ${points} ${w},${h + 10}`} fill="url(#prodGrad)" />
        <polyline points={points} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w
          const y = h - ((d.value - min) / (max - min)) * (h - 20) - 10
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#fff" stroke={ACCENT} strokeWidth="2" />
              <text x={x} y={h + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Energy Consumption Chart ── */
function EnergyChart() {
  const data = [
    { label: '06:00', value: 535 },
    { label: '08:00', value: 528 },
    { label: '10:00', value: 522 },
    { label: '12:00', value: 530 },
    { label: '14:00', value: 518 },
    { label: '16:00', value: 515 },
    { label: '18:00', value: 520 },
  ]
  const max = Math.max(...data.map(d => d.value)) + 10
  const min = Math.min(...data.map(d => d.value)) - 10
  const w = 500, h = 180
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / (max - min)) * (h - 20) - 10}`).join(' ')

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Energy Consumption</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>kWh per MT of steel — Today</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>520 kWh/MT</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>-1.8% vs target</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 20}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h + 10} ${points} ${w},${h + 10}`} fill="url(#energyGrad)" />
        <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w
          const y = h - ((d.value - min) / (max - min)) * (h - 20) - 10
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#fff" stroke="#10b981" strokeWidth="2" />
              <text x={x} y={h + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Blast Furnace Health ── */
function FurnaceHealth() {
  const furnaces = [
    { name: 'Blast Furnace #1', temp: 1520, status: 'Running', health: 94, uptime: '99.2%' },
    { name: 'Blast Furnace #2', temp: 1485, status: 'Running', health: 91, uptime: '97.8%' },
    { name: 'BOF Converter #1', temp: 1650, status: 'Running', health: 88, uptime: '96.5%' },
    { name: 'EAF Unit #1', temp: 1580, status: 'Maintenance', health: 72, uptime: '85.1%' },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Furnace & Equipment Health</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {furnaces.map((f, i) => {
          const healthColor = f.health >= 90 ? '#10b981' : f.health >= 80 ? '#f59e0b' : '#ef4444'
          const circumference = 2 * Math.PI * 36
          const offset = circumference - (f.health / 100) * circumference
          return (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ display: 'block', margin: '0 auto 10px' }}>
                <circle cx="45" cy="45" r="36" fill="none" stroke="#e8ecf1" strokeWidth="6" />
                <circle cx="45" cy="45" r="36" fill="none" stroke={healthColor} strokeWidth="6"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
                <text x="45" y="42" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1e293b">{f.health}%</text>
                <text x="45" y="56" textAnchor="middle" fontSize="9" fill="#94a3b8">Health</text>
              </svg>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{f.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{f.temp}°C | {f.uptime} uptime</div>
              <div style={{ marginTop: '6px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '10px',
                  background: f.status === 'Running' ? '#f0fdf4' : '#fef3c7',
                  color: f.status === 'Running' ? '#16a34a' : '#d97706',
                }}>{f.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── AI Insights Panel ── */
function AIInsightsPanel() {
  const insights = [
    { type: 'optimization', title: 'Blast Furnace #2 — Reduce coke rate by 3%', desc: 'AI model suggests adjusting air blast temperature to 1180°C to reduce coke consumption while maintaining output quality.', confidence: '94%', impact: 'High' },
    { type: 'prediction', title: 'Refractory lining wear predicted in 18 days', desc: 'Thermal imaging pattern analysis indicates accelerated wear in BF#1 Zone 3. Schedule inspection before March 30.', confidence: '89%', impact: 'Critical' },
    { type: 'anomaly', title: 'Rolling Mill vibration trending above normal', desc: 'Stand #3 vibration increased 15% in last 4 hours. Pattern matches early bearing degradation signature.', confidence: '87%', impact: 'Medium' },
    { type: 'optimization', title: 'Ladle preheating — potential 8% energy saving', desc: 'Adjusting preheat duration from 45 to 38 minutes based on thermal modelling. No quality impact predicted.', confidence: '91%', impact: 'Medium' },
  ]

  const typeColors = { optimization: ACCENT, prediction: '#f59e0b', anomaly: '#ef4444' }
  const impactColors = { High: ACCENT, Critical: '#ef4444', Medium: '#f59e0b' }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>AI Insights & Recommendations</h3>
        <span style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{insights.length} active insights</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', borderLeft: `3px solid ${typeColors[ins.type]}`, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: typeColors[ins.type], background: `${typeColors[ins.type]}15`, padding: '2px 8px', borderRadius: '4px' }}>{ins.type}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{ins.title}</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: impactColors[ins.impact] }}>{ins.impact}</span>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{ins.desc}</p>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>AI Confidence: {ins.confidence}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Alerts Panel ── */
function AlertsPanel() {
  const alerts = [
    { time: '8 min ago', msg: 'BF#1 hearth temperature rising — 1540°C (+18°C/hr)', severity: 'critical' },
    { time: '22 min ago', msg: 'Rolling mill stand #3 vibration spike detected', severity: 'warning' },
    { time: '45 min ago', msg: 'Caster segment #7 coolant flow below threshold', severity: 'warning' },
    { time: '1 hr ago', msg: 'SO₂ emissions at 92% of regulatory limit', severity: 'info' },
    { time: '2 hr ago', msg: 'Ladle turret rotation speed deviation — 4.2% variance', severity: 'info' },
  ]

  const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Active Alerts</h3>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1.5s infinite' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: `3px solid ${sevColors[a.severity]}`, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: sevColors[a.severity], textTransform: 'uppercase' }}>{a.severity}</span>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>{a.time}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.5' }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Environment Panel ── */
function EnvironmentPanel() {
  const metrics = [
    { label: 'CO₂ Emissions', value: '1.85 T/MT', status: 'Within Limit', color: '#10b981', limit: '< 2.0 T/MT' },
    { label: 'SO₂ Level', value: '42 mg/Nm³', status: 'Warning', color: '#f59e0b', limit: '< 50 mg/Nm³' },
    { label: 'NOx Level', value: '88 mg/Nm³', status: 'Within Limit', color: '#10b981', limit: '< 100 mg/Nm³' },
    { label: 'Particulate Matter', value: '28 mg/Nm³', status: 'Within Limit', color: '#10b981', limit: '< 30 mg/Nm³' },
    { label: 'Water Usage', value: '3.2 m³/MT', status: 'Within Limit', color: '#10b981', limit: '< 4.0 m³/MT' },
    { label: 'Waste Recycled', value: '94%', status: 'Good', color: '#10b981', limit: 'Target: 90%' },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Environmental & Compliance</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{m.value}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: m.color }}>{m.status}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{m.limit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── User Specific Dashboard ── */
function UserSpecificDashboard() {
  const user = getUserMeta()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const myTasks = [
    { task: 'Review BF#1 hearth temperature anomaly report', priority: 'critical', due: 'Today', status: 'pending' },
    { task: 'Approve WO-2026-3080 — Rolling mill bearing replacement', priority: 'high', due: 'Today', status: 'pending' },
    { task: 'Check caster segment coolant flow measurements', priority: 'medium', due: 'Tomorrow', status: 'in-progress' },
    { task: 'Sign off steel quality lab report (Shift B)', priority: 'medium', due: 'Today', status: 'pending' },
    { task: 'Review monthly energy consumption report', priority: 'low', due: '22 Mar', status: 'pending' },
  ]

  const myAlerts = [
    { time: '8 min ago', msg: 'BF#1 hearth temperature rising — 1540°C (+18°C/hr)', severity: 'critical' },
    { time: '22 min ago', msg: 'Rolling mill stand #3 vibration spike — possible bearing wear', severity: 'warning' },
    { time: '45 min ago', msg: 'Caster segment #7 coolant flow below threshold', severity: 'warning' },
    { time: '1 hr ago', msg: 'SO₂ emissions at 92% of regulatory limit', severity: 'info' },
  ]

  const recentPages = [
    { page: 'Blast Furnace Optimization', key: 'blast-furnace', time: '10 min ago' },
    { page: 'Real-Time KPIs', key: 'realtime-kpis', time: '45 min ago' },
    { page: 'Asset Health', key: 'asset-health', time: '2 hr ago' },
    { page: 'Energy Optimization', key: 'energy-optimization', time: '3 hr ago' },
  ]

  const quickStats = [
    { label: 'My Open Work Orders', value: '6', color: '#f59e0b' },
    { label: 'Pending Approvals', value: '3', color: '#ef4444' },
    { label: 'AI Recommendations', value: '8', color: ACCENT },
    { label: 'Shift', value: 'Day (A)', color: '#10b981' },
  ]

  const priColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }
  const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  const statColors = { pending: '#f59e0b', 'in-progress': '#3b82f6' }

  return (
    <div style={{ animation: 'fadeUpIn 0.5s ease' }}>
      <div className="ov-hover-card" style={{ background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', color: '#fff' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{greeting}, {user.name || 'User'}</div>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>{user.role || 'Plant Manager'} | {user.companyName || 'Steel Plant'} | {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {quickStats.map((s, i) => (
          <div key={i} className="ov-hover-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px', textAlign: 'center', borderTop: `3px solid ${s.color}`, animation: 'fadeUpIn 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="ov-hover-card" style={{ flex: 1, background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px', animation: 'fadeUpIn 0.5s ease both', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>My Tasks & Approvals</h3>
            <span style={{ fontSize: '11px', color: ACCENT, fontWeight: 600 }}>{myTasks.length} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: priColors[t.priority], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{t.task}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Due: {t.due}</div>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: `${statColors[t.status]}15`, color: statColors[t.status] }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ov-hover-card" style={{ flex: 1, background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px', animation: 'fadeUpIn 0.5s ease both', animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>My Alerts</h3>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1.5s infinite' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myAlerts.map((a, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: `3px solid ${sevColors[a.severity]}`, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: sevColors[a.severity], textTransform: 'uppercase' }}>{a.severity}</span>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>{a.time}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.5' }}>{a.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="ov-hover-card" style={{ flex: 1, background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px', animation: 'fadeUpIn 0.5s ease both', animationDelay: '0.2s' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Recently Visited</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentPages.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{r.page}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ov-hover-card" style={{ flex: 1, background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '20px', animation: 'fadeUpIn 0.5s ease both', animationDelay: '0.25s' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>My Shift Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Shift', value: 'Day Shift A (06:00 — 14:00)', color: '#1e293b' },
              { label: 'Production', value: '6,280 MT crude steel (target: 6,000)', color: '#10b981' },
              { label: 'Furnace Run Time', value: '8h 0m / 8h (100%)', color: '#10b981' },
              { label: 'Unplanned Stoppages', value: '1 (EAF — 22 min)', color: '#f59e0b' },
              { label: 'Energy SEC', value: '520 kWh/MT (target: 540)', color: '#10b981' },
              { label: 'Yield Rate', value: '96.3% (spec: 95-98%)', color: '#3b82f6' },
              { label: 'Safety Incidents', value: '0', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{s.label}</span>
                <span style={{ fontWeight: 600, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Overview Page ── */
export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState('organization')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { timeStr, tz } = useLocaleTime()

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshKey(k => k + 1)
      setRefreshing(false)
    }, 1200)
  }

  return (
    <>
      <style>{`
        @keyframes fadeUpIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes spinRefresh { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(96,93,186,0); } 50% { box-shadow: 0 0 12px 2px rgba(96,93,186,0.15); } }
        .ov-hover-card { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); }
        .ov-hover-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(96,93,186,0.12) !important; border-color: #605dba30 !important; }
        .ov-refresh-overlay { position:absolute; inset:0; z-index:2; pointer-events:none; border-radius:inherit; }
        .ov-refreshing .ov-refresh-overlay { background: linear-gradient(90deg, transparent, rgba(96,93,186,0.06), transparent); background-size: 400px 100%; animation: shimmer 1.2s ease infinite; }
      `}</style>

      {/* Page Header */}
      <div style={ovStyles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={ovStyles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <h1 style={ovStyles.pageTitle}>Overview Dashboard</h1>
            <p style={ovStyles.pageSub}>Real-time insights into your steel plant operations</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={ovStyles.liveBadge}>
            <span style={ovStyles.liveDot} /> Live Data
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Updated: {timeStr} ({tz.split('/')[1]})</span>
          <button style={ovStyles.actionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {' '}All Time
          </button>
          <button style={{ ...ovStyles.refreshBtn, ...(refreshing ? { background: ACCENT, color: '#fff' } : {}) }} onClick={handleRefresh} disabled={refreshing}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={refreshing ? '#fff' : ACCENT} strokeWidth="2"
              style={refreshing ? { animation: 'spinRefresh 0.8s linear infinite' } : {}}>
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {refreshing ? ' Refreshing...' : ' Refresh'}
          </button>
          <button style={ovStyles.actionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            {' '}Export
          </button>
        </div>
      </div>

      <StatusBar />

      {/* Tabs */}
      <div style={ovStyles.tabs}>
        <button style={activeTab === 'organization' ? ovStyles.tabActive : ovStyles.tab} onClick={() => setActiveTab('organization')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          {' '}Organization
        </button>
        <button style={activeTab === 'user' ? ovStyles.tabActive : ovStyles.tab} onClick={() => setActiveTab('user')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          {' '}User Specific
        </button>
      </div>

      <div key={refreshKey} className={refreshing ? 'ov-refreshing' : ''} style={{ position: 'relative' }}>
        <div className="ov-refresh-overlay" />

        {activeTab === 'organization' ? (
          <>
            <div className="ov-hover-card" style={{ marginBottom: '20px', borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0s' }}>
              <KPISection />
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div className="ov-hover-card" style={{ flex: 1, borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.1s' }}>
                <ProductionChart />
              </div>
              <div className="ov-hover-card" style={{ flex: 1, borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.15s' }}>
                <EnergyChart />
              </div>
            </div>
            <div className="ov-hover-card" style={{ marginBottom: '20px', borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.2s' }}>
              <FurnaceHealth />
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div className="ov-hover-card" style={{ flex: 2, borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.25s' }}>
                <AIInsightsPanel />
              </div>
              <div className="ov-hover-card" style={{ flex: 1, borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.3s' }}>
                <AlertsPanel />
              </div>
            </div>
            <div className="ov-hover-card" style={{ marginBottom: '20px', borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.35s' }}>
              <EnvironmentPanel />
            </div>
          </>
        ) : (
          <UserSpecificDashboard />
        )}

        <div className="ov-hover-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '10px', padding: '14px 20px', marginTop: '10px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.4s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>System Status: All Services Operational</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Last sync: {timeStr}</span>
          </div>
        </div>
      </div>
    </>
  )
}

const ovStyles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', animation: 'pulseGlow 2s infinite' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: `1px solid ${ACCENT}40`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: ACCENT, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, transition: 'all 0.2s' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
}
