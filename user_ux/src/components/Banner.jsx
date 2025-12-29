import React from 'react'
import { assets } from '../assets/assets'
import { motion as Motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <Motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className='flex flex-col md:flex-row md:items-start items-center justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden'>

        <div className='text-white'>
            <h2 className='text-3xl font-medium'>Planning Your Next Trip?</h2>
            <p className='mt-2'>Find the right car for business travel, weekend getaways, or daily rides.</p>
            <p className='max-w-130'>Book from trusted vehicles with clear pricing, flexible durations, and secure online payment — all in one place.</p>

            <Motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/cars')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className='px-6 py-2 bg-white hover:bg-slate-100 transition-all text-primary rounded-lg text-sm mt-4 cursor-pointer'>Find a car</Motion.button>
        </div>

        <Motion.img 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        src={assets.banner_car_image} alt="car" className='max-h-45 mt-10'/>
      
    </Motion.div>
  )
}

export default Banner
