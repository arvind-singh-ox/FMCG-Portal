'use client'

import { useState, useEffect } from 'react'
import StatusBar from '@/components/industries/cement-plant/components/StatusBar'
import KPISection from '@/components/industries/cement-plant/components/KPISection'
import ProductionChart from '@/components/industries/cement-plant/components/ProductionChart'
import EnergyTrend from '@/components/industries/cement-plant/components/EnergyTrend'
import KilnHealth from '@/components/industries/cement-plant/components/KilnHealth'
import AIInsights from '@/components/industries/cement-plant/components/AIInsights'
import AlertsPanel from '@/components/industries/cement-plant/components/AlertsPanel'
import EnvironmentPanel from '@/components/industries/cement-plant/components/EnvironmentPanel'

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

function UserSpecificDashboard() {
  const user = getUserMeta()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const myTasks = [
    { task: 'Review Kiln Roller #3 vibration report', priority: 'critical', due: 'Today', status: 'pending' },
    { task: 'Approve WO-2026-1040 — Gearbox oil change', priority: 'high', due: 'Today', status: 'pending' },
    { task: 'Check Raw Mill roller wear measurement', priority: 'medium', due: 'Tomorrow', status: 'in-progress' },
    { task: 'Sign off cement quality lab report (Shift B)', priority: 'medium', due: 'Today', status: 'pending' },
    { task: 'Review monthly maintenance cost report', priority: 'low', due: '20 Mar', status: 'pending' },
  ]

  const myAlerts = [
    { time: '12 min ago', msg: 'Kiln shell Zone 4 temperature rising — 312°C (+12°C/hr)', severity: 'critical' },
    { time: '28 min ago', msg: 'Gearbox acoustic emission spike — possible tooth crack', severity: 'warning' },
    { time: '1 hr ago', msg: 'Stack NOx at 96% of regulatory limit', severity: 'warning' },
    { time: '2 hr ago', msg: 'Raw Mill vibration trending up — Roller #2', severity: 'info' },
  ]

  const recentPages = [
    { page: 'Kiln Process Optimization', key: 'kiln-optimization', time: '15 min ago' },
    { page: 'Real-Time KPIs', key: 'realtime-kpis', time: '1 hr ago' },
    { page: 'Asset Health', key: 'asset-health', time: '2 hr ago' },
    { page: 'Conveyor Belt Health', key: 'conveyor-health', time: '3 hr ago' },
  ]

  const quickStats = [
    { label: 'My Open Work Orders', value: '4', color: '#f59e0b' },
    { label: 'Pending Approvals', value: '2', color: '#ef4444' },
    { label: 'AI Recommendations', value: '6', color: ACCENT },
    { label: 'Shift', value: 'Day (A)', color: '#10b981' },
  ]

  const priColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }
  const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  const statColors = { pending: '#f59e0b', 'in-progress': '#3b82f6' }

  return (
    <div style={{ animation: 'fadeUpIn 0.5s ease' }}>
      <div className="ov-hover-card" style={{ background: 'linear-gradient(135deg, #605dba, #7c3aed)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', color: '#fff' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{greeting}, {user.name || 'User'}</div>
        <div style={{ fontSize: '13px', opacity: 0.8 }}>{user.role || 'Plant Manager'} | {user.companyName || 'Cement Plant'} | {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
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
              { label: 'Production', value: '1,840 MT clinker (target: 1,800)', color: '#10b981' },
              { label: 'Kiln Run Time', value: '8h 0m / 8h (100%)', color: '#10b981' },
              { label: 'Stoppages', value: '0 unplanned', color: '#10b981' },
              { label: 'Energy SEC', value: '78.2 kWh/MT (target: 80)', color: '#10b981' },
              { label: 'Quality (LSF)', value: '96.2 (spec: 94-98)', color: '#3b82f6' },
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
            <p style={ovStyles.pageSub}>Real-time insights into your cement plant operations</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={ovStyles.liveBadge}>
            <span style={ovStyles.liveDot} /> Live Data
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Updated: {timeStr} ({tz.split('/')[1]})</span>
          <button style={ovStyles.actionBtn} onClick={() => {}}>
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
                <EnergyTrend />
              </div>
            </div>
            <div className="ov-hover-card" style={{ marginBottom: '20px', borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.2s' }}>
              <KilnHealth />
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div className="ov-hover-card" style={{ flex: 2, borderRadius: '12px', animation: 'fadeUpIn 0.6s ease both', animationDelay: '0.25s' }}>
                <AIInsights />
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
