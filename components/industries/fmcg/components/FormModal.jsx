'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#1a9b6c'

const CONFIGS = {
  newBatch: {
    icon:'🏭', title:'New Production Batch', subtitle:'Start a new batch run on a production line', submitLabel:'Start Batch',
    fields:[
      { key:'sku',      label:'Product / SKU',          required:true, placeholder:'e.g. Bourbon Biscuits 150g' },
      { key:'line',     label:'Production Line',         required:true, type:'select', options:['Line 1 — Biscuits','Line 2 — Noodles','Line 3 — Chips','Line 5 — Sauce','Line 6 — Chocolates','Line 7 — Snacks'] },
      { key:'qty',      label:'Target Qty (units)',      required:true, type:'number', placeholder:'5000', width:'half' },
      { key:'shift',    label:'Shift',                   required:true, type:'select', options:['Day (A)','Evening (B)','Night (C)'], width:'half' },
      { key:'recipe',   label:'Recipe Version',          placeholder:'e.g. v3.2', width:'half' },
      { key:'priority', label:'Priority',                type:'select', options:['Normal','High','Urgent'], default:'Normal', width:'half' },
      { key:'notes',    label:'Notes',                   type:'textarea', placeholder:'Any batch instructions…' },
    ],
  },
  newRecipe: {
    icon:'📋', title:'New Recipe', subtitle:'Add a new product formula to the library', submitLabel:'Save Recipe',
    fields:[
      { key:'name',        label:'Recipe Name',     required:true, placeholder:'e.g. Classic Salted Chips v5' },
      { key:'category',    label:'Category',         required:true, type:'select', options:['Biscuits','Noodles','Chips','Beverages','Confectionery','Dairy','Snacks'] },
      { key:'version',     label:'Version',          required:true, placeholder:'v1.0', width:'half' },
      { key:'ingredients', label:'No. of Ingredients', type:'number', placeholder:'8', width:'half' },
      { key:'description', label:'Description', type:'textarea', placeholder:'Brief description of this recipe…' },
      { key:'author',      label:'Created By', placeholder:'Your name' },
    ],
  },
  addVendor: {
    icon:'🤝', title:'Add New Vendor', subtitle:'Register a new supplier in the system', submitLabel:'Add Vendor',
    fields:[
      { key:'name',     label:'Vendor / Company Name', required:true, placeholder:'e.g. Ruchi Industries Pvt Ltd' },
      { key:'category', label:'Supply Category',        required:true, type:'select', options:['Grains & Flour','Oils & Fats','Sweeteners','Packaging','Food Additives','Fruit & Pulp','Dairy','Spices','Other'] },
      { key:'contact',  label:'Contact Person',          required:true, placeholder:'Full name', width:'half' },
      { key:'phone',    label:'Phone',                   required:true, placeholder:'+91 98XXX XXXXX', width:'half' },
      { key:'email',    label:'Email', type:'email', placeholder:'contact@vendor.com' },
      { key:'city',     label:'City', placeholder:'e.g. Jaipur', width:'half' },
      { key:'status',   label:'Status', type:'select', options:['approved','preferred','review'], default:'approved', width:'half' },
      { key:'notes',    label:'Notes', type:'textarea', placeholder:'Payment terms, lead time, certifications…' },
    ],
  },
  createPO: {
    icon:'📦', title:'Create Purchase Order', subtitle:'Raise a new PO to a registered vendor', submitLabel:'Create PO',
    fields:[
      { key:'vendor',   label:'Vendor',               required:true, type:'select', options:['Aashirvaad Mills','Saffola Agro','Bajaj Sugar','Uflex Ltd','Barry Callebaut','Roha Dyechem','Other'] },
      { key:'item',     label:'Item / Material',       required:true, placeholder:'e.g. Refined Wheat Flour 50kg' },
      { key:'qty',      label:'Quantity',              required:true, placeholder:'e.g. 10 MT', width:'half' },
      { key:'value',    label:'Est. Value (₹)',         required:true, type:'number', placeholder:'500000', width:'half' },
      { key:'dueDate',  label:'Expected Delivery',     required:true, type:'date', width:'half' },
      { key:'priority', label:'Priority', type:'select', options:['Normal','Urgent','Emergency'], default:'Normal', width:'half' },
      { key:'notes',    label:'Notes', type:'textarea', placeholder:'Delivery instructions or special terms…' },
    ],
  },
  schedulePM: {
    icon:'🔧', title:'Schedule Preventive Maintenance', subtitle:'Add a new PM task to the schedule', submitLabel:'Schedule PM',
    fields:[
      { key:'asset',   label:'Asset / Machine', required:true, type:'select', options:['Mixing Unit M1','Extruder EX-2','Frying Unit FU-1','Packaging M-4A','Filling Station F5','Sealing Unit S6','Conveyor Belt CB7','Blending Tank BT1'] },
      { key:'task',    label:'Maintenance Task', required:true, placeholder:'e.g. Gearbox oil change and inspection' },
      { key:'freq',    label:'Frequency', required:true, type:'select', options:['Daily','Weekly','Bi-weekly','Monthly','Quarterly'], width:'half' },
      { key:'tech',    label:'Assign Technician', required:true, type:'select', options:['Ramesh K','Suresh P','Anita M','Deepak S'], width:'half' },
      { key:'nextDue', label:'Next Due Date', required:true, type:'date', width:'half' },
      { key:'estTime', label:'Est. Time (hrs)', type:'number', placeholder:'2', width:'half' },
      { key:'notes',   label:'Notes', type:'textarea', placeholder:'Tools required, safety precautions…' },
    ],
  },
  newWorkOrder: {
    icon:'📋', title:'New Work Order', subtitle:'Raise a maintenance or breakdown work order', submitLabel:'Create WO',
    fields:[
      { key:'asset',    label:'Asset / Machine', required:true, type:'select', options:['Mixing Unit M1','Extruder EX-2','Frying Unit FU-1','Packaging M-4A','Conveyor Belt CB4','Sealing Unit S6','Conveyor Belt CB7','Blending Tank BT1'] },
      { key:'type',     label:'WO Type', required:true, type:'select', options:['Breakdown','Preventive','Corrective','Inspection'] },
      { key:'priority', label:'Priority', required:true, type:'select', options:['critical','high','medium','low'], width:'half' },
      { key:'tech',     label:'Assign To', required:true, type:'select', options:['Ramesh K','Suresh P','Anita M','Deepak S'], width:'half' },
      { key:'desc',     label:'Problem Description', required:true, type:'textarea', placeholder:'Describe the issue in detail…' },
      { key:'estCost',  label:'Est. Cost (₹)', type:'number', placeholder:'15000', width:'half' },
      { key:'eta',      label:'Target Completion', type:'date', width:'half' },
    ],
  },
  addSparePart: {
    icon:'⚙️', title:'Add Spare Part', subtitle:'Register a new part in inventory', submitLabel:'Add Part',
    fields:[
      { key:'name',     label:'Part Name',              required:true, placeholder:'e.g. Bearing 6205-2RS' },
      { key:'machine',  label:'Used In (Machines)',      required:true, placeholder:'e.g. M1, EX-2, Multiple' },
      { key:'stock',    label:'Current Stock',           required:true, type:'number', placeholder:'10', width:'half' },
      { key:'unit',     label:'Unit', required:true, type:'select', options:['pcs','sets','rolls','cans','boxes','kg'], default:'pcs', width:'half' },
      { key:'minStock', label:'Min Stock (Reorder Pt)', required:true, type:'number', placeholder:'4', width:'half' },
      { key:'cost',     label:'Unit Cost (₹)',           required:true, type:'number', placeholder:'2500', width:'half' },
      { key:'supplier', label:'Preferred Supplier', placeholder:'e.g. SKF India' },
    ],
  },
  inviteUser: {
    icon:'👤', title:'Invite New User', subtitle:'Add a team member to the FMCG Portal', submitLabel:'Send Invite',
    fields:[
      { key:'name',  label:'Full Name',    required:true, placeholder:'e.g. Neha Sharma', width:'half' },
      { key:'email', label:'Email',        required:true, type:'email', placeholder:'neha@fmcgcorp.in', width:'half' },
      { key:'role',  label:'Role',         required:true, type:'select', options:['Plant Manager','QC Manager','Production Supervisor','Maintenance Engineer','Line Operator','Dispatch Coordinator','Finance Viewer','Viewer / Guest'] },
      { key:'dept',  label:'Department',   required:true, type:'select', options:['Management','Quality','Production','Maintenance','Dispatch','Finance','Stores','Guest'] },
      { key:'phone', label:'Phone (optional)', placeholder:'+91 98XXX XXXXX' },
    ],
  },
  newRole: {
    icon:'🔑', title:'Create New Role', subtitle:'Define a new access role for the portal', submitLabel:'Create Role',
    fields:[
      { key:'role',    label:'Role Name',        required:true, placeholder:'e.g. Warehouse Supervisor' },
      { key:'modules', label:'Module Access',     required:true, placeholder:'e.g. Inventory, Supply Chain, Dashboard' },
      { key:'level',   label:'Permission Level',  required:true, type:'select', options:['Full access','Read + Write','Read only','Read only + Log'] },
      { key:'desc',    label:'Description', type:'textarea', placeholder:'What can this role do?' },
    ],
  },
  generateReport: {
    icon:'📊', title:'Generate QC Report', subtitle:'Create a quality control summary report', submitLabel:'Generate Report',
    fields:[
      { key:'name',  label:'Report Name', required:true, placeholder:'e.g. Daily QC Summary — 25 Mar 2026' },
      { key:'type',  label:'Report Type', required:true, type:'select', options:['Daily','Batch','Weekly','Monthly','Regulatory'] },
      { key:'lines', label:'Production Lines', type:'select', options:['All Lines','Line 1','Line 2','Line 3','Line 5','Line 6','Lab Only'] },
      { key:'from',  label:'From Date', type:'date', width:'half' },
      { key:'to',    label:'To Date',   type:'date', width:'half' },
      { key:'notes', label:'Notes', type:'textarea', placeholder:'Optional remarks…' },
    ],
  },
}

