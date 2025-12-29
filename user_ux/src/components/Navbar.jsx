import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion as Motion } from 'motion/react'

const Navbar = () => {

    const {setShowLogin, user, logout} = useAppContext()

    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const navigate = useNavigate()

    const avatarSrc = user?.avatar_url || assets.user_profile

  return (
    <Motion.div 
    initial={{y: -20, opacity: 0}}
    animate={{y: 0, opacity: 1}}
    transition={{duration: 0.5}}
    className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${location.pathname === "/" && "bg-light"}`}>

        <Link to='/'>
            <Motion.img whileHover={{scale: 1.05}} src={assets.logo} alt="logo" className="h-8"/>
        </Link>

        <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
            {menuLinks.map((link, index)=> (
                <Link
                    key={index}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className="w-full sm:w-auto"
                >
                    {link.name}
                </Link>
            ))}

            {user && (
                <>
                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="w-full sm:hidden"
                    >
                        Profile
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            logout()
                            setOpen(false)
                        }}
                        className="w-full sm:hidden text-left cursor-pointer"
                    >
                        Logout
                    </button>
                </>
            )}

            <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                <input type="text" className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" placeholder="Search cars"/>
                <img src={assets.search_icon} alt="search" />
            </div>

            <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
                {!user && (
                    <button
                        onClick={() => {
                            setShowLogin(true)
                            setOpen(false)
                        }}
                        className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
                    >
                        Login
                    </button>
                )}

                {user && (
                    <>
                    <div className='relative max-sm:hidden'>
                        <button
                            type="button"
                            onClick={()=> setShowProfileMenu(prev => !prev)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <img
                                src={avatarSrc}
                                alt="User"
                                className="h-8 w-8 rounded-full object-cover border border-borderColor"
                            />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-borderColor rounded-lg shadow-lg py-2 text-sm z-50">
                                <button
                                    type="button"
                                    onClick={()=>{
                                        navigate('/profile')
                                        setShowProfileMenu(false)
                                        setOpen(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-light cursor-pointer"
                                >
                                    Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={()=>{
                                        logout()
                                        setShowProfileMenu(false)
                                        setOpen(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-light cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                    </>
                )}
            </div>

            {user && (
                <button
                    type="button"
                    onClick={() => {
                        navigate('/profile')
                        setOpen(false)
                    }}
                    className="sm:hidden mt-auto w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-light cursor-pointer text-left"
                >
                    <img
                        src={avatarSrc}
                        alt="User"
                        className="h-10 w-10 rounded-full object-cover border border-borderColor"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.name || "Guest User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            Profile
                        </p>
                    </div>
                </button>
            )}
        </div>

        <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={()=> setOpen(!open)}>
            <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
      
    </Motion.div>
  )
}

export default Navbar
