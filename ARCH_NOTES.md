# Catatan Arsitektur TubesPBW2

Dokumen ini sebagai catatan singkat supaya struktur proyek bisa diatur lebih rapi, terinspirasi dari pola **Sunset (FE)** dan **Sunrise (BE)**, tapi tetap memakai stack sekarang:

- Frontend: React + Vite (`user`, `user_ux`)
- Backend: Laravel (`backend`)

## Tujuan Utama

- Memisahkan **UI**, **logika bisnis**, dan **akses API** dengan lebih jelas.
- Membuat struktur mirip pola **Sunset/Sunrise** tanpa mengganti framework.
- Menjaga supaya perubahan tetap realistis untuk tugas kuliah (tidak full rewrite).

## Rencana Frontend (user & user_ux)

Target: struktur lebih mendekati Sunset, tapi tetap Vite SPA.

Usulan struktur besar:

- `src/components/ui`  
  - Komponen kecil generik: Button, Input, Modal, Badge, dsb.
- `src/components/layout`  
  - Navbar, Footer, Layout utama, komponen shell.
- `src/components/sections`  
  - Bagian halaman yang bisa dipakai ulang: Hero, FeaturedSection, Banner, dll.
- `src/hooks`  
  - Custom hooks: `useAuth`, `useCars`, `useBookings`, dsb.
- `src/lib/api` atau `src/services`  
  - Semua akses HTTP ke backend:
    - `api/auth.js`
    - `api/cars.js`
    - `api/bookings.js`
  - Komponen dan pages tidak langsung memanggil `axios`/`fetch` ke URL mentah.
- `src/context`  
  - Context global (misalnya `AppContext`) dipecah atau diperkecil tanggung jawabnya jika perlu.

Langkah implementasi bertahap:

1. Buat folder `src/lib/api` dan pindahkan semua call HTTP ke file service terpisah.
2. Buat beberapa custom hooks sederhana di `src/hooks` yang memakai service tersebut.
3. Secara bertahap, kurangi pemanggilan langsung ke API dari `pages/*.jsx`.
4. (Opsional) Kelompokkan komponen ke `ui`, `layout`, `sections` tanpa mengubah perilaku.

Fokus awal: hanya lakukan pemisahan yang tidak mengubah perilaku aplikasi.

## Rencana Backend (Laravel)

Target: struktur lebih mendekati Sunrise (Controller tipis, logic di service/repository).

Usulan struktur besar:

- `app/Services`
  - `CarService.php`
  - `BookingService.php`
  - `AuthService.php`
- `app/Repositories`
  - `CarRepository.php`
  - `BookingRepository.php`
  - Dapat berisi query-query yang agak kompleks.
- `app/Http/Resources`
  - Resource untuk membentuk response JSON yang konsisten.
- `app/Http/Requests`
  - FormRequest untuk validasi per endpoint.

Pola alur request:

`Route` → `Controller` → `Service` → (opsional `Repository`) → `Model/DB`  
`Service` → hasil → `Controller` → `Resource` → JSON response

Langkah implementasi bertahap:

1. Pilih 1 domain paling penting (misalnya Booking).
2. Buat `BookingService` dan, jika perlu, `BookingRepository`.
3. Pindahkan logika kompleks dari controller ke service.
4. Tambah `Resource` untuk response booking yang dipakai di beberapa endpoint.
5. Ulangi pola ini untuk domain lain jika waktu dan kebutuhan memungkinkan.

## Prinsip Umum

- Refactor bertahap, jangan ubah terlalu banyak file sekaligus.
- Utamakan:
  - API tetap kompatibel dengan frontend.
  - Perilaku fitur tidak berubah, hanya lokasi kodenya yang dipindahkan.
- Setiap langkah besar idealnya divalidasi dengan:
  - `npm run lint` di `user` dan `user_ux`.
  - Menjalankan minimal beberapa endpoint penting di backend.

