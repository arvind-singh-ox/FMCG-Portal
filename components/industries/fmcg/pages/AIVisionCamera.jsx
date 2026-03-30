'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, ProgressBar, LivePulse, BarChart, TrendChip } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

// ─── Mini animated camera feed simulation ────────────────────────────────────
function CameraFeed({ cam, size = 180, active }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const tickRef   = useRef(0)

  useEffect(() => {
    if (!active || cam.status === 'offline') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const productColors = ['#f8e8c8','#f5d5a0','#e8c87a','#f0b860','#d4a060']

    const render = () => {
      tickRef.current++
      const t = tickRef.current

      // Background — conveyor belt
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(0, 0, W, H)

      // Belt lines
      ctx.strokeStyle = '#3a3a3a'
      ctx.lineWidth = 1
      for (let x = (t * 2) % 20; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }

      // Moving products on belt
      const numProducts = 3
      for (let i = 0; i < numProducts; i++) {
        const baseX  = ((t * 1.5 + i * (W / numProducts)) % (W + 60)) - 30
        const prodW  = 44, prodH = 30
        const y      = H / 2 - prodH / 2

        // Product body
        ctx.fillStyle = productColors[i % productColors.length]
        ctx.beginPath()
        ctx.roundRect(baseX, y, prodW, prodH, 4)
        ctx.fill()

        // Label line
        ctx.fillStyle = '#c0941a'
        ctx.fillRect(baseX + 6, y + 8, prodW - 12, 3)
        ctx.fillRect(baseX + 6, y + 14, prodW - 18, 2)

        // Random defect detection flash
        const hasDefect = cam.defects > 30 && (Math.floor(t / 40) % 7 === i)
        if (hasDefect) {
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth   = 2
          ctx.strokeRect(baseX - 2, y - 2, prodW + 4, prodH + 4)
          // Red corner brackets
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 2.5
          const br = 8
          ;[[baseX - 4, y - 4], [baseX + prodW - br + 4, y - 4], [baseX - 4, y + prodH - br + 4], [baseX + prodW - br + 4, y + prodH - br + 4]].forEach(([bx, by]) => {
            ctx.strokeRect(bx, by, br, br)
          })
        }
      }

      // Scan line
      const scanY = (t * 3) % H
      const grad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(0.5, `${cam.status === 'warning' ? '#f59e0b' : '#10b981'}60`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 6, W, 12)

      // Corner brackets (viewfinder)
      ctx.strokeStyle = `${cam.status === 'warning' ? '#f59e0b' : '#10b981'}`
      ctx.lineWidth = 2
      const bl = 14
      ;[[4, 4], [W - bl - 4, 4], [4, H - bl - 4], [W - bl - 4, H - bl - 4]].forEach(([x, y], qi) => {
        ctx.beginPath()
        ctx.moveTo(x + (qi % 2 === 0 ? 0 : bl), y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y + (qi < 2 ? bl : 0) + (qi >= 2 ? 0 : 0))
        ctx.lineTo(x, y + bl)
        ctx.stroke()
      })

      // FPS / REC indicator
      ctx.fillStyle = '#ef4444'
      ctx.beginPath(); ctx.arc(W - 14, 10, 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 8px monospace'
      ctx.fillText('REC', W - 10 - ctx.measureText('REC').width, 13)
      ctx.fillStyle = '#00ff88'
      ctx.fillText(`${cam.fps}fps`, 6, 13)

      animRef.current = requestAnimationFrame(render)
    }
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, cam])

  if (cam.status === 'offline') {
    return (
      <div style={{ width: size, height: size * 0.6, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h2a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.77 9.63"/></svg>
        <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>OFFLINE</span>
      </div>
    )
  }

  return <canvas ref={canvasRef} width={size} height={size * 0.6} style={{ borderRadius: 8, display: 'block' }} />
}

// ─── Integration flow diagram ─────────────────────────────────────────────────
function IntegrationFlow() {
  const [activeStep, setActiveStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % 6), 2200)
    return () => clearInterval(id)
  }, [])

  const steps = [
    { icon: '📹', title: 'Camera Capture',      desc: 'UHD cameras at 60fps capture every product unit on moving conveyor belt — Biscuits, Chips, Noodles packs',               color: '#3b82f6' },
    { icon: '⚡', title: 'Edge Preprocessing',   desc: 'On-camera edge AI (Jetson Orin) normalises frame, crops ROI, filters motion blur at <3ms latency',                    color: '#8b5cf6' },
    { icon: '🧠', title: 'CNN Inference',         desc: 'YOLOv8-based defect model runs on NVIDIA GPU — detects seal failures, weight deviation, label misprint, contamination',color: ACCENT    },
    { icon: '🎯', title: 'Defect Classification', desc: 'Detected defects classified: Seal Fail, Under-weight, Wrong Label, Foreign Object, Colour Deviation, Shape Defect',    color: '#f59e0b' },
    { icon: '🔀', title: 'Rejection / Alert',     desc: 'Pass units continue to packaging. Defect units trigger pneumatic ejector within 80ms. QC dashboard alerted in real-time',color: '#ef4444'},
    { icon: '📊', title: 'FMCG Analytics',        desc: 'Defect data fed to batch QC report, FSSAI traceability log, production dashboard and SAP quality module automatically',  color: '#10b981' },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>AI Vision Integration Workflow — FMCG Production Line</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>End-to-end automated quality inspection: Camera → Edge AI → CNN Model → Action → Traceability</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
            <div
              onClick={() => setActiveStep(i)}
              style={{
                width: 148, cursor: 'pointer',
                padding: '14px 12px', borderRadius: 12, textAlign: 'center',
                background: activeStep === i ? step.color + '15' : '#f8fafc',
                border: `2px solid ${activeStep === i ? step.color : '#e8ecf1'}`,
                transition: 'all 0.3s',
                transform: activeStep === i ? 'scale(1.04)' : 'scale(1)',
                boxShadow: activeStep === i ? `0 4px 20px ${step.color}30` : 'none',
              }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: activeStep === i ? step.color : '#1e293b', marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>{step.desc}</div>
              <div style={{ marginTop: 8, width: '100%', height: 3, background: '#f1f5f9', borderRadius: 2 }}>
                {activeStep === i && <div style={{ height: '100%', background: step.color, borderRadius: 2, animation: 'stepfill 2.2s linear forwards' }} />}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 32, flexShrink: 0 }}>
                <svg width="28" height="16" viewBox="0 0 28 16">
                  <line x1="2" y1="8" x2="22" y2="8" stroke={i < activeStep ? step.color : '#e2e8f0'} strokeWidth="2.5" strokeDasharray={i === activeStep - 1 ? 'none' : '4 2'} style={{ transition: 'stroke 0.4s' }} />
                  <polyline points="16,3 22,8 16,13" fill="none" stroke={i < activeStep ? step.color : '#e2e8f0'} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'stroke 0.4s' }} />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`@keyframes stepfill{from{width:0}to{width:100%}}`}</style>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIVisionCamera() {
  const live = useLiveData()
  const [activeCam, setActiveCam] = useState(0)
  const [toast, setToast] = useState('')

  const cameras = [
    { id:'CAM-01', line:'Line 1 — Post-bake fill check',    status:'online',  fps:60,  insp:84200,  defects:24,  acc:99.8, product:'Bourbon Biscuits 150g',    defectTypes:['Seal Fail','Weight Dev','Label Misprint'] },
    { id:'CAM-02', line:'Line 2 — Noodle cake seal verify', status:'online',  fps:60,  insp:62100,  defects:18,  acc:99.7, product:'Maggi Noodles 70g',         defectTypes:['Seal Fail','Shape Defect'] },
    { id:'CAM-03', line:'Line 3 — Chips label & barcode',   status:'online',  fps:30,  insp:74400,  defects:41,  acc:99.4, product:'Lays Chips 26g',            defectTypes:['Label Misprint','Barcode Fail','Weight Dev'] },
    { id:'CAM-04', line:'Line 4 — Beverages (idle)',        status:'offline', fps:0,   insp:0,      defects:0,   acc:0,    product:'Frooti 200ml',              defectTypes:[] },
    { id:'CAM-05', line:'Line 5 — Sauce fill level',        status:'online',  fps:30,  insp:42800,  defects:12,  acc:99.9, product:'Sauce 200g',                defectTypes:['Fill Level','Seal Fail'] },
    { id:'CAM-06', line:'Line 6 — Chocolate enrobing',      status:'online',  fps:60,  insp:63500,  defects:88,  acc:99.1, product:'KitKat 18g',                defectTypes:['Enrobing Thin','Weight Dev','Seal Fail','Shape Defect'] },
    { id:'CAM-07', line:'Line 7 — Snack weight check',      status:'online',  fps:60,  insp:78600,  defects:19,  acc:99.8, product:'Cream & Onion Snacks 30g', defectTypes:['Weight Dev','Seal Fail'] },
    { id:'CAM-08', line:'WH-A — Outbound pallet scan',      status:'online',  fps:15,  insp:1240,   defects:4,   acc:99.7, product:'All outbound SKUs',         defectTypes:['Barcode Fail','Damaged Pack'] },
    { id:'CAM-09', line:'WH-B — Inbound GRN scanning',      status:'warning', fps:15,  insp:886,    defects:2,   acc:99.5, product:'Incoming raw materials',    defectTypes:['Barcode Fail'] },
  ]

  const totInsp   = cameras.reduce((s, c) => s + c.insp, 0)
  const totDefects = cameras.reduce((s, c) => s + c.defects, 0)
  const online    = cameras.filter(c => c.status === 'online').length
  const avgAcc    = cameras.filter(c => c.acc > 0).reduce((s, c) => s + c.acc, 0) / cameras.filter(c => c.acc > 0).length

  const stc = { online: [ACCENT, '#e6f7f0'], warning: ['#f59e0b', '#fffbeb'], offline: ['#ef4444', '#fef2f2'] }
  const safe = (m, k) => m[k] || ['#64748b', '#f1f5f9']
  const cam = cameras[activeCam]

  const defectBreakdown = [
    { label: 'Seal Failure',     value: 48, color: '#ef4444' },
    { label: 'Weight Deviation', value: 32, color: '#f59e0b' },
    { label: 'Label / Barcode',  value: 28, color: '#3b82f6' },
    { label: 'Shape / Size',     value: 18, color: '#8b5cf6' },
    { label: 'Foreign Object',   value: 12, color: '#ec4899' },
    { label: 'Fill Level',       value: 10, color: '#10b981' },
  ]

  return (
    <div>
      <style>{`
        @keyframes scanpulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .cam-card{transition:all 0.2s;cursor:pointer}
        .cam-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)!important}
        .cam-card.active{box-shadow:0 0 0 3px ${ACCENT}!important}
      `}</style>

      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#e6f7f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📸</div>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:'#1e293b' }}>AI Vision Camera System</div>
              <div style={{ fontSize:12, color:'#64748b' }}>Computer vision quality inspection across all FMCG production lines</div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setToast('All camera feeds archived to cloud storage')} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b' }}>Archive Feeds</button>
          <button onClick={() => setToast('Vision system calibration initiated on all online cameras')} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:ACCENT, color:'#fff' }}>Calibrate All</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {[
          { l:'Cameras Online',  v:`${online} / ${cameras.length}`, c:ACCENT,   raw:online     },
          { l:'Inspected Today', v:totInsp.toLocaleString(),          c:'#3b82f6',raw:totInsp    },
          { l:'Defects Caught',  v:totDefects,                        c:'#ef4444',raw:totDefects },
          { l:'Defect Rate',     v:`${((totDefects/totInsp)*100).toFixed(3)}%`,c:'#f59e0b',raw:0},
          { l:'Avg Accuracy',    v:`${avgAcc.toFixed(1)}%`,            c:'#10b981',raw:avgAcc    },
        ].map((s, i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:16, borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Integration workflow */}
      <IntegrationFlow />

      {/* Main layout: camera grid + live feed */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:20 }}>

        {/* Camera selector grid */}
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:12 }}>
            Camera Grid — <LivePulse color="#10b981" label={`${online} online`} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {cameras.map((c, i) => (
              <div key={i} className={`cam-card ${activeCam===i?'active':''}`}
                onClick={() => setActiveCam(i)}
                style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, padding:'14px', borderTop:`3px solid ${safe(stc,c.status)[0]}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#1e293b', fontFamily:'monospace' }}>{c.id}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:safe(stc,c.status)[0], background:safe(stc,c.status)[1], padding:'1px 6px', borderRadius:20 }}>{c.status}</span>
                </div>
                <div style={{ fontSize:10, color:'#64748b', marginBottom:8, lineHeight:1.4 }}>{c.line}</div>
                {c.status !== 'offline' && (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4 }}>
                      <span style={{ color:'#94a3b8' }}>Inspected</span>
                      <span style={{ fontWeight:600, color:'#1e293b' }}>{c.insp.toLocaleString()}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:6 }}>
                      <span style={{ color:'#94a3b8' }}>Defects</span>
                      <span style={{ fontWeight:700, color:c.defects>50?'#ef4444':c.defects>20?'#f59e0b':ACCENT }}>{c.defects}</span>
                    </div>
                    <ProgressBar value={c.acc} color={c.acc>=99.5?ACCENT:c.acc>=99?'#f59e0b':'#ef4444'} height={4} />
                    <div style={{ fontSize:9, color:'#94a3b8', marginTop:2 }}>Accuracy: {c.acc}%</div>
                  </>
                )}
                {activeCam === i && <div style={{ marginTop:6, fontSize:9, color:ACCENT, fontWeight:700 }}>▶ SELECTED</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Live feed + details */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#111', borderRadius:14, padding:'14px', border:'2px solid #1a1a1a' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:700, color:safe(stc,cam.status)[0], fontFamily:'monospace' }}>{cam.id} — LIVE</span>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'scanpulse 1s infinite', display:'inline-block' }}/>
                <span style={{ fontSize:9, color:'#ccc', fontFamily:'monospace' }}>{cam.fps > 0 ? `${cam.fps}fps` : 'OFFLINE'}</span>
              </div>
            </div>
            <CameraFeed cam={cam} size={300} active={true} />
          </div>

          <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:12, padding:'14px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', marginBottom:10 }}>{cam.id} — {cam.product}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              {[['Inspected', cam.insp.toLocaleString()],['Defects', cam.defects],['Accuracy', `${cam.acc}%`],['Frame Rate', `${cam.fps} fps`]].map(([l,v]) => (
                <div key={l} style={{ background:'#f8fafc', borderRadius:7, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'#94a3b8', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{v}</div>
                </div>
              ))}
            </div>
            {cam.defectTypes.length > 0 && (
              <div>
                <div style={{ fontSize:10, color:'#94a3b8', marginBottom:6, fontWeight:600 }}>DEFECT TYPES DETECTED</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {cam.defectTypes.map(d => <span key={d} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#fef2f2', color:'#ef4444', fontWeight:600 }}>{d}</span>)}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <button onClick={() => setToast(`${cam.id} — calibration command sent`)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'none', cursor:'pointer', background:ACCENT, color:'#fff', fontWeight:600 }}>Calibrate</button>
              <button onClick={() => setToast(`${cam.id} — last 100 defect frames downloaded`)} style={{ flex:1, fontSize:11, padding:'6px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b' }}>Download Frames</button>
            </div>
          </div>
        </div>
      </div>

      {/* Defect breakdown + hourly trend */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:14 }}>Defect type breakdown — today</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {defectBreakdown.map((d, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                  <span style={{ color:'#1e293b', fontWeight:500 }}>{d.label}</span>
                  <span style={{ fontWeight:700, color:d.color }}>{d.value}</span>
                </div>
                <ProgressBar value={d.value} max={defectBreakdown[0].value} color={d.color} height={7} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:12 }}>Inspections per line (today)</div>
          <BarChart
            data={cameras.filter(c=>c.insp>0).map(c => ({ label:c.id, value:c.insp, color:c.defects>50?'#ef4444':c.defects>20?'#f59e0b':ACCENT }))}
            height={180} formatVal={v => (v/1000).toFixed(0)+'K'}
          />
        </div>
      </div>
    </div>
  )
}
