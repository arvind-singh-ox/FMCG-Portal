'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const INDUSTRIES = [
  {
    slug: 'cement-plant',
    name: 'Cement Plant',
    desc: 'Kiln optimization, digital twin, OEE & emission monitoring',
    route: '/portal/cement-plant',
    accent: '#605dba',
    light: '#ededfa',
    kpis: ['Kiln Uptime', 'OEE 91%', 'Digital Twin', 'Emissions'],
    email: 'demo@ifactory.ai',
    pass: 'Demo@2025',
  },
  {
    slug: 'steel-plant',
    name: 'Steel Plant',
    desc: 'Blast furnace AI, scrap-to-rebar tracking & digital LOTO',
    route: '/portal/steel-plant',
    accent: '#c2410c',
    light: '#fff7ed',
    kpis: ['Blast Furnace', 'Scrap Yield', 'Digital LOTO', 'EHS'],
    email: 'demo@ifactory.ai',
    pass: 'Demo@2025',
  },
  {
    slug: 'fmcg',
    name: 'FMCG Portal',
    desc: 'Production OEE, AI demand forecast, cold chain & supply chain',
    route: '/portal/fmcg',
    accent: '#605dba',
    light: '#ededfa',
    kpis: ['Batch Tracking', 'AI Forecast', 'Fleet GPS', 'QC Vision'],
    email: 'fmcg@gmail.com',
    pass: '123456',
    isNew: true,
  },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState('')

  const doLogin = async (email, password, targetRoute) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      const utm = data.user?.utmSource || ''
      const route = targetRoute || (
        utm.includes('steel-plant') ? '/portal/steel-plant'
        : utm.includes('fmcg') || data.user?.industry === 'fmcg' ? '/portal/fmcg'
        : '/portal/cement-plant'
      )
      setTimeout(() => { window.location.href = route }, 350)
    }
    return { ok: res.ok, data }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage(''); setLoading(true)
    try {
      const { ok, data } = await doLogin(form.email, form.password, null)
      setIsError(!ok); setMessage(data.message)
    } catch { setIsError(true); setMessage('Could not connect to server') }
    finally { setLoading(false) }
  }

  const handleQuick = async (ind) => {
    setQuickLoading(ind.slug); setMessage('')
    try {
      const { ok, data } = await doLogin(ind.email, ind.pass, ind.route)
      if (!ok) { setIsError(true); setMessage(data.message) }
    } catch { setIsError(true); setMessage('Connection error') }
    finally { setQuickLoading('') }
  }

  const handleForgot = async () => {
    if (!form.email) { setIsError(true); setMessage('Enter your email first'); return }
    setResetLoading(true); setMessage('')
    try {
      const res = await fetch('/api/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) })
      const data = await res.json(); setIsError(!res.ok); setMessage(data.message)
    } catch { setIsError(true); setMessage('Connection error') }
    finally { setResetLoading(false) }
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .ic:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.1)!important}
        .ic{transition:transform 0.18s,box-shadow 0.18s;animation:fadeUp 0.5s ease both}
        .qbtn:hover{filter:brightness(1.08)} .qbtn:active{transform:scale(0.97)}
        input:focus{outline:none;border-color:#605dba!important;box-shadow:0 0 0 3px rgba(96,93,186,0.12)}
      `}</style>

      {/* ── LEFT: industry cards ── */}
      <div style={s.left}>
        <div style={s.leftWrap}>
          {/* Header */}
          <div style={s.logoRow}>
            <div style={s.logoBadge}><span style={{ color:'#fff', fontWeight:800, fontSize:17 }}>iF</span></div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:'#1e293b', lineHeight:1.1 }}>iFactory AI</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Multi-Industry Intelligence Platform</div>
            </div>
          </div>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:20, fontWeight:500 }}>
            Select a portal to explore, or sign in with your credentials →
          </p>

          {/* Industry cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {INDUSTRIES.map((ind, idx) => (
              <div key={ind.slug} className="ic" style={{ background:'#fff', border:`1.5px solid ${ind.accent}28`, borderRadius:14, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)', position:'relative', animationDelay:`${idx*0.08}s` }}>
                {ind.isNew && (
                  <span style={{ position:'absolute', top:14, right:14, fontSize:9, fontWeight:800, letterSpacing:'0.06em', background:ind.accent, color:'#fff', padding:'2px 8px', borderRadius:20 }}>NEW</span>
                )}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:ind.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {ind.slug === 'cement-plant' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ind.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                        <line x1="3.27" y1="6.96" x2="12" y2="12.01"/><line x1="12" y1="12.01" x2="20.73" y2="6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    )}
                    {ind.slug === 'steel-plant' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ind.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        <path d="M2 17L12 22L22 17"/>
                        <path d="M2 12L12 17L22 12"/>
                      </svg>
                    )}
                    {ind.slug === 'fmcg' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ind.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <line x1="3.27" y1="6.96" x2="12" y2="12.01"/><line x1="12" y1="12.01" x2="20.73" y2="6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:3 }}>{ind.name}</div>
                    <div style={{ fontSize:12, color:'#64748b', lineHeight:1.45 }}>{ind.desc}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:5, marginBottom:12, flexWrap:'wrap' }}>
                  {ind.kpis.map(k => (
                    <span key={k} style={{ fontSize:10, fontWeight:600, color:ind.accent, background:ind.light, padding:'2px 9px', borderRadius:20 }}>{k}</span>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>
                    Demo: <code style={{ background:'#f1f5f9', padding:'1px 5px', borderRadius:4, fontSize:10, color:'#475569' }}>{ind.email}</code>
                  </span>
                  <button
                    className="qbtn"
                    onClick={() => handleQuick(ind)}
                    disabled={!!quickLoading}
                    style={{ background:ind.accent, color:'#fff', border:'none', borderRadius:8, padding:'7px 15px', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5, opacity: quickLoading===ind.slug ? 0.7 : 1, transition:'filter 0.15s' }}
                  >
                    {quickLoading===ind.slug ? 'Opening…' : <>Quick Access <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:20 }}>
            © 2026 iFactory AI · v1.2.1
          </p>
        </div>
      </div>

      {/* ── RIGHT: login form ── */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ width:50, height:50, borderRadius:13, background:'#605dba', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:20 }}>iF</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#1e293b', margin:'0 0 5px' }}>Sign in</h1>
            <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Access your iFactory portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" name="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
            <label style={{ ...s.label, marginTop:14 }}>Password</label>
            <input style={s.input} type="password" name="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
            <div style={{ display:'flex', justifyContent:'flex-end', margin:'8px 0 18px' }}>
              <span style={{ fontSize:12, color:'#605dba', cursor:'pointer', fontWeight:500 }} onClick={handleForgot}>
                {resetLoading ? 'Sending…' : 'Forgot password?'}
              </span>
            </div>
            <button type="submit" disabled={loading} style={s.loginBtn}>
              {loading ? 'Signing in…' : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Sign in
                </>
              )}
            </button>
          </form>

          {message && (
            <p style={{ fontSize:13, textAlign:'center', marginTop:14, padding:'9px 12px', borderRadius:9, background: isError?'#fef2f2':'#f5f3ff', color: isError?'#dc2626':'#534ab7' }}>
              {message}
            </p>
          )}

          {/* Demo credentials quick-fill */}
          <div style={{ borderTop:'1px solid #e8ecf1', marginTop:22, paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textAlign:'center', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:10 }}>
              Click to fill demo credentials
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {INDUSTRIES.map(ind => (
                <div
                  key={ind.slug}
                  onClick={() => setForm({ email:ind.email, password:ind.pass })}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:ind.light, borderRadius:8, padding:'8px 12px', cursor:'pointer', border:`1px solid ${ind.accent}20`, transition:'opacity 0.15s' }}
                >
                  <span style={{ fontSize:12, fontWeight:700, color:ind.accent }}>{ind.name}</span>
                  <span style={{ fontSize:11, color:'#64748b', fontFamily:'monospace' }}>{ind.email}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:18, fontSize:12, color:'#64748b' }}>
            No account?{' '}
            <Link href="/signup" style={{ color:'#605dba', fontWeight:600, textDecoration:'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { display:'flex', minHeight:'100vh', background:'#f5f6fa', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' },
  left: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 48px', background:'#f8fafc', borderRight:'1px solid #e8ecf1', overflowY:'auto' },
  leftWrap: { maxWidth:520, width:'100%' },
  logoRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  logoBadge: { width:44, height:44, borderRadius:11, background:'#605dba', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  right: { width:440, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', overflowY:'auto' },
  card: { background:'#fff', borderRadius:20, padding:'36px 32px', width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #e8ecf1' },
  label: { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'11px 13px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#1e293b', background:'#f8fafc', boxSizing:'border-box', transition:'border 0.15s, box-shadow 0.15s', marginBottom:2 },
  loginBtn: { width:'100%', padding:'12px', background:'#605dba', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity 0.15s' },
}
