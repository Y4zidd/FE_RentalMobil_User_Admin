import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { mockUser } from '../assets/mockData';

const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3000';

const Login = () => {

    const {setShowLogin, setToken, setUser} = useAppContext()

    const [state, setState] = React.useState("login"); // login | register | verify | forgot | reset
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [verificationCode, setVerificationCode] = React.useState("");
    const [resetPassword, setResetPassword] = React.useState("");
    const [resetPasswordConfirm, setResetPasswordConfirm] = React.useState("");

    const handleAfterAuthSuccess = (user, token) => {
        if (user?.role === 'admin' || user?.role === 'staff') {
            setShowLogin(false)
            toast.success('Login successful, redirecting to admin dashboard')
            window.location.href = `${ADMIN_BASE_URL}/auth/sign-in?token=${encodeURIComponent(
                token
            )}`
            return
        }
        setToken(token)
        localStorage.setItem('token', token)
        setUser(user)
        setShowLogin(false)
        toast.success('Login successful')
    }

    const onSubmitHandler = (event)=>{
        event.preventDefault();

        if (state === 'login') {
            const demoUser = {
                ...mockUser,
                email: email || mockUser.email,
            }
            handleAfterAuthSuccess(demoUser, 'demo-token')
        } else if (state === 'register') {
            if (!name || !email || !password) {
                toast.error('Please fill all fields')
                return
            }
            toast.success('Demo only: verification code sent to your email')
            setState('verify')
        } else if (state === 'verify') {
            if (!verificationCode.trim()) {
                toast.error('Please enter the verification code')
                return
            }
            const demoUser = {
                ...mockUser,
                email: email || mockUser.email,
            }
            handleAfterAuthSuccess(demoUser, 'demo-token')
        } else if (state === 'forgot') {
            if (!email) {
                toast.error('Please enter your email')
                return
            }
            toast.success('Demo only: reset code has been sent')
            setState('reset')
        } else if (state === 'reset') {
            if (!verificationCode.trim()) {
                toast.error('Please enter the reset code')
                return
            }
            if (!resetPassword || !resetPasswordConfirm) {
                toast.error('Please fill both password fields')
                return
            }
            if (resetPassword !== resetPasswordConfirm) {
                toast.error('Passwords do not match')
                return
            }
            toast.success('Demo only: password has been reset, please login')
            setState('login')
            setPassword('')
            setResetPassword('')
            setResetPasswordConfirm('')
            setVerificationCode('')
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
          {state === "login" && "Login"}
          {state === "register" && "Sign Up"}
          {state === "verify" && "Verify Email"}
          {state === "forgot" && "Forgot Password"}
          {state === "reset" && "Reset Password"}
        </p>

        {(state === "register" || state === "verify" || state === "forgot" || state === "reset") && (
          <div className="w-full">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="email"
              required
            />
          </div>
        )}

        {state === "register" && (
          <>
            <div className="w-full">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
                required
              />
            </div>
            <div className="w-full">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="type here"
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
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="email"
                required
              />
            </div>
            <div className="w-full ">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Forgot password?{" "}
              <span
                onClick={() => setState("forgot")}
                className="text-primary cursor-pointer"
              >
                click here
              </span>
            </p>
          </>
        )}

        {state === "verify" && (
          <div className="w-full">
            <p>Verification code</p>
            <input
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
              placeholder="6-digit code"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
            />
            <p className="text-xs text-gray-500 mt-1">
              We sent a code to <span className="font-medium">{email}</span>.
            </p>
          </div>
        )}

        {state === "forgot" && (
          <p className="text-xs text-gray-500">
            Enter your email to receive a password reset code.
          </p>
        )}

        {state === "reset" && (
          <>
            <div className="w-full">
              <p>Reset code</p>
              <input
                onChange={(e) => setVerificationCode(e.target.value)}
                value={verificationCode}
                placeholder="6-digit code"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
              />
            </div>
            <div className="w-full">
              <p>New password</p>
              <input
                onChange={(e) => setResetPassword(e.target.value)}
                value={resetPassword}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
              />
            </div>
            <div className="w-full">
              <p>Confirm new password</p>
              <input
                onChange={(e) => setResetPasswordConfirm(e.target.value)}
                value={resetPasswordConfirm}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="password"
              />
            </div>
          </>
        )}

        {state === "register" && (
          <p>
            Already have account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-primary cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
        {state === "login" && (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-primary cursor-pointer"
            >
              click here
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
            Back to login
          </p>
        )}

        <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "login" && "Login"}
          {state === "register" && "Create Account"}
          {state === "verify" && "Verify Email"}
          {state === "forgot" && "Send Code"}
          {state === "reset" && "Reset Password"}
        </button>
      </form>
    </div>
  )
}

export default Login
