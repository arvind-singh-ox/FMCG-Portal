'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import FormModal from '@/components/industries/fmcg/components/FormModal'

const ACCENT = '#1a9b6c'
const TABS = ['User Management', 'Roles & Permissions', 'Audit Logs', 'System Config']

export default function Settings({ defaultTab = 'users' }) {
  const live = useLiveData()
  const tm = { users:0, roles:1, audit:2, config:3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null)
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Administration</div>
        <div style={{ fontSize:13, color:'#64748b' }}>User management, roles, audit trail and system configuration</div>
      </div>
      <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {TABS.map((t,i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===i?600:400, background:tab===i?'#fff':'transparent', color:tab===i?'#1e293b':'#64748b', boxShadow:tab===i?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{t}</button>
        ))}
      </div>
      {tab === 0 && <UserManagement live={live} onInvite={() => setModal('inviteUser')} />}
      {tab === 1 && <RolesPermissions live={live} onAdd={() => setModal('newRole')} />}
      {tab === 2 && <AuditLogs />}
      {tab === 3 && <SystemConfig />}
      {modal && <FormModal formKey={modal} onClose={closeModal} onSubmit={(data) => {
        if (modal === 'inviteUser') live.actions?.addUser?.(data)
        if (modal === 'newRole')    live.actions?.addRole?.(data)
        closeModal()
      }} />}
    </div>
  )
}

