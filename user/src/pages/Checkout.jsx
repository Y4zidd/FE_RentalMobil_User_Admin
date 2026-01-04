import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { motion as Motion } from "motion/react"
import Title from "../components/Title"
import toast from "react-hot-toast"
import { ShieldCheck, Calendar, MapPin, Car, CreditCard, ArrowLeft } from "lucide-react"
import {
  checkoutPaymentRequest,
  createBookingRequest,
  markBookingPaidRequest,
} from "../lib/api/booking"
import { validateCouponRequest } from "../lib/api/user"

const Checkout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { cars, token, formatCurrency, user, setShowLogin, t, language } = useAppContext()
    const { carId, pickupDate, returnDate, pickupTime, returnTime, preselectedOptions } = location.state || {}
    const [car, setCar] = useState(null)

    // State for form, initialized with preselectedOptions if available
    const [bookingOptions] = useState(preselectedOptions || {
        theftProtection: false,
        collisionDamage: false,
        fullInsurance: false,
        additionalDriver: false,
    })

    const [paymentOption, setPaymentOption] = useState("pay_now")
    const [loading, setLoading] = useState(false)
    const [couponCode, setCouponCode] = useState("")
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponLoading, setCouponLoading] = useState(false)
    const [showPromoForm, setShowPromoForm] = useState(false)

    // User details state (editable)
    const [driverDetails, setDriverDetails] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
    })

    // Update driver details when user data is available
    useEffect(() => {
        if (user) {
            setDriverDetails(prev => ({
                name: prev.name || user.name || '',
                phone: prev.phone || user.phone || '',
                email: prev.email || user.email || ''
            }))
        }
    }, [user])



    useEffect(() => {
        if (!carId || !pickupDate || !returnDate) {
            toast.error(t('checkout_toast_invalid_booking'))
            navigate("/cars")
            return
        }

        const foundCar = cars.find((c) => String(c.id) === String(carId))
        if (foundCar) {
            setCar(foundCar)
        } else {
            // Fallback if car not found in context (e.g. refresh), ideally fetch single car
            toast.error(t('checkout_toast_car_not_found'))
            navigate("/cars")
        }
    }, [carId, pickupDate, returnDate, cars, navigate])


    const optionConfig = [
        {
            id: "theftProtection",
            labelKey: "extras_theft_label",
            descriptionKey: "extras_theft_description",
            pricePerDay: 60000,
        },
        {
            id: "collisionDamage",
            labelKey: "extras_collision_label",
            descriptionKey: "extras_collision_description",
            pricePerDay: 60000,
        },
        {
            id: "fullInsurance",
            labelKey: "extras_full_insurance_label",
            descriptionKey: "extras_full_insurance_description",
            pricePerDay: 90000,
        },
        {
            id: "additionalDriver",
            labelKey: "extras_driver_service_label",
            descriptionKey: "extras_driver_service_description",
            pricePerDay: 200000,
        },
    ]

    const pickupDateTimeString = pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : pickupDate
    const returnDateTimeString = returnDate && returnTime ? `${returnDate}T${returnTime}` : returnDate
    const dateLocale = language === 'id' ? 'id-ID' : 'en-US'

    const getRentalDays = () => {
        if (!pickupDateTimeString || !returnDateTimeString) return 0
        const start = new Date(pickupDateTimeString)
        const end = new Date(returnDateTimeString)
        const diff = end - start
        if (diff <= 0) return 0
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const rentalDays = getRentalDays()
    const baseCost = rentalDays * (car?.pricePerDay || 0)

    const extrasPerDay = optionConfig.reduce(
        (sum, opt) => (bookingOptions[opt.id] ? sum + opt.pricePerDay : sum),
        0
    )
    const extrasCost = rentalDays * extrasPerDay
    const totalCost = baseCost + extrasCost
    const finalCost = Math.max(0, totalCost - couponDiscount)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error(t('checkout_toast_enter_coupon'))
            return
        }
        const selectedOptions = optionConfig
            .filter((opt) => bookingOptions[opt.id])
            .map((opt) => ({
                code: opt.id,
                label: opt.label,
                price: opt.pricePerDay,
            }))
        setCouponLoading(true)
        try {
            const { data } = await validateCouponRequest({
                code: couponCode.trim(),
                car_id: car.id,
                pickup_date: pickupDateTimeString,
                return_date: returnDateTimeString,
                options: selectedOptions,
            })
            if (data.valid) {
                setCouponDiscount(Number(data.discount_amount) || 0)
                setCouponApplied(true)
                toast.success(t('checkout_toast_coupon_applied'))
            } else {
                setCouponDiscount(0)
                setCouponApplied(false)
                toast.error(data.message || t('checkout_toast_coupon_unavailable'))
            }
        } catch {
            setCouponDiscount(0)
            setCouponApplied(false)
            toast.error(t('checkout_toast_coupon_unavailable'))
        } finally {
            setCouponLoading(false)
        }
    }

    const handleBooking = async () => {
        if (!token) {
            toast.error(t('checkout_toast_login_required'))
            setShowLogin(true)
            return
        }

        setLoading(true)
        try {
            const selectedOptions = optionConfig
                .filter((opt) => bookingOptions[opt.id])
                .map((opt) => ({
                    code: opt.id,
                    label: t(opt.labelKey),
                    price: opt.pricePerDay,
                }))

            // Map our frontend option to backend expected enum
            // 'pay_now' -> 'online_full', 'pay_later' -> 'pay_at_location'
            const paymentMethodBackend = paymentOption === "pay_now" ? "online_full" : "pay_at_location"

            const payload = {
                car_id: car.id,
                pickup_date: pickupDateTimeString,
                return_date: returnDateTimeString,
                payment_method: paymentMethodBackend,
                pickup_location_id: car.locationId || 1,
                dropoff_location_id: car.locationId || 1,
                options: selectedOptions,
                coupon_code: couponApplied ? couponCode.trim() : undefined,
            }

            const { data: booking } = await createBookingRequest(payload)

            if (paymentMethodBackend === 'online_full') {
                try {
                    const { data: payment } = await checkoutPaymentRequest(booking.id)

                    if (payment.token && window.snap) {
                        window.snap.pay(payment.token, {
                            onSuccess: async () => {
                                try {
                                    await markBookingPaidRequest(booking.id)
                                } catch (err) {
                                    console.error(err)
                                }
                                toast.success(t('checkout_toast_payment_success'))
                                navigate('/my-bookings')
                            },
                            onPending: () => {
                                toast.success(t('checkout_toast_payment_pending'))
                                navigate('/my-bookings')
                            },
                            onError: () => toast.error(t('checkout_toast_payment_failed')),
                            onClose: () => {
                                toast(t('checkout_toast_payment_popup_closed'))
                                navigate('/my-bookings')
                            },
                        })
                    } else {
                        toast.error(t('checkout_toast_payment_init_failed'))
                    }
                } catch (payErr) {
                    console.error(payErr)
                    toast.error(t('checkout_toast_payment_error'))
                }
            } else {
                toast.success(t('checkout_toast_booking_confirmed'))
                navigate('/my-bookings')
            }

        } catch (error) {
            console.error(error)
            toast.error(t('checkout_toast_booking_failed'))
        } finally {
            setLoading(false)
        }
    }

    if (!car) return null

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen bg-gray-50/50 pt-20 pb-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>{t('checkout_back_button')}</span>
                </button>

                <div className="mb-8">
                    <Title title={t('checkout_title')} subTitle={t('checkout_subtitle')} align="left" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">

                    {/* LEFT COLUMN - FORMS */}
                    <div className="flex-1 space-y-8">

                        {/* 1. Primary Driver */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout_primary_driver_heading')}</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('checkout_full_name_label')}</label>
                                        <input
                                            type="text"
                                            value={driverDetails.name}
                                            onChange={(e) => setDriverDetails({ ...driverDetails, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder={t('checkout_full_name_placeholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('checkout_phone_label')}</label>
                                        <input
                                            type="text"
                                            value={driverDetails.phone}
                                            onChange={(e) => setDriverDetails({ ...driverDetails, phone: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder={t('checkout_phone_placeholder')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('checkout_email_label')}</label>
                                    <input
                                        type="email"
                                        value={driverDetails.email}
                                        onChange={(e) => setDriverDetails({ ...driverDetails, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder={t('checkout_email_placeholder')}
                                    />
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-md text-sm flex gap-3 items-start">
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{t('checkout_license_info')}</p>
                                </div>
                            </div>
                        </section>



                        {/* 2. Choose when to pay */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout_choose_when_to_pay_heading')}</h2>
                            <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-1">
                                <div
                                    onClick={() => setPaymentOption('pay_now')}
                                    className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${paymentOption === 'pay_now' ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentOption === 'pay_now' ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                                            {paymentOption === 'pay_now' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <span className="font-medium text-gray-900">{t('checkout_pay_now_option')}</span>
                                    </div>
                                    {paymentOption === 'pay_now' && (
                                        <div className="ml-8 mt-2 text-xs text-gray-500">
                                            {t('checkout_pay_now_description')}
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() => setPaymentOption('pay_later')}
                                    className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${paymentOption === 'pay_later' ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentOption === 'pay_later' ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                                            {paymentOption === 'pay_later' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <span className="font-medium text-gray-900">{t('checkout_pay_later_option')}</span>
                                    </div>
                                    {paymentOption === 'pay_later' && (
                                        <div className="ml-8 mt-2 text-xs text-gray-500">
                                            {t('checkout_pay_later_description')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Payment Method Preview (Only if Pay Now) */}
                        {paymentOption === 'pay_now' && (
                            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout_payment_method_heading')}</h2>
                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CreditCard className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">{t('checkout_payment_method_gateway')}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Mock Icons for Midtrans, Visa, Mastercard */}
                                        <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-blue-700 italic">VISA</div>
                                        <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-orange-600">MC</div>
                                        <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-600">ATM</div>
                                    </div>
                                </div>
                            </section>
                        )}


                        <div className="pt-4">
                            <div className="flex items-start gap-3 mb-6">
                                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                                    {t('checkout_terms_text')}{" "}
                                    <a href="#" className="text-primary hover:underline">{t('checkout_terms_link')}</a>{" "}
                                    {t('checkout_cancellation_link')}.
                                </label>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dull text-white text-base font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? t('checkout_book_button_processing') : t('checkout_book_button')}
                            </button>
                        </div>

                    </div>


                    {/* RIGHT COLUMN - STICKY SUMMARY */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">

                            {/* Header with Car & Image */}
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{car.brand} {car.model} {car.year}</h3>

                                </div>
                                <img src={car.image} alt={car.model} className="w-24 h-16 object-cover rounded-md bg-gray-100" />
                            </div>

                            {/* Dates & Location */}
                            <div className="p-5 border-b border-gray-100 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                        <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-300 mb-2"></div>
                                    </div>
                                    <div className="text-sm space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Pick-up</p>
                                            <p className="font-medium text-gray-900">
                                                {pickupDateTimeString
                                                    ? new Date(pickupDateTimeString).toLocaleString(dateLocale, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Return</p>
                                            <p className="font-medium text-gray-900">
                                                {returnDateTimeString
                                                    ? new Date(returnDateTimeString).toLocaleString(dateLocale, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center pt-2 border-t border-gray-50">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-600 truncate">{car.location}</p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{formatCurrency(car.pricePerDay)} x {rentalDays} {t('checkout_price_days')}</span>
                                    <span>{formatCurrency(baseCost)}</span>
                                </div>
                                {extrasCost > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{t('checkout_price_protection_extras')}</span>
                                        <span>{formatCurrency(extrasCost)}</span>
                                    </div>
                                )}
                                {couponApplied && couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{t('checkout_price_coupon_discount')}</span>
                                        <span>-{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">{t('checkout_price_trip_total')}</span>
                                    <span className="font-bold text-xl text-gray-900">{formatCurrency(finalCost)}</span>
                                </div>
                                {!showPromoForm && (
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowPromoForm(true)}
                                            className="text-sm font-medium text-gray-900 underline underline-offset-2"
                                        >
                                            {t('checkout_promo_toggle')}
                                        </button>
                                    </div>
                                )}
                                {showPromoForm && (
                                    <div className="mt-3 space-y-2">
                                        <label className="block text-sm font-medium text-gray-900">
                                            {t('checkout_promo_label')}
                                        </label>
                                        <input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder={t('checkout_promo_placeholder')}
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm outline-none"
                                        />
                                        <p className="text-xs text-gray-500">
                                            {t('checkout_promo_help')}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dull disabled:opacity-60"
                                        >
                                            {couponLoading ? t('checkout_promo_button_checking') : t('checkout_promo_button_apply')}
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </Motion.div>
    )
}

export default Checkout
