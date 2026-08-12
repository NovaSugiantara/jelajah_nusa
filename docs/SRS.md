# Software Requirements Specification (SRS)
## Jelajah Nusa

| | |
|---|---|
| **Versi** | 1.1 — Draft |
| **Tanggal** | 12 Agustus 2026 |
| **Status** | Draft untuk direview |
| **Dokumen terkait** | `docs/PRD.md`, `docs/DESIGN.md`, `AGENTS.md` |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini menjabarkan kebutuhan fungsional dan non-fungsional sistem Jelajah Nusa sebagai acuan teknis untuk tim pengembang maupun coding agent, berdasarkan ruang lingkup yang ditetapkan di `docs/PRD.md`.

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
- `docs/PRD.md`
- `docs/DESIGN.md`

## 2. Deskripsi Umum

### 2.1 Perspektif Produk
Jelajah Nusa adalah aplikasi web mandiri (bukan bagian dari sistem lain) dengan frontend Nuxt 4. Tahap 1 tidak memakai backend; Supabase mulai digunakan pada Tahap 2A. AI tetap opsional dan tidak boleh menjadi ketergantungan core loop.

### 2.2 Fungsi Utama Produk
1. Menampilkan peta interaktif 8 provinsi Indonesia.
2. Menyajikan cerita interaktif bercabang per provinsi.
3. Melacak progres eksplorasi pengguna.
4. Mengelola collectible dan Nusa Passport.
5. Menghasilkan Explorer Card yang bisa dibagikan.
6. Mengumpulkan dan menampilkan jawaban Suara Nusantara di wall komunitas.

### 2.3 Karakteristik Pengguna
Pengguna umum (pelajar, pendidik, wisatawan) tanpa keahlian teknis, mengakses lewat browser mobile maupun desktop.

### 2.4 Tahapan Implementasi

| Tahap | Cakupan teknis |
|---|---|
| **Tahap 1 — Demo internal** | Aceh dan Bali; data konten terstruktur; progress dan Passport ringan di penyimpanan lokal; tanpa Supabase, Explorer Card, atau Suara Nusantara publik |
| **Gate user test** | 8 peserta campuran usia 13–24 pada ponsel masing-masing; 4 menguji Aceh dan 4 Bali. Minimal 5/8 mencapai collectible tanpa arahan, dengan minimal 2/4 berhasil per provinsi. Hasil hanya smoke test keterpahaman umum |
| **Tahap 2A — Produk inti** | 8 provinsi; anonymous auth dan progress Supabase; Passport penuh; Explorer Card melalui Web Share API dengan fallback unduh gambar |
| **Tahap 2B — Komunitas** | Submission Suara Nusantara anonim dan pending secara default; moderation queue terbatas dengan akses moderator melalui email magic link |

### 2.5 Batasan Umum
- MVP dibatasi pada 8 provinsi.
- Tidak ada CMS penuh di MVP. Tahap 2B hanya boleh menambahkan queue internal untuk preview, approve, dan reject submission.
- Tidak ada mode multiplayer.

### 2.6 Asumsi & Ketergantungan
- Tahap 1 tidak bergantung pada backend; progress disimpan pada perangkat yang sama.
- Mulai Tahap 2A, Supabase digunakan untuk anonymous auth dan penyimpanan progres.
- Tahap 2B menggunakan Supabase untuk Suara Nusantara dan autentikasi moderator.

## 3. Kebutuhan Fungsional

Prioritas: **M** = Must have, **S** = Should have, **C** = Could have.

