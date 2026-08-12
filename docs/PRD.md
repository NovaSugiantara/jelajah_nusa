# Product Requirements Document (PRD)
## Jelajah Nusa

| | |
|---|---|
| **Versi** | 1.2 — Draft |
| **Tanggal** | 13 Agustus 2026 |
| **Status** | Draft untuk direview |
| **Dokumen terkait** | `docs/SRS.md`, `docs/DESIGN.md`, `AGENTS.md` |

---

## 1. Ringkasan Eksekutif

Jelajah Nusa adalah aplikasi edukasi interaktif berbasis web yang mengajak pengguna mengenal keberagaman Indonesia — sejarah, budaya, tokoh, kuliner, dan bahasa daerah — melalui eksplorasi peta, cerita bercabang (choice-based), dan sistem koleksi bergaya gamifikasi. Pengguna menjelajah wilayah demi wilayah, mengikuti cerita singkat, mengambil keputusan dalam cerita, lalu mengumpulkan collectible ke dalam **Nusa Passport** pribadi mereka.

**Tagline:** *"Kenali Indonesia. Satu cerita, satu perjalanan."*

## 2. Latar Belakang & Masalah

- Keberagaman budaya, sejarah, dan bahasa daerah Indonesia sangat kaya, tapi banyak orang — terutama generasi muda — hanya mengenal wilayah asal mereka sendiri secara mendalam.
- Media pembelajaran tentang keberagaman Indonesia umumnya bersifat pasif (buku teks, hafalan), sehingga kurang menarik dan mudah dilupakan.
- Dibutuhkan format belajar yang interaktif, personal, terasa seperti "menjelajah" alih-alih "menghafal", dan punya insentif untuk kembali lagi (return value).

## 3. Tujuan Produk

1. Menghadirkan pengalaman belajar tentang Indonesia yang interaktif lewat eksplorasi peta dan cerita bercabang.
2. Mendorong rasa ingin tahu dan kebanggaan terhadap keberagaman budaya Indonesia.
3. Menciptakan pengalaman yang *shareable* agar tersebar secara organik (word of mouth, media sosial).
4. Membangun fondasi produk yang bisa berkembang menjadi platform pembelajaran Indonesia yang lebih luas (sejarah, budaya, kuliner, bahasa, alam, pendidikan sekolah).

## 4. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Pelajar (primer)** | SMP–SMA & mahasiswa, 13–24 tahun, tertarik budaya/sejarah Indonesia | Belajar yang menyenangkan, bukan menggurui; ada rasa pencapaian |
| **Pendidik (sekunder)** | Guru yang mencari media ajar interaktif pelengkap kurikulum | Konten akurat, mudah diarahkan ke siswa, ringkas |
| **Wisatawan domestik/asing (tersier)** | Ingin mengenal budaya lokal sebelum atau saat berkunjung ke suatu daerah | Info budaya ringkas, kredibel, dan menarik secara visual |

## 5. Value Proposition

**Edukasi + eksplorasi + gamifikasi + storytelling + shareable experience** — dikemas dalam satu perjalanan singkat yang terasa personal, bukan seperti ensiklopedia digital.

## 6. Core Experience Loop

**Explore → Story → Choose → Discover → Collect → Continue**

| Tahap | Trigger | Aksi Pengguna | Output |
|---|---|---|---|
| Explore | Buka halaman peta | Pilih satu provinsi di peta Indonesia | Cerita provinsi terpilih terbuka |
| Story | Wilayah terpilih | Membaca/mengikuti cerita singkat (sejarah/budaya/tokoh/kuliner/bahasa) | Konteks & keterlibatan emosional |
| Choose | Titik keputusan dalam cerita | Memilih opsi (2–3 pilihan) | Cerita bercabang ke arah berbeda |
| Discover | Akhir cabang cerita | — | Fakta/insight budaya ditampilkan |
| Collect | Cerita selesai | — | Collectible baru masuk Nusa Passport |
| Continue | Kembali ke peta | Pilih provinsi lain / buka Passport | Loop berulang, progres bertambah |

## 7. Ruang Lingkup MVP

### 7.1 Fitur MVP

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Interactive Map Indonesia | Peta dengan provinsi yang tersedia, sedang dijelajahi, atau selesai; tidak ada urutan unlock wajib | Must |
| Interactive Story | Cerita singkat per provinsi dengan teks + visual pendukung | Must |
| Choice-based learning | Percabangan cerita berdasarkan pilihan pengguna (2–3 opsi per titik keputusan) | Must |
| Progress Tracking | Menyimpan provinsi yang sudah dijelajah, cerita selesai, collectible didapat | Must |
| Nusa Passport | Dashboard progres: provinsi dijelajahi, cerita ditemukan, collectible, level explorer | Must |
| Collectibles | Satu item koleksi (stempel/artefak/resep/frasa bahasa) per provinsi | Must |
| Shareable Explorer Card | Kartu ringkasan progres yang dibagikan lewat Web Share API dengan fallback unduh gambar | Should |
| Suara Nusantara | Pertanyaan reflektif di akhir perjalanan; jawaban anonim masuk wall setelah review moderator | Should |
| AI (opsional) | Moderasi Suara Nusantara, rekomendasi journey, atau personalisasi ringan | Could |

