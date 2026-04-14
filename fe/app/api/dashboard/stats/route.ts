import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('simae_token')?.value

  const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`, {
    headers: { Cookie: `simae_token=${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}