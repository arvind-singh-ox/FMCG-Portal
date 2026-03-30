'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'

const ACCENT = '#1a9b6c'

function useElapsedMs(tsMs) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - tsMs), 200)
    return () => clearInterval(id)
  }, [tsMs])
  return elapsed
}

function LiveClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const upd = () => setT(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' }))
    upd()
    const id = setInterval(upd, 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#1e293b', fontSize: 12 }}>{t}</span>
}

export default function TopBar() {
  const router  = useRouter()
  const live    = useLiveData()
  const elapsed = useElapsedMs(live.ts || Date.now())
  const handleLogout = async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/login') }

  const online   = live.sensors?.filter(s => s.status === 'online').length ?? 0
  const alerting = live.sensors?.filter(s => s.alert).length ?? 0
  const warning  = live.sensors?.filter(s => s.warn).length ?? 0
  const totalSensors = live.sensors?.length ?? 0
  const elSec    = (elapsed / 1000).toFixed(1)
  const isStale  = elapsed > 5000

  return (
    <>
      <style>{`
        @keyframes nudge{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(5px);opacity:1}}
        @keyframes ring{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.4);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        .tb-pill{transition:all 0.2s}
        .tb-pill:hover{filter:brightness(1.08)}
      `}</style>

      {/* Real-time sensor status strip */}
      <div style={{ background: alerting > 0 ? '#fef2f2' : '#f0fdf4', borderBottom: `1px solid ${alerting > 0 ? '#fecaca' : '#bbf7d0'}`, padding: '4px 24px', display: 'flex', alignItems: 'center', gap: 20, overflowX: 'auto', animation: 'slideIn 0.3s ease' }}>

        {/* Last update */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isStale ? '#f59e0b' : '#10b981', animation: 'ring 1.5s ease-out infinite' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isStale ? '#f59e0b' : '#10b981' }} />
          </span>
          <span style={{ fontSize: 11, color: isStale ? '#92400e' : '#166534', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Updated {elSec}s ago
          </span>
        </div>

        <span style={{ color: '#d1d5db', fontSize: 12 }}>|</span>

        {/* Sensor count */}
        <div className="tb-pill" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 10px', flexShrink: 0, cursor: 'default' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{online}/{totalSensors}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>sensors online</span>
        </div>

        {/* Alert sensors */}
        {alerting > 0 && (
          <div className="tb-pill" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '2px 10px', flexShrink: 0, animation: 'blink 1.4s ease-in-out infinite' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>{alerting} alert{alerting > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Warning sensors */}
        {warning > 0 && (
          <div className="tb-pill" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>{warning} warn</span>
          </div>
        )}

        <span style={{ color: '#d1d5db', fontSize: 12 }}>|</span>

        {/* Live KPI chips */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {[
            { label: 'OEE', value: `${live.kpis?.oee?.toFixed(1) ?? '—'}%`, color: live.kpis?.oee >= 90 ? '#166534' : '#92400e', bg: live.kpis?.oee >= 90 ? '#f0fdf4' : '#fffbeb', border: live.kpis?.oee >= 90 ? '#bbf7d0' : '#fde68a' },
            { label: 'Defect', value: `${live.kpis?.defectRate?.toFixed(2) ?? '—'}%`, color: live.kpis?.defectRate < 2 ? '#166534' : '#991b1b', bg: live.kpis?.defectRate < 2 ? '#f0fdf4' : '#fef2f2', border: live.kpis?.defectRate < 2 ? '#bbf7d0' : '#fecaca' },
            { label: 'Lines', value: `${live.kpis?.activeLines ?? '—'}/8`, color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Tick', value: `#${live.tick ?? 0}`, color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
          ].map(k => (
            <div key={k.label} className="tb-pill" style={{ display: 'flex', gap: 4, alignItems: 'center', background: k.bg, border: `1px solid ${k.border}`, borderRadius: 20, padding: '1px 8px' }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{k.label}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</span>
            </div>
          ))}
        </div>

        <span style={{ color: '#d1d5db', fontSize: 12 }}>|</span>

        {/* IST Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <LiveClock />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>IST</span>
        </div>
      </div>

      {/* Main topbar */}
      <div style={st.topBar}>
        <div style={st.left}>
          <div style={st.brand}>iFactory AI</div>
        </div>
        <div style={st.actions}>
          <div style={st.previewBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#605dba" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={st.previewTxt}>Preview mode — FMCG Demo Portal</span>
            <span style={st.ctaTxt}>Unlock production-ready solution</span>
            <svg width="16" height="12" viewBox="0 0 24 14" fill="none" stroke="#605dba" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'nudge 1.2s ease-in-out infinite', flexShrink: 0 }}>
              <line x1="4" y1="7" x2="18" y2="7" /><polyline points="13 2 18 7 13 12" />
            </svg>
          </div>
          <a href="https://calendly.com/contact-ifactoryapp/30min" target="_blank" rel="noopener noreferrer" style={st.scheduleBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Schedule a Call
          </a>
          <button style={st.iconBtn} title="Notifications">
            {alerting > 0 && <span style={{ ...st.badge, background: '#ef4444', animation: 'blink 1.4s infinite' }}>{alerting}</span>}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button style={st.iconBtn} title="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <select style={st.langSelect}><option>EN</option><option>HI</option></select>
          <button style={st.logoutBtn} onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </>
  )
}

const st = {
  topBar:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 24px', minHeight:56, background:'#fff', borderBottom:'1px solid #e8ecf1', position:'sticky', top:0, zIndex:100 },
  left:         { display:'flex', alignItems:'center', gap:16 },
  brand:        { fontSize:18, fontWeight:700, color:'#1a9b6c' },
  previewBadge: { display:'flex', alignItems:'center', gap:6, background:'#f5f3ff', border:'1px solid #e0daf5', borderRadius:20, padding:'5px 14px' },
  previewTxt:   { fontSize:12, color:'#64748b', fontWeight:500 },
  ctaTxt:       { fontSize:11, color:'#605dba', fontWeight:700, marginLeft:4, whiteSpace:'nowrap' },
  actions:      { display:'flex', alignItems:'center', gap:8 },
  scheduleBtn:  { display:'flex', alignItems:'center', gap:6, background:'#1a9b6c', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', textDecoration:'none', whiteSpace:'nowrap' },
  iconBtn:      { background:'none', border:'1px solid #e8ecf1', borderRadius:8, padding:8, cursor:'pointer', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' },
  badge:        { position:'absolute', top:-4, right:-4, background:'#ef4444', color:'#fff', fontSize:9, fontWeight:700, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' },
  langSelect:   { border:'1px solid #e8ecf1', borderRadius:8, padding:'8px 12px', fontSize:13, cursor:'pointer', background:'#fff', color:'#4a5568', fontWeight:600 },
  logoutBtn:    { display:'flex', alignItems:'center', justifyContent:'center', background:'#ef4444', border:'none', borderRadius:8, padding:'8px 12px', cursor:'pointer' },
}
