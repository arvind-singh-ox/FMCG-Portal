'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { ProgressBar, BarChart, LivePulse } from '@/components/industries/fmcg/components/Charts'
const ACCENT = '#605dba'
const TABS = ['ERP — SAP / Tally', 'IoT & Sensor Hub', 'Communication APIs', 'Hardware & RFID']

export default function Integrations({ defaultTab = 'erp' }) {
  const tm = { erp: 0, iot: 1, comm: 2, hardware: 3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Integrations</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>ERP, IoT sensors, communication APIs and hardware connections</div>
      </div>
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === i ? 600 : 400, background: tab === i ? '#fff' : 'transparent', color: tab === i ? '#1e293b' : '#64748b', boxShadow: tab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>
      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}
      {tab === 0 && <ERPIntegration />}
      {tab === 1 && <IoTSensors />}
      {tab === 2 && <CommunicationAPIs />}
      {tab === 3 && <HardwareRFID />}
    </div>
  )
}

function IntegCard({ icon, name, type, status, desc, lastSync, details, onSync=()=>{}, onTest=()=>{}, onConfigure=()=>{} }) {
  const sc = { connected: [ACCENT, '#ededfa'], error: ['#ef4444', '#fef2f2'], syncing: ['#3b82f6', '#eff6ff'], disabled: ['#94a3b8', '#f1f5f9'] }
  return (
    <div style={{ background: '#fff', border: `1px solid ${(sc[status]||['#64748b','#f1f5f9'])[0]}40`, borderRadius: 12, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: (sc[status]||['#64748b','#f1f5f9'])[1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{type}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: (sc[status]||['#64748b','#f1f5f9'])[0], background: (sc[status]||['#64748b','#f1f5f9'])[1], padding: '3px 10px', borderRadius: 20 }}>
          {status === 'connected' ? '● ' : status === 'syncing' ? '⟳ ' : status === 'error' ? '✕ ' : '○ '}
          {status}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>{desc}</div>
      {details && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        {details.map(([l, v]) => (
          <div key={l} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>{l}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{v}</div>
          </div>
        ))}
      </div>}
      <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
        Last sync: {lastSync}
      </div>
    </div>
  )
}

function ERPIntegration({ mkSync, mkTest, mkCfg }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ l: 'Connected ERPs', v: '2', c: ACCENT }, { l: 'Records Synced', v: '12,842', c: '#3b82f6' }, { l: 'Sync Errors', v: '0', c: ACCENT }, { l: 'Last Sync', v: '4 min ago', c: '#8b5cf6' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 10, padding: 16, borderTop: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <IntegCard onSync={mkSync("SAP ERP")} onTest={mkTest("SAP ERP")} onConfigure={mkCfg("SAP ERP")} icon="🏢" name="SAP ERP S/4HANA" type="Enterprise Resource Planning" status="connected" desc="Full bidirectional sync for purchase orders, inventory, billing, and financial data. OData API integration via RFC connection." lastSync="2 min ago" details={[['Protocol', 'OData v4 / RFC'], ['Sync frequency', 'Every 5 min'], ['Records/day', '4,820'], ['Module', 'MM, FI, SD, PP']]} />
        <IntegCard onSync={mkSync("Tally")} onTest={mkTest("Tally")} onConfigure={mkCfg("Tally")} icon="📊" name="Tally Prime 4.0" type="Accounting & GST" status="connected" desc="GST invoice sync, voucher entries, accounts payable/receivable integration with auto-reconciliation." lastSync="8 min ago" details={[['Protocol', 'Tally XML API'], ['Sync frequency', 'Every 15 min'], ['Vouchers/day', '284'], ['GST sync', 'GSTR-1, GSTR-3B']]} />
        <IntegCard onSync={mkSync("GSTN API")} onTest={mkTest("GSTN API")} onConfigure={mkCfg("GSTN API")} icon="🧾" name="GST Portal (GSTN)" type="Tax Compliance" status="connected" desc="Direct API integration with GSTN for e-invoicing (IRN), e-waybill generation, and return filing." lastSync="1 hr ago" details={[['Protocol', 'GSTN REST API'], ['E-invoices/day', '142'], ['E-waybills/day', '38'], ['Return filing', 'Auto GSTR-1']]} />
        <IntegCard onSync={mkSync("HDFC Bank")} onTest={mkTest("HDFC Bank")} onConfigure={mkCfg("HDFC Bank")} icon="🏦" name="HDFC Bank API" type="Banking & Payments" status="syncing" desc="Payment initiation, NEFT/RTGS for vendor payments, bank statement reconciliation." lastSync="Syncing now..." details={[['Protocol', 'NetBanking API'], ['Payments/day', '18'], ['Bank', 'HDFC Corporate'], ['UPI', 'Enabled']]} />
      </div>
    </div>
  )
}

