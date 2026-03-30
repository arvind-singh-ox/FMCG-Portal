'use client'

import { useState, useEffect, useRef } from 'react'

const ACCENT = '#605dba'

const insightPool = [
  { type: 'optimization', priority: 'high', title: 'Fuel Blend Optimization Opportunity', description: 'AI analysis suggests changing coal-to-petcoke ratio from 70:30 to 65:35 could reduce energy cost by 4.2% while maintaining clinker quality above 98%.', impact: 'Estimated savings: Rs 2.8L/day', confidence: 94 },
  { type: 'predictive', priority: 'critical', title: 'Roller #3 Bearing — Failure Predicted in 72hrs', description: 'Vibration pattern analysis on Kiln Support Roller #3 shows increasing trend matching historical failure signatures. Current: 4.2 mm/s (threshold: 5.0 mm/s).', impact: 'Schedule PM to avoid 8hr unplanned shutdown', confidence: 89 },
  { type: 'quality', priority: 'medium', title: 'Clinker Free Lime Trending Up', description: 'Free lime content has risen from 0.9% to 1.2% over the past 6 hours. Recommend increasing burning zone temperature by 15°C or adjusting raw meal LSF.', impact: 'Prevent quality deviation before 1.5% threshold', confidence: 91 },
  { type: 'emission', priority: 'medium', title: 'NOx Levels Approaching Compliance Limit', description: 'Stack NOx at 480 ppm (limit: 500 ppm). Trending upward due to increased kiln temperature. SNCR system ammonia dosing adjustment recommended.', impact: 'Avoid compliance violation — Rs 5L fine risk', confidence: 96 },
  { type: 'energy', priority: 'high', title: 'Raw Mill ToD Scheduling — Save 3.2L/day', description: 'Grid tariff analysis shows shifting raw mill operation to 22:00-06:00 off-peak slot saves 18% on power cost. Clinker buffer is sufficient for 8hr gap.', impact: 'Rs 3.2L/day power cost reduction', confidence: 93 },
  { type: 'predictive', priority: 'high', title: 'Cement Mill Media Charge Depleting', description: 'Specific energy consumption up 5.9% in 72hrs. Ball charge in Chamber 2 estimated at 91% — below optimal. Power signature matches media wear pattern.', impact: 'Add 12 MT grinding balls to restore efficiency', confidence: 92 },
  { type: 'optimization', priority: 'medium', title: 'Cooler Fan Speed Optimization', description: 'Reducing undergrate fan #3 by 5% while increasing #5 by 3% improves heat recovery by 2.1% without affecting clinker temperature or quality.', impact: 'Save 45 kW continuous (Rs 0.8L/month)', confidence: 88 },
  { type: 'quality', priority: 'high', title: 'Raw Meal LSF Deviation from Mine Block C', description: 'Limestone quality from Block C showing CaO: 52.1% (vs target 44.5%). LSF trending to 98.4. Corrective: blend Block C with Block A at 60:40 ratio.', impact: 'Maintain clinker C3S above 58%', confidence: 90 },
  { type: 'predictive', priority: 'medium', title: 'PH Cyclone 4 — Buildup Risk Elevated', description: 'Differential pressure across Cyclone 4 rose 18% in 6hrs. Raw meal moisture increase (1.2% → 1.8%) correlates with pattern. Buildup score: 62/100.', impact: 'Monitor pressure, check moisture control', confidence: 85 },
  { type: 'emission', priority: 'high', title: 'CO2 Intensity Below Monthly Target', description: 'Current CO2: 842 kg/MT (target: 860). AFR substitution at 12% is driving the improvement. Increasing to 15% could push to 820 kg/MT.', impact: 'Exceed sustainability target by 2.3%', confidence: 94 },
  { type: 'energy', priority: 'critical', title: 'WHR Turbine Efficiency Drop Detected', description: 'Steam turbine output dropped from 4.8 MW to 4.3 MW in 2hrs. Condenser vacuum degrading — possible air leak or cooling water issue.', impact: 'Fix immediately — losing Rs 1.2L/day', confidence: 97 },
  { type: 'optimization', priority: 'medium', title: 'Compressed Air Leak — 23 Points Identified', description: 'Ultrasonic scan detected 23 leak points in compressed air network. Top 10 leaks account for 85% of losses. 2-day repair effort estimated.', impact: 'Save 120 kW continuous (Rs 8.6L/month)', confidence: 96 },
]

const priorityColors = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' }
const typeLabels = { optimization: 'OPT', predictive: 'PdM', quality: 'QC', emission: 'ENV', energy: 'NRG' }

function getTimeAgo(seconds) {
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  return `${Math.floor(seconds / 3600)} hr ago`
}

