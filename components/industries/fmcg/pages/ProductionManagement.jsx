'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import FormModal from '@/components/industries/fmcg/components/FormModal'
import { AnimNumber, ProgressBar, BarChart, DonutChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const TABS = ['Batch Tracking','Line Efficiency','Recipe Management','Production Planning']

function Toast({ msg, onDone }) {
  return msg ? (
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {msg}</span>
      <button onClick={onDone} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button>
    </div>
  ) : null
}

export default function ProductionManagement({ defaultTab = 'batch' }) {
  const live = useLiveData()
  const tm = { batch:0, line:1, recipe:2, planning:3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null)
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Production Management</div>
        <div style={{ fontSize:13, color:'#64748b' }}>Batch tracking, line efficiency, recipes and production planning</div>
      </div>
      <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===i?600:400, background:tab===i?'#fff':'transparent', color:tab===i?'#1e293b':'#64748b', boxShadow:tab===i?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{t}</button>)}
      </div>
      {tab===0 && <BatchTracking live={live} onAdd={() => setModal('newBatch')}/>}
      {tab===1 && <LineEfficiency live={live}/>}
      {tab===2 && <RecipeManagement live={live} onAdd={() => setModal('newRecipe')}/>}
      {tab===3 && <ProductionPlanning live={live}/>}
      {modal && <FormModal formKey={modal} onClose={closeModal} onSubmit={d => {
        if (modal==='newBatch')  live.actions?.addBatch?.(d)
        if (modal==='newRecipe') live.actions?.addRecipe?.(d)
        closeModal()
      }}/>}
    </div>
  )
}

