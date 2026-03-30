'use client'
import { useState } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import FormModal from '@/components/industries/fmcg/components/FormModal'
import { ProgressBar, DonutChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const TABS = ['Batch QC Tests', 'AI Vision Inspection', 'Compliance', 'QC Reports']

export default function QualityControl({ defaultTab = 'qc' }) {
  const live = useLiveData()
  const tm = { qc: 0, ai: 1, compliance: 2, reports: 3 }
  const [tab, setTab] = useState(tm[defaultTab] ?? 0)
  const [modal, setModal] = useState(null)
  const closeModal = () => setModal(null)
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Quality Control</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>AI-powered inspection, batch testing, compliance tracking and QC reports</div>
      </div>
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === i ? 600 : 400, background: tab === i ? '#fff' : 'transparent', color: tab === i ? '#1e293b' : '#64748b', boxShadow: tab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{t}</button>
        ))}
      </div>
      {tab === 0 && <BatchQC live={live} />}
      {tab === 1 && <AIVision live={live} />}
      {tab === 2 && <Compliance />}
      {tab === 3 && <QCReports onGenerate={() => setModal('generateReport')} live={live} />}
      {modal && <FormModal formKey={modal} onClose={closeModal} onSubmit={closeModal} />}
    </div>
  )
}