### 7.2 Tahapan MVP

| Tahap | Tujuan | Cakupan |
|---|---|---|
| **Tahap 1 — Demo internal** | Membuktikan alur dapat didemonstrasikan utuh | 2 provinsi (Aceh dan Bali), story, choice, discovery, collectible, progress anonymous melalui FARM, dan Passport ringan. Tidak ada Explorer Card atau wall komunitas |
| **Gate user test** | Smoke test keterpahaman umum sebelum ekspansi | 8 pengguna usia 13–24 pada ponsel masing-masing; 4 menguji Aceh dan 4 Bali. Minimal 5/8 mencapai collectible tanpa arahan, dengan minimal 2/4 berhasil pada tiap provinsi. Sampel campuran ini tidak digunakan untuk menyimpulkan kecocokan persona tertentu |
| **Tahap 2A — Produk inti** | Melengkapi pengalaman eksplorasi | 8 provinsi, Passport penuh, milestone explorer 2/4/6/8, dan Explorer Card |
| **Tahap 2B — Komunitas** | Menambahkan refleksi publik dengan aman | Suara Nusantara anonim, pre-moderation, dan moderation queue internal yang dilindungi email magic link |

Tahap 1 adalah demo internal, bukan validasi KPI agregat. Target completion diukur setelah tersedia pengumpulan data yang sesuai.

### 7.3 Provinsi MVP (8 Provinsi)

Daftar berikut adalah kandidat awal. Selain Aceh dan Bali untuk Tahap 1, provinsi dan fokus naratif harus dikonfirmasi melalui riset konten sebelum masuk Tahap 2A.

| # | Wilayah | Pulau | Fokus Naratif Awal |
|---|---|---|---|
| 1 | Aceh | Sumatra | Sejarah, budaya Islam (Serambi Mekkah) |
| 2 | Sumatera Barat | Sumatra | Budaya Minangkabau, kuliner (rendang) |
| 3 | DKI Jakarta | Jawa | Budaya Betawi, sejarah ibu kota |
| 4 | Yogyakarta | Jawa | Keraton, budaya Jawa klasik, tokoh |
| 5 | Bali | Bali | Hindu Bali, seni & upacara adat |
| 6 | Kalimantan Barat | Kalimantan | Budaya Dayak, kehidupan sungai |
| 7 | Sulawesi Selatan | Sulawesi | Toraja & Bugis, rumah adat, budaya maritim |
| 8 | Papua | Papua | Cerita lokal yang spesifik di Provinsi Papua; fokus final ditentukan lewat riset dan review ahli/lokal |

Semua provinsi yang tersedia dapat dipilih sejak awal. Status peta hanya **belum dimulai**, **sedang berlangsung**, dan **selesai**.

### 7.4 Di Luar Ruang Lingkup MVP

- Seluruh 38 provinsi (baru 8 provinsi untuk MVP, prioritaskan kualitas dulu)
- Login sosial penuh / sistem akun pengguna kompleks (anonymous session dibuat FastAPI tanpa registrasi)
- AI sebagai fitur inti (tetap opsional, bukan blocker)
- Integrasi kurikulum sekolah formal / dashboard guru
- Mode multiplayer/kolaboratif
- Mode offline / PWA penuh

## 8. Alur Pengguna Utama (User Flow)

1. Pengguna membuka halaman utama → melihat peta Indonesia dengan 2 provinsi pada Tahap 1 atau 8 provinsi mulai Tahap 2A.
2. Pengguna memilih satu provinsi (mis. Bali) → masuk ke halaman intro cerita provinsi tersebut.
3. Pengguna mengikuti cerita, sampai ke titik keputusan → memilih salah satu opsi.
4. Cerita berlanjut sesuai pilihan → berakhir di sebuah "Discovery" (fakta budaya/tokoh/kuliner/bahasa) yang berbeda beserta sumbernya.
5. Pengguna menerima satu collectible milik provinsi tersebut, terlepas dari pilihan → notifikasi singkat + animasi.
6. Pengguna kembali ke peta → provinsi tersebut berstatus "selesai", collectible masuk Nusa Passport.
7. Pengguna mengulangi langkah 2–6 untuk provinsi lain.
8. Pada Tahap 2B, setelah menyelesaikan minimal satu provinsi, pengguna diarahkan ke **Suara Nusantara**: menjawab pertanyaan reflektif ("Indonesia seperti apa yang ingin kamu lihat di masa depan?").
9. Jawaban disimpan anonim tanpa nama, sekolah, lokasi, atau kontak; jawaban baru masuk wall setelah disetujui moderator.
10. Pengguna dapat membuka **Nusa Passport** kapan saja untuk melihat progres, dan membagikan **Explorer Card**.

