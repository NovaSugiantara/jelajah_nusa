# DESIGN.md — Jelajah Nusa

Dokumen ini menjabarkan konsep desain, filosofi visual, dan struktur pengalaman pengguna dari aplikasi **Jelajah Nusa**.

---

## 1. Konsep Inti

Jelajah Nusa adalah aplikasi edukasi interaktif untuk mengenal Indonesia melalui eksplorasi peta, cerita, pilihan, dan koleksi. Pendekatan desainnya menggabungkan **narasi**, **permainan berbasis pilihan**, dan **koleksi visual** agar belajar tentang Indonesia terasa seperti sebuah perjalanan, bukan pelajaran.

**Tagline:** _Kenali Indonesia. Satu cerita, satu perjalanan._

**Value utama:** Edukasi + Eksplorasi + Gamification + Storytelling + Shareable Experience.

---

## 2. Alur Pengalaman (Core Loop)

```
Explore → Story → Choose → Discover → Collect → Continue
```

| Tahap        | Deskripsi                                                                     |
| ------------ | ----------------------------------------------------------------------------- |
| **Explore**  | Pengguna memilih provinsi di peta interaktif Indonesia                        |
| **Story**    | Menyajikan cerita singkat: sejarah, budaya, tokoh, kuliner, atau bahasa lokal |
| **Choose**   | Pengguna mengambil keputusan yang memengaruhi arah/hasil cerita               |
| **Discover** | Fakta/insight berbeda sesuai pilihan, lengkap dengan sumber ringkas            |
| **Collect**  | Collectible masuk ke Nusa Passport                                            |
| **Continue** | Pengguna lanjut ke provinsi berikutnya atau menutup sesi                      |

Loop ini dirancang untuk terasa ringan dan dapat diulang — pengguna bisa menjelajah satu provinsi dalam sesi singkat (2–5 menit), cocok untuk penggunaan kasual maupun eksploratif.

---

## 3. Struktur Fitur

### 3.1 Interactive Map

- Peta Indonesia sebagai hub utama navigasi
- Tahap 1 menampilkan Aceh dan Bali; Tahap 2A memperluas menjadi 8 provinsi
- Semua provinsi yang tersedia dapat dipilih sejak awal
- Status visual per provinsi: _belum dimulai_, _sedang berlangsung_, _selesai_

### 3.2 Interactive Story

- Format naratif ringan, berbasis teks + visual (ilustrasi/foto/motif daerah)
- Setiap cerita berpusat pada satu tema: sejarah, budaya, tokoh, kuliner, atau bahasa lokal
- Panjang cerita dijaga singkat agar tidak terasa seperti membaca buku pelajaran

### 3.3 Choice-Based Learning

- Pilihan di dalam cerita membuka jalur narasi dan Discovery yang berbeda
- Pilihan bersifat edukatif — bukan sekadar benar/salah, tapi merefleksikan sudut pandang budaya
- Semua pilihan tetap dapat diselesaikan dan menghasilkan collectible provinsi yang sama

### 3.4 Progress Tracking

- Melacak provinsi yang telah dijelajahi, cerita yang ditemukan, dan collectible yang terkumpul
- Progress ditampilkan di peta utama dan di Nusa Passport
- Tahap 1 menyimpan progress melalui anonymous session FastAPI dan MongoDB Atlas

### 3.5 Nusa Passport

Representasi visual dari perjalanan pengguna, berisi:

- Jumlah provinsi yang telah dijelajahi
- Daftar cerita yang ditemukan
- Collectible yang terkumpul
- Level explorer pada milestone 2, 4, 6, dan 8 provinsi

Metafora "paspor" dipilih untuk menegaskan tema perjalanan/eksplorasi, lengkap dengan elemen visual seperti stempel (stamp) di setiap provinsi yang selesai dijelajahi.

### 3.6 Collectibles

- Satu item visual unik per provinsi (motif, ikon budaya, kuliner, dsb.)
- Didapat setelah menyelesaikan cerita, terlepas dari pilihan yang diambil
- Mendorong motivasi "koleksi lengkap" (completionist drive)

### 3.7 Shareable Explorer Card

- Kartu ringkasan perjalanan pengguna yang dapat dibagikan ke media sosial
- Menampilkan level explorer, jumlah provinsi, dan highlight collectible
- Dibagikan lewat Web Share API dengan fallback unduh gambar; tidak membutuhkan link publik

### 3.8 Suara Nusantara

