'use client'
import { useState, useEffect } from 'react'
import { useLiveData } from '@/components/industries/fmcg/context/LiveDataContext'
import { BarChart, LineChart, DonutChart, AnimNumber, ProgressBar, TrendChip, HBarChart } from '@/components/industries/fmcg/components/Charts'

const ACCENT = '#1a9b6c'
const TABS = ['AI Demand Forecast', 'Sales Trends', 'Cost & Profit']

export default function DemandForecasting({ defaultTab = 'forecast' }) {
  const live = useLiveData()
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState('')
  return (
    <div>
      {toast && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>✓ {toast}</span><button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>×</button></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>AI & Predictive Analytics</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>AI-powered demand forecasting, sales trends and cost-profit analysis</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setToast('AI forecast model retraining initiated — ~2 min')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#64748b' }}>🔄 Refresh Model</button>
          <button onClick={() => { const a = document.createElement('a'); a.href = 'data:text/csv,SKU,Forecast'; a.download = 'demand_forecast.csv'; a.click(); setToast('Forecast exported') }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, background: '#fff', color: '#64748b' }}>📥 Export</button>
          <button onClick={() => setToast('Report emailed to Sales, Production and Finance teams')} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: ACCENT, color: '#fff' }}>📤 Share</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map((t, i) => <button key={i} onClick={() => setTab(i)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === i ? 600 : 400, background: tab === i ? '#fff' : 'transparent', color: tab === i ? '#1e293b' : '#64748b', boxShadow: tab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{t}</button>)}
      </div>
      {tab === 0 && <ForecastPage live={live} setToast={setToast} />}
      {tab === 1 && <SalesTrends setToast={setToast} />}
      {tab === 2 && <CostProfit live={live} setToast={setToast} />}
    </div>
  )
}

