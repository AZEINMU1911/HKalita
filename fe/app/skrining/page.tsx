"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const questions = [
  { key: "q1", label: "Batuk ≥ 2 minggu" },
  { key: "q2", label: "Demam hilang timbul" },
  { key: "q3", label: "Keringat malam" },
  { key: "q4", label: "Berat badan turun" },
  { key: "q5", label: "Nafsu makan turun / lemas" },
  { key: "q6", label: "Sesak napas" },
  { key: "q7", label: "Pembesaran kelenjar getah bening" },
  { key: "q8", label: "Riwayat penyakit lain (Diabetes / HIV)" },
  { key: "q9", label: "Kontak serumah dengan penderita TBC" },
];

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().min(8, "Nomor HP tidak valid"),
  answers: z.record(z.string(), z.boolean()),
});

type FormData = z.infer<typeof schema>;

export default function SkriningPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      answers: Object.fromEntries(questions.map((q) => [q.key, false])),
    },
  });

  const answers = watch("answers");

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Terjadi kesalahan");
      toast.success("Skrining berhasil dikirim");
      router.push(`/hasil/${json.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Logo Lanal Cilacap" width={80} height={80} className="mx-auto mb-3 rounded-full" loading="eager" />
          <h1 className="text-2xl font-bold text-blue-900">SIMAE TB</h1>
          <p className="text-gray-500 text-sm mt-1">
            Skrining Mandiri Tuberculosis
          </p>
          <p className="text-gray-400 text-xs">Balai Kesehatan TNI AL Lanal Cilacap</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor HP
            </label>
            <input
              {...register("phone")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="08xxxxxxxxxx"
              type="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Gejala yang dialami
            </p>
            <div className="space-y-2">
              {questions.map((q) => (
                <label
                  key={q.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={answers?.[q.key] ?? false}
                    onChange={(e) =>
                      setValue(`answers.${q.key}`, e.target.checked)
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{q.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? "Mengirim..." : "Lihat Hasil Skrining"}
          </button>
        </form>
      </div>
    </main>
  );
}
