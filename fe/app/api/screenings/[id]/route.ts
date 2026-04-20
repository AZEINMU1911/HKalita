import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await fetch(`${API_BASE}/api/v1/screening/${id}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('simae_token')?.value

  const res = await fetch(`${API_BASE}/api/v1/screening/${id}`, {
    method: 'DELETE',
    headers: { Cookie: `simae_token=${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}