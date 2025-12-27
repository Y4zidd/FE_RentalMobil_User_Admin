import React, { useEffect, useMemo, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets"
import Title from "../components/Title"
import toast from "react-hot-toast"
import { motion as Motion } from "motion/react"
import {
  Car,
  KeyRound,
  Mail,
  Plus,
  Phone,
  Save,
  User as UserIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

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
  const { user, setUser, axios, navigate } = useAppContext()

  const baseUser = useMemo(() => user || {}, [user])

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
      preferences:
        baseUser.rental_preferences || prev.preferences || "",
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

        if (!response.ok) {
          return
        }

        const json = await response.json()

        if (!isMounted) {
          return
        }

        const states = json?.data?.states ?? []

        const options = states
          .map((state) => state.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))

        setProvinceOptions(options)
      } catch (error) {
        void error
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false)
        }
      }
    }

    fetchProvinces()

    return () => {
      isMounted = false
    }
  }, [selectedCountry])

  const handleAccountChange = (e) => {
    const { name, value } = e.target
    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRentalChange = (e) => {
    const { name, value } = e.target
    setRentalForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCountryChange = (value) => {
    setSelectedCountry(value)
    setSelectedProvince("")
    setRentalForm((prev) => ({
      ...prev,
      defaultCity: "",
    }))
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
    try {
      const payload = {
        name: accountForm.name,
        email: accountForm.email,
        phone: accountForm.phone,
      }
      const { data } = await axios.put("/api/user/profile", payload)
      setUser(data)
      toast.success("Profile updated")
    } catch (error) {
      console.error(error)
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        "Failed to update profile"
      toast.error(message)
    }
  }

  const handleSaveRental = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        license_number: rentalForm.licenseNumber,
        default_city: rentalForm.defaultCity,
        rental_preferences: rentalForm.preferences,
      }
      const { data } = await axios.put("/api/user/rental-details", payload)
      setUser(data)
      toast.success("Rental details updated")
    } catch (error) {
      console.error(error)
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        "Failed to update rental details"
      toast.error(message)
    }
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
    try {
      await axios.put("/api/user/password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      })
      toast.success("Password updated")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error(error)
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        "Failed to update password"
      toast.error(message)
    }
  }

  const [avatarPreview, setAvatarPreview] = useState("")

  useEffect(() => {
    setAvatarPreview(baseUser?.avatar_url || "")
  }, [baseUser])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith("image/")) {
      toast.error("Please upload an image file")
      e.target.value = ""
      return
    }

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const { data } = await axios.post("/api/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setUser(data)
      setAvatarPreview(data.avatar_url || "")
      toast.success("Photo updated")
    } catch (error) {
      console.error(error)
      const message =
        error.response?.data?.message ||
        (error.response?.data?.errors &&
          Object.values(error.response.data.errors)[0][0]) ||
        "Failed to update photo"
      toast.error(message)
    } finally {
      e.target.value = ""
    }
  }

  const avatarSrc = avatarPreview || assets.user_profile

  const inputClassName =
    "border border-borderColor rounded-lg px-3 py-2 outline-none focus:border-primary bg-white"

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm w-full"
    >
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <Title
            title="Profile"
            subTitle="Manage your personal information and rental preferences"
            align="left"
          />
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8 lg:gap-12">
          <Motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="relative">
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  className="h-20 w-20 rounded-full object-cover border border-borderColor"
                />
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-white cursor-pointer hover:bg-primary-dull"
                  title="Change photo"
                >
                  <Plus className="h-4 w-4" />
                </label>
              </div>

              <div className="min-w-0 text-left">
                <p className="text-base font-semibold text-gray-900 truncate leading-tight">
                  {accountForm.name || "Guest User"}
                </p>
                <p className="text-sm text-gray-500 truncate leading-tight mt-1">
                  {accountForm.email || "No email set"}
                </p>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="space-y-8"
          >
            <Card>
              <form onSubmit={handleSaveAccount}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    Account information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details for bookings and receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="name"
                        className="text-xs text-gray-500 flex items-center gap-1.5"
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        Full name
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={accountForm.name}
                        onChange={handleAccountChange}
                        type="text"
                        className={inputClassName}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="email"
                        className="text-xs text-gray-500 flex items-center gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        value={accountForm.email}
                        onChange={handleAccountChange}
                        type="email"
                        className={inputClassName}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="phone"
                        className="text-xs text-gray-500 flex items-center gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Phone number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        value={accountForm.phone}
                        onChange={handleAccountChange}
                        type="tel"
                        className={inputClassName}
                        placeholder="+62"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-sm font-medium cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save changes
                  </button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <form onSubmit={handleSaveRental}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    Rental details
                  </CardTitle>
                  <CardDescription>
                    Add optional details to speed up future rentals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="licenseNumber"
                        className="text-xs text-gray-500"
                      >
                        Driver license number
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={rentalForm.licenseNumber}
                        onChange={handleRentalChange}
                        type="text"
                        className={inputClassName}
                        placeholder="e.g. B123456789"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">
                        Default pickup location
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          className={inputClassName}
                          value={selectedCountry}
                          onChange={(e) =>
                            handleCountryChange(e.target.value)
                          }
                        >
                          <option value="">
                            {isLoadingLocations
                              ? "Loading countries..."
                              : "Select country"}
                          </option>
                          {countryOptions.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <select
                          className={inputClassName}
                          value={selectedProvince}
                          onChange={(e) =>
                            handleProvinceChange(e.target.value)
                          }
                          disabled={!selectedCountry}
                        >
                          <option value="">
                            {selectedCountry
                              ? isLoadingLocations
                                ? "Loading locations..."
                                : "Select province or city"
                              : "Select country first"}
                          </option>
                          {provinceOptions.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>
                      {rentalForm.defaultCity ? (
                        <p className="text-xs text-gray-500">
                          Selected: {rentalForm.defaultCity}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-4">
                    <label htmlFor="preferences" className="text-xs text-gray-500">
                      Rental preferences
                    </label>
                    <textarea
                      id="preferences"
                      name="preferences"
                      value={rentalForm.preferences}
                      onChange={handleRentalChange}
                      className={`${inputClassName} min-h-20 resize-y`}
                      placeholder="Share your preferences (e.g. favorite car type, extras you usually pick)"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-sm font-medium cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save rental details
                  </button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <form onSubmit={handleSavePassword}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Change password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="currentPassword"
                        className="text-xs text-gray-500"
                      >
                        Current password
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        type="password"
                        className={inputClassName}
                        placeholder="Current password"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="newPassword"
                        className="text-xs text-gray-500"
                      >
                        New password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        type="password"
                        className={inputClassName}
                        placeholder="New password"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs text-gray-500"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        type="password"
                        className={`${inputClassName} ${
                          passwordsMismatch ? "border-red-500" : ""
                        }`}
                        placeholder="Repeat new password"
                      />
                      {passwordsMismatch && (
                        <p className="text-xs text-red-500">
                          Confirmation does not match new password
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-sm font-medium cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Update password
                  </button>
                </CardFooter>
              </form>
            </Card>
          </Motion.div>
        </div>
      </div>
    </Motion.div>
  )
}

export default Profile

