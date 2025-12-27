import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

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

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])
    const [exchangeRates, setExchangeRates] = useState(null)

    const mapCarFromApi = (car) => {
        const locationObj = car.location || {}
        const locationName =
            locationObj.city ||
            locationObj.name ||
            locationObj.address ||
            ''

        const imageRecords = Array.isArray(car.images) ? car.images : []
        const imageUrls = imageRecords.map((img) => img.image_url)
        const primaryImage =
            imageRecords.find((img) => img.is_primary)?.image_url ||
            imageUrls[0] ||
            car.photo_url ||
            ''

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
            images: imageUrls,
            location: locationName,
            locationId: car.location_id,
            isAvaliable: car.status === 'available',
            description: car.description,
            features: Array.isArray(car.features) ? car.features : [],
        }
    }

    const fetchUser = async ()=>{
        try {
            const { data } = await axios.get('/api/user/data')
            setUser(data)
        } catch (error) {
            console.error('Failed to fetch user', error)
            toast.error('Session expired, please login again')
            logout()
        }
    }

    const fetchCars = async () =>{
        try {
            const { data } = await axios.get('/api/user/cars')
            const list = Array.isArray(data) ? data.map(mapCarFromApi) : []
            setCars(list)
        } catch (error) {
            console.error('Failed to fetch cars', error)
            toast.error('Failed to load cars')
        }
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

    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
        navigate('/')
    }

    useEffect(()=>{
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
            const storedToken = localStorage.getItem('token')
            if (storedToken) {
                setToken(storedToken)
            }
        }
        fetchCars()
    },[])

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchUser()
        }
    },[token])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, 
        pickupDate, setPickupDate, returnDate, setReturnDate,
        formatCurrency,
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
