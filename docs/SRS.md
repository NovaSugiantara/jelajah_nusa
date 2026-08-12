# Software Requirements Specification (SRS)
## Jelajah Nusa

| | |
|---|---|
| **Versi** | 1.0 — Draft |
| **Tanggal** | 12 Agustus 2026 |
| **Status** | Draft untuk direview |
| **Dokumen terkait** | PRD-Jelajah-Nusa.md, DESIGN-Jelajah-Nusa.md, AGENTS.md |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini menjabarkan kebutuhan fungsional dan non-fungsional sistem Jelajah Nusa sebagai acuan teknis untuk tim pengembang maupun coding agent, berdasarkan ruang lingkup yang ditetapkan di PRD-Jelajah-Nusa.md.

### 1.2 Ruang Lingkup
SRS ini mencakup seluruh fitur MVP: peta interaktif, story engine, choice-based branching, progress tracking, Nusa Passport, collectibles, Explorer Card, dan Suara Nusantara. Fitur AI dicakup sebagai modul opsional non-blocking.

### 1.3 Definisi, Akronim, Singkatan

| Istilah | Definisi |
|---|---|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| RLS | Row Level Security (Supabase/Postgres) |
| Story Node | Satu unit teks cerita dalam sebuah alur bercabang |
| Session User | Pengguna yang diidentifikasi lewat sesi/anonymous auth, tanpa akun penuh |

### 1.4 Referensi
- PRD-Jelajah-Nusa.md
- DESIGN-Jelajah-Nusa.md

## 2. Deskripsi Umum

### 2.1 Perspektif Produk
Jelajah Nusa adalah aplikasi web mandiri (bukan bagian dari sistem lain), dengan frontend Nuxt 4 dan backend data Supabase. Aplikasi tidak bergantung pada sistem eksternal wajib, kecuali AI opsional di fase lanjutan.

### 2.2 Fungsi Utama Produk
1. Menampilkan peta interaktif 8 wilayah Indonesia.
2. Menyajikan cerita interaktif bercabang per wilayah.
3. Melacak progres eksplorasi pengguna.
4. Mengelola collectible dan Nusa Passport.
5. Menghasilkan Explorer Card yang bisa dibagikan.
6. Mengumpulkan dan menampilkan jawaban Suara Nusantara di wall komunitas.

### 2.3 Karakteristik Pengguna
Pengguna umum (pelajar, pendidik, wisatawan) tanpa keahlian teknis, mengakses lewat browser mobile maupun desktop.

### 2.4 Batasan Umum
- MVP dibatasi pada 8 wilayah.
- Tidak ada dashboard admin/CMS penuh di MVP — pengelolaan konten cerita boleh dilakukan lewat data terstruktur (JSON/Supabase table) yang diedit langsung.
- Tidak ada mode multiplayer.

### 2.5 Asumsi & Ketergantungan
- Supabase digunakan untuk penyimpanan progres dan Suara Nusantara.
- Anonymous auth Supabase digunakan agar pengguna tidak wajib mendaftar untuk mulai menjelajah.

## 3. Kebutuhan Fungsional

Prioritas: **M** = Must have, **S** = Should have, **C** = Could have.

### 3.1 Modul Peta Interaktif (FR-MAP)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-MAP-01 | Sistem harus menampilkan peta Indonesia dengan 8 wilayah yang dapat diklik/tap | M |
| FR-MAP-02 | Sistem harus menampilkan status visual berbeda untuk tiap wilayah: locked, available, in-progress, completed | M |
| FR-MAP-03 | Sistem harus menavigasi pengguna ke halaman cerita saat wilayah dipilih | M |
| FR-MAP-04 | Sistem harus menampilkan nama wilayah saat hover/tap sebelum masuk ke cerita | S |
| FR-MAP-05 | Peta harus tetap dapat digunakan (readable & tappable) pada layar mobile sempit | M |

### 3.2 Modul Story Engine (FR-STORY)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-STORY-01 | Sistem harus menyajikan cerita per wilayah sebagai rangkaian story node | M |
| FR-STORY-02 | Setiap story node harus dapat memuat teks, gambar pendukung, dan indikator progres cerita | M |
| FR-STORY-03 | Sistem harus mendukung minimal satu titik percabangan (2–3 pilihan) per cerita | M |
| FR-STORY-04 | Sistem harus menyimpan pilihan yang diambil pengguna untuk keperluan progress tracking | M |
| FR-STORY-05 | Sistem harus menampilkan halaman "Discovery" (fakta budaya/tokoh/kuliner/bahasa) di akhir cabang cerita | M |

