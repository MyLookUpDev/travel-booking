import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import './index.css'

type Trip = {
  id: number
  name: string
  bgImage: string
  photos: string[]
  genderRestriction: 'all' | 'women' | 'men'
}

const trips: Trip[] = [
  {
    id: 1,
    name: 'Beach & Boat Ride',
    bgImage: '/beach.jpg',
    photos: ['/beach1.jpg', '/beach2.jpg'],
    genderRestriction: 'all',
  },
  {
    id: 2,
    name: 'Hiking & Horse Riding (Women Only)',
    bgImage: '/hiking.jpg',
    photos: ['/hike1.jpg', '/hike2.jpg'],
    genderRestriction: 'women',
  },
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formData')
    return saved
      ? JSON.parse(saved)
      : {
          firstName: '',
          lastName: '',
          gender: '',
          age: '',
          address: '',
          phone: '',
        }
  })
  const [showPreview, setShowPreview] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    const tripId = searchParams.get('trip')
    if (tripId) {
      const trip = trips.find((t) => t.id === parseInt(tripId))
      if (trip) setSelectedTrip(trip)
    }
  }, [searchParams])

  const isFormValid =
    selectedTrip &&
    formData.firstName &&
    formData.lastName &&
    formData.gender &&
    formData.age &&
    formData.address &&
    formData.phone

  const message = encodeURIComponent(
    `Hello, I'm ${formData.firstName} ${formData.lastName} and I want to book the trip: ${selectedTrip?.name}. My phone is ${formData.phone} and I live at ${formData.address}. Gender: ${formData.gender}, Age: ${formData.age}.`
  )

  const handleConfirm = () => {
    navigate('/payment')
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 sm:p-6 transition-all duration-300"
      style={{
        backgroundImage: selectedTrip ? `url(${selectedTrip.bgImage})` : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="w-full max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Book Your Trip</h1>

          <select
            onChange={(e) => {
              const trip = trips.find((t) => t.id === parseInt(e.target.value))
              setSelectedTrip(trip || null)
              if (trip) setSearchParams({ trip: String(trip.id) })
            }}
            className="w-full mb-5 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={selectedTrip?.id || ''}
          >
            <option value="">-- Select a Trip --</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            <select
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 col-span-1 sm:col-span-2"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Age"
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
            />
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <input
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 col-span-1 sm:col-span-2"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {isFormValid && !showPreview && (
            <button
              onClick={() => setShowPreview(true)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow"
            >
              Preview Booking
            </button>
          )}

          {showPreview && (
            <div className="mt-6 p-6 border rounded-xl bg-gray-100 shadow-sm">
              <p>
                <strong>Trip:</strong> {selectedTrip?.name}
              </p>
              <p>
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {formData.gender}
              </p>
              <p>
                <strong>Age:</strong> {formData.age}
              </p>
              <p>
                <strong>Address:</strong> {formData.address}
              </p>
              <p>
                <strong>Phone:</strong> {formData.phone}
              </p>

              <button
                onClick={handleConfirm}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg shadow"
              >
                Confirm and Proceed to Payment
              </button>

              <div className="mt-4 text-center">
                <a
                  href={`https://wa.me/212600000000?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Need help? Contact us on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {selectedTrip && (
          <div className="w-full max-w-lg mx-auto">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              loop
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              {selectedTrip.photos.map((photo, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={photo}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-72 object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  )
}
