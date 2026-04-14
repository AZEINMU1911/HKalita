import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

export async function POST() {
  const res = await fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST' })
  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })
  response.cookies.delete('simae_token')
  return response
}