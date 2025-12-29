import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
import { motion as Motion } from "motion/react"
import Title from "../components/Title"
import toast from "react-hot-toast"
import { ShieldCheck, Calendar, MapPin, Car, CreditCard, ArrowLeft } from "lucide-react"

const Checkout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { cars, token, formatCurrency, user, setShowLogin } = useAppContext()
    const { carId, pickupDate, returnDate, pickupTime, returnTime, preselectedOptions } = location.state || {}
    const [car, setCar] = useState(null)

    // State for form, initialized with preselectedOptions if available
    const [bookingOptions, setBookingOptions] = useState(preselectedOptions || {
        theftProtection: false,
        collisionDamage: false,
        fullInsurance: false,
        additionalDriver: false,
    })

    const [paymentOption, setPaymentOption] = useState("pay_now") // pay_now || pay_later
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
            toast.error("Invalid booking details. Please select a car first.")
            navigate("/cars")
            return
        }

        const foundCar = cars.find((c) => String(c.id) === String(carId))
        if (foundCar) {
            setCar(foundCar)
        } else {
            // Fallback if car not found in context (e.g. refresh), ideally fetch single car
            toast.error("Car details not found")
            navigate("/cars")
        }
    }, [carId, pickupDate, returnDate, cars, navigate])


    const optionConfig = [
        {
            id: "theftProtection",
            label: "Theft protection",
            description: "Covers theft of the rental vehicle.",
            pricePerDay: 60000,
        },
        {
            id: "collisionDamage",
            label: "Collision damage waiver",
            description: "Limits liability for damage to the vehicle.",
            pricePerDay: 60000,
        },
        {
            id: "fullInsurance",
            label: "Full insurance",
            description: "Complete peace of mind coverage.",
            pricePerDay: 90000,
        },
        {
            id: "additionalDriver",
            label: "Driver service",
            description: "Add a professional driver to your trip.",
            pricePerDay: 200000,
        },
    ]

    const toggleOption = (id) => {
        setBookingOptions((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const pickupDateTimeString = pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : pickupDate
    const returnDateTimeString = returnDate && returnTime ? `${returnDate}T${returnTime}` : returnDate

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

    const handleApplyCoupon = () => {
        const trimmed = couponCode.trim()
        if (!trimmed) {
            toast.error("Please enter a promo code")
            return
        }

        if (!car || rentalDays <= 0 || !totalCost) {
            toast.error("Please select valid dates first")
            return
        }

        let discount = Math.round(totalCost * 0.1)
        if (discount > totalCost) {
            discount = totalCost
        }

        setCouponDiscount(discount)
        setCouponApplied(true)
        toast.success("Coupon applied")
    }

    const handleBooking = () => {
        if (!token) {
            toast.error('Please login or register before making a booking')
            setShowLogin(true)
            return
        }

        if (!car || rentalDays <= 0) {
            toast.error("Please select valid dates before booking")
            return
        }

        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success('Booking created for UX demo')
            navigate('/my-bookings')
        }, 800)
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
                    <span>Back</span>
                </button>

                <div className="mb-8">
                    <Title title="Checkout" subTitle="Review your trip details and complete your booking" align="left" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">

                    {/* LEFT COLUMN - FORMS */}
                    <div className="flex-1 space-y-8">

                        {/* 1. Primary Driver */}
                        {/* 1. Primary Driver */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Primary driver</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={driverDetails.name}
                                            onChange={(e) => setDriverDetails({ ...driverDetails, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={driverDetails.phone}
                                            onChange={(e) => setDriverDetails({ ...driverDetails, phone: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={driverDetails.email}
                                        onChange={(e) => setDriverDetails({ ...driverDetails, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-md text-sm flex gap-3 items-start">
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>After booking, you'll need to submit your driver's license for verification.</p>
                                </div>
                            </div>
                        </section>



                        {/* 3. Choose when to pay */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose when to pay</h2>
                            <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-1">
                                <div
                                    onClick={() => setPaymentOption('pay_now')}
                                    className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${paymentOption === 'pay_now' ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentOption === 'pay_now' ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                                            {paymentOption === 'pay_now' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <span className="font-medium text-gray-900">Pay now</span>
                                    </div>
                                    {paymentOption === 'pay_now' && (
                                        <div className="ml-8 mt-2 text-xs text-gray-500">
                                            You will be redirected to Midtrans to complete your secure payment.
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
                                        <span className="font-medium text-gray-900">Pay at pick-up</span>
                                    </div>
                                    {paymentOption === 'pay_later' && (
                                        <div className="ml-8 mt-2 text-xs text-gray-500">
                                            Pay the full amount when you pick up the vehicle at the location.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Payment Method Preview (Only if Pay Now) */}
                        {paymentOption === 'pay_now' && (
                            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment method</h2>
                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CreditCard className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Online Payment Gateway</span>
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
                                    I agree to pay the total amount shown and to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Cancellation Policy</a>.
                                </label>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dull text-white text-base font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? 'Processing...' : 'Book trip'}
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
                                                    ? new Date(pickupDateTimeString).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric'
                                                    })
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Return</p>
                                            <p className="font-medium text-gray-900">
                                                {returnDateTimeString
                                                    ? new Date(returnDateTimeString).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric'
                                                    })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center pt-2 border-t border-gray-50">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                    <p className="text-sm text-gray-600 whitespace-normal break-words leading-tight">{car.location}</p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{formatCurrency(car.pricePerDay)} x {rentalDays} days</span>
                                    <span>{formatCurrency(baseCost)}</span>
                                </div>
                                {extrasCost > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Protection & Extras</span>
                                        <span>{formatCurrency(extrasCost)}</span>
                                    </div>
                                )}
                                {couponApplied && couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Coupon Discount</span>
                                        <span>-{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Trip fee (service)</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Trip total</span>
                                    <span className="font-bold text-xl text-gray-900">{formatCurrency(finalCost)}</span>
                                </div>
                                {!showPromoForm && (
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowPromoForm(true)}
                                            className="text-sm font-medium text-gray-900 underline underline-offset-2"
                                        >
                                            Promo code
                                        </button>
                                    </div>
                                )}
                                {showPromoForm && (
                                    <div className="mt-3 space-y-2">
                                        <label className="block text-sm font-medium text-gray-900">
                                            Promo code
                                        </label>
                                        <input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter promo code"
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm outline-none"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Only one promo code can be applied per trip. If multiple codes are added,
                                            only the last one will apply.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dull disabled:opacity-60"
                                        >
                                            {couponLoading ? "Checking..." : "Apply"}
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
