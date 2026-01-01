import React, { useRef } from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import { useAppContext } from '../context/AppContext'

const Home = () => {
  const { t } = useAppContext()
  const contentRef = useRef(null)

  const handleScrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <div className="relative">
        <Hero />
        <button
          type="button"
          onClick={handleScrollToContent}
          className="group absolute left-1/2 bottom-12 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[11px] font-medium text-gray-500 shadow-lg hover:bg-gray-50 hover:text-gray-700 transition"
        >
          <span className="tracking-wide">
            {t('home_scroll_hint')}
          </span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white transition">
            <span className="animate-bounce text-[10px] leading-none">↓</span>
          </span>
        </button>
      </div>
      <div ref={contentRef}>
        <FeaturedSection />
        <Banner />
        <Testimonial />
        <Newsletter />
      </div>
    </>
  )
}

export default Home
