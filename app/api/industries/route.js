import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Industry from '@/lib/models/Industry'
import logger from '@/lib/logger'

export async function GET() {
  try {
    await dbConnect()
    const industries = await Industry.find({ isActive: true })
    logger.info(`Fetched ${industries.length} active industries`)
    return NextResponse.json(industries)
  } catch (err) {
    logger.error(`Industries fetch error: ${err.message}`)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
