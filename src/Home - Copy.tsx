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
      className="min-h-screen bg-cover bg-center p-6 transition-all duration-300"
      style={{
        backgroundImage: selectedTrip ? `url(${selectedTrip.bgImage})` : 'none',
      }}
    >
      <div className="max-w-5xl mx-auto bg-white bg-opacity-90 rounded-xl p-6 shadow-lg flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Book Your Trip</h1>

          <select
            onChange={(e) => {
              const trip = trips.find((t) => t.id === parseInt(e.target.value))
              setSelectedTrip(trip || null)
              if (trip) setSearchParams({ trip: String(trip.id) })
            }}
            className="w-full mb-4 p-2 border rounded"
            value={selectedTrip?.id || ''}
          >
            <option value="">-- Select a Trip --</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>

          <div className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            <select
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              placeholder="Age"
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          {isFormValid && !showPreview && (
            <button
              onClick={() => setShowPreview(true)}
              className="mt-6 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
            >
              Preview Booking
            </button>
          )}

          {showPreview && (
            <div className="mt-6 p-4 border rounded bg-gray-100 text-sm">
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
                className="mt-4 inline-block bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
              >
                Confirm and Proceed to Payment
              </button>

              <div className="mt-4">
                <a
                  href={`https://wa.me/212600000000?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Need help? Contact us on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {selectedTrip && (
          <div className="lg:w-1/2">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              loop
              className="rounded shadow-lg"
            >
              {selectedTrip.photos.map((photo, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={photo}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-64 object-cover rounded"
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
