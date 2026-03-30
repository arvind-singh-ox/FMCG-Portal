'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, Sparkline, RingGauge, LivePulse, TrendChip, ProgressBar } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const ACCENT2 = '#0d7a52'

function getUserMeta() {
  if (typeof document === 'undefined') return {}
  try {
    const c = document.cookie.split('; ').find(x => x.startsWith('user_meta='))
    if (c) return JSON.parse(atob(c.split('=')[1]))
  } catch {}
  return {}
}

function LiveClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const upd = () => setT(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' }))
    upd(); const id = setInterval(upd, 1000); return () => clearInterval(id)
  }, [])
  return <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.95 }}>{t} IST</div>
}

export default function OverviewPage() {
  const live = useLiveData()
  const user = getUserMeta()
  const [histKPI, setHistKPI] = useState({ prod: [], oee: [], dispatch: [], quality: [] })
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())
  const [doneTasks, setDoneTasks] = useState(new Set())
  const [vis, setVis] = useState(false)

  useEffect(() => { setTimeout(() => setVis(true), 80) }, [])

  useEffect(() => {
    setHistKPI(prev => ({
      prod:     [...prev.prod.slice(-19),     live.kpis.todayProduction],
      oee:      [...prev.oee.slice(-19),      live.kpis.oee],
      dispatch: [...prev.dispatch.slice(-19), live.kpis.dispatchedOrders],
      quality:  [...prev.quality.slice(-19),  live.kpis.qualityPassRate],
    }))
  }, [live.tick])

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
  const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  const priColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }

  const kpis = [
    { label: "Today's Production", value: live.kpis.todayProduction, unit: 'units', trend: '+6.2%', up: true,  color: ACCENT,    data: histKPI.prod,     decimals: 0 },
    { label: 'Active Lines',        value: live.kpis.activeLines,    unit: '/ 8',   trend: '2 idle', up: false, color: '#3b82f6', data: [5,6,6,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6], decimals: 0 },
    { label: 'OEE Score',           value: live.kpis.oee,            unit: '%',     trend: '+1.4%', up: true,  color: '#f59e0b', data: histKPI.oee,      decimals: 1 },
    { label: 'Orders Dispatched',   value: live.kpis.dispatchedOrders,unit:'today', trend: '+18',   up: true,  color: '#8b5cf6', data: histKPI.dispatch, decimals: 0 },
    { label: 'Quality Pass Rate',   value: live.kpis.qualityPassRate,unit: '%',     trend: '+0.2%', up: true,  color: '#10b981', data: histKPI.quality,  decimals: 1 },
    { label: 'Pending Alerts',      value: live.kpis.pendingAlerts,  unit: 'open',  trend: '2 crit',up: false, color: '#ef4444', data: [8,7,7,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7], decimals: 0 },
  ]

  const tasks = [
    { task: 'Approve batch BT-2026-0421 QC report',       pri: 'critical', due: 'Today' },
    { task: 'Review WO-1142 — Packaging seal machine',     pri: 'high',     due: 'Today' },
    { task: 'Sign off Line 3 recipe change — Chips v2',    pri: 'medium',   due: 'Tomorrow' },
    { task: 'Monthly FSSAI compliance report',              pri: 'medium',   due: '28 Mar' },
    { task: 'Vendor evaluation — Amul Dairy renewal',       pri: 'low',      due: '30 Mar' },
  ]

  const aiRecs = [
    { icon: '📦', title: 'Increase Bourbon batch by 15%',        desc: 'Demand up 22% this week vs forecast. Recommend +15% batch.', priority: 'high'   },
    { icon: '🔧', title: 'Schedule Line 8 preventive check',      desc: 'Juices line vibration anomaly — due for maintenance.',       priority: 'medium' },
    { icon: '🧊', title: 'Cold storage Unit B needs calibration', desc: 'Temperature deviation trending. Calibrate before night shift.',priority: 'high'  },
    { icon: '🚚', title: 'Reorder Palm Oil — 4 days stock left',  desc: 'Current: 8.4 MT. Reorder point: 10 MT. Place PO now.',       priority: 'high'   },
  ]

  return (
    <div style={{ animation: vis ? 'fadeUp 0.5s ease' : 'none' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes livering{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.8);opacity:0}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.4}}
        .ov-card{transition:transform 0.18s,box-shadow 0.18s}
        .ov-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.1)!important}
      `}</style>

      {/* Hero banner */}
      <div style={{ background: `linear-gradient(135deg,${ACCENT2},${ACCENT},#22c55e)`, borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{greeting}, {user.name || 'Arjun Mehta'} 👋</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{user.role || 'Plant Manager'} · {user.companyName || 'FMCG Corp India'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <LiveClock />
            <LivePulse color="#86efac" label="Live data" />
            <button onClick={() => { const a = document.createElement('a'); a.href = 'data:text/csv,Metric,Value'; a.download = 'dashboard_snapshot.csv'; a.click() }}
              style={{ fontSize: 11, padding: '4px 11px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Export Snapshot
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
          {[{ l: 'Open Work Orders', v: '4' }, { l: 'Pending Approvals', v: '3' }, { l: 'AI Recommendations', v: '8' }, { l: 'Current Shift', v: 'Day A' }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px', borderTop: `3px solid ${k.color}`, animationDelay: `${i*60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</span>
              <TrendChip value={k.trend.replace(/[+\-▲▼%]/, '')} suffix="" up={k.up} neutral={!k.trend.includes('%')} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                <AnimNumber value={typeof k.value === 'number' ? k.value : parseFloat(k.value)} decimals={k.decimals} />
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{k.unit}</span>
            </div>
            <Sparkline data={k.data} color={k.color} height={44} />
          </div>
        ))}
      </div>

      {/* Line status + OEE ring + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 320px', gap: 16, marginBottom: 16 }}>

        {/* Line status */}
        <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Production line status</div>
            <LivePulse color="#10b981" size={7} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {live.lines.map((ln, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: ln.status === 'running' ? '#10b981' : ln.status === 'idle' ? '#94a3b8' : '#f59e0b' }} />
                <div style={{ fontSize: 11, fontWeight: 500, color: '#1e293b', width: 150, flexShrink: 0 }}>{ln.name}</div>
                <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ln.eff}%`, background: ln.eff >= 90 ? ACCENT : '#f59e0b', borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: ln.status === 'running' ? '#1e293b' : '#94a3b8', width: 36, textAlign: 'right', flexShrink: 0 }}>
                  {ln.status === 'running' ? `${ln.eff}%` : ln.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OEE ring */}
        <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12, textAlign: 'center' }}>Plant OEE</div>
          <RingGauge value={live.oee.plant} max={100} size={130} color={live.oee.plant >= 90 ? ACCENT : '#f59e0b'} label="OEE" sublabel="Target: 90%" />
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[['A', live.oee.avail, '#3b82f6'], ['P', live.oee.perf, '#f59e0b'], ['Q', live.oee.quality, '#10b981']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v.toFixed(1)}%</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Active alerts</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, background: '#fef2f2', padding: '2px 8px', borderRadius: 20 }}>{live.kpis.pendingAlerts - dismissedAlerts.size} open</span>
              <button onClick={() => setDismissedAlerts(new Set([0,1,2,3,4]))} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}>Clear</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {live.alerts.filter((_, i) => !dismissedAlerts.has(i)).map((a, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: '#f8fafc', borderLeft: `3px solid ${sevColors[a.sev]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#1e293b', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{a.msg}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{a.time}</div>
                </div>
                <button onClick={() => setDismissedAlerts(prev => new Set([...prev, i]))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top SKUs + AI recs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Top SKUs by production today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {live.topSKUs.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#1e293b' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{s.units.toLocaleString()}</span>
                </div>
                <ProgressBar value={s.pct} color={s.color} height={6} />
              </div>
            ))}
          </div>
        </div>

        <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>AI recommendations</div>
            <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600, background: '#e6f7f0', padding: '2px 8px', borderRadius: 20 }}>8 new</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiRecs.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 9, background: '#f8fafc', border: '1px solid #e8ecf1', transition: 'background 0.15s' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{r.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                  <TrendChip value={r.priority} suffix="" up={r.priority === 'high'} neutral={r.priority === 'medium'} />
                  <button style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', background: ACCENT + '20', color: ACCENT, fontWeight: 600 }}>Take Action</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="ov-card" style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>My tasks</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 10 }}>
          {tasks.map((t, i) => (
            <div key={i} onClick={() => setDoneTasks(prev => new Set([...prev, i]))}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 9, background: doneTasks.has(i) ? '#f8fafc' : '#fff', border: '1px solid #e8ecf1', opacity: doneTasks.has(i) ? 0.45 : 1, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${doneTasks.has(i) ? ACCENT : '#e2e8f0'}`, background: doneTasks.has(i) ? ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                {doneTasks.has(i) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1e293b', marginBottom: 3, textDecoration: doneTasks.has(i) ? 'line-through' : 'none' }}>{t.task}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <TrendChip value={t.pri} suffix="" up={false} neutral={t.pri === 'medium' || t.pri === 'low'} />
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{t.due}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
