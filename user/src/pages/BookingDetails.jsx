import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { assets } from "../assets/assets"
import Title from "../components/Title"
import { useAppContext } from "../context/AppContext"
import { motion as Motion } from "motion/react"
import { ExternalLink, Headphones, ShieldCheck } from "lucide-react"
import { toast } from "react-hot-toast"

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { axios, token, formatCurrency } = useAppContext()

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
      operatorId: "CarRental",
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
        const { data } = await axios.get("/api/bookings/user")
        const list = Array.isArray(data) ? data.map(mapBookingFromApi) : []
        const found = list.find((item) => String(item.id) === String(id))
        setBooking(found || null)
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch booking details")
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [axios, token, id])

  if (loading) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-5xl mx-auto w-full">
        <p className="text-gray-600">Loading booking details...</p>
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
          Back
        </button>
        <p className="text-gray-600">Booking not found.</p>
      </div>
    )
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

  const rentalPeriod =
    formatDateTime(booking.pickupDate) +
    " - " +
    formatDateTime(booking.returnDate)

  const canRetryPayment =
    booking.paymentMethod === "online_full" &&
    booking.status !== "confirmed"

  const handleRetryPayment = async () => {
    if (!token) {
      toast.error("Please login again to continue payment")
      return
    }
    if (!window.snap) {
      toast.error("Payment service is not available right now")
      return
    }

    setIsPaying(true)
    try {
      const { data: payment } = await axios.post(
        "/api/payments/checkout",
        { booking_id: booking.bookingId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (payment.token && window.snap) {
        window.snap.pay(payment.token, {
          onSuccess: async () => {
            try {
              await axios.post(
                `/api/bookings/${booking.bookingId}/mark-paid`,
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              )
            } catch (error) {
              console.error(error)
            }
            toast.success("Payment successful")
            navigate("/my-bookings")
          },
          onPending: () => {
            toast.success("Payment pending, we will update your booking soon")
            navigate("/my-bookings")
          },
          onError: () => {
            toast.error("Payment failed")
          },
          onClose: () => {
            toast("Payment popup was closed without completing the payment")
          },
        })
      } else {
        toast.error("Failed to start payment session")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Payment initialization failed")
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-5xl mx-auto w-full"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-gray-500 cursor-pointer"
      >
        <img
          src={assets.arrow_icon}
          alt=""
          className="h-4 w-4 rotate-180 opacity-65"
        />
        Back to bookings
      </button>

      <div className="mb-6">
        <Title
          title="Booking Details"
          subTitle="Review the details of your car rental booking"
          align="left"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.6fr,1.4fr] gap-8 items-start">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-borderColor rounded-xl overflow-hidden self-start"
        >
          <img
            src={booking.car.image}
            alt=""
            className="w-full h-48 sm:h-56 md:h-60 lg:h-64 object-cover"
          />
          <div className="p-5 space-y-2">
            <p className="text-lg font-semibold">
              {booking.car.brand} {booking.car.model}
            </p>
            <p className="text-gray-500">
              {booking.car.year} • {booking.car.category} •{" "}
              {booking.car.location}
            </p>
            <p className="text-gray-500">
              Rental operator:{" "}
              <span className="font-medium text-gray-700">
                {booking.operatorId}
              </span>
            </p>
          </div>
        </Motion.div>

        <div className="space-y-6">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="border border-borderColor rounded-xl p-5 space-y-4 h-max"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Booking ID</p>
                <p className="text-sm font-medium">{booking._id}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${booking.status === "confirmed"
                    ? "bg-green-400/15 text-green-600"
                    : booking.status === "pending"
                      ? "bg-amber-400/15 text-amber-700"
                      : "bg-red-400/15 text-red-600"
                  }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="h-px bg-borderColor" />

            <div className="flex items-start gap-3">
              <img
                src={assets.calendar_icon_colored}
                alt=""
                className="w-4 h-4 mt-1"
              />
              <div>
                <p className="text-xs text-gray-500">Rental period</p>
                <p className="text-sm">{rentalPeriod}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src={assets.location_icon_colored}
                alt=""
                className="w-4 h-4 mt-1"
              />
              <div>
                <p className="text-xs text-gray-500">Pick-up location</p>
                <p className="text-sm">{booking.car.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img src={assets.car_icon} alt="" className="w-4 h-4 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Car details</p>
                <p className="text-sm">
                  {booking.car.brand} {booking.car.model} •{" "}
                  {booking.car.transmission} • {booking.car.seating_capacity}{" "}
                  seats
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src={assets.cautionIconColored}
                alt=""
                className="w-4 h-4 mt-1"
              />
              <div>
                <p className="text-xs text-gray-500">Payment method</p>
                <p className="text-sm">
                  {booking.paymentMethod === "online_full"
                    ? "Pay full online"
                    : "Pay at pick-up location"}
                </p>
              </div>
            </div>

            {booking.extras && booking.extras.length > 0 && (
              <div className="flex items-start gap-3">
                <img
                  src={assets.check_icon}
                  alt=""
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <p className="text-xs text-gray-500">Additional services</p>
                  <p className="text-sm">{booking.extras.join(" • ")}</p>
                </div>
              </div>
            )}

            <div className="h-px bg-borderColor" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total price</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(booking.price)}
                </p>
                <p className="text-xs text-gray-500">
                  Booked on {booking.createdAt.split("T")[0]}
                </p>
              </div>
              {canRetryPayment && (
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={isPaying}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-dull disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPaying ? "Processing payment..." : "Pay now"}
                </button>
              )}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="border border-borderColor rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-gray-900">
                Pickup checklist
              </p>
            </div>

            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                Bring your driver license and a valid ID.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                Arrive 10–15 minutes early for verification.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                Check fuel level and take photos before leaving.
              </li>
            </ul>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                booking.car.location
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dull"
            >
              <ExternalLink className="h-4 w-4" />
              Open location in Google Maps
            </a>

            <div className="flex items-center gap-2 pt-2">
              <Headphones className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-500">
                Need help? Contact support (demo).
              </p>
            </div>
          </Motion.div>
        </div>
      </div>
    </Motion.div>
  )
}

export default BookingDetails
