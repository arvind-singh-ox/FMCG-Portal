import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { getAuthUser } from '@/lib/auth'
import logger from '@/lib/logger'

export async function GET(request) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    logger.error(`Get user error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
