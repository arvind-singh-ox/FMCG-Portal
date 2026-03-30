'use client'

import { useState, useEffect } from 'react'

const chatHistory = [
  {
    role: 'user',
    text: 'What is the current energy consumption of Kiln 2?',
    time: '10:23 AM',
  },
  {
    role: 'ai',
    text: 'Kiln 2 is currently consuming 68.4 kWh/MT, which is 3.2% below the daily target of 70.7 kWh/MT. The thermal efficiency has improved since the last fuel blend adjustment at 08:15 AM. I recommend maintaining the current coal-to-petcoke ratio of 65:35 for optimal performance.',
    time: '10:23 AM',
  },
  {
    role: 'user',
    text: 'Can we reduce energy consumption further without affecting clinker quality?',
    time: '10:25 AM',
  },
  {
    role: 'ai',
    text: 'Based on my analysis of the last 30 days of production data:\n\n1. Adjusting the preheater cyclone airflow by +2.5% could save approximately 1.8 kWh/MT\n2. The raw mill separator speed can be optimized from 85 RPM to 82 RPM, reducing grinding energy by 0.9 kWh/MT\n3. Current kiln shell temperature at Zone 3 is 285°C — within safe limits, but slight coating buildup detected. Cleaning within 48 hours is recommended.\n\nEstimated total savings: 2.7 kWh/MT with no impact on 28-day compressive strength targets.',
    time: '10:25 AM',
  },
  {
    role: 'user',
    text: 'Show me the kiln energy trend for the past 7 days',
    time: '10:28 AM',
  },
  {
    role: 'ai',
    text: 'Here is the Kiln 2 energy trend (kWh/MT) for the past 7 days:\n\nMon: 72.1 | Tue: 71.3 | Wed: 70.8 | Thu: 69.5 | Fri: 68.9 | Sat: 69.2 | Sun: 68.4\n\nOverall trend: Downward (-5.1% week-over-week). The improvement correlates with the fuel blend optimization applied on Wednesday. Anomaly detected on Saturday — brief spike due to clinker cooler fan trip at 14:22, resolved in 18 minutes.',
    time: '10:28 AM',
  },
  {
    role: 'user',
    text: 'What maintenance is due for Kiln 2 this week?',
    time: '10:31 AM',
  },
  {
    role: 'ai',
    text: 'Upcoming maintenance for Kiln 2:\n\n• Kiln Support Roller #3 — Bearing inspection due in 2 days (vibration trending upward, currently 4.2 mm/s vs threshold 5.0 mm/s)\n• Girth Gear Lubrication — Scheduled for tomorrow, 06:00 AM\n• Refractory Lining — Zone 4 shows 12% wear. Recommend inspection during next planned shutdown\n• Clinker Cooler Grate Plate — Replacement ordered, ETA Wednesday\n\nPriority: Roller #3 bearing should be monitored closely. I have set up an automated alert if vibration exceeds 4.5 mm/s.',
    time: '10:31 AM',
  },
]

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState('chat')
  const [inputText, setInputText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Show hint for 5s every 15s cycle
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
            Ask AI about your plant operations
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
              Online
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
        <button
          style={activeMode === 'chat' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setActiveMode('chat')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
        <button
          style={activeMode === 'voice' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setActiveMode('voice')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          Voice
        </button>
        <button
          style={activeMode === 'meta-glass' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setActiveMode('meta-glass')}
        >
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
              To unlock a fully customized, production-ready solution tailored to your organization, schedule a quick call with our team.
            </div>
            <a
              href="https://calendly.com/contact-ifactoryapp/30min?utm_source=cement-plant-demo-portal"
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
          placeholder="Ask about kiln, energy, maintenance..."
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
  floatingWrap: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 200,
  },
  hintBubble: {
    background: 'rgba(96, 93, 186, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: '#605dba',
    fontSize: '13px',
    fontWeight: 600,
    padding: '10px 16px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(96,93,186,0.15)',
    border: '1px solid rgba(96,93,186,0.2)',
    position: 'relative',
    animation: 'fadeInOut 5s ease forwards',
  },
  hintArrow: {
    position: 'absolute',
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: '6px solid rgba(96, 93, 186, 0.15)',
  },
  floatingBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#605dba',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(96,93,186,0.4)',
    flexShrink: 0,
  },
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '400px',
    height: '600px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 200,
    border: '1px solid #e8ecf1',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#1e293b',
    color: '#fff',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  aiAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: '#605dba',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    color: '#fff',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#94a3b8',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#22c55e',
  },
  headerActions: {
    display: 'flex',
    gap: '4px',
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  modeBar: {
    display: 'flex',
    gap: '4px',
    padding: '8px 12px',
    borderBottom: '1px solid #e8ecf1',
    background: '#f8fafc',
  },
  modeBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '7px 0',
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748b',
    background: '#fff',
    border: '1px solid #e8ecf1',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  modeBtnActive: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '7px 0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
    background: '#605dba',
    border: '1px solid #605dba',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#f8fafc',
  },
  userMsgRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  aiMsgRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  msgAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: '#605dba',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    marginTop: '2px',
  },
  userBubble: {
    maxWidth: '80%',
    background: '#605dba',
    color: '#fff',
    borderRadius: '12px 12px 2px 12px',
    padding: '10px 14px',
  },
  aiBubble: {
    maxWidth: '85%',
    background: '#fff',
    color: '#1e293b',
    borderRadius: '12px 12px 12px 2px',
    padding: '10px 14px',
    border: '1px solid #e8ecf1',
  },
  msgText: {
    fontSize: '12px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  msgTime: {
    fontSize: '9px',
    color: '#94a3b8',
    marginTop: '4px',
    textAlign: 'right',
  },
  voiceArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
    background: '#f8fafc',
  },
  voiceCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#eff6ff',
    border: '2px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  voiceLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  voiceSub: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  voiceWaves: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '8px',
  },
  wave: {
    width: '4px',
    background: '#bfdbfe',
    borderRadius: '2px',
    display: 'inline-block',
  },
  glassIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: '#eff6ff',
    border: '2px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#f59e0b',
    marginTop: '4px',
  },
  connectionDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#f59e0b',
  },
  connectBtn: {
    marginTop: '8px',
    padding: '10px 24px',
    background: '#605dba',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  inputBar: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #e8ecf1',
    background: '#fff',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #e8ecf1',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    color: '#1e293b',
    background: '#f8fafc',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#605dba',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15,23,42,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: '16px',
  },
  popup: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px 24px',
    width: '320px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  },
  popupClose: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },
  popupIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  popupTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  popupText: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '18px',
  },
  demoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#605dba',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
}

export default Chatbot
