import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('simae_token')?.value
  const search = req.nextUrl.searchParams.toString()

  const res = await fetch(`${API_BASE}/api/v1/screenings/export${search ? '?' + search : ''}`, {
    headers: { Cookie: `simae_token=${token}` },
  })

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    status: res.status,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': res.headers.get('Content-Disposition') ?? 'attachment; filename=export.xlsx',
    },
  })
}