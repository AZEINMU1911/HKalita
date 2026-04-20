import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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
    <main className="min-h-screen bg-gradient-to-br from-[#1e3a6e] to-[#1565c0] px-4 py-6 pb-12">

      {/* Result Card */}
      <div className="w-full max-w-[480px] bg-white rounded-[20px] shadow-2xl p-7 mx-auto mb-8">
        <div className="text-center mb-5">
          <Image src="/logo.png" alt="Logo Lanal Cilacap" width={76} height={76} className="mx-auto mb-2 rounded-full" />
          <h1 className="font-poppins text-[22px] font-extrabold text-[#1e3a6e]">SIMAE TB</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Hasil Skrining</p>
          <p className="text-[11px] text-[#c0ccd8]">Balai Kesehatan TNI AL Lanal Cilacap</p>
        </div>

        <div className={`rounded-[14px] p-5 text-center mb-5 ${isSuspek ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="text-[42px] mb-1">{isSuspek ? '⚠️' : '✅'}</div>
          <div className={`text-[20px] font-extrabold ${isSuspek ? 'text-red-700' : 'text-green-700'}`}>
            {isSuspek ? 'Suspek TBC' : 'Risiko Rendah'}
          </div>
          <div className={`text-[13px] mt-1.5 ${isSuspek ? 'text-red-600' : 'text-green-600'}`}>
            {isSuspek
              ? 'Segera lakukan pemeriksaan dahak / Tes TCM di fasilitas kesehatan.'
              : 'Tetap jaga kesehatan dan lakukan pemeriksaan jika muncul gejala.'}
          </div>
        </div>

        <div className="flex flex-col gap-0">
          {[
            ['Nama', screening.name],
            ['Nomor HP', screening.phone],
            ['Jumlah gejala', `${screening.score} dari 9`],
            ['Tanggal', new Date(screening.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 text-sm">
              <span className="font-bold text-gray-700">{label}</span>
              <span className="text-gray-500">{value}</span>
            </div>
          ))}
        </div>

        <Link href="/skrining" className="block w-full mt-5 text-center py-3.5 border-2 border-[#1565c0] text-[#1565c0] font-bold text-[15px] rounded-xl hover:bg-blue-50 transition-colors">
          Skrining Ulang
        </Link>

        <div className="mt-4 text-center text-[#93c5fd] text-[12.5px] font-semibold">
          <span>Scroll untuk informasi lebih lanjut tentang TBC</span>
          <div className="text-[22px] mt-0.5 animate-bounce">⌄</div>
        </div>
      </div>

      {/* Infographic */}
      <div className="w-full max-w-[480px] mx-auto flex flex-col gap-4">
        <p className="text-center font-poppins font-extrabold text-[18px] text-white tracking-wide">Kenali Lebih Lanjut tentang TBC</p>
        <p className="text-center text-[13px] text-white/75 -mt-2">Informasi penting untuk Anda dan keluarga</p>

        {/* Apa itu TBC */}
        <div className="rounded-[18px] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#0288d1] to-[#26c6da] text-white font-poppins font-extrabold text-[16px]">
            <span className="text-[22px]">🫁</span> Apa itu TBC?
          </div>
          <div className="bg-white px-4 py-4 text-[14px] text-gray-700 leading-relaxed">
            <strong className="text-[#1e3a6e]">Tuberculosis (TBC)</strong> adalah penyakit <strong className="text-[#1e3a6e]">menular</strong> yang menyerang <strong className="text-[#1e3a6e]">paru-paru</strong>, namun juga bisa menyebar ke organ tubuh lainnya. Penyakit ini disebabkan oleh kuman <em>Mycobacterium tuberculosis</em> dan ditularkan melalui percikan (droplet) saat penderita batuk, bersin, atau berbicara tanpa masker.
          </div>
        </div>

        {/* Gejala */}
        <div className="rounded-[18px] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#e53935] to-[#f06292] text-white font-poppins font-extrabold text-[16px]">
            <span className="text-[22px]">🤒</span> Gejala TBC
          </div>
          <div className="bg-white px-4 py-4">
            <p className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Gejala Utama</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ['😮‍💨', 'Batuk lebih dari 2 minggu'],
                ['🩸', 'Batuk berdahak bercampur darah'],
                ['💨', 'Sesak napas'],
                ['💢', 'Nyeri dada'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 bg-gray-50 rounded-[10px] p-2.5 border-l-[3px] border-red-600">
                  <span className="text-[18px]">{icon}</span>
                  <span className="text-[12.5px] font-semibold text-gray-800 leading-tight">{text}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Gejala Lain</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['⚖️', 'Penurunan berat badan'],
                ['🌙', 'Berkeringat di malam hari'],
                ['🌡️', 'Demam ringan'],
                ['🍽️', 'Penurunan nafsu makan'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 bg-gray-50 rounded-[10px] p-2.5 border-l-[3px] border-orange-500">
                  <span className="text-[18px]">{icon}</span>
                  <span className="text-[12.5px] font-semibold text-gray-800 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pemeriksaan */}
        <div className="rounded-[18px] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#00897b] to-[#26a69a] text-white font-poppins font-extrabold text-[16px]">
            <span className="text-[22px]">🔬</span> Pemeriksaan TBC
          </div>
          <div className="bg-white px-4 py-4 flex flex-col gap-0">
            {[
              { num: 1, color: '#0288d1', title: 'Pemeriksaan Dahak', desc: 'Dahak diambil 2 kali — sewaktu datang ke klinik (hari 1) dan pagi saat bangun tidur (hari 2).' },
              { num: 2, color: '#0288d1', title: 'Rontgen Dada', desc: 'Pemeriksaan tambahan berupa foto dada, dilakukan bila pemeriksaan dahak hasilnya negatif namun gejala TBC lain masih ada.' },
              { num: 3, color: '#00897b', title: 'Tes TCM (GeneXpert)', desc: 'Pemeriksaan molekuler cepat yang dapat mendeteksi kuman TBC dan resistensi obat dalam waktu singkat.' },
            ].map((step, i) => (
              <div key={step.num} className={`flex gap-3 items-start py-3 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ backgroundColor: step.color }}>
                  {step.num}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1e3a6e] mb-0.5">{step.title}</h4>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pengobatan */}
        <div className="rounded-[18px] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#f57c00] to-[#ffa726] text-white font-poppins font-extrabold text-[16px]">
            <span className="text-[22px]">💊</span> Pengobatan TBC
          </div>
          <div className="bg-white px-4 py-4">
            <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">TBC <strong className="text-orange-700">dapat disembuhkan</strong> dengan minum obat secara teratur dan tuntas. Jangan berhenti minum obat meskipun sudah merasa sehat!</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: '🟠', phase: 'Tahap Awal', desc: 'Obat diminum setiap hari selama 2 atau 3 bulan' },
                { icon: '✅', phase: 'Tahap Lanjutan', desc: 'Obat diminum 3× seminggu selama 4 atau 5 bulan' },
              ].map(p => (
                <div key={p.phase} className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                  <div className="text-[28px] mb-1.5">{p.icon}</div>
                  <h4 className="text-[13px] font-extrabold text-orange-700 mb-1">{p.phase}</h4>
                  <p className="text-[12px] text-orange-900 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pencegahan */}
        <div className="rounded-[18px] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-[#6a1b9a] to-[#ab47bc] text-white font-poppins font-extrabold text-[16px]">
            <span className="text-[22px]">🛡️</span> Pencegahan TBC
          </div>
          <div className="bg-white px-4 py-4 flex flex-col gap-2.5">
            {[
              ['🥗', 'Makan makanan bergizi untuk meningkatkan daya tahan tubuh'],
              ['🪟', 'Buka jendela agar ventilasi udara baik'],
              ['☀️', 'Jemur alas tidur agar tidak lembap'],
              ['🏃', 'Olahraga teratur'],
              ['💉', 'Dapatkan vaksinasi BCG bagi anak'],
              ['😷', 'Gunakan masker saat batuk atau bersin'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 bg-green-50 rounded-xl px-3.5 py-3 text-[13.5px] font-bold text-green-700">
                <span className="text-[24px] flex-shrink-0">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[18px] p-5 text-center bg-gradient-to-br from-[#e53935] to-[#f06292] shadow-xl">
          <h2 className="font-poppins font-extrabold text-[18px] text-white mb-2">TBC Bisa Disembuhkan!</h2>
          <p className="text-[13px] text-white/90 leading-relaxed mb-3.5">Bila Anda memiliki gejala TBC, segera periksakan diri ke fasilitas kesehatan terdekat. Penanganan dini adalah kunci kesembuhan.</p>
          <div className="bg-white/20 rounded-xl px-4 py-2.5 text-[13px] font-extrabold text-white">
            🏥 BK Lanal Cilacap<br />
            <span className="font-normal text-[12px]">Jl. May. L Wiratno, No 64-86, Kandang Macan, Tegalreja, Kec. Cilacap Selatan, Kab. Cilacap</span>
          </div>
        </div>

        {/* Download Flyer */}
        <a
          href="/flyer-tbc.pdf"
          download="Flyer TBC Lanal Cilacap.pdf"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#1e3a6e] font-extrabold text-[14px] rounded-xl shadow-md hover:bg-blue-50 hover:-translate-y-0.5 transition-all"
        >
          <span className="text-[18px]">📥</span> Unduh Brosur TBC (PDF)
        </a>

      </div>
    </main>
  )
}