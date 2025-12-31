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

const INDONESIAN_PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Selatan",
]

const Profile = () => {
  const { user, setUser, axios, navigate, t } = useAppContext()

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
  const [selectedProvince, setSelectedProvince] = useState("")
  const [provinceOptions] = useState(INDONESIAN_PROVINCES)

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
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false)

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
      setSelectedProvince(parts[0] || defaultCity)
    } else {
      setSelectedProvince("")
    }
    setAvatarPreview(baseUser?.avatar_url || "")
  }, [baseUser])

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

  const handleProvinceChange = (value) => {
    setSelectedProvince(value)
    setRentalForm((prev) => ({
      ...prev,
      defaultCity: value ? `${value}, Indonesia` : "",
    }))
  }

  const handleSaveAccount = async (e) => {
    e.preventDefault()
    const trimmedEmail = (accountForm.email || "").trim()
    const currentEmail = (baseUser.email || "").trim()
    const emailChanged =
      trimmedEmail &&
      trimmedEmail.toLowerCase() !== currentEmail.toLowerCase()

    try {
      const payload = {
        name: accountForm.name,
        phone: accountForm.phone,
      }

      const { data: updatedUser } = await axios.put(
        "/api/user/profile",
        payload
      )
      setUser(updatedUser)

      if (!emailChanged) {
        toast.success(t('profile_toast_profile_updated'))
        return
      }

      const { data } = await axios.post(
        "/api/user/profile/request-email-change-code",
        {
          new_email: trimmedEmail,
        }
      )
      setPendingEmail(trimmedEmail)
      setEmailVerificationCode("")
      toast.success(
        data?.message ||
          t('profile_toast_verification_sent')
      )
    } catch (error) {
      console.error(error)
      const message =
        error?.response?.data?.message || t('profile_toast_update_failed')
      toast.error(message)
    }
  }

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault()
    if (!pendingEmail) {
      toast.error(t('profile_toast_no_email_change'))
      return
    }
    if (!emailVerificationCode.trim()) {
      toast.error(t('profile_toast_enter_verification_code'))
      return
    }

    try {
      setIsVerifyingEmailCode(true)
      const { data } = await axios.post(
        "/api/user/profile/confirm-email-change",
        {
          new_email: pendingEmail,
          code: emailVerificationCode.trim(),
        }
      )

      const updatedUser = data?.user || data
      setUser(updatedUser)
      setAccountForm((prev) => ({
        ...prev,
        email: updatedUser.email || prev.email,
      }))
      setPendingEmail("")
      setEmailVerificationCode("")
      toast.success(data?.message || t('profile_toast_email_updated'))
    } catch (error) {
      console.error(error)
      const message =
        error?.response?.data?.message ||
        t('profile_toast_email_verify_failed')
      toast.error(message)
    } finally {
      setIsVerifyingEmailCode(false)
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
      toast.success(t('profile_toast_rental_updated'))
    } catch (error) {
      console.error(error)
      toast.error(t('profile_toast_rental_update_failed'))
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error(t('profile_toast_password_fill_all'))
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('profile_toast_password_mismatch'))
      return
    }
    try {
      await axios.put("/api/user/password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      })
      toast.success(t('profile_toast_password_updated'))
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error(error)
      toast.error(t('profile_toast_password_update_failed'))
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith("image/")) {
      toast.error(t('profile_toast_avatar_not_image'))
      e.target.value = ""
      return
    }

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const { data } = await axios.post("/api/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setUser(data)
      setAvatarPreview(data.avatar_url || "")
      toast.success(t('profile_toast_avatar_updated'))
    } catch (error) {
      console.error(error)
      toast.error(t('profile_toast_avatar_update_failed'))
    } finally {
      e.target.value = ""
    }
  }

  const avatarSrc = avatarPreview || assets.user_profile
  const inputClassName =
    "w-full px-3 py-2 rounded-md border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white text-sm text-gray-900 placeholder:text-gray-400"
  const labelClassName = "block text-xs font-medium text-gray-700 mb-1"

  const tabs = [
    { id: "personal", label: t('profile_tabs_personal') },
    { id: "rental", label: t('profile_tabs_rental') },
    { id: "security", label: t('profile_tabs_security') },
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
            title={t('profile_title')}
            subTitle={t('profile_subtitle')}
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
                          {t('profile_overview_heading')}
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
                            {t('profile_picture_heading')}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            {t('profile_picture_subtitle')}
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
                              {t('profile_picture_change_button')}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          {t('profile_personal_section_heading')}
                        </h4>
                        <form onSubmit={handleSaveAccount} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="name" className={labelClassName}>
                                {t('profile_name_label')}
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
                                {t('profile_email_label')}
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
                                {t('profile_phone_label')}
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
                                  {t('profile_email_verification_label')}
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
                                    placeholder={t('profile_email_verification_placeholder')}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleConfirmEmailChange}
                                    disabled={
                                      isVerifyingEmailCode ||
                                      !emailVerificationCode
                                    }
                                    className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dull text-white text-[11px] font-medium disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    {isVerifyingEmailCode
                                      ? t('profile_email_verification_button_verifying')
                                      : t('profile_email_verification_button_verify')}
                                  </button>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                  {t('profile_email_verification_help_prefix')}{" "}
                                  <span className="font-medium">
                                    {pendingEmail}
                                  </span>
                                  . {t('profile_email_verification_help_suffix')}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-start pt-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-xs font-medium transition-colors"
                            >
                              {t('profile_save_changes_button')}
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
                        <h3 className="text-base font-semibold text-gray-900">{t('profile_rental_heading')}</h3>
                      </div>
                      <form onSubmit={handleSaveRental} className="space-y-4">
                        {/* ... same fields, smaller spacing ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="licenseNumber" className={labelClassName}>{t('profile_license_label')}</label>
                            <input type="text" id="licenseNumber" name="licenseNumber" value={rentalForm.licenseNumber} onChange={handleRentalChange} className={inputClassName} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClassName}>{t('profile_default_pickup_label')}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select
                              value={selectedProvince}
                              onChange={(e) => handleProvinceChange(e.target.value)}
                              className={inputClassName}
                            >
                              <option value="">Select Province</option>
                              {provinceOptions.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="preferences" className={labelClassName}>{t('profile_preferences_label')}</label>
                          <textarea id="preferences" name="preferences" value={rentalForm.preferences} onChange={handleRentalChange} rows={3} className={inputClassName} />
                        </div>
                        <div className="flex justify-start pt-2">
                          <button type="submit" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dull text-white text-xs font-medium">{t('profile_save_details_button')}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6">
                      <div><h3 className="text-base font-semibold text-gray-900">{t('profile_security_heading')}</h3></div>
                      <form onSubmit={handleSavePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-1 md:col-span-2 max-w-sm">
                            <label htmlFor="currentPassword" className={labelClassName}>
                              {t('profile_current_password_label')}
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
                              {t('profile_new_password_label')}
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
                              {t('profile_confirm_new_password_label')}
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
                            {t('profile_update_password_button')}
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
