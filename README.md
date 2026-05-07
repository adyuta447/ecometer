# Ecometer MVP

Ecometer adalah platform dashboard analitik dan manajemen efisiensi energi cerdas untuk melacak penggunaan daya utilitas secara real-time, mendeteksi anomali, melakukan simulasi "What-If" untuk proyeksi tagihan, dan melihat jejak emisi karbon (CO₂e).

## 🌟 Fitur Utama

- **Manajemen Perangkat (Devices):** Pantau status hidup/mati, daya (Watt), dan riwayat operasi berbagai perangkat IoT pintar.
- **Pengelompokan (Groups):** Kelompokkan perangkat berdasarkan lokasi atau departemen untuk menganalisis efisiensi di skala area/zona.
- **Analitik Prediktif & AI (Analytics):**
  - Prediksi penggunaan kWh dan proyeksi tagihan baseline.
  - Simulasi potong efisiensi (What-If) untuk melihat estimasi penghematan.
  - Grafik real-time penggunaan daya dan komputasi metrik akurasi AI (MAPE).
- **Laporan & Emisi Karbon (Reports):** Unduh ringkasan efisiensi, jejak karbon per sesi operasional.
- **Papan Peringkat (Leaderboard):** Gamifikasi antar tim atau departemen dalam mencapai target efisiensi terbesar.
- **Integrasi Pihak Ketiga (Integrations):** Sinkronisasikan data ke software akuntansi atau via REST API dan token.
- **Pengaturan Keuangan (Settings):** Tetapkan parameter tarif listrik, anggaran bulanan, dan faktor konversi emisi (kgCO₂e/kWh).

## 🛠 Alat dan Bahan

### 1. Hardware IoT

- **ESP32:** Mikrokontroler yang menyertakan driver WiFi untuk pengiriman data secara nirkabel.
- **PZEM-004T + Clamp CT Sensor:** Modul untuk membaca arus, tegangan, dan daya yang akurat secara _plug-and-play_.
- **Modul Step-Down 5V:** Mengambil suplai daya langsung dari panel listrik (MCB) untuk menghidupkan mikrokontroler.

### 2. Perangkat Lunak & Antarmuka (Software Stack)

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) - Menjamin performa dashboard yang cepat dengan SSR.
- **Database & Cloud:** **Firebase Firestore** - Menyimpan dan menyinkronkan data metrik kelistrikan secara real-time.
- **Keamanan:** **Firebase Authentication** - Mewajibkan login pengguna, memastikan hanya manajemen gedung/staf berwenang yang dapat mengakses data operasional.
- **Protokol Data:** **MQTT / REST API** - Jalur pengiriman data dari ESP32 ke infrastruktur database cloud.
- **Library Tambahan:** Tailwind CSS (Styling), Recharts (Visualisasi Data), Lucide React (Icons).

## 🔄 Alur Kerja (Workflows)

### A. Flow Perangkat (Device Flow)

1. **Sensoring:** Sensor _Clamp Current Transformer (CT)_ tipe _split-core_ menjepit kabel fasa utama di panel listrik gedung.
2. **Data Capture:** PZEM-004T menangkap data fluktuasi arus listrik secara real-time tanpa mengganggu sirkuit utama (non-invasif).
3. **Transmission:** ESP32 memproses data tersebut, melakukan enkripsi, dan mentransmisikannya ke Firebase via WiFi (MQTT/REST).
4. **AI Processing:** Algoritma _Machine Learning_ di cloud secara otonom mempelajari beban dasar (_baseload_) normal dan mendeteksi anomali pemborosan.
5. **Conversion:** Sistem secara otomatis mengonversi setiap kWh menjadi metrik reduksi karbon ekuivalen $CO_2e$ berstandar internasional.

### B. Flow Pengguna (User Flow)

1. **Authentication:** Pengguna melakukan login melalui portal EcoMeter yang aman.
2. **Monitoring:** Mengakses dasbor analitik untuk melihat visualisasi penggunaan daya dan jejak emisi karbon kapan saja.
3. **Alerting:** Menerima notifikasi alarm ke ponsel apabila terdeteksi anomali konsumsi energi di luar jam operasional normal.
4. **Reporting:** Mengunduh laporan jejak audit emisi yang transparan untuk kebutuhan pelaporan ESG atau SRUK 2026 dalam satu klik.
5. **Optimization:** Menggunakan wawasan preskriptif untuk memangkas inefisiensi operasional dan meningkatkan profitabilitas perusahaan.

## 🚀 Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan Ecometer di mesin lokal Anda:

### 1. Persyaratan Sistem

Pastikan perangkat Anda sudah terinstal:

- **Node.js** (Minimal v18.x direkomendasikan)
- **NPM** atau **Yarn** (sebagai package manager)

### 2. Kloning Repositori

Clone proyek ini dari GitHub ke direktori lokal Anda:

```bash
git clone https://github.com/adyuta447/ecometer.git
cd ecometer
```

### 3. Instalasi Dependensi

Jalankan perintah ini untuk menginstal semua dependensi proyek:

```bash
npm install
# atau
yarn install
```

### 4. Konfigurasi Environment Variable

- Salin atau ubah nama dari `.env.example` ke `.env.local` (jika tersedia), atau atur konfigurasi kunci Firebase Anda sesuai dengan yang dibutuhkan.

_(Pastikan konfigurasi `FIREBASE_PROJECT_ID`, dll terisi jika aplikasi ini sudah terhubung penuh ke projek Firebase yang spesifik)_

### 5. Jalankan Aplikasi

Jalankan development server:

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) dengan browser untuk melihat hasilnya.

## 📦 Deployment (Opsional)

Aplikasi ini dapat dengan mudah di-deploy menggunakan platform Vercel:

1. Buat akun di [Vercel](https://vercel.com/)
2. Hubungkan akun GitHub Anda.
3. Import repository `ecometer`.
4. Tambahkan Environment Variables (konfigurasi basis data Firebase/API Keys).
5. Klik **Deploy**.

## 🏗 Struktur Proyek (Atomic Design)

Proyek ini menerapkan kaidah _Atomic Design_ demi memastikan keterbacaan, keteraturan, dan pemisahan komponen UI dengan _business logic_:

- `hooks/`: Khusus memuat abstraksi business logic dan proses ke sistem data/Firebase.
- `components/atoms/`: Komponen kecil dasar (e.g., tombol, label peringatan).
- `components/molecules/`: Paduan komponen-komponen atom.
- `components/organisms/`: Bagian blok UI aplikasi mandiri dan kompleks (e.g., Grafik, Tabel, Form simulasi).
- `app/`: Tatanan route pages pada framework Next.js.
