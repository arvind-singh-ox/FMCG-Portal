'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'
const BLUE = '#3b82f6'
const CYAN = '#06b6d4'
const GREEN = '#10b981'
const RED = '#ef4444'
const AMBER = '#f59e0b'
const ORANGE = '#f97316'

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

// ─── Progress Bar ───
function ProgressBar({ value, max = 100, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height, background: '#f1f5f9', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2, transition: 'width 1s ease' }} />
    </div>
  )
}

// ─── Section ───
function Section({ title, icon, children }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ ...sty.section, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={sty.sectionHeader}>
        <div style={sty.sectionIcon}>{icon}</div>
        <h2 style={sty.sectionTitle}>{title}</h2>
      </div>
      {visible && children}
    </div>
  )
}

// ─── Live System Metrics Hook ───
function useLiveMetrics() {
  const [metrics, setMetrics] = useState({ cpu: 34, memory: 62, storage: 48, network: 100 })
  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(15, Math.min(85, prev.cpu + (Math.random() - 0.48) * 6)),
        memory: Math.max(40, Math.min(80, prev.memory + (Math.random() - 0.5) * 3)),
        storage: Math.max(45, Math.min(55, prev.storage + (Math.random() - 0.5) * 0.5)),
        network: 100,
      }))
    }, 2000)
    return () => clearInterval(iv)
  }, [])
  return metrics
}

