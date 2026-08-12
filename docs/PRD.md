# Product Requirements Document (PRD)
## Jelajah Nusa

| | |
|---|---|
| **Versi** | 1.0 — Draft |
| **Tanggal** | 12 Agustus 2026 |
| **Status** | Draft untuk direview |
| **Dokumen terkait** | SRS-Jelajah-Nusa.md, DESIGN-Jelajah-Nusa.md, AGENTS.md |

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
| Explore | Buka halaman peta | Pilih satu wilayah di peta Indonesia | Wilayah terpilih terbuka |
| Story | Wilayah terpilih | Membaca/mengikuti cerita singkat (sejarah/budaya/tokoh/kuliner/bahasa) | Konteks & keterlibatan emosional |
| Choose | Titik keputusan dalam cerita | Memilih opsi (2–3 pilihan) | Cerita bercabang ke arah berbeda |
| Discover | Akhir cabang cerita | — | Fakta/insight budaya ditampilkan |
| Collect | Cerita selesai | — | Collectible baru masuk Nusa Passport |
| Continue | Kembali ke peta | Pilih wilayah lain / buka Passport | Loop berulang, progres bertambah |

## 7. Ruang Lingkup MVP

### 7.1 Fitur MVP

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Interactive Map Indonesia | Peta dengan 8 wilayah yang bisa diklik, status locked/unlocked/completed | Must |
| Interactive Story | Cerita singkat per wilayah dengan teks + visual pendukung | Must |
| Choice-based learning | Percabangan cerita berdasarkan pilihan pengguna (2–3 opsi per titik keputusan) | Must |
| Progress Tracking | Menyimpan wilayah yang sudah dijelajah, cerita selesai, collectible didapat | Must |
| Nusa Passport | Dashboard progres: wilayah dijelajahi, cerita ditemukan, collectible, level explorer | Must |
| Collectibles | Item koleksi (stempel/artefak/resep/frasa bahasa) per wilayah | Must |
| Shareable Explorer Card | Kartu ringkasan progres yang bisa dibagikan (gambar/link) | Should |
| Suara Nusantara | Pertanyaan reflektif di akhir perjalanan, jawaban masuk wall komunitas | Should |
| AI (opsional) | Moderasi Suara Nusantara, rekomendasi journey, atau personalisasi ringan | Could |

### 7.2 Wilayah MVP (8 Wilayah)

> Placeholder — silakan sesuaikan dengan riset konten final.

| # | Wilayah | Pulau | Fokus Naratif Awal |
|---|---|---|---|
| 1 | Aceh | Sumatra | Sejarah, budaya Islam (Serambi Mekkah) |
| 2 | Sumatera Barat | Sumatra | Budaya Minangkabau, kuliner (rendang) |
| 3 | DKI Jakarta | Jawa | Budaya Betawi, sejarah ibu kota |
| 4 | Yogyakarta | Jawa | Keraton, budaya Jawa klasik, tokoh |
| 5 | Bali | Bali | Hindu Bali, seni & upacara adat |
| 6 | Kalimantan Barat | Kalimantan | Budaya Dayak, kehidupan sungai |
| 7 | Sulawesi Selatan | Sulawesi | Toraja & Bugis, rumah adat, budaya maritim |
| 8 | Papua | Papua | Budaya asli, keberagaman suku, alam |

### 7.3 Di Luar Ruang Lingkup MVP

- Seluruh 38 provinsi (baru 8 wilayah untuk MVP, prioritaskan kualitas dulu)
- Login sosial penuh / sistem akun kompleks (MVP cukup progress berbasis sesi/anonymous auth)
- AI sebagai fitur inti (tetap opsional, bukan blocker)
- Integrasi kurikulum sekolah formal / dashboard guru
- Mode multiplayer/kolaboratif
- Mode offline / PWA penuh

## 8. Alur Pengguna Utama (User Flow)

