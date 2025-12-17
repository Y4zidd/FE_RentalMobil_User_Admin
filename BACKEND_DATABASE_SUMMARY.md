# Backend Database & API Summary

Project: Car Rental (feUser & feAdmin)
Backend target: Laravel (REST API + Midtrans integration)

---

## 1. Gambaran Umum Kebutuhan Data

Dari FE user (`user/`) dan FE admin (`admin/`) terlihat kebutuhan utama:

- Manajemen mobil (listing, status tersedia/disewa/maintenance, harga per hari, plat nomor, spesifikasi).
- Manajemen user (customer + role admin/owner/staff di dashboard admin).
- Manajemen booking (relasi user–mobil, tanggal sewa, lokasi pickup, status booking, total harga).
- Opsi tambahan booking (theft protection, collision damage, full insurance, additional driver).
- Pembayaran, termasuk opsi:
  - `pay_at_location` (bayar di lokasi)
  - `online_full` (bayar penuh online via Midtrans).
- Statistik dashboard (overview revenue, jumlah booking, dsb.) yang bisa diambil dari tabel booking/payments.

---

## 2. Tiga Tabel Master (Disarankan)

Untuk kebutuhan sekarang, tiga tabel master utama yang relevan:

### 2.1. `users` (Master User)

Menyimpan data user aplikasi (customer + admin dashboard).

Field utama (Laravel migration contoh):
- `id` (bigIncrements)
- `name` (string)
- `email` (string, unique)
- `password` (string, nullable untuk user yang register via Google)
- `role` (enum: `customer`, `owner`, `admin`, `staff`)
- `status` (enum: `active`, `inactive`)
- `avatar_url` (string nullable)
  - Untuk user yang register/login pertama kali via Google, default diisi dari foto profil Google (URL yang diberikan oleh Google OAuth).
- `phone` (string nullable)
- `email_verified_at` (timestamp nullable)
- `auth_provider` (enum: `local`, `google`, default `local`)
- `auth_provider_id` (string nullable) – misal `sub` dari Google
- `is_email_locked` (boolean, default `false`) – `true` untuk user yang dibuat via Google sehingga email **tidak boleh diubah** dari backend/admin
- `remember_token` (string nullable)
- `created_at`, `updated_at`

Relasi:
- 1 user memiliki banyak booking (`hasMany(Bookings)`).
- Dipakai oleh FE admin untuk tabel Manage Users (role: Owner/Admin/Staff, status: Active/Inactive).
- User dengan `auth_provider = google` **hanya boleh memiliki role `customer`** (tidak boleh dibuat sebagai `admin/owner/staff` via Google login).

### 2.2. `cars` (Master Mobil)

Menyimpan daftar mobil yang bisa disewa.

Field utama:
- `id` (bigIncrements)
- `name` (string) – nama mobil/label untuk tampilan.
- `brand` (string)
- `model` (string)
- `license_plate` (string, unique) – dari admin: plat nomor.
- `year` (integer nullable)
- `category` (string; contoh: `MPV`, `SUV`, dll. – bisa juga di-normalisasi ke tabel lain jika perlu).
- `status` (enum: `available`, `rented`, `maintenance`)
- `transmission` (enum: `manual`, `automatic`)
- `fuel_type` (string nullable)
- `seating_capacity` (integer)
- `price_per_day` (decimal(12,2))
- `location_id` (foreignId ke `locations`)
- `description` (text nullable)
- `image_url` (string) – gambar utama (thumbnail/cover) yang ditampilkan di listing.
- `created_at`, `updated_at`

Relasi:
- 1 mobil memiliki banyak booking (`hasMany(Bookings)`).
- 1 mobil memiliki banyak foto (`hasMany(CarImages)`), lihat tabel `car_images`.
- Digunakan di FE user (`/api/user/cars`, detail mobil) dan FE admin (Manage Cars/Product table & gallery per mobil).

### 2.3. `locations` (Master Lokasi Pickup/Branch)

Normalisasi dari field `car.location` yang muncul di FE.

Field utama:
- `id` (bigIncrements)
- `name` (string) – nama cabang/lokasi (misalnya: Jakarta Pusat, Bandung, dsb.)
- `address` (string nullable)
- `city` (string nullable)
- `latitude` / `longitude` (decimal nullable – jika nanti mau pakai map).
- `created_at`, `updated_at`

Relasi:
- 1 lokasi memiliki banyak mobil (`hasMany(Cars)`).
- Opsional: relasi ke booking (pickup_location_id/drop_location_id).

> Catatan: Jika kamu lebih suka, master ketiga bisa diganti menjadi tabel lain seperti `booking_statuses` atau `car_categories`. Tapi berdasarkan UI saat ini, `locations` paling jelas manfaatnya.

