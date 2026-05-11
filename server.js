const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// =========================
// DATA ROOM & DICTIONARY
// =========================
const rooms = {};

const CATEGORIES = {
  hewan: [
    "ANGSA", "ANJING", "ANOA", "AYAM", "BABI", "BADAK", "BANTENG", "BEBEK", "BEO", 
    "BERUANG", "BIAWAK", "BINTURONG", "BISON", "BUAYA", "BUNGLON", "BURUNG", "CACING", 
    "CAPUNG", "CHEETAH", "CICAK", "CUMI", "DOMBA", "ELANG", "ENTOG", "FLAMINGO", "GAGAK", 
    "GAJAH", "GARUDA", "GELATIK", "GORILA", "GURITA", "HAMSTER", "HARIMAU", "HIU", "HYENA", 
    "IGUANA", "IKAN", "ITIK", "JANGKRIK", "JERAPAH", "KAKATUA", "KALAJENGKING", "KALILONG", 
    "KALKUN", "KAMBING", "KANGGURU", "KASUARI", "KATAK", "KECOA", "KUCING", "KELABANG", 
    "KELELAWAR", "KELINCI", "KEPITING", "KERANG", "KERBAU", "KIJANG", "KOALA", "KODOK", 
    "KOMODO", "KUDA", "KUDANIL", "KUMBANG", "KUPUKUPU", "KURA", "LABALABA", "LALAT", "LANDAK", 
    "LEBAH", "LELE", "LEMUR", "LINTAH", "LUMBALUMBA", "LUTUNG", "MACAN", "MERAK", "MERPATI", 
    "MONYET", "MUSANG", "NENGAT", "NILA", "NURI", "NYAMUK", "ORANGUTAN", "ONTA",
    "PANDA", "PANTER", "PARI", "PAUS", "PELIKAN", "PENGUIN", "PENYU", "PUMA", "PUYUH", 
    "RAYAP", "RUBAH", "RUSA", "SAPI", "SEMUT", "SERIGALA", "SINGA", "SIPUT", "SOANG", 
    "TAPIR", "TAWON", "TENGGIRI", "TERI", "TIKUS", "TONGKOL", "TRENGGILING", "TUPAI", "UDANG", 
    "ULAR", "ULAT", "UNTA", "VIPER", "WALET", "ZEBRA",
  ],
  buah: [
    "ALPUKAT", "ANGGUR", "APEL", "APRIKOT", "ARBEI", "ASAM", "BACANG", "BAMBANGAN", "BELIMBING", 
    "BENGKOANG", "BENTAR", "BERRY", "BINJAI", "BINTARO", "BIT", "BLEWAH", "BLUEBERRY", "BUNI", 
    "CEMPEDAK", "CERMAI", "CHERRY", "COKELAT", "DELIMA", "DEWA", "DUKU", "DURIAN", "GANDARIA", 
    "JAMBU", "JERUK", "KALING", "KASTURI", "KECAPI", "KEDONDONG", "KELAPA", "KELENGKENG", 
    "KEMANG", "KEMIRI", "KEPEL", "KERSEN", "KIWI", "KOLANG", "KUINI", "KURMA", "LABU", "LECI", 
    "LEMON", "LIME", "LOBAK", "LONTAR", "MAHKOTA", "MANGGA", "MANGGIS", "MARMARKIS", "MATOA", 
    "MELON", "MENTIMUN", "MUNDU", "MURBEI", "NAGA", "NAMNAM", "NANAS", "NANGKA", "PALA", "PEACH", 
    "PEPAYA", "PINANG", "PIR", "PISANG", "PLUM", "RAMBUTAN", "RASPBERRY", "SALAK", "SAWIT", 
    "SAWO", "SEMANGKA", "SIRSAK", "SRIKAYA", "STROBERI", "SURI", "TIMUN", "TIN", "TOMAT", "WULUH", 
    "ZAITUN",
  ],
  negara: [
    "AFGHANISTAN", "AFRIKA", "ALBANIA", "ALJAZAIR", "AMERIKA", "ANDORRA", "ANGOLA", "ARAB", 
    "ARGENTINA", "ARMENIA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BAHAMA", "BAHRAIN", "BANGLADESH", 
    "BARBADOS", "BELANDA", "BELARUS", "BELGIA", "BELIZE", "BHUTAN", "BOLIVIA", "BOSNIA", "BOTSWANA", 
    "BRASIL", "BRUNEI", "BULGARIA", "BURUNDI", "CEKO", "CHAD", "CHILE", "CHINA", "DENMARK", "DJIBOUTI", 
    "DOMINIKA","EKUADOR", "ELSALVADOR", "ESTONIA", "ETHIOPIA", "FIJI", "FILIPINA", "FINLANDIA", "GABON",
     "GAMBIA", "GEORGIA", "GHANA", "GRENADA", "GUATEMALA", "GUINEA", "HAITI", "HONDURAS", "HUNGARIA", 
     "INDIA", "INDONESIA", "INGGRIS", "IRAK", "IRAN", "IRLANDIA", "ISLANDIA", "ISRAEL", "ITALIA", 
     "JAMAIKA", "JEPANG", "JERMAN", "KAMBOJA", "KAMERUN", "KANADA", "KAZAKHSTAN", "KENYA", "KIRGIZSTAN", 
     "KOLOMBIA", "KOMORO", "KOREA", "KOSOVO", "KOSTARIKA", "KROASIA", "KUBA", "KUWAIT", "LAOS", "LATVIA", 
     "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LITHUANIA", "LUKSEMBURG", "MADAGASKAR", "MAKEDONIA", 
     "MALADEWA", "MALAWI", "MALAYSIA", "MALI", "MALTA", "MAROKO", "MAURITANIA", "MAURITIUS", "MEKSIKO", 
     "MESIR", "MIKRONESIA", "MOLDOVA", "MONAKO", "MONGOLIA", "MONTENEGRO", "MOZAMBIK", "MYANMAR", 
     "NAMIBIA", "NAURU", "NEPAL", "NIGER", "NIGERIA", "NIKARAGUA", "NORWEGIA", "OMAN", "PAKISTAN", 
     "PALAU", "PALESTINA", "PANAMA", "PARAGUAY", "PERU", "POLANDIA", "PORTUGAL", "PRANCIS", "QATAR", 
     "RUMANIA", "RUSIA", "RWANDA", "SAMOA", "SANMARINO", "SENEGAL", "SERBIA", "SEYCHELLES", "SINGAPURA", 
     "SIPRUS", "SLOVAKIA", "SLOVENIA", "SOMALIA", "SPANYOL", "SRILANKA", "SUDAN", "SURIAH", "SURINAME", 
     "SWEDIA", "SWISS", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TIMORLESTE", "TOGO", "TONGA", 
     "TRINIDAD", "TUNISIA", "TURKI", "TURKMENISTAN", "TUVALU", "UGANDA", "UKRAINA", "UNIEMIRATARAB", 
     "URUGUAY", "UZBEKISTAN", "VANUATU", "VATIKAN", "VENEZUELA", "VIETNAM", "YAMAN", "YORDANIA", 
     "YUNANI", "ZAMBIA", "ZIMBABWE",
  ],
  teknologi: [
    "ADMIN", "AGILE", "ALGORITMA", "ANDROID", "ANIMASI", "ANTIVIRUS", "APLIKASI", "ARCHITECT", 
    "ARTIFICIAL", "AUDIO", "AUGMENTED", "AUTOMATION", "BACKEND", "BANDWIDTH", "BASH", "BATCH", 
    "BIOS", "BIT", "BITCOIN", "BLOCKCHAIN", "BLUETOOTH", "BOOT", "BRANCH", "BROWSER", "BUG", 
    "BUILD", "BYTE", "CACHE", "CLONE", "CLOUD", "CODER", "COMMAND", "COMMIT", "COMPILER", 
    "KOMPUTER", "CONSOLE", "CONTRACT", "CRYPTO", "CSS", "CYBER", "DAPP", "DATA", "DATABASE", 
    "DEBUG", "DEEP", "DEKRIPSI", "DEPLOY", "DESIGN", "DEVELOPER", "DHCP", "DIGITAL", "DIREKTORI", 
    "DISKET", "DNS", "DOMAIN", "DONGLE", "DRIVER", "ENKRIPSI", "ENGINEER", "ERROR", "ETHER", 
    "ETHERNET", "FETCH", "FIBER", "FILE", "FIREWALL", "FLASHDISK", "FOLDER", "FORK", "FREKUENSI", 
    "FRONTEND", "FTP", "FULLSTACK", "GIGA", "GIT", "GITHUB", "GOOGLE", "GRAFIK", "HACKER", 
    "HARDWARE", "HIBERNATE", "HOSTING", "HTML", "HTTP", "HTTPS", "HYPERTEXT", "IMAP", "INFORMASI", 
    "INTELLIGENCE", "INTERNET", "INTRANET", "IP", "ISSUE", "JAVA", "JAVASCRIPT", "JARINGAN", 
    "JOYSTICK", "KANBAN", "KABEL", "KERNEL", "KEYBOARD", "KODE", "LAN", "LAPTOP", "LATENCY", 
    "LEARNING", "LINE", "LINUX", "LOGIN", "LOGOUT", "LOSS", "MAC", "MACHINE", "MAIN", "MALWARE", 
    "MAN", "MANAGER", "MASTER", "MEGA", "MEMORI", "MERGE", "MODEM", "MONITOR", "MOTHERBOARD", 
    "MOUSE", "MULTIMEDIA", "NAT", "NETWORK", "NEURAL", "NODE", "NODEJS", "OPTIK", "ORACLE", "OS", 
    "OPERATING", "PACKET", "PAN", "PASSWORD", "PING", "PIXEL", "POP", "PORT", "POWERSHELL", 
    "PRINTER", "PROCESSOR", "PROGRAM", "PROGRAMMER", "PROMPT", "PROXY", "PULL", "PUSH", "PYTHON", 
    "QA", "QUERIES", "RAM", "REACT", "REALITY", "REBOOT", "REGISTRY", "RELEASE", "REPOSITORY", 
    "REQUEST", "RESOLUSI", "RESTART", "ROOT", "ROUTER", "SATELIT", "SCRIPT", "SCRUM", "SERVER", 
    "SHELL", "SHUTDOWN", "SIBER", "SINYAL", "SISTEM", "SLEEP", "SMART", "SMARTPHONE", "SMTP", 
    "SOCKET", "SOFTWARE", "SPRINT", "SSH", "SWITCH", "TABLET", "TCP", "TEKNOLOGI", "TEKS", "TELNET", 
    "TERA", "TERMINAL", "TEST", "TICKET", "TROJAN", "UBUNTU", "UDP", "UEFI", "UI", "URL", "USER", 
    "UX", "VIDEO", "VIRTUAL", "VIRUS", "VPN", "WAKE", "WAN", "WEB", "WEBSITE", "WIFI", "WINDOWS", 
    "XML", "YOUTUBE", "ZIP"
  ],
  umum: [
    // A
    "ABAD", "ABANG", "ABU", "ACARA", "ADA", "ADAT", "ADIL", "AGAMA", "AHLI", "AIR", "AKAL", "AKAR", 
    "AKHIR", "AKSI", "ALAM", "ALASAN", "ALAT", "ALIS", "AMAN", "AMBIL", "AMPUN", "ANAK", "ANEH", 
    "ANGIN", "ANGKAT", "ANTRE", "API", "ARAH", "ARTI", "ASAL", "ASAP", "ASAM", "ASIN", "ASING", 
    "ASLI", "ATAP", "ATUR", "AWAL", "AWAN", "AYAH", "AYO",
    // B
    "BACA", "BADAN", "BAGI", "BAHAGIA", "BAHASA", "BAHU", "BAIK", "BAJU", "BAKAR", "BAKAT", 
    "BALAS", "BALOK", "BAN", "BANGKU", "BANGUN", "BANTAL", "BANTU", "BANYAK", "BAPAK", "BARANG", 
    "BARAT", "BARU", "BASAH", "BATAS", "BATU", "BAU", "BAWAH", "BAYANG", "BAYAR", "BEBAS", "BEDA", 
    "BEDAK", "BELAJAR", "BELAKANG", "BELI", "BELUM", "BENAR", "BENCI", "BENDERA", "BENTUK", "BERANI", 
    "BERAT", "BERHENTI", "BERI", "BERITA", "BESAR", "BESI", "BETIS", "BIAYA", "BIBIR", "BIKIN", 
    "BINGUNG", "BINTANG", "BIRU", "BISA", "BISNIS", "BOCOR", "BODOH", "BOHONG", "BOLA", "BONEKA", 
    "BOSAN", "BOTOL", "BUAIAN", "BUAT", "BUKAN", "BUKTI", "BUKU", "BULAN", "BULAT", "BUMI", "BUNDAR", 
    "BUNGA", "BUNGKUS", "BURU", "BURUK",
    // C
    "CABAI", "CABUT", "CACAT", "CAHAYA", "CAIR", "CANDU", "CANTIK", "CAPEK", "CARI", "CATAT", "CEK", 
    "CELANA", "CEMBURU", "CEPAT", "CERDAS", "CERITA", "CINTA", "CIUM", "COBA", "COCOK", "COKELAT", 
    "CUBIT", "CUCI", "CUCU", "CUKUP", "CURI", "CURIGA",
    // D
    "DADA", "DAFTAR", "DAGING", "DAGU", "DAHAN", "DAHI", "DALAM", "DAMAI", "DANA", "DANAU", "DAPAT", 
    "DAPUR", "DARAH", "DARAT", "DASAR", "DATANG", "DAUN", "DEBU", "DEKAT", "DENGAN", "DENGAR", 
    "DEPAN", "DERAS", "DERITA", "DESA", "DIAM", "DINGIN", "DINDING", "DIRI", "DOA", "DOKTER", "DORONG", 
    "DOSA", "DUA", "DUDUK", "DUKA", "DUNIA",
    // E & F
    "EFEK", "EKONOMI", "ELOK", "EMAS", "EMBER", "EMOSI", "EMPAT", "ENAK", "ENAM", "ENERGI", "ENGGAK", 
    "FAKTA", "FAKTOR", "FAHAM", "FASE", "FIKIR", "FISIK", "FOKUS", "FOTO", "FUNGSI",
    // G
    "GABUNG", "GAGAL", "GAJI", "GALAU", "GAMBAR", "GAMPANG", "GANGGU", "GANTI", "GANTENG", "GARAM", 
    "GARIS", "GARPU", "GATAL", "GAUL", "GAYA", "GAYUNG", "GELAP", "GELAS", "GEMBIRA", "GEMUK", "GIGI", 
    "GILA", "GODA", "GORENG", "GUDANG", "GUGUP", "GULA", "GULUNG", "GUNA", "GUNTING", "GUNUNG", "GURU",
    // H
    "HABIS", "HADAP", "HADIAH", "HADIR", "HAFAL", "HAKIM", "HALAL", "HALAMAN", "HALUS", "HAMIL", 
    "HANCUR", "HANDUK", "HANGAT", "HANTU", "HANYA", "HARAP", "HARGA", "HARI", "HARTA", "HARUM", 
    "HARUS", "HASIL", "HASRAT", "HATI", "HAUS", "HEBAT", "HEBOH", "HELM", "HENTI", "HIDUNG", "HIDUP", 
    "HIJAU", "HILANG", "HITAM", "HITUNG", "HORMAT", "HOTEL", "HUBUNG", "HUJAN", "HUKUM", "HURUF", 
    "HUTAN", "HUTANG",
    // I & J
    "IBADAH", "IBU", "IDE", "IDOL", "IKAT", "IKHLAS", "IKUT", "ILMU", "IMAN", "IMPIAN", "INDAH", 
    "INGAT", "INGIN", "INI", "INJAK", "INTAN", "INTI", "IRI", "IRIS", "ISLAM", "ISTANA", "ISTIRAHAT", 
    "ISTERI", "ITU", "IZIN", "JADWAL", "JAGA", "JAHAT", "JAIL", "JALAN", "JAM", "JAMIN", "JAMUR", 
    "JANDA", "JANDELA", "JANGAN", "JANJI", "JANTUNG", "JARAK", "JARANG", "JARI", "JARUM", "JATUH", 
    "JAUH", "JAWAB", "JELAS", "JELEK", "JEMBATAN", "JEMPUT", "JENDELA", "JENIS", "JERNIH", "JIJIK", 
    "JINAK", "JIWA", "JODOH", "JUANG", "JUDUL", "JUGA", "JUJU", "JUAL", "JUMAT", "JURANG", "JURUS",
    // K
    "KABAR", "KABUR", "KACA", "KACAMATA", "KACAU", "KADANG", "KAGET", "KAKAK", "KAKEK", "KAKI", 
    "KALAH", "KALIAN", "KALIMAT", "KAMAR", "KAMI", "KAMU", "KANAN", "KANGEN", "KANTOR", "KAPAN", 
    "KAPAL", "KARAKTER", "KARENA", "KARMA", "KARTU", "KASAR", "KASIH", "KASUS", "KASUR", "KATA", 
    "KAUS", "KAWIN", "KAYA", "KAYU", "KECEWA", "KECIL", "KEDAP", "KELAS", "KELUAR", "KELUARGA", 
    "KEMARIN", "KEMBALI", "KENAL", "KEPALA", "KERAS", "KERETA", "KERING", "KERJA", "KERTAS", "KETAWA", 
    "KETIKA", "KHAS", "KHUSUS", "KIAMAT", "KIRI", "KISAH", "KITA", "KOSONG", "KOTA", "KOTOR", "KUAT", 
    "KUBUR", "KUKU", "KULIT", "KUNCI", "KUNING", "KURANG", "KURSI", "KURUS", "KUTU",
    // L
    "LABA", "LACAK", "LAGI", "LAGU", "LAHIR", "LAIN", "LAKI", "LALU", "LAMA", "LAMBAT", "LAMPU", 
    "LANCAR", "LANGIT", "LANGSUNG", "LANJUT", "LANTAI", "LANTANG", "LAPAR", "LARI", "LARUT", 
    "LATIH", "LAUT", "LAYAK", "LAYAR", "LEBAR", "LEBIH", "LEGA", "LEKAS", "LELAH", "LELAKI", 
    "LEMAH", "LEMARI", "LEMAS", "LEMBUT", "LEMPAR", "LENGAN", "LENGKAP", "LEPAS", "LIAR", "LIBUR", 
    "LIDAH", "LIHAT", "LILIN", "LIMA", "LIMBAH", "LIRIK", "LOMPAT", "LONGGAR", "LUBANG", "LUKA", 
    "LUKIS", "LUPA", "LURUS", "LUTUT",
    // M
    "MAAF", "MABUK", "MACAM", "MACET", "MADU", "MAHAL", "MAIN", "MAJU", "MAKAN", "MAKNA", "MALAM", 
    "MALAS", "MALU", "MAMPU", "MANA", "MANDI", "MANDIRI", "MANIS", "MANJA", "MANTAN", "MANUSIA", 
    "MARAH", "MASAK", "MASALAH", "MASIH", "MASUK", "MATA", "MATAHARI", "MATI", "MAU", "MAYAT", "MEDAN", 
    "MEGAH", "MEJA", "MENANG", "MENGAPA", "MENIT", "MENTAL", "MERAH", "MEREKA", "MESIN", "MESTI", 
    "MEWAH", "MIMPI", "MINUM", "MINYAK", "MIRIP", "MISKIN", "MOBIL", "MODAL", "MOHON", "MOTOR", 
    "MOYANG", "MUDA", "MUDAH", "MUJARAB", "MUKA", "MULAI", "MULUS", "MULUT", "MUNCUL", "MUNDUR", 
    "MURAH", "MURID", "MUSIK", "MUSIM", "MUSUH", "MUTLAK",
    // N (Super Lengkap)
    "NABI", "NADA", "NAFAS", "NAFSU", "NAGA", "NAIK", "NAKAL", "NALAR", "NAMA", "NANTI", "NANYA", 
    "NASI", "NASIB", "NAUNG", "NEGARA", "NEKAT", "NENEK", "NGANTUK", "NGERI", "NIAT", "NIKAH", 
    "NIKMAT", "NILAI", "NINGGAL", "NIPU", "NODA", "NORMAL", "NYALA", "NYAMAN", "NYANYI", "NYATA", 
    "NYAWA", "NYERI",
    // O & P
    "OBAT", "OBROL", "OJEK", "OKNUM", "OLAH", "OLAHRAGA", "OLOK", "OMBAK", "OMONG", "OMPONG", 
    "ONAR", "ONGKOS", "OPER", "ORANG", "ORDE", "ORI", "OTAK", "OTOT", "OVEN", "PACAR", "PADAHAL", 
    "PADAT", "PAGI", "PAHA", "PAHAM", "PAHIT", "PAJAK", "PAKAI", "PAKAIAN", "PAKSA", "PALSU", 
    "PALU", "PAMAN", "PAMER", "PANAS", "PANCING", "PANDAI", "PANDANG", "PANIK", "PANJANG", "PANTAI", 
    "PANTAS", "PAPAN", "PARA", "PARAH", "PARAS", "PASAR", "PASIR", "PASTI", "PATAH", "PATUNG", 
    "PATUH", "PAYUNG", "PECAH", "PEDAS", "PEDULI", "PEGANG", "PEJABAT", "PELAJAR", "PELAN", "PELIT", 
    "PELUK", "PEMUDA", "PENA", "PENDEK", "PENGARUH", "PENSIL", "PENTING", "PENUH", "PERANG", "PERCAYA", 
    "PEREMPUAN", "PERGI", "PERLU", "PERNAH", "PERUT", "PESAN", "PESTA", "PETANI", "PETIR", "PIKIR", 
    "PILIH", "PINDAH", "PINTAR", "PINTU", "PIPA", "PIRING", "PISAU", "PLASTIK", "POHON", "POLA", 
    "POLISI", "POLOS", "POTONG", "PRIA", "PRIBADI", "PROSES", "PROTES", "PUAS", "PUASA", "PUCAT", 
    "PUCUK", "PUJI", "PUKUL", "PULANG", "PULAU", "PULIH", "PUNCAK", "PUNDAK", "PUNGGUNG", "PUNYA", 
    "PURA", "PUSAT", "PUSING", "PUTAR", "PUTIH", "PUTRA", "PUTRI", "PUTUS",
    // Q & R
    "QARI", "QURAN", "QURBAN", "RABU", "RACUN", "RADAR", "RAGA", "RAGU", "RAHASIA", "RAJA", "RAJIN", 
    "RAKSASA", "RAMAI", "RAMBUT", "RAMPING", "RAMPUNG", "RAPI", "RASA", "RASIA", "RATA", "RATU", 
    "RAWAT", "RAYA", "RAYU", "REAKSI", "REALITA", "REBUT", "RELA", "REMAJA", "REMEH", "RENCANA", 
    "RENDAH", "REPOT", "RESMI", "RESTU", "RETAK", "REZEKI", "RIBUT", "RINDU", "RINGAN", "RITME", 
    "RIWAYAT", "RODA", "ROMANTIS", "RONTOK", "RUANG", "RUGI", "RUH", "RUMAH", "RUMIT", "RUMPUT", 
    "RUNTUH", "RUSAK", "RUSUH",
    // S
    "SAAT", "SABAR", "SABTU", "SABUN", "SADAR", "SAH", "SAHABAT", "SAHUT", "SAING", "SAKIT", 
    "SAKSI", "SAKTI", "SALAH", "SALAM", "SALING", "SALJU", "SAMA", "SAMAR", "SAMBAL", "SAMBIL", 
    "SAMPAH", "SAMPAI", "SANA", "SANDAR", "SANGAT", "SANGGUP", "SANTAI", "SANTRI", "SAPA", 
    "SAPI", "SAPU", "SARAN", "SARAP", "SARING", "SATU", "SAUDARA", "SAWAH", "SAYANG", "SAYAP", 
    "SAYUR", "SEBAB", "SEBAGAI", "SEBELUM", "SEBENTAR", "SEBUT", "SEDANG", "SEDAP", "SEDIH", 
    "SEGAR", "SEGERA", "SEHAT", "SEKARANG", "SELALU", "SELAMAT", "SELASA", "SELATAN", "SELESAI", 
    "SELIMUT", "SELURUH", "SEMANGAT", "SEMBUH", "SEMEN", "SEMOGA", "SEMPAT", "SEMPURNA", "SEMUA", 
    "SENAM", "SENANG", "SENDIRI", "SENDOK", "SENGIT", "SENI", "SENIN", "SENJATA", "SENTUH", 
    "SENYUM", "SEPAKAT", "SEPATU", "SEPERTI", "SEPI", "SEPUDAN", "SERAM", "SERANG", "SERING", 
    "SERIUS", "SERTA", "SERU", "SESAK", "SESAL", "SESAT", "SETAN", "SETIA", "SETIAP", "SEWA", 
    "SIANG", "SIAP", "SIAPA", "SIBUK", "SIFAT", "SIKAP", "SIKAT", "SIKSA", "SIKUT", "SILA", 
    "SILAHKAN", "SILAP", "SILAU", "SIMPAN", "SINI", "SISA", "SISI", "SISIR", "SITU", "SOGOK", 
    "SOK", "SOMBONG", "SOPAN", "SORE", "SOROT", "SUAMI", "SUARA", "SUASANA", "SUBUR", "SUCI", 
    "SUDAH", "SUDUT", "SUHU", "SUKA", "SUKSES", "SULAP", "SULIT", "SUMBER", "SUMPAH", "SUMUR", 
    "SUNGAI", "SUNGGUH", "SUNJUM", "SUNYI", "SUPAYA", "SURAT", "SURGA", "SUSAH", "SUSUL", "SUSUN", 
    "SUTRA", "SYARAT", "SYUKUR",
    // T
    "TAAT", "TABEL", "TABRAK", "TABUNG", "TADI", "TAFSIR", "TAHAN", "TAHU", "TAHUN", "TAJAM", 
    "TAKDIR", "TAKUT", "TALI", "TAMAH", "TAMAN", "TAMAT", "TAMBAH", "TAMPAK", "TAMPAN", "TAMPIL", 
    "TAMU", "TANAH", "TANAM", "TANDA", "TANDING", "TANGAN", "TANGGA", "TANGGUNG", "TANGIS", "TANGKAP", 
    "TANI", "TANPA", "TANYA", "TARI", "TARIK", "TARUH", "TAS", "TATA", "TATAP", "TAWA", "TAWAR", 
    "TEBAK", "TEBAL", "TEBANG", "TEBING", "TEDUH", "TEGAK", "TEGANG", "TEGAR", "TEGAS", "TEGAUR", 
    "TEGUR", "TEH", "TEKAD", "TEKAN", "TEKNIK", "TELAN", "TELANG", "TELAT", "TELEPON", "TELINGA", 
    "TELITI", "TELUK", "TELUR", "TEMA", "TEMAN", "TEMBAK", "TEMBUS", "TEMPAT", "TEMPEL", "TEMPO", 
    "TEMU", "TENANG", "TENDA", "TENDANG", "TENGAH", "TENGGARA", "TENGKAR", "TENTU", "TEORI", "TEPAT", 
    "TEPI", "TEPING", "TEPOT", "TERANG", "TERAP", "TERAS", "TERBANG", "TERBIT", "TERIAK", "TERIMA", 
    "TERJADI", "TERJUN", "TERKA", "TERUS", "TERTAWA", "TETANGGA", "TETAP", "TETAPI", "TEWAS", "TIADA", 
    "TIANG", "TIBA", "TIDAK", "TIDUR", "TIGA", "TIKAR", "TIKET", "TIM", "TIMBANG", "TIMBUL", "TIMUR", 
    "TINDAK", "TINGGAL", "TINGGI", "TINGKAH", "TINJU", "TINTA", "TIPIS", "TIPU", "TIRU", "TISU", 
    "TITIK", "TITIP", "TIUP", "TOKOH", "TOKO", "TOLAK", "TOLEH", "TOLONG", "TOMBOL", "TONGKAT", 
    "TONTON", "TOPI", "TOTAL", "TRADISI", "TUA", "TUAN", "TUBUH", "TUGAS", "TUHAN", "TUJUAN", 
    "TUKAR", "TULANG", "TULI", "TULIS", "TULUS", "TUMBUM", "TUMPANG", "TUMPUL", "TUNAI", "TUNDA", 
    "TUNDUK", "TUNGGAL", "TUNGGU", "TUNJUK", "TUNTUT", "TURUN", "TURUT", "TUSUK", "TUTUP",
    // U, V, W, Y, Z
    "UANG", "UAP", "UBAH", "UBAN", "UCAP", "UDARA", "UJIAN", "UJUNG", "UKUR", "ULANG", "ULAR", "ULAT", 
    "UMAT", "UMPAN", "UMUM", "UMUR", "UNDANG", "UNDUR", "UNGGUL", "UNIK", "UNTA", "UNTUK", "UNTUNG", 
    "UPAH", "UPAYA", "URUS", "USAHA", "USIA", "USIR", "USUL", "UTAMA", "UTARA", "UTUS", "VAKSIN", 
    "VALID", "VIRAL", "VISI", "VOKAL", "VOLUME", "WABAH", "WADAH", "WAJAR", "WAJAH", "WAJIB", "WAKIL", 
    "WAKTU", "WALAU", "WANGI", "WANITA", "WARGA", "WARIS", "WARNA", "WARTAWAN", "WARUNG", "WASIT", 
    "WASPADA", "WATAK", "WAWANCARA", "WUJUD", "YAKIN", "YAITU", "YAYASAN", "YATIM", "ZAMAN", "ZALIM", 
    "ZAKAT", "ZIARAH", "ZONA"
  ]
};

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getRandomSeedWord(category = "random") {
  let words = [];
  if (category !== "random" && CATEGORIES[category]) {
    words = CATEGORIES[category];
  } else {
    words = Object.values(CATEGORIES).flat();
  }
  return words[Math.floor(Math.random() * words.length)];
}

