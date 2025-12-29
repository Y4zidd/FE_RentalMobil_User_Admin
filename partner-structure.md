## Struktur Partner Bisnis (Rental Resmi)

Dokumen ini menjelaskan bagaimana entitas **Partner Bisnis (rental resmi)** terhubung dengan bagian lain sistem: database, backend/API, admin dashboard, dan aplikasi user.

---

### 1. Level Database (ERD)

Entitas utama:

- `users` → akun pengguna (customer, admin, dsb).
- `cars` → mobil yang bisa disewa.
- `bookings` → transaksi sewa mobil.
- `rental_partners` → partner bisnis (perusahaan rental resmi).

Relasi:

- `rental_partners (1) --- (N) cars`
  - Satu partner punya banyak mobil.
  - Implementasi: di tabel `cars` ada kolom `partner_id` (FK ke `rental_partners.id`).

- `cars (1) --- (N) bookings`
  - Satu mobil bisa muncul di banyak booking.
  - Implementasi: di tabel `bookings` ada kolom `car_id`.

- Relasi tidak langsung `rental_partners -> cars -> bookings`
  - Partner tidak langsung punya bookings, tapi lewat mobilnya.
  - Laporan seperti “jumlah booking per partner” dihasilkan dengan join dari `rental_partners` ke `cars` lalu ke `bookings`.

Ringkasnya:

- `rental_partners` → sumber mobil.
- `cars.partner_id` → menandai mobil ini milik partner mana.
- `bookings.car_id` → booking terhadap mobil tertentu yang otomatis terkait ke partner tertentu.

---

### 2. Level Backend / API

Struktur koneksi di sisi backend:

- **Endpoint Admin – Partner**
  - CRUD partner:
    - `GET /admin/partners` → daftar partner.
    - `POST /admin/partners` → tambah partner.
    - `PUT /admin/partners/{id}` → update partner.
    - `DELETE /admin/partners/{id}` → nonaktifkan/hapus partner (idealnya soft delete).
  - Dipakai oleh admin dashboard untuk mengelola partner bisnis.

- **Endpoint Admin – Cars**
  - Di endpoint `POST /admin/cars` dan `PUT /admin/cars/{id}`:
    - Body menyertakan `partner_id`.
    - Validasi: `partner_id` harus mengarah ke partner yang `is_active = true`.

- **Endpoint User – Cars / Bookings**
  - User tidak menyentuh partner secara langsung.
  - Alur:
    - `GET /cars` / `GET /cars/{id}`:
      - Backend bisa join `cars` + `rental_partners` dan mengembalikan informasi partner (nama, negara, kota).
    - `POST /bookings`:
      - User mengirim `car_id`.
      - Backend mengambil `partner_id` dari tabel `cars` dan secara implisit tahu booking ini milik partner mana.

---

### 3. Level Admin Dashboard (Frontend Admin)

Di folder `admin/src/app/dashboard` sudah ada beberapa halaman utama:

- `/dashboard/cars` → manajemen mobil.
- `/dashboard/bookings` → manajemen booking.
- `/dashboard/users` → manajemen user.
- `/dashboard/overview` → statistik.

Integrasi partner ke admin dashboard:

- **Halaman Partners**
  - Rencana route: `/dashboard/partners`.
  - Berisi tabel:
    - Nama partner.
    - Negara dan kota.
    - Kontak (email/telepon).
    - Status aktif/tidak.
  - Ada aksi tambah, edit, nonaktifkan partner.

- **Form Cars**
  - Di `/dashboard/cars/new` dan `/dashboard/cars/[id]/edit`:
    - Tambah field select “Partner” yang mengambil data dari endpoint partners.
    - Saat admin membuat atau mengedit mobil, ia memilih mobil ini milik partner mana.

- **Overview / Laporan**
  - Di `/dashboard/overview` atau halaman laporan:
    - Statistik per partner:
      - Jumlah mobil per partner.
      - Jumlah booking per partner.
      - (Opsional) total pendapatan per partner.
    - Semua data dihitung berdasarkan relasi `partners -> cars -> bookings`.

---

### 4. Level User App (Frontend User)

Di sisi user (pelanggan), partner tidak dikelola, hanya dibaca informasinya:

- **List Mobil**
  - Saat user melihat daftar mobil:
    - Ditampilkan nama mobil, harga, lokasi, dan (opsional) teks seperti:
      - “Provided by: [nama partner]”.

- **Detail Mobil**
  - Di halaman detail, bisa ditampilkan:
    - Nama partner.
    - Negara dan kota partner.
    - Informasi singkat lain (misalnya deskripsi partner, jika dibutuhkan).

Aliran data:

- Frontend user memanggil `GET /cars` atau `GET /cars/{id}`.
- Backend sudah menyertakan informasi partner (misalnya `partner_name`, `partner_country`) hasil join.
- User app hanya menampilkan data tersebut tanpa bisa mengubahnya.

---

### 5. Catatan Pengembangan Lanjutan (Opsional)

Struktur di atas sudah cukup untuk:

- Menjelaskan bahwa mobil berasal dari partner rental resmi.
- Menghubungkan partner ke mobil dan booking secara jelas.
- Memberi titik kontrol di admin dashboard untuk mengelola partner.

Jika suatu saat ingin membuat **akun partner sendiri** (bukan hanya dikelola admin):

- `rental_partners` bisa dihubungkan dengan entitas `users` (role `partner`).
- Partner bisa login ke dashboard khusus:
  - Melihat mobil mereka sendiri.
  - Melihat booking yang berkaitan dengan mobil mereka.

Namun untuk tahap sekarang, fokus utama:

- Partner = entitas sendiri di database.
- Cars = referensi ke partner via `partner_id`.
- Booking = referensi ke car via `car_id` (dan implisit ke partner).
- Admin Dashboard = CRUD partner + assign partner ke mobil.
- User App = hanya konsumsi informasi partner lewat data mobil dan booking.

