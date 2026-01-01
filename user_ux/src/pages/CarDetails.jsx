import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion as Motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0')
  const minutes = index % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

const CarDetails = () => {

  const { id } = useParams()

  const { cars, pickupDate, setPickupDate, returnDate, setReturnDate, token, setShowLogin, formatCurrency, t } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isHoveringMain, setIsHoveringMain] = useState(false)
  const [pickupTime, setPickupTime] = useState('09:00')
  const [returnTime, setReturnTime] = useState('10:00')

  /* Restoring booking options state */
  const [bookingOptions, setBookingOptions] = useState({
    theftProtection: false,
    collisionDamage: false,
    fullInsurance: false,
    additionalDriver: false,
  })

  const optionConfig = [
    {
      id: 'theftProtection',
      labelKey: 'extras_theft_label',
      descriptionKey: 'extras_theft_description',
      pricePerDay: 60000,
    },
    {
      id: 'collisionDamage',
      labelKey: 'extras_collision_label',
      descriptionKey: 'extras_collision_description',
      pricePerDay: 60000,
    },
    {
      id: 'fullInsurance',
      labelKey: 'extras_full_insurance_label',
      descriptionKey: 'extras_full_insurance_description',
      pricePerDay: 90000,
    },
    {
      id: 'additionalDriver',
      labelKey: 'extras_driver_service_label',
      descriptionKey: 'extras_driver_service_description',
      pricePerDay: 200000,
    },
  ]

  const [expandedOptions, setExpandedOptions] = useState({})

  const toggleOption = (id) => {
    setBookingOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleDescription = (id, e) => {
    e.stopPropagation()
    setExpandedOptions((prev) => ({
      ...prev,
      [id]: !prev[id]
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

  // Restore cost scaling
  const extrasPerDay = optionConfig.reduce(
    (sum, opt) => (bookingOptions[opt.id] ? sum + opt.pricePerDay : sum),
    0,
  )
  const extrasCost = rentalDays * extrasPerDay
  const totalCost = baseCost + extrasCost

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!pickupDate || !returnDate) {
      toast.error(t('car_details_toast_dates_required'))
      return
    }

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`)
    const returnDateTime = new Date(`${returnDate}T${returnTime}`)

    if (isNaN(pickupDateTime.getTime()) || isNaN(returnDateTime.getTime())) {
      toast.error(t('car_details_toast_times_invalid'))
      return
    }

    if (returnDateTime <= pickupDateTime) {
      toast.error(t('car_details_toast_return_after_pickup'))
      return
    }

    if (!token) {
      toast.error(t('car_details_toast_login_required'))
      setShowLogin(true)
      return
    }

    navigate('/checkout', {
      state: {
        carId: car.id,
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
        preselectedOptions: bookingOptions
      }
    })
  }

  useEffect(() => {
    const list = Array.isArray(cars) ? cars : []
    const foundCar = list.find(car => String(car.id ?? car._id) === String(id))
    setCar(foundCar)
    if (foundCar) {
      const carImages = Array.isArray(foundCar.images) && foundCar.images.length ? foundCar.images : [foundCar.image]
      setActiveImage(carImages[0])
    }
  }, [cars, id])

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

      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        {t('car_details_back_to_cars')}
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

              src={activeImage || (images[0] || '')} alt="" className='w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-xl shadow-md' />
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
            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} ${t('car_card_seats')}` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center justify-center bg-light p-4 rounded-lg min-h-24'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  <p className='w-full text-center whitespace-normal break-words leading-tight'>{text}</p>
                </Motion.div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>{t('car_details_description_heading')}</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {car.features && car.features.length > 0 && (
              <div>
                <h1 className='text-xl font-medium mb-3'>{t('car_details_features_heading')}</h1>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {car.features.map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </Motion.div>
        </Motion.div>

        {/* Right: Booking Form */}
        <Motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}

          onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{formatCurrency(car.pricePerDay)}<span className='text-base text-gray-400 font-normal'>{t('car_card_per_day')}</span></p>

          <hr className='border-borderColor my-6' />

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <div className='grid grid-cols-[2fr,1fr] gap-2'>
              <input
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                type="date"
                className='border border-borderColor px-3 py-2 rounded-lg'
                required
                id='pickup-date'
                min={new Date().toISOString().split('T')[0]}
              />
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className='border border-borderColor px-3 py-2 rounded-lg'
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <div className='grid grid-cols-[2fr,1fr] gap-2'>
              <input
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                type="date"
                className='border border-borderColor px-3 py-2 rounded-lg'
                required
                id='return-date'
              />
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className='border border-borderColor px-3 py-2 rounded-lg'
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <p>{t('car_details_additional_services_heading')}</p>
            <div className='border border-borderColor rounded-xl p-4 space-y-3'>
              {optionConfig.map((opt) => (
                <div key={opt.id} className='flex flex-col rounded-lg hover:bg-light transition-colors'>
                  <div
                    className='w-full flex items-center justify-between gap-3 px-3 py-2 cursor-pointer'
                    onClick={() => toggleOption(opt.id)}
                  >
                    <div className='flex items-center gap-3'>
                      <button
                        type='button'
                        onClick={(e) => toggleDescription(opt.id, e)}
                        className={`p-1 rounded-full hover:bg-gray-200 transition-transform ${expandedOptions[opt.id] ? 'rotate-90' : ''}`}
                      >
                        <ChevronRight className='w-3 h-3 text-gray-500' />
                      </button>
                      <div className='text-left'>
                        <p className='text-sm text-gray-800'>{t(opt.labelKey)}</p>
                        <p className='text-xs text-gray-400'>
                          {rentalDays > 0
                            ? `+ ${formatCurrency(opt.pricePerDay * rentalDays)}`
                            : `+ ${formatCurrency(opt.pricePerDay)}/day`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border border-borderColor transition-colors ${bookingOptions[opt.id] ? 'bg-primary' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${bookingOptions[opt.id] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </span>
                  </div>
                  {expandedOptions[opt.id] && (
                    <div className='px-3 pb-2 ml-9'>
                      <p className='text-xs text-gray-500'>{t(opt.descriptionKey)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <p>{t('car_details_your_booking_details_heading')}</p>
            <div className='border border-borderColor rounded-xl p-4'>
              {rentalDays > 0 ? (
                <div className='text-sm text-gray-600 space-y-1'>
                  <p>
                    {t('car_details_days_label')}: <span className='font-semibold text-gray-800'>{rentalDays}</span>
                  </p>
                  <p>
                    {t('car_details_pickup_label')}: <span className='font-medium'>{pickupDate} {pickupTime}</span>
                  </p>
                  <p>
                    {t('car_details_return_label')}: <span className='font-medium'>{returnDate} {returnTime}</span>
                  </p>
                  <p className='flex items-center justify-between pt-2 mt-2 border-t border-borderColor'>
                    <span className='text-gray-700'>{t('car_details_estimated_total_label')}</span>
                    <span className='font-semibold text-gray-900'>{formatCurrency(totalCost)}</span>
                  </p>
                </div>
              ) : (
                <p className='text-xs text-gray-400'>{t('car_details_select_dates_hint')}</p>
              )}
            </div>
          </div>

          <div className='bg-primary/5 rounded-lg p-3 text-xs text-primary/80 mb-4 flex items-start gap-2'>
            <img src={assets.check_icon} className='w-4 h-4 mt-0.5 opacity-50' alt="" />
            <p>{t('car_details_free_cancellation_prefix')} {new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}{t('car_details_free_cancellation_suffix')}</p>
          </div>

          <button
            type='submit'
            className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'
          >
            {t('car_details_continue_button')}
          </button>

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
                    className={`relative w-full overflow-hidden rounded-md border ${activeImage === img ? 'border-primary' : 'border-borderColor'
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