### 3.1 Modul Peta Interaktif (FR-MAP)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-MAP-01 | Tahap 1 harus menampilkan Aceh dan Bali; Tahap 2A harus menampilkan 8 provinsi yang dapat diklik/tap | M |
| FR-MAP-02 | Sistem harus menampilkan status visual berbeda untuk tiap provinsi: belum dimulai, sedang berlangsung, selesai | M |
| FR-MAP-03 | Sistem harus menavigasi pengguna ke halaman cerita saat provinsi dipilih | M |
| FR-MAP-04 | Sistem harus menampilkan nama provinsi saat hover/tap sebelum masuk ke cerita | S |
| FR-MAP-05 | Peta harus tetap dapat digunakan (readable & tappable) pada layar mobile sempit | M |
| FR-MAP-06 | Semua provinsi yang tersedia harus dapat dipilih sejak awal tanpa urutan unlock wajib | M |

### 3.2 Modul Story Engine (FR-STORY)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-STORY-01 | Sistem harus menyajikan cerita per provinsi sebagai rangkaian story node | M |
| FR-STORY-02 | Setiap story node harus dapat memuat teks, gambar pendukung, dan indikator progres cerita | M |
| FR-STORY-03 | Tahap 1 harus memiliki tepat satu titik percabangan dengan tepat 2 pilihan per cerita; tahap berikutnya boleh mendukung 2–3 pilihan | M |
| FR-STORY-04 | Sistem harus menyimpan pilihan yang diambil pengguna untuk keperluan progress tracking | M |
| FR-STORY-05 | Sistem harus menampilkan halaman "Discovery" berupa fakta budaya/tokoh/kuliner/bahasa yang berbeda sesuai pilihan di akhir cabang cerita | M |
| FR-STORY-06 | Setiap Discovery harus menampilkan sumber ringkas yang dapat diakses pengguna | M |

### 3.3 Modul Choice & Branching (FR-CHOICE)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-CHOICE-01 | Sistem harus menampilkan opsi pilihan secara jelas pada titik keputusan | M |
| FR-CHOICE-02 | Setiap pilihan harus mengarah ke story node atau ending yang berbeda | M |
| FR-CHOICE-03 | Sistem tidak boleh memblokir pengguna untuk melanjutkan meskipun memilih opsi manapun (tidak ada "pilihan salah" yang menghentikan progres) | M |
| FR-CHOICE-04 | Pilihan mengubah Discovery, bukan collectible yang diterima | M |

### 3.4 Modul Progress Tracking (FR-PROG)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-PROG-01 | Sistem harus menyimpan provinsi yang telah dijelajahi per pengguna/sesi | M |
| FR-PROG-02 | Sistem harus menyimpan cerita yang telah diselesaikan dan pilihan yang diambil | M |
| FR-PROG-03 | Sistem harus menghitung level explorer berdasarkan jumlah provinsi selesai | S |
| FR-PROG-04 | Progres harus tetap ada saat pengguna kembali ke aplikasi pada sesi/perangkat yang sama | M |
| FR-PROG-05 | Tahap 1 harus menyimpan progres secara lokal; Tahap 2A harus memindahkan penyimpanan progres ke identitas anonymous Supabase | M |

### 3.5 Modul Nusa Passport (FR-PASS)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-PASS-01 | Sistem harus menampilkan jumlah provinsi yang sudah dijelajahi dari total 8 | M |
| FR-PASS-02 | Sistem harus menampilkan daftar cerita yang sudah ditemukan | M |
| FR-PASS-03 | Sistem harus menampilkan daftar collectible yang sudah dikumpulkan | M |
| FR-PASS-04 | Sistem harus menampilkan level explorer pengguna saat ini | S |
| FR-PASS-05 | Tahap 2A harus menetapkan milestone level explorer pada 2, 4, 6, dan 8 provinsi selesai | S |

### 3.6 Modul Collectibles (FR-COLLECT)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-COLLECT-01 | Sistem harus memberikan tepat satu collectible unik milik provinsi setiap cerita diselesaikan, terlepas dari pilihan pengguna | M |
| FR-COLLECT-02 | Collectible harus memiliki nama, gambar/ikon, dan deskripsi singkat | M |
| FR-COLLECT-03 | Sistem harus menampilkan animasi/notifikasi singkat saat collectible didapat | S |

