import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion as Motion } from 'motion/react'

const Navbar = () => {

    const {setShowLogin, user, logout, t, language, setLanguage} = useAppContext()

    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const navigate = useNavigate()

    const avatarSrc = user?.avatar_url || assets.user_profile

    const menuLabelKeyByPath = {
        '/': 'menu_home',
        '/cars': 'menu_cars',
        '/my-bookings': 'menu_my_bookings',
    }

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
                        {menuLabelKeyByPath[link.path] ? t(menuLabelKeyByPath[link.path]) : link.name}
                    </Link>
                ))}

                {user && (
                    <>
                        <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="w-full sm:hidden"
                        >
                            {t('navbar_profile')}
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                logout()
                                setOpen(false)
                            }}
                            className="w-full sm:hidden text-left cursor-pointer"
                        >
                            {t('navbar_logout')}
                        </button>
                    </>
                )}

                <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                    <input type="text" className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" placeholder={t('navbar_search_placeholder')}/>
                    <img src={assets.search_icon} alt="search" />
                </div>

                <div className='flex max-sm:flex-col max-sm:w-full items-start sm:items-center gap-4 sm:gap-6'>
                    <div className="flex items-center gap-1 border border-borderColor rounded-full px-1 py-0.5 text-xs max-sm:w-full max-sm:justify-between">
                        <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-2 py-0.5 rounded-full cursor-pointer ${language === 'en' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage('id')}
                            className={`px-2 py-0.5 rounded-full cursor-pointer ${language === 'id' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                            ID
                        </button>
                    </div>
                    {!user && (
                        <button
                            onClick={() => {
                                setShowLogin(true)
                                setOpen(false)
                            }}
                            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg max-sm:w-full text-center"
                        >
                            {t('navbar_login')}
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
                                        {t('navbar_profile')}
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
                                        {t('navbar_logout')}
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
                                {user?.name || t('navbar_guest_user')}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {t('navbar_profile')}
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
