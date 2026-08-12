"""Structured seed content for Jelajah Nusa.

Content is kept as structured data (not embedded in UI), per product guardrails.
Each region has: metadata, an accent identity, one story graph (scenes -> one
decision with 2 choices -> two sourced discoveries) and exactly one collectible.

The raw literals below carry a legacy shape (`source` label string, plain
`image` URLs). `normalize_region()` converts them into the governance contract:
structured `sources` with URLs, `ReviewedAsset` images with alt text, and
`review.status` metadata. Every region is seeded as `draft` until a relevant
expert/local reviewer approves it.
"""

import copy

# Domain-level landing pages for the institutions cited in story sources.
SOURCE_BASE_URLS = {
    "kemdikbud": "https://www.kemdikbud.go.id",
    "badan bahasa": "https://badanbahasa.kemdikbud.go.id",
    "warisan budaya": "https://warisanbudaya.kemdikbud.go.id",
    "unesco": "https://whc.unesco.org",
    "bnpb": "https://bnpb.go.id",
    "cnn": "https://edition.cnn.com/travel",
    "dinas kebudayaan dki jakarta": "https://jakarta.go.id",
    "kementerian pupr": "https://pu.go.id",
    "conservation international": "https://www.conservation.org",
}


def _source_url(label: str):
    low = label.lower()
    for key, url in SOURCE_BASE_URLS.items():
        if key in low:
            return url
    return None


def normalize_region(r: dict) -> dict:
    """Return a copy of the region in the reviewed-asset/content contract."""
    reg = copy.deepcopy(r)
    for n in reg["story"]["nodes"].values():
        if n.get("image"):
            n["image"] = {
                "src": n["image"],
                "alt": f"Ilustrasi perjalanan di {reg['name']}",
                "review": {"status": "draft"},
            }
        if n["type"] == "discovery":
            label = n.pop("source", "").replace("Sumber: ", "").strip()
            n["sources"] = [{"label": label, "url": _source_url(label)}]
            n["review"] = {"status": "draft"}
    image = reg.pop("image")
    reg["thumbnail"] = {
        "src": image,
        "alt": f"Kartu wilayah {reg['name']}",
        "review": {"status": "draft"},
    }
    reg["collectible"]["image"] = {
        "src": image,
        "alt": f"Collectible {reg['collectible']['name']}",
        "review": {"status": "draft"},
    }
    reg["review"] = {"status": "draft"}
    return reg


def is_approved(reg: dict) -> bool:
    """True when every discovery, thumbnail, and collectible is approved."""
    checks = [reg.get("review", {}).get("status")]
    checks.append(reg.get("thumbnail", {}).get("review", {}).get("status"))
    checks.append(reg.get("collectible", {}).get("image", {}).get("review", {}).get("status"))
    for n in reg.get("story", {}).get("nodes", {}).values():
        if n.get("review"):
            checks.append(n["review"].get("status"))
        if n.get("image"):
            checks.append(n["image"].get("review", {}).get("status"))
    return all(c == "approved" for c in checks if c)


