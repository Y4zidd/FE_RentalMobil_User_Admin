import React, { useEffect, useRef, useState } from 'react'
import { assets, cityList, cityCoordinates } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import { motion as Motion } from 'motion/react'

const RecenterOnLocation = ({ center }) => {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.invalidateSize()
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 4), {
      animate: false,
    })
  }, [center, map])

  return null
}

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })
  return null
}

const MapZoomButtons = () => {
  const map = useMap()
  return (
    <div className='absolute bottom-4 right-4 flex flex-col gap-2'>
      <button
        type='button'
        onClick={() => map.zoomIn()}
        className='rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-gray-700 shadow-md hover:bg-white'
      >
        +
      </button>
      <button
        type='button'
        onClick={() => map.zoomOut()}
        className='rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-gray-700 shadow-md hover:bg-white'
      >
        −
      </button>
    </div>
  )
}

const fallbackLocations = cityList.map((city) => ({
  label: city,
  city,
  country: 'Custom',
  lat: cityCoordinates[city]?.lat,
  lng: cityCoordinates[city]?.lng,
}))

const ASEAN_COUNTRY_SET = new Set([
  'Brunei',
  'Cambodia',
  'Indonesia',
  'Laos',
  'Malaysia',
  'Myanmar',
  'Philippines',
  'Singapore',
  'Thailand',
  'Vietnam',
])

const ASEAN_BOUNDS = [
  [-12, 90],
  [30, 150],
]