function UserManagement({ live, onInvite }) {
  const users = live.users || []
  const [toast, setToast] = useState('')
  const stc = { active:[ACCENT,'#e6f7f0'], inactive:['#94a3b8','#f1f5f9'] }
  return (
    <div>
      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Total Users',  v:users.length,                                    c:ACCENT    },
          { l:'Active',       v:users.filter(u=>u.status==='active').length,     c:'#10b981' },
          { l:'Inactive',     v:users.filter(u=>u.status==='inactive').length,   c:'#94a3b8' },
          { l:'Departments',  v:new Set(users.map(u=>u.dept)).size,              c:'#3b82f6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>Portal Users</div>
          <button onClick={onInvite} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Invite User</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['User','Email','Role','Department','Status','Last Login','Logins','Actions'].map(h => (
              <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map((u,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:u._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:ACCENT+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:ACCENT, flexShrink:0 }}>
                      {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <span style={{ fontWeight:600, color:'#1e293b' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>{u.email}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{u.role}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{u.dept}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:(stc[u.status]||['#64748b','#f1f5f9'])[0], background:(stc[u.status]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20 }}>{u.status}</span></td>
                <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:12 }}>{u.last}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{u.loginCount ?? '—'}</td>
                <td style={{ padding:'12px 16px', display:'flex', gap:6 }}>
                  <button onClick={() => setToast(`Editing ${u.name} — profile form opened`)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', color:'#64748b' }}>Edit</button>
                  <button onClick={() => { live.actions?.updateUser?.(u.id, {status: u.status==='active'?'inactive':'active'}); setToast(`${u.name} ${u.status==='active'?'disabled':'re-enabled'}`) }} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:`1px solid ${u.status==='active'?'#fecaca':'#bbf7d0'}`, background:u.status==='active'?'#fff7f7':'#f0fdf4', cursor:'pointer', color:u.status==='active'?'#ef4444':'#1a9b6c', fontWeight:600 }}>{u.status==='active'?'Disable':'Enable'}</button>
                  <button onClick={() => setToast(`Password reset email sent to ${u.email}`)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', color:'#64748b' }}>Reset PW</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RolesPermissions({ live, onAdd }) {
  const roles = live.roles || []
  const lcColors = { 'Full access':[ACCENT,'#e6f7f0'], 'Read + Write':['#3b82f6','#eff6ff'], 'Read only':['#94a3b8','#f1f5f9'], 'Read only + Log':['#8b5cf6','#f5f3ff'] }
  return (
    <div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>Access Roles ({roles.length} roles)</div>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ New Role</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Role ID','Role Name','Users','Module Access','Permission Level','Action'].map(h => (
              <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {roles.map((r,i) => {
              const lc = lcColors[r.level] || ['#64748b','#f1f5f9']
              return (
                <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:r._user?'#f0fdf4':'transparent' }}>
                  <td style={{ padding:'12px 16px', fontFamily:'monospace', color:'#94a3b8', fontSize:11 }}>{r.id}</td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'#1e293b' }}>{r.role}</td>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:ACCENT }}>{r.users}</td>
                  <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>{r.modules}</td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:lc[0], background:lc[1], padding:'3px 10px', borderRadius:20 }}>{r.level}</span></td>
                  <td style={{ padding:'12px 16px' }}><button style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e8ecf1', background:'transparent', cursor:'pointer', color:'#64748b' }}>Edit</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AuditLogs() {
  const logs = [
    { time:'10:42:18', user:'Arjun Mehta',   action:'Approved dispatch DSP-2026-1289 for Krishna Agencies, Udaipur — ₹8.42L',       module:'Supply Chain', ip:'192.168.1.42' },
    { time:'10:18:44', user:'Pooja Sharma',  action:'Flagged Batch BT-2026-0416 microbiological failure — QC hold raised',           module:'Quality',      ip:'192.168.1.18' },
    { time:'09:58:30', user:'Suresh Patel',  action:'Started Batch BT-2026-0422 on Line 1 — Bourbon Biscuits 150g target 4,800 units',module:'Production',  ip:'192.168.1.22' },
    { time:'09:40:12', user:'Arjun Mehta',   action:'Approved QC certificate for Batch BT-2026-0421 — cleared for dispatch',        module:'Quality',      ip:'192.168.1.42' },
    { time:'09:22:05', user:'Deepak Kumar',  action:'Raised WO-2026-1145 — Blending Tank BT1 motor bearing failure (critical)',     module:'Maintenance',  ip:'192.168.1.35' },
    { time:'09:14:22', user:'Priya Agarwal', action:'Updated raw material stock — Palm Oil 10 MT received from Saffola Agro',       module:'Inventory',    ip:'192.168.1.28' },
    { time:'08:52:14', user:'Pooja Sharma',  action:'Created 6 QC test records for Batch BT-2026-0422 — all parameters logged',    module:'Quality',      ip:'192.168.1.18' },
    { time:'08:41:06', user:'Suresh Patel',  action:'Updated Line 3 production plan — increased target by 2,000 units to 10,000',  module:'Production',   ip:'192.168.1.22' },
    { time:'08:22:48', user:'System',        action:'SAP ERP sync completed — 284 purchase orders and 1,420 inventory records updated', module:'Integration',ip:'system'     },
    { time:'07:58:33', user:'Arjun Mehta',   action:'Created PO-2026-0850 — Aashirvaad Mills, 25 MT wheat flour, ₹7.12L',          module:'Supply Chain', ip:'192.168.1.42' },
    { time:'07:44:20', user:'Ramesh Yadav',  action:'Confirmed DSP-2026-1292 loaded and departed — Sharma Traders, Jaipur',        module:'Dispatch',     ip:'192.168.1.50' },
    { time:'07:30:15', user:'Deepak Kumar',  action:'Completed WO-2026-1143 — Conveyor Belt CB4 replaced, alignment tested OK',    module:'Maintenance',  ip:'192.168.1.35' },
    { time:'07:12:08', user:'Deepa Nair',    action:'Logged 3 AI vision defects — seal jaw wear confirmed on Line 6, CAM-06',      module:'Quality',      ip:'192.168.1.19' },
    { time:'06:55:44', user:'Suresh Patel',  action:'Closed Batch BT-2026-0420 Lays Chips 26g — 8,000 units complete, 99.1% yield',module:'Production',  ip:'192.168.1.22' },
    { time:'06:15:02', user:'System',        action:'AI Demand Forecast retrained — accuracy improved 91.8% → 93.4% (new model)',   module:'AI Analytics', ip:'system'       },
    { time:'05:30:00', user:'System',        action:'Cold storage alert — Cold Room B temperature +2.1°C above setpoint for 20 min',module:'Inventory',   ip:'system'       },
    { time:'02:00:00', user:'System',        action:'Automated PO approval reminder — 3 POs pending approval older than 48 hrs',   module:'Supply Chain', ip:'system'       },
    { time:'00:30:00', user:'System',        action:'IoT sensor health check passed — 84/84 sensors online, 0 offline or degraded', module:'Integration', ip:'system'       },
    { time:'00:01:00', user:'System',        action:'Nightly backup completed successfully — 2.4 GB, checksum verified, 6 s duration',module:'System',    ip:'system'       },
  ]
  const mc = { Quality:[ACCENT,'#e6f7f0'], Production:['#3b82f6','#eff6ff'], Integration:['#8b5cf6','#f5f3ff'], 'Supply Chain':['#f59e0b','#fffbeb'], Maintenance:['#ec4899','#fdf2f8'], 'AI Analytics':['#10b981','#f0fdf4'], System:['#94a3b8','#f1f5f9'], Inventory:['#0ea5e9','#f0f9ff'], Dispatch:['#f97316','#fff7ed'] }
  return (
    <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:14, fontWeight:600 }}>Audit Log — Today ({logs.length} entries)</div>
        <button onClick={() => {
          const rows = [['Time','User','Action','Module','IP'],
            ...logs.map(l=>[l.time,l.user,`"${l.action}"`,l.module,l.ip])]
          const blob = new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})
          const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='audit_log_25mar2026.csv'; a.click()
        }} style={{ fontSize:12, padding:'6px 14px', borderRadius:7, border:'1px solid #e2e8f0', background:'transparent', cursor:'pointer', color:'#64748b' }}>Export CSV</button>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead><tr style={{ background:'#f8fafc' }}>
          {['Time','User','Action','Module','IP Address'].map(h => (
            <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {logs.map((l,i) => (
            <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
              <td style={{ padding:'10px 16px', fontFamily:'monospace', color:'#94a3b8', fontSize:12, whiteSpace:'nowrap' }}>{l.time}</td>
              <td style={{ padding:'10px 16px', fontWeight:500, color:l.user==='System'?'#94a3b8':'#1e293b', whiteSpace:'nowrap' }}>{l.user}</td>
              <td style={{ padding:'10px 16px', color:'#64748b', fontSize:12 }}>{l.action}</td>
              <td style={{ padding:'10px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:(mc[l.module]||['#94a3b8','#f1f5f9'])[0], background:(mc[l.module]||['#94a3b8','#f1f5f9'])[1], padding:'2px 8px', borderRadius:20, whiteSpace:'nowrap' }}>{l.module}</span></td>
              <td style={{ padding:'10px 16px', fontFamily:'monospace', color:'#94a3b8', fontSize:11 }}>{l.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SystemConfig() {
  const [enabled, setEnabled] = useState({ 'Email Alerts':true, 'WhatsApp Dispatch Alerts':true, 'SMS OTP Authentication':true, 'Critical Alert Escalation':true, 'Two-Factor Authentication':true })
  const [configToast, setConfigToast] = useState('')
  const toggleSetting = (key) => {
    setEnabled(prev => { const next = { ...prev, [key]: !prev[key] }; return next })
    setConfigToast(`${key} ${enabled[key] ? 'disabled' : 'enabled'}`)
    setTimeout(() => setConfigToast(''), 2500)
  }
  const configs = [
    { group:'Portal',         key:'Portal Name',                 value:'FMCG Operations Portal',  type:'text'    },
    { group:'Portal',         key:'Company Name',                value:'FMCG Corp India Pvt Ltd', type:'text'    },
    { group:'Portal',         key:'Plant Location',              value:'Sitapura Industrial Area, Jaipur, Rajasthan', type:'text' },
    { group:'Portal',         key:'Financial Year',              value:'April 2026 – March 2027', type:'text'    },
    { group:'Notifications',  key:'Email Alerts',                value:'Enabled',                 type:'toggle'  },
    { group:'Notifications',  key:'WhatsApp Dispatch Alerts',    value:'Enabled',                 type:'toggle'  },
    { group:'Notifications',  key:'SMS OTP Authentication',      value:'Enabled',                 type:'toggle'  },
    { group:'Notifications',  key:'Critical Alert Escalation',   value:'Enabled',                 type:'toggle'  },
    { group:'Integrations',   key:'SAP ERP Sync Frequency',      value:'Every 5 minutes',         type:'select'  },
    { group:'Integrations',   key:'GSTN e-Invoice API',          value:'Connected',               type:'status'  },
    { group:'Integrations',   key:'HDFC Bank Payment API',       value:'Connected',               type:'status'  },
    { group:'Integrations',   key:'IoT Sensor Hub IP',           value:'192.168.1.100:8080',      type:'text'    },
    { group:'Security',       key:'Session Timeout',             value:'8 hours',                 type:'select'  },
    { group:'Security',       key:'Two-Factor Authentication',   value:'Enabled',                 type:'toggle'  },
    { group:'Security',       key:'Audit Log Retention',         value:'365 days',                type:'select'  },
    { group:'Security',       key:'API Key Last Rotated',        value:'15 Mar 2026',             type:'text'    },
  ]
  const groups = [...new Set(configs.map(c=>c.group))]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {configToast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:4, fontSize:13, color:'#166534', fontWeight:500 }}>✓ {configToast}</div>}
      {groups.map(g => (
        <div key={g} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', borderBottom:'1px solid #e8ecf1', fontSize:13, fontWeight:700, color:'#1e293b', background:'#f8fafc' }}>{g}</div>
          {configs.filter(c=>c.group===g).map((c,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', borderBottom:'1px solid #f8fafc' }}>
              <div style={{ fontSize:13, color:'#64748b' }}>{c.key}</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {c.type === 'toggle' ? (
                  <div style={{ width:38, height:20, borderRadius:10, background:ACCENT, display:'flex', alignItems:'center', padding:'2px', cursor:'pointer' }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', marginLeft:'auto' }}/>
                  </div>
                ) : c.type === 'status' ? (
                  <span style={{ fontSize:12, fontWeight:600, color:ACCENT, background:'#e6f7f0', padding:'3px 10px', borderRadius:20 }}>{c.value}</span>
                ) : (
                  <span style={{ fontSize:13, fontWeight:500, color:'#1e293b' }}>{c.value}</span>
                )}
                <button onClick={() => { }} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', background:'transparent', cursor:'pointer', color:'#64748b' }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