function BatchQC({ live }) {
  const passRate = live?.kpis?.qualityPassRate ?? 98.6
  const defRate  = live?.kpis?.defectRate ?? 1.4
  const [toast, setToast] = live?.__toast ?? [null, null]
  const [overrides, setOverrides] = useState({})
  const baseTests = [
    { batch:'BT-2026-0422', sku:'Bourbon Biscuits 150g',      param:'Moisture Content',              result:'3.2%',      spec:'≤4.0%',          status:'pass', tester:'Sunita M', time:'09:10' },
    { batch:'BT-2026-0422', sku:'Bourbon Biscuits 150g',      param:'Sugar (Refractometer)',          result:'24.8%',     spec:'22–26%',         status:'pass', tester:'Sunita M', time:'09:18' },
    { batch:'BT-2026-0422', sku:'Bourbon Biscuits 150g',      param:'Net Weight per pack',           result:'151.2g',    spec:'150g ±2g',       status:'pass', tester:'Deepa N',  time:'09:30' },
    { batch:'BT-2026-0422', sku:'Bourbon Biscuits 150g',      param:'Fat Content (Soxhlet)',         result:'18.4%',     spec:'16–20%',         status:'pass', tester:'Deepa N',  time:'09:45' },
    { batch:'BT-2026-0421', sku:'Maggi Noodles 70g',          param:'Salt (NaCl)',                   result:'3.1%',      spec:'2.8–3.2%',       status:'pass', tester:'Ravi K',   time:'07:55' },
    { batch:'BT-2026-0421', sku:'Maggi Noodles 70g',          param:'Moisture (noodle cake)',        result:'9.8%',      spec:'≤10%',           status:'pass', tester:'Ravi K',   time:'08:02' },
    { batch:'BT-2026-0421', sku:'Maggi Noodles 70g',          param:'Cooking Time Test',             result:'2 min',     spec:'≤3 min',         status:'pass', tester:'Ravi K',   time:'08:15' },
    { batch:'BT-2026-0420', sku:'Lays Chips 26g',             param:'Moisture Content',              result:'1.8%',      spec:'≤2.0%',          status:'pass', tester:'Pooja S',  time:'08:14' },
    { batch:'BT-2026-0420', sku:'Lays Chips 26g',             param:'Fat Content (Soxhlet)',         result:'32.4%',     spec:'30–34%',         status:'pass', tester:'Pooja S',  time:'08:22' },
    { batch:'BT-2026-0420', sku:'Lays Chips 26g',             param:'Acid Value (oil rancidity)',    result:'0.28',      spec:'≤0.50',          status:'pass', tester:'Pooja S',  time:'08:35' },
    { batch:'BT-2026-0419', sku:'Frooti 200ml',               param:'Brix (Sugar Level)',            result:'12.4',      spec:'11.5–13.0',      status:'pass', tester:'Arjun P',  time:'09:42' },
    { batch:'BT-2026-0419', sku:'Frooti 200ml',               param:'pH Value',                      result:'3.8',       spec:'3.5–4.2',        status:'pass', tester:'Arjun P',  time:'09:50' },
    { batch:'BT-2026-0419', sku:'Frooti 200ml',               param:'Preservative (Sodium Benzoate)',result:'148 ppm',   spec:'≤200 ppm',       status:'pass', tester:'Deepa N',  time:'10:05' },
    { batch:'BT-2026-0418', sku:'KitKat 18g',                 param:'Cocoa Butter Content',          result:'31.2%',     spec:'30–33%',         status:'pass', tester:'Sunita M', time:'10:20' },
    { batch:'BT-2026-0418', sku:'KitKat 18g',                 param:'Enrobing Thickness',            result:'1.8mm',     spec:'1.5–2.0mm',      status:'pass', tester:'Sunita M', time:'10:28' },
    { batch:'BT-2026-0416', sku:'Cream & Onion Snacks 30g',   param:'Moisture Content',              result:'2.1%',      spec:'≤2.5%',          status:'pass', tester:'Ravi K',   time:'11:00' },
    { batch:'BT-2026-0416', sku:'Cream & Onion Snacks 30g',   param:'Microbiological (TVC)',         result:'FAIL >TVC', spec:'<100 CFU/g',     status:'fail', tester:'Pooja S',  time:'11:40' },
    { batch:'BT-2026-0415', sku:'Orange Squash 750ml',         param:'Pulp Content',                  result:'8.2%',      spec:'7–10%',          status:'pass', tester:'Deepa N',  time:'11:15' },
    { batch:'BT-2026-0414', sku:'Multigrain Digestive 200g',   param:'Dietary Fibre Content',         result:'6.8%',      spec:'≥6.0%',          status:'pass', tester:'Arjun P',  time:'12:05' },
    { batch:'BT-2026-0413', sku:'Instant Veg Hakka Noodles',   param:'Peroxide Value',                result:'3.2 meq/kg',spec:'≤5 meq/kg',      status:'pass', tester:'Ravi K',   time:'12:30' },
  ]
  const tests = baseTests.map((t, i) => overrides[i] ? { ...t, ...overrides[i] } : t)
  const updateTest = (idx, patch) => setOverrides(prev => ({ ...prev, [idx]: { ...prev[idx], ...patch } }))
  const sc = { pass:[ACCENT,'#e6f7f0'], fail:['#ef4444','#fef2f2'], pending:['#f59e0b','#fffbeb'] }
  const passed = tests.filter(t=>t.status==='pass').length
  const failed = tests.filter(t=>t.status==='fail').length
  const pending = tests.filter(t=>t.status==='pending').length
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Tests Today',  v:tests.length,          c:ACCENT    },
          { l:'Pass Rate',    v:`${passRate.toFixed(1)}%`, c:'#10b981' },
          { l:'Failed',       v:failed,                c:'#ef4444' },
          { l:'Pending',      v:pending,               c:'#f59e0b' }
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid #e8ecf1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:13, fontWeight:600 }}>Batch QC Test Results — {tests.length} tests</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { const a=document.createElement('a'); a.href='data:text/csv,Batch,SKU,Parameter,Result,Spec,Status'; a.download='batch_qc_tests.csv'; a.click() }} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Export CSV</button>
            <button onClick={() => { }} style={{ fontSize:12, padding:'6px 13px', borderRadius:7, border:'none', cursor:'pointer', background:'#1a9b6c', color:'#fff', fontWeight:600 }}>Print All Certs</button>
          </div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#f8fafc' }}>
            {['Batch','SKU','Parameter Tested','Result','Specification','Status','Tester','Time','Action'].map(h => (
              <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:12 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {tests.map((t,i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:t.status==='fail'?'#fff5f5':'transparent' }}>
                <td style={{ padding:'11px 16px', fontFamily:'monospace', color:'#64748b', fontSize:11 }}>{t.batch}</td>
                <td style={{ padding:'11px 16px', fontWeight:500, color:'#1e293b', fontSize:12 }}>{t.sku}</td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{t.param}</td>
                <td style={{ padding:'11px 16px', fontWeight:600, color:t.status==='fail'?'#ef4444':'#1e293b' }}>{t.result}</td>
                <td style={{ padding:'11px 16px', color:'#94a3b8', fontSize:12 }}>{t.spec}</td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:600, color:(sc[t.status]||['#64748b','#f1f5f9'])[0], background:(sc[t.status]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20 }}>{t.status}</span></td>
                <td style={{ padding:'11px 16px', color:'#64748b' }}>{t.tester}</td>
                <td style={{ padding:'11px 16px', color:'#94a3b8', fontSize:12 }}>{t.time}</td>
                <td style={{ padding:'11px 16px' }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {t.status==='pending' && <button onClick={() => { updateTest(i,{status:'pass'}); }} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:'#1a9b6c', color:'#fff', fontWeight:600 }}>✓ Pass</button>}
                    {t.status==='pending' && <button onClick={() => { updateTest(i,{status:'fail'}); }} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer', background:'#ef4444', color:'#fff', fontWeight:600 }}>✗ Fail</button>}
                    {t.status==='pass' && <button onClick={() => { }} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Certificate</button>}
                    {t.status==='fail' && <button onClick={() => { updateTest(i,{status:'review'}); }} style={{ fontSize:11, padding:'4px 9px', borderRadius:6, border:'1px solid #f59e0b', cursor:'pointer', background:'#fffbeb', color:'#d97706', fontWeight:600 }}>Re-test</button>}
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

function AIVision({ live }) {
  const defRate   = live?.kpis?.defectRate ?? 1.4
  const inspected = live?.kpis?.todayProduction ?? 48240
  const defects   = Math.round(inspected * defRate / 1000)
  const cameras = [
    { id:'CAM-01', loc:'Line 1 — Post-bake fill check',     status:'online',  fps:60, insp:84200,  defects:24,  acc:'99.8%' },
    { id:'CAM-02', loc:'Line 2 — Noodle cake seal verify',  status:'online',  fps:60, insp:62100,  defects:18,  acc:'99.7%' },
    { id:'CAM-03', loc:'Line 3 — Chips label & barcode',    status:'online',  fps:30, insp:74400,  defects:41,  acc:'99.4%' },
    { id:'CAM-04', loc:'Line 4 — Beverages (idle)',         status:'offline', fps:0,  insp:0,      defects:0,   acc:'—'     },
    { id:'CAM-05', loc:'Line 5 — Sauce fill level check',   status:'online',  fps:30, insp:42800,  defects:12,  acc:'99.9%' },
    { id:'CAM-06', loc:'Line 6 — Chocolate enrobing',       status:'online',  fps:60, insp:63500,  defects:88,  acc:'99.1%' },
    { id:'CAM-07', loc:'Line 7 — Snack pack weight check',  status:'online',  fps:60, insp:78600,  defects:19,  acc:'99.8%' },
    { id:'CAM-08', loc:'WH-A — Outbound pallets scan',      status:'online',  fps:15, insp:1240,   defects:4,   acc:'99.7%' },
    { id:'CAM-09', loc:'WH-B — Inbound GRN scanning',       status:'warning', fps:15, insp:886,    defects:2,   acc:'99.5%' },
  ]
  const stc = { online:[ACCENT,'#e6f7f0'], warning:['#f59e0b','#fffbeb'], offline:['#ef4444','#fef2f2'] }
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Total Cameras', v:`${cameras.length} / 9`,    c:ACCENT    },
          { l:'Online',        v:cameras.filter(c=>c.status==='online').length, c:'#10b981' },
          { l:'Defects Today', v:defects,                    c:'#f59e0b' },
          { l:'Avg Accuracy',  v:'99.6%',                    c:'#3b82f6' }
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, padding:'18px 20px' }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:16 }}>AI Vision Camera Status</div>
        {cameras.map((cam,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<cameras.length-1?'1px solid #f1f5f9':'none' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:(stc[cam.status]||['#94a3b8','#f1f5f9'])[0], flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#1e293b' }}>{cam.id} · {cam.loc}</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>
                {cam.fps > 0 ? `${cam.fps}fps · ${cam.insp.toLocaleString()} inspected · ${cam.defects} defects · Accuracy ${cam.acc}` : 'Camera offline — not inspecting'}
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:(stc[cam.status]||['#94a3b8','#f1f5f9'])[0], background:(stc[cam.status]||['#94a3b8','#f1f5f9'])[1], padding:'2px 8px', borderRadius:20 }}>{cam.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Compliance() {
  const checks = [
    { std:'FSSAI Manufacturing License',    status:'compliant', exp:'31 Mar 2027',  score:100, last:'01 Jan 2026',  authority:'FSSAI, Ministry of Health & Family Welfare' },
    { std:'ISO 22000:2018 — Food Safety',   status:'compliant', exp:'15 Jun 2027',  score:96,  last:'15 Dec 2025',  authority:'Bureau Veritas Certification India' },
    { std:'HACCP Plan — Annual Review',     status:'review',    exp:'Annual',       score:88,  last:'10 Feb 2026',  authority:'Internal QA Audit Team' },
    { std:'Good Manufacturing Practices',   status:'compliant', exp:'Annual',       score:93,  last:'05 Jan 2026',  authority:'FSSAI Food Safety Inspector' },
    { std:'BIS IS 1011 Certification',      status:'compliant', exp:'28 Feb 2027',  score:100, last:'28 Feb 2024',  authority:'Bureau of Indian Standards' },
    { std:'FSSC 22000 — Food Safety Sys.',  status:'pending',   exp:'In progress',  score:72,  last:'Audit: Apr 26',authority:'SGS India Pvt Ltd' },
    { std:'Halal Certification (AHFC)',     status:'compliant', exp:'30 Sep 2026',  score:100, last:'01 Oct 2023',  authority:'Association of Halal Certification' },
    { std:'Kosher Certification (KF)',      status:'compliant', exp:'31 Dec 2026',  score:98,  last:'01 Jan 2024',  authority:'KF Kosher India Pvt Ltd' },
    { std:'ISO 14001 — Environmental',     status:'review',    exp:'22 Aug 2026',  score:84,  last:'22 Aug 2023',  authority:'DNV GL Business Assurance India' },
    { std:'OHSAS 18001 — Occupational Safety', status:'compliant', exp:'14 Nov 2026',score:91, last:'14 Nov 2023',  authority:'BSI Group India Pvt Ltd' },
  ]
  const sc = { compliant:[ACCENT,'#e6f7f0'], review:['#f59e0b','#fffbeb'], pending:['#3b82f6','#eff6ff'] }
  const compliant = checks.filter(c=>c.status==='compliant').length
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[{ l:'Fully Compliant', v:compliant,                     c:ACCENT    },
          { l:'Under Review',   v:checks.filter(c=>c.status==='review').length,  c:'#f59e0b' },
          { l:'In Progress',    v:checks.filter(c=>c.status==='pending').length, c:'#3b82f6' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#1e293b' }}>{s.v} <span style={{ fontSize:14, color:'#94a3b8', fontWeight:400 }}>of {checks.length}</span></div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {checks.map((c,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:'14px 20px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:10, background:(sc[c.status]||['#64748b','#f1f5f9'])[1], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:14, fontWeight:800, color:(sc[c.status]||['#64748b','#f1f5f9'])[0] }}>{c.score}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:3 }}>{c.std}</div>
              <ProgressBar value={c.score} color={(sc[c.status]||['#64748b','#f1f5f9'])[0]} height={5} />
              <div style={{ fontSize:11, color:'#94a3b8' }}>Expires: {c.exp} · Last audit: {c.last} · {c.authority}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:(sc[c.status]||['#64748b','#f1f5f9'])[0], background:(sc[c.status]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QCReports({ onGenerate, live }) {
  const [reports, setReports] = useState([
    { name:'Daily QC Summary — 24 Mar 2026',      type:'Daily',    lines:'All Lines', pass:97,  date:'24 Mar 2026', size:'1.8 MB', isNew:false },
    { name:'Batch BT-2026-0421 QC Certificate',   type:'Batch',    lines:'Line 2',    pass:100, date:'24 Mar 2026', size:'0.9 MB', isNew:false },
    { name:'Weekly QC Summary — W11 2026',         type:'Weekly',   lines:'All Lines', pass:96,  date:'22 Mar 2026', size:'4.2 MB', isNew:false },
    { name:'Batch BT-2026-0420 QC Certificate',   type:'Batch',    lines:'Line 3',    pass:100, date:'22 Mar 2026', size:'0.8 MB', isNew:false },
    { name:'ISO 22000 Internal Audit Report',      type:'Regulatory',lines:'All',     pass:93,  date:'15 Mar 2026', size:'8.4 MB', isNew:false },
    { name:'Monthly QC Trend — February 2026',     type:'Monthly',  lines:'All Lines', pass:95,  date:'01 Mar 2026', size:'6.1 MB', isNew:false },
    { name:'Compliance Summary Q1 2026',           type:'Regulatory',lines:'All',     pass:96,  date:'28 Feb 2026', size:'12.8 MB',isNew:false },
    { name:'HACCP Verification — February 2026',   type:'Regulatory',lines:'All',     pass:88,  date:'14 Feb 2026', size:'3.6 MB', isNew:false },
  ])
  const tc = { Daily:[ACCENT,'#e6f7f0'], Batch:['#3b82f6','#eff6ff'], Weekly:['#8b5cf6','#f5f3ff'], Monthly:['#f59e0b','#fffbeb'], Regulatory:['#ec4899','#fdf2f8'] }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>QC Reports ({reports.length} total)</div>
        <button onClick={onGenerate} style={{ background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Generate Report</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {reports.map((r,i) => (
          <div key={i} style={{ background:r.isNew?'#f0fdf4':'#fff', border:`1px solid ${r.isNew?ACCENT+'40':'#e8ecf1'}`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:9, background:(tc[r.type]||['#64748b','#f1f5f9'])[1], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(tc[r.type]||['#64748b','#f1f5f9'])[0]} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:3 }}>{r.name}{r.isNew && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:ACCENT, background:'#e6f7f0', padding:'1px 6px', borderRadius:20 }}>NEW</span>}</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>Generated {r.date} · {r.lines} · Pass rate: {r.pass}% · {r.size}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:(tc[r.type]||['#64748b','#f1f5f9'])[0], background:(tc[r.type]||['#64748b','#f1f5f9'])[1], padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{r.type}</span>
            <button onClick={() => { const a=document.createElement('a'); a.href='data:application/pdf,'; a.download=r.name.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf'; a.click() }} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'1px solid #e8ecf1', background:'transparent', cursor:'pointer', color:'#64748b' }}>Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}