### 3.3 Modul Choice & Branching (FR-CHOICE)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-CHOICE-01 | Sistem harus menampilkan opsi pilihan secara jelas pada titik keputusan | M |
| FR-CHOICE-02 | Setiap pilihan harus mengarah ke story node atau ending yang berbeda | M |
| FR-CHOICE-03 | Sistem tidak boleh memblokir pengguna untuk melanjutkan meskipun memilih opsi manapun (tidak ada "pilihan salah" yang menghentikan progres) | M |

### 3.4 Modul Progress Tracking (FR-PROG)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-PROG-01 | Sistem harus menyimpan wilayah yang telah dijelajahi per pengguna/sesi | M |
| FR-PROG-02 | Sistem harus menyimpan cerita yang telah diselesaikan dan pilihan yang diambil | M |
| FR-PROG-03 | Sistem harus menghitung level explorer berdasarkan jumlah wilayah/cerita/collectible | S |
| FR-PROG-04 | Progres harus tetap ada saat pengguna kembali ke aplikasi pada sesi/perangkat yang sama | M |

### 3.5 Modul Nusa Passport (FR-PASS)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-PASS-01 | Sistem harus menampilkan jumlah wilayah yang sudah dijelajahi dari total 8 | M |
| FR-PASS-02 | Sistem harus menampilkan daftar cerita yang sudah ditemukan | M |
| FR-PASS-03 | Sistem harus menampilkan daftar collectible yang sudah dikumpulkan | M |
| FR-PASS-04 | Sistem harus menampilkan level explorer pengguna saat ini | S |

### 3.6 Modul Collectibles (FR-COLLECT)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-COLLECT-01 | Sistem harus memberikan satu collectible unik setiap wilayah diselesaikan | M |
| FR-COLLECT-02 | Collectible harus memiliki nama, gambar/ikon, dan deskripsi singkat | M |
| FR-COLLECT-03 | Sistem harus menampilkan animasi/notifikasi singkat saat collectible didapat | S |

### 3.7 Modul Explorer Card (FR-CARD)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-CARD-01 | Sistem harus dapat menghasilkan kartu ringkasan progres pengguna (wilayah, cerita, collectible, level) | S |
| FR-CARD-02 | Kartu harus dapat dibagikan lewat link atau diunduh sebagai gambar | S |

### 3.8 Modul Suara Nusantara (FR-VOICE)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-VOICE-01 | Sistem harus menampilkan pertanyaan reflektif di akhir perjalanan pengguna | S |
| FR-VOICE-02 | Sistem harus menyimpan jawaban pengguna dan menampilkannya di wall komunitas | S |
| FR-VOICE-03 | Sistem harus menerapkan moderasi dasar (filter kata kasar/spam) sebelum jawaban tampil publik | S |

### 3.9 Modul AI — Opsional (FR-AI)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-AI-01 | Sistem dapat menggunakan AI untuk moderasi otomatis Suara Nusantara | C |
| FR-AI-02 | Sistem dapat menggunakan AI untuk merekomendasikan wilayah berikutnya berdasarkan histori eksplorasi | C |
| FR-AI-03 | Modul AI tidak boleh menjadi ketergantungan wajib bagi core loop untuk berjalan | M |

## 4. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Performa** | Waktu muat halaman awal < 3 detik pada koneksi 4G rata-rata; transisi antar story node < 300ms |
| **Usability** | Navigasi utama (peta → cerita → passport) dapat dipahami tanpa tutorial panjang |
| **Reliabilitas** | Progres pengguna tidak boleh hilang akibat refresh halaman dalam sesi yang sama |
| **Keamanan** | Data progres pengguna diisolasi lewat RLS Supabase per user/session; input Suara Nusantara divalidasi sisi server |
| **Skalabilitas** | Struktur data mendukung penambahan wilayah lebih dari 8 tanpa perubahan skema besar |
| **Kompatibilitas** | Berjalan baik di browser modern (Chrome, Safari, Firefox) versi 2 tahun terakhir |
| **Responsiveness** | Mobile-first, layout tetap fungsional dari lebar 360px ke atas |
| **Aksesibilitas** | Kontras warna memenuhi WCAG AA, elemen peta memiliki label alternatif (alt text/aria-label) |
| **Maintainability** | Konten cerita & collectible disimpan terstruktur (bukan hardcode di komponen UI) agar mudah ditambah |

## 5. Model Data (Entitas Utama)

| Entitas | Field Utama | Deskripsi |
|---|---|---|
| **Region** | id, name, island, slug, map_path_id, thumbnail_url, status | Data wilayah di peta |
| **Story** | id, region_id, title, category (sejarah/budaya/tokoh/kuliner/bahasa) | Cerita per wilayah |
| **StoryNode** | id, story_id, order, text, image_url | Unit teks dalam cerita |
| **Choice** | id, story_node_id, label, next_node_id | Opsi pilihan pada titik keputusan |
| **Collectible** | id, region_id, name, type, image_url, description | Item koleksi per wilayah |
| **UserProgress** | user_id (session/anon), regions_explored[], stories_completed[], collectibles_owned[], level | Progres pengguna |
| **PassportEntry** | user_id, region_id, collectible_id, collected_at | Catatan koleksi individual |
| **ExplorerCard** | user_id, snapshot_data, share_slug, generated_at | Data kartu yang dibagikan |
| **CommunityWallEntry** | id, user_id (anon), answer_text, moderation_status, created_at | Entri Suara Nusantara |

