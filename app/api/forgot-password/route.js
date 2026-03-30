import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import logger from '@/lib/logger'

export async function POST(request) {
  try {
    await dbConnect()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 })
    }

    user.password = user.mobile
    await user.save()

    logger.info(`Password reset for: ${email} (set to mobile number)`)
    return NextResponse.json({ message: 'Password has been reset to your registered mobile number' })
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
