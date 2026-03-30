import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'ifactory-demo-secret-key-2024'

export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export async function getAuthUser(request) {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = verifyToken(token)
    return decoded.id
  } catch {
    return null
  }
}
