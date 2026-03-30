'use client'

import { useState, useEffect } from 'react'

const chatHistory = [
  {
    role: 'user',
    text: 'What is the current hot metal silicon level from BF#1?',
    time: '10:15 AM',
  },
  {
    role: 'ai',
    text: 'BF#1 hot metal silicon [Si] from the last cast (#14) is 0.45%, which is within the target range of 0.30–0.60%. The thermal state is stable. LSTM prediction model forecasts next cast [Si] at 0.43% (±0.04%), indicating a slight cooling trend.\n\nRecommendation: No action required. Current RAFT is 2,185°C — well within the optimal 2,100–2,200°C window.',
    time: '10:15 AM',
  },
  {
    role: 'user',
    text: 'What is the coke rate trend this week? Can we reduce it further?',
    time: '10:18 AM',
  },
  {
    role: 'ai',
    text: 'BF#1 coke rate trend (kg/THM) this week:\n\nMon: 335 | Tue: 332 | Wed: 330 | Thu: 328 | Fri: 328 | Sat: 326 | Today: 328\n\nOverall trend: Down 2.1% week-over-week. Improvement driven by PCI rate increase from 158 to 165 kg/THM on Wednesday.\n\nFurther reduction options:\n1. Increase PCI to 175 kg/THM with finer grinding (75μm → 60μm) — saves ~8 kg coke/THM\n2. Raise hot blast temp by 15°C (stove dome has headroom) — saves ~5 kg/THM\n3. Increase pellet ratio from 18% to 22% — improves permeability and gas utilization\n\nEstimated combined saving: 10–13 kg/THM (₹12–16L/day).',
    time: '10:18 AM',
  },
  {
    role: 'user',
    text: 'Is there any equipment health concern on Rolling Mill Stand #3?',
    time: '10:22 AM',
  },
  {
    role: 'ai',
    text: 'Yes, Rolling Mill Stand #3 has an active critical alert (ALR-4280):\n\n• Work roll vibration: 5.8 mm/s (threshold: 4.5 mm/s)\n• Pattern matches early-stage bearing inner race defect\n• AI predictive model: 87% probability of bearing failure within 72 hours\n\nRecommendation: Schedule bearing replacement during next planned roll change (tomorrow 06:00 AM). Spare bearing B-7240 is in inventory (Warehouse Bay 14).\n\nI have already raised Work Order WO-2026-3085 as draft for your approval.',
    time: '10:22 AM',
  },
  {
    role: 'user',
    text: 'What is the current BOF endpoint prediction accuracy?',
    time: '10:26 AM',
  },
  {
    role: 'ai',
    text: 'BOF endpoint prediction performance (last 50 heats):\n\n• Carbon hit rate: 94.8% (target [C] ±0.01%)\n• Temperature hit rate: 96.1% (target ±10°C)\n• Overall endpoint accuracy: 97.2%\n• Average blow time: 16.2 min (optimal: 14–18 min)\n\nThe XGBoost endpoint model was retrained 6 hours ago with 340 recent heats. Mn recovery has improved to 72% since we adjusted lance height recommendations for the current scrap mix.\n\nNext model retraining: 18 hours. No parameter drift detected.',
    time: '10:26 AM',
  },
]

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState('chat')
  const [inputText, setInputText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (isOpen) return
    const runCycle = () => {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 5000)
    }
    runCycle()
    const interval = setInterval(runCycle, 15000)
    return () => clearInterval(interval)
  }, [isOpen])

  const handleSend = () => {
    if (inputText.trim()) {
      setInputText('')
      setShowPopup(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  if (!isOpen) {
    return (
      <div style={styles.floatingWrap}>
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(10px); }
            15% { opacity: 1; transform: translateX(0); }
            80% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(10px); }
          }
        `}</style>
        {showHint && (
          <div style={styles.hintBubble}>
            Ask AI about your steel plant operations
            <span style={styles.hintArrow} />
          </div>
        )}
        <button style={styles.floatingBtn} onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.aiAvatar}>AI</div>
          <div>
            <div style={styles.headerTitle}>iFactory Assistant</div>
            <div style={styles.headerStatus}>
              <span style={styles.onlineDot} />
              Online — Steel Plant
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.headerBtn} onClick={() => setIsOpen(false)} title="Minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button style={styles.headerBtn} onClick={() => setIsOpen(false)} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Connection Modes */}
      <div style={styles.modeBar}>
        <button style={activeMode === 'chat' ? styles.modeBtnActive : styles.modeBtn} onClick={() => setActiveMode('chat')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
        <button style={activeMode === 'voice' ? styles.modeBtnActive : styles.modeBtn} onClick={() => setActiveMode('voice')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          Voice
        </button>
        <button style={activeMode === 'meta-glass' ? styles.modeBtnActive : styles.modeBtn} onClick={() => setActiveMode('meta-glass')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Meta Glass
        </button>
      </div>

      {/* Chat Area */}
      {activeMode === 'chat' && (
        <div style={styles.chatArea}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={msg.role === 'user' ? styles.userMsgRow : styles.aiMsgRow}>
              {msg.role === 'ai' && <div style={styles.msgAvatar}>AI</div>}
              <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                <div style={styles.msgText}>{msg.text}</div>
                <div style={styles.msgTime}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice Mode */}
      {activeMode === 'voice' && (
        <div style={styles.voiceArea}>
          <div style={styles.voiceCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#605dba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div style={styles.voiceLabel}>Tap to start voice conversation</div>
          <div style={styles.voiceSub}>Supports English and Hindi</div>
          <div style={styles.voiceWaves}>
            <span style={{ ...styles.wave, height: '12px' }} />
            <span style={{ ...styles.wave, height: '20px' }} />
            <span style={{ ...styles.wave, height: '28px' }} />
            <span style={{ ...styles.wave, height: '20px' }} />
            <span style={{ ...styles.wave, height: '12px' }} />
          </div>
        </div>
      )}

      {/* Meta Glass Mode */}
      {activeMode === 'meta-glass' && (
        <div style={styles.voiceArea}>
          <div style={styles.glassIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#605dba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="8" width="22" height="8" rx="4" />
              <circle cx="7" cy="12" r="2" />
              <circle cx="17" cy="12" r="2" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
          </div>
          <div style={styles.voiceLabel}>Meta Glass Connection</div>
          <div style={styles.voiceSub}>Connect your Meta Smart Glasses for AR-assisted plant walkthrough</div>
          <div style={styles.connectionStatus}>
            <span style={styles.connectionDot} />
            Searching for nearby devices...
          </div>
          <button style={styles.connectBtn}>Pair Device</button>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <button style={styles.popupClose} onClick={() => setShowPopup(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={styles.popupIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#605dba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div style={styles.popupTitle}>This is a preview of our platform experience.</div>
            <div style={styles.popupText}>
              To unlock a fully customized, production-ready solution tailored to your steel plant operations, schedule a quick call with our team.
            </div>
            <a
              href="https://calendly.com/contact-ifactoryapp/30min?utm_source=steel-plant-demo-portal"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.demoBtn}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule a Demo Call
            </a>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div style={styles.inputBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Ask about blast furnace, BOF, rolling mill..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button style={styles.sendBtn} onClick={handleSend}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const styles = {
  floatingWrap: { position: 'fixed', bottom: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 200 },
  hintBubble: { background: 'rgba(96, 93, 186, 0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: '#605dba', fontSize: '13px', fontWeight: 600, padding: '10px 16px', borderRadius: '10px', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(96,93,186,0.15)', border: '1px solid rgba(96,93,186,0.2)', position: 'relative', animation: 'fadeInOut 5s ease forwards' },
  hintArrow: { position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid rgba(96, 93, 186, 0.15)' },
  floatingBtn: { width: '56px', height: '56px', borderRadius: '50%', background: '#605dba', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(96,93,186,0.4)', flexShrink: 0 },
  container: { position: 'fixed', bottom: '24px', right: '24px', width: '400px', height: '600px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 200, border: '1px solid #e8ecf1' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#1e293b', color: '#fff' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  aiAvatar: { width: '34px', height: '34px', borderRadius: '8px', background: '#605dba', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' },
  headerTitle: { fontSize: '14px', fontWeight: 600 },
  headerStatus: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8' },
  onlineDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' },
  headerActions: { display: 'flex', gap: '4px' },
  headerBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  modeBar: { display: 'flex', gap: '4px', padding: '8px 12px', borderBottom: '1px solid #e8ecf1', background: '#f8fafc' },
  modeBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', fontSize: '11px', fontWeight: 500, color: '#64748b', background: '#fff', border: '1px solid #e8ecf1', borderRadius: '6px', cursor: 'pointer' },
  modeBtnActive: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', fontSize: '11px', fontWeight: 600, color: '#fff', background: '#605dba', border: '1px solid #605dba', borderRadius: '6px', cursor: 'pointer' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end' },
  aiMsgRow: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  msgAvatar: { width: '26px', height: '26px', borderRadius: '6px', background: '#605dba', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: '2px' },
  userBubble: { maxWidth: '80%', background: '#605dba', color: '#fff', borderRadius: '12px 12px 2px 12px', padding: '10px 14px' },
  aiBubble: { maxWidth: '85%', background: '#fff', color: '#1e293b', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', border: '1px solid #e8ecf1' },
  msgText: { fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
  msgTime: { fontSize: '9px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' },
  voiceArea: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px', background: '#f8fafc' },
  voiceCircle: { width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  voiceLabel: { fontSize: '14px', fontWeight: 600, color: '#1e293b' },
  voiceSub: { fontSize: '12px', color: '#94a3b8', textAlign: 'center' },
  voiceWaves: { display: 'flex', alignItems: 'center', gap: '3px', marginTop: '8px' },
  wave: { width: '4px', background: '#bfdbfe', borderRadius: '2px', display: 'inline-block' },
  glassIcon: { width: '80px', height: '80px', borderRadius: '16px', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  connectionStatus: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f59e0b', marginTop: '4px' },
  connectionDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' },
  connectBtn: { marginTop: '8px', padding: '10px 24px', background: '#605dba', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  inputBar: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #e8ecf1', background: '#fff' },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #e8ecf1', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#1e293b', background: '#f8fafc' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '8px', background: '#605dba', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  popupOverlay: { position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '16px' },
  popup: { background: '#fff', borderRadius: '14px', padding: '28px 24px', width: '320px', textAlign: 'center', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' },
  popupClose: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' },
  popupIcon: { width: '52px', height: '52px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  popupTitle: { fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' },
  popupText: { fontSize: '12px', color: '#64748b', lineHeight: '1.6', marginBottom: '18px' },
  demoBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#605dba', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
}

export default Chatbot
