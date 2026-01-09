# Admin Dashboard – Rental Car

The admin dashboard for this Rental Car project is built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**.  
It serves as a management panel that connects to the Laravel backend.

## 1. Main Features

- Admin authentication (login) and protected admin routes.
- **Overview / Dashboard** page with statistics and charts.
- **Cars** management (create, edit, view, list).
- **Bookings** management.
- **Users** management.
- **Rental Partners** management.
- **Coupons / Discounts** management.
- **Admin Profile** page (update profile data).

These features are implemented using the `src/app` and `src/features` structure, split by domain (cars, bookings, users, partners, coupons, overview, profile, etc.).

## 2. Tech Stack

- Framework: **Next.js 16 (App Router)**  
- Language: **TypeScript**  
- UI: **Shadcn UI** + **Tailwind CSS v4**  
- HTTP client: **axios**  
- Charts: **Recharts**  
- Forms: **React Hook Form** + **Zod**  
- Toast/notifications: **sonner**

The admin dashboard talks to the Laravel backend via REST API. The backend base URL is configured through environment variables.

## 3. Folder Structure (Short Overview)

Important structure inside the [admin folder](file:///c:/Users/Yazid/Documents/TubesPBW2/user/admin):

```plaintext
src/
├─ app/
│  ├─ auth/          # Halaman login/register admin
│  ├─ dashboard/     # Seluruh halaman dashboard
│  │  ├─ overview/   # Statistik & grafik
│  │  ├─ cars/       # CRUD mobil
│  │  ├─ bookings/   # Manajemen booking
│  │  ├─ users/      # Manajemen user
│  │  ├─ partners/   # Rental partners
│  │  ├─ coupons/    # Kupon
│  │  └─ profile/    # Profil admin
│  └─ layout.tsx     # Layout utama dashboard
├─ features/         # Logika per fitur (UI + hooks + helper)
├─ components/       # Komponen UI reusable
├─ lib/              # Helper umum (api-client, utils, format, dll)
└─ hooks/            # Custom hooks
```

## 4. Environment Configuration

Example environment file:

- [env.example copy.txt](file:///c:/Users/Yazid/Documents/TubesPBW2/user/admin/env.example%20copy.txt)

Minimal environment required to connect to the Laravel backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This value points to the Laravel backend URL when running `php artisan serve`.

## 5. Running the Admin Dashboard (Development)

You can run these commands from the project root (via scripts) or directly inside the admin folder.

1. Go to the admin folder:

```bash
cd user/admin
```

2. Install dependencies:

```bash
npm install
```

3. Make sure the Laravel backend is running (see root/backend README).

4. Set environment (create `.env.local` or `.env`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Run the development server:

```bash
npm run dev
```

By default, the admin app is available at:

- http://localhost:3000

## 6. Backend Integration Notes

- All requests to the backend use the axios instance in [api-client.ts](file:///c:/Users/Yazid/Documents/TubesPBW2/user/admin/src/lib/api-client.ts).
- The admin token is stored in `localStorage` with the key `admin_token` and sent as a header:

```http
Authorization: Bearer <token>
```

When the token is invalid (HTTP 401), it is cleared and the user can be redirected back to the login page.