// ─── Toggle Switch ───
function ToggleSwitch({ enabled, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '36px', height: '20px', borderRadius: '10px', background: enabled ? GREEN : '#cbd5e1', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: enabled ? '18px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

// ─── NOTIFICATION CHANNELS DATA ───
const notificationChannels = [
  { channel: 'Email', enabled: true, recipients: 24, priority: 'All Levels', icon: '📧' },
  { channel: 'SMS', enabled: true, recipients: 8, priority: 'Critical & High', icon: '📱' },
  { channel: 'WhatsApp', enabled: true, recipients: 12, priority: 'Critical Only', icon: '💬' },
  { channel: 'Slack', enabled: true, recipients: 36, priority: 'All Levels', icon: '🔔' },
  { channel: 'Dashboard', enabled: true, recipients: 48, priority: 'All Levels', icon: '📊' },
  { channel: 'PLC Alarm', enabled: false, recipients: 6, priority: 'Critical Only', icon: '🚨' },
]

// ─── USER NOTIFICATION PREFS ───
const notificationPrefs = [
  { label: 'Email alerts', enabled: true },
  { label: 'SMS alerts', enabled: true },
  { label: 'Push notifications', enabled: true },
  { label: 'Daily digest', enabled: true },
  { label: 'Weekly report', enabled: false },
  { label: 'Critical only', enabled: false },
]

// ─── ACCESS PERMISSIONS ───
const accessModules = [
  { module: 'Dashboard', read: true, write: true, admin: true },
  { module: 'AI Vision', read: true, write: true, admin: false },
  { module: 'Integrations', read: true, write: true, admin: false },
  { module: 'Robotics', read: true, write: false, admin: false },
  { module: 'Maintenance', read: true, write: true, admin: true },
  { module: 'Compliance', read: true, write: true, admin: false },
  { module: 'Analytics', read: true, write: true, admin: true },
  { module: 'Settings', read: true, write: true, admin: true },
]

// ─── MODULE VERSIONS ───
const moduleVersions = [
  { name: 'Core Platform', version: 'v1.2.1', updated: '2026-03-15', status: 'up to date' },
  { name: 'AI Engine', version: 'v3.8.2', updated: '2026-03-12', status: 'up to date' },
  { name: 'SCADA Bridge', version: 'v2.4.0', updated: '2026-03-10', status: 'update available' },
  { name: 'MES Connector', version: 'v1.9.4', updated: '2026-03-08', status: 'up to date' },
  { name: 'SAP Integration', version: 'v2.1.3', updated: '2026-03-05', status: 'up to date' },
  { name: 'Robotics Module', version: 'v1.5.0', updated: '2026-02-28', status: 'update available' },
  { name: 'Predictive Maintenance', version: 'v2.7.1', updated: '2026-03-14', status: 'up to date' },
  { name: 'Quality Control', version: 'v1.8.3', updated: '2026-03-11', status: 'up to date' },
  { name: 'Environmental', version: 'v1.3.2', updated: '2026-03-09', status: 'up to date' },
  { name: 'Energy Management', version: 'v2.0.1', updated: '2026-03-06', status: 'update available' },
  { name: 'Safety System', version: 'v1.6.0', updated: '2026-03-13', status: 'up to date' },
  { name: 'Reporting Engine', version: 'v2.2.4', updated: '2026-03-07', status: 'up to date' },
]

// ─── CHANGELOG ───
const changelog = [
  {
    version: 'v1.2.1',
    date: '2026-03-15',
    changes: [
      'Fixed kiln temperature sensor data aggregation lag issue',
      'Improved AI model inference latency by 18% for vision pipeline',
      'Updated SCADA polling interval configuration options',
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-03-01',
    changes: [
      'Added predictive maintenance alerts for ball mill bearings',
      'New environmental compliance dashboard with CPCB integration',
      'Enhanced real-time KPI widgets with drill-down capability',
    ],
  },
  {
    version: 'v1.1.4',
    date: '2026-02-15',
    changes: [
      'Resolved SAP PM work order sync timeout under high load',
      'Added support for Modbus TCP protocol in SCADA bridge',
    ],
  },
  {
    version: 'v1.1.3',
    date: '2026-02-01',
    changes: [
      'Optimized database queries for historical trend analysis',
      'Added bulk export for compliance reports in PDF and Excel',
      'Fixed timezone handling for multi-region deployments',
    ],
  },
]

// ═══════════════════════════════════════════════
// ─── SYSTEM CONFIGURATION TAB ────────────────
// ═══════════════════════════════════════════════
function SystemConfigTab() {
  const [alerts, setAlerts] = useState(notificationChannels.map(a => a.enabled))
  const toggleAlert = (i) => setAlerts(prev => prev.map((v, j) => j === i ? !v : v))
  return (
    <>
      {/* General Settings */}
      <Section title="General Settings" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Plant Name', value: 'Cement Plant Unit-1' },
            { label: 'Plant Code', value: 'CP-001' },
            { label: 'Region', value: 'South Asia' },
            { label: 'Timezone', value: 'IST UTC+5:30' },
            { label: 'Language', value: 'English' },
            { label: 'Currency', value: 'INR' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Data Collection */}
      <Section title="Data Collection" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Polling Interval', value: '5 seconds', icon: '⏱️' },
            { label: 'Data Retention', value: '90 days', icon: '📅' },
            { label: 'Buffer Size', value: '10,000 events', icon: '📦' },
            { label: 'Compression', value: 'Enabled', icon: '🗜️' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '22px' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Alert Configuration */}
      <Section title="Alert Configuration" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Channel</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recipients</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority Level</th>
              </tr>
            </thead>
            <tbody>
              {notificationChannels.map((ch, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1e293b' }}>
                    <span style={{ marginRight: '8px' }}>{ch.icon}</span>{ch.channel}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <ToggleSwitch enabled={alerts[i]} onToggle={() => toggleAlert(i)} />
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{ch.recipients}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{ch.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* API Configuration */}
      <Section title="API Configuration" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { label: 'API Endpoint', value: 'https://api.ifactory.io/v2/cement' },
            { label: 'Rate Limit', value: '1,000 req/min' },
            { label: 'API Version', value: 'v2.4' },
            { label: 'Auth Method', value: 'JWT + API Key' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', wordBreak: 'break-all' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Backup Settings */}
      <Section title="Backup Settings" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Auto Backup', value: 'Daily at 2:00 AM' },
            { label: 'Retention', value: '30 days' },
            { label: 'Last Backup', value: '2026-03-19 02:00:14 IST' },
            { label: 'Backup Size', value: '2.4 GB' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Status:</span>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Healthy</span>
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════
// ─── USER SETTINGS TAB ────────────────────────
// ═══════════════════════════════════════════════
function UserSettingsTab() {
  const [prefs, setPrefs] = useState(notificationPrefs.map(p => p.enabled))
  const togglePref = (i) => setPrefs(prev => prev.map((v, j) => j === i ? !v : v))
  return (
    <>
      {/* Profile */}
      <Section title="Profile" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Full Name', value: 'Rajesh Kumar Sharma' },
            { label: 'Email', value: 'r.sharma@cementplant.com' },
            { label: 'Role', value: 'Plant Manager' },
            { label: 'Department', value: 'Operations' },
            { label: 'Phone', value: '+91 98765 43210' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', padding: '6px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notification Preferences" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {notificationPrefs.map((pref, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{pref.label}</span>
              <ToggleSwitch enabled={prefs[i]} onToggle={() => togglePref(i)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Dashboard Preferences */}
      <Section title="Dashboard Preferences" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Default Landing Page', value: 'Overview Dashboard' },
            { label: 'Theme', value: 'Light' },
            { label: 'Data Refresh Rate', value: '5 seconds' },
            { label: 'Chart Animation', value: 'Enabled' },
            { label: 'Compact Mode', value: 'Disabled' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', padding: '6px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Access & Permissions */}
      <Section title="Access & Permissions" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Read</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Write</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</th>
              </tr>
            </thead>
            <tbody>
              {accessModules.map((mod, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1e293b' }}>{mod.module}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {mod.read ? <span style={{ color: GREEN, fontWeight: 700 }}>&#10003;</span> : <span style={{ color: '#cbd5e1' }}>&mdash;</span>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {mod.write ? <span style={{ color: GREEN, fontWeight: 700 }}>&#10003;</span> : <span style={{ color: '#cbd5e1' }}>&mdash;</span>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {mod.admin ? <span style={{ color: ACCENT, fontWeight: 700 }}>&#10003;</span> : <span style={{ color: '#cbd5e1' }}>&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════
// ─── VERSION & UPDATES TAB ────────────────────
// ═══════════════════════════════════════════════
function VersionUpdatesTab() {
  const metrics = useLiveMetrics()
  return (
    <>
      {/* Current Version */}
      <Section title="Current Version" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Version', value: 'v1.2.1 (build 2026.03.15)', color: ACCENT },
            { label: 'Platform', value: 'iFactory AI', color: BLUE },
            { label: 'License', value: 'Enterprise', color: GREEN },
            { label: 'Modules', value: '24 Active', color: CYAN },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* System Health */}
      <Section title="System Health" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { label: 'CPU Usage', value: Math.round(metrics.cpu), color: metrics.cpu > 70 ? AMBER : GREEN },
            { label: 'Memory Usage', value: Math.round(metrics.memory), color: metrics.memory > 70 ? AMBER : BLUE },
            { label: 'Storage Usage', value: Math.round(metrics.storage), color: BLUE },
            { label: 'Network', value: 100, displayValue: 'OK', color: GREEN },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.displayValue || `${item.value}%`}</span>
              </div>
              <ProgressBar value={item.value} color={item.color} height={8} />
            </div>
          ))}
        </div>
      </Section>

      {/* Module Versions */}
      <Section title="Module Versions" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Version</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Updated</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {moduleVersions.map((mod, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1e293b' }}>{mod.name}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{mod.version}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{mod.updated}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600,
                      background: mod.status === 'up to date' ? '#f0fdf4' : '#fffbeb',
                      color: mod.status === 'up to date' ? '#16a34a' : '#d97706',
                      border: mod.status === 'up to date' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    }}>{mod.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Changelog */}
      <Section title="Changelog" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {changelog.map((entry, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', borderLeft: `3px solid ${i === 0 ? ACCENT : '#cbd5e1'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{entry.version}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{entry.date}</span>
                {i === 0 && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: '#ededfa', color: ACCENT }}>Latest</span>}
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', listStyle: 'disc' }}>
                {entry.changes.map((change, j) => (
                  <li key={j} style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.8' }}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Support */}
      <Section title="Support" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Support Contact', value: 'support@ifactory.io', icon: '📧' },
            { label: 'SLA Tier', value: 'Premium 24/7', icon: '🏆' },
            { label: 'Ticket Portal', value: 'https://support.ifactory.io', icon: '🎫' },
            { label: 'Documentation', value: 'https://docs.ifactory.io/cement', icon: '📖' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '22px' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', wordBreak: 'break-all' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───────────────────────────
// ═══════════════════════════════════════════════
export default function Settings({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'system')

  const TABS = [
    { key: 'system', label: 'System Configuration', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
    { key: 'user', label: 'User Settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { key: 'version', label: 'Version & Updates', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
  ]

  return (
    <div style={sty.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={sty.pageHeader}>
        <div style={sty.headerLeft}>
          <div style={sty.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h1 style={sty.pageTitle}>System Settings</h1>
            <p style={sty.pageSub}>Configuration, user preferences, and system information</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={sty.tabs}>
        {TABS.map((t) => (
          <button key={t.key} style={activeTab === t.key ? sty.tabActive : sty.tab} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'system' && <SystemConfigTab />}
      {activeTab === 'user' && <UserSettingsTab />}
      {activeTab === 'version' && <VersionUpdatesTab />}
    </div>
  )
}

// ─── STYLES ───
const sty = {
  page: { animation: 'fadeUp 0.6s ease' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { width: '44px', height: '44px', borderRadius: '10px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b' },
  pageSub: { margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', padding: '20px', marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionIcon: { width: '34px', height: '34px', borderRadius: '8px', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' },
}
