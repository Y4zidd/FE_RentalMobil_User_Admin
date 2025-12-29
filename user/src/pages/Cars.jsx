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
    model: '',
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

  const applyFilter = useCallback(() => {
    const source = baseCars.length ? baseCars : cars
    let filtered = source.slice()

    const query = input.trim().toLowerCase()
    if (query) {
      filtered = filtered.filter((car) => {
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

    if (filters.model) {
      const modelLower = filters.model.toLowerCase()
      filtered = filtered.filter(
        (car) => (car.model || '').toLowerCase() === modelLower
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
  useEffect(() => {
    if (hasSearchParams && (pickupDate && returnDate)) {
      searchCarAvailablity()
    } else {
      setBaseCars([])
    }
  }, [hasSearchParams, pickupDate, returnDate, searchCarAvailablity])

  useEffect(() => {
    if (cars.length > 0 || baseCars.length > 0) {
      applyFilter()
    }
  }, [cars.length, baseCars.length, applyFilter])

  const currentList = cars
  const categories = Array.from(
    new Set(currentList.map((c) => c.category).filter(Boolean))
  )
  const models = Array.from(
    new Set(currentList.map((c) => c.model).filter(Boolean))
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
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />

          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500' />

          <button
            type='button'
            onClick={() => setShowFilters((prev) => !prev)}
            className='ml-2 p-1.5 rounded-full hover:bg-gray-100 transition'
          >
            <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5' />
          </button>
        </Motion.div>

        {showFilters && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4'>
            <Motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden'
            >
              <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                <p className='text-xl font-bold text-gray-900'>All filters</p>
                <button
                  type='button'
                  onClick={() => setShowFilters(false)}
                  className='text-xs px-2 py-1 rounded-full bg-slate-100 text-gray-600 hover:bg-slate-200'
                >
                  x
                </button>
              </div>
              <div className='flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm'>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1.5'>Category</p>
                  <div className='flex flex-wrap gap-3'>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type='button'
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            category: prev.category === cat ? '' : cat,
                          }))
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${filters.category === cat
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1.5'>Transmission</p>
                  <div className='flex flex-wrap gap-3'>
                    {transmissions.map((tr) => (
                      <button
                        key={tr}
                        type='button'
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            transmission: prev.transmission === tr ? '' : tr,
                          }))
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${filters.transmission === tr
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1.5'>Fuel type</p>
                  <div className='flex flex-wrap gap-3'>
                    {fuels.map((fuel) => (
                      <button
                        key={fuel}
                        type='button'
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            fuel_type: prev.fuel_type === fuel ? '' : fuel,
                          }))
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${filters.fuel_type === fuel
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1.5'>Province / City</p>
                  <div className='flex flex-wrap gap-3'>
                    {provinces.map((prov) => (
                      <button
                        key={prov}
                        type='button'
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            province: prev.province === prov ? '' : prov,
                          }))
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${filters.province === prov
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1.5'>Max price / day</p>
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
                    className='w-full h-10 rounded-lg border border-borderColor px-3 text-gray-700 outline-none'
                    placeholder='e.g. 500000'
                  />
                </div>
              </div>

              <div className='flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white'>
                <button
                  type='button'
                  onClick={() => {
                    setFilters({
                      category: '',
                      model: '',
                      transmission: '',
                      fuel_type: '',
                      province: '',
                      maxPrice: '',
                    })
                    setInput('')
                  }}
                  className='text-xs font-medium text-gray-500 hover:text-gray-700'
                >
                  Reset
                </button>
                <button
                  type='button'
                  onClick={() => setShowFilters(false)}
                  className='px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dull'
                >
                  Show {filteredCars.length} cars
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <Motion.div key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car} />
            </Motion.div>
          ))}
        </div>
      </Motion.div>

    </div>
  )
}

export default Cars
