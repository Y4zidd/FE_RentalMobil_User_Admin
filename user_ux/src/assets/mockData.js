export const mockUser = {
    id: 101,
    name: "Dimas Anggara",
    email: "dimas.anggara@example.com",
    email_verified_at: "2025-10-15T09:15:00Z",
    role: "customer",
    status: "active",
    avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
    phone: "+62 812-9988-7766",
    license_number: "3171234567890001",
    default_city: "Jakarta Selatan, Indonesia",
    rental_preferences: "Diutamakan mobil matic, bersih, dan wangi. Pickup area Jaksel.",
    auth_provider: "local",
    created_at: "2025-10-01T08:30:00Z",
    updated_at: "2025-12-25T14:45:00Z"
};

const LOCATION_JAKARTA = {
    city: 'Jakarta',
    country: 'Indonesia',
    name: 'Jakarta'
}

// Bandung is in West Java province
const LOCATION_WESTJAVA = {
    city: 'West Java',
    country: 'Indonesia',
    name: 'West Java'
}

const LOCATION_BALI = {
    city: 'Bali',
    country: 'Indonesia',
    name: 'Bali'
}

const LOCATION_YOGYAKARTA = {
    city: 'Yogyakarta',
    country: 'Indonesia',
    name: 'Yogyakarta'
}

const LOCATION_EASTJAVA = {
    city: 'East Java',
    country: 'Indonesia',
    name: 'East Java'
}

export const mockCars = [
    {
        id: 1,
        name: "Toyota Innova Zenix Hybrid",
        brand: "Toyota",
        model: "Innova Zenix",
        license_plate: "B 2468 PQR",
        year: 2024,
        category: "MPV",
        status: "available",
        transmission: "automatic",
        fuel_type: "Hybrid",
        seating_capacity: 7,
        price_per_day: 850000,
        location_id: 1,
        description: "MPV Hybrid premium, sangat irit BBM dan kabin senyap. Cocok untuk perjalanan bisnis atau keluarga.",
        photo_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            },
            {
                image_url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
                is_primary: false
            }
        ],
        features: ["Sunroof", "Captain Seat", "Hybrid Engine", "Apple CarPlay", "Toyota Safety Sense"],
        location: LOCATION_JAKARTA
    },
    {
        id: 2,
        name: "Honda Brio RS Urbanite",
        brand: "Honda",
        model: "Brio",
        license_plate: "B 1122 XYZ",
        year: 2023,
        category: "City Car",
        status: "rented",
        transmission: "automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 350000,
        location_id: 1,
        description: "City car lincah, irit, dan stylish. Pilihan tepat untuk membelah kemacetan Jakarta.",
        photo_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            }
        ],
        features: ["Touchscreen Display", "Parking Sensor", "ABS", "Eco Indicator"],
        location: LOCATION_JAKARTA
    },
    {
        id: 3,
        name: "Toyota Fortuner GR Sport",
        brand: "Toyota",
        model: "Fortuner",
        license_plate: "D 1890 RFD",
        year: 2024,
        category: "SUV",
        status: "available",
        transmission: "automatic",
        fuel_type: "Diesel",
        seating_capacity: 7,
        price_per_day: 1300000,
        location_id: 2,
        description: "SUV tangguh dengan tenaga besar. Siap untuk perjalanan jarak jauh dan medan berat.",
        photo_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            },
            {
                image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ebeed?auto=format&fit=crop&w=800&q=80",
                is_primary: false
            }
        ],
        features: ["Power Back Door", "Kick Sensor", "Wireless Charger", "Surround Monitor"],
        location: LOCATION_WESTJAVA
    },
    {
        id: 4,
        name: "Suzuki Jimny 5-Door",
        brand: "Suzuki",
        model: "Jimny",
        license_plate: "DK 8899 JP",
        year: 2024,
        category: "SUV",
        status: "available",
        transmission: "automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 950000,
        location_id: 3,
        description: "Explore Bali dengan gaya menggunakan Jimny 5 pintu. Cocok untuk medan menantang dan pantai.",
        photo_url: "https://images.unsplash.com/photo-1605218457223-2895f32a2656?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1605218457223-2895f32a2656?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            }
        ],
        features: ["4x4", "Apple CarPlay", "Roof Rack", "LED Headlights"],
        location: LOCATION_BALI
    },
    {
        id: 5,
        name: "Hyundai Stargazer X",
        brand: "Hyundai",
        model: "Stargazer",
        license_plate: "AB 5678 CD",
        year: 2023,
        category: "MPV",
        status: "available",
        transmission: "automatic",
        fuel_type: "Petrol",
        seating_capacity: 6,
        price_per_day: 650000,
        location_id: 4,
        description: "MPV futuristik dengan kenyamanan maksimal untuk travel keluarga di Yogyakarta.",
        photo_url: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            }
        ],
        features: ["Captain Seat", "Wireless Charger", "Bluelink", "Drive Mode"],
        location: LOCATION_YOGYAKARTA
    },
    {
        id: 6,
        name: "Mitsubishi Pajero Sport",
        brand: "Mitsubishi",
        model: "Pajero Sport",
        license_plate: "L 9988 SBY",
        year: 2023,
        category: "SUV",
        status: "available",
        transmission: "automatic",
        fuel_type: "Diesel",
        seating_capacity: 7,
        price_per_day: 1250000,
        location_id: 5,
        description: "SUV gagah untuk perjalanan bisnis atau wisata bromo dari Surabaya.",
        photo_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        images: [
            {
                image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
                is_primary: true
            }
        ],
        features: ["Sunroof", "Power Tailgate", "Active Stability Control", "Leather Seat"],
        location: LOCATION_EASTJAVA
    }
];