const Hero = () => {

  const [pickupLocation, setPickupLocation] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('Indonesia')
  const [selectedCoords, setSelectedCoords] = useState(null)
  const statesControllerRef = useRef(null)
  const geocodeControllerRef = useRef(null)
  const [mapCenter, setMapCenter] = useState(() => {
    const first = fallbackLocations[0]
    if (first && first.lat && first.lng) {
      return { lat: first.lat, lng: first.lng }
    }
    return { lat: 20, lng: 0 }
  })
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [locations, setLocations] = useState([])
  const [provinces, setProvinces] = useState([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const geoCacheRef = useRef({})
  const pendingProvinceRef = useRef(null)

  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate, t } = useAppContext()

  useEffect(() => {
    let isMounted = true

    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true)

        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,capital,latlng'
        )

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!isMounted) {
          return
        }

        const mapped = data
          .filter((country) => {
            const name = country.name?.common
            if (!name) {
              return false
            }
            return ASEAN_COUNTRY_SET.has(name)
          })
          .filter(
            (country) =>
              Array.isArray(country.capital) && country.capital.length > 0
          )
          .map((country) => {
            const capital = country.capital[0]
            const name = country.name?.common || ''
            const [lat, lng] = country.latlng || []
            return {
              label: `${capital}, ${name}`,
              city: capital,
              country: name,
              lat,
              lng,
            }
          })
          .filter((location) => location.lat && location.lng)
          .sort((a, b) => a.label.localeCompare(b.label))

        setLocations(mapped)

        if (mapped.length > 0) {
          setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng })
        }
      } catch (error) {
        void error
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false)
        }
      }
    }

    fetchLocations()

    return () => {
      isMounted = false
    }
  }, [])

  const availableLocations = locations.length > 0 ? locations : fallbackLocations

  const countryOptions = Array.from(
    new Set(availableLocations.map((item) => item.country))
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    if (!selectedCountry) {
      setProvinces([])
      return
    }

    let isMounted = true

    const fetchProvinces = async () => {
      try {
        setIsLoadingLocations(true)

        if (statesControllerRef.current) {
          try {
            statesControllerRef.current.abort()
          } catch (error) {
            void error
          }
        }
        const controller = new AbortController()
        statesControllerRef.current = controller

        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: selectedCountry,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          return
        }

        const json = await response.json()

        if (!isMounted) {
          return
        }

        const states = json?.data?.states ?? []

        const options = states
          .map((state) => ({
            label: `${state.name}, ${selectedCountry}`,
            city: state.name,
            country: selectedCountry,
          }))
          .sort((a, b) =>
            a.label.localeCompare(b.label)
          )

        setProvinces(options)

        const pendingProvince = pendingProvinceRef.current
        if (pendingProvince) {
          const lower = pendingProvince.toLowerCase()
          const match = options.find(
            (item) =>
              item.city.toLowerCase() === lower ||
              item.label.toLowerCase().includes(lower)
          )
          pendingProvinceRef.current = null
          if (match) {
            try {
              if (geocodeControllerRef.current) {
                geocodeControllerRef.current.abort()
              }
            } catch (error) {
              void error
            }
            const controller2 = new AbortController()
            geocodeControllerRef.current = controller2
            try {
              const res = await fetch(
                'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=' +
                encodeURIComponent(`90,30,150,-12`) +
                '&q=' +
                encodeURIComponent(match.label),
                { signal: controller2.signal }
              )
              if (res.ok) {
                const results = await res.json()
                if (Array.isArray(results) && results.length > 0) {
                  const first = results[0]
                  const lat = parseFloat(first.lat)
                  const lng = parseFloat(first.lon)
                  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                    const center = { lat, lng }
                    setSelectedCoords(center)
                    setPickupLocation(match.label)
                    setMapCenter(center)
                  }
                }
              }
            } catch (error) {
              void error
            }
          }
        }

        try {
          const res = await fetch(
            'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=' +
            encodeURIComponent(`90,30,150,-12`) +
            '&q=' +
            encodeURIComponent(selectedCountry)
          )
          if (res.ok) {
            const results = await res.json()
            if (Array.isArray(results) && results.length > 0) {
              const first = results[0]
              const lat = parseFloat(first.lat)
              const lng = parseFloat(first.lon)
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                setMapCenter({ lat, lng })
              }
            }
          }
        } catch (error) {
          void error
        }
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

  const handleSearch = (e) => {
    e.preventDefault()
    if (!pickupLocation) {
      toast.error(t('hero_toast_pick_location_first'))
      return
    }
    const searchParams = new URLSearchParams()
    searchParams.set('pickupLocation', pickupLocation)
    if (pickupDate) {
      searchParams.set('pickupDate', pickupDate)
    }
    if (returnDate) {
      searchParams.set('returnDate', returnDate)
    }
    if (selectedCoords && typeof selectedCoords.lat === 'number' && typeof selectedCoords.lng === 'number') {
      searchParams.set('pickupLat', String(selectedCoords.lat))
      searchParams.set('pickupLng', String(selectedCoords.lng))
    }
    navigate('/cars?' + searchParams.toString())
  }

  const handleLocationChange = async (value) => {
    setPickupLocation(value)

    const [maybePlace, maybeCountry] = value
      .split(',')
      .map((part) => part.trim())

    const selectedProvince = provinces.find(
      (location) => location.label === value
    )

    if (selectedProvince) {
      const label = selectedProvince.label
      const cached = geoCacheRef.current[label]
      if (cached) {
        const center = { lat: cached.lat, lng: cached.lng }
        setSelectedCoords(center)
        setMapCenter(center)
        return
      }
      try {
        if (geocodeControllerRef.current) {
          try {
            geocodeControllerRef.current.abort()
          } catch (error) {
            void error
          }
        }
        const controller = new AbortController()
        geocodeControllerRef.current = controller
        const res = await fetch(
          'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=' +
          encodeURIComponent(`90,30,150,-12`) +
          '&q=' +
          encodeURIComponent(label),
          { signal: controller.signal }
        )
        if (res.ok) {
          const results = await res.json()
          if (Array.isArray(results) && results.length > 0) {
            const first = results[0]
            const lat = parseFloat(first.lat)
            const lng = parseFloat(first.lon)
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
              geoCacheRef.current[label] = { lat, lng }
              const center = { lat, lng }
              setSelectedCoords(center)
              setMapCenter(center)
              return
            }
          }
        }
      } catch (error) {
        void error
      }
    }

    let selected = availableLocations.find(
      (location) => location.label === value
    )

    if (!selected && maybeCountry) {
      selected = availableLocations.find(
        (location) => location.country === maybeCountry
      )
    }

    if (selected && selected.lat && selected.lng) {
      const center = { lat: selected.lat, lng: selected.lng }
      setSelectedCoords(center)
      setMapCenter(center)
      return
    }

    const coords =
      cityCoordinates[value] || (maybePlace ? cityCoordinates[maybePlace] : undefined)

    if (coords) {
      setSelectedCoords(coords)
      setMapCenter(coords)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('hero_toast_geolocation_not_supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setSelectedCoords(center)
        setMapCenter(center)

        try {
          const res = await fetch(
            'https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat=' +
            encodeURIComponent(center.lat) +
            '&lon=' +
            encodeURIComponent(center.lng)
          )
          if (!res.ok) {
            setPickupLocation(t('hero_current_location'))
            return
          }
          const data = await res.json()
          const address = data.address || {}
          const countryName = address.country || 'Indonesia'
          const provinceName =
            address.state ||
            address.region ||
            address.province ||
            address.city ||
            address.town ||
            address.county

          if (countryName) {
            let matchedCountry = countryOptions.find(
              (item) => item === countryName
            )
            if (!matchedCountry) {
              const lower = countryName.toLowerCase()
              matchedCountry = countryOptions.find(
                (item) =>
                  item.toLowerCase() === lower ||
                  item.toLowerCase().includes(lower) ||
                  lower.includes(item.toLowerCase())
              )
            }
            if (matchedCountry) {
              pendingProvinceRef.current = provinceName || null
              setSelectedCountry(matchedCountry)
              if (provinceName) {
                setPickupLocation(provinceName)
              } else {
                setPickupLocation(matchedCountry || 'Indonesia')
              }
              return
            }
          }

          setPickupLocation(t('hero_current_location'))
        } catch {
          setPickupLocation(t('hero_current_location'))
        }
      },
      () => {
        toast.error(t('hero_toast_geolocation_failed'))
      }
    )
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center'
    >
      <Motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='text-4xl md:text-5xl font-semibold'
      >
        {t('hero_heading')}
      </Motion.h1>

      <Motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className='flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-8 p-6 md:px-8 md:py-6 rounded-3xl md:rounded-full w-[90%] md:w-auto max-w-md md:max-w-5xl bg-white shadow-[0px_8px_30px_rgba(0,0,0,0.08)] md:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] text-left'
      >
        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-8 w-full md:w-auto'>
          <div className='flex flex-col gap-1.5 w-full md:w-48 border-b md:border-b-0 border-gray-100 pb-4 md:pb-0 relative md:pl-4'>
            <label className='text-xs font-bold text-gray-900 uppercase tracking-wider block'>
              {t('hero_pickup_location_label')}
            </label>
            <button
              type='button'
              onClick={() => setIsMapOpen(true)}
              className='text-left w-full group focus:outline-none'
            >
              <div className='text-sm text-gray-500 truncate group-hover:text-primary transition-colors'>
                {pickupLocation || t('hero_select_location_placeholder')}
              </div>
            </button>
          </div>

          <div className='hidden md:block w-px h-10 bg-gray-200' />

          <div className='flex flex-col gap-1.5 w-full md:w-auto border-b md:border-b-0 border-gray-100 pb-4 md:pb-0'>
            <label htmlFor='pickup-date' className='text-xs font-bold text-gray-900 uppercase tracking-wider block'>
              {t('hero_pickup_date_label')}
            </label>
            <input
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              type='date'
              id='pickup-date'
              min={new Date().toISOString().split('T')[0]}
              className='text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer block'
              required
            />
          </div>

          <div className='hidden md:block w-px h-10 bg-gray-200' />

          <div className='flex flex-col gap-1.5 w-full md:w-auto'>
            <label htmlFor='return-date' className='text-xs font-bold text-gray-900 uppercase tracking-wider block'>
              {t('hero_return_date_label')}
            </label>
            <input
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              type='date'
              id='return-date'
              className='text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer block'
              required
            />
          </div>
        </div>

        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium transition-colors shadow-lg shadow-primary/30 mt-2 md:mt-0 md:ml-6 md:shadow-none'
        >
          <img
            src={assets.search_icon}
            alt='search'
            className='brightness-0 invert w-5 h-5'
          />
          <span className='md:hidden'>{t('hero_search_button_mobile')}</span>
          <span className='hidden md:inline'>{t('hero_search_button_desktop')}</span>
        </Motion.button>
      </Motion.form>

      <Motion.img
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        src={assets.main_car}
        alt='car'
        className='max-h-74'
      />
      {isMapOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4'
        >
          <Motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 26,
              mass: 0.9,
            }}
            className='bg-white rounded-2xl shadow-xl max-w-xl w-full p-5 sm:p-6 space-y-4'
          >
            <div className='flex items-center justify-between'>
              <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
                {t('hero_modal_title')}
              </h2>
              <button
                type='button'
                onClick={() => setIsMapOpen(false)}
                className='text-xs px-2 py-1 rounded-full bg-slate-100 text-gray-600 hover:bg-slate-200'
              >
                x
              </button>
            </div>

            <div className='grid gap-3 sm:grid-cols-1'>
              <div className='flex flex-col gap-2'>
                <label className='text-xs text-gray-500'>
                  {t('hero_modal_province_city_label')}
                </label>
                <select
                  className='w-full rounded-xl border border-borderColor px-3 py-2 text-sm'
                  value={pickupLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                >
                  <option value=''>
                    {isLoadingLocations
                      ? t('hero_modal_loading_locations')
                      : t('hero_modal_select_province_city')}
                  </option>
                  {provinces.map((location) => (
                    <option key={location.label} value={location.label}>
                      {location.city || location.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='relative h-64 rounded-2xl overflow-hidden border border-borderColor bg-slate-50'>
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={4}
                minZoom={3}
                maxZoom={12}
                scrollWheelZoom
                zoomControl={false}
                maxBounds={ASEAN_BOUNDS}
                maxBoundsViscosity={1.0}
                preferCanvas
                updateWhenZooming
                updateWhenIdle
                wheelDebounceTime={40}
                wheelPxPerZoom={60}
                className='h-full w-full'
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <ZoomControl position='bottomright' />
                {selectedCoords && (
                  <CircleMarker
                    center={[selectedCoords.lat, selectedCoords.lng]}
                    radius={10}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.9,
                    }}
                  />
                )}
                <MapClickHandler
                  onSelect={(latlng) => {
                    const markerLocations =
                      provinces.length > 0 ? provinces : availableLocations
                    if (!markerLocations.length) {
                      return
                    }

                    let nearest = null
                    let minDist = Infinity

                    markerLocations.forEach((location) => {
                      if (
                        typeof location.lat !== 'number' ||
                        typeof location.lng !== 'number'
                      ) {
                        return
                      }
                      const dLat = latlng.lat - location.lat
                      const dLng = latlng.lng - location.lng
                      const distSq = dLat * dLat + dLng * dLng
                      if (distSq < minDist) {
                        minDist = distSq
                        nearest = location
                      }
                    })

                    if (nearest) {
                      handleLocationChange(nearest.label)
                    }
                  }}
                />
                <MapZoomButtons />
                <RecenterOnLocation center={mapCenter} />
              </MapContainer>
              <button
                type='button'
                onClick={handleUseMyLocation}
                className='absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-gray-700 shadow-md hover:bg-white'
              >
                {t('hero_modal_my_location_button')}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </Motion.div>
  )
}

export default Hero
