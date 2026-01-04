import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import {
  loginRequest,
  registerRequest,
  requestVerificationCode,
  verifyEmailCode,
  resetPasswordWithCode,
} from '../lib/api/auth'

const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_URL;

const Login = () => {

    const {setShowLogin, setToken, setUser, t} = useAppContext()

    const [state, setState] = React.useState("login"); // login | register | verify | forgot | reset
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [verificationCode, setVerificationCode] = React.useState("");
    const [resetPassword, setResetPassword] = React.useState("");
    const [resetPasswordConfirm, setResetPasswordConfirm] = React.useState("");

    const handleAfterAuthSuccess = (user, token) => {
        if (user?.role === 'admin' || user?.role === 'staff') {
            if (!ADMIN_BASE_URL) {
                toast.error(t('login_admin_url_not_configured'))
                return
            }
            setShowLogin(false)
            toast.success(t('login_admin_redirect_success'))
            window.location.href = `${ADMIN_BASE_URL}/auth/sign-in?token=${encodeURIComponent(
                token
            )}`
            return
        }
        setToken(token)
        localStorage.setItem('token', token)
        setUser(user)
        setShowLogin(false)
        toast.success(t('login_success'))
    }

    const onSubmitHandler = async (event)=>{
        event.preventDefault();

        try {
            if (state === 'login') {
                const { data } = await loginRequest(email, password)
                if (data.token && data.user) {
                    handleAfterAuthSuccess(data.user, data.token)
                }
            } else if (state === 'register') {
                await registerRequest(name, email, password)
                toast.success(t('login_verification_sent'))
                setState('verify')
            } else if (state === 'verify') {
                if (!verificationCode.trim()) {
                    toast.error(t('login_enter_verification_code'))
                    return
                }
                const { data } = await verifyEmailCode(email, verificationCode.trim())
                if (data.token && data.user) {
                    handleAfterAuthSuccess(data.user, data.token)
                }
            } else if (state === 'forgot') {
                await requestVerificationCode(email)
                toast.success(t('login_reset_email_sent'))
                setState('reset')
            } else if (state === 'reset') {
                if (!verificationCode.trim()) {
                    toast.error(t('login_enter_reset_code'))
                    return
                }
                if (!resetPassword || !resetPasswordConfirm) {
                    toast.error(t('login_fill_both_password_fields'))
                    return
                }
                if (resetPassword !== resetPasswordConfirm) {
                    toast.error(t('login_passwords_do_not_match'))
                    return
                }
                await resetPasswordWithCode({
                    email,
                    code: verificationCode.trim(),
                    password: resetPassword,
                    password_confirmation: resetPasswordConfirm
                })
                toast.success(t('login_password_reset_success'))
                setState('login')
                setPassword('')
                setResetPassword('')
                setResetPasswordConfirm('')
                setVerificationCode('')
            }
        } catch (error) {
            console.error(error)
            const apiMessage =
              error?.response?.data?.message ||
              (error?.response?.data?.errors &&
                Object.values(error.response.data.errors)[0][0])

            toast.error(apiMessage || t('login_auth_failed'))
        }
    }

  return (
    <div onClick={()=> setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>

      <form
        onSubmit={onSubmitHandler}
        onClick={(e)=>e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span>{" "}
          {state === "login" && t('login_title_login')}
          {state === "register" && t('login_title_register')}
          {state === "verify" && t('login_title_verify')}
          {state === "forgot" && t('login_title_forgot')}
          {state === "reset" && t('login_title_reset')}
        </p>

        {(state === "register" || state === "verify" || state === "forgot" || state === "reset") && (
          <div className="w-full">
            <p>{t('login_label_email')}</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder={t('login_placeholder_type_here')}
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="email"
              required
            />
          </div>
        )}

        {state === "register" && (
          <>
            <div className="w-full">
              <p>{t('login_label_name')}</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
                required
              />
            </div>
            <div className="w-full">
              <p>{t('login_label_password')}</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
                required
              />
            </div>
          </>
        )}

        {state === "login" && (
          <>
            <div className="w-full ">
              <p>{t('login_label_email')}</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="email"
                required
              />
            </div>
            <div className="w-full ">
              <p>{t('login_label_password')}</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('login_hint_forgot_password')}{" "}
              <span
                onClick={() => setState("forgot")}
                className="text-primary cursor-pointer"
              >
                {t('login_hint_click_here')}
              </span>
            </p>
          </>
        )}

        {state === "verify" && (
          <div className="w-full">
            <p>{t('login_label_verification_code')}</p>
            <input
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
              placeholder={t('login_placeholder_verification_code')}
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('login_verify_sent_hint')} <span className="font-medium">{email}</span>.
            </p>
          </div>
        )}

        {state === "forgot" && (
          <p className="text-xs text-gray-500">
            {t('login_forgot_hint')}
          </p>
        )}

        {state === "reset" && (
          <>
            <div className="w-full">
              <p>{t('login_label_reset_code')}</p>
              <input
                onChange={(e) => setVerificationCode(e.target.value)}
                value={verificationCode}
                placeholder={t('login_placeholder_verification_code')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
              />
            </div>
            <div className="w-full">
              <p>{t('login_label_new_password')}</p>
              <input
                onChange={(e) => setResetPassword(e.target.value)}
                value={resetPassword}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
              />
            </div>
            <div className="w-full">
              <p>{t('login_label_confirm_new_password')}</p>
              <input
                onChange={(e) => setResetPasswordConfirm(e.target.value)}
                value={resetPasswordConfirm}
                placeholder={t('login_placeholder_type_here')}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
              />
            </div>
          </>
        )}

        {state === "register" && (
          <p>
            {t('login_text_already_have_account')}{" "}
            <span
              onClick={() => setState("login")}
              className="text-primary cursor-pointer"
            >
              {t('login_hint_click_here')}
            </span>
          </p>
        )}
        {state === "login" && (
          <p>
            {t('login_text_create_account')}{" "}
            <span
              onClick={() => setState("register")}
              className="text-primary cursor-pointer"
            >
              {t('login_hint_click_here')}
            </span>
          </p>
        )}
        {(state === "verify" || state === "forgot" || state === "reset") && (
          <p
            className="text-xs text-gray-500 cursor-pointer"
            onClick={() => {
              setState("login")
              setVerificationCode("")
            }}
          >
            {t('login_text_back_to_login')}
          </p>
        )}

        <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "login" && t('login_button_login')}
          {state === "register" && t('login_button_create_account')}
          {state === "verify" && t('login_button_verify_email')}
          {state === "forgot" && t('login_button_send_code')}
          {state === "reset" && t('login_button_reset_password')}
        </button>
      </form>
    </div>
  )
}

export default Login
