'use client'
import { useState } from 'react'

const ACCENT = '#1a9b6c'
const ACCENT_LIGHT = '#e6f7f0'

const icons = {
  dashboard: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  production: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  inventory: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  quality: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  'supply-chain': c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="9" r="2"/><circle cx="19" cy="15" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="5" cy="9" r="2"/><line x1="12" y1="7" x2="12" y2="9"/><line x1="17.2" y1="10" x2="14.8" y2="10.8"/><line x1="17.2" y1="14" x2="14.8" y2="13.2"/><line x1="12" y1="17" x2="12" y2="15"/><line x1="6.8" y1="14" x2="9.2" y2="13.2"/><line x1="6.8" y1="10" x2="9.2" y2="10.8"/></svg>,
  predictive: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  maintenance: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  workforce: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  integrations: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>,
  'ai-vision': c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill={c}/></svg>,
  'digital-twin': c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="8" height="8" rx="1"/><rect x="14" y="3" width="8" height="8" rx="1"/><rect x="2" y="13" width="8" height="8" rx="1"/><rect x="14" y="13" width="8" height="8" rx="1"/><line x1="10" y1="7" x2="14" y2="7"/><line x1="10" y1="17" x2="14" y2="17"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="18" y1="11" x2="18" y2="13"/></svg>,
  'predictive-ai': c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="5" r="3"/><line x1="18" y1="2" x2="18" y2="3"/><line x1="18" y1="7" x2="18" y2="8"/><line x1="15" y1="5" x2="14" y2="5"/><line x1="21" y1="5" x2="22" y2="5"/></svg>,
  admin: c => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

const menuStructure = [
  { key: 'dashboard', label: 'Dashboard', children: [
    { key: 'overview', label: 'Overview' },
    { key: 'realtime-kpis', label: 'Real-Time KPIs' },
    { key: 'oee-monitor', label: 'OEE Monitor' },
    { key: 'ai-insights', label: 'AI Insights Summary' },
  ]},
  { key: 'production', label: 'Production', children: [
    { key: 'batch-tracking', label: 'Batch Tracking' },
    { key: 'line-efficiency', label: 'Line Efficiency' },
    { key: 'recipe-management', label: 'Recipe Management' },
    { key: 'production-planning', label: 'Production Planning' },
  ]},
  { key: 'inventory', label: 'Inventory & Warehouse', children: [
    { key: 'raw-materials', label: 'Raw Materials' },
    { key: 'finished-goods', label: 'Finished Goods' },
    { key: 'expiry-management', label: 'Expiry Management' },
    { key: 'cold-storage', label: 'Cold Storage Monitor' },
  ]},
  { key: 'quality', label: 'Quality Control', children: [
    { key: 'batch-qc', label: 'Batch QC Testing' },
    { key: 'ai-vision-qc', label: 'AI Vision Inspection' },
    { key: 'compliance', label: 'FSSAI / ISO Compliance' },
    { key: 'qc-reports', label: 'QC Reports' },
  ]},
  { key: 'supply-chain', label: 'Supply Chain', children: [
    { key: 'vendor-management', label: 'Vendor Management' },
    { key: 'purchase-orders', label: 'Purchase Orders' },
    { key: 'dispatch-tracking', label: 'Dispatch & Delivery' },
    { key: 'fleet-gps', label: 'Fleet & GPS Tracking' },
  ]},
  { key: 'predictive', label: 'AI & Predictive Analytics', children: [
    { key: 'demand-forecasting', label: 'Demand Forecasting' },
    { key: 'sales-trends', label: 'Sales Trend Analysis' },
    { key: 'cost-analysis', label: 'Cost & Profitability' },
  ]},
  { key: 'ai-intelligence', label: 'AI Intelligence', children: [
    { key: 'ai-vision-camera', label: 'AI Vision Camera' },
    { key: 'digital-twin', label: 'Digital Twin' },
    { key: 'predictive-ai', label: 'Predictive Maintenance AI' },
  ]},
  { key: 'maintenance', label: 'Maintenance', children: [
    { key: 'asset-health', label: 'Asset Health' },
    { key: 'preventive-maintenance', label: 'Preventive Maintenance' },
    { key: 'work-orders', label: 'Work Orders' },
    { key: 'spare-parts', label: 'Spare Parts Tracker' },
  ]},
  { key: 'workforce', label: 'Workforce', children: [
    { key: 'shift-scheduling', label: 'Shift Scheduling' },
    { key: 'attendance', label: 'Attendance Tracking' },
    { key: 'performance', label: 'Performance Monitor' },
  ]},
  { key: 'integrations', label: 'Integrations', children: [
    { key: 'erp-integration', label: 'ERP — SAP / Tally' },
    { key: 'iot-sensors', label: 'IoT & Sensor Hub' },
    { key: 'communication', label: 'Communication APIs' },
    { key: 'hardware-integration', label: 'Hardware & RFID' },
  ]},
  { key: 'admin', label: 'Administration', children: [
    { key: 'user-management', label: 'User Management' },
    { key: 'roles-permissions', label: 'Roles & Permissions' },
    { key: 'audit-logs', label: 'Audit Logs' },
    { key: 'system-config', label: 'System Configuration' },
  ]},
]

export default function Sidebar({ collapsed, onToggle, activeItem, onItemClick }) {
  const [expandedMenus, setExpandedMenus] = useState(['dashboard', 'production'])

  const toggleMenu = (key) => setExpandedMenus(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  const isChildActive = (menu) => menu.children?.some(c => c.key === activeItem)

  return (
    <>
      <button style={{ ...st.collapseBtn, left: collapsed ? '48px' : '238px' }} onClick={onToggle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
        </svg>
      </button>

      <div style={{ ...st.sidebar, width: collapsed ? '60px' : '250px' }}>
        <div style={st.logoSection}>
          <div style={st.logoCircle}><span style={st.logoTxt}>F</span></div>
          {!collapsed && (
            <div style={st.brandBlock}>
              <span style={st.brandName}>FMCG Portal</span>
              <span style={st.brandSub}>iFactory AI Platform</span>
            </div>
          )}
        </div>

        <nav style={st.nav}>
          {menuStructure.map(menu => {
            const isActive = expandedMenus.includes(menu.key) || isChildActive(menu)
            const ic = isActive ? ACCENT : '#64748b'
            return (
              <div key={menu.key} style={st.menuGroup}>
                <div style={{ ...st.menuItem, ...(isActive ? st.menuItemActive : {}) }}
                  onClick={() => { toggleMenu(menu.key); if (!menu.children?.length) onItemClick(menu.key) }}>
                  <div style={{ ...st.menuIcon, ...(isActive ? st.menuIconActive : {}) }}>
                    {icons[menu.key]?.(ic)}
                  </div>
                  {!collapsed && (
                    <>
                      <span style={st.menuLabel}>{menu.label}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? ACCENT : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.2s', transform: expandedMenus.includes(menu.key) ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </>
                  )}
                </div>
                {!collapsed && expandedMenus.includes(menu.key) && menu.children && (
                  <div style={st.submenu}>
                    {menu.children.map(child => {
                      const ca = activeItem === child.key
                      return (
                        <div key={child.key} style={{ ...st.submenuItem, ...(ca ? st.submenuItemActive : {}) }} onClick={() => onItemClick(child.key)}>
                          <span style={{ ...st.submenuDot, ...(ca ? st.submenuDotActive : {}) }}/>
                          <span style={st.submenuLabel}>{child.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div style={st.bottomSection}>
          {!collapsed && (
            <div style={st.versionBox}>
              <div style={st.versionBadge}>v1.0.0</div>
              <div>
                <div style={st.versionTitle}>What's New</div>
                <div style={st.versionSub}>AI Demand module live</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const st = {
  sidebar: { background: '#fff', borderRight: '1px solid #e8ecf1', display: 'flex', flexDirection: 'column', height: '100vh', transition: 'width 0.2s ease', overflowX: 'hidden', overflowY: 'hidden', position: 'fixed', left: 0, top: 0, zIndex: 110 },
  collapseBtn: { position: 'fixed', top: '22px', zIndex: 120, width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #e8ecf1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', transition: 'left 0.2s ease' },
  logoSection: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #e8ecf1', flexShrink: 0 },
  logoCircle: { width: 38, height: 38, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoTxt: { color: '#fff', fontWeight: 800, fontSize: 16 },
  brandBlock: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  brandName: { fontWeight: 700, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  brandSub: { fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' },
  nav: { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0', scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' },
  menuGroup: { marginBottom: 2 },
  menuItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', color: '#4a5568', fontSize: 13, transition: 'all 0.15s' },
  menuItemActive: { color: ACCENT },
  menuIcon: { width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuIconActive: { background: ACCENT_LIGHT },
  menuLabel: { flex: 1, fontWeight: 500, lineHeight: 1.3 },
  submenu: { paddingLeft: 8, paddingBottom: 4, borderLeft: `2px solid ${ACCENT_LIGHT}`, marginLeft: 22 },
  submenuItem: { padding: '7px 12px', fontSize: 12, color: '#64748b', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' },
  submenuItemActive: { color: ACCENT, background: ACCENT_LIGHT, fontWeight: 600 },
  submenuDot: { width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 },
  submenuDotActive: { background: ACCENT },
  submenuLabel: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  bottomSection: { borderTop: '1px solid #e8ecf1', padding: 8, flexShrink: 0 },
  versionBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 8 },
  versionBadge: { background: ACCENT, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.5px', flexShrink: 0 },
  versionTitle: { fontSize: 11, fontWeight: 600, color: '#1e293b' },
  versionSub: { fontSize: 10, color: '#94a3b8' },
}
