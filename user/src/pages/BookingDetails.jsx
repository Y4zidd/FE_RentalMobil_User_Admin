import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { assets } from "../assets/assets"
import Title from "../components/Title"
import { useAppContext } from "../context/AppContext"
import { motion as Motion } from "motion/react"
import { ExternalLink, Headphones, ShieldCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  checkoutPaymentRequest,
  fetchUserBookingsRequest,
  markBookingPaidRequest,
} from "../lib/api/booking"

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, formatCurrency, t, language } = useAppContext()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

  const mapBookingFromApi = (b) => {
    const car = b.car || {}
    const locationObj = car.location || {}
    const locationName = locationObj.name || locationObj.city || ""
    const options = Array.isArray(b.options) ? b.options : []
    return {
      id: b.id,
      bookingId: b.id,
      status: b.status,
      pickupDate: b.pickup_date,
      returnDate: b.return_date,
      price: b.total_price,
      createdAt: b.created_at,
      paymentMethod: b.payment_method,
      operatorId: "Rent-A-Car",
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

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await fetchUserBookingsRequest()
        const list = Array.isArray(data) ? data.map(mapBookingFromApi) : []
        const found = list.find((item) => String(item.id) === String(id))
        setBooking(found || null)
      } catch (error) {
        console.error(error)
        toast.error(t('booking_details_toast_failed_fetch'))
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [token, id])

  if (loading) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-5xl mx-auto w-full">
        <p className="text-gray-600">{t('booking_details_loading')}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-gray-500 cursor-pointer"
        >
          <img
            src={assets.arrow_icon}
            alt=""
            className="h-4 w-4 rotate-180 opacity-65"
          />
          {t('booking_details_back')}
        </button>
        <p className="text-gray-600">{t('booking_details_not_found')}</p>
      </div>
    )
  }

  const canRetryPayment =
    booking.paymentMethod === "online_full" && booking.status === "pending"

  const handleRetryPayment = async () => {
    if (!token) {
      toast.error(t('booking_details_toast_login_required'))
      return
    }
    if (!window.snap) {
      toast.error(t('booking_details_toast_payment_service_unavailable'))
      return
    }

    setIsPaying(true)
    try {
      const { data: payment } = await checkoutPaymentRequest(booking.bookingId)

      if (payment.token && window.snap) {
        window.snap.pay(payment.token, {
          onSuccess: async () => {
            try {
              await markBookingPaidRequest(booking.bookingId)
            } catch (error) {
              console.error(error)
            }
            toast.success(t('booking_details_toast_payment_success'))
            navigate("/my-bookings")
          },
          onPending: () => {
            toast.success(t('booking_details_toast_payment_pending'))
            navigate("/my-bookings")
          },
          onError: () => {
            toast.error(t('booking_details_toast_payment_failed'))
          },
          onClose: () => {
            toast(t('booking_details_toast_payment_popup_closed'))
          },
        })
      } else {
        toast.error(t('booking_details_toast_payment_start_failed'))
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || t('booking_details_toast_payment_init_failed'))
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 text-sm max-w-5xl mx-auto w-full"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <img
            src={assets.arrow_icon}
            alt=""
            className="h-4 w-4 rotate-180 opacity-65 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-medium">{t('booking_details_back_to_bookings')}</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('booking_details_heading')}</h1>
        <p className="text-gray-500 text-base mb-8">{t('booking_details_subtitle')}</p>

        {/* Card 1: Car Summary */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8"
        >
          <div className="h-64 md:h-80 w-full bg-gray-100 relative items-center justify-center flex">
            <img
              src={booking.car.image}
              alt={booking.car.model}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{booking.car.brand} {booking.car.model}</h2>
            <p className="text-gray-500">
              {booking.car.year} • {booking.car.category} • {booking.car.location}
            </p>
          </div>
        </Motion.div>

        {/* Card 2: Booking Details & Breakdown */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h3 className="text-lg font-bold text-gray-900">{t('booking_details_information_heading')}</h3>
            <span
              className={`px-4 py-1.5 text-xs font-semibold rounded-md uppercase tracking-wide w-fit ${
                booking.status === "confirmed" || booking.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="flex flex-col mb-6">
            {/* Row 1: ID and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_booking_id_label')}</p>
                <p className="text-base font-medium text-gray-900">#{String(booking.id || booking.bookingId).slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_status_label')}</p>
                <p className="text-base font-medium text-gray-900 capitalize">{booking.status}</p>
              </div>
            </div>

            {/* Row 2: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_pickup_date_label')}</p>
                <p className="text-base font-medium text-gray-900 mb-0.5">
                  {new Date(booking.pickupDate).toLocaleDateString(
                    language === 'id' ? 'id-ID' : 'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(booking.pickupDate).toLocaleTimeString(
                    language === 'id' ? 'id-ID' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_dropoff_date_label')}</p>
                <p className="text-base font-medium text-gray-900 mb-0.5">
                  {new Date(booking.returnDate).toLocaleDateString(
                    language === 'id' ? 'id-ID' : 'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(booking.returnDate).toLocaleTimeString(
                    language === 'id' ? 'id-ID' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
              </div>
            </div>

            <div className="pb-6 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_pickup_location_label')}</p>
              <p className="text-base font-medium text-gray-900">{booking.car.location}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_payment_method_label')}</p>
                <p className="text-base font-medium text-gray-900">
                  {booking.paymentMethod === "online_full" ? t('booking_details_payment_method_online') : t('booking_details_payment_method_location')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{t('booking_details_payment_status_label')}</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {booking.status === "completed" || booking.status === "confirmed"
                    ? t('booking_details_payment_status_paid')
                    : booking.status === "pending"
                      ? t('booking_details_payment_status_pending')
                      : t('booking_details_payment_status_unpaid')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 mt-6">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('booking_details_rental_duration')}</span>
                <span className="font-medium text-gray-900">
                  {Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)))} {t('booking_details_days_suffix')}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('booking_details_daily_rate')}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.price / Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24))))}
                </span>
              </div>
              {booking.extras && booking.extras.length > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>{t('booking_details_extras')}</span>
                  <span className="font-medium text-gray-900">{t('booking_details_extras_included')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('booking_details_insurance')}</span>
                <span className="font-medium text-gray-900">{t('booking_details_insurance_included')}</span>
              </div>
            </div>
            <div className="h-px bg-gray-200 mt-3 mb-3"></div>
            <div className="flex justify-between items-end">
              <span className="font-bold text-gray-900 text-base">{t('booking_details_total_amount')}</span>
              <span className="font-bold text-primary text-xl md:text-2xl">{formatCurrency(booking.price)}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition-colors"
            >
              {t('booking_details_download_receipt')}
            </button>

            {canRetryPayment && (
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={isPaying}
                className="px-8 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dull transition-colors shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPaying ? t('booking_details_pay_now_processing') : t('booking_details_pay_now')}
              </button>
            )}
          </div>
        </Motion.div>
      </Motion.div>
    </div>
  )
}

export default BookingDetails
