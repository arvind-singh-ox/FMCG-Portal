'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import FormModal from '@/components/industries/fmcg/components/FormModal'
import { AnimNumber, ProgressBar, DonutChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const TABS = ['Vendor Management','Purchase Orders','Dispatch & Delivery','Fleet & GPS']

export default function SupplyChain({ defaultTab = 'vendor' }) {
  const live = useLiveData()
  const tm = { vendor:0, po:1, dispatch:2, fleet:3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null)
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Supply Chain</div>
        <div style={{ fontSize:13, color:'#64748b' }}>Vendors, purchase orders, dispatch tracking and live fleet GPS</div>
      </div>
      <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===i?600:400, background:tab===i?'#fff':'transparent', color:tab===i?'#1e293b':'#64748b', boxShadow:tab===i?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{t}</button>)}
      </div>
      {tab===0 && <VendorManagement live={live} onAdd={() => setModal('addVendor')}/>}
      {tab===1 && <PurchaseOrders live={live} onAdd={() => setModal('createPO')}/>}
      {tab===2 && <DispatchDelivery live={live}/>}
      {tab===3 && <FleetGPS live={live}/>}
      {modal && <FormModal formKey={modal} onClose={closeModal} onSubmit={d => {
        if (modal==='addVendor') live.actions?.addVendor?.(d)
        if (modal==='createPO')  live.actions?.addPO?.(d)
        closeModal()
      }}/>}
    </div>
  )
}

function Toast({ msg, onDone }) {
  return msg ? (
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {msg}</span>
      <button onClick={onDone} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button>
    </div>
  ) : null
}

