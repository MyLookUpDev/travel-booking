import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
//import { useLocation } from 'react-router-dom';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Navbar from "./components/Navbar"; // Adjust path if needed
import { useTranslation } from 'react-i18next';

/*function useQuery() {
  return new URLSearchParams(useLocation().search);
}*/

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
  const { t } = useTranslation();

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: "#fff",
      scale: 3
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
  //const query = useQuery();

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

    /*
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
  */

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

    if (!trip) return setError(t('Invalid trip selection.'));
    if (trip.seats <= 0) return setError(t('This trip is fully booked.'));
    if (trip.gender === 'female' && formData.gender !== 'female')
      return setError(t('This trip is for women only.'));
    if (age < 18) return setError(t('You must be at least 18 years old.'));

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

  useEffect(() => {
    // Only prefill if there's a token
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch profile info if user is logged in
    fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFormData(fd => ({
            ...fd,
            // Only prefill fields if they're empty (can always be edited)
            name: fd.name || data.username || "",
            phone: fd.phone || data.phone || "",
            address: fd.address || data.address || "",
            cin: fd.cin || data.cin || "",
            gender: fd.gender || data.gender || "male",
            age: fd.age || data.age?.toString() || ""
          }));
        }
      });
  }, []);


  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900"
      style={
        bgImage
          ? {
              backgroundImage: `linear-gradient(rgba(255,255,255,0.85),rgba(255,255,255,0.92)), url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8 mb-20 p-6 rounded-3xl shadow-2xl bg-white/80 border border-blue-100 relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2 drop-shadow">
            <span role="img" aria-label="ticket">🎫</span>
            {t('Book Your Trip')}
          </h2>

          {submitted ? (
            <div className="text-center space-y-5 animate-fadeIn">
              <p className="text-green-700 text-xl font-bold flex items-center gap-2 justify-center">
                <span role="img" aria-label="check">✅</span> {t('Booking Confirmed!')}
              </p>
              <div className="bg-white/90 rounded-2xl p-5 shadow-lg inline-block">
                <div ref={previewRef} 
                className="bg-white rounded-2xl shadow-lg inline-block"
                style={{ width: 320, padding: '32px 24px 24px 24px', margin: '0 auto' }}>
                  <QRCodeCanvas value={barcodeData} size={160} className="mx-auto mb-2" />
                  <div className="text-left text-gray-700 p-2 rounded">
                    <h3 className="font-semibold text-lg mb-2 text-blue-700">{t('Booking Summary')}</h3>
                    <ul className="space-y-1 text-base">
                      <li><b>{t('Name')}:</b> {formData.name}</li>
                      <li><b>{t('Phone')}:</b> {formData.phone}</li>
                      <li><b>{t('Address')}:</b> {formData.address}</li>
                      <li><b>{t('CIN')}:</b> {formData.cin}</li>
                      <li><b>{t('Gender')}:</b> {formData.gender}</li>
                      <li><b>{t('Age')}:</b> {formData.age}</li>
                      <li><b>{t('Destination')}:</b> {formData.destination}</li>
                      <li><b>{t('Date')}:</b> {formData.date}</li>
                      {selectedTrip?.price !== undefined && (
                        <li><b>{t('Price')}:</b> {selectedTrip.price} MAD</li>
                      )}
                    </ul>
                  </div>
                </div>
                <button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl font-bold shadow"
                  onClick={handleDownloadPdf}
                >
                  <span role="img" aria-label="pdf">⬇️</span> {t('Download PDF')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
              {error && (
                <div className="text-red-600 text-base font-semibold bg-red-100 rounded-xl px-4 py-2 border border-red-300 shadow">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input
                  type="text"
                  name="name"
                  placeholder={t('Full Name')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('Phone Number')}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                />
                <input
                  type="text"
                  name="address"
                  placeholder={t('Address')}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                />
                <input
                  type="text"
                  name="cin"
                  placeholder={t('National ID (CIN)')}
                  value={formData.cin}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                >
                  <option value="male">{t('Male')}</option>
                  <option value="female">{t('Female')}</option>
                </select>
                <input
                  type="number"
                  name="age"
                  placeholder={t('Age')}
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl shadow bg-white/70"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-purple-300 focus:border-purple-500 p-3 rounded-2xl shadow bg-white/70"
                >
                  <option value="">{t('Select Destination')}</option>
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
                  className="w-full border-2 border-purple-300 focus:border-purple-500 p-3 rounded-2xl shadow bg-white/70"
                  disabled={!formData.destination}
                >
                  <option value="">{t('Select Date')}</option>
                  {availableDates.map((trip) => (
                    <option key={trip._id} value={trip.date}>
                      {trip.date} ({trip.seats} {t('seats left')}{trip.gender === 'female' ? `, ${t('women only')}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrip && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-blue-50/70 rounded-2xl p-5 my-3 shadow-inner">
                  {selectedTrip.image && (
                    <img
                      src={selectedTrip.image}
                      alt={t('Trip')}
                      className="w-40 h-28 object-cover rounded-2xl shadow"
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    {selectedTrip.price !== undefined && (
                      <span className="text-xl font-bold text-blue-700 bg-white/70 px-4 py-2 rounded-2xl shadow inline-block">
                        {selectedTrip.price} MAD
                      </span>
                    )}
                    {selectedTrip.activities && selectedTrip.activities.length > 0 && (
                      <div className="bg-white/90 rounded-xl shadow p-3 mt-2">
                        <span className="font-semibold text-blue-600 block mb-1">{t('Activities')}:</span>
                        <ul className="text-sm space-y-1">
                          {selectedTrip.activities.map((act, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="font-medium">{t(act.name)}</span>
                              {act.hour && <span className="text-gray-600">({act.hour})</span>}
                              {act.period && <span className="text-gray-400">[{act.period}]</span>}
                              {act.optional && <span className="text-xs text-yellow-600 ml-1">({t('Optional')})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Summary */}
              <div className="bg-gradient-to-tr from-blue-50 to-purple-100 p-4 rounded-2xl text-base mb-2 shadow">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="eye">👁️</span> {t('Booking Preview')}
                </div>
                <ul className="space-y-1">
                  <li><b>{t('Name')}:</b> {formData.name}</li>
                  <li><b>{t('Phone')}:</b> {formData.phone}</li>
                  <li><b>{t('Address')}:</b> {formData.address}</li>
                  <li><b>{t('CIN')}:</b> {formData.cin}</li>
                  <li><b>{t('Gender')}:</b> {formData.gender}</li>
                  <li><b>{t('Age')}:</b> {formData.age}</li>
                  <li><b>{t('Destination')}:</b> {formData.destination}</li>
                  {selectedTrip?.price !== undefined && (
                    <li><b>{t('Price')}:</b> {selectedTrip.price} MAD</li>
                  )}
                  <li><b>{t('Date')}:</b> {formData.date}</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-3">
                <button
                  type="submit"
                  className="bg-gradient-to-tr from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
                >
                  <span role="img" aria-label="send">🚀</span> {t('Submit')}
                </button>
                <a
                  href={submitted ? whatsappMessage : `https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-tr from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center"
                >
                  <span role="img" aria-label="whatsapp">💬</span> {t('Help')}
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
