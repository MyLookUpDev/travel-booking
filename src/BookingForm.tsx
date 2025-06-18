import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Define type and mock data for trips
type Trip = { date: string; seats: number; gender: string };
type Destination = keyof typeof availableTrips;

const availableTrips: Record<string, Trip[]> = {
  Akchour: [
    { date: '2025-06-22', seats: 5, gender: 'all' },
    { date: '2025-06-29', seats: 0, gender: 'female' },
  ],
  Hoceima: [
    { date: '2025-06-21', seats: 3, gender: 'all' },
    { date: '2025-06-28', seats: 2, gender: 'all' },
  ],
};

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    cin: '',
    destination: '',
    date: '',
    gender: 'male',
    age: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [availableDates, setAvailableDates] = useState<Trip[]>([]);
  const [barcodeData, setBarcodeData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bookingForm');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('bookingForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const key = formData.destination as Destination;
    const trips = availableTrips[key] || [];
    setAvailableDates(trips);
  }, [formData.destination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trip = availableDates.find((t) => t.date === formData.date);
    const age = parseInt(formData.age);

    if (!trip) return setError('Invalid trip selection.');
    if (trip.seats <= 0) return setError('This trip is fully booked.');
    if (trip.gender === 'female' && formData.gender !== 'female') return setError('This trip is for women only.');
    if (age < 18) return setError('You must be at least 18 years old.');

    const payload = { ...formData, age };

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setBarcodeData(`${formData.name}|${formData.phone}|${formData.destination}|${formData.date}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const whatsappMessage = `https://wa.me/?text=Booking%20Request:%0AName:%20${encodeURIComponent(
    formData.name
  )}%0APhone:%20${encodeURIComponent(formData.phone)}%0ADestination:%20${encodeURIComponent(
    formData.destination
  )}%0ADate:%20${formData.date}`;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Book Your Trip</h2>

      {submitted ? (
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold">Booking confirmed!</p>
          <QRCodeCanvas value={barcodeData} size={150} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Your address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            name="cin"
            placeholder="National ID (CIN)"
            value={formData.cin}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="number"
            name="age"
            placeholder="Your age"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />

          <select
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">Select destination</option>
            {Object.keys(availableTrips).map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>

          <select
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded"
            disabled={!formData.destination}
          >
            <option value="">Select date</option>
            {availableDates.map((trip) => (
              <option key={trip.date} value={trip.date}>
                {trip.date} ({trip.seats} seats left{trip.gender === 'female' ? ', women only' : ''})
              </option>
            ))}
          </select>

          <div className="bg-gray-100 p-4 rounded text-sm">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Address:</strong> {formData.address}</p>
            <p><strong>CIN:</strong> {formData.cin}</p>
            <p><strong>Gender:</strong> {formData.gender}</p>
            <p><strong>Age:</strong> {formData.age}</p>
            <p><strong>Destination:</strong> {formData.destination}</p>
            <p><strong>Date:</strong> {formData.date}</p>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Submit
            </button>
            <a
              href={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              WhatsApp
            </a>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
