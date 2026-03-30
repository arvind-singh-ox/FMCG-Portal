'use client'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { ProgressBar, DonutChart, BarChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

function Toast({ msg, onDone }) {
  return msg ? (
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:13, color:'#166534', fontWeight:500 }}>✓ {msg}</span>
      <button onClick={onDone} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button>
    </div>
  ) : null
}

export default function AIInsightsSummary() {
  const live = useLiveData()
  const [toast, setToast] = useState('')
  const [dismissed, setDismissed] = useState(new Set())
  const handleAction = (ins) => {
    setToast(`Action taken: "${ins.action}" — task created and assigned to supervisor`)
  }
  const dismissInsight = (idx) => {
    setDismissed(prev => new Set([...prev, idx]))
    setToast('Insight dismissed')
  }

  const insights = [
    { cat: 'Production', icon: '🏭', title: 'Increase Bourbon Biscuit batch size', detail: `Demand up 22% this week vs forecast. Line 1 running at ${live.lines[0]?.eff?.toFixed(1) ?? '94.0'}% efficiency. Recommend +15% batch.`, impact: 'Revenue +₹2.1L', conf: 94, action: 'Approve batch change' },
    { cat: 'Maintenance', icon: '🔧', title: 'Line 4 conveyor belt failure risk', detail: `ML anomaly model: progressive temperature rise (${live.machines[3]?.temp?.toFixed(1) ?? '72'}°C, +1.2°C/hr). Matches 6 prior failures.`, impact: 'Prevent 18 hrs downtime', conf: 91, action: 'Raise WO now' },
    { cat: 'Inventory', icon: '📦', title: 'Reorder Palm Oil immediately', detail: 'Current stock 8.4 MT. Daily consumption 2.8 MT. Stockout in 3 days. Lead time 4 days.', impact: 'Prevent stockout', conf: 99, action: 'Create PO' },
    { cat: 'Quality', icon: '✅', title: 'Microbiological risk elevated on Line 2', detail: `Extruder EX-2 vibration at ${live.machines[1]?.vibration?.toFixed(1) ?? '2.8'} mm/s (elevated). Risk of contamination. Run extra TVC tests.`, impact: 'Quality protection', conf: 82, action: 'Alert QC team' },
    { cat: 'Sales', icon: '📈', title: 'Frooti demand will peak +42% next month', detail: 'AI forecast: summer seasonality + temperature trends. Pre-produce 14,400 extra bottles.', impact: 'Revenue +₹4.8L', conf: 89, action: 'Adjust plan' },
    { cat: 'Cost', icon: '💰', title: 'Energy cost reduction — ₹48K/month', detail: `Current plant energy: ${live.kpis.energyKwh.toLocaleString()} kWh today. Line 3 off-peak smart scheduling can reduce 18%.`, impact: 'Save ₹48K/mo', conf: 86, action: 'Schedule review' },
  ]

  const cc = { Production: ['#3b82f6', '#eff6ff'], Maintenance: ['#f59e0b', '#fffbeb'], Inventory: ['#8b5cf6', '#f5f3ff'], Quality: [ACCENT, '#e6f7f0'], Sales: ['#ec4899', '#fdf2f8'], Cost: ['#10b981', '#f0fdf4'] }

  const allDismissed = dismissed.size === insights.length
  return (
    <div>
      <Toast msg={toast} onDone={() => setToast('')}/>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>AI Insights Summary</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Proactive recommendations powered by machine learning — updated every 3 seconds</div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:13, color:'#64748b' }}>{insights.length - dismissed.size} active insights · {dismissed.size} dismissed</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { const a=document.createElement('a'); a.href='data:text/csv,Category,Title,Confidence,Impact'; a.download='ai_insights.csv'; a.click(); setToast('AI insights exported') }} style={{ padding:'6px 13px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b' }}>Export</button>
          <button onClick={() => { setDismissed(new Set(insights.map((_,i)=>i))); setToast('All insights dismissed') }} style={{ padding:'6px 13px', borderRadius:7, border:'1px solid #e2e8f0', cursor:'pointer', fontSize:12, background:'#fff', color:'#64748b' }}>Dismiss All</button>
          <button onClick={() => { setDismissed(new Set()); setToast('All insights restored') }} disabled={dismissed.size===0} style={{ padding:'6px 13px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:'#1a9b6c', color:'#fff', opacity:dismissed.size===0?0.4:1 }}>Restore All</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ l: 'Total Insights', v: '24', c: ACCENT }, { l: 'High Priority', v: '9', c: '#ef4444' },
          { l: 'Avg Confidence', v: `${live.kpis.qualityPassRate.toFixed(0)}%`, c: '#3b82f6' },
          { l: 'Actioned Today', v: '8', c: '#10b981' }, { l: 'Pending Review', v: '16', c: '#f59e0b' },
          { l: 'Est. Value', v: '₹12.4L', c: '#8b5cf6' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 10, padding: 16, borderTop: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{ins.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: (cc[ins.cat]||[ACCENT,'#e6f7f0'])[0], background: (cc[ins.cat]||[ACCENT,'#e6f7f0'])[1], padding: '2px 8px', borderRadius: 20 }}>{ins.cat}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Confidence: <strong style={{ color: ins.conf >= 90 ? ACCENT : '#f59e0b' }}>{ins.conf}%</strong></span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{ins.title}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{ins.detail}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, background: '#e6f7f0', padding: '4px 10px', borderRadius: 8, marginBottom: 8, whiteSpace: 'nowrap' }}>{ins.impact}</div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <button onClick={() => handleAction(ins)} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{ins.action}</button>
                <button onClick={() => dismissInsight(idx)} title="Dismiss" style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', color:'#94a3b8', fontSize:14, padding:'4px 7px', lineHeight:1 }}>×</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
