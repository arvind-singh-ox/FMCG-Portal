'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, ProgressBar, LivePulse, LineChart, RingGauge, TrendChip } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

// ─── Animated plant floor SVG ─────────────────────────────────────────────────
function PlantFloorTwin({ live }) {
  const lines = live.lines
  const machines = live.machines

  const layout = [
    { id:'L1', x:40,  y:50,  w:160, h:44, label:'Line 1 — Biscuits' },
    { id:'L2', x:40,  y:110, w:160, h:44, label:'Line 2 — Noodles'  },
    { id:'L3', x:40,  y:170, w:160, h:44, label:'Line 3 — Chips'    },
    { id:'L5', x:240, y:50,  w:160, h:44, label:'Line 5 — Sauce'    },
    { id:'L6', x:240, y:110, w:160, h:44, label:'Line 6 — Choc.'    },
    { id:'L7', x:240, y:170, w:160, h:44, label:'Line 7 — Snacks'   },
    { id:'L4', x:440, y:50,  w:120, h:44, label:'Line 4 — Bev.'     },
    { id:'L8', x:440, y:110, w:120, h:44, label:'Line 8 — Juices'   },
  ]

  const getLine = (id) => lines.find(l => l.id === id) || { eff: 0, status: 'idle' }
  const statusColor = { running: ACCENT, idle: '#94a3b8', maintenance: '#f59e0b', stopped: '#ef4444' }
  const [pulse, setPulse] = useState(false)
  useEffect(() => { const id = setInterval(() => setPulse(p => !p), 1500); return () => clearInterval(id) }, [])

  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 80); return () => clearInterval(id) }, [])

  return (
    <svg viewBox="0 0 620 260" style={{ width:'100%', height:'auto', display:'block' }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        {layout.map(l => {
          const ln = getLine(l.id)
          const col = statusColor[ln.status] || '#94a3b8'
          return (
            <linearGradient key={l.id} id={`g${l.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={col} stopOpacity="0.3"/>
              <stop offset={`${ln.eff || 0}%`} stopColor={col} stopOpacity="0.5"/>
              <stop offset={`${ln.eff || 0}%`} stopColor="#f1f5f9" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.3"/>
            </linearGradient>
          )
        })}
      </defs>

      {/* Plant outline */}
      <rect x="20" y="20" width="580" height="220" rx="10" fill="#0f172a" opacity="0.94"/>
      <rect x="20" y="20" width="580" height="220" rx="10" fill="none" stroke="#334155" strokeWidth="1"/>

      {/* Grid */}
      {[80,140,200].map(y => <line key={y} x1="20" y1={y+20} x2="600" y2={y+20} stroke="#1e293b" strokeWidth="0.5"/>)}
      {[220,420].map(x => <line key={x} x1={x} y1="20" x2={x} y2="240" stroke="#1e293b" strokeWidth="0.5"/>)}

      {/* Labels */}
      <text x="30" y="38" fontSize="8" fill="#475569" fontWeight="600">PLANT FLOOR — DIGITAL TWIN</text>
      <text x="450" y="38" fontSize="7" fill="#64748b">REAL-TIME SYNC</text>
      <circle cx="570" cy="33" r="4" fill={pulse ? '#10b981' : '#064e3b'} filter="url(#glow)" style={{ transition:'fill 0.3s' }}/>

      {/* Production lines */}
      {layout.map(l => {
        const ln = getLine(l.id)
        const col = statusColor[ln.status] || '#94a3b8'
        const isRunning = ln.status === 'running'
        const conveyorOffset = (tick * (isRunning ? 2 : 0)) % 20

        return (
          <g key={l.id}>
            {/* Line background */}
            <rect x={l.x} y={l.y} width={l.w} height={l.h} rx="6" fill={`url(#g${l.id})`} stroke={col} strokeWidth={isRunning ? 1.5 : 0.8} opacity="0.9"/>

            {/* Conveyor belt animation */}
            {isRunning && (
              <g clipPath={`url(#clip${l.id})`}>
                <defs><clipPath id={`clip${l.id}`}><rect x={l.x+2} y={l.y+2} width={l.w-4} height={l.h-4} rx="5"/></clipPath></defs>
                {[0,20,40,60,80,100,120,140,160].map(bx => (
                  <line key={bx}
                    x1={l.x + ((bx - conveyorOffset + l.w) % l.w)} y1={l.y + l.h*0.4}
                    x2={l.x + ((bx - conveyorOffset + l.w) % l.w)} y2={l.y + l.h*0.6}
                    stroke={col} strokeWidth="0.7" opacity="0.5"
                  />
                ))}
                {/* Products moving */}
                {[0, 1, 2].map(pi => {
                  const px = l.x + 12 + ((tick * 1.5 + pi * (l.w/3)) % (l.w - 20))
                  return <rect key={pi} x={px} y={l.y+14} width="18" height="12" rx="2" fill={col} opacity="0.7"/>
                })}
              </g>
            )}

            {/* Label */}
            <text x={l.x + 6} y={l.y + 12} fontSize="7" fill="#e2e8f0" fontWeight="600">{l.label}</text>

            {/* Efficiency */}
            <text x={l.x + l.w - 4} y={l.y + 12} fontSize="8" fill={col} fontWeight="700" textAnchor="end">{ln.eff ? `${ln.eff}%` : ln.status}</text>

            {/* Status dot */}
            <circle cx={l.x + l.w - 6} cy={l.y + l.h - 10} r="4" fill={col} opacity={pulse&&isRunning ? 0.5 : 1} filter={isRunning?"url(#glow)":"none"}/>
          </g>
        )
      })}

      {/* Cold storage block */}
      <rect x="440" y="170" width="120" height="80" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" opacity="0.9"/>
      <text x="446" y="188" fontSize="7" fill="#93c5fd" fontWeight="600">COLD STORAGE</text>
      <text x="446" y="200" fontSize="6" fill="#64748b">Rooms: A B C</text>
      {live.coldStorage?.slice(0,2).map((cs, i) => (
        <g key={i}>
          <text x={446 + i*56} y={216} fontSize="7" fill={Math.abs(cs.temp - cs.setTemp) > 1.5 ? '#fbbf24' : '#34d399'} fontWeight="700">{cs.temp}°C</text>
          <text x={446 + i*56} y={225} fontSize="6" fill="#64748b">{cs.name.split(' ')[0]} {cs.name.split(' ')[1]}</text>
        </g>
      ))}

      {/* Warehouse block */}
      <rect x="20" y="230" width="200" height="35" rx="6" fill="#1a2535" stroke="#334155" strokeWidth="0.8"/>
      <text x="26" y="244" fontSize="7" fill="#94a3b8" fontWeight="600">WAREHOUSE — WH-A & WH-B</text>
      <text x="26" y="254" fontSize="6" fill="#64748b">18 raw materials · 12 finished SKUs</text>

      {/* Boiler / utilities */}
      <rect x="230" y="230" width="100" height="35" rx="6" fill="#1a2535" stroke="#f59e0b" strokeWidth="0.8" opacity="0.8"/>
      <text x="236" y="244" fontSize="7" fill="#fbbf24" fontWeight="600">UTILITIES</text>
      <text x="236" y="254" fontSize="6" fill="#64748b">Boiler · Comp. · Generator</text>

      {/* Fleet yard */}
      <rect x="340" y="230" width="120" height="35" rx="6" fill="#1a2535" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.8"/>
      <text x="346" y="244" fontSize="7" fill="#a78bfa" fontWeight="600">FLEET YARD</text>
      <text x="346" y="254" fontSize="6" fill="#64748b">{live.fleet?.filter(v=>v.status==='moving').length || 3} vehicles on road</text>

      {/* Data flow arrows */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={ACCENT} opacity="0.6"/>
        </marker>
      </defs>
      {[{x1:200,y1:72,x2:240,y2:72},{x1:200,y1:132,x2:240,y2:132},{x1:200,y1:192,x2:240,y2:192},{x1:400,y1:72,x2:440,y2:72},{x1:400,y1:132,x2:440,y2:132}].map((a,i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={ACCENT} strokeWidth="1" opacity="0.4" strokeDasharray="3 2" markerEnd="url(#arr)"/>
      ))}
    </svg>
  )
}

// ─── Integration workflow ─────────────────────────────────────────────────────
function TwinIntegrationFlow() {
  const [active, setActive] = useState(0)
  useEffect(() => { const id = setInterval(() => setActive(s => (s+1)%5), 2400); return () => clearInterval(id) }, [])

  const steps = [
    { icon:'📡', title:'IoT Sensor Layer',       desc:'84 sensors across all machines collect temp, pressure, vibration, flow, current at 100Hz. Edge gateways aggregate and timestamp every reading.', color:'#3b82f6' },
    { icon:'🔁', title:'Real-time Data Sync',    desc:'MQTT broker streams live telemetry to digital twin engine at sub-100ms latency. All 8 production lines, cold storage, utilities mirrored continuously.', color:'#8b5cf6' },
    { icon:'🧬', title:'Physics-based Model',    desc:'Digital twin combines 3D plant model + live sensor data + FMCG process equations (Fourier heat, fluid dynamics for sauces/beverages, bake profiles).', color:ACCENT },
    { icon:'🤖', title:'AI Inference Layer',     desc:'ML models predict: equipment failure (next 72 hrs), energy waste, batch yield, OEE losses, cold chain deviations — before they happen in real plant.', color:'#f59e0b' },
    { icon:'⚡', title:'Action & Feedback Loop', desc:'Predictions trigger: auto-PM scheduling, production plan adjustments, cold storage alerts, procurement orders — closing the AI → FMCG action loop.', color:'#10b981' },
  ]

  return (
    <div style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius:14, padding:'24px', marginBottom:20 }}>
      <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>Digital Twin Integration Architecture</div>
      <div style={{ fontSize:12, color:'#64748b', marginBottom:20 }}>How iFactory AI mirrors your physical FMCG plant into a live virtual model</div>

      <div style={{ display:'flex', gap:0, overflowX:'auto' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', flexShrink:0 }}>
            <div onClick={() => setActive(i)} style={{
              width:160, padding:'14px 12px', borderRadius:12, textAlign:'center', cursor:'pointer',
              background: active===i ? `${s.color}22` : 'rgba(255,255,255,0.04)',
              border:`1.5px solid ${active===i ? s.color : 'rgba(255,255,255,0.08)'}`,
              transition:'all 0.35s',
              transform: active===i ? 'scale(1.04)' : 'scale(1)',
              boxShadow: active===i ? `0 4px 24px ${s.color}40` : 'none',
            }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color: active===i ? s.color : '#94a3b8', marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:10, color:'#64748b', lineHeight:1.5 }}>{s.desc}</div>
              <div style={{ marginTop:8, height:2, background:'rgba(255,255,255,0.06)', borderRadius:1 }}>
                {active===i && <div style={{ height:'100%', background:s.color, borderRadius:1, animation:'stepfill 2.4s linear forwards' }}/>}
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ display:'flex', alignItems:'center', paddingTop:34, flexShrink:0 }}>
                <svg width="28" height="14" viewBox="0 0 28 14">
                  <line x1="2" y1="7" x2="22" y2="7" stroke={i<active?s.color:'#334155'} strokeWidth="2" strokeDasharray={i===active-1?'':'3 2'} style={{ transition:'stroke 0.4s' }}/>
                  <polyline points="16,2 22,7 16,12" fill="none" stroke={i<active?s.color:'#334155'} strokeWidth="2" strokeLinejoin="round" style={{ transition:'stroke 0.4s' }}/>
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

export default function AIDigitalTwin() {
  const live = useLiveData()
  const [toast, setToast] = useState('')
  const [simMode, setSimMode] = useState(false)
  const [scenario, setScenario] = useState('')
  const [history, setHistory] = useState({ oee:[], throughput:[], energy:[] })

  useEffect(() => {
    setHistory(prev => ({
      oee:        [...prev.oee.slice(-19),        live.oee.plant],
      throughput: [...prev.throughput.slice(-19), live.kpis.throughputPerHr],
      energy:     [...prev.energy.slice(-19),     live.kpis.energyKwh],
    }))
  }, [live.tick])

  const runScenario = (name) => {
    setScenario(name); setSimMode(true)
    setToast(`Simulation running: "${name}" — Digital twin predicting outcomes…`)
    setTimeout(() => { setSimMode(false); setScenario('') }, 5000)
  }

  const predictions = [
    { machine:'Conveyor Belt CB4',    risk:'high',   hrs:14, action:'Replace belt bearing — WO raised',                    saving:'₹2.8L downtime saved'  },
    { machine:'Frying Unit FU-1',     risk:'medium', hrs:38, action:'Oil drain & thermocouple calibration needed',          saving:'₹1.1L yield saved'     },
    { machine:'Extruder EX-2',        risk:'low',    hrs:72, action:'Screw wear approaching threshold — schedule PM',        saving:'₹0.6L preventive'      },
    { machine:'Packaging M-4A',       risk:'medium', hrs:22, action:'Seal jaw temperature drift — calibrate before failure', saving:'₹1.8L defect saved'    },
    { machine:'Cold Storage Unit B',  risk:'medium', hrs:48, action:'Compressor efficiency degrading — pre-emptive check',   saving:'₹0.4L stock saved'     },
  ]
  const riskColor = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' }

  return (
    <div>
      <style>{`@keyframes twinpulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.02)}} @keyframes fadein{from{opacity:0}to{opacity:1}}`}</style>

      {toast && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button></div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🌐</div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:'#1e293b' }}>AI Digital Twin — Plant Intelligence</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <LivePulse color="#10b981" label="Live sync — 84 sensors active" />
              {simMode && <span style={{ fontSize:11, fontWeight:700, color:'#8b5cf6', background:'#f5f3ff', padding:'2px 8px', borderRadius:20, animation:'twinpulse 1s infinite' }}>⚡ SIM RUNNING: {scenario}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setToast('Digital twin snapshot exported — 3D model + live telemetry bundle')} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b' }}>Export Twin</button>
          <button onClick={() => setToast('Full plant calibration initiated — syncing all 84 sensor offsets')} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:ACCENT, color:'#fff' }}>Sync Now</button>
        </div>
      </div>

      {/* KPI summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {[
          { l:'Digital Twin Sync', v:'99.8%',                                    c:ACCENT,   icon:'🔗' },
          { l:'Sensors Active',    v:`${84} / 84`,                               c:'#3b82f6', icon:'📡' },
          { l:'Predictions Today', v:predictions.length,                         c:'#8b5cf6', icon:'🧠' },
          { l:'Downtime Prevented',v:'₹6.7L',                                    c:'#10b981', icon:'💰' },
          { l:'Anomalies Detected',v:7,                                           c:'#f59e0b', icon:'⚠️' },
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
      <TwinIntegrationFlow />

      {/* Live plant floor twin */}
      <div style={{ background:'#0f172a', borderRadius:14, padding:'20px', marginBottom:20, border:'1px solid #1e293b' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>Live Plant Floor — Digital Mirror</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Every bar, colour and movement mirrors your actual plant in real-time</div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {[['running',ACCENT],['idle','#94a3b8'],['maintenance','#f59e0b']].map(([s,c]) => (
              <span key={s} style={{ fontSize:10, color:c, display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:c }}/>{s}
              </span>
            ))}
          </div>
        </div>
        <PlantFloorTwin live={live} />
      </div>

      {/* Live trends + Scenarios */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:12 }}>Live sensor telemetry — digital twin vs physical plant</div>
          {history.oee.length > 2 && (
            <LineChart
              series={[
                { name:'OEE %', data:history.oee, color:ACCENT },
                { name:'Throughput (÷100)', data:history.throughput.map(v=>v/100), color:'#3b82f6' },
                { name:'Energy (÷100 kWh)', data:history.energy.map(v=>v/100), color:'#8b5cf6' },
              ]}
              height={200}
            />
          )}
        </div>
        <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#1e293b', marginBottom:12 }}>Run simulation scenarios</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { name:'Line 3 shutdown — impact analysis', icon:'🔴' },
              { name:'Demand spike +30% — capacity sim', icon:'📈' },
              { name:'Power cut 2hrs — cold chain risk', icon:'⚡' },
              { name:'New SKU launch — line allocation', icon:'🆕' },
              { name:'Peak season — April forecast',     icon:'🌞' },
            ].map(s => (
              <button key={s.name} onClick={() => runScenario(s.name)}
                style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:9, border:'1px solid #e8ecf1', cursor:'pointer', background:simMode&&scenario===s.name?'#f5f3ff':'#f8fafc', textAlign:'left', transition:'all 0.2s' }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <span style={{ fontSize:12, fontWeight:500, color:simMode&&scenario===s.name?'#8b5cf6':'#1e293b' }}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Failure Predictions */}
      <div style={{ background:'#fff', border:'1px solid #e8ecf1', borderRadius:13, padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>AI Failure Predictions — Next 72 Hours</div>
            <div style={{ fontSize:12, color:'#64748b' }}>ML model trained on 36 months of sensor history predicts failures before they occur</div>
          </div>
          <button onClick={() => setToast('All predicted maintenance tasks auto-scheduled in PM calendar')} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:ACCENT, color:'#fff' }}>Auto-Schedule All</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {predictions.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10, background:p.risk==='high'?'#fff5f5':p.risk==='medium'?'#fffbeb':'#f0fdf4', border:`1px solid ${riskColor[p.risk]}30`, borderLeft:`4px solid ${riskColor[p.risk]}` }}>
              <div style={{ width:56, height:56, flexShrink:0 }}>
                <RingGauge value={p.risk==='high'?85:p.risk==='medium'?55:25} size={56} color={riskColor[p.risk]} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{p.machine}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:riskColor[p.risk], background:riskColor[p.risk]+'18', padding:'2px 8px', borderRadius:20 }}>{p.risk} risk</span>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>⏱ Predicted in {p.hrs}h</span>
                </div>
                <div style={{ fontSize:12, color:'#64748b' }}>{p.action}</div>
              </div>
              <div style={{ flexShrink:0, textAlign:'right' }}>
                <div style={{ fontSize:12, fontWeight:700, color:ACCENT, marginBottom:6 }}>{p.saving}</div>
                <button onClick={() => setToast(`Work order raised for ${p.machine}`)} style={{ fontSize:11, padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', background:riskColor[p.risk], color:'#fff', fontWeight:600 }}>Raise WO</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