- Di akhir perjalanan, pengguna menjawab pertanyaan reflektif, misalnya:
  _"Indonesia seperti apa yang ingin kamu lihat di masa depan?"_
- Tahap 2B menyimpan jawaban tanpa identitas profil dan menampilkannya di **wall komunitas** hanya setelah disetujui moderator
- Moderation queue terbatas pada preview, approve, dan reject; moderator masuk lewat email magic link

### 3.9 AI (Opsional / Non-Core)

AI **bukan** fitur utama, hanya pendukung:

- **Moderasi** — menyaring konten yang masuk ke wall Suara Nusantara
- **Rekomendasi journey** — menyarankan provinsi berikutnya berdasarkan pola eksplorasi
- **Personalisasi** — menyesuaikan gaya cerita atau urutan konten

Prinsip desain: AI harus tidak terlihat (invisible), tidak boleh menggantikan pengalaman naratif utama.

---

## 4. Visual Identity

### 4.1 Arah Gaya

**Modern Indonesian editorial** dengan nuansa eksplorasi — memadukan estetika majalah/dokumenter dengan elemen playful dari gamifikasi.

### 4.2 Palet Warna

- **Merah & Putih** sebagai warna accent utama (mengacu identitas nasional)
- Warna netral (krem, coklat muda, off-white) sebagai basis, terinspirasi kertas arsip/paspor lama
- Warna aksen sekunder dapat bervariasi per provinsi untuk membedakan identitas visual tiap perjalanan

### 4.3 Elemen Visual Kunci

- **Peta Indonesia** sebagai pusat visual & navigasi utama
- **Passport** — struktur UI utama untuk progress & koleksi
- **Stamp (stempel)** — penanda pencapaian per provinsi, memberi rasa "otentik" seperti paspor sungguhan
- **Arsip** — tekstur kertas, garis border tipis, elemen tipografi bergaya dokumen resmi/vintage
- **Collectible cards** — kartu koleksi bergaya ilustrasi flat/semi-realis dengan motif budaya lokal

### 4.4 Tipografi (arah rekomendasi)

- Heading: tipografi editorial dengan karakter kuat (serif/display) untuk kesan "cerita" dan "arsip"
- Body: sans-serif yang bersih dan mudah dibaca untuk teks narasi
- Elemen "stempel"/badge dapat menggunakan huruf kapital dengan letter-spacing lebar untuk kesan resmi

### 4.5 Nada (Tone)

- Hangat, membanggakan, edukatif tanpa menggurui
- Bahasa naratif yang personal ("kamu") agar terasa seperti perjalanan pribadi

---

## 5. Cakupan MVP

Tahap 1 memoles **Aceh dan Bali** sebagai demo internal. Smoke test memakai 8 peserta pada ponsel masing-masing: 4 menguji Aceh dan 4 Bali. Tahap 2A dimulai setelah minimal 5/8 peserta memperoleh collectible tanpa arahan, dengan minimal 2/4 berhasil pada tiap provinsi. Tahap 2A memperluas pengalaman menjadi **8 provinsi**; Tahap 2B baru menambahkan Suara Nusantara dan moderation queue.

**Alasan strategis:**

- Menjaga kualitas cerita & desain tetap tinggi per provinsi
- Memungkinkan iterasi cepat berdasarkan feedback sebelum scaling
- Validasi core loop (Explore → Story → Choose → Discover → Collect → Continue) sebelum ekspansi konten

---

## 6. Roadmap / Potensi Lanjutan

Setelah MVP tervalidasi, Jelajah Nusa berpotensi berkembang menjadi platform pembelajaran Indonesia yang lebih luas, mencakup kategori seperti:

- 📜 Sejarah
- 🎭 Budaya
- 🍜 Kuliner
- 🗣️ Bahasa daerah
- 🌿 Alam & lingkungan
- 🏫 Pendidikan sekolah (kurikulum pendukung)

Ekspansi ini dapat dilakukan secara modular — menambah provinsi dan tema cerita tanpa mengubah core loop utama.

---

## 7. Prinsip Desain Ringkas

1. **Cerita dulu, gamifikasi kedua** — mekanik game mendukung narasi, bukan sebaliknya
2. **Kedalaman lewat kesederhanaan** — 8 provinsi yang matang lebih baik dari cakupan nasional yang dangkal
3. **Koleksi sebagai motivasi**, bukan sebagai tujuan akhir
4. **AI sebagai pendukung senyap**, bukan fitur yang dipamerkan
5. **Visual sebagai identitas nasional** — merah putih, peta, dan paspor sebagai bahasa desain yang konsisten