function VendorManagement({ live, onAdd }) {
  const vendors = live.vendors || []
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const sc = { preferred:[ACCENT,'#e6f7f0'], approved:['#3b82f6','#eff6ff'], review:['#f59e0b','#fffbeb'], inactive:['#94a3b8','#f1f5f9'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']
  const stars = r => r ? '★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)) : '—'

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = !q || v.name?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q)
    const matchFilter = filter==='all' || v.status===filter
    return matchSearch && matchFilter
  })

  const handleApprove = (v) => { live.actions?.updateVendor?.(v.id, { status:'approved' }); setToast(`${v.name} approved`) }
  const handleMakePreferred = (v) => { live.actions?.updateVendor?.(v.id, { status:'preferred' }); setToast(`${v.name} marked as preferred`) }
  const handleDelete = (v) => { live.actions?.deleteVendor?.(v.id); setConfirmDel(null); setToast(`${v.name} removed from directory`) }

  const exportCSV = () => {
    const rows = [['ID','Name','Category','Contact','Phone','Rating','On-Time%','Status'],
      ...filtered.map(v => [v.id,v.name,v.category,v.contact,v.phone,v.rating,v.onTime,v.status])]
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vendors.csv'; a.click()
    setToast('Vendor list exported as vendors.csv')
  }

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      {confirmDel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1e293b', marginBottom:8 }}>Remove Vendor?</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Remove <strong>{confirmDel.name}</strong> from the vendor directory? This cannot be undone.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:'10px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff', color:'#64748b' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDel)} style={{ flex:1, padding:'10px', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', background:'#ef4444', color:'#fff' }}>Remove</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Total Vendors', v:vendors.length, c:ACCENT },
          { l:'Preferred', v:vendors.filter(v=>v.status==='preferred').length, c:'#10b981' },
          { l:'Under Review', v:vendors.filter(v=>v.status==='review').length, c:'#f59e0b' },
          { l:'Total Payables', v:`₹${(vendors.reduce((s,v)=>s+(v.dues||0),0)/100000).toFixed(1)}L`, c:'#3b82f6' }
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors, category, city…" style={{ flex:1, minWidth:180, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          {['all','preferred','approved','review'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:500, background:filter===s?ACCENT:'#f1f5f9', color:filter===s?'#fff':'#64748b' }}>{s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}</button>
          ))}
          <button onClick={exportCSV} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, fontWeight:500, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Add Vendor</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Vendor','Category','Contact','Rating','On-Time%','Orders','Dues','Status','Actions'].map(h => <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding:'32px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>No vendors match your search.</td></tr>
            ) : filtered.map((v,i) => (
              <tr key={v.id||i} style={{ borderBottom:'1px solid #f1f5f9', background:v._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontWeight:600, color:'#1e293b' }}>{v.name}{v._user&&<span style={{ marginLeft:6, fontSize:9, background:ACCENT, color:'#fff', padding:'1px 6px', borderRadius:20 }}>NEW</span>}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{v.id}{v.city && ` · ${v.city}`}</div>
                </td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{v.category}</td>
                <td style={{ padding:'12px 16px' }}><div style={{ fontWeight:500, color:'#1e293b' }}>{v.contact}</div><div style={{ fontSize:11, color:'#94a3b8' }}>{v.phone}</div></td>
                <td style={{ padding:'12px 16px' }}><span style={{ color:'#f59e0b' }}>{stars(v.rating)}</span><div style={{ fontSize:11, color:'#64748b' }}>{v.rating||'—'}/5</div></td>
                <td style={{ padding:'12px 16px', width:120 }}><ProgressBar value={v.onTime||0} color={v.onTime>=90?ACCENT:'#f59e0b'} height={5}/><div style={{ fontSize:10, color:'#94a3b8', marginTop:3, fontWeight:600 }}>{v.onTime||'—'}%</div></td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{v.orders||0}</td>
                <td style={{ padding:'12px 16px', fontWeight:600, color:v.dues>0?'#f59e0b':'#64748b' }}>{v.dues>0?`₹${(v.dues/1000).toFixed(0)}K`:'—'}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(sc,v.status)[0], background:safe(sc,v.status)[1], padding:'3px 10px', borderRadius:20 }}>{v.status}</span></td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {v.status==='review' && <button onClick={() => handleApprove(v)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Approve</button>}
                    {v.status==='approved' && <button onClick={() => handleMakePreferred(v)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid '+ACCENT, cursor:'pointer', background:'#fff', color:ACCENT, fontWeight:600 }}>Prefer</button>}
                    {v.status==='preferred' && <span style={{ fontSize:11, color:'#94a3b8' }}>⭐ Top</span>}
                    <button onClick={() => setConfirmDel(v)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #fecaca', cursor:'pointer', background:'#fff7f7', color:'#ef4444', fontWeight:600 }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', fontSize:12, color:'#94a3b8' }}>Showing {filtered.length} of {vendors.length} vendors</div>
      </div>
    </div>
  )
}

function PurchaseOrders({ live, onAdd }) {
  const pos = live.purchaseOrders || []
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [toast, setToast] = useState('')
  const sc = { delivered:[ACCENT,'#e6f7f0'], 'in-transit':['#3b82f6','#eff6ff'], confirmed:['#8b5cf6','#f5f3ff'], draft:['#94a3b8','#f1f5f9'] }
  const pc = { paid:[ACCENT,'#e6f7f0'], pending:['#f59e0b','#fffbeb'], 'not-due':['#94a3b8','#f1f5f9'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const filtered = pos.filter(p => {
    const q = search.toLowerCase()
    const ms = !q || p.id?.toLowerCase().includes(q) || p.vendor?.toLowerCase().includes(q) || p.item?.toLowerCase().includes(q)
    const mf = filterStatus==='all' || p.status===filterStatus
    return ms && mf
  })

  const handleApprove = (p) => { live.actions?.updatePO?.(p.id, { status:'confirmed' }); setToast(`PO ${p.id} approved and confirmed`) }
  const handleMarkPaid = (p) => { live.actions?.updatePO?.(p.id, { payment:'paid' }); setToast(`Payment marked for ${p.id}`) }
  const handleCancel = (p) => { live.actions?.updatePO?.(p.id, { status:'draft', payment:'not-due' }); setToast(`PO ${p.id} cancelled and moved to draft`) }

  const exportCSV = () => {
    const rows = [['ID','Vendor','Item','Qty','Value','Raised','Due','Status','Payment'],
      ...filtered.map(p => [p.id,p.vendor,p.item,p.qty,p.value,p.raised,p.due,p.status,p.payment])]
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], {type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'purchase_orders.csv'; a.click()
    setToast('PO list exported')
  }

  const totalVal = filtered.reduce((s,p) => s + (p.value||0), 0)
  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Total POs', v:pos.length, c:ACCENT },
          { l:'In Transit', v:pos.filter(p=>p.status==='in-transit').length, c:'#3b82f6' },
          { l:'Total Value', v:`₹${(pos.reduce((s,p)=>s+(p.value||0),0)/100000).toFixed(1)}L`, c:'#8b5cf6' },
          { l:'Pending Payment', v:pos.filter(p=>p.payment==='pending').length, c:'#f59e0b' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PO, vendor, item…" style={{ flex:1, minWidth:180, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          {['all','draft','confirmed','in-transit','delivered'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:500, background:filterStatus===s?ACCENT:'#f1f5f9', color:filterStatus===s?'#fff':'#64748b' }}>{s==='all'?'All':s}</button>
          ))}
          <button onClick={exportCSV} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, fontWeight:500, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button onClick={onAdd} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Create PO</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['PO ID','Vendor','Item','Qty','Value','Due','Status','Payment','Actions'].map(h => <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding:'32px', textAlign:'center', color:'#94a3b8' }}>No purchase orders found.</td></tr>
            ) : filtered.map((p,i) => (
              <tr key={p.id||i} style={{ borderBottom:'1px solid #f1f5f9', background:p._user?'#f0fdf4':'transparent' }}>
                <td style={{ padding:'12px 16px', fontFamily:'monospace', color:ACCENT, fontSize:12, fontWeight:600 }}>{p.id}{p._user&&<span style={{ marginLeft:6, fontSize:9, background:ACCENT, color:'#fff', padding:'1px 5px', borderRadius:20 }}>NEW</span>}</td>
                <td style={{ padding:'12px 16px', fontWeight:500, color:'#1e293b' }}>{p.vendor}</td>
                <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>{p.item}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{p.qty}</td>
                <td style={{ padding:'12px 16px', fontWeight:600 }}>₹{(p.value||0).toLocaleString()}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{p.due}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(sc,p.status)[0], background:safe(sc,p.status)[1], padding:'3px 9px', borderRadius:20 }}>{p.status}</span></td>
                <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(pc,p.payment)[0], background:safe(pc,p.payment)[1], padding:'3px 9px', borderRadius:20 }}>{p.payment}</span></td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {p.status==='draft' && <button onClick={() => handleApprove(p)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Approve</button>}
                    {p.payment==='pending' && p.status==='delivered' && <button onClick={() => handleMarkPaid(p)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid '+ACCENT, cursor:'pointer', background:'#fff', color:ACCENT, fontWeight:600 }}>Mark Paid</button>}
                    {(p.status==='draft'||p.status==='confirmed') && <button onClick={() => handleCancel(p)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #fecaca', cursor:'pointer', background:'#fff7f7', color:'#ef4444', fontWeight:600 }}>Cancel</button>}
                    {p.status==='delivered' && p.payment==='paid' && <span style={{ fontSize:11, color:'#94a3b8' }}>Closed</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', fontSize:12, color:'#94a3b8' }}>
          Showing {filtered.length} of {pos.length} POs · Filtered value: ₹{(totalVal/100000).toFixed(1)}L
        </div>
      </div>
    </div>
  )
}

function DispatchDelivery({ live }) {
  const [dispatches, setDispatches] = useState([
    { id:'DSP-2026-1292', customer:'Sharma Traders, Jaipur',      items:'Bourbon 150g×2400, Maggi 70g×1800, KitKat 18g×1200',  vehicle:'RJ-14-GB-4421', driver:'Ramesh Yadav',   status:'delivered',  distance:'28 km',   eta:'Delivered 09:42',   value:428000 },
    { id:'DSP-2026-1291', customer:'Metro Wholesale, Ajmer',       items:'Lays 26g×6000, Chips×2400, Frooti 200ml×3600',         vehicle:'RJ-14-GC-8812', driver:'Sunil Meena',    status:'in-transit', distance:'132 km',  eta:'2:30 PM today',     value:520000 },
    { id:'DSP-2026-1290', customer:'Gupta Distributors, Kota',     items:'Bourbon 150g×4800, Maggi×2400, Snacks 30g×3000',       vehicle:'RJ-14-GD-2290', driver:'Vikram Singh',   status:'in-transit', distance:'248 km',  eta:'5:15 PM today',     value:364000 },
    { id:'DSP-2026-1289', customer:'Krishna Agencies, Udaipur',    items:'Mixed FMCG — full truck load 24 SKUs',                  vehicle:'RJ-14-GE-5540', driver:'Arjun Patel',    status:'loading',    distance:'320 km',  eta:'Tomorrow 10:00 AM', value:842000 },
    { id:'DSP-2026-1288', customer:'Star Distributors, Jodhpur',   items:'Maggi 70g×4800, Chips 26g×2400, KitKat×1800',          vehicle:'RJ-14-GF-1180', driver:'Deepak Kumar',   status:'scheduled',  distance:'344 km',  eta:'Tomorrow 11:30 AM', value:296000 },
    { id:'DSP-2026-1287', customer:'Rajesh & Co., Sikar',          items:'Bourbon 150g×1800, Digestive×1200, Squash×240',        vehicle:'RJ-14-GA-9901', driver:'Rohit Sharma',   status:'delivered',  distance:'110 km',  eta:'Delivered 11:18',   value:218000 },
    { id:'DSP-2026-1286', customer:'Annapurna Foods, Alwar',        items:'Noodles×3600, Chips×2400, Snacks×1800',                vehicle:'RJ-14-GH-3310', driver:'Manoj Chauhan',  status:'delivered',  distance:'148 km',  eta:'Delivered 08:55',   value:284000 },
    { id:'DSP-2026-1285', customer:'Bharat Traders, Bharatpur',    items:'KitKat 18g×6000, Bourbon×2400, Biscuit Mix×1200',      vehicle:'RJ-14-GK-7720', driver:'Dinesh Yadav',   status:'delivered',  distance:'192 km',  eta:'Delivered 07:30',   value:392000 },
    { id:'DSP-2026-1284', customer:'Shiv Shakti, Tonk',            items:'Frooti 200ml×4800, Orange Squash×480',                 vehicle:'RJ-14-GL-9940', driver:'Kamlesh Sharma', status:'delayed',    distance:'84 km',   eta:'Delayed — 4:00 PM', value:158000 },
    { id:'DSP-2026-1283', customer:'Mahadev Wholesale, Nagaur',    items:'Assorted FMCG — monthly replenishment',                vehicle:'RJ-14-GM-2280', driver:'Sunil Rathore',  status:'scheduled',  distance:'278 km',  eta:'Day after tomorrow',value:624000 },
  ])
  const [toast, setToast] = useState('')
  const sc = { delivered:[ACCENT,'#e6f7f0'], 'in-transit':['#3b82f6','#eff6ff'], loading:['#8b5cf6','#f5f3ff'], scheduled:['#94a3b8','#f1f5f9'], delayed:['#ef4444','#fef2f2'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const updateStatus = (id, status) => {
    setDispatches(prev => prev.map(d => d.id===id ? { ...d, status, eta: status==='delivered' ? 'Delivered '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : status==='in-transit' ? 'ETA: 6:00 PM' : d.eta } : d))
    setToast(`Dispatch ${id} marked as ${status}`)
  }

  const printWaybill = (d) => setToast(`Printing e-way bill for ${d.id} — ${d.customer}`)
  const shareETA = (d) => setToast(`WhatsApp ETA notification sent to ${d.customer}`)

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Total Today',   v:dispatches.length,                                     c:ACCENT    },
          { l:'In Transit',    v:dispatches.filter(d=>d.status==='in-transit').length,  c:'#3b82f6' },
          { l:'Delivered',     v:dispatches.filter(d=>d.status==='delivered').length,   c:'#10b981' },
          { l:'Delayed',       v:dispatches.filter(d=>d.status==='delayed').length,     c:'#ef4444' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {dispatches.map((d,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:3 }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:600, color:ACCENT }}>{d.id}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:safe(sc,d.status)[0], background:safe(sc,d.status)[1], padding:'2px 8px', borderRadius:20 }}>{d.status}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>{d.customer}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>₹{d.value.toLocaleString()}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{d.distance}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>📦 {d.items}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:11, color:'#94a3b8' }}>🚛 {d.vehicle} · {d.driver} · {d.eta}</div>
              <div style={{ display:'flex', gap:6 }}>
                {d.status==='loading' && <button onClick={() => updateStatus(d.id,'in-transit')} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Mark Dispatched</button>}
                {d.status==='in-transit' && <button onClick={() => updateStatus(d.id,'delivered')} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Mark Delivered</button>}
                {d.status==='scheduled' && <button onClick={() => updateStatus(d.id,'loading')} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:'#8b5cf6', color:'#fff', fontWeight:600 }}>Start Loading</button>}
                {d.status==='delayed' && <button onClick={() => updateStatus(d.id,'in-transit')} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:'#f59e0b', color:'#fff', fontWeight:600 }}>Resume Dispatch</button>}
                <button onClick={() => printWaybill(d)} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  E-Way Bill
                </button>
                <button onClick={() => shareETA(d)} style={{ fontSize:11, padding:'5px 11px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#25D366', fontWeight:600 }}>WhatsApp ETA</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FleetGPS({ live }) {
  const vehicles = live.fleet || []
  const [toast, setToast] = useState('')
  const sc = { moving:[ACCENT,'#e6f7f0'], parked:['#3b82f6','#eff6ff'], loading:['#8b5cf6','#f5f3ff'], idle:['#94a3b8','#f1f5f9'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const callDriver = (v) => setToast(`Calling ${v.driver} (${v.id}) — initiating VoIP…`)
  const sendAlert = (v) => setToast(`Alert sent to ${v.driver}: Fuel low — refuel at nearest bunk`)
  const trackOnMap = (v) => setToast(`Opening live map for ${v.id} — ${v.loc}`)

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Total Fleet', v:14, c:ACCENT },
          { l:'On Road', v:vehicles.filter(v=>v.status==='moving').length, c:'#3b82f6' },
          { l:'Low Fuel (<40%)', v:vehicles.filter(v=>v.fuel<40).length, c:'#ef4444' },
          { l:'Trips Today', v:18, c:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {vehicles.map((v,i) => (
          <div key={i} style={{ background:'#fff', border:`1px solid ${safe(sc,v.status)[0]}30`, borderRadius:12, padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, color:'#1e293b', fontSize:14 }}>{v.id}</div>
                <div style={{ fontSize:12, color:'#94a3b8' }}>{v.type} · {v.driver}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:safe(sc,v.status)[0], background:safe(sc,v.status)[1], padding:'3px 10px', borderRadius:20 }}>{v.status}</span>
            </div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:10, transition:'all 0.5s' }}>📍 {v.loc}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
              {[['Speed', v.status==='moving'?`${v.speed} km/h`:'0 km/h','#3b82f6'],
                ['Fuel', `${Math.round(v.fuel)}%`, v.fuel<40?'#ef4444':ACCENT],
                ['Trips', `${v.trips||0} today`,'#8b5cf6']
              ].map(([l,val,col]) => (
                <div key={l} style={{ background:'#f8fafc', borderRadius:7, padding:'7px 9px', textAlign:'center' }}>
                  <div style={{ fontSize:9, color:'#94a3b8', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:col, transition:'color 0.4s' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => trackOnMap(v)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#3b82f6', fontWeight:600 }}>📍 Track</button>
              <button onClick={() => callDriver(v)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:ACCENT, fontWeight:600 }}>📞 Call</button>
              {v.fuel < 40 && <button onClick={() => sendAlert(v)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'none', cursor:'pointer', background:'#fef2f2', color:'#ef4444', fontWeight:600 }}>⛽ Alert</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
