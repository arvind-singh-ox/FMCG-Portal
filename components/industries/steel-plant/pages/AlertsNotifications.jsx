'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

// ─── Scroll Reveal ───
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Section({ title, badge, icon, children }) {
  const [ref, visible] = useScrollReveal(0.1)
  return (
    <div ref={ref} className={visible ? 'scroll-visible' : 'scroll-hidden'} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: ACCENT + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ACCENT }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{title}</h2>
        </div>
        {badge && <span style={{ background: ACCENT + '12', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>{badge}</span>}
      </div>
      {visible && children}
    </div>
  )
}

// ══════════════════════════
// ──── ALERTS DATA ────────
// ══════════════════════════

const criticalAlerts = [
  { id: 'ALR-4281', time: '3 min ago', ts: '12:47 PM', unit: 'Blast Furnace #1', area: 'Ironmaking', msg: 'Hearth thermocouple T-14 reading 1,568°C — exceeds safe limit (1,550°C). Refractory wear risk detected.', severity: 'critical', aiAction: 'AI recommends reducing hot blast temperature by 20°C and increasing cooling water flow by 8%. Estimated stabilization: 12 min.', acknowledged: false },
  { id: 'ALR-4280', time: '8 min ago', ts: '12:42 PM', unit: 'Rolling Mill Stand #3', area: 'Rolling', msg: 'Work roll vibration spike — 5.8 mm/s (threshold: 4.5 mm/s). Pattern matches early-stage bearing inner race defect.', severity: 'critical', aiAction: 'Predictive model: 87% probability of bearing failure within 72 hrs. Schedule replacement during next planned roll change.', acknowledged: false },
  { id: 'ALR-4278', time: '18 min ago', ts: '12:32 PM', unit: 'BOF Converter #1', area: 'Steelmaking', msg: 'Vessel mouth buildup detected via thermal imaging — skull thickness estimated at 180mm (limit: 150mm).', severity: 'critical', aiAction: 'AI suggests scheduling skull removal before next campaign. Impact if deferred: reduced vessel volume → 4% output loss.', acknowledged: true },
]

const warningAlerts = [
  { id: 'ALR-4277', time: '22 min ago', ts: '12:28 PM', unit: 'Caster Segment #7', area: 'Casting', msg: 'Coolant flow rate dropped to 82% of setpoint. Secondary cooling zone affected — potential surface quality impact.', severity: 'warning', aiAction: 'Check coolant pump P-7B and strainer. AI adjusting spray nozzle compensation in adjacent zones.' },
  { id: 'ALR-4275', time: '35 min ago', ts: '12:15 PM', unit: 'Stack Emissions', area: 'Environment', msg: 'SO₂ level at 46 mg/Nm³ — approaching regulatory limit of 50 mg/Nm³ (92% of threshold).', severity: 'warning', aiAction: 'AI activated desulphurization gas injection adjustment. Predicted normalization within 8 min.' },
  { id: 'ALR-4274', time: '42 min ago', ts: '12:08 PM', unit: 'Ladle Turret', area: 'Casting', msg: 'Rotation speed deviation — 4.8% variance from setpoint. Hydraulic pressure fluctuation detected.', severity: 'warning', aiAction: 'Monitor hydraulic accumulator pre-charge pressure. Schedule inspection if deviation exceeds 6%.' },
  { id: 'ALR-4272', time: '55 min ago', ts: '11:55 AM', unit: 'Hot Stove #2', area: 'Ironmaking', msg: 'Dome temperature 12°C below target during on-blast cycle. Heat transfer efficiency declining.', severity: 'warning', aiAction: 'Check refractory checker bricks in Zone B. AI model predicts 3% efficiency loss if unaddressed over 7 days.' },
  { id: 'ALR-4271', time: '1 hr ago', ts: '11:48 AM', unit: 'Reheat Furnace', area: 'Rolling', msg: 'Zone 3 temperature uniformity ±18°C (spec: ±12°C). Slab surface temperature variation may affect rolling quality.', severity: 'warning', aiAction: 'Burner #14 flame pattern anomaly detected. AI adjusting fuel-air ratio in adjacent burners for compensation.' },
]

const infoAlerts = [
  { id: 'ALR-4270', time: '1.2 hr ago', ts: '11:38 AM', unit: 'BF Gas Recovery', area: 'Energy', msg: 'BF gas holder level at 78% — approaching high-level setpoint. Flaring may be required if not consumed.', severity: 'info', aiAction: 'AI scheduling power plant turbine ramp-up to increase gas consumption by 12%.' },
  { id: 'ALR-4269', time: '1.5 hr ago', ts: '11:20 AM', unit: 'Coke Oven Battery #1', area: 'Ironmaking', msg: 'Coking time for oven #18 extended by 2 min due to moisture variation in coal blend (7.2% vs 6.5% target).', severity: 'info', aiAction: 'Coal blend moisture model updated. Next batch pre-drying parameters adjusted.' },
  { id: 'ALR-4268', time: '2 hr ago', ts: '10:50 AM', unit: 'Water Treatment', area: 'Utilities', msg: 'Cooling tower basin TDS rising — 2,450 ppm (limit: 3,000 ppm). Blowdown cycle scheduled in 4 hours.', severity: 'info', aiAction: 'Automatic blowdown will trigger at 2,800 ppm. No immediate action required.' },
  { id: 'ALR-4267', time: '2.5 hr ago', ts: '10:20 AM', unit: 'Sinter Plant', area: 'Ironmaking', msg: 'Sinter bed permeability 18.2 JPU — within range but trending lower over last 3 hours (was 19.8 JPU).', severity: 'info', aiAction: 'AI recommends increasing coke breeze ratio by 0.3% in next mix to improve permeability.' },
]

// AI proactive recommendations (not triggered by alarms — AI-initiated)
const aiProactive = [
  { id: 'PRO-118', time: '10 min ago', title: 'Schedule preventive inspection for BF Tuyere #6', desc: 'Thermal imaging trend analysis shows 0.4°C/day rise in tuyere nose temperature over 14 days. Historical data: 78% correlation with tuyere burnout at this rate. Recommend visual inspection during next planned slow-down.', confidence: '91%', category: 'Predictive Maintenance', impact: 'Prevent unplanned BF slow-down (~4 hrs downtime)' },
  { id: 'PRO-117', time: '25 min ago', title: 'Optimize caster oscillation frequency for API grade', desc: 'Current oscillation: 120 cpm. AI analysis of 340 similar heats suggests 135 cpm reduces oscillation marks by 22% for API 5L X65 grade without affecting mold flux consumption.', confidence: '94%', category: 'Quality Optimization', impact: 'Surface defect rate reduction: 0.8% → 0.6%' },
  { id: 'PRO-116', time: '40 min ago', title: 'Reduce BOF lance height by 50mm for current scrap mix', desc: 'Scrap mix contains 15% heavy melting scrap (up from 12% standard). Thermodynamic model recommends lower lance position for first 3 min of blow to improve melting kinetics.', confidence: '89%', category: 'Process Optimization', impact: 'Blow time reduction: ~1.2 min, improved first-hit rate' },
  { id: 'PRO-115', time: '1.5 hr ago', title: 'Shift power generation load to off-peak pricing window', desc: 'Grid electricity pricing drops 18% between 14:00-16:00 today. AI recommends increasing captive power generation now and purchasing grid power during off-peak. Gas holder at 78% supports increased generation.', confidence: '97%', category: 'Energy Optimization', impact: 'Estimated energy cost saving: ₹4.2L today' },
]

// Alert summary stats
const alertStats = [
  { label: 'Critical', count: 3, color: '#ef4444', icon: '!' },
  { label: 'Warning', count: 5, color: '#f59e0b', icon: '⚠' },
  { label: 'Info', count: 4, color: '#3b82f6', icon: 'i' },
  { label: 'AI Proactive', count: 4, color: ACCENT, icon: 'AI' },
  { label: 'Acknowledged', count: 6, color: '#10b981', icon: '✓' },
  { label: 'Pending Action', count: 10, color: '#ef4444', icon: '⏳' },
]

// Escalation rules
const escalationRules = [
  { level: 'Level 1', time: '0 – 5 min', role: 'Shift Operator', action: 'Acknowledge & assess', active: true },
  { level: 'Level 2', time: '5 – 15 min', role: 'Shift Supervisor', action: 'Investigate & initiate corrective action', active: true },
  { level: 'Level 3', time: '15 – 30 min', role: 'Area Manager', action: 'Escalated decision & resource allocation', active: false },
  { level: 'Level 4', time: '> 30 min', role: 'Plant Manager', action: 'Executive intervention & external notification', active: false },
]

// Notification channels
const channels = [
  { channel: 'Control Room HMI', alerts: 'All', status: 'Active', latency: '<1s' },
  { channel: 'Mobile App Push', alerts: 'Critical + Warning', status: 'Active', latency: '<3s' },
  { channel: 'SMS Gateway', alerts: 'Critical only', status: 'Active', latency: '<10s' },
  { channel: 'Email Digest', alerts: 'All (batched)', status: 'Active', latency: '15 min cycle' },
  { channel: 'PA System', alerts: 'Safety Critical', status: 'Active', latency: '<2s' },
  { channel: 'SCADA Integration', alerts: 'Process alarms', status: 'Active', latency: '<1s' },
]

// ═══════════════════════════════
// ──── MAIN COMPONENT ──────────
// ═══════════════════════════════

export default function AlertsNotifications() {
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('live')

  const sevColors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  const sevBg = { critical: '#fef2f2', warning: '#fffbeb', info: '#eff6ff' }

  const allAlerts = [
    ...criticalAlerts.map(a => ({ ...a, _sev: 0 })),
    ...warningAlerts.map(a => ({ ...a, _sev: 1 })),
    ...infoAlerts.map(a => ({ ...a, _sev: 2 })),
  ]
  const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.severity === filter)

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
        @keyframes scrollReveal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-hidden { opacity: 0; transform: translateY(40px); }
        .scroll-visible { animation: scrollReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Alerts & Notifications</h1>
          <p style={st.sub}>AI-generated anomalies, process alarms & proactive recommendations</p>
        </div>
        <div style={st.headerRight}>
          <span style={{ ...st.liveBadge, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulseRing 1.5s infinite' }} />
            3 Critical
          </span>
          <span style={st.aiBadge}>AI Anomaly Engine: Active</span>
          <span style={st.timeBadge}>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px', animation: 'fadeUp 0.6s ease both' }}>
        {alertStats.map((s, i) => (
          <div key={i} style={{ ...st.card, textAlign: 'center', borderTop: `3px solid ${s.color}`, cursor: 'pointer', animation: `slideIn 0.7s ease ${i * 0.08}s both` }}
            onClick={() => { if (s.label === 'Critical') setFilter('critical'); else if (s.label === 'Warning') setFilter('warning'); else if (s.label === 'Info') setFilter('info'); else setFilter('all') }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '10px', fontWeight: 800, color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {[
          { key: 'live', label: 'Live Alerts' },
          { key: 'ai', label: 'AI Proactive' },
          { key: 'settings', label: 'Escalation & Channels' },
        ].map((t) => (
          <button key={t.key} style={tab === t.key ? st.tabActive : st.tab} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ LIVE ALERTS TAB ═══ */}
      {tab === 'live' && (
        <>
          {/* Severity Filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            {[
              { key: 'all', label: 'All Alerts', count: allAlerts.length },
              { key: 'critical', label: 'Critical', count: criticalAlerts.length },
              { key: 'warning', label: 'Warning', count: warningAlerts.length },
              { key: 'info', label: 'Informational', count: infoAlerts.length },
            ].map((f) => (
              <button key={f.key} style={filter === f.key ? st.filterActive : st.filterBtn} onClick={() => setFilter(f.key)}>
                {f.label} <span style={filter === f.key ? st.filterCountActive : st.filterCount}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {filtered.map((alert, i) => (
              <div key={alert.id} style={{
                ...st.card, borderLeft: `4px solid ${sevColors[alert.severity]}`,
                background: alert.acknowledged ? '#fff' : sevBg[alert.severity] + '60',
                animation: `slideIn 0.6s ease ${i * 0.06}s both`,
              }}>
                {/* Alert Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: sevColors[alert.severity], padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>{alert.severity}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{alert.id}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: ACCENT }}>{alert.unit}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{alert.area}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{alert.time}</span>
                    {alert.acknowledged && <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>ACK</span>}
                    {!alert.acknowledged && <button style={{ fontSize: '10px', fontWeight: 600, color: '#fff', background: sevColors[alert.severity], border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Acknowledge</button>}
                  </div>
                </div>

                {/* Alert Message */}
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e293b', lineHeight: '1.6', fontWeight: 500 }}>{alert.msg}</p>

                {/* AI Action */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 12px', background: `${ACCENT}08`, borderRadius: '8px', border: `1px solid ${ACCENT}15` }}>
                  <span style={{ background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0, marginTop: '2px' }}>AI</span>
                  <span style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.6' }}>{alert.aiAction}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Timeline Summary */}
          <Section title="Alert Timeline — Last 8 Hours" badge="Pattern Analysis" icon="TL">
            <div style={st.card}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '0 8px' }}>
                {[
                  { hour: '05:00', c: 0, w: 1, i: 2 },
                  { hour: '06:00', c: 1, w: 2, i: 1 },
                  { hour: '07:00', c: 0, w: 3, i: 2 },
                  { hour: '08:00', c: 1, w: 1, i: 3 },
                  { hour: '09:00', c: 0, w: 2, i: 1 },
                  { hour: '10:00', c: 0, w: 1, i: 2 },
                  { hour: '11:00', c: 1, w: 3, i: 2 },
                  { hour: '12:00', c: 2, w: 2, i: 1 },
                ].map((h, i) => {
                  const total = h.c + h.w + h.i
                  const maxH = 8
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center', width: '100%' }}>
                        {h.c > 0 && <div style={{ width: '80%', height: `${(h.c / maxH) * 100}px`, background: '#ef4444', borderRadius: '3px 3px 0 0', transition: 'height 1s ease' }} />}
                        {h.w > 0 && <div style={{ width: '80%', height: `${(h.w / maxH) * 100}px`, background: '#f59e0b', borderRadius: h.c > 0 ? '0' : '3px 3px 0 0', transition: 'height 1s ease' }} />}
                        {h.i > 0 && <div style={{ width: '80%', height: `${(h.i / maxH) * 100}px`, background: '#3b82f6', borderRadius: '0 0 3px 3px', transition: 'height 1s ease' }} />}
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>{h.hour}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#1e293b' }}>{total}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', justifyContent: 'center' }}>
                {[{ color: '#ef4444', label: 'Critical' }, { color: '#f59e0b', label: 'Warning' }, { color: '#3b82f6', label: 'Info' }].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...st.aiRow, marginTop: '12px' }}>
                <span style={st.aiChip}>AI</span>
                Alert frequency increased 24% between 11:00–12:00 — correlates with BOF campaign end and caster sequence transitions. Pattern is recurrent on shift handover periods.
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ═══ AI PROACTIVE TAB ═══ */}
      {tab === 'ai' && (
        <Section title="AI Proactive Recommendations" badge={`${aiProactive.length} Active`} icon="AI">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiProactive.map((rec, i) => (
              <div key={rec.id} style={{ ...st.card, borderLeft: `4px solid ${ACCENT}`, animation: `slideIn 0.7s ease ${i * 0.1}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', background: ACCENT, padding: '3px 8px', borderRadius: '4px' }}>AI PROACTIVE</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{rec.id}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{rec.category}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{rec.time}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{rec.title}</h3>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#4a5568', lineHeight: '1.6' }}>{rec.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: </span><span style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>{rec.confidence}</span></div>
                    <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Impact: </span><span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>{rec.impact}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ fontSize: '11px', fontWeight: 600, color: '#fff', background: ACCENT, border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                    <button style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#fff', border: '1px solid #e8ecf1', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Proactive Stats */}
          <div style={{ ...st.card, display: 'flex', gap: '32px', marginTop: '16px' }}>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Recommendations Today</span><span style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}> 12</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Accepted</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}> 8</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Dismissed</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#94a3b8' }}> 2</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Pending</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}> 4</span></div>
            <div><span style={{ fontSize: '10px', color: '#94a3b8' }}>Estimated Savings</span><span style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}> ₹18.6L today</span></div>
          </div>
        </Section>
      )}

      {/* ═══ ESCALATION & CHANNELS TAB ═══ */}
      {tab === 'settings' && (
        <>
          <Section title="Escalation Matrix" badge="Auto-Escalation Active" icon="ES">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {escalationRules.map((rule, i) => (
                <div key={i} style={{
                  ...st.card, textAlign: 'center', position: 'relative', overflow: 'hidden',
                  borderTop: `3px solid ${rule.active ? ACCENT : '#e2e8f0'}`,
                  opacity: rule.active ? 1 : 0.6,
                  animation: `slideIn 0.7s ease ${i * 0.1}s both`,
                }}>
                  {rule.active && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  )}
                  <div style={{ fontSize: '10px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{rule.level}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{rule.time}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{rule.role}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>{rule.action}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Auto-escalation triggered 3 times today. Average response time: <strong style={{ color: '#10b981' }}>4.2 min</strong> (target: 5 min)</span>
            </div>
          </Section>

          <Section title="Notification Channels" badge="6 Active" icon="CH">
            <div style={st.card}>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 180px 80px 100px', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
                {['Channel', 'Alert Types', 'Status', 'Latency'].map((h) => (
                  <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</div>
                ))}
              </div>
              {channels.map((ch, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 180px 80px 100px', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '4px', animation: `slideIn 0.6s ease ${i * 0.08}s both` }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{ch.channel}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ch.alerts}</div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px' }}>{ch.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{ch.latency}</div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* AI Footer */}
      <div style={st.aiFooterWrap}>
        <div style={st.aiFooterIcon}>AI</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>AI Anomaly Detection Engine — Steel Plant</div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
            Monitoring 248 sensors with multi-model anomaly detection. Active models: Isolation Forest (vibration), LSTM autoencoder (thermal), Bayesian changepoint detection (process), CNN (visual inspection).
            Alert accuracy rate: 97.4% (false positive rate: 2.6%). Proactive recommendations have prevented 18 unplanned events this month — estimated savings: ₹1.2Cr.
            Average alert-to-action time: 4.2 min. Next model refresh: 2 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

const st = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  sub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '16px', padding: '5px 12px', fontSize: '11px', fontWeight: 600 },
  aiBadge: { background: ACCENT + '15', color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '16px' },
  timeBadge: { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 12px', borderRadius: '16px', border: '1px solid #e8ecf1' },

  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },

  tab: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },

  filterBtn: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  filterActive: { background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  filterCount: { background: '#f1f5f9', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },
  filterCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px' },

  aiRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', padding: '6px 0 0', borderTop: '1px solid #f1f5f9' },
  aiChip: { background: ACCENT, color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', flexShrink: 0 },

  aiFooterWrap: { display: 'flex', gap: '14px', background: '#fff', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '18px', marginTop: '10px' },
  aiFooterIcon: { width: '36px', height: '36px', borderRadius: '8px', background: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 },
}
