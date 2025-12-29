import React, { useEffect, useMemo, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
import Title from "../components/Title"
import toast from "react-hot-toast"
import { motion as Motion, AnimatePresence } from "motion/react"
import {
  Car,
  KeyRound,
  Mail,
  Phone,
  Save,
  User as UserIcon,
  Camera,
  ChevronRight,
} from "lucide-react"

const ASEAN_COUNTRIES = [
  "Indonesia",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Philippines",
  "Vietnam",
  "Brunei",
  "Cambodia",
  "Laos",
  "Myanmar",
]

const Profile = () => {
  const { user, setUser, navigate } = useAppContext()

  const baseUser = useMemo(() => user || {}, [user])

  const [activeTab, setActiveTab] = useState("personal")

  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [rentalForm, setRentalForm] = useState({
    licenseNumber: "",
    defaultCity: "",
    preferences: "",
  })

  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [countryOptions, setCountryOptions] = useState([])
  const [provinceOptions, setProvinceOptions] = useState([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const passwordsMismatch =
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword !== passwordForm.confirmPassword

  const [avatarPreview, setAvatarPreview] = useState("")

  const [pendingEmail, setPendingEmail] = useState("")
  const [emailVerificationCode, setEmailVerificationCode] = useState("")

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      navigate("/")
    }
  }, [navigate])

  useEffect(() => {
    setAccountForm({
      name: baseUser.name || "",
      email: baseUser.email || "",
      phone: baseUser.phone || "",
    })
    setRentalForm((prev) => ({
      ...prev,
      licenseNumber: baseUser.license_number || prev.licenseNumber || "",
      defaultCity: baseUser.default_city || prev.defaultCity || "",
      preferences: baseUser.rental_preferences || prev.preferences || "",
    }))
    const defaultCity = baseUser.default_city || ""
    if (defaultCity) {
      const parts = defaultCity.split(",").map((part) => part.trim())
      if (parts.length >= 2) {
        setSelectedProvince(parts[0])
        setSelectedCountry(parts[1])
      } else {
        setSelectedProvince(defaultCity)
        setSelectedCountry("")
      }
    } else {
      setSelectedProvince("")
      setSelectedCountry("")
    }
    setAvatarPreview(baseUser?.avatar_url || "")
  }, [baseUser])

  useEffect(() => {
    setCountryOptions(ASEAN_COUNTRIES)
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setProvinceOptions([])
      return
    }

    let isMounted = true

    const fetchProvinces = async () => {
      try {
        setIsLoadingLocations(true)
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: selectedCountry,
            }),
          }
        )

        if (!response.ok) return
        const json = await response.json()
        if (!isMounted) return

        const states = json?.data?.states ?? []
        const options = states
          .map((state) => state.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))

        setProvinceOptions(options)
      } catch (error) {
        void error
      } finally {
        if (isMounted) setIsLoadingLocations(false)
      }
    }

    fetchProvinces()
    return () => {
      isMounted = false
    }
  }, [selectedCountry])

  const handleAccountChange = (e) => {
    const { name, value } = e.target
    setAccountForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRentalChange = (e) => {
    const { name, value } = e.target
    setRentalForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value) => {
    setSelectedCountry(value)
    setSelectedProvince("")
    setRentalForm((prev) => ({ ...prev, defaultCity: "" }))
  }

  const handleProvinceChange = (value) => {
    setSelectedProvince(value)
    setRentalForm((prev) => ({
      ...prev,
      defaultCity:
        value && selectedCountry ? `${value}, ${selectedCountry}` : value,
    }))
  }

  const handleSaveAccount = async (e) => {
    e.preventDefault()
    const trimmedEmail = (accountForm.email || "").trim()
    const currentEmail = (baseUser.email || "").trim()
    const emailChanged =
      trimmedEmail &&
      trimmedEmail.toLowerCase() !== currentEmail.toLowerCase()

    setUser((prev) => ({
      ...prev,
      name: accountForm.name,
      phone: accountForm.phone,
    }))

    if (!emailChanged) {
      toast.success("Profile updated")
      return
    }

    setPendingEmail(trimmedEmail)
    setEmailVerificationCode("")
    toast.success(
      "A 6-digit verification code has been sent to your new email (demo)."
    )
  }

  const handleConfirmEmailChange = (e) => {
    e.preventDefault()
    if (!pendingEmail) {
      toast.error("No email change in progress.")
      return
    }
    if (!emailVerificationCode.trim()) {
      toast.error("Please enter the verification code.")
      return
    }

    if (emailVerificationCode.trim() !== "123456") {
      toast.error("Invalid verification code for this demo. Use 123456.")
      return
    }

    setUser((prev) => ({
      ...prev,
      email: pendingEmail,
    }))
    setAccountForm((prev) => ({
      ...prev,
      email: pendingEmail,
    }))
    setPendingEmail("")
    setEmailVerificationCode("")
    toast.success("Email updated successfully (demo).")
  }

  const handleSaveRental = async (e) => {
    e.preventDefault()
    setUser((prev) => ({
      ...prev,
      license_number: rentalForm.licenseNumber || prev.license_number,
      default_city: rentalForm.defaultCity || prev.default_city,
      rental_preferences: rentalForm.preferences || prev.rental_preferences,
    }))
    toast.success("Rental details updated")
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill all password fields")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match")
      return
    }
    toast.success("Password updated")
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith("image/")) {
      toast.error("Please upload an image file")
      e.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : ""
      setAvatarPreview(url)
      setUser((prev) => ({
        ...prev,
        avatar_url: url || prev?.avatar_url,
      }))
      toast.success("Photo updated")
      e.target.value = ""
    }
    reader.onerror = () => {
      toast.error("Failed to load image")
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }

  const avatarSrc = avatarPreview || assets.user_profile
  const inputClassName =
    "w-full px-3 py-2 rounded-md border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white text-sm text-gray-900 placeholder:text-gray-400"
  const labelClassName = "block text-xs font-medium text-gray-700 mb-1"

  const tabs = [
    { id: "personal", label: "Personal information" },
    { id: "rental", label: "Rental details" },
    { id: "security", label: "Security" },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Title
            title="Profile settings"
            subTitle="Update your personal and company details here."
            align="left"
          />
        </Motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap text-left ${isActive
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-gray-400 absolute left-0 -ml-4 hidden lg:block" />
                    )}
                    {/* Simplified tab style (no bg, just text color change mostly as per modern minimal look or keeping subtle bg) */}
                    {/* User asked to remove icons. Keeping it simple. */}
                    {tab.icon && <tab.icon className="hidden" />} {/* Ensure no icon is rendered if valid */}

                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="" // Removed card styling to match the clean look in the screenshot if implied, or just keeping it subtle 
              >
                {/* We will keep the forms but remove the heavy card borders/shadows if they want it "smaller/cleaner", 
                      but "besar banget" usually refers to scale. Let's keep the container but reduce padding. */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {activeTab === "personal" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          Overview of your details
                        </h3>
                        <div className="border-t border-gray-100 mt-4 pt-4"></div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="relative group">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt="Profile"
                              className="h-16 w-16 rounded-full object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Profile picture
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            This photo is visible on the dashboard.
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              id="avatar-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                            />
                            <label
                              htmlFor="avatar-upload"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors shadow-sm"
                            >
                              Change
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Personal information
                        </h4>
                        <form onSubmit={handleSaveAccount} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className={labelClassName}>
                                First name (Full Name)
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={accountForm.name}
                                onChange={handleAccountChange}
                                className={inputClassName}
                              />
                            </div>
                            <div>
                              {/* Placeholder for Last Name if we split it, but we only have 'name' in DB. Keeping structure. */}
                              <label htmlFor="email" className={labelClassName}>
                                Email address
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={accountForm.email}
                                onChange={handleAccountChange}
                                className={inputClassName}
                              />
                            </div>
                            <div>
                              <label htmlFor="phone" className={labelClassName}>
                                Phone number
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={accountForm.phone}
                                onChange={handleAccountChange}
                                className={inputClassName}
                              />
                            </div>
                            {pendingEmail && (
                              <div className="max-w-sm space-y-1">
                                <label className={labelClassName}>
                                  Email verification code
                                </label>
                                <div className="flex items-stretch gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={emailVerificationCode}
                                    onChange={(e) =>
                                      setEmailVerificationCode(
                                        e.target.value.replace(/[^0-9]/g, "")
                                      )
                                    }
                                    className={inputClassName}
                                    placeholder="Enter verification code"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleConfirmEmailChange}
                                    disabled={!emailVerificationCode}
                                    className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dull text-white text-[11px] font-medium disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    Verify
                                  </button>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                  For this demo, we pretend to send a 6-digit
                                  code to{" "}
                                  <span className="font-medium">
                                    {pendingEmail}
                                  </span>
                                  . Use code{" "}
                                  <span className="font-mono">123456</span> to
                                  confirm your new email address.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-start pt-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-xs font-medium transition-colors"
                            >
                              Save changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  {/* ... existing other tabs logic logic reuse with smaller styling ... */}
                  {activeTab === "rental" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Rental Details</h3>
                      </div>
                      <form onSubmit={handleSaveRental} className="space-y-4">
                        {/* ... same fields, smaller spacing ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="licenseNumber" className={labelClassName}>Driver License</label>
                            <input type="text" id="licenseNumber" name="licenseNumber" value={rentalForm.licenseNumber} onChange={handleRentalChange} className={inputClassName} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClassName}>Default Pickup Location</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)} className={inputClassName}>
                              <option value="">Select Country</option>
                              {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={selectedProvince} onChange={(e) => handleProvinceChange(e.target.value)} disabled={!selectedCountry} className={inputClassName}>
                              <option value="">Select Province</option>
                              {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="preferences" className={labelClassName}>Rental Preferences</label>
                          <textarea id="preferences" name="preferences" value={rentalForm.preferences} onChange={handleRentalChange} rows={3} className={inputClassName} />
                        </div>
                        <div className="flex justify-start pt-2">
                          <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-xs font-medium">Save Details</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6">
                      <div><h3 className="text-base font-semibold text-gray-900">Security</h3></div>
                      <form onSubmit={handleSavePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-1 md:col-span-2 max-w-sm">
                            <label htmlFor="currentPassword" className={labelClassName}>
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label htmlFor="newPassword" className={labelClassName}>
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label htmlFor="confirmPassword" className={labelClassName}>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`${inputClassName} ${passwordsMismatch ? "border-red-500" : ""
                                }`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-start pt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-xs font-medium"
                          >
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

              </Motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