---

## 3. Tabel Transaksional & Pendukung

Selain 3 master di atas, untuk mendukung flow booking & pembayaran:

### 3.1. `bookings`

Mewakili satu transaksi penyewaan mobil.

Field utama:
- `id` (bigIncrements)
- `user_id` (foreignId -> `users`)
- `car_id` (foreignId -> `cars`)
- `pickup_date` (dateTime)
- `return_date` (dateTime)
- `pickup_location_id` (foreignId -> `locations`)
- `dropoff_location_id` (foreignId -> `locations`, nullable jika sama dengan pickup)
- `status` (enum: `pending`, `confirmed`, `cancelled`, `completed`)
- `payment_method` (enum: `pay_at_location`, `online_full`)
- `base_price` (decimal(12,2)) – harga dasar sewa tanpa opsi.
- `extras_total` (decimal(12,2)) – total biaya opsi tambahan.
- `total_price` (decimal(12,2)) – total bayar.
- `notes` (text nullable)
- `created_at`, `updated_at`

Relasi:
- `booking` milik satu `user` & satu `car`.
- 1 booking punya 1..n pembayaran (table `payments`).

Dipakai oleh FE:
- User: `GET /api/bookings/user` menampilkan daftar booking user (lihat komponen MyBookings).
- Admin: list Manage Bookings di dashboard.

### 3.2. `booking_options`

Menyimpan opsi tambahan yang dipilih pada sebuah booking (theft protection, collision damage, dll.).

Field utama:
- `id` (bigIncrements)
- `booking_id` (foreignId -> `bookings`)
- `option_code` (string; contoh: `theft_protection`, `collision_damage`, `full_insurance`, `additional_driver`)
- `label` (string) – untuk memudahkan report.
- `price_per_day` (decimal(12,2))
- `days` (integer)
- `total_price` (decimal(12,2))

Relasi:
- `booking` memiliki banyak `booking_options`.

### 3.3. `payments`

Tabel untuk menyimpan data pembayaran (termasuk integrasi Midtrans).

Field utama:
- `id` (bigIncrements)
- `booking_id` (foreignId -> `bookings`)
- `provider` (string; contoh: `midtrans`)
- `order_id` (string) – order ID yang dikirim ke Midtrans.
- `transaction_id` (string nullable) – ID transaksi dari Midtrans.
- `payment_type` (string nullable) – `bank_transfer`, `gopay`, dll.
- `gross_amount` (decimal(12,2))
- `currency` (string, default `IDR`)
- `transaction_status` (string) – `pending`, `settlement`, `expire`, `cancel`, `deny`, dsb.
- `fraud_status` (string nullable)
- `approval_code` (string nullable)
- `payload_request` (json nullable) – request yang dikirim ke Midtrans.
- `payload_response` (json nullable) – response create transaction.
- `payload_notification` (json nullable) – data notifikasi dari Midtrans.
- `paid_at` (timestamp nullable)
- `created_at`, `updated_at`

Relasi:
- Satu booking dapat memiliki beberapa record pembayaran (misalnya retry pembayaran).

### 3.4. Tabel Pendukung Lain

#### 3.4.1. `car_images` (Foto Tambahan Mobil)

Menyimpan multiple foto untuk setiap mobil.

Field utama:
- `id` (bigIncrements)
- `car_id` (foreignId -> `cars`)
- `image_url` (string) – URL gambar.
- `is_primary` (boolean, default `false`) – penanda jika gambar ini dijadikan cover/utama (opsional, bisa juga tetap pakai `cars.image_url`).
- `sort_order` (integer, nullable) – urutan tampilan di gallery.
- `created_at`, `updated_at`

Relasi:
- 1 mobil memiliki banyak `car_images`.
- Digunakan di FE user (gallery di halaman detail mobil) dan FE admin (manage gallery per mobil).

#### 3.4.2. Lainnya (opsional)

- `roles` & `role_user` – jika ingin RBAC lebih kompleks daripada field `role` di `users`.
- `car_status_history` – riwayat perubahan status mobil (available -> rented -> maintenance).

---

## 4. Ringkasan Endpoint API (Laravel)

Berikut mapping kebutuhan API berdasarkan FE user & admin.

### 4.1. API untuk FE User (prefix contoh: `/api/user`)

**Auth & user data**
- `POST /api/user/register`
  - Body: `{ name, email, password }`
  - Response: `{ success, token, user }`.
- `POST /api/user/login`
  - Body: `{ email, password }`
  - Response: `{ success, token, user }`.
- `GET /api/user/data`
  - Header: `Authorization: <token>`.
  - Response: data user login sekarang.
