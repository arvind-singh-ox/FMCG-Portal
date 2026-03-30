'use client'
import { useState } from 'react'
import { ProgressBar, DonutChart, BarChart, AnimNumber } from '@/components/industries/fmcg/components/Charts'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'

const ACCENT = '#1a9b6c'
const TABS = ['Raw Materials','Finished Goods','Expiry Management','Cold Storage']

function Toast({ msg, onDone }) {
  return msg ? (
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {msg}</span>
      <button onClick={onDone} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button>
    </div>
  ) : null
}

export default function InventoryManagement({ defaultTab = 'raw' }) {
  const tm = { raw:0, finished:1, expiry:2, cold:3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Inventory & Warehouse</div>
        <div style={{ fontSize:13, color:'#64748b' }}>Raw materials, finished goods, expiry tracking and cold chain</div>
      </div>
      <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
        {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===i?600:400, background:tab===i?'#fff':'transparent', color:tab===i?'#1e293b':'#64748b', boxShadow:tab===i?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{t}</button>)}
      </div>
      {tab===0 && <RawMaterials/>}
      {tab===1 && <FinishedGoods/>}
      {tab===2 && <ExpiryManagement/>}
      {tab===3 && <ColdStorage/>}
    </div>
  )
}

const rawItems = [
  { id:'RM-001', name:'Refined Wheat Flour',           category:'Grains',        stock:24.8, unit:'MT',    reorder:10, maxStock:50,  cost:28500,  supplier:'Aashirvaad Mills',    status:'good'     },
  { id:'RM-002', name:'Refined Palm Oil',               category:'Oils & Fats',   stock:8.4,  unit:'MT',    reorder:10, maxStock:30,  cost:115000, supplier:'Saffola Agro',        status:'low'      },
  { id:'RM-003', name:'Sugar S30 Grade',                category:'Sweeteners',    stock:18.2, unit:'MT',    reorder:8,  maxStock:40,  cost:42000,  supplier:'Bajaj Sugar Mills',   status:'good'     },
  { id:'RM-004', name:'Iodized Salt (Tata)',            category:'Condiments',    stock:3.1,  unit:'MT',    reorder:4,  maxStock:15,  cost:9800,   supplier:'Tata Salt',           status:'critical' },
  { id:'RM-005', name:'Cocoa Powder Alkalized',         category:'Flavouring',    stock:1.9,  unit:'MT',    reorder:3,  maxStock:10,  cost:380000, supplier:'Barry Callebaut',     status:'critical' },
  { id:'RM-006', name:'Alphonso Mango Pulp A-Grade',    category:'Fruit',         stock:12.4, unit:'MT',    reorder:6,  maxStock:20,  cost:68000,  supplier:'Devshree Agro',       status:'good'     },
  { id:'RM-007', name:'LDPE Packaging Film 500mm',      category:'Packaging',     stock:6.2,  unit:'MT',    reorder:5,  maxStock:15,  cost:142000, supplier:'Uflex Ltd',           status:'good'     },
  { id:'RM-008', name:'Food Colour FD&C Blend',         category:'Additives',     stock:0.48, unit:'MT',    reorder:0.5,maxStock:2,   cost:920000, supplier:'Roha Dyechem',        status:'low'      },
  { id:'RM-009', name:'Potato Flakes Grade A',          category:'Starches',      stock:9.6,  unit:'MT',    reorder:5,  maxStock:18,  cost:66500,  supplier:'ITC Agri Business',   status:'good'     },
  { id:'RM-010', name:'SMP Skimmed Milk Powder',        category:'Dairy',         stock:4.2,  unit:'MT',    reorder:3,  maxStock:12,  cost:142000, supplier:'Amul Dairy',          status:'good'     },
  { id:'RM-011', name:'RBD Palmolein Oil',              category:'Oils & Fats',   stock:14.8, unit:'MT',    reorder:8,  maxStock:25,  cost:109000, supplier:'Godrej Industries',   status:'good'     },
  { id:'RM-012', name:'Turmeric Oleoresin',             category:'Spices',        stock:0.28, unit:'MT',    reorder:0.2,maxStock:1,   cost:820000, supplier:'Kancor Ingredients',  status:'low'      },
  { id:'RM-013', name:'Laminated Biscuit Pouches',      category:'Packaging',     stock:840,  unit:'K pcs', reorder:500,maxStock:2000,cost:0.97,   supplier:'Essel Propack',       status:'good'     },
  { id:'RM-014', name:'Citric Acid Monohydrate',        category:'Additives',     stock:1.4,  unit:'MT',    reorder:1,  maxStock:4,   cost:68000,  supplier:'HDFC Chemicals',      status:'good'     },
  { id:'RM-015', name:'Vanillin Food Grade',            category:'Flavouring',    stock:0.18, unit:'MT',    reorder:0.15,maxStock:0.8,cost:1240000,supplier:'Naturex Specialties', status:'low'      },
  { id:'RM-016', name:'Sodium Bicarbonate FG',          category:'Leavening',     stock:2.4,  unit:'MT',    reorder:1.5,maxStock:6,   cost:38000,  supplier:'TATA Chemicals',      status:'good'     },
  { id:'RM-017', name:'HDPE Drums 200L',                category:'Packaging',     stock:48,   unit:'pcs',   reorder:30, maxStock:120, cost:1300,   supplier:'Supreme Industries',  status:'good'     },
  { id:'RM-018', name:'Sunflower Oil Refined',          category:'Oils & Fats',   stock:5.6,  unit:'MT',    reorder:5,  maxStock:15,  cost:124000, supplier:'Parle Agro',          status:'low'      },
]