function BatchTracking({ live, onAdd }) {
  const batches = live.batches || []
  const [toast, setToast] = useState('')
  const [batchOverride, setBatchOverride] = useState({})

  const stc = { running:[ACCENT,'#e6f7f0'], complete:['#3b82f6','#eff6ff'], 'on-hold':['#f59e0b','#fffbeb'] }
  const qcc = { pass:[ACCENT,'#e6f7f0'], pending:['#f59e0b','#fffbeb'], review:['#ef4444','#fef2f2'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const holdBatch = (b) => { setBatchOverride(p => ({ ...p, [b.id]:{ ...b, status:'on-hold' } })); setToast(`Batch ${b.id} put on hold`) }
  const resumeBatch = (b) => { setBatchOverride(p => { const n={...p}; delete n[b.id]; return n }); setToast(`Batch ${b.id} resumed`) }
  const approveQC = (b) => { setBatchOverride(p => ({ ...p, [b.id]:{ ...b, qc:'pass' } })); setToast(`QC passed for batch ${b.id}`) }

  const exportCSV = () => {
    const rows = [['ID','SKU','Line','Done','Total','%','Status','QC','Yield'],
      ...displayBatches.map(b => [b.id,b.sku,b.line,b.done,b.qty,b.pct+'%',b.status,b.qc,b.yield+'%'])]
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'batches.csv'; a.click()
    setToast('Batch report exported')
  }

  const displayBatches = batches.map(b => batchOverride[b.id] ? { ...b, ...batchOverride[b.id] } : b)
  const active = displayBatches.filter(b=>b.status==='running').length
  const avgYld = displayBatches.length ? (displayBatches.reduce((s,b)=>s+b.yield,0)/displayBatches.length).toFixed(1) : '—'
  const qcPend = displayBatches.filter(b=>b.qc==='pending'||b.qc==='review').length

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Active Batches', v:active, c:ACCENT },
          { l:'Completed Today', v:11, c:'#3b82f6' },
          { l:'Avg Yield', v:`${avgYld}%`, c:'#10b981' },
          { l:'QC Pending', v:qcPend, c:'#f59e0b' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>Active & recent batches</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={exportCSV} style={{ padding:'7px 13px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, fontWeight:500, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
            <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ New Batch</button>
          </div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Batch ID','SKU','Line','Done / Total','Progress','Status','QC','Yield','Actions'].map(h => <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {displayBatches.map((b) => (
              <tr key={b.id} style={{ borderBottom:'1px solid #f1f5f9', background:b._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'11px 16px', fontWeight:600, color:'#1e293b', fontFamily:'monospace', fontSize:12 }}>{b.id}{b._user&&<span style={{ marginLeft:5, fontSize:9, background:ACCENT, color:'#fff', padding:'1px 5px', borderRadius:20 }}>NEW</span>}</td>
                <td style={{ padding:'11px 16px', color:'#1e293b', fontSize:12 }}>{b.sku}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{b.line}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{b.done?.toLocaleString()} / {b.qty?.toLocaleString()}</td>
                <td style={{ padding:'11px 16px', width:130 }}><ProgressBar value={b.pct||0} color={ACCENT} height={6} showLabel /><div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>{b.done?.toLocaleString()} / {b.qty?.toLocaleString()}</div></td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(stc,b.status)[0], background:safe(stc,b.status)[1], padding:'3px 9px', borderRadius:20 }}>{b.status}</span></td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(qcc,b.qc)[0], background:safe(qcc,b.qc)[1], padding:'3px 9px', borderRadius:20 }}>{b.qc}</span></td>
                <td style={{ padding:'11px 16px', fontWeight:600, color:b.yield>=98?ACCENT:'#f59e0b' }}>{b.yield}%</td>
                <td style={{ padding:'11px 16px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {b.status==='running' && <button onClick={() => holdBatch(b)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #f59e0b', cursor:'pointer', background:'#fffbeb', color:'#d97706', fontWeight:600 }}>Pause</button>}
                    {b.status==='on-hold' && <button onClick={() => resumeBatch(b)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Resume</button>}
                    {(b.qc==='review'||b.qc==='pending') && <button onClick={() => approveQC(b)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:'#3b82f6', color:'#fff', fontWeight:600 }}>Approve QC</button>}
                    {b.status==='complete' && b.qc==='pass' && <span style={{ fontSize:11, color:'#94a3b8' }}>✓ Done</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LineEfficiency({ live }) {
  const lines = live.lines || []
  const [toast, setToast] = useState('')
  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {lines.map((l,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{l.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>Target: {l.target?.toLocaleString() || 0} units/shift</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:800, color:l.eff>=90?ACCENT:l.eff>=75?'#f59e0b':'#ef4444', transition:'color 0.5s' }}>{l.eff || 0}%</div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>OEE</div>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ height:8, background:'#f1f5f9', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${l.eff||0}%`, background:l.eff>=90?ACCENT:l.eff>=75?'#f59e0b':'#ef4444', borderRadius:4, transition:'width 0.8s ease' }}/>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11, fontWeight:600, color:l.status==='running'?'#10b981':l.status==='idle'?'#94a3b8':'#f59e0b', background:l.status==='running'?'#f0fdf4':l.status==='idle'?'#f8fafc':'#fffbeb', padding:'3px 10px', borderRadius:20 }}>● {l.status}</span>
              <div style={{ display:'flex', gap:6 }}>
                {l.status==='running' && <button onClick={() => setToast(`Raising stoppage reason for ${l.name}…`)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Log Stoppage</button>}
                <button onClick={() => setToast(`${l.name} performance report downloading…`)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Report</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:8 }}>
        <button onClick={() => setToast('Daily line efficiency report emailed to Plant Manager')} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:13, fontWeight:500, background:'#fff', color:'#64748b' }}>Email Daily Report</button>
        <button onClick={() => { const blob = new Blob(['Line,OEE,Status\n'+lines.map(l=>`${l.name},${l.eff}%,${l.status}`).join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='line_efficiency.csv'; a.click(); setToast('Line efficiency exported') }} style={{ padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, background:ACCENT, color:'#fff' }}>Export All Lines</button>
      </div>
    </div>
  )
}

function RecipeManagement({ live, onAdd }) {
  const recipes = live.recipes || []
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const sc = { approved:[ACCENT,'#e6f7f0'], review:['#f59e0b','#fffbeb'], draft:['#94a3b8','#f1f5f9'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const filtered = recipes.filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase()))

  const approveRecipe = (r) => { live.actions?.updateRecipe?.(r.id, { status:'approved' }); setToast(`Recipe "${r.name}" approved`) }
  const duplicateRecipe = (r) => {
    live.actions?.addRecipe?.({ name:`${r.name} (Copy)`, category:r.category, version:'v1.0', ingredients:r.ingredients, description:'Duplicated recipe', author:'Copy' })
    setToast(`Recipe "${r.name}" duplicated`)
  }

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', gap:10, alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search recipes…" style={{ flex:1, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ New Recipe</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['ID','Recipe Name','Category','Version','Ingredients','Yield','Line','Status','Actions'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((r,i) => (
              <tr key={r.id||i} style={{ borderBottom:'1px solid #f1f5f9', background:r._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'11px 14px', fontFamily:'monospace', color:'#94a3b8', fontSize:11 }}>{r.id}</td>
                <td style={{ padding:'11px 14px', fontWeight:600, color:'#1e293b' }}>{r.name}{r._user&&<span style={{ marginLeft:5, fontSize:9, background:ACCENT, color:'#fff', padding:'1px 5px', borderRadius:20 }}>NEW</span>}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{r.category}</td>
                <td style={{ padding:'11px 14px', fontFamily:'monospace', color:'#64748b' }}>{r.version}</td>
                <td style={{ padding:'11px 14px', color:'#64748b', textAlign:'center' }}>{r.ingredients}</td>
                <td style={{ padding:'11px 14px', fontWeight:600, color:ACCENT }}>{r.yield || '—'}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{r.line || '—'}</td>
                <td style={{ padding:'11px 14px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(sc,r.status)[0], background:safe(sc,r.status)[1], padding:'3px 9px', borderRadius:20 }}>{r.status}</span></td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {r.status==='review' && <button onClick={() => approveRecipe(r)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Approve</button>}
                    <button onClick={() => duplicateRecipe(r)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Duplicate</button>
                    <button onClick={() => setToast(`Recipe ${r.name} v${r.version} — PDF generating…`)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Print</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', fontSize:12, color:'#94a3b8' }}>
          {filtered.length} of {recipes.length} recipes
        </div>
      </div>
    </div>
  )
}

function ProductionPlanning({ live }) {
  const [toast, setToast] = useState('')
  const plans = [
    { shift:'Day A — 25 Mar',  line:'Line 1', sku:'Bourbon Biscuits 150g',      target:4800, scheduled:true, confirmed:true  },
    { shift:'Day A — 25 Mar',  line:'Line 2', sku:'Maggi Noodles 70g',           target:6000, scheduled:true, confirmed:true  },
    { shift:'Day A — 25 Mar',  line:'Line 3', sku:'Lays Chips 26g',              target:8000, scheduled:true, confirmed:true  },
    { shift:'Day A — 25 Mar',  line:'Line 5', sku:'Frooti 200ml',                target:5000, scheduled:true, confirmed:false },
    { shift:'Eve B — 25 Mar',  line:'Line 1', sku:'Strawberry Jam Biscuit 150g', target:3600, scheduled:true, confirmed:false },
    { shift:'Eve B — 25 Mar',  line:'Line 6', sku:'KitKat 18g',                  target:10000,scheduled:true, confirmed:false },
    { shift:'Eve B — 25 Mar',  line:'Line 7', sku:'Cream & Onion Snacks 30g',    target:4800, scheduled:true, confirmed:false },
    { shift:'Night C — 25 Mar',line:'Line 2', sku:'Instant Veg Hakka Noodles',   target:5400, scheduled:false,confirmed:false },
    { shift:'Night C — 25 Mar',line:'Line 7', sku:'Chilli Lime Rice Cracker',    target:3200, scheduled:false,confirmed:false },
    { shift:'Day A — 26 Mar',  line:'Line 3', sku:'Tangy Tomato Chips 26g',      target:6000, scheduled:false,confirmed:false },
  ]
  const [planState, setPlanState] = useState(plans)
  const confirm = (i) => { setPlanState(p => p.map((r,j) => j===i ? {...r, confirmed:true, scheduled:true} : r)); setToast(`${planState[i].sku} on ${planState[i].line} confirmed`) }
  const publishAll = () => { setPlanState(p => p.map(r => ({...r, confirmed:true, scheduled:true}))); setToast('Full week production plan published to all line supervisors') }

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>Production Plan — Week of 25 Mar 2026</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setToast('Plan PDF generated and sent to operations team')} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, fontWeight:500, background:'#fff', color:'#64748b' }}>Print Plan</button>
          <button onClick={publishAll} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:ACCENT, color:'#fff' }}>Publish All</button>
        </div>
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Shift','Line','SKU','Target (units)','Status','Action'].map(h => <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {planState.map((p,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'11px 16px', fontWeight:500, color:'#1e293b' }}>{p.shift}</td>
                <td style={{ padding:'11px 16px', color:ACCENT, fontWeight:600 }}>{p.line}</td>
                <td style={{ padding:'11px 16px', color:'#1e293b' }}>{p.sku}</td>
                <td style={{ padding:'11px 16px', fontWeight:600, color:'#1e293b' }}>{p.target.toLocaleString()}</td>
                <td style={{ padding:'11px 16px' }}>
                  {p.confirmed
                    ? <span style={{ fontSize:11, fontWeight:600, color:ACCENT, background:'#e6f7f0', padding:'3px 10px', borderRadius:20 }}>✓ Confirmed</span>
                    : p.scheduled
                      ? <span style={{ fontSize:11, fontWeight:600, color:'#f59e0b', background:'#fffbeb', padding:'3px 10px', borderRadius:20 }}>Scheduled</span>
                      : <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8', background:'#f1f5f9', padding:'3px 10px', borderRadius:20 }}>Draft</span>}
                </td>
                <td style={{ padding:'11px 16px' }}>
                  {!p.confirmed && <button onClick={() => confirm(i)} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Confirm</button>}
                  {p.confirmed && <button onClick={() => setToast(`${p.sku} plan sent to ${p.line} supervisor`)} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Notify</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
