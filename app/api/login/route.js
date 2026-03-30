import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { generateToken } from '@/lib/auth'
import logger from '@/lib/logger'

// Hardcoded demo users — work without MongoDB for portal previews
const DEMO_USERS = {
  'fmcg@gmail.com': {
    password: '123456',
    name: 'Arjun Mehta',
    role: 'Plant Manager',
    companyName: 'FMCG Corp India',
    industry: 'fmcg',
    utmSource: 'fmcg-demo-portal',
    countryCode: '+91',
  },
}

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Check demo users first (no DB needed)
    const demoUser = DEMO_USERS[email.toLowerCase()]
    if (demoUser && password === demoUser.password) {
      const userData = { id: 'demo', name: demoUser.name, email, role: demoUser.role, companyName: demoUser.companyName, utmSource: demoUser.utmSource, countryCode: demoUser.countryCode, industry: demoUser.industry }
      const response = NextResponse.json({ message: 'Login successful', user: userData })
      response.cookies.set('user_meta', Buffer.from(JSON.stringify(userData)).toString('base64'), { maxAge: 7 * 24 * 3600, path: '/' })
      // Create a simple session token for middleware
      const { SignJWT } = await import('jose')
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ifactory-demo-secret-key-2024')
      const token = await new SignJWT({ id: 'demo', email }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
      response.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/' })
      return response
    }

    await dbConnect()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Old users without password — set password to their mobile number first
    if (!user.password) {
      user.password = user.mobile
      await user.save()
      logger.info(`Migrated old user ${email} — password set to mobile number`)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Update login tracking
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''
    user.loginCount += 1
    user.lastLoginAt = new Date()
    user.loginHistory.push({ ip, userAgent, timestamp: new Date() })
    await user.save()

    const token = generateToken(user._id)
    const userData = { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName, utmSource: user.utmSource, countryCode: user.countryCode }

    logger.info(`User logged in: ${email} | login #${user.loginCount}`)

    const response = NextResponse.json({ message: 'Login successful', user: userData })
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/' })
    response.cookies.set('user_meta', Buffer.from(JSON.stringify(userData)).toString('base64'), { maxAge: 7 * 24 * 3600, path: '/' })
    return response
  } catch (err) {
    logger.error(`Login error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
