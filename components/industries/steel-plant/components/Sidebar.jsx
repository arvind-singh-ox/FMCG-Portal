'use client'

import { useState } from 'react'

const ACCENT = '#605dba'
const ACCENT_LIGHT = '#ededfa'

const icons = {
  dashboard: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  'ai-vision': (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  'safety-loto': (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  'predictive-maintenance': (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  'digital-twin': (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  compliance: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  analytics: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  'integrations-hub': (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
    </svg>
  ),
  settings: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const menuStructure = [
  {
    key: 'dashboard', label: 'Dashboard',
    children: [
      { key: 'overview', label: 'Overview' },
      { key: 'realtime-kpis', label: 'Real-Time KPIs' },
      { key: 'production-scheduling', label: 'Production Scheduling & Monitoring' },
      { key: 'alerts-notifications', label: 'Alerts & Notifications' },
      { key: 'scrap-to-rebar', label: 'Scrap-to-Rebar Manufacturing' },
    ],
  },
  {
    key: 'ai-vision', label: 'AI Vision',
    children: [
      { key: 'blast-furnace', label: 'Blast Furnace Optimization' },
      { key: 'conveyor-health', label: 'Conveyor Belt Health Monitoring' },
      { key: 'raw-material', label: 'Raw Material & Fuel Blend' },
      { key: 'quality-prediction', label: 'Quality Prediction & Control' },
      { key: 'emission-monitoring', label: 'Emissions Monitoring & Compliance' },
      { key: 'inventory-logistics', label: 'Inventory & Logistics Optimization' },
      { key: 'energy-optimization', label: 'Energy Optimization' },
      { key: 'smart-sensors', label: 'Smart Sensors' },
    ],
  },
  {
    key: 'integrations-hub', label: 'Integrations',
    children: [
      { key: 'software-integrations', label: 'Software Integrations' },
      { key: 'hardware-integrations', label: 'Hardware Integrations' },
      { key: 'ai-infrastructure', label: 'On-Premise AI Infrastructure' },
    ],
  },
  {
    key: 'safety-loto', label: 'Safety & LOTO',
    children: [
      { key: 'digital-loto', label: 'Digital LOTO Management' },
    ],
  },
  {
    key: 'predictive-maintenance', label: 'Predictive Maintenance',
    children: [
      { key: 'asset-health', label: 'Critical Asset Health Monitoring' },
      { key: 'anomaly-detection', label: 'Anomaly Detection & Alerts' },
      { key: 'maintenance-scheduling', label: 'Maintenance Scheduling & History' },
      { key: 'work-orders', label: 'Work Orders' },
    ],
  },
  {
    key: 'digital-twin', label: 'Digital Twin Simulation',
    children: [
      { key: 'digital-twin-3d', label: '3D Real-Time Simulation' },
      { key: 'predictive-process', label: 'Predictive Process Changes' },
      { key: 'efficiency-optimization', label: 'Efficiency Optimization' },
    ],
  },
  {
    key: 'compliance', label: 'Compliance & Audit',
    children: [
      { key: 'env-compliance', label: 'Environmental Compliance Dashboard' },
      { key: 'compliance-reports', label: 'Compliance Reports' },
    ],
  },
  {
    key: 'analytics', label: 'AI Analytics & Reporting',
    children: [
      { key: 'custom-reports', label: 'Custom AI Reports' },
      { key: 'realtime-analytics', label: 'Real-Time Data Analytics' },
      { key: 'predictive-analytics', label: 'Predictive Analytics' },
    ],
  },
  {
    key: 'settings', label: 'Settings',
    children: [
      { key: 'system-config', label: 'System Configuration' },
      { key: 'user-settings', label: 'User Settings' },
      { key: 'version-info', label: 'Version & Updates' },
    ],
  },
]

function Sidebar({ collapsed, onToggle, activeItem, onItemClick }) {
  const [expandedMenus, setExpandedMenus] = useState(['dashboard', 'ai-vision'])

  const toggleMenu = (key) => {
    setExpandedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const isChildActive = (menu) => menu.children?.some((c) => c.key === activeItem)

  return (
    <>
      {/* Collapse / Expand toggle */}
      <button
        style={{ ...styles.collapseBtn, left: collapsed ? '48px' : '268px' }}
        onClick={onToggle}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed
            ? <polyline points="9 18 15 12 9 6" />
            : <polyline points="15 18 9 12 15 6" />
          }
        </svg>
      </button>

      <div style={{ ...styles.sidebar, width: collapsed ? '60px' : '280px' }}>
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>iF</span>
          </div>
          {!collapsed && (
            <div style={styles.brandBlock}>
              <span style={styles.brandName}>Steel Plant</span>
              <span style={styles.brandSub}>iFactory AI Platform</span>
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {menuStructure.map((menu) => {
            const isActive = expandedMenus.includes(menu.key) || isChildActive(menu)
            const iconColor = isActive ? ACCENT : '#64748b'
            return (
              <div key={menu.key} style={styles.menuGroup}>
                <div
                  style={{
                    ...styles.menuItem,
                    ...(isActive ? styles.menuItemActive : {}),
                  }}
                  onClick={() => { toggleMenu(menu.key); if (!menu.children?.length) onItemClick(menu.key) }}
                >
                  <div style={{ ...styles.menuIcon, ...(isActive ? styles.menuIconActive : {}) }}>
                    {icons[menu.key]?.(iconColor)}
                  </div>
                  {!collapsed && (
                    <>
                      <span style={styles.menuLabel}>{menu.label}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? ACCENT : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.2s', transform: expandedMenus.includes(menu.key) ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </>
                  )}
                </div>
                {!collapsed && expandedMenus.includes(menu.key) && menu.children && (
                  <div style={styles.submenu}>
                    {menu.children.map((child) => {
                      const childActive = activeItem === child.key
                      return (
                        <div key={child.key}
                          style={{ ...styles.submenuItem, ...(childActive ? styles.submenuItemActive : {}) }}
                          onClick={() => onItemClick(child.key)}>
                          <span style={{ ...styles.submenuDot, ...(childActive ? styles.submenuDotActive : {}) }} />
                          <span style={styles.submenuLabel}>{child.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div style={styles.bottomSection}>
          {!collapsed && (
            <div style={styles.versionBox}>
              <div style={styles.versionBadge}>v1.2.1</div>
              <div>
                <div style={styles.versionTitle}>What's New</div>
                <div style={styles.versionSub}>AI Vision module updated</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const styles = {
  sidebar: {
    background: '#fff',
    borderRight: '1px solid #e8ecf1',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    transition: 'width 0.2s ease',
    overflowX: 'hidden',
    overflowY: 'hidden',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 110,
  },
  collapseBtn: {
    position: 'fixed',
    top: '22px',
    zIndex: 120,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid #e8ecf1',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    transition: 'left 0.2s ease',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderBottom: '1px solid #e8ecf1',
    flexShrink: 0,
  },
  logoCircle: { width: '38px', height: '38px', borderRadius: '8px', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { color: '#fff', fontWeight: 800, fontSize: '13px' },
  brandBlock: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  brandName: { fontWeight: 700, fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  brandSub: { fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px 0',
    scrollbarWidth: 'thin',
    scrollbarColor: '#e2e8f0 transparent',
  },
  menuGroup: { marginBottom: '2px' },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    cursor: 'pointer',
    color: '#4a5568',
    fontSize: '13px',
    transition: 'all 0.15s',
    borderRadius: '0',
  },
  menuItemActive: { color: ACCENT },
  menuIcon: {
    width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  menuIconActive: { background: ACCENT_LIGHT },
  menuLabel: { flex: 1, fontWeight: 500, lineHeight: '1.3' },
  submenu: { paddingLeft: '8px', paddingBottom: '4px', borderLeft: `2px solid ${ACCENT_LIGHT}`, marginLeft: '22px' },
  submenuItem: {
    padding: '7px 12px',
    fontSize: '12px',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.15s',
  },
  submenuItemActive: { color: ACCENT, background: ACCENT_LIGHT, fontWeight: 600 },
  submenuDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 },
  submenuDotActive: { background: ACCENT },
  submenuLabel: { whiteSpace: 'normal', lineHeight: '1.4', wordBreak: 'break-word' },
  bottomSection: { borderTop: '1px solid #e8ecf1', padding: '8px', flexShrink: 0 },
  versionBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' },
  versionBadge: { background: ACCENT, color: '#fff', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px', flexShrink: 0 },
  versionTitle: { fontSize: '11px', fontWeight: 600, color: '#1e293b' },
  versionSub: { fontSize: '10px', color: '#94a3b8' },
}

export default Sidebar