### 3.7 Modul Explorer Card (FR-CARD)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-CARD-01 | Sistem harus dapat menghasilkan kartu ringkasan progres pengguna (provinsi, cerita, collectible, level) | S |
| FR-CARD-02 | Tahap 2A harus membagikan kartu melalui Web Share API bila tersedia dan menyediakan fallback unduh gambar | S |

### 3.8 Modul Suara Nusantara (FR-VOICE)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-VOICE-01 | Sistem harus menampilkan pertanyaan reflektif di akhir perjalanan pengguna | S |
| FR-VOICE-02 | Tahap 2B harus menyimpan jawaban tanpa nama, profil, sekolah, lokasi, atau kontak pengguna | S |
| FR-VOICE-03 | Submission baru harus berstatus pending dan tidak boleh tampil publik sebelum disetujui moderator | S |
| FR-VOICE-04 | Moderator harus dapat melihat submission pending lalu approve atau reject melalui queue internal | S |
| FR-VOICE-05 | Queue moderator harus dilindungi email magic link dan role moderator; pengguna biasa tidak boleh mengaksesnya | M |

### 3.9 Modul AI — Opsional (FR-AI)

| ID | Deskripsi | Prioritas |
|---|---|---|
| FR-AI-01 | Sistem dapat menggunakan AI untuk moderasi otomatis Suara Nusantara | C |
| FR-AI-02 | Sistem dapat menggunakan AI untuk merekomendasikan provinsi berikutnya berdasarkan histori eksplorasi | C |
| FR-AI-03 | Modul AI tidak boleh menjadi ketergantungan wajib bagi core loop untuk berjalan | M |

## 4. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Performa** | Waktu muat halaman awal < 3 detik pada koneksi 4G rata-rata; transisi antar story node < 300ms |
| **Usability** | Navigasi utama (peta → cerita → passport) dapat dipahami tanpa tutorial panjang |
| **Reliabilitas** | Progres pengguna tidak boleh hilang akibat refresh halaman dalam sesi yang sama |
| **Keamanan** | Mulai Tahap 2A, data progres diisolasi lewat RLS Supabase per user/session. Tahap 2B memvalidasi submission di server, menyimpannya pending, dan membatasi moderation queue pada role moderator |
| **Skalabilitas** | Struktur data mendukung penambahan provinsi lebih dari 8 tanpa perubahan skema besar |
| **Kompatibilitas** | Berjalan baik di browser modern (Chrome, Safari, Firefox) versi 2 tahun terakhir |
| **Responsiveness** | Mobile-first, layout tetap fungsional dari lebar 360px ke atas |
| **Aksesibilitas** | Kontras warna memenuhi WCAG AA, elemen peta memiliki label alternatif (alt text/aria-label) |
| **Maintainability** | Konten cerita, Discovery, sumber, dan collectible disimpan terstruktur (bukan hardcode di komponen UI) agar mudah ditambah |

## 5. Model Data (Entitas Utama)

| Entitas | Field Utama | Deskripsi |
|---|---|---|
| **Region** | id, name, island, slug, map_path_id, thumbnail_url, status | Data provinsi di peta |
| **Story** | id, region_id, title, category (sejarah/budaya/tokoh/kuliner/bahasa) | Cerita per provinsi |
| **StoryNode** | id, story_id, order, text, image_url | Unit teks dalam cerita |
| **Choice** | id, story_node_id, label, next_node_id | Opsi pilihan pada titik keputusan |
| **Collectible** | id, region_id, name, type, image_url, description | Item koleksi per provinsi |
| **UserProgress** | user_id (session/anon), regions_explored[], stories_completed[], collectibles_owned[], level | Progres pengguna mulai Tahap 2A; Tahap 1 memakai struktur setara di penyimpanan lokal |
| **PassportEntry** | user_id, region_id, collectible_id, collected_at | Catatan koleksi individual |
| **CommunityWallEntry** | id, user_id (anon), answer_text, moderation_status, created_at, reviewed_by, reviewed_at | Entri anonim Suara Nusantara dengan status pending/approved/rejected |

