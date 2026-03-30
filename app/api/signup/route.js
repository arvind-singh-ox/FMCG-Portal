import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { generateToken } from '@/lib/auth'
import logger from '@/lib/logger'

export async function POST(request) {
  try {
    await dbConnect()
    const { name, email, password, companyName, countryCode, mobile, role, utmSource } = await request.json()

    if (!name || !email || !password || !companyName || !countryCode || !mobile) {
      logger.warn(`Signup attempt with missing fields from ${email || 'unknown'}`)
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'Account already exists. Please login.' }, { status: 409 })
    }

    const user = new User({ name, email, password, companyName, countryCode, mobile, role, utmSource })
    await user.save()

    const token = generateToken(user._id)
    const userData = { id: user._id, name: user.name, email: user.email, role: user.role, companyName: user.companyName, utmSource: user.utmSource, countryCode: user.countryCode }

    logger.info(`New user registered: ${email} | company: ${companyName} | role: ${role} | utm: ${utmSource || 'none'}`)

    const response = NextResponse.json({ message: 'Account created successfully', user: userData })
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/' })
    response.cookies.set('user_meta', Buffer.from(JSON.stringify(userData)).toString('base64'), { maxAge: 7 * 24 * 3600, path: '/' })
    return response
  } catch (err) {
    logger.error(`Signup error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
