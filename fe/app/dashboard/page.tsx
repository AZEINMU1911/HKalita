'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

interface Screening {
  id: string
  name: string
  phone: string
  score: number
  result: string
  created_at: string
}

interface Stats {
  total: number
  total_suspek: number
  total_risiko_rendah: number
  today_total: number
  today_suspek: number
}

interface Meta {
  total: number
  page: number
  limit: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 })
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    const res = await fetch('/api/dashboard/stats')
    if (res.status === 401) { router.push('/login'); return }
    const json = await res.json()
    setStats(json.data)
  }

  const fetchScreenings = async (resultFilter: string, currentPage: number) => {
    const params = new URLSearchParams()
    if (resultFilter) params.set('result', resultFilter)
    params.set('page', String(currentPage))
    params.set('limit', '20')

    const res = await fetch(`/api/screenings?${params.toString()}`)
    if (res.status === 401) { router.push('/login'); return }
    const json = await res.json()
    setScreenings(json.data ?? [])
    setMeta(json.meta)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchScreenings(filter, page)])
      setLoading(false)
    }
    init()
  }, [filter, page])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo Lanal Cilacap" width={40} height={40} className="rounded-full" loading="eager" />
          <div>
            <h1 className="text-lg font-bold">SIMAE TB</h1>
            <p className="text-blue-200 text-xs">Dashboard Petugas</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/config')}
            className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Konfigurasi
          </button>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Skrining</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Suspek TBC</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.total_suspek}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.today_total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Suspek Hari Ini</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.today_suspek}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {['', 'suspek', 'risiko_rendah'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === '' ? 'Semua' : f === 'suspek' ? 'Suspek' : 'Risiko Rendah'}
            </button>
          ))}
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <a
            href={`/api/export?${filter ? `result=${filter}` : ''}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Export Excel
          </a>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : screenings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">No HP</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Skor</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Hasil</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Tanggal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {screenings.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{s.score} / 9</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.result === 'suspek'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {s.result === 'suspek' ? 'Suspek' : 'Risiko Rendah'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/dashboard/${s.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Menampilkan {screenings.length} dari {meta.total} data
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ←
              </button>
              <span className="px-3 py-1.5 text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}