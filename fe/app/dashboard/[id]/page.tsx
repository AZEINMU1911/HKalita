import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import Image from "next/image";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8080";

const questions: Record<string, string> = {
  q1: "Batuk ≥ 2 minggu",
  q2: "Demam hilang timbul",
  q3: "Keringat malam",
  q4: "Berat badan turun",
  q5: "Nafsu makan turun / lemas",
  q6: "Sesak napas",
  q7: "Pembesaran kelenjar getah bening",
  q8: "Riwayat penyakit lain (Diabetes / HIV)",
  q9: "Kontak serumah dengan penderita TBC",
};

async function getScreening(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("simae_token")?.value;
  const res = await fetch(`${API_BASE}/api/v1/screening/${id}`, {
    headers: { Cookie: `simae_token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const screening = await getScreening(id);
  if (!screening) notFound();

  const isSuspek = screening.result === "suspek";
  const answers: Record<string, boolean> = screening.answers ?? {};

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center gap-3">
        <Image src="/logo.png" alt="Logo Lanal Cilacap" width={40} height={40} className="rounded-full" loading="eager" />
        <div>
          <h1 className="text-lg font-bold">SIMAE TB</h1>
          <p className="text-blue-200 text-xs">Detail Skrining</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Kembali ke Dashboard
        </Link>

        {/* Result card */}
        <div
          className={`rounded-xl p-5 text-center border ${
            isSuspek
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="text-3xl mb-2">{isSuspek ? "⚠️" : "✅"}</p>
          <p
            className={`text-xl font-bold ${isSuspek ? "text-red-700" : "text-green-700"}`}
          >
            {isSuspek ? "Suspek TBC" : "Risiko Rendah"}
          </p>
          <p
            className={`text-sm mt-1 ${isSuspek ? "text-red-600" : "text-green-600"}`}
          >
            Skor: {screening.score} dari 9
          </p>
        </div>

        {/* Patient info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Data Pasien</h2>
          {[
            ["Nama", screening.name],
            ["Nomor HP", screening.phone],
            ["Alamat", screening.address || "-"],
            [
              "Tanggal",
              new Date(screening.created_at).toLocaleDateString("id-ID", {
                dateStyle: "long",
              }),
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-800 font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Answers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Jawaban Skrining</h2>
          <div className="space-y-2">
            {Object.entries(questions).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-gray-700">{label}</span>
                <span
                  className={`font-medium ${answers[key] ? "text-red-600" : "text-green-600"}`}
                >
                  {answers[key] ? "Ya" : "Tidak"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
