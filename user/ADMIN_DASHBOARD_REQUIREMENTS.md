# Kebutuhan Dashboard Admin Baru

## 1. Halaman & Menu Utama

### Dashboard (Overview)
- Menampilkan ringkasan:
  - Total mobil
  - Total booking aktif
  - Total booking hari ini/bulan ini
  - (Opsional) Total pendapatan hari ini/bulan ini
- Menampilkan daftar singkat booking terbaru / upcoming
- (Opsional) Grafik sederhana tren booking/pendapatan

### Manage Cars
- Tabel daftar mobil dengan kolom minimal:
  - Nama mobil
  - Plat nomor
  - Harga sewa per hari
  - Status (available, rented, maintenance)
- Aksi pada tiap baris:
  - View detail mobil
  - Edit data mobil
  - Delete mobil
  - Ubah status mobil
- Fitur tambahan:
  - Search berdasarkan nama/plat
  - Filter berdasarkan status/harga/jenis mobil

### Add Car
- Form tambah mobil dengan field minimal:
  - Nama mobil
  - Merk / model
  - Plat nomor
  - Harga sewa per hari
  - Deskripsi
  - Kapasitas penumpang
  - Transmisi (manual/matic)
  - (Opsional) Jenis bahan bakar, tahun, warna
- Upload foto mobil:
  - Minimal 1 foto, idealnya bisa beberapa
- Validasi form & feedback sukses/gagal

### Manage Bookings
- Tabel daftar booking dengan kolom minimal:
  - Nama customer
  - Mobil yang disewa
  - Tanggal mulai & selesai sewa
  - Total harga
  - Metode & status pembayaran
  - Status booking (pending, approved, rejected, ongoing, completed, cancelled)
- Aksi pada tiap baris:
  - Lihat detail booking
  - Approve / reject booking
  - Ubah status (misal: pending → ongoing → completed)
  - Cancel booking bila diperlukan
- Fitur tambahan:
  - Filter berdasarkan status booking
  - Filter berdasarkan tanggal, mobil, customer

## 2. Kebutuhan Layout & Template Admin

### Layout Utama (Layout.jsx)
- Layout khusus admin yang membungkus semua halaman admin:
  - Sidebar
  - Navbar/topbar
  - Area konten utama

### Sidebar Admin
- Menu minimal:
  - Dashboard
  - Manage Cars
  - Add Car
  - Manage Bookings
  - (Opsional) Reports
  - (Opsional) Settings
- Indikator halaman aktif (active state)

### Navbar/Topbar Admin
- Menampilkan:
  - Nama/role admin
  - Tombol logout
  - (Opsional) Notifikasi singkat

### Komponen UI yang Dibutuhkan dari Template
- Card statistik (untuk angka-angka di Dashboard)
- DataTable:
  - Pagination
  - Search
  - Sorting
  - Filter
- Form lengkap untuk Add/Edit data
- Modal konfirmasi (hapus data, ubah status booking)
- (Opsional) Komponen chart untuk grafik

## 3. Kebutuhan Teknis & Integrasi

### Routing
- Rute khusus admin, contoh:
  - `/admin/dashboard`
  - `/admin/manage-cars`
  - `/admin/add-car`
  - `/admin/manage-bookings`
- Semua route di atas menggunakan layout admin (Layout.jsx)

### Proteksi Akses (Role-Based)
- Hanya user dengan role `admin/staff` yang boleh akses route admin
- User non-admin akan diarahkan (redirect) ke halaman lain atau login

### Integrasi Data / API
- Halaman-halaman admin terhubung ke backend/API untuk:
  - Get list mobil
  - Get list booking
  - Create/update/delete mobil
  - Update status booking
- Menangani state:
  - Loading (bisa gunakan komponen Loader)
  - Error (pesan error yang jelas)
  - Feedback sukses (toast/alert)

## 4. Hal yang Perlu Dijaga Saat Ganti Template

- Menjaga fungsi utama yang sudah ada:
  - CRUD mobil (AddCar, ManageCars)
  - Manajemen booking (ManageBookings)
- Tidak merusak struktur file utama (jika sudah diimplementasi):
  - `src/pages/admin/Dashboard.jsx`
  - `src/pages/admin/Layout.jsx`
  - `src/pages/admin/AddCar.jsx`
  - `src/pages/admin/ManageCars.jsx`
  - `src/pages/admin/ManageBookings.jsx`
- Memastikan:
  - Sidebar & Navbar admin baru mengarah ke path/route yang sama
  - Styling dashboard admin baru tidak mengganggu tampilan halaman user (customer) di bagian non-admin

---

File ini bisa dipakai sebagai acuan saat memilih dan mengintegrasikan template dashboard admin baru ke dalam project CarRental-fullstack.
