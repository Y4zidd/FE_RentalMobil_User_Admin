import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const formatRupiah = (value) => {
    const number = Number(value) || 0
    const formatter = new Intl.NumberFormat('id-ID')
    return `Rp ${formatter.format(Math.round(number))}`
}

export const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = 'Rp'

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])

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
        formatCurrency: formatRupiah,
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
