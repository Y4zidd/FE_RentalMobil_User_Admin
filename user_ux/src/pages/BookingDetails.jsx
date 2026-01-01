import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { assets } from "../assets/assets"
import { useAppContext } from "../context/AppContext"
import { motion as Motion } from "motion/react"
import { toast } from "react-hot-toast"

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { axios, token, bookings, formatCurrency, user, t, language } = useAppContext()

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
      paymentMethod:
        b.payment_method || (b.status === "pending" ? "online_full" : "offline"),
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
    const contextList = Array.isArray(bookings)
      ? bookings.map(mapBookingFromApi)
      : []
    const contextBooking = contextList.find(
      (item) => String(item.id) === String(id),
    )

    const fetchBooking = async () => {
      if (!axios || !token) {
        setBooking(contextBooking || null)
        setLoading(false)
        return
      }
      try {
        const { data } = await axios.get("/api/bookings/user")
        const list = Array.isArray(data) ? data.map(mapBookingFromApi) : []
        const found =
          list.find((item) => String(item.id) === String(id)) || contextBooking
        setBooking(found || null)
      } catch (error) {
        console.error(error)
        if (!contextBooking) {
          toast.error(t('booking_details_toast_failed_fetch'))
        }
        setBooking(contextBooking || null)
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [axios, token, bookings, id, t])

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

  const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
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
    booking.paymentMethod === "online_full" && booking.status === "pending"

  const handleDownloadReceipt = () => {
    if (!booking) return

    const receiptWindow = window.open("", "BookingReceipt", "width=800,height=900")
    if (!receiptWindow) {
      toast.error("Please allow popups to download the receipt")
      return
    }

    const title = "Rent-A-Car Receipt"
    const createdAt = booking.createdAt || new Date().toISOString()

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <title>${title}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              margin: 0;
              padding: 32px 16px;
              background: #0f172a;
              color: #111827;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            .receipt {
              max-width: 700px;
              width: 100%;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              padding: 28px 32px 26px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 18px;
              padding-bottom: 14px;
              border-bottom: 1px solid #e5e7eb;
            }
            .brand {
              font-size: 22px;
              font-weight: 700;
              color: #1d4ed8;
            }
            .tagline {
              color: #6b7280;
              font-size: 12px;
              margin-top: 2px;
            }
            .muted { color: #6b7280; font-size: 12px; }
            .pill {
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              background: #e5edff;
              color: #1d4ed8;
              display: inline-block;
              margin-bottom: 6px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #9ca3af;
              margin-bottom: 6px;
            }
            .hero {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 18px;
              margin-bottom: 18px;
              padding: 12px 16px;
              border-radius: 16px;
              background: linear-gradient(135deg, #eff6ff, #f9fafb);
            }
            .hero-main {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .hero-title {
              font-size: 18px;
              font-weight: 700;
              color: #111827;
            }
            .hero-sub {
              font-size: 13px;
              color: #6b7280;
            }
            .hero-image-wrap {
              width: 120px;
              height: 80px;
              border-radius: 14px;
              overflow: hidden;
              background: #e5e7eb;
              box-shadow: 0 6px 14px rgba(15, 23, 42, 0.2);
            }
            .hero-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .label { color: #6b7280; }
            .value { font-weight: 500; }
            .divider {
              border-top: 1px dashed #e5e7eb;
              margin: 18px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 15px;
              margin-top: 4px;
            }
            .total-label { font-weight: 600; }
            .total-value { font-size: 20px; font-weight: 700; color: #1d4ed8; }
            .status-pill {
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              background: ${
                booking.status === "completed" || booking.status === "confirmed"
                  ? "#dcfce7"
                  : booking.status === "pending"
                  ? "#fef9c3"
                  : "#fee2e2"
              };
              color: ${
                booking.status === "completed" || booking.status === "confirmed"
                  ? "#166534"
                  : booking.status === "pending"
                  ? "#92400e"
                  : "#b91c1c"
              };
            }
            .footer {
              margin-top: 24px;
              font-size: 11px;
              color: #9ca3af;
              text-align: center;
            }
            @media print {
              body {
                background: #ffffff;
                padding: 0;
                display: block;
              }
              .receipt {
                box-shadow: none;
                border-radius: 0;
                max-width: 100%;
                width: 100%;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div>
                <div class="brand">Rent-A-Car</div>
                <div class="tagline">Premium Rent-A-Car receipt</div>
              </div>
              <div style="text-align: right;">
                <div class="pill">Booking Receipt</div>
                <div class="muted">Booking ID</div>
                <div style="font-weight: 600;">#${
                  String(booking.id || booking.bookingId || "").slice(-8).toUpperCase() || "DEMO"
                }</div>
                <div class="muted" style="margin-top:4px;">Issued at ${new Date(
                  createdAt,
                ).toLocaleString()}</div>
              </div>
            </div>

            <div class="hero">
              <div class="hero-main">
                <div class="hero-title">
                  ${booking.car?.brand || ""} ${booking.car?.model || ""} ${booking.car?.year || ""}
                </div>
              </div>
              <div class="hero-image-wrap">
                <img
                  src="${booking.car?.image || ""}"
                  alt="Car image"
                  class="hero-image"
                />
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div class="section-title">Renter</div>
              <div class="row">
                <div>
                  <div class="label">Name</div>
                  <div class="value">${user?.name || "Demo Customer"}</div>
                </div>
                <div style="text-align:right;">
                  <div class="label">Email</div>
                  <div class="value">${user?.email || "demo@example.com"}</div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div style="margin-bottom: 16px;">
              <div class="section-title">Car & Rental Details</div>
              <div class="row">
                <div>
                  <div class="label">Car</div>
                  <div class="value">
                    ${booking.car?.brand || ""} ${booking.car?.model || ""} ${
                  booking.car?.year || ""
                }
                  </div>
                </div>
                <div style="text-align:right;">
                  <div class="label">Location</div>
                  <div class="value">${booking.car?.location || "-"}</div>
                </div>
              </div>
              <div class="row">
                <div>
                  <div class="label">Pick-up</div>
                  <div class="value">${formatDateTime(booking.pickupDate)}</div>
                </div>
                <div style="text-align:right;">
                  <div class="label">Drop-off</div>
                  <div class="value">${formatDateTime(booking.returnDate)}</div>
                </div>
              </div>
              <div class="row">
                <div>
                  <div class="label">Status</div>
                  <div class="status-pill">${(booking.status || "")
                    .toString()
                    .toUpperCase()}</div>
                </div>
                <div style="text-align:right;">
                  <div class="label">Payment Method</div>
                  <div class="value">${
                    booking.paymentMethod === "online_full" ? "Online Payment" : "On Arrival"
                  }</div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div>
              <div class="section-title">Price Summary</div>
              <div class="row">
                <div class="label">Rental period</div>
                <div class="value">${rentalPeriod}</div>
              </div>
              <div class="row">
                <div class="label">Extras & insurance</div>
                <div class="value">${
                  booking.extras && booking.extras.length
                    ? booking.extras.join(", ")
                    : "Included"
                }</div>
              </div>
              <div class="divider"></div>
              <div class="total-row">
                <div class="total-label">Total paid</div>
                <div class="total-value">${formatCurrency(booking.price || 0)}</div>
              </div>
            </div>

            <div class="footer">
              Thank you for choosing Rent-A-Car. Please present this receipt at pick-up if requested.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    receiptWindow.document.open()
    receiptWindow.document.write(html)
    receiptWindow.document.close()
  }

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 mt-0 mb-6 pb-6 border-b border-gray-100">
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
              onClick={handleDownloadReceipt}
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
