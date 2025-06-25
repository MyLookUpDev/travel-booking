import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Navbar from "./components/Navbar"; // Adjust path if needed

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type Activity = {
  name: string;
  hour: string;
  period: string;
  optional: boolean;
};

type Trip = {
  _id: string;
  destination: string;
  date: string;
  seats: number;
  gender: string;
  image?: string;
  price?: number;
  activities?: Activity[];
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
  const [error, setError] = useState('');
  const [barcodeData, setBarcodeData] = useState('');
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [availableDates, setAvailableDates] = useState<Trip[]>([]);
  const [bgImage, setBgImage] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [waNumber, setWaNumber] = useState('');         // Current number (fetched from backend)
  const previewRef = useRef<HTMLDivElement>(null);

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: "#fff"
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("booking-confirmation.pdf");
  };

  // Get query parameters
  const query = useQuery();

  // On mount: fetch all trips and handle URL prefill
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/trips`)
      .then((res) => res.json())
      .then((data) => setAllTrips(data))
      .catch(() => setAllTrips([]));
  }, []);

  // Fetch WhatsApp number on mount
    useEffect(() => {
      fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp-number`)
        .then(res => res.json())
        .then(data => {
          setWaNumber(data.number);
        })
        .catch(() => setWaNumber(''));
    }, []);

  // On mount: prefill from localStorage, then from URL if available
  useEffect(() => {
    const saved = localStorage.getItem('bookingForm');
    const base = saved ? JSON.parse(saved) : {};
    const destination = query.get('destination') || '';
    const date = query.get('date') || '';
    setFormData((fd) => ({
      ...fd,
      ...base,
      destination: destination || base.destination || '',
      date: date || base.date || '',
    }));
    // eslint-disable-next-line
  }, []);

  // Save form to localStorage
  useEffect(() => {
    localStorage.setItem('bookingForm', JSON.stringify(formData));
  }, [formData]);

  // Update available dates and background image when destination changes or trips update
  useEffect(() => {
    if (!formData.destination) {
      setAvailableDates([]);
      setBgImage('');
      setSelectedTrip(null);
      return;
    }
    const filtered = allTrips.filter((t) => t.destination === formData.destination);
    setAvailableDates(filtered);

    // Set background image to first found image for that destination
    setBgImage(filtered.find((t) => t.image)?.image || '');

    // If the current date isn't in the filtered dates, reset it
    if (formData.date && !filtered.some((t) => t.date === formData.date)) {
      setFormData((fd) => ({ ...fd, date: '' }));
      setSelectedTrip(null);
    }
    // If the date is present, select the trip
    if (formData.date && filtered.some((t) => t.date === formData.date)) {
      const trip = filtered.find((t) => t.date === formData.date);
      setSelectedTrip(trip || null);
      if (trip?.image) setBgImage(trip.image);
    }
  }, [formData.destination, allTrips]);

  // When date changes, select the correct trip and image
  useEffect(() => {
    if (formData.date && formData.destination) {
      const trip = allTrips.find(
        (t) =>
          t.destination === formData.destination &&
          t.date === formData.date
      );
      setSelectedTrip(trip || null);
      if (trip?.image) setBgImage(trip.image);
    } else {
      setSelectedTrip(null);
    }
  }, [formData.date, formData.destination, allTrips]);

  // Get all unique destinations
  const destinations = Array.from(new Set(allTrips.map((t) => t.destination)));

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trip = selectedTrip;
    const age = parseInt(formData.age);

    if (!trip) return setError('Invalid trip selection.');
    if (trip.seats <= 0) return setError('This trip is fully booked.');
    if (trip.gender === 'female' && formData.gender !== 'female')
      return setError('This trip is for women only.');
    if (age < 18) return setError('You must be at least 18 years old.');

    const payload = { ...formData, age, tripId: trip._id };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setBarcodeData(
          `${formData.name}|${formData.phone}|${formData.destination}|${formData.date}`
        );
        // Automatically open WhatsApp with prefilled message
        window.open(whatsappMessage, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const whatsappMessage = `https://wa.me/${waNumber}?text=` +
  encodeURIComponent(
    `✅ Booking Request:\n` +
    `Name: ${formData.name}\n` +
    `Phone: ${formData.phone}\n` +
    `Address: ${formData.address}\n` +
    `CIN: ${formData.cin}\n` +
    `Gender: ${formData.gender}\n` +
    `Age: ${formData.age}\n` +
    `Destination: ${formData.destination}\n` +
    `Date: ${formData.date}\n` +
    (selectedTrip?.price ? `Price: ${selectedTrip.price} MAD\n` : "")
  );

  return (
    <div className="bg-gray-200 text-gray-900"
      style={
        bgImage
          ? {
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : { background: '#e5e7eb' }
      }
    >
      <Navbar />
      <div
        className={`max-w-xl mx-auto p-6 rounded-lg shadow relative`}
        style={
          bgImage
            ? {
                backgroundImage: `url('${bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : { background: '#f3f4f6' }
        }
      >
        {bgImage && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-70 rounded-lg pointer-events-none"></div>
        )}

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Book Your Trip</h2>

          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-semibold">Booking confirmed!</p>
              {/* Wrap QR code + summary with previewRef */}
              <div ref={previewRef}>
                <QRCodeCanvas value={barcodeData} size={150} />
                {/* Booking Preview */}
                <div className="text-left text-gray-700 bg-gray-100 p-4 rounded w-64 mx-auto">
                  <h3 className="font-bold mb-2 text-lg">Booking Summary</h3>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Address:</strong> {formData.address}</p>
                  <p><strong>CIN:</strong> {formData.cin}</p>
                  <p><strong>Gender:</strong> {formData.gender}</p>
                  <p><strong>Age:</strong> {formData.age}</p>
                  <p><strong>Destination:</strong> {formData.destination}</p>
                  <p><strong>Date:</strong> {formData.date}</p>
                  {selectedTrip?.price !== undefined && (
                    <p><strong>Price:</strong> {selectedTrip.price} MAD</p>
                  )}
                </div>
              </div>
              {/* Download PDF Button */}
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm font-medium">{error}</div>
              )}

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
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
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
                  <option key={trip._id} value={trip.date}>
                    {trip.date} ({trip.seats} seats left
                    {trip.gender === 'female' ? ', women only' : ''})
                  </option>
                ))}
              </select>

              {/* Image and Price Preview */}
              {selectedTrip && (
                <div className="flex flex-col md:flex-row items-center justify-center my-2 gap-4 w-full">
                  {/* Image */}
                  {selectedTrip.image && (
                    <img
                      src={selectedTrip.image}
                      alt="Trip preview"
                      className="w-40 h-28 object-cover rounded shadow mb-2 md:mb-0"
                    />
                  )}
                  {/* Price */}
                  {selectedTrip.price !== undefined && (
                    <span className="text-lg font-bold text-blue-800 bg-white/70 px-4 py-2 rounded mb-2 md:mb-0">
                      {selectedTrip.price} MAD
                    </span>
                  )}
                  {/* Activities */}
                  {selectedTrip.activities && selectedTrip.activities.length > 0 && (
                    <div className="bg-white/70 rounded shadow p-2 min-w-[180px]">
                      <span className="font-semibold text-blue-600 text-base block mb-1">Activities:</span>
                      <ul className="text-sm space-y-1">
                        {selectedTrip.activities.map((act, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="font-medium">{act.name}</span>
                            {act.hour && <span>({act.hour})</span>}
                            {act.period && <span className="text-gray-500">[{act.period}]</span>}
                            {act.optional && <span className="text-xs text-yellow-600">(Optional)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}


              {/* Preview Summary */}
              <div className="bg-gray-100 p-4 rounded text-sm">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.phone}
                </p>
                <p>
                  <strong>Address:</strong> {formData.address}
                </p>
                <p>
                  <strong>CIN:</strong> {formData.cin}
                </p>
                <p>
                  <strong>Gender:</strong> {formData.gender}
                </p>
                <p>
                  <strong>Age:</strong> {formData.age}
                </p>
                <p>
                  <strong>Destination:</strong> {formData.destination}
                </p>
                {selectedTrip?.price !== undefined && (
                  <p>
                    <strong>Price:</strong> {selectedTrip.price} MAD
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {formData.date}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
                <a
                  href={submitted ? whatsappMessage : `https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Help
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
