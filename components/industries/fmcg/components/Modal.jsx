'use client'
import { useEffect, useRef } from 'react'

const ACCENT = '#1a9b6c'

export default function Modal({ open, onClose, title, subtitle, children, width = 520 }) {
  const overlayRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose() }} style={s.overlay}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mi:focus{outline:none;border-color:${ACCENT}!important;box-shadow:0 0 0 3px rgba(26,155,108,0.12)!important}
        .ms:focus{outline:none;border-color:${ACCENT}!important}
        .mcx:hover{background:#f1f5f9!important}
        .mok:hover{filter:brightness(1.06)} .mok:active{transform:scale(0.98)}
      `}</style>
      <div style={{ ...s.box, width }}>
        <div style={s.hdr}>
          <div>
            <div style={s.ttl}>{title}</div>
            {subtitle && <div style={s.sub}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={s.xbtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={s.body}>{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

export function MInput({ value, onChange, placeholder, type = 'text', required, disabled }) {
  return <input className="mi" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={f.inp}/>
}

export function MSelect({ value, onChange, options, required }) {
  return (
    <select className="ms" value={value} onChange={e => onChange(e.target.value)} required={required} style={f.sel}>
      <option value="">Select…</option>
      {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export function MTextarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea className="mi" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...f.inp, resize: 'vertical', height: 'auto' }}/>
}

export function MRow({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14 }}>{children}</div>
}

export function MFooter({ onClose, onSubmit, label = 'Add', loading, color = ACCENT }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid #e8ecf1' }}>
      <button className="mcx" onClick={onClose} style={f.cancel}>Cancel</button>
      <button className="mok" onClick={onSubmit} disabled={loading} style={{ ...f.submit, background: color, opacity: loading ? 0.7 : 1 }}>
        {loading ? <><span style={f.spin}/>Saving…</> : label}
      </button>
    </div>
  )
}

export function MSuccess({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{msg}</span>
    </div>
  )
}

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 },
  box: { background:'#fff', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.18)', border:'1px solid #e8ecf1', maxHeight:'90vh', display:'flex', flexDirection:'column', animation:'modalIn 0.22s ease' },
  hdr: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'22px 24px 0', flexShrink:0 },
  ttl: { fontSize:17, fontWeight:700, color:'#1e293b', marginBottom:3 },
  sub: { fontSize:12, color:'#64748b' },
  xbtn: { background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', borderRadius:6, flexShrink:0 },
  body: { padding:'18px 24px 24px', overflowY:'auto' },
}
const f = {
  inp: { width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#1e293b', background:'#f8fafc', boxSizing:'border-box', transition:'border 0.15s, box-shadow 0.15s', fontFamily:'inherit' },
  sel: { width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#1e293b', background:'#f8fafc', boxSizing:'border-box', cursor:'pointer', fontFamily:'inherit' },
  cancel: { padding:'9px 20px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', fontSize:13, fontWeight:600, color:'#64748b', cursor:'pointer', transition:'background 0.15s' },
  submit: { padding:'9px 24px', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'filter 0.15s, transform 0.1s' },
  spin: { width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' },
}