1. Pengguna membuka halaman utama → melihat peta Indonesia dengan 8 wilayah.
2. Pengguna memilih satu wilayah (mis. Bali) → masuk ke halaman intro cerita wilayah tersebut.
3. Pengguna mengikuti cerita, sampai ke titik keputusan → memilih salah satu opsi.
4. Cerita berlanjut sesuai pilihan → berakhir di sebuah "Discovery" (fakta budaya/tokoh/kuliner/bahasa).
5. Pengguna menerima collectible baru → notifikasi singkat + animasi.
6. Pengguna kembali ke peta → wilayah tersebut berstatus "completed", collectible masuk Nusa Passport.
7. Pengguna mengulangi langkah 2–6 untuk wilayah lain.
8. Setelah menyelesaikan wilayah (minimal satu, idealnya beberapa), pengguna diarahkan ke **Suara Nusantara**: menjawab pertanyaan reflektif ("Indonesia seperti apa yang ingin kamu lihat di masa depan?").
9. Jawaban masuk ke wall komunitas (dengan moderasi dasar).
10. Pengguna dapat membuka **Nusa Passport** kapan saja untuk melihat progres, dan membagikan **Explorer Card**.

## 9. Kebutuhan Konten

- Setiap wilayah membutuhkan minimal 1 cerita utama dengan 1 titik percabangan (2–3 pilihan).
- Setiap cerita harus memuat minimal 1 fakta terverifikasi (sejarah/budaya/tokoh/kuliner/bahasa).
- Konten harus diriset dari sumber yang kredibel, ditulis dengan nada hangat dan menghormati keberagaman budaya, menghindari generalisasi atau stereotip.
- Setiap wilayah menghasilkan minimal 1 collectible unik.

## 10. Metrik Keberhasilan (KPI)

| Metrik | Target Awal (indikatif) |
|---|---|
| Completion rate per cerita wilayah | > 60% pengguna yang mulai, menyelesaikan cerita |
| Rata-rata wilayah dijelajahi per pengguna | ≥ 3 dari 8 wilayah |
| Jumlah submission Suara Nusantara | Dilacak sebagai indikator engagement emosional |
| Explorer Card share rate | > 10% pengguna yang menyelesaikan ≥1 wilayah membagikan kartu |
| Retention (kembali dalam 7 hari) | Dilacak sebagai baseline, target ditentukan setelah data awal |

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Akurasi konten sejarah/budaya kurang tepat | Riset dari sumber terpercaya, proses review konten, cantumkan disclaimer bila perlu |
| Representasi budaya yang menyinggung/stereotip | Review sensitivitas budaya sebelum publish, hindari generalisasi |
| Scope merambat dari 8 wilayah ke lebih banyak | Disiplin MVP — kualitas 8 wilayah dulu sebelum ekspansi |
| Cerita bercabang jadi terlalu kompleks untuk MVP | Batasi 1 titik keputusan utama per cerita di MVP |
| Fitur AI menunda rilis MVP | AI tetap opsional/non-blocking untuk peluncuran awal |

## 12. Asumsi & Ketergantungan

- Platform awal adalah **web app** (bukan native mobile), dioptimalkan mobile-first.
- Bahasa utama aplikasi adalah **Bahasa Indonesia**.
- Progress tracking MVP tidak mewajibkan pendaftaran akun penuh (bisa pakai sesi/anonymous auth agar tetap simple).
- Aset visual (ilustrasi, ikon peta) dianggap sebagai kebutuhan produksi terpisah, tidak dibahas detail di PRD ini.

## 13. Roadmap Rilis (Tentatif)

| Fase | Fokus |
|---|---|
| Fase 1 | Core loop (Explore → Story → Choose → Discover → Collect) untuk 2 wilayah pilot |
| Fase 2 | Lengkapi 8 wilayah MVP + Nusa Passport penuh |
| Fase 3 | Suara Nusantara + Explorer Card + polish visual & aksesibilitas |
| Fase 4 (potensi lanjutan) | Perluasan wilayah, integrasi pendidikan sekolah, AI personalisasi |

## 14. Lampiran: Daftar Istilah

| Istilah | Arti |
|---|---|
| Nusa Passport | Dashboard progres personal pengguna |
| Collectible | Item koleksi digital yang didapat setelah menyelesaikan cerita wilayah |
| Explorer Card | Kartu ringkasan progres yang bisa dibagikan |
| Suara Nusantara | Fitur refleksi akhir perjalanan + wall komunitas |
