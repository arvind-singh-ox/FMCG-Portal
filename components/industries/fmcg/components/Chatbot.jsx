'use client'

import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

const chatHistory = [
  { role: 'user', text: 'What is the current OEE across all production lines?', time: '09:14 AM' },
  { role: 'ai', text: 'Current plant-wide OEE is 87.3%, which is 2.7% below world-class target of 90%. Breakdown: Availability 93.2%, Performance 88.6%, Quality 98.6%.\n\nLine 7 (Snacks) is the top performer at 96.1% OEE. Line 4 (Beverages) is offline due to conveyor belt issue. Recommend prioritising WO-2026-1142 to restore Line 4 — estimated revenue impact of ₹84,000/day.', time: '09:14 AM' },
  { role: 'user', text: 'Which SKUs need production priority this week?', time: '09:16 AM' },
  { role: 'ai', text: 'Based on demand forecast and current stock levels, here are top 3 priority SKUs:\n\n1. Frooti 200ml — Forecast spike +42% (summer demand). Only 4 days stock. Recommend increasing Line 5 allocation immediately.\n2. Palm Oil — Raw material stockout in 3 days. Emergency PO needed from Saffola Agro.\n3. Bourbon Biscuits 150g — Demand up 22% this week. Recommend +15% batch size on Line 1.\n\nAll three actions are in the AI Insights panel with one-click approval.', time: '09:16 AM' },
  { role: 'user', text: 'Give me a summary of today\'s quality status', time: '09:18 AM' },
  { role: 'ai', text: 'Today\'s quality summary (as of 09:18 AM):\n\n✅ Pass rate: 97.9% (48 tests run)\n⚠ 1 failure: BT-2026-0421 (Lays Lot 2) — TVC microbiological count exceeded spec. Batch placed on hold.\n🔍 AI Vision: 412 defects caught across 284,200 units (0.14% defect rate)\n\nTop defect type: Under-filled packs on Line 3 (182 units). Recommend checking fill sensor calibration on FU-1 frying unit filling station.', time: '09:18 AM' },
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(chatHistory)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const replies = [
        'Based on current data, I recommend reviewing the AI Insights panel for automated recommendations. All critical alerts have been flagged and prioritised.',
        'I\'ve analysed the latest production data. Line efficiency is trending upward on Lines 1, 3, and 7. Lines 4 and 8 require immediate attention.',
        'The demand forecast model shows strong confidence (93.4%) for next month\'s predictions. Summer seasonality is the primary driver for beverage and snack categories.',
        'Current inventory health: 38 SKUs at good levels, 3 at low stock (Palm Oil, Salt, Cocoa Powder), 2 at critical. Recommend placing POs for Palm Oil and Salt today.',
      ]
      const aiMsg = { role: 'ai', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
    }, 1400)
  }

  return (
    <>
      {/* Bubble */}
      <button onClick={() => setOpen(!open)} style={st.bubble}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {open && (
        <div style={st.panel}>
          <div style={st.header}>
            <div style={st.headerLeft}>
              <div style={st.aiDot}/>
              <div>
                <div style={st.headerTitle}>FMCG AI Assistant</div>
                <div style={st.headerSub}>Powered by iFactory AI · Always on</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={st.closeBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={st.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...st.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'ai' && <div style={st.aiBubbleIcon}>AI</div>}
                <div style={{ ...st.bubble2, ...(m.role === 'user' ? st.userBubble : st.aiBubble) }}>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.text}</div>
                  <div style={st.msgTime}>{m.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ ...st.msgRow, justifyContent: 'flex-start' }}>
                <div style={st.aiBubbleIcon}>AI</div>
                <div style={{ ...st.bubble2, ...st.aiBubble }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1.2s ${i * 0.2}s infinite` }}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div style={st.inputArea}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about production, quality, inventory…" style={st.input}/>
            <button onClick={handleSend} style={st.sendBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  )
}

const st = {
  bubble: { position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: ACCENT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(96,93,186,0.4)', zIndex: 200, transition: 'transform 0.15s' },
  panel: { position: 'fixed', bottom: 88, right: 24, width: 380, height: 520, background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', border: '1px solid #e8ecf1', display: 'flex', flexDirection: 'column', zIndex: 200, overflow: 'hidden' },
  header: { padding: '14px 16px', borderBottom: '1px solid #e8ecf1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  aiDot: { width: 32, height: 32, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
  headerSub: { fontSize: 10, color: '#94a3b8' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'thin' },
  msgRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  aiBubbleIcon: { width: 24, height: 24, borderRadius: '50%', background: '#ededfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: ACCENT, flexShrink: 0 },
  bubble2: { maxWidth: '78%', padding: '10px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.5 },
  userBubble: { background: ACCENT, color: '#fff', borderBottomRightRadius: 4 },
  aiBubble: { background: '#f1f5f9', color: '#1e293b', borderBottomLeftRadius: 4 },
  msgTime: { fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: 'right' },
  inputArea: { padding: '12px', borderTop: '1px solid #e8ecf1', display: 'flex', gap: 8, flexShrink: 0 },
  input: { flex: 1, padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, background: '#f8fafc', outline: 'none', color: '#1e293b' },
  sendBtn: { width: 36, height: 36, borderRadius: 10, background: ACCENT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
}
