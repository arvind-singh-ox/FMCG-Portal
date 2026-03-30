'use client'
import { useState, useEffect } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, RingGauge, ProgressBar, StackedBar, LineChart, LivePulse, TrendChip } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

export default function OEEMonitor() {
  const live = useLiveData()
  const { plant, avail, perf, quality, downtime } = live.oee
  const [toast, setToast] = useState('')
  const [history, setHistory] = useState({ plant: [], avail: [], perf: [], quality: [] })

  useEffect(() => {
    setHistory(prev => ({
      plant:   [...prev.plant.slice(-11),   live.oee.plant],
      avail:   [...prev.avail.slice(-11),   live.oee.avail],
      perf:    [...prev.perf.slice(-11),    live.oee.perf],
      quality: [...prev.quality.slice(-11), live.oee.quality],
    }))
  }, [live.tick])

  const runningLines = live.lines.filter(l => l.status === 'running')

  return (
    <div>
      <style>{`@keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}`}</style>
      {toast && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>×</button></div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>OEE Monitor</div>
          <LivePulse color="#10b981" label="Live across all production lines" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setToast('OEE alert threshold set — notifying below 80%')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#64748b' }}>Set Alert Threshold</button>
          <button onClick={() => setToast('OEE PDF report generated and sent to management')} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: ACCENT, color: '#fff' }}>Export PDF</button>
        </div>
      </div>

      {/* Hero OEE summary */}
      <div style={{ background: `linear-gradient(135deg,#0d7a52,${ACCENT})`, borderRadius: 14, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <RingGauge value={plant} max={100} size={150} color="#86efac" label="Plant OEE" sublabel="Target: 90%" />
          </div>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
              {[['Availability', avail, 95, '#93c5fd'], ['Performance', perf, 90, '#fde68a'], ['Quality', quality, 99, '#86efac']].map(([l, v, t, c]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '14px 16px', backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 6, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                    <AnimNumber value={v} decimals={1} suffix="%" />
                  </div>
                  <ProgressBar value={v} max={100} color={c} height={4} />
                  <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4 }}>Target: {t}%</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[['Downtime Today', `${downtime.toFixed(1)} hrs`, downtime > 3 ? '#fca5a5' : '#86efac'],
                ['Running Lines', `${runningLines.length} / 8`, '#93c5fd'],
                ['Defect Rate', `${live.kpis.defectRate.toFixed(2)}%`, live.kpis.defectRate > 2 ? '#fca5a5' : '#86efac']
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OEE trend line chart */}
      {history.plant.length > 2 && (
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>OEE component trends (live)</div>
          <LineChart
            series={[
              { name: 'OEE', data: history.plant, color: ACCENT },
              { name: 'Availability', data: history.avail, color: '#3b82f6' },
              { name: 'Performance', data: history.perf, color: '#f59e0b' },
              { name: 'Quality', data: history.quality, color: '#10b981' },
            ]}
            height={180}
          />
        </div>
      )}

      {/* Per-line OEE grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {runningLines.map((l, i) => {
          const avl  = Math.min(99, l.eff + Math.random() * 3)
          const prf  = Math.min(99, l.eff - Math.random() * 2)
          const qlt  = Math.min(99.5, 96 + Math.random() * 3.5)
          const col  = l.eff >= 90 ? ACCENT : l.eff >= 75 ? '#f59e0b' : '#ef4444'
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Target: {l.target?.toLocaleString()} units/shift</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: col, transition: 'color 0.5s' }}>
                    <AnimNumber value={l.eff} decimals={1} suffix="%" />
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>OEE</div>
                </div>
              </div>
              <StackedBar segments={[
                { label: 'A', value: avl,  color: '#3b82f6' },
                { label: 'P', value: prf,  color: '#f59e0b' },
                { label: 'Q', value: qlt, color: '#10b981' },
              ]} height={18} />
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
                {[['Avail', avl, '#3b82f6'], ['Perf', prf, '#f59e0b'], ['Quality', qlt, '#10b981']].map(([lbl, v, c]) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v.toFixed(1)}%</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button onClick={() => setToast(`Root cause analysis for ${l.name}…`)} style={{ flex: 1, fontSize: 11, padding: '6px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b' }}>Root Cause</button>
                <button onClick={() => setToast(`${l.name} line report downloading…`)} style={{ flex: 1, fontSize: 11, padding: '6px', borderRadius: 7, border: 'none', cursor: 'pointer', background: col + '20', color: col, fontWeight: 600 }}>Line Report</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