- **Google Login (hanya untuk customer, bukan admin/owner/staff)**
  - `GET /api/user/auth/google/redirect`
    - FE user arahkan user ke endpoint ini ketika klik "Login dengan Google".
    - Backend akan redirect ke Google OAuth.
  - `GET /api/user/auth/google/callback`
    - Dipanggil oleh Google setelah user approve.
    - Backend:
      - Ambil profil dari Google (minimal `sub`, `email`, `name`, `picture`).
      - Cari user dengan `auth_provider = google` dan `auth_provider_id = sub`.
      - Jika belum ada:
        - Buat user baru di tabel `users` dengan:
          - `email` dari Google (tidak boleh diedit).
          - `name` dari Google (boleh diedit nanti).
                    - `avatar_url` diisi dari `picture` (foto profil Google) sebagai default foto profil.
          - `auth_provider = google`.
          - `auth_provider_id = sub`.
          - `is_email_locked = true`.
          - `role = customer` (default, **tidak boleh** otomatis jadi admin).
          - `password = null` (login selalu via Google).
      - Jika sudah ada dan `role != customer`, backend boleh menolak login Google (opsional, tapi disarankan untuk keamanan).
    - Response ke FE user: `{ success, token, user }` sama seperti login biasa.

**Mobil**
- `GET /api/user/cars`
  - Query opsional: `location_id`, `pickup_date`, `return_date`, `search`.
  - Response: list mobil yang tersedia + data yang dibutuhkan FE (image, brand, model, category, transmission, pricePerDay, location, dsb.).
- (Opsional) `GET /api/user/cars/{id}`
  - Untuk halaman detail mobil jika ingin fetch langsung dari backend.

**Booking (User)**
- `GET /api/bookings/user`
  - Header: `Authorization: <token>`.
  - Response: list booking milik user berupa struktur yang saat ini dipakai FE:
    - `_id`, `car` (nested: image, brand, model, year, category, location),
    - `status`, `pickupDate`, `returnDate`, `price`, `createdAt`.
- `POST /api/bookings`
  - Header: `Authorization: <token>`.
  - Body (contoh):
    ```json
    {
      "car_id": 1,
      "pickup_date": "2025-01-10",
      "return_date": "2025-01-12",
      "pickup_location_id": 1,
      "dropoff_location_id": 1,
      "payment_method": "online_full", // atau "pay_at_location"
      "options": [
        { "code": "theft_protection" },
        { "code": "full_insurance" }
      ]
    }
    ```
  - Backend:
    - Validasi ketersediaan mobil.
    - Hitung `base_price`, `extras_total`, `total_price`.
    - Simpan ke `bookings` & `booking_options`.
    - Jika `payment_method = pay_at_location` → set status `pending`/`confirmed` sesuai flow yang diinginkan.
    - Jika `payment_method = online_full` → lanjutkan ke proses Midtrans (lihat bagian 5).

---

## 5. Integrasi Midtrans (1 API Eksternal)

### 5.1. Endpoint Backend untuk Midtrans

Contoh struktur endpoint di Laravel:

- `POST /api/payments/midtrans/checkout`
  - Input: `booking_id` atau payload booking baru yang akan dibuat.
  - Proses:
    - Ambil data booking + user.
    - Hitung `gross_amount` dari `total_price`.
    - Panggil Midtrans Snap/Transaction API (`/charge`) dengan `order_id` unik.
    - Simpan response ke tabel `payments` (payload_response, order_id, dll.).
  - Response ke FE:
    - `snap_token` atau `redirect_url` untuk ditampilkan di komponen pembayaran (CarDetails bagian "Online payment via Midtrans").

- `POST /api/payments/midtrans/notify`
  - Ini adalah **callback/notification URL** yang dipanggil oleh Midtrans.
  - Backend:
    - Verifikasi signature key.
    - Update tabel `payments` dan `bookings.status` berdasarkan `transaction_status` (`settlement` → booking `confirmed`, `expire` → booking `cancelled`, dll.).

- (Opsional) `GET /api/payments/midtrans/status/{order_id}`
  - Untuk menanyakan status transaksi tertentu ke Midtrans jika perlu.

### 5.2. "API Streetmap" / Flow Sederhana

Alur dari sisi user ketika memilih bayar online:

1. User buka detail mobil (`CarDetails`), pilih tanggal & opsi.
2. FE kirim `POST /api/bookings` dengan `payment_method = "online_full"`.
3. Backend membuat record `bookings` (+ `booking_options`) dengan status awal `pending`.
4. Backend memanggil fungsi service untuk Midtrans dan expose endpoint `POST /api/payments/midtrans/checkout`:
   - Kirim request ke Midtrans → terima `snap_token` / `redirect_url`.
   - Simpan ke tabel `payments`.
