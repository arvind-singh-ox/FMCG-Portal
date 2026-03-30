'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import FormModal from '@/components/industries/fmcg/components/FormModal'
import { AnimNumber, ProgressBar, BarChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const TABS = ['Asset Health', 'Preventive Maintenance', 'Work Orders', 'Spare Parts']

export default function Maintenance({ defaultTab = 'assets' }) {
  const live = useLiveData()
  const tm = { assets:0, pm:1, wo:2, spare:3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null)
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Maintenance</div>
        <div style={{ fontSize:13, color:'#64748b' }}>Asset health, preventive schedules, work orders and spare parts inventory</div>
      </div>
      <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {TABS.map((t,i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===i?600:400, background:tab===i?'#fff':'transparent', color:tab===i?'#1e293b':'#64748b', boxShadow:tab===i?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{t}</button>
        ))}
      </div>
      {tab === 0 && <AssetHealth live={live} />}
      {tab === 1 && <PreventiveMaintenance live={live} onAdd={() => setModal('schedulePM')} />}
      {tab === 2 && <WorkOrders live={live} onAdd={() => setModal('newWorkOrder')} />}
      {tab === 3 && <SpareParts live={live} onAdd={() => setModal('addSparePart')} />}
      {modal && <FormModal formKey={modal} onClose={closeModal} onSubmit={(data) => {
        if (modal === 'schedulePM')   live.actions?.addPMSchedule?.(data)
        if (modal === 'newWorkOrder') live.actions?.addWorkOrder?.(data)
        if (modal === 'addSparePart') live.actions?.addSparePart?.(data)
        closeModal()
      }} />}
    </div>
  )
}

