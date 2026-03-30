'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/industries/fmcg/components/Sidebar'
import TopBar from '@/components/industries/fmcg/components/TopBar'
import Chatbot from '@/components/industries/fmcg/components/Chatbot'
import { FmcgLiveDataProvider } from '@/components/industries/fmcg/context/LiveDataContext'

const ACCENT = '#605dba'

export default function FmcgLayout({ children }) {
  const params = useParams()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showDemoPopup, setShowDemoPopup] = useState(false)
  const dismissCountRef = useRef(0)
  const popupDelays = [60000, 120000, 300000]

  const activeItem = params?.section || 'overview'
  const setActiveItem = (key) => router.push(`/portal/fmcg/${key}`)

  useEffect(() => {
    const timer = setTimeout(() => setShowDemoPopup(true), popupDelays[0])
    return () => clearTimeout(timer)
  }, [])

  const handleDismissPopup = () => {
    setShowDemoPopup(false)
    dismissCountRef.current += 1
    const delayIndex = Math.min(dismissCountRef.current, popupDelays.length - 1)
    setTimeout(() => setShowDemoPopup(true), popupDelays[delayIndex])
  }

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: `fmcg/${activeItem}` }),
    }).catch(() => {})
  }, [activeItem])

  const sidebarWidth = sidebarCollapsed ? 60 : 250

  return (
    <FmcgLiveDataProvider>
    <div style={styles.layout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeItem={activeItem}
        onItemClick={setActiveItem}
      />

      <div style={{ ...styles.main, marginLeft: `${sidebarWidth}px` }}>
        <TopBar />
        <div style={styles.content}>
          {children}
        </div>
      </div>

      <Chatbot />

      {showDemoPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <button style={styles.popupClose} onClick={handleDismissPopup}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={styles.popupIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 style={styles.popupTitle}>Transform Your FMCG Operations with AI</h3>
            <p style={styles.popupText}>
              This is a preview of the iFactory AI FMCG platform. Get a fully customised, production-ready solution for your FMCG plant — schedule a free 30-min call with our team.
            </p>
            <div style={styles.popupBenefits}>
              {[
                'Live walkthrough of your FMCG use-case',
                'Custom AI & IoT integration plan',
                'ROI analysis for your operations'
              ].map((b, i) => (
                <div key={i} style={styles.popupBenefit}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <a
              href="https://calendly.com/contact-ifactoryapp/30min?utm_source=fmcg-demo-portal"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.popupBtn}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule a Free Demo Call
            </a>
            <p style={styles.popupFooter}>No commitment required. 100% free consultation.</p>
          </div>
        </div>
      )}
    </div>
    </FmcgLiveDataProvider>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  main: { flex: 1, transition: 'margin-left 0.2s ease' },
  content: { padding: '24px' },
  popupOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 },
  popup: { background: '#fff', borderRadius: '16px', padding: '32px', width: '440px', maxWidth: '90vw', textAlign: 'center', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  popupClose: { position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' },
  popupIconWrap: { width: '64px', height: '64px', borderRadius: '50%', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  popupTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#1e293b', lineHeight: '1.4' },
  popupText: { fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px' },
  popupBenefits: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' },
  popupBenefit: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1e293b', fontWeight: 500 },
  popupBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#605dba', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', width: '100%', boxSizing: 'border-box' },
  popupFooter: { fontSize: '11px', color: '#94a3b8', marginTop: '12px', marginBottom: 0 },
}