**Relasi utama:** Region 1—N Story; Story 1—N StoryNode; StoryNode 1—N Choice; Region 1—1 Collectible; UserProgress N—N Region (lewat PassportEntry).

## 6. Kebutuhan Antarmuka

### 6.1 Antarmuka Pengguna
Web responsif, mobile-first, mengikuti sistem desain di `docs/DESIGN.md`.

### 6.2 Antarmuka Perangkat Lunak
- Tahap 1 menggunakan penyimpanan browser untuk progress; tidak membutuhkan Supabase.
- Tahap 2A menggunakan Supabase client (Postgres + Auth anonymous + Storage untuk aset collectible/gambar cerita).
- RLS diterapkan pada tabel UserProgress, PassportEntry, dan CommunityWallEntry.
- Tahap 2B menggunakan email magic link dan role moderator untuk moderation queue.

### 6.3 Antarmuka Komunikasi (Opsional)
- API eksternal untuk AI moderasi/rekomendasi (fase lanjutan), dipanggil secara asinkron dan tidak memblokir alur utama jika gagal.

## 7. Use Case Utama

**UC-01 — Menjelajahi Provinsi di Peta**
- Aktor: Pengguna
- Prakondisi: Pengguna berada di halaman peta
- Alur utama: Pengguna memilih provinsi → sistem menampilkan intro cerita provinsi tersebut
- Pascakondisi: Provinsi berstatus "sedang berlangsung"

**UC-02 — Mengikuti Cerita dan Membuat Pilihan**
- Aktor: Pengguna
- Prakondisi: Pengguna berada dalam alur cerita suatu provinsi
- Alur utama: Pengguna membaca story node → mencapai titik keputusan → memilih opsi → cerita berlanjut ke node berikutnya → mencapai Discovery
- Alur alternatif: Jika koneksi terputus, progres node terakhir tetap tersimpan
- Pascakondisi: Cerita berstatus selesai, collectible diberikan

**UC-03 — Mendapatkan Collectible**
- Aktor: Sistem, Pengguna
- Prakondisi: Cerita provinsi telah diselesaikan
- Alur utama: Sistem memberikan satu collectible tetap milik provinsi → menampilkan notifikasi → collectible masuk Nusa Passport
- Pascakondisi: PassportEntry baru tercatat

**UC-04 — Melihat Nusa Passport**
- Aktor: Pengguna
- Prakondisi: Pengguna memiliki minimal 0 progres (dapat diakses kapan saja)
- Alur utama: Pengguna membuka Passport → sistem menampilkan ringkasan provinsi, cerita, collectible, dan level
- Pascakondisi: Tidak ada perubahan data

**UC-05 — Membagikan Explorer Card**
- Aktor: Pengguna
- Prakondisi: Pengguna telah menyelesaikan minimal 1 provinsi
- Alur utama: Pengguna meminta pembuatan Explorer Card → sistem membuat gambar dari snapshot progres → membuka Web Share API jika tersedia atau menawarkan unduh gambar
- Pascakondisi: Pengguna memperoleh gambar yang dapat dibagikan; tidak diperlukan link publik

**UC-06 — Mengisi Suara Nusantara**
- Aktor: Pengguna
- Prakondisi: Pengguna telah menyelesaikan perjalanan (minimal 1 provinsi)
- Alur utama: Sistem menampilkan pertanyaan reflektif → pengguna menjawab → sistem memvalidasi sisi server → jawaban tersimpan anonim dengan status pending → moderator approve → jawaban tampil di wall komunitas
- Alur alternatif: Moderator reject → jawaban tidak pernah ditampilkan publik
- Pascakondisi: CommunityWallEntry tercatat dengan audit reviewer saat keputusan moderasi dibuat

## 8. Batasan Sistem

- MVP tidak mendukung penambahan provinsi lewat UI admin — penambahan dilakukan lewat data terstruktur oleh tim/developer.
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
