import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { mockUser, mockCars, mockBookings } from "../assets/mockData";

const DEFAULT_CURRENCY = {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
}

const ASEAN_CURRENCY_BY_COUNTRY = {
    Indonesia: DEFAULT_CURRENCY,
    Singapore: {
        code: 'SGD',
        symbol: 'S$',
        locale: 'en-SG',
    },
    Malaysia: {
        code: 'MYR',
        symbol: 'RM',
        locale: 'ms-MY',
    },
    Thailand: {
        code: 'THB',
        symbol: '฿',
        locale: 'th-TH',
    },
    Philippines: {
        code: 'PHP',
        symbol: '₱',
        locale: 'en-PH',
    },
    Vietnam: {
        code: 'VND',
        symbol: '₫',
        locale: 'vi-VN',
    },
    Brunei: {
        code: 'BND',
        symbol: 'B$',
        locale: 'ms-BN',
    },
    Cambodia: {
        code: 'KHR',
        symbol: '៛',
        locale: 'km-KH',
    },
    Laos: {
        code: 'LAK',
        symbol: '₭',
        locale: 'lo-LA',
    },
    Myanmar: {
        code: 'MMK',
        symbol: 'K',
        locale: 'my-MM',
    },
}

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate()
    const [token, setToken] = useState("demo-token")
    const [user, setUser] = useState(mockUser)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const mapCarFromApi = (car) => {
        const locationObj = car.location || {}
        let locationName =
            locationObj.city ||
            locationObj.name ||
            locationObj.address ||
            ""
        let provinceName = locationObj.city || ""
        let countryName = locationObj.country || ""

        if (car.location && typeof car.location === 'object') {
            const city = car.location.city || ''
            const country = car.location.country || ''
            locationName = city && country ? `${country}, ${city}` : (city || country || car.location.name || '')
            provinceName = city
            countryName = country
        } else if (!locationName) {
            if (car.location_name) {
                locationName = car.location_name
            } else if (car.location_id === 1) {
                locationName = "Indonesia, Jakarta"
                provinceName = "Jakarta"
                countryName = "Indonesia"
            } else if (car.location_id === 2) {
                locationName = "Indonesia, Surabaya"
                provinceName = "Surabaya"
                countryName = "Indonesia"
            }
        }

        const imageRecords = Array.isArray(car.images) ? car.images : []
        const imageUrls = imageRecords.map((img) => img.image_url)
        const primaryImage =
            imageRecords.find((img) => img.is_primary)?.image_url ||
            imageUrls[0] ||
            car.photo_url ||
            ""

        return {
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            category: car.category,
            transmission: car.transmission,
            fuel_type: car.fuel_type,
            seating_capacity: car.seating_capacity,
            pricePerDay: Number(car.price_per_day),
            image: primaryImage,
            images: imageUrls.length ? imageUrls : [primaryImage].filter(Boolean),
            location: locationName,
            province: provinceName,
            country: countryName,
            locationId: car.location_id,
            isAvaliable: car.status === "available",
            description: car.description,
            features: Array.isArray(car.features) ? car.features : [],
        }
    }

    const initialCars = Array.isArray(mockCars)
        ? mockCars.map(mapCarFromApi)
        : []

    const [cars, setCars] = useState(initialCars)
    const [exchangeRates, setExchangeRates] = useState(null)
    const [bookings, setBookings] = useState(
        Array.isArray(mockBookings) ? mockBookings : []
    )

    const fetchUser = async () => {
        setUser(mockUser)
    }

    const fetchCars = async () => {
        setCars(initialCars)
    }

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/IDR')
                if (!res.ok) {
                    return
                }
                const data = await res.json()
                if (data.result !== 'success' || !data.rates) {
                    return
                }
                setExchangeRates(data.rates)
            } catch (error) {
                console.error('Failed to fetch exchange rates', error)
            }
        }

        fetchRates()
    }, [])

    const getUserCountry = () => {
        const defaultCity = user?.default_city || ''
        if (!defaultCity) {
            return 'Indonesia'
        }
        const parts = defaultCity.split(',').map((part) => part.trim()).filter(Boolean)
        if (parts.length >= 2) {
            return parts[1]
        }
        return parts[0] || 'Indonesia'
    }

    const getCurrencyConfig = () => {
        const country = getUserCountry()
        const config = ASEAN_CURRENCY_BY_COUNTRY[country]
        return config || DEFAULT_CURRENCY
    }

    const formatCurrency = (value) => {
        const number = Number(value) || 0
        const { locale, code } = getCurrencyConfig()

        if (!number) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(0)
        }

        if (code === 'IDR' || !exchangeRates || !exchangeRates[code]) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(Math.round(number))
        }

        const rate = exchangeRates[code]
        const amountInTarget = number * rate

        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code,
        })
        return formatter.format(Math.round(amountInTarget))
    }

    const currency = getCurrencyConfig().symbol

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        toast.success('You have been logged out')
        navigate('/')
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const shouldLogout = params.get('logout') === '1'
            if (shouldLogout) {
                logout()
                params.delete('logout')
                const newSearch = params.toString()
                const newUrl = window.location.origin + window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash
                window.history.replaceState(null, '', newUrl)
                fetchCars()
                return
            }
            if (!localStorage.getItem('token')) {
                localStorage.setItem('token', 'demo-token')
            }
        }
        fetchCars()
        fetchUser()
    }, [])

    const value = {
        navigate,
        currency,
        user,
        setUser,
        token,
        setToken,
        fetchUser,
        showLogin,
        setShowLogin,
        logout,
        fetchCars,
        cars,
        setCars,
        bookings,
        setBookings,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate,
        formatCurrency,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}