function AssetHealth({ live }) {
  const machines = live.machines
  const statusColors = { running:'#10b981', warning:'#f59e0b', maintenance:'#94a3b8', stopped:'#ef4444' }
  const getHealth = m => m.status==='maintenance' ? 0 : m.status==='warning' ? Math.round(40+m.load*0.45) : Math.round(75+m.load*0.24)
  const getGrade  = h => h>=90?'good':h>=65?'watch':h>0?'critical':'maintenance'
  const sc = { good:[ACCENT,'#e6f7f0'], watch:['#f59e0b','#fffbeb'], critical:['#ef4444','#fef2f2'], maintenance:['#94a3b8','#f1f5f9'] }
  const pmDue = ['15 Apr','28 Mar','10 Apr','2 Apr','20 Apr','25 Apr','30 Apr','In maintenance']
  const assets = machines.map((m,i) => ({ ...m, health:getHealth(m), nextPM:pmDue[i]||'1 Apr' }))
  const counts = { good:assets.filter(a=>getGrade(a.health)==='good').length, watch:assets.filter(a=>getGrade(a.health)==='watch').length, critical:assets.filter(a=>getGrade(a.health)==='critical').length, maintenance:assets.filter(a=>a.status==='maintenance').length }
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Healthy Assets', v:counts.good,       c:ACCENT    },
          { l:'Watch Required', v:counts.watch,      c:'#f59e0b' },
          { l:'Critical',       v:counts.critical,   c:'#ef4444' },
          { l:'In Maintenance', v:counts.maintenance,c:'#94a3b8' }
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {assets.map((a,i) => {
          const grade = getGrade(a.health)
          const col = sc[grade] || ['#64748b','#f1f5f9']
          return (
            <div key={i} style={{ background:'#fff', border:`1px solid ${col[0]}40`, borderRadius:12, padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{a.name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{a.line}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:col[0], background:col[1], padding:'3px 10px', borderRadius:20, height:'fit-content' }}>{grade}</span>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'#64748b' }}>Health Score</span>
                  <span style={{ fontSize:12, fontWeight:700, color:col[0] }}>{a.health}%</span>
                </div>
                <div style={{ height:8, background:'#f1f5f9', borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${a.health}%`, background:col[0], borderRadius:4, transition:'width 1s ease' }}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {[['Temp',`${a.temp}°C`, a.temp>160?'#f59e0b':'#64748b'],
                  ['Load',`${a.load}%`, a.load>95?'#f59e0b':'#64748b'],
                  ['Next PM', a.nextPM, a.nextPM==='28 Mar'?'#f59e0b':'#64748b']
                ].map(([l,v,c]) => (
                  <div key={l} style={{ background:'#f8fafc', borderRadius:6, padding:'6px 8px' }}>
                    <div style={{ fontSize:9, color:'#94a3b8', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:c, transition:'color 0.4s' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PreventiveMaintenance({ live, onAdd }) {
  const schedules = live.pmSchedules || []
  const sc = { overdue:['#ef4444','#fef2f2'], 'due-soon':['#f59e0b','#fffbeb'], 'due-today':['#8b5cf6','#f5f3ff'], scheduled:[ACCENT,'#e6f7f0'] }
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Total Schedules', v:schedules.length,                                       c:ACCENT    },
          { l:'Overdue',         v:schedules.filter(s=>s.status==='overdue').length,        c:'#ef4444' },
          { l:'Due Soon',        v:schedules.filter(s=>s.status==='due-soon').length,       c:'#f59e0b' },
          { l:'Scheduled',       v:schedules.filter(s=>s.status==='scheduled').length,      c:'#3b82f6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>PM Schedule</div>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Schedule PM</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['PM ID','Asset','Task','Frequency','Technician','Last Done','Next Due','Est. Time','Status'].map(h => (
              <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {schedules.map((s,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:s._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'11px 16px', fontFamily:'monospace', color:'#94a3b8', fontSize:11 }}>{s.id}</td>
                <td style={{ padding:'11px 16px', fontWeight:600, color:'#1e293b' }}>{s.asset}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{s.task}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{s.freq}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{s.tech}</td>
                <td style={{ padding:'11px 16px', color:'#94a3b8', fontSize:12 }}>{s.lastDone}</td>
                <td style={{ padding:'11px 16px', fontWeight:500, color:'#1e293b' }}>{s.nextDue}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{s.estTime ? `${s.estTime} hrs` : '—'}</td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:(sc[s.status]||['#64748b','#f1f5f9'])[0], background:(sc[s.status]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20 }}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WorkOrders({ live, onAdd }) {
  const workOrders = live.workOrders || []
  const [toast, setToast] = useState('')
  const [overrides, setOverrides] = useState({})
  const orders = workOrders.map(w => overrides[w.id] ? { ...w, ...overrides[w.id] } : w)
  const updateWO = (id, patch) => { setOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })); live.actions?.updateWO?.(id, patch) }
  const pc = { critical:['#ef4444','#fef2f2'], high:['#f59e0b','#fffbeb'], medium:['#3b82f6','#eff6ff'], low:['#94a3b8','#f1f5f9'] }
  const sc = { 'in-progress':[ACCENT,'#e6f7f0'], open:['#f59e0b','#fffbeb'], scheduled:['#3b82f6','#eff6ff'], completed:['#94a3b8','#f1f5f9'] }
  return (
    <div>
      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Total WOs',    v:workOrders.length,                                       c:ACCENT    },
          { l:'In Progress',  v:workOrders.filter(w=>w.status==='in-progress').length,   c:'#3b82f6' },
          { l:'Open',         v:workOrders.filter(w=>w.status==='open').length,          c:'#f59e0b' },
          { l:'Critical',     v:workOrders.filter(w=>w.priority==='critical').length,    c:'#ef4444' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {orders.map((w,i) => (
          <div key={i} style={{ background:w._user?'#f0fdf4':'#fff', border:`1px solid ${w._user?ACCENT+'40':'#e8ecf1'}`, borderRadius:12, padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:600, color:ACCENT }}>{w.id}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:(pc[w.priority]||['#64748b','#f1f5f9'])[0], background:(pc[w.priority]||['#64748b','#f1f5f9'])[1], padding:'2px 8px', borderRadius:20 }}>{w.priority}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:(sc[w.status]||['#64748b','#f1f5f9'])[0], background:(sc[w.status]||['#64748b','#f1f5f9'])[1], padding:'2px 8px', borderRadius:20 }}>{w.status}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>{w.asset}</div>
              </div>
              <div style={{ textAlign:'right', fontSize:12, color:'#94a3b8' }}>
                <div>{w.type}</div>
                <div>{w.tech}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5, marginBottom:8 }}>{w.desc}</div>
            <div style={{ display:'flex', gap:16, fontSize:11, color:'#94a3b8', marginBottom:10 }}>
              <span>Raised: {w.raised}</span>
              <span>ETA: {w.eta}</span>
              {w.cost && <span>Est. Cost: ₹{w.cost.toLocaleString()}</span>}
            </div>
            <div style={{ display:'flex', gap:7 }}>
              {w.status==='open' && <button onClick={() => { updateWO(w.id,{status:'in-progress'}); setToast(`WO ${w.id} — work started`) }} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Start Work</button>}
              {w.status==='in-progress' && <button onClick={() => { updateWO(w.id,{status:'completed'}); setToast(`WO ${w.id} completed ✓`) }} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Mark Complete</button>}
              {w.status==='scheduled' && <button onClick={() => { updateWO(w.id,{status:'open'}); setToast(`WO ${w.id} opened for assignment`) }} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer', background:'#3b82f6', color:'#fff', fontWeight:600 }}>Open</button>}
              <button onClick={() => setToast(`WO ${w.id} — spare parts list checked`)} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Check Parts</button>
              <button onClick={() => setToast(`WO ${w.id} — technician notified via WhatsApp`)} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Notify Tech</button>
              {w.status==='completed' && <span style={{ fontSize:11, color:ACCENT, fontWeight:600, alignSelf:'center' }}>✓ Closed</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, textAlign:'right' }}>
        <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ New Work Order</button>
      </div>
    </div>
  )
}

function SpareParts({ live, onAdd }) {
  const parts = live.spareParts || []
  const sc = { good:[ACCENT,'#e6f7f0'], low:['#f59e0b','#fffbeb'], critical:['#ef4444','#fef2f2'] }
  const stockValue = parts.reduce((s,p) => s + (p.stock * p.cost), 0)
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Total Parts',    v:parts.length,                                       c:ACCENT    },
          { l:'Low Stock',      v:parts.filter(p=>p.status==='low').length,           c:'#f59e0b' },
          { l:'Critical (0 stock)',v:parts.filter(p=>p.status==='critical').length,   c:'#ef4444' },
          { l:'Stock Value',    v:`₹${(stockValue/100000).toFixed(1)}L`,              c:'#3b82f6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>Spare Parts Inventory</div>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Add Part</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Part ID','Part Name','Machine(s)','Stock','Min Stock','Unit Cost','Supplier','Status','Action'].map(h => (
              <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {parts.map((p,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:p.status==='critical'?'#fff5f5':p._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'11px 16px', fontFamily:'monospace', color:'#94a3b8', fontSize:11 }}>{p.id}</td>
                <td style={{ padding:'11px 16px', fontWeight:600, color:'#1e293b' }}>{p.name}</td>
                <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{p.machine}</td>
                <td style={{ padding:'11px 16px', fontWeight:700, color:p.stock===0?'#ef4444':p.stock<=p.minStock?'#f59e0b':'#1e293b' }}>{p.stock} {p.unit}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{p.minStock} {p.unit}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>₹{p.cost.toLocaleString()}</td>
                <td style={{ padding:'11px 16px', color:'#64748b', fontSize:12 }}>{p.supplier}</td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:(sc[p.status]||['#64748b','#f1f5f9'])[0], background:(sc[p.status]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20 }}>{p.status}</span></td>
                <td style={{ padding:'11px 16px' }}><button style={{ fontSize:11, padding:'4px 12px', borderRadius:6, border:`1px solid ${(sc[p.status]||['#64748b','#f1f5f9'])[0]}50`, background:(sc[p.status]||['#64748b','#f1f5f9'])[1], cursor:'pointer', color:(sc[p.status]||['#64748b','#f1f5f9'])[0], fontWeight:600 }}>{p.status==='good'?'View':'Reorder'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
