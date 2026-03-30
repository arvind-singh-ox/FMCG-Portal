'use client'

import { useRouter } from 'next/navigation'

const ACCENT = '#605dba'

function TopBar() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={styles.topBar}>
      <style>{`
        @keyframes nudgeRight {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(5px); opacity: 1; }
        }
      `}</style>
      <div style={styles.left}>
        <div style={styles.brand}>iFactory AI</div>
      </div>
      <div style={styles.actions}>
        <div style={styles.previewBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={styles.previewText}>This is a preview of our platform experience.</span>
          <span style={styles.ctaText}>Unlock your custom production-ready solution</span>
          <svg width="16" height="12" viewBox="0 0 24 14" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'nudgeRight 1.2s ease-in-out infinite', flexShrink: 0 }}>
            <line x1="4" y1="7" x2="18" y2="7" />
            <polyline points="13 2 18 7 13 12" />
          </svg>
        </div>
        <a
          href="https://calendly.com/contact-ifactoryapp/30min?utm_source=cement-plant-demo-portal"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.scheduleBtn}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Schedule a Call
        </a>
        <button style={styles.iconBtn} title="Notifications">
          <span style={styles.badge}>9+</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button style={styles.iconBtn} title="Fullscreen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
        <button style={styles.iconBtn} title="Profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <select style={styles.langSelect}><option>EN</option><option>HI</option></select>
        <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e8ecf1', position: 'sticky', top: 0, zIndex: 100 },
  left: { display: 'flex', alignItems: 'center', gap: '16px' },
  brand: { fontSize: '18px', fontWeight: 700, color: ACCENT },
  previewBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', border: '1px solid #e0daf5', borderRadius: '20px', padding: '5px 14px' },
  previewText: { fontSize: '12px', color: '#64748b', fontWeight: 500 },
  ctaText: { fontSize: '11px', color: ACCENT, fontWeight: 700, marginLeft: '4px', whiteSpace: 'nowrap' },
  actions: { display: 'flex', alignItems: 'center', gap: '8px' },
  scheduleBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' },
  iconBtn: { background: 'none', border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  langSelect: { border: '1px solid #e8ecf1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#4a5568', fontWeight: 600 },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' },
}

export default TopBar