export const mockBookings = [
    {
        id: 1,
        user_id: 101,
        car_id: 1,
        pickup_date: "2025-12-25T10:00:00",
        return_date: "2025-12-27T10:00:00",
        total_price: 1700000,
        status: "completed",
        payment_status: "paid",
        created_at: "2025-12-20T09:00:00Z",
        car: {
            id: 1,
            name: "Toyota Innova Zenix Hybrid",
            brand: "Toyota",
            model: "Innova Zenix",
            year: 2024,
            location: {
                country: 'Indonesia',
                city: 'Jakarta Selatan',
                name: 'Jakarta Selatan'
            },
            photo_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 2,
        user_id: 101,
        car_id: 3,
        pickup_date: "2025-12-30T08:00:00",
        return_date: "2026-01-01T20:00:00",
        total_price: 3900000,
        status: "confirmed",
        payment_status: "paid",
        created_at: "2025-12-28T10:30:00Z",
        car: {
            id: 3,
            name: "Toyota Fortuner GR Sport",
            brand: "Toyota",
            model: "Fortuner",
            year: 2024,
            location: {
                country: 'Indonesia',
                city: 'Bandung',
                name: 'Stasiun Bandung'
            },
            photo_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 3,
        user_id: 101,
        car_id: 2,
        pickup_date: "2026-01-10T09:00:00",
        return_date: "2026-01-12T18:00:00",
        total_price: 1050000,
        status: "pending",
        payment_status: "pending",
        created_at: "2025-12-29T11:45:00Z",
        car: {
            id: 2,
            name: "Honda Brio RS Urbanite",
            brand: "Honda",
            model: "Brio",
            year: 2023,
            location: {
                country: 'Indonesia',
                city: 'Jakarta Barat',
                name: 'Jakarta Barat'
            },
            photo_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 4,
        user_id: 101,
        car_id: 1,
        pickup_date: "2025-11-20T08:00:00",
        return_date: "2025-11-21T20:00:00",
        total_price: 850000,
        status: "cancelled",
        payment_status: "refunded",
        created_at: "2025-11-15T14:20:00Z",
        car: {
            id: 1,
            name: "Toyota Innova Zenix Hybrid",
            brand: "Toyota",
            model: "Innova Zenix",
            year: 2024,
            location: {
                country: 'Indonesia',
                city: 'Jakarta Selatan',
                name: 'Jakarta Selatan'
            },
            photo_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
        }
    }
];