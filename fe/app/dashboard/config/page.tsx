"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface Config {
  key: string;
  value: string;
  updated_at: string;
}

export default function ConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q1AutoSuspek, setQ1AutoSuspek] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState(3);

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch("/api/config");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      const data: Config[] = json.data ?? [];
      setConfigs(data);
      const q1 = data.find((c) => c.key === "q1_auto_suspek");
      const threshold = data.find((c) => c.key === "score_threshold");
      if (q1) setQ1AutoSuspek(q1.value === "true");
      if (threshold) setScoreThreshold(Number(threshold.value));
      setLoading(false);
    };
    fetch_();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "q1_auto_suspek",
            value: String(q1AutoSuspek),
          }),
        }),
        fetch("/api/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "score_threshold",
            value: String(scoreThreshold),
          }),
        }),
      ]);
      toast.success("Konfigurasi berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center gap-3">
        <Image src="/logo.png" alt="Logo Lanal Cilacap" width={40} height={40} className="rounded-full" loading="eager" />
        <div>
          <h1 className="text-lg font-bold">SIMAE TB</h1>
          <p className="text-blue-200 text-xs">Konfigurasi Skrining</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-6">
          {/* q1 auto suspek toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 text-sm">
                Batuk ≥ 2 minggu otomatis suspek
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Jika aktif, menjawab Ya pada pertanyaan pertama langsung
                diklasifikasikan sebagai Suspek TBC
              </p>
            </div>
            <button
              onClick={() => setQ1AutoSuspek((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                q1AutoSuspek ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  q1AutoSuspek ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* score threshold */}
          <div>
            <p className="font-medium text-gray-800 text-sm mb-1">
              Ambang batas skor suspek
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Jumlah minimum jawaban Ya untuk diklasifikasikan sebagai Suspek
              TBC
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={9}
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-2xl font-bold text-blue-900 w-8 text-center">
                {scoreThreshold}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Saat ini: {scoreThreshold} dari 9 gejala
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* last updated */}
          <div className="text-xs text-gray-400 space-y-1">
            {configs.map((c) => (
              <p key={c.key}>
                {c.key} — terakhir diperbarui{" "}
                {new Date(c.updated_at).toLocaleString("id-ID")}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
        </button>
      </div>
    </main>
  );
}