REGIONS = [
    {
        "slug": "aceh",
        "name": "Aceh",
        "island": "Sumatra",
        "category": "Sejarah & Budaya Islam",
        "accent": "#0E7C5A",
        "tagline": "Serambi Mekkah di ujung barat Nusantara",
        "blurb": "Tanah para sultan, saudagar, dan ketangguhan. Aceh menyimpan jejak Islam tertua di Nusantara.",
        "image": "https://images.unsplash.com/photo-1595319087991-c6d00407bf6f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 6, "y": 26},
        "collectible": {
            "id": "col-aceh",
            "name": "Rencong Aceh",
            "type": "Artefak",
            "icon": "sword",
            "description": "Senjata tradisional berbentuk huruf Arab 'Bismillah' — lambang keberanian dan keimanan orang Aceh.",
        },
        "story": {
            "title": "Bayang-bayang Serambi Mekkah",
            "category": "Sejarah",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Kamu tiba di Banda Aceh saat azan Magrib berkumandang. Di depanmu berdiri Masjid Raya Baiturrahman, kubah hitamnya megah memantulkan langit jingga. Seorang kakek penjual kopi tersenyum, 'Selamat datang di Serambi Mekkah, Nak.'",
                    "image": "https://images.unsplash.com/photo-1595319087991-c6d00407bf6f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Sambil menyeruput kopi sanger yang legit, kakek bercerita bahwa Aceh dulu adalah kesultanan besar yang disegani hingga ke Turki Utsmani. 'Tapi tanah ini juga pernah diuji gelombang raksasa,' katanya pelan sambil menatap masjid.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Cerita mana yang ingin kamu dalami?",
                    "choices": [
                        {"id": "c1", "label": "Kejayaan Kesultanan Aceh", "next": "e1"},
                        {"id": "c2", "label": "Ketangguhan setelah tsunami 2004", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Kakek berkisah tentang Sultan Iskandar Muda (1607–1636), masa puncak Aceh sebagai kekuatan maritim dan pusat ilmu Islam di Asia Tenggara.",
                    "fact": "Pada abad ke-17, Kesultanan Aceh Darussalam menjalin hubungan diplomatik dengan Kekaisaran Utsmani (Ottoman) dan menjadi salah satu pusat perdagangan lada terbesar dunia.",
                    "source": "Sumber: Ensiklopedia Sejarah Indonesia, Kemdikbud",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Kakek menunjuk masjid. 'Saat tsunami 2004 meluluhlantakkan kota, masjid ini tetap berdiri. Orang-orang berlindung di sini.' Semangat gotong royong membangun Aceh kembali.",
                    "fact": "Gempa dan tsunami Samudra Hindia 26 Desember 2004 berpusat di lepas pantai Aceh. Masjid Raya Baiturrahman menjadi simbol harapan karena tetap berdiri di tengah kehancuran.",
                    "source": "Sumber: BNPB & UNESCO Tsunami Memorial",
                },
            },
        },
    },
    {
        "slug": "sumatera-barat",
        "name": "Sumatera Barat",
        "island": "Sumatra",
        "category": "Budaya Minangkabau & Kuliner",
        "accent": "#C1272D",
        "tagline": "Tanah Minang, rumah gadang dan rendang",
        "blurb": "Negeri matrilineal yang menjunjung adat, ilmu, dan tradisi merantau — serta kuliner paling lezat sedunia.",
        "image": "https://images.unsplash.com/photo-1666239308347-4292ea2ff777?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 12, "y": 44},
        "collectible": {
            "id": "col-sumbar",
            "name": "Sepiring Rendang",
            "type": "Kuliner",
            "icon": "utensils",
            "description": "Masakan daging berbumbu rempah yang dimasak berjam-jam — pernah dinobatkan sebagai makanan terlezat di dunia.",
        },
        "story": {
            "title": "Adat Basandi, Rasa Basamo",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Di kaki Gunung Marapi, kamu berdiri di depan Rumah Gadang. Atapnya melengkung runcing seperti tanduk kerbau, gonjong menantang langit. Seorang Amai (ibu) menyambutmu, 'Masuklah, di rumah ini perempuan adalah pemilik adat.'",
                    "image": "https://images.unsplash.com/photo-1666239308347-4292ea2ff777?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Aroma rempah menguar dari dapur. Amai menjelaskan filosofi Minang: 'Adat basandi syarak, syarak basandi Kitabullah.' Ada dua hal yang membuat Minangkabau termasyhur — cara hidupnya dan masakannya.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu penasaran pada hal apa?",
                    "choices": [
                        {"id": "c1", "label": "Filosofi merantau orang Minang", "next": "e1"},
                        {"id": "c2", "label": "Rahasia di balik rendang", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Amai tersenyum, 'Anak lelaki kami merantau bukan untuk meninggalkan kampung, tapi untuk membawa nama baiknya jauh-jauh.'",
                    "fact": "Masyarakat Minangkabau menganut sistem kekerabatan matrilineal terbesar di dunia — garis keturunan dan harta pusaka diwariskan melalui pihak ibu. Tradisi merantau menjadi bagian penting pendewasaan.",
                    "source": "Sumber: Warisan Budaya Takbenda Indonesia, Kemdikbud",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Di dapur, Amai mengaduk rendang perlahan. 'Memasak rendang itu latihan sabar. Berjam-jam, sampai bumbunya kering dan awet berhari-hari.'",
                    "fact": "Rendang dimasak lama dengan santan dan rempah hingga kering, membuatnya tahan lama tanpa pengawet — cocok sebagai bekal merantau. Pada 2011 rendang menempati posisi pertama daftar '50 Makanan Terlezat Dunia' versi CNN.",
                    "source": "Sumber: CNN Travel — World's 50 Best Foods",
                },
            },
        },
    },
    {
        "slug": "dki-jakarta",
        "name": "DKI Jakarta",
        "island": "Jawa",
        "category": "Budaya Betawi & Sejarah Ibu Kota",
        "accent": "#E08A1E",
        "tagline": "Kota tua yang tak pernah tidur",
        "blurb": "Dari pelabuhan Sunda Kelapa hingga gedung pencakar langit, Jakarta adalah pertemuan seribu budaya.",
        "image": "https://images.unsplash.com/photo-1695444297714-f418f5a7507e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 40, "y": 66},
        "collectible": {
            "id": "col-jakarta",
            "name": "Ondel-ondel Mini",
            "type": "Ikon Budaya",
            "icon": "drama",
            "description": "Boneka raksasa khas Betawi yang dulu dipercaya sebagai penolak bala, kini ikon perayaan kota.",
        },
        "story": {
            "title": "Denyut Kota Tua",
            "category": "Sejarah",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Kamu menyusuri Kota Tua saat sore. Bangunan putih bergaya Eropa berdiri di seberang alun-alun batu. Sepeda ontel warna-warni disewakan, dan di kejauhan terdengar tanjidor. 'Ini jantung lama Jakarta,' kata seorang abang penjaja kerak telor.",
                    "image": "https://images.unsplash.com/photo-1695444297714-f418f5a7507e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Tiba-tiba iring-iringan ondel-ondel lewat, dua boneka raksasa menari diiringi musik. Abang kerak telor menjelaskan, 'Jakarta itu campuran. Betawi asli, tapi dibentuk pedagang dari mana-mana.'",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Mana yang menarik hatimu?",
                    "choices": [
                        {"id": "c1", "label": "Ondel-ondel & seni Betawi", "next": "e1"},
                        {"id": "c2", "label": "Sejarah pelabuhan Sunda Kelapa", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Abang bercerita bahwa ondel-ondel dulu bukan sekadar hiburan, melainkan penjaga kampung dari roh jahat.",
                    "fact": "Ondel-ondel adalah boneka pertunjukan raksasa khas Betawi setinggi ±2,5 meter. Awalnya berfungsi sebagai penolak bala, kini menjadi ikon budaya Jakarta yang tampil di berbagai perayaan.",
                    "source": "Sumber: Dinas Kebudayaan DKI Jakarta",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Abang menunjuk ke arah utara. 'Dulu di sana ada pelabuhan Sunda Kelapa. Dari situlah kota ini lahir dan berganti-ganti nama.'",
                    "fact": "Jakarta bermula dari pelabuhan Sunda Kelapa. Setelah direbut pada 1527, kota ini dinamai Jayakarta, lalu Batavia pada masa VOC, dan akhirnya kembali menjadi Jakarta pada 1942.",
                    "source": "Sumber: Ensiklopedia Sejarah Indonesia, Kemdikbud",
                },
            },
        },
    },
    {
        "slug": "yogyakarta",
        "name": "Yogyakarta",
        "island": "Jawa",
        "category": "Keraton & Budaya Jawa Klasik",
        "accent": "#8A6D3B",
        "tagline": "Kota gudeg, keraton, dan filosofi",
        "blurb": "Di antara Gunung Merapi dan Laut Selatan, Yogyakarta menjaga adat Jawa dan semangat perjuangan.",
        "image": "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 46, "y": 70},
        "collectible": {
            "id": "col-yogya",
            "name": "Kain Batik Parang",
            "type": "Artefak",
            "icon": "shirt",
            "description": "Motif batik tertua bermakna kesinambungan dan pantang menyerah, dulu hanya boleh dipakai keluarga keraton.",
        },
        "story": {
            "title": "Sumbu Filosofi",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Kamu berjalan di halaman Keraton Yogyakarta. Abdi dalem berpakaian lurik melangkah pelan dan hening. Udara terasa khidmat. 'Di sinilah budaya Jawa dijaga hidup-hidup,' bisik seorang pemandu.",
                    "image": "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Pemandu menunjuk garis lurus dari Gunung Merapi, melewati Tugu, keraton, hingga Laut Selatan. 'Kota ini dibangun dengan filosofi. Semua punya makna.' Ada dua warisan yang ingin ia tunjukkan.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu ingin memahami yang mana?",
                    "choices": [
                        {"id": "c1", "label": "Sumbu Filosofi kota", "next": "e1"},
                        {"id": "c2", "label": "Batik & seni keraton", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Pemandu menjelaskan bahwa garis imajiner itu melambangkan perjalanan manusia — dari lahir hingga kembali kepada Sang Pencipta.",
                    "fact": "Sumbu Filosofi Yogyakarta — garis dari Gunung Merapi hingga Laut Selatan yang melintasi Keraton — diakui sebagai Warisan Dunia UNESCO pada 2023 karena tata kotanya yang sarat filosofi Jawa.",
                    "source": "Sumber: UNESCO World Heritage List (2023)",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Di ruang lain, seorang pembatik menorehkan malam panas dengan canting. 'Motif Parang ini,' katanya, 'dulu larangan — hanya untuk keluarga raja.'",
                    "fact": "Batik Indonesia diakui UNESCO sebagai Warisan Budaya Takbenda pada 2009. Motif Parang termasuk motif tertua dan bermakna kesinambungan serta semangat pantang menyerah.",
                    "source": "Sumber: UNESCO Intangible Cultural Heritage (2009)",
                },
            },
        },
    },
    {
        "slug": "bali",
        "name": "Bali",
        "island": "Bali",
        "category": "Hindu Bali, Seni & Upacara",
        "accent": "#7A3FA0",
        "tagline": "Pulau Dewata, harmoni yang hidup",
        "blurb": "Di Bali, seni dan spiritualitas menyatu dalam keseharian — dari canang di pagi hari hingga tari di malam hari.",
        "image": "https://images.unsplash.com/photo-1542897643-cfccd88c7127?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 52, "y": 72},
        "collectible": {
            "id": "col-bali",
            "name": "Canang Sari",
            "type": "Ikon Budaya",
            "icon": "flower",
            "description": "Persembahan kecil berisi bunga dan janur, wujud syukur harian masyarakat Hindu Bali.",
        },
        "story": {
            "title": "Harmoni Pulau Dewata",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Pagi di Bali, kamu melihat perempuan berkebaya membawa sesajen di atas kepala menuju pura. Wangi dupa dan bunga kamboja memenuhi udara. Iringan gamelan mengalun dari kejauhan.",
                    "image": "https://images.unsplash.com/photo-1542897643-cfccd88c7127?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Seorang pemangku menyambutmu di gerbang pura. 'Di Bali, hidup adalah menjaga keseimbangan,' katanya. Ia ingin menunjukkan dua wajah Bali: keyakinannya dan seninya.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu ingin mengenal yang mana?",
                    "choices": [
                        {"id": "c1", "label": "Filosofi Tri Hita Karana", "next": "e1"},
                        {"id": "c2", "label": "Tari & seni sakral Bali", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Pemangku menjelaskan tiga sumber kebahagiaan: hubungan dengan Tuhan, sesama, dan alam. 'Itu sebabnya kami menjaga sawah, pura, dan tetangga sama baiknya.'",
                    "fact": "Tri Hita Karana adalah filosofi hidup Hindu Bali tentang tiga keharmonisan: dengan Tuhan (Parahyangan), sesama manusia (Pawongan), dan alam (Palemahan). Filosofi ini mendasari sistem irigasi Subak yang diakui UNESCO.",
                    "source": "Sumber: UNESCO — Cultural Landscape of Bali Province (2012)",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Malam harinya kamu menyaksikan Tari Kecak, puluhan pria bersuara 'cak-cak-cak' mengelilingi api. Sebuah pertunjukan yang menggetarkan.",
                    "fact": "Tiga genre tari tradisional Bali diakui UNESCO sebagai Warisan Budaya Takbenda pada 2015. Banyak tarian Bali awalnya bersifat sakral dan menjadi bagian dari upacara keagamaan.",
                    "source": "Sumber: UNESCO Intangible Cultural Heritage (2015)",
                },
            },
        },
    },
    {
        "slug": "kalimantan-barat",
        "name": "Kalimantan Barat",
        "island": "Kalimantan",
        "category": "Budaya Dayak & Kehidupan Sungai",
        "accent": "#1E7A8C",
        "tagline": "Nadi kehidupan di tepi Kapuas",
        "blurb": "Di sepanjang sungai terpanjang Indonesia, masyarakat Dayak menjaga hutan, rumah panjang, dan kearifannya.",
        "image": "https://images.unsplash.com/photo-1768700532319-b590898ae9c0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 44, "y": 46},
        "collectible": {
            "id": "col-kalbar",
            "name": "Perisai Dayak",
            "type": "Artefak",
            "icon": "shield",
            "description": "Talawang — perisai kayu berukir motif khas Dayak, lambang keberanian dan pelindung dalam tarian perang.",
        },
        "story": {
            "title": "Menyusuri Kapuas",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Kamu menaiki perahu kecil menyusuri Sungai Kapuas. Hutan hijau memeluk kedua tepian. Di sebuah tikungan, sebuah rumah panjang muncul, berdiri kokoh di atas tiang tinggi.",
                    "image": "https://images.unsplash.com/photo-1768700532319-b590898ae9c0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Seorang tetua Dayak menyambut di tangga rumah betang. 'Sungai ini nadi kami, dan rumah ini adalah kami bersama,' katanya. Ia menawarkan dua cerita.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu ingin mendengar tentang?",
                    "choices": [
                        {"id": "c1", "label": "Kehidupan di Rumah Betang", "next": "e1"},
                        {"id": "c2", "label": "Sungai Kapuas & kearifan hutan", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Tetua menjelaskan, 'Di rumah ini banyak keluarga tinggal bersama. Kami makan, bekerja, dan memutuskan segala hal bersama-sama.'",
                    "fact": "Rumah Betang adalah rumah panjang tradisional Dayak yang dapat dihuni banyak keluarga sekaligus. Ia mencerminkan nilai kebersamaan, gotong royong, dan pengambilan keputusan secara musyawarah.",
                    "source": "Sumber: Warisan Budaya Takbenda Indonesia, Kemdikbud",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Tetua menunjuk aliran sungai. 'Kapuas memberi kami ikan, jalan, dan cerita. Kalau hutan rusak, sungai pun sakit.'",
                    "fact": "Sungai Kapuas sepanjang ±1.143 km adalah sungai terpanjang di Indonesia dan menjadi urat nadi transportasi serta kehidupan masyarakat Kalimantan Barat.",
                    "source": "Sumber: Kementerian PUPR — Wilayah Sungai Kapuas",
                },
            },
        },
    },
    {
        "slug": "sulawesi-selatan",
        "name": "Sulawesi Selatan",
        "island": "Sulawesi",
        "category": "Toraja, Bugis & Budaya Maritim",
        "accent": "#B0453C",
        "tagline": "Tanah Tongkonan dan pelaut Phinisi",
        "blurb": "Dari dataran tinggi Toraja hingga lautan Bugis-Makassar, Sulawesi Selatan adalah kisah bumi dan samudra.",
        "image": "https://images.unsplash.com/photo-1582426007790-f5a2e2392dd3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 60, "y": 52},
        "collectible": {
            "id": "col-sulsel",
            "name": "Perahu Phinisi",
            "type": "Artefak",
            "icon": "sailboat",
            "description": "Kapal layar kayu legendaris pelaut Bugis-Makassar, dibuat tanpa gambar teknik, hanya lewat ingatan turun-temurun.",
        },
        "story": {
            "title": "Antara Langit Toraja dan Laut Bugis",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Di dataran tinggi Toraja, kamu berdiri di depan deretan Tongkonan — rumah beratap melengkung seperti perahu terbalik, dihiasi tanduk kerbau. Kabut tipis menyelimuti lembah hijau.",
                    "image": "https://images.unsplash.com/photo-1582426007790-f5a2e2392dd3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Seorang pemuda Makassar yang menemanimu tersenyum, 'Sulawesi Selatan itu dua dunia — Toraja di gunung, dan kami orang laut di pesisir.' Ia menawarkanmu memilih arah.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu ingin menjelajah?",
                    "choices": [
                        {"id": "c1", "label": "Tongkonan & adat Toraja", "next": "e1"},
                        {"id": "c2", "label": "Pelaut Bugis & kapal Phinisi", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Pemuda itu menjelaskan bahwa Tongkonan bukan sekadar rumah, melainkan pusat adat dan ikatan keluarga yang diwariskan lintas generasi.",
                    "fact": "Tongkonan adalah rumah adat Toraja yang berfungsi sebagai pusat kehidupan sosial dan adat. Atapnya berbentuk melengkung menyerupai perahu, melambangkan asal-usul leluhur yang datang melalui laut.",
                    "source": "Sumber: Warisan Budaya Takbenda Indonesia, Kemdikbud",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Di pantai Bulukumba, kamu melihat para pembuat kapal menyusun lambung Phinisi dari kayu. 'Mereka tidak pakai gambar,' kata pemuda itu, 'semua ada di kepala.'",
                    "fact": "Seni pembuatan kapal Phinisi (Pinisi) dari Sulawesi Selatan diakui UNESCO sebagai Warisan Budaya Takbenda pada 2017. Kapal ini dibuat berdasarkan pengetahuan turun-temurun tanpa desain teknik tertulis.",
                    "source": "Sumber: UNESCO Intangible Cultural Heritage (2017)",
                },
            },
        },
    },
    {
        "slug": "papua",
        "name": "Papua",
        "island": "Papua",
        "category": "Kearifan Lokal & Alam",
        "accent": "#2E7D46",
        "tagline": "Tanah para penjaga alam",
        "blurb": "Di ujung timur Nusantara, ratusan bahasa dan kearifan lokal hidup selaras dengan alam yang megah.",
        "image": "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "map": {"x": 88, "y": 54},
        "collectible": {
            "id": "col-papua",
            "name": "Noken Papua",
            "type": "Artefak",
            "icon": "shopping-bag",
            "description": "Tas rajut dari serat kulit kayu yang dibawa di kepala — simbol kehidupan, kesuburan, dan perdamaian.",
        },
        "story": {
            "title": "Suara dari Timur",
            "category": "Budaya",
            "start": "s1",
            "nodes": {
                "s1": {
                    "type": "scene",
                    "text": "Perahu membawamu menyusuri gugusan pulau karst Raja Ampat. Air laut sebening kaca, burung cenderawasih berkicau di kejauhan. Seorang mama Papua tersenyum lebar sambil merajut noken.",
                    "image": "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                    "next": "s2",
                },
                "s2": {
                    "type": "scene",
                    "text": "Mama menjelaskan bahwa Papua adalah rumah bagi ratusan suku dan bahasa. 'Kami menjaga alam ini seperti menjaga diri sendiri,' katanya lembut. Ia ingin berbagi dua hal.",
                    "next": "d1",
                },
                "d1": {
                    "type": "choice",
                    "text": "Kamu ingin belajar tentang?",
                    "choices": [
                        {"id": "c1", "label": "Noken & kearifan masyarakat", "next": "e1"},
                        {"id": "c2", "label": "Keragaman bahasa & alam Papua", "next": "e2"},
                    ],
                },
                "e1": {
                    "type": "discovery",
                    "text": "Mama menunjukkan noken yang ia rajut. 'Ini bukan sekadar tas. Kami pakai membawa hasil kebun, bahkan menggendong bayi.'",
                    "fact": "Noken, tas rajut tradisional Papua, diakui UNESCO sebagai Warisan Budaya Takbenda yang memerlukan perlindungan mendesak pada 2012. Noken melambangkan kehidupan, kesuburan, dan perdamaian.",
                    "source": "Sumber: UNESCO Intangible Cultural Heritage (2012)",
                },
                "e2": {
                    "type": "discovery",
                    "text": "Mama menatap laut. 'Di sini banyak sekali bahasa. Kampung sebelah bisa beda bahasa. Alam dan cerita kami beragam sekali.'",
                    "fact": "Papua adalah salah satu wilayah dengan keragaman bahasa tertinggi di dunia, dengan ratusan bahasa daerah. Kawasan Raja Ampat juga dikenal sebagai pusat keanekaragaman hayati laut dunia.",
                    "source": "Sumber: Badan Bahasa Kemdikbud & Conservation International",
                },
            },
        },
    },
]

# Normalized content contract applied per region when served.
REGION_BY_SLUG = {r["slug"]: r for r in REGIONS}