function ForecastPage({ live, setToast }) {
  const { kpis } = live
  const skus = [
    { name: 'Bourbon Biscuits 150g',    actual: 42800, forecast: 52400, accuracy: 94.2, trend: 'up',   confidence: 'high',   driver: 'School reopening + festive demand',     change: '+22.4%' },
    { name: 'Maggi Noodles 70g',        actual: 38400, forecast: 41200, accuracy: 96.8, trend: 'up',   confidence: 'high',   driver: 'Monsoon seasonal spike historically',   change: '+7.3%'  },
    { name: 'Lays Chips 26g',           actual: 62100, forecast: 59400, accuracy: 91.4, trend: 'down', confidence: 'medium', driver: 'Regional competition increasing share',  change: '-4.4%'  },
    { name: 'Frooti 200ml',             actual: 34200, forecast: 48600, accuracy: 89.2, trend: 'up',   confidence: 'high',   driver: 'Summer peak — temperature driven',       change: '+42.1%' },
    { name: 'KitKat 18g',               actual: 78400, forecast: 84200, accuracy: 97.1, trend: 'up',   confidence: 'high',   driver: 'IPL sponsorship + gifting season',       change: '+7.4%'  },
    { name: 'Britannia Marie 300g',     actual: 28600, forecast: 26800, accuracy: 93.6, trend: 'down', confidence: 'medium', driver: 'Consumer shift to multigrain variants',  change: '-6.3%'  },
    { name: 'Cream & Onion Snacks 30g', actual: 22400, forecast: 26800, accuracy: 88.4, trend: 'up',   confidence: 'medium', driver: 'New market launch — 3 cities',           change: '+19.6%' },
    { name: 'Orange Squash 750ml',      actual: 18200, forecast: 24600, accuracy: 86.8, trend: 'up',   confidence: 'high',   driver: 'Summer beverages peak demand',            change: '+35.2%' },
    { name: 'Multigrain Digestive',     actual: 14800, forecast: 16200, accuracy: 92.4, trend: 'up',   confidence: 'high',   driver: 'Health-conscious consumer trend',         change: '+9.5%'  },
    { name: 'Instant Hakka Noodles',    actual: 19600, forecast: 21400, accuracy: 94.8, trend: 'up',   confidence: 'high',   driver: 'Quick meal segment growing 18% YoY',     change: '+9.2%'  },
  ]
  const cc = { high: [ACCENT, '#e6f7f0'], medium: ['#f59e0b', '#fffbeb'], low: ['#ef4444', '#fef2f2'] }
  const safe = (m, k) => m[k] || ['#64748b', '#f1f5f9']

  return (
    <div>
      {/* AI model hero */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4338ca)', borderRadius: 14, padding: '20px 24px', marginBottom: 20, color: '#fff', display: 'flex', gap: 28, alignItems: 'center' }}>
        <div style={{ fontSize: 42 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>AI Demand Forecast — April 2026</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Model: LSTM + XGBoost ensemble · 36 months training data · Updated Today 06:00 AM</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {[['Forecast Accuracy', `${(93.4 + (kpis.batchYield - 96.4) * 0.1).toFixed(1)}%`], ['SKUs Tracked', '10'], ['Confidence Avg', 'High']].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Accuracy donut */}
        <div style={{ flexShrink: 0 }}>
          <DonutChart
            segments={[{ label: 'Accurate', value: 93.4, color: '#818cf8' }, { label: 'Variance', value: 6.6, color: 'rgba(255,255,255,0.15)' }]}
            size={100} thickness={18}
            centerValue="93.4%" centerLabel="accuracy"
          />
        </div>
      </div>

      {/* Forecast vs Actual bar comparison */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Actual vs Forecast — next 30 days (top 6 SKUs)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <BarChart
            data={skus.slice(0, 6).map(s => ({ label: s.name.split(' ')[0], value: s.actual, color: '#e6f7f0' }))}
            height={160} barColor="#e6f7f0" formatVal={v => (v / 1000).toFixed(0) + 'K'}
          />
          <BarChart
            data={skus.slice(0, 6).map(s => ({ label: s.name.split(' ')[0], value: s.forecast, color: ACCENT }))}
            height={160} barColor={ACCENT} formatVal={v => (v / 1000).toFixed(0) + 'K'}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
          {[['This Month (Actual)', '#e6f7f0'], ['Next Month (Forecast)', ACCENT]].map(([l, c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
              <span style={{ width: 12, height: 10, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* SKU table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['SKU', 'Actual', 'Forecast', 'Change', 'Key Driver', 'Conf.', 'Accuracy', 'Actions'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {skus.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>{s.actual.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{s.forecast.toLocaleString()}</td>
                <td style={{ padding: '10px 14px' }}><TrendChip value={s.change.replace(/[+\-▲▼]/, '')} up={s.trend === 'up'} /></td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 11 }}>{s.driver}</td>
                <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, fontWeight: 600, color: safe(cc, s.confidence)[0], background: safe(cc, s.confidence)[1], padding: '2px 8px', borderRadius: 20 }}>{s.confidence}</span></td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: s.accuracy >= 95 ? ACCENT : s.accuracy >= 90 ? '#f59e0b' : '#ef4444' }}>{s.accuracy}%</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => setToast(`Production plan for ${s.name} adjusted to match forecast`)} style={{ fontSize: 11, padding: '4px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', background: ACCENT, color: '#fff', fontWeight: 600 }}>Adjust Plan</button>
                    <button onClick={() => setToast(`${s.name} — 6-month trend drill-down opened`)} style={{ fontSize: 11, padding: '4px 9px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b' }}>Drill Down</button>
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

function SalesTrends({ setToast }) {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const series = [
    { name: 'Biscuits',  data: [28.4, 31.2, 38.8, 29.6, 33.4, 36.2], color: ACCENT     },
    { name: 'Noodles',   data: [18.2, 19.8, 22.4, 20.1, 21.6, 23.8], color: '#3b82f6'  },
    { name: 'Chips',     data: [22.1, 24.3, 26.8, 21.4, 23.9, 25.1], color: '#f59e0b'  },
    { name: 'Beverages', data: [12.4, 14.1, 16.2, 11.8, 13.6, 15.9], color: '#8b5cf6'  },
    { name: 'Confect.',  data: [19.8, 21.4, 28.6, 20.2, 22.4, 24.8], color: '#ec4899'  },
  ]
  const regions = [
    { name: 'North India (Rajasthan, Delhi, UP)', pct: 34, value: '₹16.4L', trend: '+8.2%',  up: true  },
    { name: 'West India (Gujarat, Maharashtra)',   pct: 28, value: '₹13.5L', trend: '+12.4%', up: true  },
    { name: 'South India (Karnataka, TN, AP)',     pct: 22, value: '₹10.6L', trend: '+4.1%',  up: true  },
    { name: 'East India (Bengal, Odisha, Bihar)',  pct: 16, value: '₹7.7L',  trend: '-2.3%',  up: false },
  ]
  const COLORS = [ACCENT, '#3b82f6', '#f59e0b', '#ef4444']
  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Category sales trends — Oct 2025 to Mar 2026 (₹ Lakhs)</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setToast('Sales trend chart exported')} style={{ fontSize: 12, padding: '6px 13px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b' }}>Export Chart</button>
            <button onClick={() => setToast('Regional expansion analysis report generated')} style={{ fontSize: 12, padding: '6px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', background: ACCENT, color: '#fff', fontWeight: 600 }}>Region Analysis</button>
          </div>
        </div>
        <LineChart series={series} labels={months} height={220} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Revenue by region</div>
          <DonutChart
            segments={regions.map((r, i) => ({ label: r.name.split(' (')[0], value: r.pct, color: COLORS[i] }))}
            size={130} thickness={26}
            centerValue="₹48.2L" centerLabel="total"
          />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Regional breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {regions.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1e293b' }}>{r.name.split(' (')[0]}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{r.value}</span>
                    <TrendChip value={r.trend.replace(/[+\-]/, '')} up={r.up} />
                  </div>
                </div>
                <ProgressBar value={r.pct} color={COLORS[i]} height={7} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CostProfit({ live, setToast }) {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const revenue = [84.2, 91.8, 108.4, 86.6, 94.2, 102.8]
  const cogs    = [52.1, 56.4, 66.8, 53.2, 57.8, 62.6]
  const profit  = revenue.map((r, i) => r - cogs[i])
  const costCategories = [
    { label: 'Raw Materials',     value: 42.6, color: '#ef4444' },
    { label: 'Packaging',         value: 12.4, color: '#f59e0b' },
    { label: 'Labour & Overhead', value: 18.2, color: '#8b5cf6' },
    { label: 'Energy & Utilities', value: 8.4, color: '#3b82f6' },
    { label: 'Logistics',         value: 6.8,  color: '#10b981' },
    { label: 'Other',             value: 4.2,  color: '#94a3b8' },
  ]
  const totalCost = costCategories.reduce((s, c) => s + c.value, 0)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ l: 'Revenue MTD', v: '₹102.8L', t: '+9.1%', up: true, c: ACCENT },
          { l: 'COGS MTD',    v: '₹62.6L',  t: '+8.2%', up: false,c: '#ef4444' },
          { l: 'Gross Profit',v: '₹40.2L',  t: '+10.4%',up: true, c: '#10b981' },
          { l: 'Gross Margin',v: '39.1%',   t: '+0.5%', up: true, c: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 12, padding: 16, borderTop: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{s.v}</div>
            <TrendChip value={s.t.replace(/[+\-]/, '')} up={s.up} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Revenue vs Cost vs Profit (₹ Lakhs)</div>
          <LineChart
            series={[
              { name: 'Revenue', data: revenue, color: ACCENT },
              { name: 'COGS',    data: cogs,    color: '#ef4444' },
              { name: 'Profit',  data: profit,  color: '#8b5cf6' },
            ]}
            labels={months} height={180}
          />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: 13, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Cost breakdown — March 2026</div>
          <DonutChart
            segments={costCategories.map(c => ({ label: c.label, value: c.value, color: c.color }))}
            size={140} thickness={26}
            centerValue="₹92.6L" centerLabel="total cost"
          />
        </div>
      </div>
    </div>
  )
}
