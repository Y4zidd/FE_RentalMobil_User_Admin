import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3000';

const Login = () => {

    const {setShowLogin, setToken, setUser, axios} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

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

    const onSubmitHandler = async (event)=>{
        event.preventDefault();
        
        try {
            if (state === 'login') {
                const { data } = await axios.post('/api/user/login', { email, password })
                if (data.token && data.user) {
                    handleAfterAuthSuccess(data.user, data.token)
                }
            } else {
                const { data } = await axios.post('/api/user/register', { name, email, password })
                if (data.token && data.user) {
                    handleAfterAuthSuccess(data.user, data.token)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Authentication failed')
        }
    }

  return (
    <div onClick={()=> setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>

      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
            </div>
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            )}
            <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
    </div>
  )
}

export default Login
