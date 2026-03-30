'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, ProgressBar, LivePulse, LineChart, RingGauge, BarChart, TrendChip } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

// ─── Failure probability gauge ────────────────────────────────────────────────
function HealthMeter({ value, size = 90 }) {
  const color = value >= 80 ? ACCENT : value >= 55 ? '#f59e0b' : '#ef4444'
  return <RingGauge value={value} max={100} size={size} color={color} label="health" sublabel={`${value}%`} />
}

// ─── FMCG Integration process ─────────────────────────────────────────────────
function PMIntegrationFlow() {
  const [active, setActive] = useState(0)
  useEffect(() => { const id = setInterval(() => setActive(s => (s+1)%7), 2100); return () => clearInterval(id) }, [])

  const steps = [
    { icon:'📡', title:'Sensor Data Collection',    desc:'Vibration, temperature, current, pressure sensors on all FMCG machines collect real-time data at 50Hz — Mixers, Extruders, Fryers, Sealing units',                       color:'#3b82f6', fmcg:'Frying Unit FU-1: temp at 175°C, vibration 0.8 mm/s, current 42A'  },
    { icon:'🔢', title:'Feature Engineering',        desc:'Raw signals transformed: FFT for vibration frequency analysis, rolling mean/std for thermal drift, current signature analysis for motor degradation patterns',              color:'#8b5cf6', fmcg:'FFT shows bearing defect at 4.2× ball spin frequency — early wear signal' },
    { icon:'🧠', title:'ML Model Inference',         desc:'LSTM + Random Forest ensemble trained on 36 months of FMCG machine history predicts RUL (Remaining Useful Life) and failure type classification',                          color:ACCENT,    fmcg:'Conveyor Belt CB4: RUL = 14 hrs, Failure type: "Belt Bearing Wear"'       },
    { icon:'⚠️', title:'Risk Stratification',        desc:'Each machine assigned health score (0–100) and failure window. High risk: <30 hrs. Medium: 30–72 hrs. Low: >72 hrs. FMCG-specific thresholds for food safety',            color:'#f59e0b', fmcg:'Packaging M-4A: Score 58, window 22 hrs — pre-failure seal jaw drift'     },
    { icon:'📋', title:'PM Work Order Generation',   desc:'System auto-generates structured WO with: asset ID, failure type, required tools, spare parts list from inventory, technician assignment based on skill and shift',        color:'#10b981', fmcg:'WO-2026-1148: Packaging M-4A seal jaw replacement — Anita M, Shift B'     },
    { icon:'🔧', title:'Technician Execution',       desc:'Technician receives WO via mobile app, confirms receipt, executes maintenance, logs actual time and parts used, confirms completion with sensor validation',                 color:'#ec4899', fmcg:'Anita M confirms seal jaw replaced, runs 200-unit test batch, zero defects' },
    { icon:'♻️', title:'Model Retraining Loop',       desc:'Post-maintenance sensor data fed back to ML model for continuous learning. Each repair improves prediction accuracy — FMCG plant-specific model gets smarter over time',  color:'#64748b', fmcg:'Model updated: seal jaw failure signature added, accuracy +0.3% to 94.1%'  },
  ]

  return (
    <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:14, padding:'24px', marginBottom:20 }}>
      <div style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:4 }}>AI Predictive Maintenance — FMCG Integration Cycle</div>
      <div style={{ fontSize:12, color:'#64748b', marginBottom:20 }}>7-step closed-loop cycle: Sensor data → ML prediction → Auto work order → Execution → Model learning</div>

      <div style={{ display:'flex', gap:0, overflowX:'auto', paddingBottom:8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', flexShrink:0 }}>
            <div onClick={() => setActive(i)} style={{
              width:152, padding:'14px 11px', borderRadius:12, textAlign:'center', cursor:'pointer',
              background: active===i ? `${s.color}12` : '#f8fafc',
              border:`2px solid ${active===i ? s.color : '#e8ecf1'}`,
              transition:'all 0.3s',
              transform: active===i ? 'scale(1.04)' : 'scale(1)',
              boxShadow: active===i ? `0 4px 20px ${s.color}30` : 'none',
            }}>
              <div style={{ fontSize:26, marginBottom:7 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:active===i?s.color:'#1e293b', marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:9.5, color:'#64748b', lineHeight:1.5, marginBottom:8 }}>{s.desc}</div>
              {active===i && <div style={{ fontSize:9, color:s.color, background:`${s.color}10`, borderRadius:6, padding:'4px 6px', lineHeight:1.4, fontWeight:500 }}>📌 {s.fmcg}</div>}
              <div style={{ marginTop:8, height:2, background:'#f1f5f9', borderRadius:1 }}>
                {active===i && <div style={{ height:'100%', background:s.color, animation:'stepfill 2.1s linear forwards', borderRadius:1 }}/>}
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ display:'flex', alignItems:'center', paddingTop:32, flexShrink:0 }}>
                <svg width="24" height="14" viewBox="0 0 24 14">
                  <line x1="2" y1="7" x2="18" y2="7" stroke={i<active?s.color:'#e2e8f0'} strokeWidth="2" strokeDasharray={i===active-1?'':'4 2'} style={{ transition:'stroke 0.4s' }}/>
                  <polyline points="13,2 19,7 13,12" fill="none" stroke={i<active?s.color:'#e2e8f0'} strokeWidth="2" strokeLinejoin="round" style={{ transition:'stroke 0.4s' }}/>
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

