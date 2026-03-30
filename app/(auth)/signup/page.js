'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const countryCodes = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+81', label: 'JP +81' },
  { code: '+86', label: 'CN +86' },
  { code: '+971', label: 'AE +971' },
  { code: '+65', label: 'SG +65' },
]

function Signup() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const utmSource = searchParams.get('utm_source') || ''

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    countryCode: '+91',
    mobile: '',
    role: '',
  })
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, utmSource }),
      })

      const data = await res.json()
      setIsError(!res.ok)
      setMessage(data.message)

      if (res.ok) {
        const portalRoute = getPortalRoute(utmSource)
        setTimeout(() => router.push(portalRoute), 1000)
      }
    } catch {
      setIsError(true)
      setMessage('Could not connect to server')
    }
  }

  if (!utmSource) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <h1 style={styles.title}>iFactory</h1>
          <h2 style={styles.subtitle}>Access Denied</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '16px 0' }}>
            Signup requires a valid portal invitation link. Please contact your administrator for access.
          </p>
          <Link href="/login" style={{ ...styles.link, fontSize: '14px' }}>Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>iFactory</h1>
        <h2 style={styles.subtitle}>Demo Portal Form</h2>
        <p style={styles.portalTag}>
          Portal: {utmSource.replace(/\//g, ' ').replace(/-/g, ' ').trim()}
        </p>
        <form onSubmit={handleSignup}>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <input
            style={styles.input}
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
          />
          <select
            style={styles.input}
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select your role</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Office Admin">Office Admin</option>
            <option value="Safety Manager">Safety Manager</option>
            <option value="Maintenance Manager">Maintenance Manager</option>
            <option value="Service Engineer">Service Engineer</option>
            <option value="Technician">Technician</option>
            <option value="Executive">Executive</option>
            <option value="Other">Other</option>
          </select>
          <div style={styles.phoneRow}>
            <select
              style={styles.countrySelect}
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input
              style={styles.phoneInput}
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <button style={styles.button} type="submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
            Create Account
          </button>
        </form>
        {message && (
          <p style={{ ...styles.message, color: isError ? '#e74c3c' : '#2ecc71' }}>
            {message}
          </p>
        )}
        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link href={utmSource ? `/login?utm_source=${encodeURIComponent(utmSource)}` : '/login'} style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  )
}

function getPortalRoute(utmSource) {
  if (utmSource.includes('cement-plant')) return '/portal/cement-plant'
  if (utmSource.includes('steel-plant')) return '/portal/steel-plant'
  if (utmSource.includes('fmcg')) return '/portal/fmcg'
  return '/portal/cement-plant'
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e8ecf1',
    width: '420px',
  },
  title: {
    color: '#605dba',
    textAlign: 'center',
    margin: '0 0 5px',
    fontSize: '28px',
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 5px',
    fontSize: '16px',
    fontWeight: 'normal',
  },
  portalTag: {
    color: '#605dba',
    textAlign: 'center',
    margin: '0 0 25px',
    fontSize: '13px',
    textTransform: 'capitalize',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  phoneRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  countrySelect: {
    width: '110px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '14px',
  },
  phoneInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#605dba',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  message: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '13px',
    color: '#64748b',
  },
  link: {
    color: '#605dba',
    fontWeight: 600,
    textDecoration: 'none',
  },
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <Signup />
    </Suspense>
  )
}