function AIInsights() {
  const [visibleInsights, setVisibleInsights] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [newIndex, setNewIndex] = useState(-1)
  const containerRef = useRef(null)
  const poolIndexRef = useRef(0)
  const timerRef = useRef(null)
  const baseTimeRef = useRef(Date.now())

  // Observe when section scrolls into view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true)
      }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [isVisible])

  // When visible, load initial 4 and start streaming new ones
  useEffect(() => {
    if (!isVisible) return

    // Load first 4
    baseTimeRef.current = Date.now()
    const initial = insightPool.slice(0, 4).map((ins, i) => ({
      ...ins,
      id: i,
      arrivedAt: Date.now() - (4 - i) * 600000, // stagger times
    }))
    poolIndexRef.current = 4
    setVisibleInsights(initial)

    // Stream new insight every 8 seconds
    timerRef.current = setInterval(() => {
      const idx = poolIndexRef.current % insightPool.length
      const newInsight = {
        ...insightPool[idx],
        id: Date.now(),
        arrivedAt: Date.now(),
      }
      poolIndexRef.current++
      setNewIndex(newInsight.id)
      setVisibleInsights(prev => [newInsight, ...prev.slice(0, 5)])

      // Clear "new" highlight after 3s
      setTimeout(() => setNewIndex(-1), 3000)
    }, 8000)

    return () => clearInterval(timerRef.current)
  }, [isVisible])

  // Live time updater
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(k => k + 1), 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div ref={containerRef} style={styles.card}>
      <style>{`
        @keyframes insightSlideIn { from { opacity:0; transform:translateX(-20px) scale(0.97); max-height:0; padding:0 16px; margin:0; } to { opacity:1; transform:translateX(0) scale(1); max-height:200px; padding:16px; margin:0; } }
        @keyframes newGlow { 0% { box-shadow: 0 0 0 0 rgba(96,93,186,0.3); } 50% { box-shadow: 0 0 16px 4px rgba(96,93,186,0.15); } 100% { box-shadow: 0 0 0 0 rgba(96,93,186,0); } }
        @keyframes typingDot { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        .ai-insight-item { transition: all 0.3s cubic-bezier(0.22,1,0.36,1); }
        .ai-insight-item:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: #605dba30; }
        .ai-insight-new { animation: insightSlideIn 0.6s ease both, newGlow 2s ease; border-left: 3px solid #605dba !important; }
      `}</style>

      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={styles.title}>AI Insights & Recommendations</h3>
            <span style={styles.livePulse} />
          </div>
          <p style={styles.sub}>AI-powered analysis from plant-wide sensor data — streaming live</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.insightCount}>{visibleInsights.length} Active Insights</span>
          <span style={styles.modelBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" style={{ marginRight: '4px' }}>
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" /><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
            </svg>
            On-Premise LLM
          </span>
        </div>
      </div>

      {/* Typing indicator when waiting for next insight */}
      {isVisible && (
        <div style={styles.typingBar}>
          <div style={styles.typingDots}>
            <span style={{ ...styles.dot, animationDelay: '0s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>AI is analyzing 2,847 sensor streams...</span>
        </div>
      )}

      <div style={styles.list}>
        {visibleInsights.map((item) => {
          const isNew = item.id === newIndex
          const secAgo = Math.max(0, Math.round((Date.now() - item.arrivedAt) / 1000))
          return (
            <div key={item.id} className={`ai-insight-item ${isNew ? 'ai-insight-new' : ''}`} style={styles.insightCard}>
              <div style={styles.insightLeft}>
                <div style={{ ...styles.typeIcon, background: `${priorityColors[item.priority]}15`, color: priorityColors[item.priority] }}>
                  {typeLabels[item.type] || 'AI'}
                </div>
              </div>
              <div style={styles.insightBody}>
                <div style={styles.insightTop}>
                  <span style={{ ...styles.priorityTag, background: `${priorityColors[item.priority]}15`, color: priorityColors[item.priority] }}>
                    {item.priority.toUpperCase()}
                  </span>
                  {isNew && <span style={styles.newBadge}>NEW</span>}
                  <span style={styles.insightTime}>{getTimeAgo(secAgo)}</span>
                </div>
                <div style={styles.insightTitle}>{item.title}</div>
                <div style={styles.insightDesc}>{item.description}</div>
                <div style={styles.insightFooter}>
                  <span style={styles.impactTag}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ marginRight: '4px' }}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {item.impact}
                  </span>
                  <span style={styles.confidenceTag}>
                    <span style={styles.confBar}>
                      <span style={{ ...styles.confFill, width: `${item.confidence}%`, transition: 'width 1s ease' }} />
                    </span>
                    {item.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e8ecf1', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  title: { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 600 },
  sub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },
  livePulse: { width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px rgba(22,163,74,0.5)', animation: 'typingDot 1.5s infinite' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  insightCount: { fontSize: '12px', fontWeight: 600, color: ACCENT },
  modelBadge: { display: 'flex', alignItems: 'center', background: ACCENT + '15', color: ACCENT, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' },
  typingBar: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px', border: '1px dashed #e2e8f0' },
  typingDots: { display: 'flex', gap: '3px' },
  dot: { width: '5px', height: '5px', borderRadius: '50%', background: ACCENT, animation: 'typingDot 1s infinite' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  insightCard: { display: 'flex', gap: '14px', padding: '16px', background: '#fafafe', border: '1px solid #e8ecf1', borderRadius: '10px', borderLeft: '3px solid transparent' },
  insightLeft: { flexShrink: 0 },
  typeIcon: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 },
  insightBody: { flex: 1 },
  insightTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  priorityTag: { fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  newBadge: { fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: ACCENT, color: '#fff', letterSpacing: '0.5px' },
  insightTime: { fontSize: '11px', color: '#94a3b8' },
  insightTitle: { fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' },
  insightDesc: { fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px' },
  insightFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  impactTag: { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: '6px' },
  confidenceTag: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' },
  confBar: { width: '50px', height: '4px', background: '#e8ecf1', borderRadius: '2px', overflow: 'hidden' },
  confFill: { height: '100%', background: ACCENT, borderRadius: '2px' },
}

export default AIInsights