export default function AIPredictiveMaintenance() {
  const live = useLiveData()
  const [toast, setToast] = useState('')
  const [scheduledIds, setScheduledIds] = useState(new Set())
  const [history, setHistory] = useState({ health:[], downtime:[] })

  useEffect(() => {
    setHistory(prev => ({
      health:   [...prev.health.slice(-19),   live.oee.avail],
      downtime: [...prev.downtime.slice(-19), live.oee.downtime],
    }))
  }, [live.tick])

  const assets = live.machines.map((m, i) => {
    const health = m.status==='maintenance' ? 0 : m.status==='warning' ? Math.round(40 + m.load*0.35) : Math.round(72 + m.load*0.27)
    const rul = m.status==='maintenance' ? 0 : m.status==='warning' ? Math.round(10 + Math.random()*20) : Math.round(48 + Math.random()*96)
    const riskProb = m.status==='warning' ? Math.round(55+Math.random()*30) : m.status==='maintenance' ? 95 : Math.round(5+Math.random()*30)
    const failureMode = ['Bearing Wear','Seal Leakage','Motor Overload','Belt Tracking','Thermocouple Drift','Gearbox Oil'][i % 6]
    return { ...m, health, rul, riskProb, failureMode, nextPM: ['15 Apr','28 Mar','10 Apr','2 Apr','20 Apr','25 Apr','30 Apr','In maint.'][i] }
  })

  const riskColor = (r) => r >= 70 ? '#ef4444' : r >= 40 ? '#f59e0b' : ACCENT
  const riskLabel = (r) => r >= 70 ? 'High Risk' : r >= 40 ? 'Medium' : 'Low Risk'

  const schedule = (a) => {
    setScheduledIds(prev => new Set([...prev, a.id]))
    live.actions?.addPMSchedule?.({ asset: a.name, task: `Predictive PM — ${a.failureMode}`, freq: 'One-time', tech: 'Ramesh K', nextDue: 'Today', estTime: 2 })
    setToast(`PM scheduled for ${a.name} — WO raised for ${a.failureMode}`)
  }

  const insights = [
    { machine:'Frying Unit FU-1',     signal:'Vibration 3.4 mm/s (+28% vs baseline)',     model:'Bearing defect at 4.2× BSF frequency — outer race wear',    risk:'high',   saving:'Prevents 18hr unplanned downtime — ₹4.2L loss avoided' },
    { machine:'Conveyor Belt CB4',    signal:'Temperature spike 72°C (+7°C over 24hrs)',   model:'Belt bearing thermal runaway pattern — 12hr failure window',  risk:'high',   saving:'Prevents belt snapping — ₹2.8L + product waste avoided' },
    { machine:'Packaging M-4A',       signal:'Seal jaw current +14% above normal',         model:'Seal jaw misalignment → heating element fatigue failure',     risk:'medium', saving:'Prevents 3.2% defect rate increase — ₹1.8L QC cost' },
    { machine:'Extruder EX-2',        signal:'Screw torque variance ±18% (norm: ±8%)',     model:'Screw wear increasing — texture inconsistency in noodles',    risk:'medium', saving:'Prevents product quality failure — ₹1.1L recall risk' },
    { machine:'Blending Tank BT1',    signal:'Agitator current signature anomaly',          model:'Shaft seal beginning to deteriorate — oil contamination risk', risk:'medium', saving:'Prevents FSSAI contamination incident — ₹6L risk' },
  ]

  const monthlySavings = [
    { label:'Jan', value:8.4, color:ACCENT },
    { label:'Feb', value:11.2,color:ACCENT },
    { label:'Mar', value:9.8, color:ACCENT },
    { label:'Apr', value:14.6,color:'#3b82f6'},
    { label:'May', value:12.1,color:'#e6f7f0'},
    { label:'Jun', value:13.8,color:'#e6f7f0'},
  ]

  return (
    <div>
      <style>{`@keyframes riskpulse{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>

      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#f59e0b30,#ef444430)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'1px solid #f59e0b40' }}>🔮</div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:'#1e293b' }}>AI Predictive Maintenance</div>
            <LivePulse color="#f59e0b" label="ML model active — predicting failures before they happen" />
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { assets.filter(a=>a.riskProb>40).forEach(a => schedule(a)); setToast('All medium/high risk assets — PMs auto-scheduled') }} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b' }}>Auto-Schedule All</button>
          <button onClick={() => setToast('Predictive maintenance report exported — sent to Plant Manager')} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:ACCENT, color:'#fff' }}>Export Report</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {[
          { l:'Assets Monitored',     v:'8 / 8',    c:ACCENT,    icon:'⚙️' },
          { l:'Failures Predicted',   v:5,          c:'#ef4444', icon:'🔮' },
          { l:'WOs Auto-Raised',      v:3,          c:'#f59e0b', icon:'📋' },
          { l:'Savings This Month',   v:'₹9.8L',    c:'#10b981', icon:'💰' },
          { l:'Model Accuracy',       v:'94.1%',    c:'#3b82f6', icon:'🎯' },
        ].map((s, i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:10, padding:'14px 16px', borderTop:`3px solid ${s.c}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase' }}>{s.l}</div>
              <span style={{ fontSize:16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Integration flow */}
      <PMIntegrationFlow />

      {/* Asset health grid */}
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>Asset Health Dashboard — Real-time ML Assessment</div>
            <div style={{ fontSize:12, color:'#64748b' }}>Health score = composite of vibration, temperature, current draw, runtime hours</div>
          </div>
          <LivePulse color={ACCENT} label="Updating every 3s" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {assets.map((a, i) => (
            <div key={i} style={{
              border:`1px solid ${riskColor(a.riskProb)}40`, borderRadius:12, padding:'16px',
              background:`${riskColor(a.riskProb)}06`,
              borderTop:`3px solid ${riskColor(a.riskProb)}`,
              transition:'all 0.4s',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>{a.name}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>{a.line}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:riskColor(a.riskProb), background:`${riskColor(a.riskProb)}18`, padding:'2px 7px', borderRadius:20, height:'fit-content', animation:a.riskProb>=70?'riskpulse 1.5s infinite':'none' }}>
                  {riskLabel(a.riskProb)}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                <HealthMeter value={a.health} size={80} />
              </div>
              <ProgressBar value={a.riskProb} max={100} color={riskColor(a.riskProb)} height={5} />
              <div style={{ fontSize:9, color:'#94a3b8', marginTop:3, marginBottom:8 }}>Failure probability: {a.riskProb}%</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginBottom:10 }}>
                {[['RUL', a.rul===0?'In maint.':`${a.rul}h`], ['Next PM', a.nextPM], ['Mode', a.failureMode], ['Temp', `${a.temp}°C`]].map(([l,v]) => (
                  <div key={l} style={{ background:'#f8fafc', borderRadius:6, padding:'5px 7px' }}>
                    <div style={{ fontSize:8, color:'#94a3b8', marginBottom:1 }}>{l}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                  </div>
                ))}
              </div>
              {!scheduledIds.has(a.id) && a.riskProb >= 40 && (
                <button onClick={() => schedule(a)} style={{ width:'100%', fontSize:11, padding:'6px', borderRadius:7, border:'none', cursor:'pointer', background:riskColor(a.riskProb), color:'#fff', fontWeight:600 }}>Schedule PM</button>
              )}
              {scheduledIds.has(a.id) && <div style={{ fontSize:11, color:ACCENT, fontWeight:600, textAlign:'center' }}>✓ PM Scheduled</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Predictive insights + Savings chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:16 }}>
        <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:14 }}>ML Anomaly Insights — Active Predictions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ padding:'14px 16px', borderRadius:10, background:ins.risk==='high'?'#fff5f5':'#fffbeb', border:`1px solid ${ins.risk==='high'?'#fecaca':'#fde68a'}`, borderLeft:`4px solid ${riskColor(ins.risk==='high'?80:55)}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{ins.machine}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:riskColor(ins.risk==='high'?80:55), background:`${riskColor(ins.risk==='high'?80:55)}18`, padding:'2px 8px', borderRadius:20 }}>{ins.risk} risk</span>
                </div>
                <div style={{ fontSize:11, color:'#f59e0b', fontWeight:600, marginBottom:3 }}>📡 Signal: {ins.signal}</div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>🧠 Model: {ins.model}</div>
                <div style={{ fontSize:11, color:ACCENT, fontWeight:600 }}>💰 {ins.saving}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:4 }}>Monthly savings — predicted PM vs breakdown cost (₹L)</div>
            <BarChart data={monthlySavings} height={140} barColor={ACCENT} formatVal={v => `₹${v}L`} />
          </div>
          {history.health.length > 2 && (
            <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:8 }}>Availability trend (live)</div>
              <LineChart
                series={[{ name:'Availability %', data:history.health, color:ACCENT },
                         { name:'Downtime (×10 hrs)', data:history.downtime.map(v=>v*10), color:'#ef4444' }]}
                height={120}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
