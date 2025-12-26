import React, { useCallback, useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { motion as Motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'

const Cars = () => {

  const { cars } = useAppContext()

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const [input, setInput] = useState('')
  const [filteredCars, setFilteredCars] = useState([])

  const hasSearchParams = Boolean(pickupLocation || pickupDate || returnDate)

  const applyFilter = useCallback(()=>{
    let filtered = cars.slice()

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

    setFilteredCars(filtered)
  }, [cars, input, pickupLocation])

  // lewati pengecekan availability ke backend saat develop FE
  // useEffect(()=>{
  //   isSearchData && searchCarAvailablity()
  // },[])

  useEffect(()=>{
    if (cars.length > 0) {
      applyFilter()
    }
  },[cars.length, applyFilter])

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

        className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2'/>

          <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500'/>

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2'/>
        </Motion.div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

      className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
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
