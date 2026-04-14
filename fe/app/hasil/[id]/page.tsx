import { notFound } from 'next/navigation'
import Image from 'next/image'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

async function getScreening(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/screening/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

export default async function HasilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const screening = await getScreening(id)
  if (!screening) notFound()

  const isSuspek = screening.result === 'suspek'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">

        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Logo Lanal Cilacap" width={80} height={80} className="mx-auto mb-3 rounded-full" loading="eager" />
          <h1 className="text-2xl font-bold text-blue-900">SIMAE TB</h1>
          <p className="text-gray-500 text-sm mt-1">Hasil Skrining</p>
          <p className="text-gray-400 text-xs">Balai Kesehatan TNI AL Lanal Cilacap</p>
        </div>

        <div className={`rounded-xl p-5 mb-6 text-center ${isSuspek ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="text-4xl mb-2">{isSuspek ? '⚠️' : '✅'}</p>
          <p className={`text-xl font-bold ${isSuspek ? 'text-red-700' : 'text-green-700'}`}>
            {isSuspek ? 'Suspek TBC' : 'Risiko Rendah'}
          </p>
          <p className={`text-sm mt-2 ${isSuspek ? 'text-red-600' : 'text-green-600'}`}>
            {isSuspek
              ? 'Segera lakukan pemeriksaan dahak / Tes TCM di fasilitas kesehatan.'
              : 'Tetap jaga kesehatan dan lakukan pemeriksaan jika muncul gejala.'}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Nama</span>
            <span>{screening.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Nomor HP</span>
            <span>{screening.phone}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">Jumlah gejala</span>
            <span>{screening.score} dari 9</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Tanggal</span>
            <span>{new Date(screening.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
          </div>
        </div>

        <a
          href="/skrining"
          className="mt-6 block text-center w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
        >
          Skrining Ulang
        </a>

      </div>
    </main>
  )
}