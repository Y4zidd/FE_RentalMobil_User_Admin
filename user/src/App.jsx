import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import BookingDetails from './pages/BookingDetails'
import Profile from './pages/Profile'
import Footer from './components/Footer'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {
  const { showLogin } = useAppContext()

  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/my-bookings/:id' element={<BookingDetails />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