function IoTSensors({ mkSync, mkTest, mkCfg }) {
  const live = useLiveData()
  const sensors = live.sensors || []
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setLastUpdated(Date.now())
    setElapsed(0)
  }, [live.tick])

  useEffect(() => {
    const id = setInterval(() => setElapsed(prev => prev + 0.1), 100)
    return () => clearInterval(id)
  }, [lastUpdated])

  const online   = sensors.filter(s => s.status === 'online').length
  const alerting = sensors.filter(s => s.alert).length
  const warning  = sensors.filter(s => s.warn).length
  const normal   = sensors.filter(s => !s.alert && !s.warn).length

  const filtered = sensors.filter(s => {
    const q = search.toLowerCase()
    const ms = !q || s.name?.toLowerCase().includes(q) || s.loc?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q)
    const mf = filter === 'all' || (filter === 'alert' && s.alert) || (filter === 'warn' && s.warn) || (filter === 'normal' && !s.alert && !s.warn)
    return ms && mf
  })

  const typeColors = {
    Temperature: { icon: '🌡️', color: '#ef4444', bg: '#fef2f2' },
    Humidity:    { icon: '💧', color: '#3b82f6', bg: '#eff6ff' },
    Vibration:   { icon: '📳', color: '#8b5cf6', bg: '#f5f3ff' },
    Current:     { icon: '⚡', color: '#f59e0b', bg: '#fffbeb' },
    Flow:        { icon: '🌊', color: '#0ea5e9', bg: '#f0f9ff' },
    Pressure:    { icon: '🔵', color: '#6366f1', bg: '#eef2ff' },
    Speed:       { icon: '⚙️', color: '#10b981', bg: '#f0fdf4' },
    Level:       { icon: '📊', color: '#f97316', bg: '#fff7ed' },
  }

  return (
    <div>
      <style>{`
        @keyframes alertpulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}70%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes warnpulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.3)}70%{box-shadow:0 0 0 6px rgba(245,158,11,0)}}
        @keyframes valueblink{0%,100%{opacity:1}45%,55%{opacity:0.5}}
        .sensor-alert{animation:alertpulse 1.8s ease-in-out infinite}
        .sensor-warn{animation:warnpulse 2.5s ease-in-out infinite}
        .val-alert{animation:valueblink 1.8s ease-in-out infinite}
      `}</style>

      {/* Header with live stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>IoT Sensor Hub — Live Monitoring</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ position: 'relative', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'alertpulse 1.5s ease-out infinite' }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
            </span>
            <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
              Live · Updated {elapsed.toFixed(1)}s ago · Tick #{live.tick}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {new Date(live.ts || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' })} IST
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={mkSync('All IoT Sensors')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#64748b' }}>Sync All</button>
          <button onClick={mkTest('Sensor Hub')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#64748b' }}>Diagnostics</button>
          <button onClick={() => { const a = document.createElement('a'); a.href = 'data:text/csv,ID,Name,Value,Status'; a.download = 'sensor_readings.csv'; a.click() }} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: '#1a9b6c', color: '#fff' }}>Export Data</button>
        </div>
      </div>

      {/* Big summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total Sensors', v: sensors.length, sub: '18 active nodes', c: '#1a9b6c', bg: '#e6f7f0', icon: '📡' },
          { l: 'Online', v: `${online}/${sensors.length}`, sub: `${sensors.length - online} offline`, c: '#10b981', bg: '#f0fdf4', icon: '✅' },
          { l: 'Alert State', v: alerting, sub: alerting > 0 ? 'Requires attention' : 'All normal', c: alerting > 0 ? '#ef4444' : '#10b981', bg: alerting > 0 ? '#fef2f2' : '#f0fdf4', icon: alerting > 0 ? '🚨' : '✅' },
          { l: 'Warning State', v: warning, sub: warning > 0 ? 'Near threshold' : 'No warnings', c: warning > 0 ? '#f59e0b' : '#10b981', bg: warning > 0 ? '#fffbeb' : '#f0fdf4', icon: warning > 0 ? '⚠️' : '✅' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.c}30`, borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${s.c}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{s.l}</div>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, marginBottom: 2, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sensors, type, location…"
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
        {[['all', `All (${sensors.length})`, '#1a9b6c'], ['alert', `Alert (${alerting})`, '#ef4444'], ['warn', `Warning (${warning})`, '#f59e0b'], ['normal', `Normal (${normal})`, '#10b981']].map(([k, label, col]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === k ? col : '#e2e8f0'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === k ? col : '#fff', color: filter === k ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Sensor cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {filtered.map((s, i) => {
          const tc = typeColors[s.type] || { icon: '📊', color: '#64748b', bg: '#f8fafc' }
          const borderCol = s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#e8ecf1'
          const bgCol     = s.alert ? '#fff5f5' : s.warn ? '#fffbf0' : '#fff'
          const pct = Math.min(Math.max(s.pct || 0, 0), 100)
          const barColor = s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#1a9b6c'
          return (
            <div key={i} className={s.alert ? 'sensor-alert' : s.warn ? 'sensor-warn' : ''}
              style={{ background: bgCol, border: `1px solid ${borderCol}`, borderRadius: 12, padding: '14px 16px', borderTop: `3px solid ${borderCol}`, transition: 'background 0.3s' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{tc.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.id} · {s.loc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  {s.alert && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>⚠ ALERT</span>}
                  {s.warn && !s.alert && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: '#fffbeb', padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>⚠ WARN</span>}
                  {!s.alert && !s.warn && <span style={{ fontSize: 10, fontWeight: 600, color: '#1a9b6c', background: '#e6f7f0', padding: '2px 7px', borderRadius: 20 }}>Normal</span>}
                </div>
              </div>

              {/* Live value — BIG */}
              <div className={s.alert ? 'val-alert' : ''} style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#1e293b', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s', letterSpacing: '-0.5px' }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{s.type}</span>
              </div>

              {/* Threshold bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 3 }}>
                  <span>Min</span>
                  <span style={{ fontWeight: 600, color: barColor }}>Threshold: {s.alertThresh}{s.unit}</span>
                  <span>Max</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'visible', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.8s ease, background 0.3s' }} />
                  {/* Threshold marker */}
                  <div style={{ position: 'absolute', top: -2, left: '80%', width: 2, height: 10, background: '#94a3b8', borderRadius: 1 }} />
                </div>
              </div>

              {/* Footer — updated time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                  Updated {elapsed.toFixed(1)}s ago
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                  {new Date(s.updatedAt || live.ts || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sensor table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e8ecf1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Sensor data table — {filtered.length} sensors</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Auto-refreshing every 3s</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              {['Sensor ID', 'Name', 'Location', 'Type', 'Live Reading', 'Threshold', '% of Limit', 'Status', 'Updated At'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((s, i) => {
                const tc = typeColors[s.type] || { color: '#64748b', bg: '#f8fafc' }
                const pct = Math.min(Math.round(s.pct || 0), 100)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: s.alert ? '#fff5f5' : s.warn ? '#fffbf0' : 'transparent', transition: 'background 0.3s' }}>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: '#94a3b8', fontSize: 11 }}>{s.id}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                    <td style={{ padding: '9px 14px', color: '#64748b' }}>{s.loc}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: tc.color, background: tc.bg, padding: '2px 7px', borderRadius: 20 }}>{s.type}</span>
                    </td>
                    <td style={{ padding: '9px 14px', fontWeight: 800, fontSize: 13, color: s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#1e293b', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>
                      {s.value}
                    </td>
                    <td style={{ padding: '9px 14px', color: '#64748b' }}>{s.alertThresh}{s.unit}</td>
                    <td style={{ padding: '9px 14px', width: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#1a9b6c', borderRadius: 3, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: s.alert ? '#ef4444' : s.warn ? '#f59e0b' : '#64748b', width: 28 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      {s.alert
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 20 }}>⚠ Alert</span>
                        : s.warn
                        ? <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: 20 }}>⚠ Warn</span>
                        : <span style={{ fontSize: 11, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>✓ Normal</span>}
                    </td>
                    <td style={{ padding: '9px 14px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 10, whiteSpace: 'nowrap' }}>
                      {new Date(s.updatedAt || live.ts || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function CommunicationAPIs({ mkSync, mkTest, mkCfg }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <IntegCard onSync={mkSync("WhatsApp")} onTest={mkTest("WhatsApp")} onConfigure={mkCfg("WhatsApp")} icon="💬" name="WhatsApp Business API" type="Meta WABA" status="connected" desc="Automated order confirmations, dispatch alerts, and production reports sent directly to distributor WhatsApp." lastSync="Active" details={[['Provider', 'Meta Cloud API'], ['Messages today', '284'], ['Templates', '12 active'], ['Delivery rate', '99.2%']]} />
      <IntegCard onSync={mkSync("SMS")} onTest={mkTest("SMS")} onConfigure={mkCfg("SMS")} icon="📱" name="SMS Gateway — Textlocal" type="SMS API" status="connected" desc="OTP authentication, low-stock alerts, payment reminders, and shift notifications via SMS." lastSync="Active" details={[['Provider', 'Textlocal India'], ['SMS today', '142'], ['DLT registered', 'Yes'], ['Delivery rate', '98.4%']]} />
      <IntegCard onSync={mkSync("SMTP")} onTest={mkTest("SMTP")} onConfigure={mkCfg("SMTP")} icon="📧" name="SMTP Email (Google Workspace)" type="Email API" status="connected" desc="Automated QC reports, compliance documents, PO approvals and daily summary emails." lastSync="2 min ago" details={[['Provider', 'Google SMTP'], ['Emails today', '48'], ['Templates', '8 active'], ['Domain', 'fmcgcorp.in']]} />
      <IntegCard onSync={mkSync("Push")} onTest={mkTest("Push")} onConfigure={mkCfg("Push")} icon="🔔" name="Push Notifications (FCM)" type="Firebase Cloud" status="connected" desc="Real-time push alerts to mobile app for production alerts, machine breakdowns, and approval requests." lastSync="Active" details={[['Provider', 'Firebase FCM'], ['Devices', '24 active'], ['Alerts today', '18'], ['Avg latency', '320ms']]} />
    </div>
  )
}

function HardwareRFID({ mkSync, mkTest, mkCfg }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <IntegCard icon="📦" name="RFID Tracking System" type="Warehouse RFID" status="connected" desc="UHF RFID readers at warehouse entry/exit for automatic finished goods tracking and inventory count." lastSync="Live" details={[['Protocol', 'EPC Gen2 UHF'], ['Readers', '8 active'], ['Tags scanned/hr', '2,400'], ['Coverage', 'WH-A, WH-B']]} />
      <IntegCard icon="📷" name="Barcode / QR Scanner" type="Inventory Scanning" status="connected" desc="Handheld scanners and fixed scanners for GRN, dispatch, and inventory movement tracking." lastSync="Live" details={[['Protocol', 'GS1 / QR Code'], ['Scanners', '12 units'], ['Scans today', '4,820'], ['Accuracy', '99.98%']]} />
      <IntegCard onSync={mkSync("Biometric")} onTest={mkTest("Biometric")} onConfigure={mkCfg("Biometric")} icon="👆" name="Biometric Attendance" type="Access & Attendance" status="connected" desc="Fingerprint-based attendance system integrated with workforce management for shift tracking." lastSync="Continuous" details={[['Devices', '6 terminals'], ['Employees', '284 enrolled'], ['Today clock-ins', '178'], ['Mode', 'Fingerprint + Face']]} />
      <IntegCard icon="🔌" name="PLC / SCADA Interface" type="Factory Automation" status="connected" desc="OPC-UA protocol connection to Siemens PLCs and SCADA system for real-time machine data acquisition." lastSync="4 sec ago" details={[['Protocol', 'OPC-UA + Modbus'], ['PLCs connected', '12'], ['Tags monitored', '840'], ['Scan rate', '1 sec']]} />
    </div>
  )
}
