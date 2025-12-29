import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import { motion as Motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const MyBookings = () => {

  const { axios, token, formatCurrency } = useAppContext()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])

  const mapBookingFromApi = (b) => {
    const car = b.car || {}
    const locationObj = car.location || {}
    const locationName = locationObj.name || locationObj.city || ''
    const options = Array.isArray(b.options) ? b.options : []
    return {
      id: b.id,
      status: b.status,
      pickupDate: b.pickup_date,
      returnDate: b.return_date,
      price: b.total_price,
      createdAt: b.created_at,
      paymentMethod: b.payment_method,
      operatorId: 'Rent-A-Car',
      extras: options.map((opt) => opt.label),
      car: {
        image: car.photo_url,
        brand: car.brand,
        model: car.model,
        year: car.year,
        category: car.category,
        transmission: car.transmission,
        seating_capacity: car.seating_capacity,
        location: locationName,
      },
    }
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      const mapped = Array.isArray(data) ? data.map(mapBookingFromApi) : []
      setBookings(mapped)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch bookings')
    }
  }

  useEffect(() => {
    if (token) {
      fetchBookings()
    }
  }, [token])

  return (
    <Motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    
    className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm w-full'>

      <Title title='My Bookings'
       subTitle='View and manage your all car bookings'
       align="left"/>

       {!token ? (
        <div className='mt-12 text-gray-500'>
          <p>Please log in or create an account to view your bookings.</p>
        </div>
       ) : (
        <div>
          {bookings.map((booking, index)=>(
            <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            
            key={booking.id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'>
              {/* Car Image + Info */}

              <div className='md:col-span-1'>
                <div className='rounded-md overflow-hidden mb-3'>
                  <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover'/>
                </div>
                <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>

                <p className='text-gray-500'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
              </div>

              {/* Booking Info */}
              <div className='md:col-span-2'>
                <div className='flex items-center gap-2'>
                  <p className='px-3 py-1.5 bg-light rounded'>Booking #{index+1}</p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      booking.status === 'confirmed' || booking.status === 'completed'
                        ? 'bg-green-400/15 text-green-600'
                        : booking.status === 'pending'
                          ? 'bg-amber-400/15 text-amber-600'
                          : booking.status === 'cancelled'
                            ? 'bg-red-400/15 text-red-600'
                            : 'bg-gray-400/15 text-gray-600'
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>

                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                  <div>
                    <p className='text-gray-500'>Rental Period</p>
                    <p>{formatDateTime(booking.pickupDate)} To {formatDateTime(booking.returnDate)}</p>
                  </div>
                </div>

                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                  <div>
                    <p className='text-gray-500'>Pick-up Location</p>
                    <p>{booking.car.location}</p>
                  </div>
                </div>
              </div>

             <div className='md:col-span-1 flex flex-col justify-between gap-6'>
                <div className='text-sm text-gray-500 text-right'>
                  <p>Total Price</p>
                  <h1 className='text-2xl font-semibold text-primary'>{formatCurrency(booking.price)}</h1>
                  <p>Booked on {booking.createdAt.split('T')[0]}</p>
                </div>
                <button
                  type='button'
                  onClick={()=> navigate(`/my-bookings/${booking.id}`)}
                  className='ml-auto px-4 py-2 text-xs rounded-lg border border-borderColor hover:bg-light cursor-pointer'
                >
                  View details
                </button>
             </div>


            </Motion.div>
          ))}
         </div>
       )}
      
    </Motion.div>
  )
}

export default MyBookings