5. FE menerima `snap_token`/`redirect_url` → menampilkan UI Snap Midtrans atau redirect ke halaman pembayaran.
6. User menyelesaikan pembayaran di Midtrans.
7. Midtrans mengirim notifikasi ke backend melalui `POST /api/payments/midtrans/notify`:
   - Backend update `payments.transaction_status` dan `bookings.status`.
8. Halaman "My Bookings" (`GET /api/bookings/user`) menampilkan status terbaru (confirmed/cancelled, dsb.).

---

## 6. API untuk FE Admin (High-Level)

Prefix contoh: `/api/admin` dengan guard khusus (token admin).

**Auth Admin**
- `POST /api/admin/login` – login admin/owner/staff.

**Manage Cars**
- `GET /api/admin/cars` – list mobil (filter status/category).
- `POST /api/admin/cars` – create mobil baru.
- `GET /api/admin/cars/{id}` – detail.
- `PUT /api/admin/cars/{id}` – update (termasuk ubah status available/rented/maintenance).
- `DELETE /api/admin/cars/{id}` – hapus.

**Manage Users**
- `GET /api/admin/users` – list user dengan filter role/status.
- `POST /api/admin/users` – create user admin/staff.
- `PUT /api/admin/users/{id}` – update role/status dan data profil.
  - **Aturan khusus untuk user Google**:
    - Jika `auth_provider = google` atau `is_email_locked = true`, backend **tidak boleh mengizinkan perubahan field `email`** (request yang mengubah email harus di-ignore atau dibalas error).
    - Admin tetap boleh mengubah field lain (misal `status`, `phone`, dsb.) sesuai kebutuhan.
- `DELETE /api/admin/users/{id}` – nonaktifkan user.

**Manage Bookings**
- `GET /api/admin/bookings` – list semua booking (filter by status/date).
- `GET /api/admin/bookings/{id}` – detail booking + payment.
- `PUT /api/admin/bookings/{id}` – ubah status (mis. manual confirm/cancel jika bayar di lokasi).

**Dashboard Overview**
- `GET /api/admin/overview` – mengembalikan data untuk grafik dan summary (total revenue, total bookings, dsb.), diambil dari `bookings` + `payments`.
  - Contoh struktur response (disederhanakan):
    ```json
    {
      "metrics": {
        "total_bookings": 120,
        "pending_bookings": 18,
        "confirmed_bookings": 72,
        "cancelled_bookings": 10,
        "completed_bookings": 20,
        "total_revenue": 45000000
      },
      "revenue_by_day": [
        { "date": "2025-01-01", "revenue": 1200000 },
        { "date": "2025-01-02", "revenue": 900000 },
        { "date": "2025-01-03", "revenue": 1500000 }
      ],
      "revenue_by_month": [
        { "month": "2025-01", "online": 12000000, "pay_at_location": 5000000 },
        { "month": "2025-02", "online": 15000000, "pay_at_location": 6000000 }
      ]
    }
    ```
  - `revenue_by_day` dihitung dari tabel `payments` dengan kriteria:
    - Hanya transaksi dari provider `midtrans`.
    - Hanya `transaction_status = 'settlement'` (berhasil dibayar).
    - Dikelompokkan per hari (berdasarkan `paid_at` atau `created_at`).
    - `revenue` per hari = jumlah `gross_amount` dari semua pembayaran yang berhasil di hari tersebut.
  - `revenue_by_month` dihitung dari tabel `payments` dengan kriteria:
    - Sama seperti `revenue_by_day` (provider `midtrans`, `transaction_status = 'settlement'`).
    - Dikelompokkan per bulan (misalnya format `YYYY-MM`).
    - Dipisah berdasarkan `payment_method` di `bookings` (contoh: `online_full` vs `pay_at_location`) sehingga dapat ditampilkan sebagai dua area (online vs pay at location) pada grafik "Monthly Revenue Trend".

---

## 7. Catatan Implementasi Laravel Singkat

- Gunakan Sanctum atau Passport untuk auth token (`Authorization` header seperti di FE sekarang).
- Buat seeder untuk:
  - Users (Owner/Admin/Staff default).
  - Cars default (sesuai dummy data di FE).
  - Locations default.
- Mapping model utama:
  - `User` → `users`
  - `Car` → `cars`
  - `Location` → `locations`
  - `Booking` → `bookings`
  - `BookingOption` → `booking_options`
  - `Payment` → `payments`

Dengan struktur di atas, FE user dan FE admin yang sudah ada akan lebih mudah dihubungkan ke backend Laravel dan integrasi Midtrans bisa berjalan terstruktur.
