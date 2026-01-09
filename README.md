# Rental Car System – Monorepo (Laravel + React + Next.js)

This repository contains **three main parts**:

- Backend API: [backend](file:///c:/Users/Yazid/Documents/TubesPBW2/backend) (Laravel 12, PHP 8.2, MySQL)
- User frontend: [user](file:///c:/Users/Yazid/Documents/TubesPBW2/user) (React + Vite)
- Admin frontend: [user/admin](file:///c:/Users/Yazid/Documents/TubesPBW2/user/admin) (Next.js + Shadcn UI)

This document focuses on **how to run the project** in development.

---

## 1. Prerequisites

Make sure you have these installed locally:

- **PHP 8.2+**
- **Composer**
- **Node.js 18+** and **npm**
- **MySQL** (or compatible) for the Laravel database

---

## 2. Backend Setup (Laravel) – `backend`

Go into the backend folder:

```bash
cd backend
```

### 2.1 Install dependencies

```bash
composer install
npm install
```

### 2.2 Environment configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Configure database connection in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=root
DB_PASSWORD=...
```

3. Generate app key:

```bash
php artisan key:generate
```

### 2.3 Run migrations (and seeders if needed)

```bash
php artisan migrate
# optional
php artisan db:seed
```

### 2.4 Run backend

Simple option:

```bash
php artisan serve
```

Backend will be available at:

- `http://localhost:8000`

If you also want to run Vite for Laravel assets:

```bash
npm run dev
```

There is also a Composer script:

```bash
composer run dev
```

This script starts multiple processes (php artisan serve, queue listener, logs, and Vite).

---

## 3. User Frontend Setup – `user`

Go into the user folder:

```bash
cd user
```

### 3.1 Install dependencies

```bash
npm install
```

### 3.2 Environment configuration

Create or edit `.env` in `user`:

```env
VITE_BASE_URL=http://localhost:8000/api
```

### 3.3 Run user frontend

```bash
npm run dev
```

By default it will be available at:

- `http://localhost:5173`

---

## 4. Admin Frontend Setup – `user/admin`

Go into the admin folder:

```bash
cd user/admin
```

### 4.1 Install dependencies

```bash
npm install
```

### 4.2 Environment configuration

Create `.env.local` (or `.env`) in `user/admin`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4.3 Run admin frontend

```bash
npm run dev
```

By default it will be available at:

- `http://localhost:3000`

---

## 5. Run Multiple Parts via `user/package.json` Scripts

In [user/package.json](file:///c:/Users/Yazid/Documents/TubesPBW2/user/package.json) there are helper scripts:

- `dev` → run user frontend (Vite)
- `dev:admin` → run admin frontend (Next.js) from `user/admin`
- `dev:backend` → run `composer run dev` inside `backend`
- `dev:both` → run **user + admin** together
- `dev:all` → run **user + admin + backend** together

After installing dependencies, from the `user` folder you can run:

```bash
cd user
npm run dev:both
```

This will run:

- User frontend at `http://localhost:5173`
- Admin frontend at `http://localhost:3000`

If you want to run everything including the backend:

```bash
cd user
npm run dev:all
```

This will run:

- Backend Laravel at `http://localhost:8000`
- User frontend at `http://localhost:5173`
- Admin frontend at `http://localhost:3000`

---

## 6. Endpoint & Integration Summary

- User frontend base URL:

```text
http://localhost:8000/api
```

- Admin frontend base URL:

```text
http://localhost:8000
```

Both talk to the Laravel backend via REST API (see [routes/api.php](file:///c:/Users/Yazid/Documents/TubesPBW2/backend/routes/api.php)).
