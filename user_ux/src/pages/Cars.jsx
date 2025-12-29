import React, { useCallback, useEffect, useState } from 'react'
import { SlidersHorizontal, X, Car, Settings, Fuel, MapPin, DollarSign } from 'lucide-react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { motion as Motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'

const Cars = () => {

  const { cars, axios } = useAppContext()

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const [input, setInput] = useState('')
  const [filteredCars, setFilteredCars] = useState([])
  const [baseCars, setBaseCars] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    transmission: '',
    fuel_type: '',
    province: '',
    maxPrice: '',
  })

  const hasSearchParams = Boolean(pickupLocation || pickupDate || returnDate)

  const searchCarAvailablity = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user/cars', {
        params: {
          pickup_date: pickupDate || undefined,
          return_date: returnDate || undefined,
        },
      })
      const list = Array.isArray(data) ? data : []
      const mapped = list.map((car) => {
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
      })
      setBaseCars(mapped)
    } catch (error) {
      console.error('Failed to fetch available cars by date', error)
      setBaseCars([])
    }
  }, [axios, pickupDate, returnDate])

  const applyFilter = useCallback(()=>{
    const source = baseCars.length ? baseCars : cars
    let filtered = source.slice()

    const query = input.trim().toLowerCase()
    if (query) {
      filtered = filtered.filter((car)=>{
        return car.brand.toLowerCase().includes(query)
        || car.model.toLowerCase().includes(query)  
        || car.category.toLowerCase().includes(query)  
        || car.transmission.toLowerCase().includes(query)
      })
    }

    if (pickupLocation) {
      const pickupLower = pickupLocation.toLowerCase()
      filtered = filtered.filter((car) => {
        const carLocation = (car.location || '').toLowerCase()
        if (!carLocation) {
          return false
        }
        return pickupLower.includes(carLocation)
      })
    }

    if (filters.category) {
      const categoryLower = filters.category.toLowerCase()
      filtered = filtered.filter(
        (car) => (car.category || '').toLowerCase() === categoryLower
      )
    }

    if (filters.transmission) {
      const transmissionLower = filters.transmission.toLowerCase()
      filtered = filtered.filter(
        (car) => (car.transmission || '').toLowerCase() === transmissionLower
      )
    }

    if (filters.fuel_type) {
      const fuelLower = filters.fuel_type.toLowerCase()
      filtered = filtered.filter(
        (car) => (car.fuel_type || '').toLowerCase() === fuelLower
      )
    }

    if (filters.province) {
      const provinceLower = filters.province.toLowerCase()
      filtered = filtered.filter(
        (car) => (car.location || '').toLowerCase() === provinceLower
      )
    }

    if (filters.maxPrice) {
      const max = Number(filters.maxPrice)
      if (!Number.isNaN(max) && max > 0) {
        filtered = filtered.filter((car) => car.pricePerDay <= max)
      }
    }

    setFilteredCars(filtered)
  }, [cars, baseCars, input, pickupLocation, filters])

  // lewati pengecekan availability ke backend saat develop FE
  useEffect(()=>{
    if (hasSearchParams && (pickupDate && returnDate)) {
      searchCarAvailablity()
    } else {
      setBaseCars([])
    }
  },[hasSearchParams, pickupDate, returnDate, searchCarAvailablity])

  useEffect(()=>{
    if (cars.length > 0 || baseCars.length > 0) {
      applyFilter()
    }
  },[cars.length, baseCars.length, applyFilter])

  const currentList = baseCars.length ? baseCars : cars
  const categories = Array.from(
    new Set(currentList.map((c) => c.category).filter(Boolean))
  )
  const transmissions = Array.from(
    new Set(currentList.map((c) => c.transmission).filter(Boolean))
  )
  const fuels = Array.from(
    new Set(currentList.map((c) => c.fuel_type).filter(Boolean))
  )
  const provinces = Array.from(
    new Set(currentList.map((c) => c.location).filter(Boolean))
  )

  return (
    <div>

      <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}

      className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title
          title='Available Cars'
          subTitle={
            hasSearchParams
              ? 'Showing cars based on your selected rental details'
              : 'Browse our selection of premium vehicles available for your next adventure'
          }
        />

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'
        >
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2'/>

          <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500'/>

          <button
            type='button'
            onClick={() => setShowFilters((prev) => !prev)}
            className='ml-2 p-1.5 rounded-full hover:bg-gray-100 transition'
          >
            <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5'/>
          </button>
        </Motion.div>

        <Motion.div
          initial={false}
          animate={
            showFilters
              ? { opacity: 1, height: 'auto', marginTop: 16 }
              : { opacity: 0, height: 0, marginTop: 0 }
          }
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='w-full max-w-140 overflow-hidden'
        >
          <div className='w-full bg-white rounded-2xl shadow px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-3'>
            <div className='flex flex-col text-sm'>
              <span className='mb-1 text-gray-500'>Category</span>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className='h-9 rounded-lg border border-borderColor px-2 text-gray-700 outline-none'
              >
                <option value=''>All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col text-sm'>
              <span className='mb-1 text-gray-500'>Transmission</span>
              <select
                value={filters.transmission}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    transmission: e.target.value,
                  }))
                }
                className='h-9 rounded-lg border border-borderColor px-2 text-gray-700 outline-none'
              >
                <option value=''>All</option>
                {transmissions.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col text-sm'>
              <span className='mb-1 text-gray-500'>Fuel type</span>
              <select
                value={filters.fuel_type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    fuel_type: e.target.value,
                  }))
                }
                className='h-9 rounded-lg border border-borderColor px-2 text-gray-700 outline-none'
              >
                <option value=''>All</option>
                {fuels.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col text-sm'>
              <span className='mb-1 text-gray-500'>Province / City</span>
              <select
                value={filters.province}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                className='h-9 rounded-lg border border-borderColor px-2 text-gray-700 outline-none'
              >
                <option value=''>All</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col text-sm'>
              <span className='mb-1 text-gray-500'>Max price / day</span>
              <input
                type='number'
                min='0'
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value,
                  }))
                }
                className='h-9 rounded-lg border border-borderColor px-2 text-gray-700 outline-none'
                placeholder='e.g. 500000'
              />
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

      className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index)=> (
            <Motion.div key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car}/>
            </Motion.div>
          ))}
        </div>
      </Motion.div>

    </div>
  )
}

export default Cars
