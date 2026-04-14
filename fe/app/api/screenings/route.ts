import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('simae_token')?.value
  const search = req.nextUrl.searchParams.toString()

  const res = await fetch(`${API_BASE}/api/v1/screenings${search ? '?' + search : ''}`, {
    headers: { Cookie: `simae_token=${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${API_BASE}/api/v1/screening`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}