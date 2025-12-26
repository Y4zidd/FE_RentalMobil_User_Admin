import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion as Motion } from 'motion/react'

const CarDetails = () => {

  const {id} = useParams()

  const {cars, pickupDate, setPickupDate, returnDate, setReturnDate, axios, token, setShowLogin, formatCurrency, currency} = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isHoveringMain, setIsHoveringMain] = useState(false)
  const [loading, setLoading] = useState(false)

  const [bookingOptions, setBookingOptions] = useState({
    theftProtection: false,
    collisionDamage: false,
    fullInsurance: false,
    additionalDriver: false,
  })

  const [paymentMethod, setPaymentMethod] = useState('pay_at_location')

  const optionConfig = [
    {
      id: 'theftProtection',
      label: 'Theft protection',
      description: '+ $24 ($8/day)',
      pricePerDay: 8,
    },
    {
      id: 'collisionDamage',
      label: 'Collision damage waiver',
      description: '+ $24 ($8/day)',
      pricePerDay: 8,
    },
    {
      id: 'fullInsurance',
      label: 'Full insurance',
      description: '+ $54 ($18/day)',
      pricePerDay: 18,
    },
    {
      id: 'additionalDriver',
      label: 'Additional driver',
      description: '+ $60 ($20/day)',
      pricePerDay: 20,
    },
  ]

  const toggleOption = (id) => {
    setBookingOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getRentalDays = () => {
    if (!pickupDate || !returnDate) return 0
    const start = new Date(pickupDate)
    const end = new Date(returnDate)
    const diff = end - start
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const rentalDays = getRentalDays()
  const baseCost = rentalDays * (car?.pricePerDay || 0)
  const extrasPerDay = optionConfig.reduce(
    (sum, opt) => (bookingOptions[opt.id] ? sum + opt.pricePerDay : sum),
    0,
  )
  const extrasCost = rentalDays * extrasPerDay
  const totalCost = baseCost + extrasCost

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pickupDate || !returnDate) {
      toast.error('Please select pickup and return dates')
      return
    }

    if (!token) {
      toast.error('Please login or register before making a booking')
      setShowLogin(true)
      return
    }

    setLoading(true)
    try {
      const selectedOptions = optionConfig
        .filter((opt) => bookingOptions[opt.id])
        .map((opt) => ({
          code: opt.id,
          label: opt.label,
          price: opt.pricePerDay,
        }))

      const payload = {
        car_id: car.id,
        pickup_date: pickupDate,
        return_date: returnDate,
        payment_method: paymentMethod,
        pickup_location_id: car.locationId,
        dropoff_location_id: car.locationId,
        options: selectedOptions,
      }

      const { data: booking } = await axios.post('/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (paymentMethod === 'online_full') {
        try {
          const { data: payment } = await axios.post(
            '/api/payments/checkout',
            { booking_id: booking.id },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )

          if (payment.token && window.snap) {
            window.snap.pay(payment.token, {
              onSuccess: async () => {
                try {
                  await axios.post(
                    `/api/bookings/${booking.id}/mark-paid`,
                    {},
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  )
                } catch (error) {
                  console.log(error)
                }
                toast.success('Payment successful')
                navigate('/my-bookings')
              },
              onPending: () => {
                toast.success('Payment pending, we will update your booking soon')
                navigate('/my-bookings')
              },
              onError: () => {
                toast.error('Payment failed')
              },
              onClose: () => {
                toast('Payment popup was closed without completing the payment')
              },
            })
          } else {
            toast.error('Failed to start payment session')
          }
        } catch (error) {
          console.log(error)
          toast.error(error.response?.data?.message || 'Payment initialization failed')
        }
      } else {
        toast.success('Booking created successfully')
        navigate('/my-bookings')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    const list = Array.isArray(cars) ? cars : []
    const foundCar = list.find(car => String(car.id ?? car._id) === String(id))
    setCar(foundCar)
    if (foundCar) {
      const carImages = Array.isArray(foundCar.images) && foundCar.images.length ? foundCar.images : [foundCar.image]
      setActiveImage(carImages[0])
    }
  },[cars, id])

  const images = car ? (Array.isArray(car.images) && car.images.length ? car.images : [car.image]) : []

  useEffect(() => {
    if (!isHoveringMain || images.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setActiveImage((current) => {
        if (!images.length) {
          return current
        }

        const currentIndex = images.indexOf(current || images[0])
        const nextIndex = currentIndex === -1 || currentIndex === images.length - 1 ? 0 : currentIndex + 1
        return images[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isHoveringMain, images])

  const openGallery = () => {
    if (images.length) {
      setIsGalleryOpen(true)
    }
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
  }

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65'/>
        Back to all cars
       </button>

       <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
          {/* Left: Car Image & Details */}
          <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
              <div
                className='mb-6 relative cursor-zoom-in'
                onDoubleClick={openGallery}
                onMouseEnter={() => setIsHoveringMain(true)}
                onMouseLeave={() => setIsHoveringMain(false)}
              >
                <Motion.img 
                key={activeImage || (images[0] || '')}
                initial={{ opacity: 0, scale: 0.98, x: 24 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}

                src={activeImage || (images[0] || '')} alt="" className='w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-xl shadow-md'/>
                {images.length > 0 && (
                  <button
                    type='button'
                    onClick={openGallery}
                    className='absolute bottom-3 right-3 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 flex items-center gap-1 hover:bg-black/80'
                  >
                    <span className='inline-flex h-3 w-3 items-center justify-center'>
                      <span className='grid grid-cols-2 gap-0.5'>
                        <span className='h-1.5 w-1.5 bg-white/80 rounded-[1px]' />
                        <span className='h-1.5 w-1.5 bg-white/80 rounded-[1px]' />
                        <span className='h-1.5 w-1.5 bg-white/80 rounded-[1px]' />
                        <span className='h-1.5 w-1.5 bg-white/80 rounded-[1px]' />
                      </span>
                    </span>
                    Gallery
                  </button>
                )}
              </div>
              <Motion.div className='space-y-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div>
                  <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
                  <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
                </div>
                <hr className='border-borderColor my-6'/>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {[
                    {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                    {icon: assets.fuel_icon, text: car.fuel_type},
                    {icon: assets.car_icon, text: car.transmission},
                    {icon: assets.location_icon, text: car.location},
                  ].map(({icon, text})=>(
                    <Motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    
                    key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                      <img src={icon} alt="" className='h-5 mb-2'/>
                      {text}
                    </Motion.div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Description</h1>
                  <p className='text-gray-500'>{car.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Features</h1>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {
                      ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item)=>(
                        <li key={item} className='flex items-center text-gray-500'>
                          <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                          {item}
                        </li>
                      ))
                    }
                  </ul>
                </div>

              </Motion.div>
          </Motion.div>

          {/* Right: Booking Form */}
          <Motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{formatCurrency(car.pricePerDay)}<span className='text-base text-gray-400 font-normal'>per day</span></p> 

            <hr className='border-borderColor my-6'/>

            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <input value={pickupDate} onChange={(e)=>setPickupDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]}/>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="return-date">Return Date</label>
              <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)}
              type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date'/>
            </div>

            <div className='flex flex-col gap-2'>
              <p>Your booking options</p>
              <div className='border border-borderColor rounded-xl p-4 space-y-3'>
                {optionConfig.map((opt) => (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => toggleOption(opt.id)}
                    className='w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-light transition-colors'
                  >
                    <div className='text-left'>
                      <p className='text-sm text-gray-800'>{opt.label}</p>
                      <p className='text-xs text-gray-400'>{opt.description}</p>
                    </div>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border border-borderColor transition-colors ${
                        bookingOptions[opt.id] ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          bookingOptions[opt.id] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label>Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='w-full border border-borderColor px-3 py-2 rounded-lg text-gray-700 bg-white'
              >
                <option value='pay_at_location'>Pay at pick-up location</option>
                <option value='online_full'>Pay full online</option>
              </select>
            </div>

            {paymentMethod === 'online_full' && (
              <div className='rounded-xl border border-dashed border-primary/60 bg-primary/5 px-4 py-3 text-sm text-gray-700 space-y-1'>
                <p className='font-medium text-primary'>Online payment via Midtrans</p>
                <p className='text-xs text-gray-500'>
                  Payment gateway UI (Midtrans) will appear here. For now this is only a preview section while
                  designing the frontend.
                </p>
              </div>
            )}

            <div className='flex flex-col gap-2'>
              <p>Your booking details</p>
              <div className='border border-borderColor rounded-xl p-4'>
                {rentalDays > 0 ? (
                  <div className='text-sm text-gray-600 space-y-1'>
                    <p>
                      Days: <span className='font-semibold text-gray-800'>{rentalDays}</span>
                    </p>
                    <p>
                      Pickup date: <span className='font-medium'>{pickupDate}</span>
                    </p>
                    <p>
                      Return date: <span className='font-medium'>{returnDate}</span>
                    </p>
                    <p>
                      Location: <span className='font-medium'>{car.location}</span>
                    </p>
                    <p>
                      Car: <span className='font-medium'>{car.brand} {car.model} ({currency}{car.pricePerDay}/day)</span>
                    </p>
                    <p className='flex items-center justify-between pt-2 mt-2 border-t border-borderColor'>
                      <span className='text-gray-700'>Estimated total</span>
                      <span className='font-semibold text-gray-900'>{currency}{totalCost}</span>
                    </p>
                  </div>
                ) : (
                  <p className='text-xs text-gray-400'>Select pickup and return dates to see booking details and total price.</p>
                )}
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-primary hover:bg-primary-dull disabled:opacity-70 disabled:cursor-not-allowed transition-all py-3 font-medium text-white rounded-xl cursor-pointer'
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>

            <p className='text-center text-sm'>No credit card required to reserve</p>

          </Motion.form>
       </div>

       {isGalleryOpen && (
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4'
        >
          <Motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.9 }}
            className='bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-8' />
              <h2 className='flex-1 text-center text-lg sm:text-xl font-semibold text-gray-900'>
                {car.brand} {car.model} {car.year}
              </h2>
              <button
                type='button'
                onClick={closeGallery}
                className='h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100'
              >
                ×
              </button>
            </div>

            <div className='mb-4'>
              <img
                src={activeImage || (images[0] || '')}
                alt=''
                className='w-full max-h-[60vh] object-cover rounded-lg'
              />
            </div>

            {images.length > 1 && (
              <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2'>
                {images.map((img, index) => (
                  <button
                    key={img + index + 'modal'}
                    type='button'
                    onClick={() => setActiveImage(img)}
                    className={`relative w-full overflow-hidden rounded-md border ${
                      activeImage === img ? 'border-primary' : 'border-borderColor'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${car.brand} ${car.model} ${index + 1}`}
                      className='h-24 w-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </Motion.div>
        </Motion.div>
       )}

    </div>
  ) : <Loader />
}

export default CarDetails
