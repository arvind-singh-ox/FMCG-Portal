import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { getAuthUser } from '@/lib/auth'
import logger from '@/lib/logger'

export async function POST(request) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    let body
    try { body = await request.json() } catch { body = {} }
    const { page } = body
    if (!page) {
      return NextResponse.json({ message: 'Page is required' }, { status: 400 })
    }

    const key = `pageViews.${page}`
    await User.findByIdAndUpdate(userId, {
      $inc: { [key]: 1, totalPageViews: 1 },
      $set: { lastVisitedPage: page },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error(`Track error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