function RawMaterials() {
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState(rawItems)
  const sc = { good:[ACCENT,'#e6f7f0'], low:['#f59e0b','#fffbeb'], critical:['#ef4444','#fef2f2'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const filtered = items.filter(m => {
    const q = search.toLowerCase()
    return (!q || m.name?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q)) &&
           (filter==='all' || m.status===filter)
  })

  const raiseReorder = (m) => { setToast(`Reorder PO draft created for ${m.name} — ${m.supplier}`); setItems(p => p.map(i => i.id===m.id ? {...i, status:'good'} : i)) }

  const exportCSV = () => {
    const rows = [['ID','Name','Category','Stock','Unit','Reorder Pt','Status','Supplier'],
      ...filtered.map(m => [m.id,m.name,m.category,m.stock,m.unit,m.reorder,m.status,m.supplier])]
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'raw_materials.csv'; a.click()
    setToast('Raw materials inventory exported')
  }

  const totVal = items.reduce((s,m) => s + (typeof m.stock==='number' && typeof m.cost==='number' ? m.stock*m.cost : 0), 0)
  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Total SKUs', v:items.length, c:ACCENT },
          { l:'Low Stock', v:items.filter(m=>m.status==='low').length, c:'#f59e0b' },
          { l:'Critical', v:items.filter(m=>m.status==='critical').length, c:'#ef4444' },
          { l:'Inventory Value', v:`₹${(totVal/100000).toFixed(1)}L`, c:'#3b82f6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search materials…" style={{ flex:1, minWidth:160, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          {['all','good','low','critical'].map(s => <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:500, background:filter===s?ACCENT:'#f1f5f9', color:filter===s?'#fff':'#64748b' }}>{s==='all'?'All':s}</button>)}
          <button onClick={exportCSV} style={{ padding:'7px 13px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Item','Category','Stock Level','Reorder Pt','Unit Cost','Supplier','Status','Action'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((m,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:m.status==='critical'?'#fff5f5':m.status==='low'?'#fffbeb':'transparent' }}>
                <td style={{ padding:'11px 14px' }}><div style={{ fontWeight:600, color:'#1e293b' }}>{m.name}</div><div style={{ fontSize:11, color:'#94a3b8' }}>{m.id}</div></td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{m.category}</td>
                <td style={{ padding:'11px 14px', width:160 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1 }}><ProgressBar value={Math.min((m.stock/(m.maxStock||1))*100,100)} color={safe(sc,m.status)[0]} height={6}/></div>
                    <span style={{ fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{m.stock} {m.unit}</span>
                  </div>
                </td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{m.reorder} {m.unit}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>₹{typeof m.cost==='number'?m.cost.toLocaleString():m.cost}</td>
                <td style={{ padding:'11px 14px', color:'#64748b', fontSize:12 }}>{m.supplier}</td>
                <td style={{ padding:'11px 14px' }}><span style={{ fontSize:11, fontWeight:600, color:safe(sc,m.status)[0], background:safe(sc,m.status)[1], padding:'3px 9px', borderRadius:20 }}>{m.status}</span></td>
                <td style={{ padding:'11px 14px' }}>
                  {(m.status==='low'||m.status==='critical') && <button onClick={() => raiseReorder(m)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:m.status==='critical'?'#ef4444':ACCENT, color:'#fff', fontWeight:600 }}>Reorder Now</button>}
                  {m.status==='good' && <button onClick={() => setToast(`${m.name} — item details viewed`)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>View</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'10px 20px', borderTop:'1px solid #f1f5f9', fontSize:12, color:'#94a3b8' }}>Showing {filtered.length} of {items.length} items</div>
      </div>
    </div>
  )
}

function FinishedGoods() {
  const [toast, setToast] = useState('')
  const items = [
    { sku:'Bourbon Biscuits 150g',     batch:'BT-0422', qty:24800, unit:'packs',   location:'WH-A Rack 3',  mfg:'22 Mar', exp:'22 Sep 2026', value:496000  },
    { sku:'Maggi Noodles 70g',         batch:'BT-0421', qty:18600, unit:'packs',   location:'WH-B Rack 1',  mfg:'21 Mar', exp:'21 Sep 2027', value:372000  },
    { sku:'Lays Chips 26g',            batch:'BT-0420', qty:32000, unit:'packs',   location:'WH-A Rack 7',  mfg:'22 Mar', exp:'22 Jun 2026', value:640000  },
    { sku:'Frooti 200ml',              batch:'BT-0419', qty:14400, unit:'bottles', location:'WH-C Cold',    mfg:'20 Mar', exp:'20 Jun 2026', value:288000  },
    { sku:'KitKat 18g',                batch:'BT-0418', qty:42000, unit:'bars',    location:'WH-B Rack 4',  mfg:'21 Mar', exp:'21 Sep 2026', value:840000  },
    { sku:'Britannia Marie 300g',      batch:'BT-0417', qty:19200, unit:'packs',   location:'WH-A Rack 2',  mfg:'20 Mar', exp:'20 Mar 2027', value:614400  },
    { sku:'Cream & Onion Snacks 30g',  batch:'BT-0416', qty:28000, unit:'packs',   location:'WH-A Rack 8',  mfg:'19 Mar', exp:'19 May 2026', value:280000  },
    { sku:'Orange Squash 750ml',       batch:'BT-0415', qty:8400,  unit:'bottles', location:'WH-C Shelf A', mfg:'18 Mar', exp:'18 Jun 2026', value:756000  },
    { sku:'Multigrain Digestive 200g', batch:'BT-0414', qty:12000, unit:'packs',   location:'WH-B Rack 6',  mfg:'17 Mar', exp:'17 Sep 2026', value:480000  },
    { sku:'Instant Veg Hakka Noodles', batch:'BT-0413', qty:22000, unit:'packs',   location:'WH-B Rack 2',  mfg:'16 Mar', exp:'16 Dec 2026', value:440000  },
    { sku:'Tangy Tomato Chips 26g',    batch:'BT-0412', qty:18000, unit:'packs',   location:'WH-A Rack 5',  mfg:'15 Mar', exp:'15 Jun 2026', value:360000  },
    { sku:'Strawberry Jam Biscuit',    batch:'BT-0411', qty:9600,  unit:'packs',   location:'WH-B Rack 5',  mfg:'14 Mar', exp:'14 Sep 2026', value:288000  },
  ]
  const totVal = items.reduce((s,m)=>s+m.value,0)

  const printLabel = (m) => setToast(`Printing barcode label for ${m.sku} (${m.batch})`)
  const raiseDispatch = (m) => setToast(`Dispatch order raised for ${m.sku} — ${m.qty.toLocaleString()} ${m.unit}`)
  const exportCSV = () => {
    const rows = [['SKU','Batch','Qty','Unit','Location','Mfg','Exp','Value'],
      ...items.map(m => [m.sku,m.batch,m.qty,m.unit,m.location,m.mfg,m.exp,m.value])]
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'finished_goods.csv'; a.click()
    setToast('Finished goods inventory exported')
  }

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:14, fontWeight:600 }}>Finished goods ({items.length} SKUs · ₹{(totVal/100000).toFixed(1)}L total value)</div>
          <button onClick={exportCSV} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['SKU','Batch','Quantity','Location','Mfg Date','Exp Date','Value','Actions'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((m,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'11px 14px', fontWeight:600, color:'#1e293b' }}>{m.sku}</td>
                <td style={{ padding:'11px 14px', fontFamily:'monospace', color:'#64748b', fontSize:12 }}>{m.batch}</td>
                <td style={{ padding:'11px 14px', fontWeight:500, color:'#1e293b' }}>{m.qty.toLocaleString()} {m.unit}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{m.location}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{m.mfg}</td>
                <td style={{ padding:'11px 14px', color:'#64748b' }}>{m.exp}</td>
                <td style={{ padding:'11px 14px', fontWeight:600, color:ACCENT }}>₹{m.value.toLocaleString()}</td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => raiseDispatch(m)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Dispatch</button>
                    <button onClick={() => printLabel(m)} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Print Label</button>
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

function ExpiryManagement() {
  const [toast, setToast] = useState('')
  const [items, setItems] = useState([
    { name:'Frooti 200ml (Batch BT-0412)',          daysLeft:3,  qty:'2,400 bottles',  action:'Expedite dispatch immediately',   sev:'critical', dispatched:false },
    { name:'Cream & Onion Snacks 30g (BT-0416)',    daysLeft:5,  qty:'4,800 packs',    action:'Priority dispatch — today',       sev:'critical', dispatched:false },
    { name:'Palm Oil RM (Batch RM-B221)',            daysLeft:7,  qty:'2.1 MT',         action:'Use in next batch BT-0426',       sev:'warning',  dispatched:false },
    { name:'Cocoa Powder (Batch RM-C108)',           daysLeft:14, qty:'480 kg',         action:'Schedule for Batch BT-0425',      sev:'warning',  dispatched:false },
    { name:'Orange Squash 750ml (BT-0415)',          daysLeft:18, qty:'1,200 bottles',  action:'Dispatch priority this week',     sev:'warning',  dispatched:false },
    { name:'Tangy Tomato Chips 26g (BT-0412)',       daysLeft:22, qty:'8,000 packs',    action:'Monitor — dispatch priority',     sev:'info',     dispatched:false },
    { name:'Food Colour FD&C (Lot FC-44)',           daysLeft:28, qty:'60 kg',          action:'Normal — use in Q2 batches',      sev:'info',     dispatched:false },
    { name:'Strawberry Jam Biscuit (BT-0411)',       daysLeft:42, qty:'9,600 packs',    action:'Rotate stock — FIFO',             sev:'info',     dispatched:false },
    { name:'Mango Pulp RM (Lot MP-2026-03)',         daysLeft:68, qty:'3.8 MT',         action:'Good stock — in active batches',  sev:'good',     dispatched:false },
    { name:'KitKat 18g (Batch BT-0418)',             daysLeft:181,qty:'42,000 bars',    action:'Good stock',                      sev:'good',     dispatched:false },
  ])
  const sc = { critical:['#ef4444','#fef2f2'], warning:['#f59e0b','#fffbeb'], info:['#3b82f6','#eff6ff'], good:[ACCENT,'#e6f7f0'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const markDispatched = (idx) => { setItems(p => p.map((i,j) => j===idx ? {...i, dispatched:true} : i)); setToast(`${items[idx].name} marked as dispatched`) }
  const escalate = (item) => setToast(`URGENT escalation sent to Dispatch team for ${item.name}`)

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div><div style={{ fontSize:13, fontWeight:600, color:'#92400e' }}>5 items require attention within 30 days</div><div style={{ fontSize:12, color:'#b45309' }}>2 batches critical (expiry &lt;7 days). Dispatch immediately.</div></div>
        </div>
        <button onClick={() => setToast('Full expiry report emailed to QC Manager and Plant Manager')} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', background:'#f59e0b', color:'#fff', fontWeight:600 }}>Email Report</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {items.map((m,i) => (
          <div key={i} style={{ background:m.dispatched?'#f8fafc':'#fff', border:`1px solid ${safe(sc,m.sev)[0]}40`, borderLeft:`4px solid ${safe(sc,m.sev)[0]}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:16, opacity:m.dispatched?0.5:1, transition:'opacity 0.4s' }}>
            <div style={{ width:52, height:52, borderRadius:10, background:safe(sc,m.sev)[1], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:18, fontWeight:800, color:safe(sc,m.sev)[0] }}>{m.daysLeft}d</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:2 }}>{m.name}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{m.qty} · {m.daysLeft} days remaining</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:safe(sc,m.sev)[0], fontWeight:600, marginBottom:6 }}>{m.action}</div>
              <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                {!m.dispatched && (m.sev==='critical'||m.sev==='warning') && (
                  <>
                    <button onClick={() => markDispatched(i)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Mark Dispatched</button>
                    {m.sev==='critical' && <button onClick={() => escalate(m)} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:'#ef4444', color:'#fff', fontWeight:600 }}>Escalate</button>}
                  </>
                )}
                {m.dispatched && <span style={{ fontSize:11, color:ACCENT, fontWeight:600 }}>✓ Dispatched</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ColdStorage() {
  const live = useLiveData()
  const units = live.coldStorage || []
  const [toast, setToast] = useState('')
  const sc = { normal:[ACCENT,'#e6f7f0'], warning:['#f59e0b','#fffbeb'], critical:['#ef4444','#fef2f2'] }
  const safe = (m,k) => m[k] || ['#64748b','#f1f5f9']

  const runDefrost = (u) => setToast(`Defrost cycle initiated for ${u.name} — ETA 45 min`)
  const recalibrate = (u) => setToast(`Calibration request sent for ${u.name} — technician notified`)
  const exportLog = () => setToast('Temperature log CSV for all cold storage units exported')

  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[{ l:'Storage Units', v:units.length, c:ACCENT },
          { l:'Temp Alarms', v:units.filter(u=>u.status==='warning').length, c:'#f59e0b' },
          { l:'Sensors Online', v:'24 / 24', c:'#10b981' },
          { l:'Energy Today', v:'284 kWh', c:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <button onClick={exportLog} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b', display:'flex', alignItems:'center', gap:5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Temperature Log
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
        {units.map((u,i) => (
          <div key={i} style={{ background:'#fff', border:`1px solid ${safe(sc,u.status)[0]}40`, borderRadius:12, padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <div><div style={{ fontSize:15, fontWeight:700, color:'#1e293b' }}>{u.name}</div><div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{u.id} · {u.type}</div></div>
              <span style={{ fontSize:11, fontWeight:600, color:safe(sc,u.status)[0], background:safe(sc,u.status)[1], padding:'3px 10px', borderRadius:20, height:'fit-content' }}>{u.status}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[['Temperature',`${u.temp}°C`,`Set: ${u.setTemp}°C`, Math.abs((u.temp||0)-(u.setTemp||0))>1?'#f59e0b':ACCENT],
                ['Humidity',`${u.humid}%`,'Target: 60–75%','#3b82f6']
              ].map(([l,v,s,col]) => (
                <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'#94a3b8', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:col, transition:'color 0.5s' }}>{v}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {u.status==='warning' && <button onClick={() => recalibrate(u)} style={{ flex:1, fontSize:11, padding:'7px', borderRadius:7, border:'none', cursor:'pointer', background:'#f59e0b', color:'#fff', fontWeight:600 }}>⚠ Recalibrate</button>}
              <button onClick={() => runDefrost(u)} style={{ flex:1, fontSize:11, padding:'7px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Run Defrost</button>
              <button onClick={() => setToast(`${u.name} temperature history opened — 7-day trend`)} style={{ flex:1, fontSize:11, padding:'7px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>View History</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
