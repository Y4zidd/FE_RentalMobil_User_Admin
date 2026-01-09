# User Frontend – Rental Car

This is the **user-facing frontend** for the Rental Car system.  
It is built with **React + Vite + Tailwind CSS**, and connects to the **Laravel** backend through a REST API.

## 1. Main Features

- Landing / home page with hero, banner, and car list.
- Car list with basic information (price, type, fuel, etc).
- Car detail page.
- Booking / checkout form.
- "My Bookings" page.
- Basic user profile page.
- Reusable components such as loading, navbar, footer, testimonial, newsletter, etc.

Authentication and booking features communicate with the backend in the [`backend`](file:///c:/Users/Yazid/Documents/TubesPBW2/backend) folder via `/api` endpoints.

## 2. Tech Stack

- **React 19** (SPA)
- **Vite** as bundler
- **React Router DOM** for routing
- **Axios** for HTTP requests
- **Tailwind CSS** for styling
- Simple global state using React Context/hooks

## 3. Folder Structure (Short Overview)

Inside the [user folder](file:///c:/Users/Yazid/Documents/TubesPBW2/user):

```plaintext
user/
├─ src/
│  ├─ pages/        # Halaman (Home, Cars, CarDetails, Checkout, MyBookings, Profile, dll)
│  ├─ components/   # Komponen UI (Navbar, Banner, CarCard, Footer, Login, dll)
│  ├─ lib/
│  │  └─ api/       # File helper untuk call API (auth, cars, booking, regions, user)
│  ├─ context/      # AppContext (state global sederhana)
│  ├─ assets/       # Gambar dan ikon
│  ├─ App.jsx       # Root komponen
│  └─ main.jsx      # Entry point Vite
└─ package.json
```

## 4. Environment Configuration

The backend base URL is configured via Vite env:

```bash
VITE_BASE_URL=http://localhost:8000/api
```

This environment variable is used in [client.js](file:///c:/Users/Yazid/Documents/TubesPBW2/user/src/lib/api/client.js) and shared across all API helpers.

Store this variable in:

- `.env` (or `.env.local`) inside the `user` folder.

## 5. Running the User Frontend (Development)

1. Go to the `user` folder:

```bash
cd user
```

2. Install dependencies:

```bash
npm install
```

3. Make sure the Laravel backend is running at `http://localhost:8000` with the API prefix `http://localhost:8000/api`.

4. Set the environment:

```bash
VITE_BASE_URL=http://localhost:8000/api
```

5. Run the development server:

```bash
npm run dev
```

By default, the user app is available at:

- http://localhost:5173

## 6. Build for Production

To build the production bundle:

```bash
cd user
npm run build
```

The output will be generated in the `dist/` folder.
