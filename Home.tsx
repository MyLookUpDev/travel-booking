import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    address: '',
    phone: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  void message;
  void setMessage;

  const handleSubmit = async () => {
    if (!selectedTrip) {
      alert('Please select a trip.')
      return
    }

    const dataToSend = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: 'oussama@example.com',
      destination: selectedTrip.name,
      date: '2025-07-01'
    }

    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(`❌ Booking failed: ${err.error}`)
        return
      }

      alert('✅ Booking saved successfully!')
      navigate('/payment')
    } catch (error) {
      console.error('Booking error:', error)
      alert('❌ Could not connect to server.')
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white to-blue-100 p-4 flex items-center justify-center"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Book Your Trip</h1>

        <select
          onChange={(e) => {
            const trip = trips.find((t) => t.id === parseInt(e.target.value))
            setSelectedTrip(trip || null)
          }}
          className="w-full mb-5 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a Trip --</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
          <select
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
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
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Age"
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: e.target.value })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 shadow"
        >
          Confirm and Proceed to Payment
        </button>

        <div className="mt-6 text-center">
          <a
            href={`https://wa.me/212600000000?text=Hello%2C%20I%20need%20assistance%20with%20my%20trip%20booking`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Need help? Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