function getSafeRoomsList() {
  return Object.values(rooms).map((room) => ({
    code: room.code,
    name: room.name,
    type: room.type,
    maxPlayers: room.maxPlayers,
    category: room.category,
    hostName: room.hostName,
    turnTime: room.turnTime,
    winScore: room.winScore,
    players: room.players,
  }));
}

// 🌟 TAMBAHAN: Fungsi untuk menghitung dan menyiarkan statistik real-time
function broadcastStats() {
  io.emit("updateStats", {
    // io.engine.clientsCount otomatis menghitung jumlah user yang sedang buka web
    online: io.engine.clientsCount, 
    activeGames: Object.keys(rooms).length
  });
}

// =========================
// SOCKET CONNECTION
// =========================
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.emit("roomsList", getSafeRoomsList());
  broadcastStats(); // 🌟 UPDATE: Panggil ini agar user baru langsung terhitung!

  socket.on("createRoom", (data) => {
    const roomCode = data.code || generateRoomCode();

    const room = {
      code: roomCode,
      name: data.name || `Room ${roomCode}`,
      turnTime: parseInt(data.turnTime || 30),
      winScore: parseInt(data.winScore || 20),
      category: data.category || "random",
      type: data.type || "public",
      maxPlayers: data.maxPlayers || 4,
      hostId: data.hostId,
      hostName: data.hostName,
      players: [{
        id: data.hostId,
        name: data.hostName,
        socketId: socket.id,
        score: 0,
        words: []
      }],
      gameStarted: false,
      gameState: null,
      timerInterval: null,
    };

    rooms[roomCode] = room;
    
    socket.join(room.code);
    socket.emit("roomCreated", room);
    io.emit("roomsList", getSafeRoomsList());
    broadcastStats(); // 🌟 UPDATE: Update angka Active Games
  });

  socket.on("joinRoom", (data) => {
    const room = rooms[data.code];

    if (!room) {
      socket.emit("joinError", "Room tidak ditemukan!");
      return;
    }

    let player = room.players.find((p) => p.id === data.playerId);

    if (player) {
      player.socketId = socket.id;
    } else {
      player = {
        id: data.playerId, 
        name: data.playerName, 
        socketId: socket.id,
        score: 0,
        words: [],
      };
      room.players.push(player);
    }

    socket.join(room.code);
    io.to(room.code).emit("roomUpdated", room);
    io.emit("roomsList", getSafeRoomsList());
  });

  socket.on("updateRoom", (data) => {
    const room = rooms[data.roomCode];
    if (!room) return;

    room.category = data.category;
    room.turnTime = data.turnTime;
    room.winScore = data.winScore;

    io.to(room.code).emit("roomUpdated", room);
    io.emit("roomsList", getSafeRoomsList());
  });

  socket.on("joinGame", ({ roomCode, playerId }) => {
    socket.join(roomCode);
    const room = rooms[roomCode];
    
    if (room) {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.socketId = socket.id;
      }

      if (room.gameState) {
        socket.emit("gameState", {
          players: room.players,
          lastWord: room.gameState.seedWord,
          timer: room.gameState.timeLeft,
          winner: room.gameState.winner,
          status: room.gameState.status,
          countdown: room.gameState.countdown
        });
      }
    }
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameStarted = true;

    room.players.forEach((player) => {
      player.score = 0;
      player.words = [];
    });

    room.gameState = {
      seedWord: "-", 
      timeLeft: room.turnTime, 
      usedWords: [], 
      status: "countdown", 
      countdown: 3, 
      winner: null,
    };

    io.to(roomCode).emit("gameStarted", room);

    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(() => {
      if (!room.gameState || room.gameState.status === "finished") return;

      if (room.gameState.status === "countdown") {
        room.gameState.countdown--;
        
        if (room.gameState.countdown <= 0) {
          room.gameState.status = "playing";
          room.gameState.seedWord = getRandomSeedWord(room.category);
          room.gameState.usedWords.push(room.gameState.seedWord);
        }
      } else if (room.gameState.status === "playing") {
        room.gameState.timeLeft--;

        if (room.gameState.timeLeft <= 0) {
          room.gameState.status = "finished";
          room.gameStarted = false; // 🌟 UPDATE: Tambahkan ini agar host bisa klik Mulai Game lagi!
          clearInterval(room.timerInterval);

          const winner = [...room.players].sort((a, b) => b.score - a.score)[0];
          room.gameState.winner = winner;

          io.to(roomCode).emit("gameOver", winner);
        }
        
      }

      io.to(roomCode).emit("gameState", {
        players: room.players,
        lastWord: room.gameState.seedWord,
        timer: room.gameState.timeLeft,
        winner: room.gameState.winner,
        status: room.gameState.status,
        countdown: room.gameState.countdown
      });
    }, 1000);
  });

  socket.on("submitWord", ({ roomCode, word }) => {
    const room = rooms[roomCode];
    if (!room || !room.gameStarted) return;

    const game = room.gameState;
    
    if (!game || game.status !== "playing" || game.winner) {
       socket.emit("invalidMove", "Game belum dimulai atau sudah selesai!");
       return;
    }

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    word = word.trim().toUpperCase();
    if (!word) return;

    const validWords = room.category !== "random"
        ? CATEGORIES[room.category]
        : Object.values(CATEGORIES).flat();

    if (!validWords.includes(word)) {
      socket.emit("invalidMove", "Kata tidak ada di kategori!");
      return;
    }

    const expected = game.seedWord.slice(-1);
    if (word[0] !== expected) {
      socket.emit("invalidMove", `Telat! Sekarang kata harus berawalan '${expected}'`);
      return;
    }

    if (game.usedWords.includes(word)) {
      socket.emit("invalidMove", "Kata ini sudah ditebak!");
      return;
    }

    player.words.push(word);
    player.score += 1;
    game.usedWords.push(word);
    game.seedWord = word; 

    io.to(roomCode).emit("gameState", {
      players: room.players,
      lastWord: game.seedWord,
      timer: game.timeLeft,
      winner: game.winner,
      status: game.status,
      countdown: game.countdown
    });
  });

  // =========================
  // LEAVE ROOM (KELUAR MANUAL)
  // =========================
  socket.on("leaveRoom", ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        const departedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1); // Hapus pemain

        if (room.players.length === 0) {
            delete rooms[roomCode]; // Hancurkan room jika kosong!
            broadcastStats(); // 🌟 UPDATE: Update karena room berkurang
        } else {
            // Jika yang keluar adalah Host, oper mahkota Host ke pemain pertama yang tersisa
            if (departedPlayer.id === room.hostId) {
                room.hostId = room.players[0].id;
                room.hostName = room.players[0].name;
            }
            io.to(roomCode).emit("roomUpdated", room);
        }
        io.emit("roomsList", getSafeRoomsList()); // Update UI Lobby
        socket.leave(roomCode);
    }
  });

  // =========================
  // DISCONNECT (TUTUP TAB BROWSER / MATI LAMPU)
  // =========================
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    broadcastStats(); // 🌟 UPDATE: Kurangi angka Online kalau ada yang tutup web!
    
    // Cari room yang sedang diikuti oleh koneksi yang putus ini
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const player = room.players.find((p) => p.socketId === socket.id);

      if (player) {
        /*
          🌟 GRACE PERIOD SANGAT PENTING:
          Beri jeda 3 detik. Karena kalau pemain hanya berpindah halaman 
          (dari room.html ke game.html), socket.id lama akan mati dan socket baru terbentuk.
          Jangan sampai room-nya keburu dihancurkan padahal dia cuma loading pindah halaman!
        */
        setTimeout(() => {
          if (rooms[roomCode]) {
            const checkPlayer = rooms[roomCode].players.find((p) => p.id === player.id);
            
            // Jika setelah 3 detik socketId-nya MASIH sama (tidak reconnect), berarti dia beneran pergi
            if (checkPlayer && checkPlayer.socketId === socket.id) {
              const playerIndex = rooms[roomCode].players.findIndex((p) => p.id === player.id);
              rooms[roomCode].players.splice(playerIndex, 1);

              if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode]; // Hancurkan room jika kosong!
                broadcastStats(); // 🌟 UPDATE: Update karena room berkurang
              } else {
                if (checkPlayer.id === rooms[roomCode].hostId) {
                  rooms[roomCode].hostId = rooms[roomCode].players[0].id;
                  rooms[roomCode].hostName = rooms[roomCode].players[0].name;
                }
                io.to(roomCode).emit("roomUpdated", rooms[roomCode]);
              }
              io.emit("roomsList", getSafeRoomsList()); // Update UI Lobby
            }
          }
        }, 3000); 
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});