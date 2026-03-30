'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const BLUE = '#3b82f6'

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } }, { threshold, rootMargin: '0px 0px -60px 0px' }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return [ref, visible]
}

function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (<div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} /></div>)
}

function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (<div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}><div style={sty.sectionHeader}><div style={sty.sectionIcon}>{icon}</div><h2 style={sty.sectionTitle}>{title}</h2></div>{visible && children}</div>)
}

function ToggleSwitch({ enabled, onToggle }) {
  return (<div onClick={onToggle} style={{ width: '36px', height: '20px', borderRadius: '10px', background: enabled ? GREEN : '#cbd5e1', position: 'relative', cursor: 'pointer', flexShrink: 0 }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: enabled ? '18px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} /></div>)
}

function useLiveMetrics() {
  const [metrics, setMetrics] = useState({ cpu: 38, memory: 65, storage: 52, network: 100 })
  useEffect(() => { const iv = setInterval(() => { setMetrics(prev => ({ cpu: Math.max(15, Math.min(85, prev.cpu + (Math.random() - 0.48) * 6)), memory: Math.max(50, Math.min(80, prev.memory + (Math.random() - 0.5) * 3)), storage: Math.max(48, Math.min(58, prev.storage + (Math.random() - 0.5) * 0.5)), network: 100 })) }, 2000); return () => clearInterval(iv) }, [])
  return metrics
}

// ══════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════

const notificationChannels = [
  { channel: 'Email', enabled: true, recipients: 28, priority: 'All Levels', icon: '📧' },
  { channel: 'SMS', enabled: true, recipients: 12, priority: 'Critical & High', icon: '📱' },
  { channel: 'WhatsApp', enabled: true, recipients: 18, priority: 'Critical Only', icon: '💬' },
  { channel: 'MS Teams', enabled: true, recipients: 42, priority: 'All Levels', icon: '🔔' },
  { channel: 'Dashboard', enabled: true, recipients: 68, priority: 'All Levels', icon: '📊' },
  { channel: 'PA System', enabled: true, recipients: 0, priority: 'Safety Critical', icon: '🚨' },
]

const notificationPrefs = [
  { label: 'Email alerts', enabled: true },
  { label: 'SMS alerts', enabled: true },
  { label: 'Push notifications', enabled: true },
  { label: 'Daily digest', enabled: true },
  { label: 'Weekly report', enabled: false },
  { label: 'Critical only', enabled: false },
]

const accessModules = [
  { module: 'Dashboard', read: true, write: true, admin: true },
  { module: 'AI Vision', read: true, write: true, admin: false },
  { module: 'Predictive Maintenance', read: true, write: true, admin: false },
  { module: 'Digital Twin', read: true, write: false, admin: false },
  { module: 'Compliance', read: true, write: true, admin: true },
  { module: 'Integrations', read: true, write: true, admin: false },
  { module: 'AI Analytics', read: true, write: true, admin: true },
  { module: 'Settings', read: true, write: true, admin: true },
]

const moduleVersions = [
  { name: 'Core Platform', version: 'v1.2.1', updated: '2026-03-15', status: 'up to date' },
  { name: 'AI Engine', version: 'v4.2.0', updated: '2026-03-12', status: 'up to date' },
  { name: 'BF Digital Twin', version: 'v2.8.1', updated: '2026-03-14', status: 'up to date' },
  { name: 'BOF Endpoint AI', version: 'v5.0.2', updated: '2026-03-10', status: 'up to date' },
  { name: 'SCADA Bridge', version: 'v2.6.0', updated: '2026-03-08', status: 'update available' },
  { name: 'MES Connector', version: 'v2.1.4', updated: '2026-03-11', status: 'up to date' },
  { name: 'SAP Integration', version: 'v2.3.1', updated: '2026-03-05', status: 'up to date' },
  { name: 'Vision System', version: 'v4.2.0', updated: '2026-03-13', status: 'up to date' },
  { name: 'Predictive Maintenance', version: 'v3.1.0', updated: '2026-03-14', status: 'up to date' },
  { name: 'Quality Control', version: 'v2.5.1', updated: '2026-03-09', status: 'up to date' },
  { name: 'Environmental', version: 'v1.8.2', updated: '2026-03-07', status: 'update available' },
  { name: 'Energy Management', version: 'v2.4.0', updated: '2026-03-06', status: 'up to date' },
  { name: 'Report Engine (LLM)', version: 'v1.2.0', updated: '2026-03-15', status: 'up to date' },
  { name: 'Safety System', version: 'v1.9.0', updated: '2026-03-13', status: 'up to date' },
]

const changelog = [
  { version: 'v1.2.1', date: '2026-03-15', changes: ['Added Predictive Analytics page with demand/commodity forecasts', 'Improved BF silicon prediction model accuracy to 94.2%', 'Fixed BOF sublance data sync timeout under high load'] },
  { version: 'v1.2.0', date: '2026-03-01', changes: ['Launched Digital Twin 3D simulation with what-if scenarios', 'New environmental compliance dashboard with SPCB CEMS integration', 'Added steel-plant specific chatbot with metallurgy training data'] },
  { version: 'v1.1.4', date: '2026-02-15', changes: ['Resolved SAP PM work order sync timeout under high load', 'Added support for Yokogawa DCS integration via Vnet/IP', 'Improved caster breakout prediction model to 99.1% accuracy'] },
  { version: 'v1.1.3', date: '2026-02-01', changes: ['Optimized TimescaleDB queries for BF hearth trend analysis', 'Added bulk export for Mill Test Certificates in PDF', 'Fixed timezone handling for multi-shift reporting'] },
]

// ══════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════

function SystemConfigTab() {
  const metrics = useLiveMetrics()
  const [alerts, setAlerts] = useState(notificationChannels.map(a => a.enabled))
  const toggleAlert = (i) => setAlerts(prev => prev.map((v, j) => j === i ? !v : v))
  return (
    <>
      <Section title="General Settings" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Plant Name', value: 'Integrated Steel Plant — Unit 1' },
            { label: 'Plant Code', value: 'ISP-001' },
            { label: 'Location', value: 'Odisha, India' },
            { label: 'Timezone', value: 'IST UTC+5:30' },
            { label: 'Language', value: 'English' },
            { label: 'Currency', value: 'INR (₹)' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.05}s` }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Data Collection & Sensor Configuration" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Polling Interval', value: '1 second', icon: '⏱️' },
            { label: 'Data Retention', value: '5 years', icon: '📅' },
            { label: 'Buffer Size', value: '50,000 events', icon: '📦' },
            { label: 'Compression', value: 'Enabled (LZ4)', icon: '🗜️' },
            { label: 'Total Sensors', value: '4,128', icon: '📡' },
            { label: 'Gateways', value: '16 (IOT2050)', icon: '🔌' },
            { label: 'SCADA Tags', value: '68,000', icon: '🏷️' },
            { label: 'Protocol', value: 'OPC-UA + MQTT', icon: '🔗' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.04}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="System Health — Live" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'CPU Usage', value: metrics.cpu, color: metrics.cpu > 70 ? AMBER : GREEN },
            { label: 'Memory', value: metrics.memory, color: metrics.memory > 75 ? AMBER : GREEN },
            { label: 'Storage', value: metrics.storage, color: metrics.storage > 80 ? AMBER : GREEN },
            { label: 'Network', value: metrics.network, color: GREEN },
          ].map((m, i) => (
            <div key={i} style={{ ...sty.card, textAlign: 'center', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{m.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', transition: 'all 0.5s ease' }}>{Math.round(m.value)}%</div>
              <div style={{ marginTop: '8px' }}><ProgressBar value={m.value} color={m.color} height={5} /></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Notification Channels" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {notificationChannels.map((ch, i) => (
            <div key={ch.channel} style={{ ...sty.card, display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.06}s` }}>
              <span style={{ fontSize: '24px' }}>{ch.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{ch.channel}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{ch.priority} {ch.recipients > 0 ? `| ${ch.recipients} users` : ''}</div>
              </div>
              <ToggleSwitch enabled={alerts[i]} onToggle={() => toggleAlert(i)} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function UserSettingsTab() {
  const [prefs, setPrefs] = useState(notificationPrefs.map(p => p.enabled))
  const togglePref = (i) => setPrefs(prev => prev.map((v, j) => j === i ? !v : v))
  return (
    <>
      <Section title="User Profile" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Name', value: 'Plant Admin' },
            { label: 'Email', value: 'admin@steelplant.com' },
            { label: 'Role', value: 'Plant Manager' },
            { label: 'Department', value: 'Operations' },
            { label: 'Last Login', value: 'Today, 08:45 AM' },
            { label: 'Sessions', value: '2 active devices' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Notification Preferences" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {notificationPrefs.map((p, i) => (
            <div key={p.label} style={{ ...sty.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{p.label}</span>
              <ToggleSwitch enabled={prefs[i]} onToggle={() => togglePref(i)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Access Permissions" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}>
        <div style={sty.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
            {['Module', 'Read', 'Write', 'Admin'].map(h => (<div key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>))}
          </div>
          {accessModules.map((m, i) => (
            <div key={m.module} style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr 0.5fr', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{m.module}</div>
              {[m.read, m.write, m.admin].map((v, vi) => (
                <div key={vi}>{v ? <span style={{ color: GREEN, fontSize: '12px' }}>✓</span> : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>}</div>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function VersionTab() {
  return (
    <>
      <Section title="Module Versions" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}>
        <div style={sty.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 0.8fr 0.8fr', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '4px' }}>
            {['Module', 'Version', 'Last Updated', 'Status'].map(h => (<div key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</div>))}
          </div>
          {moduleVersions.map((m, i) => {
            const statusColor = m.status === 'up to date' ? GREEN : AMBER
            return (
              <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 0.8fr 0.8fr', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.03}s` }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{m.name}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: ACCENT }}>{m.version}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{m.updated}</div>
                <div><span style={{ fontSize: '9px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{m.status}</span></div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Changelog" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {changelog.map((entry, i) => (
            <div key={entry.version} style={{ ...sty.card, borderLeft: `4px solid ${i === 0 ? ACCENT : '#e2e8f0'}`, animation: 'fadeUp 0.5s ease both', animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: ACCENT }}>{entry.version}</span>
                  {i === 0 && <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff', background: GREEN, padding: '2px 6px', borderRadius: '4px' }}>LATEST</span>}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{entry.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entry.changes.map((change, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#4a5568', lineHeight: '1.5' }}>
                    <span style={{ color: ACCENT, flexShrink: 0, marginTop: '2px' }}>•</span>
                    {change}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════

export default function Settings({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'system')

  const TABS = [
    { key: 'system', label: 'System Configuration', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></svg> },
    { key: 'user', label: 'User Settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { key: 'version', label: 'Version & Updates', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
  ]

  return (
    <div style={sty.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>

      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" /></svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>Settings</h1>
            <p style={sty.pageSub}>System configuration, user management & version control — Steel Plant</p>
          </div>
        </div>
      </div>

      <div style={sty.tabs}>
        {TABS.map(t => (<button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>))}
      </div>

      {activeTab === 'system' && <SystemConfigTab />}
      {activeTab === 'user' && <UserSettingsTab />}
      {activeTab === 'version' && <VersionTab />}
    </div>
  )
}

const sty = {
  page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#4a5568', cursor: 'pointer', fontWeight: 500 },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  section: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionIcon: { width: '32px', height: '32px', borderRadius: '8px', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '18px' },
}