**Relasi utama:** Region 1—N Story; Story 1—N StoryNode; StoryNode 1—N Choice; Region 1—N Collectible; UserProgress N—N Region (lewat PassportEntry).

## 6. Kebutuhan Antarmuka

### 6.1 Antarmuka Pengguna
Web responsif, mobile-first, mengikuti sistem desain di DESIGN-Jelajah-Nusa.md.

### 6.2 Antarmuka Perangkat Lunak
- Supabase client (Postgres + Auth anonymous + Storage untuk aset collectible/gambar cerita).
- RLS diterapkan pada tabel UserProgress, PassportEntry, dan CommunityWallEntry.

### 6.3 Antarmuka Komunikasi (Opsional)
- API eksternal untuk AI moderasi/rekomendasi (fase lanjutan), dipanggil secara asinkron dan tidak memblokir alur utama jika gagal.

## 7. Use Case Utama

**UC-01 — Menjelajahi Wilayah di Peta**
- Aktor: Pengguna
- Prakondisi: Pengguna berada di halaman peta
- Alur utama: Pengguna memilih wilayah → sistem menampilkan intro cerita wilayah tersebut
- Pascakondisi: Wilayah berstatus "in-progress"

**UC-02 — Mengikuti Cerita dan Membuat Pilihan**
- Aktor: Pengguna
- Prakondisi: Pengguna berada dalam alur cerita suatu wilayah
- Alur utama: Pengguna membaca story node → mencapai titik keputusan → memilih opsi → cerita berlanjut ke node berikutnya → mencapai Discovery
- Alur alternatif: Jika koneksi terputus, progres node terakhir tetap tersimpan
- Pascakondisi: Cerita berstatus selesai, collectible diberikan

**UC-03 — Mendapatkan Collectible**
- Aktor: Sistem, Pengguna
- Prakondisi: Cerita wilayah telah diselesaikan
- Alur utama: Sistem memberikan collectible → menampilkan notifikasi → collectible masuk Nusa Passport
- Pascakondisi: PassportEntry baru tercatat

**UC-04 — Melihat Nusa Passport**
- Aktor: Pengguna
- Prakondisi: Pengguna memiliki minimal 0 progres (dapat diakses kapan saja)
- Alur utama: Pengguna membuka Passport → sistem menampilkan ringkasan wilayah, cerita, collectible, dan level
- Pascakondisi: Tidak ada perubahan data

**UC-05 — Membagikan Explorer Card**
- Aktor: Pengguna
- Prakondisi: Pengguna telah menyelesaikan minimal 1 wilayah
- Alur utama: Pengguna meminta pembuatan Explorer Card → sistem men-generate snapshot progres → pengguna membagikan link/gambar
- Pascakondisi: ExplorerCard tersimpan dengan share_slug unik

**UC-06 — Mengisi Suara Nusantara**
- Aktor: Pengguna
- Prakondisi: Pengguna telah menyelesaikan perjalanan (minimal 1 wilayah)
- Alur utama: Sistem menampilkan pertanyaan reflektif → pengguna menjawab → sistem memvalidasi/memoderasi → jawaban tampil di wall komunitas
- Alur alternatif: Jika moderasi menolak, jawaban tidak ditampilkan publik namun tetap tersimpan untuk pengguna sendiri
- Pascakondisi: CommunityWallEntry baru tercatat

## 8. Batasan Sistem

- MVP tidak mendukung penambahan wilayah lewat UI admin — penambahan dilakukan lewat data terstruktur oleh tim/developer.
- Tidak ada dukungan multi-bahasa di MVP (Bahasa Indonesia saja).
- Tidak ada sinkronisasi progres lintas perangkat tanpa akun penuh (di luar anonymous session).

## 9. Matriks Ketertelusuran (Ringkas)

| Fitur PRD | Modul FR Terkait |
|---|---|
| Interactive Map Indonesia | FR-MAP |
| Interactive Story | FR-STORY |
| Choice-based learning | FR-CHOICE |
| Progress Tracking | FR-PROG |
| Nusa Passport | FR-PASS |
| Collectibles | FR-COLLECT |
| Shareable Explorer Card | FR-CARD |
| Suara Nusantara | FR-VOICE |
| AI (opsional) | FR-AI |
