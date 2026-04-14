# SIMAE TB

### Sistem Skrining Mandiri Tuberkulosis

**Balai Kesehatan TNI Angkatan Laut — Lanal Cilacap**

---

## Tentang Aplikasi

SIMAE TB adalah aplikasi web untuk skrining mandiri gejala Tuberkulosis (TBC). Pasien dapat mengisi formulir skrining dari perangkat mobile maupun desktop tanpa perlu membuat akun. Petugas kesehatan dapat memantau seluruh hasil skrining melalui dashboard khusus.

---

## Fitur

**Untuk Pasien (Publik)**

- Formulir skrining 9 pertanyaan gejala TBC
- Hasil skrining langsung tampil setelah submit
- Halaman hasil dapat disimpan / dibookmark via URL unik

**Untuk Petugas Kesehatan (Login Diperlukan)**

- Dashboard rekap seluruh hasil skrining
- Filter berdasarkan hasil (Suspek / Risiko Rendah) dan tanggal
- Detail lengkap per pasien beserta jawaban tiap pertanyaan
- Export data ke Excel (`.xlsx`) sesuai format resmi
- Konfigurasi logika penilaian (ambang batas skor & aturan q1)

---

## Teknologi

| Lapisan    | Teknologi                                         |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend    | Go, Gin                                           |
| Database   | PostgreSQL                                        |
| Auth       | JWT (httpOnly cookie), login via nomor HP         |
| Container  | Docker Compose                                    |
| Web Server | Nginx (reverse proxy)                             |

---

## Struktur Proyek

```
hanakalita-project/
├── fe/          # Frontend Next.js
├── be/          # Backend Go
├── CLAUDE.md    # Konteks proyek untuk Claude Code
└── README.md
```

---

## Cara Menjalankan Secara Lokal

### Prasyarat

- Go 1.23+
- Node.js 18+
- PostgreSQL
- Git

### 1. Clone repositori

```bash
git clone https://github.com/AZEINMU1911/HKalita.git
cd HKalita
```

### 2. Setup backend

```bash
cd be
cp .env.example .env
# Edit .env — isi DATABASE_URL, JWT_SECRET, PORT
go run ./cmd/server
```

### 3. Setup frontend

```bash
cd fe
cp .env.local.example .env.local
# Edit .env.local — isi API_BASE_URL
npm install
npm run dev
```

### 4. Seed data officer

Sebelum bisa login ke dashboard, tambahkan minimal satu baris officer ke database:

```sql
INSERT INTO officers (id, phone, name, role, is_active, created_at)
VALUES (gen_random_uuid(), '08xxxxxxxxxx', 'Nama Petugas', 'admin', true, NOW());
```

### 5. Akses aplikasi

| URL                               | Keterangan           |
| --------------------------------- | -------------------- |
| `http://localhost:3000/skrining`  | Form skrining pasien |
| `http://localhost:3000/login`     | Login petugas        |
| `http://localhost:3000/dashboard` | Dashboard petugas    |

---

## Variabel Lingkungan

### Backend (`be/.env`)

| Variabel       | Contoh                                                       | Keterangan               |
| -------------- | ------------------------------------------------------------ | ------------------------ |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/dbname?sslmode=disable` | Koneksi PostgreSQL       |
| `JWT_SECRET`   | `rahasia_kuat_di_sini`                                       | Secret untuk signing JWT |
| `PORT`         | `8080`                                                       | Port server Go           |

### Frontend (`fe/.env.local`)

| Variabel       | Contoh                  | Keterangan                        |
| -------------- | ----------------------- | --------------------------------- |
| `API_BASE_URL` | `http://localhost:8080` | URL backend Go (server-side only) |

---

## Logika Penilaian

Hasil skrining ditentukan oleh dua aturan yang dapat dikonfigurasi dari dashboard:

| Aturan            | Default | Keterangan                                              |
| ----------------- | ------- | ------------------------------------------------------- |
| `q1_auto_suspek`  | `true`  | Jika batuk ≥ 2 minggu (q1) dijawab Ya → langsung Suspek |
| `score_threshold` | `3`     | Jika jumlah jawaban Ya ≥ ambang batas → Suspek          |

Jika tidak memenuhi salah satu aturan di atas → **Risiko Rendah**.

---

## API Endpoint

### Publik (tanpa autentikasi)

| Method | Path                    | Keterangan                   |
| ------ | ----------------------- | ---------------------------- |
| `POST` | `/api/v1/screening`     | Submit formulir skrining     |
| `GET`  | `/api/v1/screening/:id` | Ambil hasil skrining by UUID |

### Terproteksi (memerlukan JWT cookie)

| Method | Path                        | Keterangan                            |
| ------ | --------------------------- | ------------------------------------- |
| `POST` | `/api/v1/auth/login`        | Login petugas dengan nomor HP         |
| `POST` | `/api/v1/auth/logout`       | Logout                                |
| `GET`  | `/api/v1/screenings`        | Daftar skrining (filter + pagination) |
| `GET`  | `/api/v1/screenings/export` | Export Excel                          |
| `GET`  | `/api/v1/dashboard/stats`   | Statistik ringkasan                   |
| `GET`  | `/api/v1/config`            | Ambil konfigurasi penilaian           |
| `PUT`  | `/api/v1/config`            | Update konfigurasi penilaian          |

---

## Deployment

Aplikasi di-deploy menggunakan Docker Compose di DigitalOcean dengan Nginx sebagai reverse proxy. Lihat dokumentasi deployment terpisah untuk detail konfigurasi server.

---

## Catatan Keamanan

- Tidak ada NIK yang disimpan — hanya nomor HP sebagai identifikasi pasien
- Login petugas menggunakan nomor HP yang telah terdaftar (allowlist)
- JWT disimpan dalam httpOnly cookie — tidak dapat diakses JavaScript
- Aktifkan `Secure: true` pada cookie setelah HTTPS dikonfigurasi

---
