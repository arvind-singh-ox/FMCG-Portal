'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { AnimNumber, Sparkline, RingGauge, BarChart, LivePulse, ProgressBar, StackedBar } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'

export default function RealTimeKPIs() {
  const live = useLiveData()
  const [history, setHistory] = useState({ prod: [], energy: [], defect: [], oee: [], throughput: [] })
  const [hourly, setHourly] = useState([1840,2100,2380,2460,2520,2390,2280,2440,2510,2480])
  const statusColors = { running: '#10b981', warning: '#f59e0b', maintenance: '#94a3b8', stopped: '#ef4444' }
  const hours = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','Now']

  useEffect(() => {
    setHistory(prev => ({
      prod:       [...prev.prod.slice(-19),       live.kpis.todayProduction],
      energy:     [...prev.energy.slice(-19),     live.kpis.energyKwh],
      defect:     [...prev.defect.slice(-19),     live.kpis.defectRate],
      oee:        [...prev.oee.slice(-19),        live.kpis.oee],
      throughput: [...prev.throughput.slice(-19), live.kpis.throughputPerHr],
    }))
    setHourly(prev => { const n = [...prev]; n[n.length - 1] = live.kpis.throughputPerHr; return n })
  }, [live.tick])

  const metricCards = [
    { label: 'Production Rate',  value: live.kpis.todayProduction,  unit: 'units/day', dec: 0, color: ACCENT,    icon: '🏭', trend: '+6.2%', up: true,  data: history.prod     },
    { label: 'Overall OEE',      value: live.kpis.oee,              unit: '%',         dec: 1, color: '#f59e0b',  icon: '⚙️', trend: '+1.4%', up: true,  data: history.oee      },
    { label: 'Throughput',       value: live.kpis.throughputPerHr,  unit: 'units/hr',  dec: 0, color: '#3b82f6',  icon: '📊', trend: '+3.1%', up: true,  data: history.throughput},
    { label: 'Defect Rate',      value: live.kpis.defectRate,       unit: '%',         dec: 2, color: '#ef4444',  icon: '🔍', trend: '-0.3%', up: true,  data: history.defect   },
    { label: 'Energy Usage',     value: live.kpis.energyKwh,        unit: 'kWh',       dec: 0, color: '#8b5cf6',  icon: '⚡', trend: '-2.1%', up: true,  data: history.energy   },
    { label: 'Batch Yield',      value: live.kpis.batchYield,       unit: '%',         dec: 1, color: '#10b981',  icon: '✅', trend: '+0.8%', up: true,  data: []               },
  ]

  return (
    <div>
      <style>{`@keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Real-time KPIs</div>
          <LivePulse color="#10b981" label={`Live · Tick #${live.tick}`} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => {
            const d = 'KPI,Value\n' + metricCards.map(m => `${m.label},${m.value} ${m.unit}`).join('\n')
            const b = new Blob([d], { type: 'text/csv' })
            const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'live_kpis.csv'; a.click()
          }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button onClick={() => window.alert('Alerts: OEE < 80% | Defect Rate > 2% | Production < 40,000/day')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: ACCENT, color: '#fff' }}>Set Alerts</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {metricCards.map((m, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px', borderLeft: `4px solid ${m.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                  <AnimNumber value={typeof m.value === 'number' ? m.value : parseFloat(m.value)} decimals={m.dec} suffix={m.unit === '%' ? '%' : ''} />
                  {m.unit !== '%' && <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>}
                </div>
              </div>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
            </div>
            {m.data.length > 1 && <Sparkline data={m.data} color={m.color} height={40} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: m.up ? '#10b981' : '#ef4444', background: m.up ? '#f0fdf4' : '#fef2f2', padding: '2px 8px', borderRadius: 20 }}>{m.trend}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* OEE + hourly throughput */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* OEE breakdown */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>OEE breakdown</div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginBottom: 16 }}>
            {[['Availability', live.oee.avail, 95, '#3b82f6'], ['Performance', live.oee.perf, 90, '#f59e0b'], ['Quality', live.oee.quality, 99, '#10b981']].map(([l, v, t, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <RingGauge value={v} max={100} size={100} color={v >= t ? ACCENT : '#f59e0b'} />
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 6 }}>{l}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Target: {t}%</div>
              </div>
            ))}
          </div>
          <StackedBar segments={[
            { label: 'Availability', value: live.oee.avail, color: '#3b82f6' },
            { label: 'Performance',  value: live.oee.perf,  color: '#f59e0b' },
            { label: 'Quality',      value: live.oee.quality, color: '#10b981' },
          ]} height={20} />
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534', marginTop: 12 }}>
            <strong>Plant OEE: <AnimNumber value={live.oee.plant} decimals={1} suffix="%" /></strong>
            &nbsp;· <AnimNumber value={live.oee.downtime} decimals={1} suffix=" hrs" /> downtime today
          </div>
        </div>

        {/* Hourly throughput bar chart */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Hourly production trend</div>
          <BarChart
            data={hourly.map((v, i) => ({ label: hours[i], value: v, color: i === hourly.length - 1 ? ACCENT : '#e6f7f0' }))}
            height={180}
            barColor={ACCENT}
            formatVal={v => (v / 1000).toFixed(1) + 'K'}
          />
        </div>
      </div>

      {/* Machine status grid */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Machine status — live</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['running', '#10b981'], ['warning', '#f59e0b'], ['maintenance', '#94a3b8']].map(([s, c]) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />{s}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {live.machines.map((m, i) => {
            const sc = statusColors[m.status] || '#94a3b8'
            return (
              <div key={i} style={{ border: `1px solid ${sc}40`, borderRadius: 10, padding: '12px 14px', background: `${sc}08`, borderTop: `3px solid ${sc}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{m.name}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc, marginTop: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 8 }}>{m.line}</div>
                <div style={{ marginBottom: 8 }}>
                  <ProgressBar value={m.load} color={sc} height={5} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, color: '#94a3b8' }}>
                    <span>Load</span>
                    <span style={{ fontWeight: 600 }}><AnimNumber value={m.load} decimals={0} suffix="%" /></span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {[['Temp', `${m.temp}°C`], ['Vib', `${m.vibration}mm/s`]].map(([l, v]) => (
                    <div key={l} style={{ background: '#f8fafc', borderRadius: 5, padding: '4px 7px' }}>
                      <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 1 }}>{l}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