## 9. Kebutuhan Konten

- Setiap provinsi membutuhkan minimal 1 cerita utama dengan 1 titik percabangan. Tahap 1 memakai tepat 2 pilihan; tahap berikutnya boleh memakai 2–3 pilihan.
- Setiap cerita harus memuat minimal 1 fakta terverifikasi (sejarah/budaya/tokoh/kuliner/bahasa).
- Setiap discovery menampilkan sumber ringkas yang dapat diakses pengguna.
- Konten harus diriset dari sumber yang kredibel, ditulis dengan nada hangat dan menghormati keberagaman budaya, menghindari generalisasi atau stereotip, serta disetujui reviewer ahli/lokal yang relevan sebelum terbit.
- Setiap provinsi menghasilkan tepat 1 collectible unik.

## 10. Metrik Keberhasilan (KPI)

| Metrik | Target Awal (indikatif) |
|---|---|
| Completion rate per cerita provinsi | > 60% pengguna yang mulai, menyelesaikan cerita |
| Rata-rata provinsi dijelajahi per pengguna | ≥ 3 dari 8 provinsi |
| Jumlah submission Suara Nusantara | Dilacak sebagai indikator engagement emosional |
| Explorer Card share rate | > 10% pengguna yang menyelesaikan ≥1 provinsi membagikan kartu |
| Retention (kembali dalam 7 hari) | Dilacak sebagai baseline, target ditentukan setelah data awal |

KPI agregat tidak berlaku untuk demo internal Tahap 1. Gate Tahap 1 hanya smoke test terfasilitasi: 4 peserta menguji Aceh dan 4 Bali pada ponsel masing-masing; minimal 5/8 mencapai collectible tanpa arahan, dengan minimal 2/4 berhasil pada tiap provinsi.

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Akurasi konten sejarah/budaya kurang tepat | Riset dari sumber terpercaya, proses review konten, cantumkan disclaimer bila perlu |
| Representasi budaya yang menyinggung/stereotip | Review sensitivitas budaya sebelum publish, hindari generalisasi |
| Scope merambat dari 8 provinsi ke lebih banyak | Disiplin MVP — kualitas 8 provinsi dulu sebelum ekspansi |
| Cerita bercabang jadi terlalu kompleks untuk MVP | Batasi 1 titik keputusan utama per cerita di MVP |
| Fitur AI menunda rilis MVP | AI tetap opsional/non-blocking untuk peluncuran awal |

## 12. Asumsi & Ketergantungan

- Platform awal adalah **web app** (bukan native mobile), dioptimalkan mobile-first.
- Bahasa utama aplikasi adalah **Bahasa Indonesia**.
- Progress tracking tidak mewajibkan pendaftaran akun penuh: FastAPI membuat anonymous session dengan masa aktif 30 hari sejak aktivitas terakhir.
- Aset visual (ilustrasi, ikon peta) dianggap sebagai kebutuhan produksi terpisah, tidak dibahas detail di PRD ini.

## 13. Roadmap Rilis (Tentatif)

| Fase | Fokus |
|---|---|
| Tahap 1 | Demo internal core loop untuk Aceh dan Bali dengan FARM, anonymous progress, dan Passport ringan |
| Gate | User test 8 peserta campuran usia 13–24 pada ponsel masing-masing; 4 Aceh dan 4 Bali; minimal 5/8 selesai tanpa arahan dan minimal 2/4 berhasil per provinsi |
| Tahap 2A | Lengkapi 8 provinsi, Passport penuh, dan Explorer Card |
| Tahap 2B | Suara Nusantara anonim dengan pre-moderation dan moderation queue terbatas |
| Potensi lanjutan | Perluasan provinsi, integrasi pendidikan sekolah, dan AI personalisasi |

## 14. Lampiran: Daftar Istilah

| Istilah | Arti |
|---|---|
| Nusa Passport | Dashboard progres personal pengguna |
| Collectible | Item koleksi digital yang didapat setelah menyelesaikan cerita provinsi |
| Explorer Card | Kartu ringkasan progres yang bisa dibagikan |
| Suara Nusantara | Fitur refleksi akhir perjalanan + wall komunitas |