export default function FormModal({ formKey, onClose, onSubmit }) {
  const cfg = CONFIGS[formKey]
  const [vals, setVals] = useState({})
  const [errs, setErrs] = useState({})
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    if (!cfg) return
    const init = {}; cfg.fields.forEach(f => { init[f.key] = f.default ?? '' })
    setVals(init); setErrs({}); setOk(false)
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [formKey])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!cfg) return null

  const set = (k, v) => { setVals(p => ({...p,[k]:v})); if (errs[k]) setErrs(p=>({...p,[k]:null})) }

  const validate = () => {
    const e = {}
    cfg.fields.forEach(f => {
      if (f.required && !String(vals[f.key]??'').trim()) e[f.key] = `${f.label} is required`
      if (f.type==='number' && vals[f.key]!=='' && isNaN(Number(vals[f.key]))) e[f.key] = 'Must be a number'
    })
    return e
  }

  const submit = async e => {
    e?.preventDefault()
    const e2 = validate(); if (Object.keys(e2).length) { setErrs(e2); return }
    setBusy(true); await new Promise(r=>setTimeout(r,480))
    onSubmit(vals); setOk(true); setBusy(false)
    setTimeout(() => { onClose(); setOk(false) }, 1600)
  }

  // Pair half-width fields into rows
  const rows = []; let i = 0
  while (i < cfg.fields.length) {
    const f = cfg.fields[i]
    if (f.width==='half' && i+1<cfg.fields.length && cfg.fields[i+1].width==='half') {
      rows.push({type:'pair',a:cfg.fields[i],b:cfg.fields[i+1]}); i+=2
    } else { rows.push({type:'single',f}); i++ }
  }

  const IS = k => ({
    width:'100%', padding:'9px 12px', fontSize:13, color:'#1e293b',
    border:`1.5px solid ${errs[k]?'#ef4444':'#e2e8f0'}`, borderRadius:8,
    background:'#f8fafc', boxSizing:'border-box', outline:'none', fontFamily:'inherit', transition:'border 0.15s',
  })

  return (
    <>
      <style>{`
        @keyframes _slide{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}
        @keyframes _bg{from{opacity:0}to{opacity:1}}
        @keyframes _chk{from{transform:scale(0)}to{transform:scale(1)}}
        @keyframes _spin{to{transform:rotate(360deg)}}
        ._panel{animation:_slide .22s ease}
        ._fi:focus{border-color:${ACCENT}!important;box-shadow:0 0 0 3px rgba(26,155,108,.12)!important}
        ._fi:hover{border-color:#94a3b8!important}
        select._fi{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
        ._sbtn:hover:not(:disabled){background:#158a5d!important}
        ._cbtn:hover{background:#f1f5f9!important}
      `}</style>

      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(15,23,42,.45)',backdropFilter:'blur(3px)',zIndex:400,animation:'_bg .18s ease'}}/>

      <div className="_panel" style={{position:'fixed',top:0,right:0,bottom:0,width:500,maxWidth:'100vw',background:'#fff',zIndex:401,display:'flex',flexDirection:'column',boxShadow:'-8px 0 48px rgba(0,0,0,.14)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'}}>

        {/* header */}
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #e8ecf1',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:10,background:'#e6f7f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{cfg.icon}</div>
              <div>
                <h2 style={{margin:0,fontSize:17,fontWeight:700,color:'#1e293b',lineHeight:1.2}}>{cfg.title}</h2>
                <p style={{margin:'3px 0 0',fontSize:12,color:'#64748b'}}>{cfg.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:6,color:'#94a3b8',borderRadius:6,flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* success */}
        {ok ? (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:40}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'#e6f7f0',display:'flex',alignItems:'center',justifyContent:'center',animation:'_chk .4s cubic-bezier(.34,1.56,.64,1)'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:700,color:'#1e293b',marginBottom:8}}>Added successfully!</div>
              <div style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>New entry now appears at the top of the table with a green highlight.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
            {rows.map((row,ri) =>
              row.type==='pair' ? (
                <div key={ri} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <Field f={row.a} v={vals[row.a.key]??''} set={set} err={errs[row.a.key]} IS={IS} r={ri===0?firstRef:null}/>
                  <Field f={row.b} v={vals[row.b.key]??''} set={set} err={errs[row.b.key]} IS={IS}/>
                </div>
              ) : <Field key={row.f.key} f={row.f} v={vals[row.f.key]??''} set={set} err={errs[row.f.key]} IS={IS} r={ri===0?firstRef:null}/>
            )}
          </form>
        )}

        {/* footer */}
        {!ok && (
          <div style={{padding:'16px 24px',borderTop:'1px solid #e8ecf1',display:'flex',gap:10,flexShrink:0,background:'#fafafa'}}>
            <button type="button" className="_cbtn" onClick={onClose} style={{flex:1,padding:'11px',border:'1px solid #e2e8f0',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',background:'#fff',color:'#64748b',transition:'background .15s'}}>
              Cancel
            </button>
            <button type="button" className="_sbtn" disabled={busy} onClick={submit}
              style={{flex:2,padding:'11px',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:busy?'wait':'pointer',background:busy?'#94a3b8':ACCENT,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'background .15s'}}>
              {busy
                ? <><span style={{width:15,height:15,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'_spin .7s linear infinite'}}/> Saving…</>
                : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> {cfg.submitLabel}</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function Field({f,v,set,err,IS,r}) {
  const s = IS(f.key)
  return (
    <div>
      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:5}}>
        {f.label}{f.required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}
      </label>
      {f.type==='select' ? (
        <select ref={r} value={v} onChange={e=>set(f.key,e.target.value)} className="_fi" style={{...s,background:'#f8fafc'}}>
          <option value="">Select…</option>
          {(f.options||[]).map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : f.type==='textarea' ? (
        <textarea ref={r} rows={3} value={v} onChange={e=>set(f.key,e.target.value)} placeholder={f.placeholder||''} className="_fi" style={{...s,resize:'vertical',minHeight:72}}/>
      ) : (
        <input ref={r} type={f.type||'text'} value={v} onChange={e=>set(f.key,e.target.value)} placeholder={f.placeholder||''} className="_fi" style={s}/>
      )}
      {err && <div style={{fontSize:11,color:'#ef4444',marginTop:4}}>{err}</div>}
    </div>
  )
}
