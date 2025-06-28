// AdminPage.tsx
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbar from "./components/Navbar"; // Adjust path if needed
import * as XLSX from "xlsx";
import RequireAdmin from "./pages/RequireAdmin";
import QrScanner from 'react-qr-scanner';
import { useNavigate } from "react-router-dom";
import { Divide } from 'lucide-react';

void RequireAdmin;

interface Activity {
  name: string;
  hour: string;
  period: string;
  optional: boolean;
}

interface Booking {
  _id: string;
  name: string;
  phone: string;
  address: string;
  cin: string;
  destination: string;
  date: string;
  gender: string;
  age: number;
  status?: 'pending' | 'confirmed' | 'rejected';
  redFlag?: boolean;
  comment?: string;
  inBus?: boolean;
}

interface Trip {
  _id: string;
  destination: string;
  date: string;
  seats: number;
  gender: string;
  price: number;
  profit: number;
  activities?: Activity[];
  image?: string;
  days?: number;
}

interface UserRequest {
  _id: string;
  name: string;
  cin: string;
  phone: string;
  message: string;
  createdAt: string;
}

const AdminPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripForm, setTripForm] = useState({ destination: '', date: '', seats: '', gender: 'all', price: '', profit: '', image: '', days: '1'  });
  const [tripMessage, setTripMessage] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [bookingFilterDestination, setBookingFilterDestination] = useState('');
  const [bookingFilterDate, setBookingFilterDate] = useState('');
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ destination: '', date: '', seats: '', gender: 'all', price: '', profit: '', image: '', days: '1'  });
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingEditMap, setBookingEditMap] = useState<Record<string, Partial<Booking>>>({});
  const [waNumber, setWaNumber] = useState('');         // Current number (fetched from backend)
  const [waNumberInput, setWaNumberInput] = useState(''); // Input for the form
  const [waSaveStatus, setWaSaveStatus] = useState('');
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' });
  const [adminCreateMessage, setAdminCreateMessage] = useState('');
  const [admins, setAdmins] = useState<{username: string, email: string, _id: string}[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<{ title: string, date: string } | null>(null);
  const [bookingCinSearch, setBookingCinSearch] = useState('');
  const [requests, setRequests] = useState<UserRequest[]>([]);

  const [scanResult, setScanResult] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [scanning, setScanning] = useState(false);

  const navigate = useNavigate();

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Admins fetched:", data);
        setAdmins(data);
        setAdminForm({ username: '', email: '', password: '' });
      }
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreateMessage('');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAdminCreateMessage('✅ Admin account created');
        setAdminForm({ username: '', email: '', password: '' });
        fetchAdmins(); // refresh the list
      } else {
        setAdminCreateMessage(`❌ ${data.message || 'Error'}`);
      }
    } catch {
      setAdminCreateMessage('❌ Server error');
    }
  };

  void loading;

  // Fetch WhatsApp number on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp-number`)
      .then(res => res.json())
      .then(data => {
        setWaNumber(data.number);
        setWaNumberInput(data.number);
      })
      .catch(() => setWaNumber(''));
  }, []);

  // Save WhatsApp number
  const handleWaNumberSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaSaveStatus('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: waNumberInput })
      });
      if (res.ok) {
        setWaNumber(waNumberInput);
        setWaSaveStatus('✅ Number saved!');
      } else {
        setWaSaveStatus('❌ Failed to save number');
      }
    } catch {
      setWaSaveStatus('❌ Error saving number');
    }
  };

  // For image editing
  const [imageEditTripId, setImageEditTripId] = useState<string | null>(null);
  const [imageEditUrl, setImageEditUrl] = useState<string>('');

  // === ACTIVITY MODAL ===
  const [activityModalTripId, setActivityModalTripId] = useState<string | null>(null);
  const [modalActivities, setModalActivities] = useState<Activity[]>([]);

  const fetchAllData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((b: any) => ({ ...b, redFlag: b.flag }));
        setBookings(mapped);
        setLoading(false);
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/trips`)
      .then((res) => res.json())
      .then((data) => setTrips(data));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleEditBookingClick = (b: Booking) => {
    setEditingBookingId(b._id);
    setBookingEditMap({ ...bookingEditMap, [b._id]: { status: b.status, redFlag: b.redFlag, comment: b.comment } });
  };

  const handleCancelBookingEdit = () => {
    setEditingBookingId(null);
  };

  const handleEditBookingChange = (id: string, field: keyof Booking, value: unknown) => {
    setBookingEditMap((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSaveBooking = async (id: string) => {
    const updated = bookingEditMap[id];
    const token = localStorage.getItem("token");
    // Find the actual booking to get its CIN
    const booking = bookings.find(b => b._id === id);
    if (!booking) return alert("Booking not found");

    // 1. Update flag for ALL bookings of this CIN
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/flags/${booking.cin}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ redFlag: updated.redFlag })
      }
    );

    // 2. Update this booking's status/comment (optional, but keep for now)
    const payload = {
      status: updated.status,
      flag: updated.redFlag,
      comment: updated.comment,
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchAllData();
        setEditingBookingId(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update booking');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const handleTripChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTripMessage('');
    const payload = { 
      ...tripForm,
      seats: parseInt(tripForm.seats),
      price: parseFloat(tripForm.price),
      days: parseInt(tripForm.days),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newTrip = await res.json();
        setTrips([...trips, newTrip]);
        setTripMessage('✅ Trip added successfully');
        setTripForm({ destination: '', date: '', seats: '', gender: 'all', price: '', profit: '', image: '', days: '' });
      } else {
        setTripMessage('❌ Failed to add trip');
      }
    } catch (err) {
      console.error(err);
      setTripMessage('❌ Server error');
    }
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTripId(trip._id);
    setEditForm({ 
      destination: trip.destination || '',
      date: trip.date || '',
      seats: trip.seats != null ? trip.seats.toString() : '',
      gender: trip.gender || 'all',
      price: trip.price != null ? trip.price.toString() : '',
      profit: trip.profit != null ? trip.profit.toString() : '', // Fix is here!
      image: trip.image || '',
      days: trip.days != null ? trip.days.toString() : '1'
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (tripId: string) => {
    const updatedTrip = { 
      ...editForm,
      seats: parseInt(editForm.seats),
      price: parseFloat(editForm.price),
      profit: parseFloat(editForm.profit),
      days: parseInt(editForm.days)
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrip),
      });
      if (res.ok) {
        const updatedList = trips.map((t) => (t._id === tripId ? { ...t, ...updatedTrip } : t));
        setTrips(updatedList);
        setEditingTripId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === IMAGE EDIT LOGIC ===
  const handleImageSave = async (tripId: string) => {
    const trip = trips.find((t) => t._id === tripId);
    if (!trip) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trip, image: imageEditUrl }),
      });
      if (res.ok) {
        const updatedList = trips.map((t) =>
          t._id === tripId ? { ...t, image: imageEditUrl } : t
        );
        setTrips(updatedList);
        setImageEditTripId(null);
        setImageEditUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === ACTIVITY MODAL LOGIC ===
  const handleOpenActivitiesModal = (trip: Trip) => {
    setActivityModalTripId(trip._id);
    setModalActivities(trip.activities ? [...trip.activities] : []);
  };
  const handleCloseActivitiesModal = () => {
    setActivityModalTripId(null);
    setModalActivities([]);
  };
  const handleSaveActivities = async () => {
    const tripId = activityModalTripId;
    if (!tripId) return;
    try {
      const trip = trips.find((t) => t._id === tripId);
      if (!trip) return;
      const updated = { ...trip, activities: modalActivities };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const updatedList = trips.map((t) => (t._id === tripId ? { ...t, activities: modalActivities } : t));
        setTrips(updatedList);
        handleCloseActivitiesModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admins/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdmins(); // refresh
  };

  const handleDeleteTrip = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAllData(); // refresh trips
  };

  const handleDeleteBooking = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAllData(); // refresh bookings
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/requests`)
      .then(res => res.json())
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  const uniqueDestinations = Array.from(new Set(trips.map((t) => t.destination)));
  const uniqueDates = Array.from(new Set(trips.map((t) => t.date)));
  const uniqueBookingDestinations = Array.from(new Set(bookings.map((b) => b.destination)));
  const uniqueBookingDates = Array.from(new Set(bookings.map((b) => b.date)));

  const filteredTrips = trips.filter((t) => (filterDestination === '' || t.destination === filterDestination) && (filterDate === '' || t.date === filterDate));
  const filteredBookings = bookings.filter((b) => (
    bookingFilterDestination === '' || b.destination === bookingFilterDestination) &&
    (bookingFilterDate === '' || b.date === bookingFilterDate) &&
    (bookingCinSearch === '' || b.cin.toLowerCase().includes(bookingCinSearch.toLowerCase()))
  );

  const calendarEvents = trips.map((trip) => ({ 
    title: trip.destination,
    date: trip.date,
    end: trip.days && trip.days > 1
    ? new Date(new Date(trip.date).getTime() + (trip.days - 1) * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000) // plus days minus one, plus one to be inclusive
    : undefined 
  }));

  const statusCellColor = (status: string | undefined) => {
    if (status === 'confirmed') return 'bg-green-400';
    if (status === 'rejected') return 'bg-red-400';
    return 'bg-blue-200';
  };

  // For trips
  const handleExportTrips = () => {
    const ws = XLSX.utils.json_to_sheet(trips);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trips");
    XLSX.writeFile(wb, "trips.xlsx");
  };

  // For bookings
  const handleExportBookings = () => {
    const ws = XLSX.utils.json_to_sheet(bookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "bookings.xlsx");
  };

  // For Requests
  const handleExportRequests = () => {
    const ws = XLSX.utils.json_to_sheet(requests);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests");
    XLSX.writeFile(wb, "requests.xlsx");
  };

  function renderEventContent(eventInfo: any) {
    return (
      <span title={eventInfo.event.title}>
        {eventInfo.event.title}
      </span>
    );
  }
  function handleEventClick(clickInfo: any) {
    setSelectedEvent({
      title: clickInfo.event.title,
      date: clickInfo.event.startStr,
    });
  }
  
  const handleScan = (data: any) => {
    if (data && data.text) {
      setScanResult(data.text);
      setScanning(false);

      // Parse the barcode: name|phone|destination|date
      const [name, phone, destination, date] = data.text.split('|');
      const found = bookings.find(
        b => b.name === name && b.phone === phone && b.destination === destination && b.date === date
      );
      if (found) {
        markAsCheckedIn(found._id);
        setScanStatus(`✅ Booking found: ${found.name} (${found.cin})`);
      } else {
        setScanStatus('❌ Booking not found.');
      }
    }
  };

  const handleError = (err: any) => {
    setScanStatus('Error accessing camera');
    setScanning(false);
    console.error('Camera error object:', err, err?.name, err?.message, err?.toString?.());
    alert('Camera error: ' + (err?.message || JSON.stringify(err) || err?.toString?.() || 'Unknown error'));
    //alert('Camera error: ' + JSON.stringify(err)); // show error directly
  };

  const markAsCheckedIn = async (bookingId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/inbus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inBus: true }),
      });
      fetchAllData();
    } catch {
      setScanStatus('❌ Failed to update booking.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-white min-h-screen text-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 pb-16">
        {/* Header & Statistics Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4">
            <span className="inline-flex items-center gap-2 bg-gradient-to-tr from-purple-800 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bar-chart-2 text-purple-700"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Admin Dashboard
            </span>
          </h1>
          <button
            className="bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xl font-semibold transition-transform hover:scale-105"
            onClick={() => navigate("/admin-stats")}
          >
            <span role="img" aria-label="chart">📊</span> Statistics
          </button>
        </div>

        {/* Calendar of Trips */}
        <div className="mb-12 bg-white/80 rounded-3xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
            <span role="img" aria-label="calendar">🗓️</span> Calendar of Trips
          </h2>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height={500}
            eventClassNames={() => 'trip-event'}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
          />
          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setSelectedEvent(null)}>
              <div className="bg-white rounded-lg shadow-lg p-6 min-w-[220px] text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.date}</p>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Number Form */}
        <div className="mb-10 bg-gradient-to-tr from-green-100 to-green-50 rounded-3xl shadow-lg p-8 border border-green-200 max-w-2xl mx-auto">
          <form onSubmit={handleWaNumberSave} className="flex flex-wrap items-center gap-4 justify-center">
            <label className="font-semibold text-lg flex items-center gap-2">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-phone text-green-700"><path d="M22 16.92V23a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 3 3h6.09a2 2 0 0 1 2 1.72l.72 5.47a2 2 0 0 1-1 2.18l-2.2 1.11a16.11 16.11 0 0 0 7.29 7.29l1.11-2.2a2 2 0 0 1 2.18-1l5.47.72A2 2 0 0 1 23 16.91V23z\"/></svg>
              WhatsApp:
            </label>
            <input
              type="text"
              className="border-2 p-2 rounded-lg shadow"
              value={waNumberInput}
              onChange={e => setWaNumberInput(e.target.value)}
              placeholder="e.g. 212623456789"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow font-bold"
            >💾 Save</button>
            {waSaveStatus && <span className="ml-2 text-sm">{waSaveStatus}</span>}
          </form>
          <p className="text-gray-600 text-sm mt-2 text-center">
            Current WhatsApp: <b>{waNumber || 'Not Set'}</b>
          </p>
        </div>

        {/* ===== Add Admin Account (for admins only) ===== */}
        <div className="mb-10 bg-gradient-to-tr from-yellow-200 to-yellow-50 p-8 rounded-3xl shadow-xl border border-yellow-300 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-yellow-700 flex items-center gap-2">
            <span role="img" aria-label="key">🔑</span> Create Admin Account
          </h2>
          <form onSubmit={handleAdminFormSubmit} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              name="username"
              value={adminForm.username}
              onChange={handleAdminFormChange}
              className="border-2 border-yellow-300 focus:border-yellow-500 p-3 rounded-xl w-full shadow"
              placeholder="Username"
              required
            />
            <input
              name="email"
              value={adminForm.email}
              onChange={handleAdminFormChange}
              className="border-2 border-yellow-300 focus:border-yellow-500 p-3 rounded-xl w-full shadow"
              placeholder="Email"
              type="email"
              required
            />
            <input
              name="password"
              value={adminForm.password}
              onChange={handleAdminFormChange}
              className="border-2 border-yellow-300 focus:border-yellow-500 p-3 rounded-xl w-full shadow"
              placeholder="Password"
              type="password"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-tr from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold text-base transition-transform hover:scale-105"
            >
              <span role="img" aria-label="add">➕</span> Create Admin
            </button>
          </form>
          {adminCreateMessage && (
            <div className={`mt-3 text-center text-sm font-medium ${
              adminCreateMessage.startsWith('✅') ? 'text-green-700' : 'text-red-600'
            }`}>
              {adminCreateMessage}
            </div>
          )}
        </div>

        {/* ===== List of All Admins ===== */}
        <div className="mb-10 mt-6 bg-yellow-50 rounded-3xl shadow-xl border border-yellow-200 p-8 max-w-2xl mx-auto overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-yellow-700 flex items-center gap-2">
            <span role="img" aria-label="group">👥</span> All Admin Accounts
          </h2>
          {adminsLoading ? (
            <div className="text-yellow-700 text-center font-medium">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="text-yellow-500 text-center">No admins found.</div>
          ) : (
            <table className="min-w-full border rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="border px-4 py-2 text-left">Username</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a._id} className="hover:bg-yellow-200/60 transition">
                    <td className="border px-4 py-2">{a.username}</td>
                    <td className="border px-4 py-2">{a.email}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDeleteAdmin(a._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl shadow font-semibold transition-transform hover:scale-110"
                      >
                        <span role="img" aria-label="delete">🗑️</span> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>


        {/*Trips Adding Form*/}
        <div className="mb-10 bg-white rounded-3xl shadow-lg p-8 border border-slate-200 overflow-x-auto">
          <table className="min-w-full border mb-10 ">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Destination</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Days</th>
                <th className="border px-2 py-1">Seats</th>
                <th className="border px-2 py-1">Gender</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Profit</th>
                <th className="border px-2 py-1">Image</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip._id}>
                  {editingTripId === trip._id ? (
                    <>
                      <td><input value={editForm.destination} name="destination" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td><input type="date" value={editForm.date} name="date" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td><input type="number" value={editForm.days} name="days" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td><input type="number" value={editForm.seats} name="seats" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td>
                        <select name="gender" value={editForm.gender} onChange={handleEditChange} className="border p-1 w-full">
                          <option value="all">All</option>
                          <option value="female">Women Only</option>
                        </select>
                      </td>
                      <td><input type="number" value={editForm.price} name="price" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td><input type="number" value={editForm.profit} name="profit" onChange={handleEditChange} className="border p-1 w-full" /></td>
                      <td>
                        {trip.image && <img src={trip.image} alt="Trip" className="w-10 h-10 object-cover rounded" />}
                      </td>
                      <td>
                        <button onClick={() => handleEditSubmit(trip._id!)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                        <button onClick={() => setEditingTripId(null)} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                        <button onClick={() => handleDeleteTrip(trip._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border px-2 py-1">{trip.destination}</td>
                      <td className="border px-2 py-1">{trip.date}</td>
                      <td className="border px-2 py-1">{trip.days}</td>
                      <td className="border px-2 py-1">{trip.seats}</td>
                      <td className="border px-2 py-1">{trip.gender}</td>
                      <td className="border px-2 py-1">{trip.price} MAD</td>
                      <td className="border px-2 py-1">{trip.profit} MAD</td>
                      <td className="border px-2 py-1">
                        {trip.image && <img src={trip.image} alt="Trip" className="w-10 h-10 object-cover rounded mb-1" />}
                        {imageEditTripId === trip._id ? (
                          <div className="flex flex-col">
                            <input
                              type="text"
                              value={imageEditUrl}
                              onChange={(e) => setImageEditUrl(e.target.value)}
                              placeholder="Image URL"
                              className="border p-1 rounded mb-1"
                            />
                            <div className="flex gap-2">
                              <button
                                className="bg-green-600 text-white px-2 py-1 rounded"
                                onClick={() => handleImageSave(trip._id)}
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                className="bg-gray-500 text-white px-2 py-1 rounded"
                                onClick={() => {
                                  setImageEditTripId(null);
                                  setImageEditUrl('');
                                }}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded mr-1"
                            onClick={() => {
                              setImageEditTripId(trip._id);
                              setImageEditUrl(trip.image || '');
                            }}
                            type="button"
                          >
                            {trip.image ? 'Edit Image' : 'Add Image'}
                          </button>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => handleOpenActivitiesModal(trip)}
                          className="bg-blue-600 text-white px-2 py-1 rounded mr-1"
                          type="button"
                        >
                          Activities
                        </button>
                        <button
                          onClick={() => handleEditClick(trip)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                          type="button"
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== Activities Modal ===== */}
        {activityModalTripId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow max-w-md w-full relative">
              <h3 className="text-xl font-semibold mb-4">Edit Activities</h3>
              <ul className="space-y-3 mb-3">
                {modalActivities.map((a, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={a.name}
                      onChange={e => {
                        const updated = [...modalActivities];
                        updated[i].name = e.target.value;
                        setModalActivities(updated);
                      }}
                      className="border p-1 rounded w-28"
                      required
                    />
                    <input
                      type="time"
                      value={a.hour}
                      onChange={e => {
                        const updated = [...modalActivities];
                        updated[i].hour = e.target.value;
                        setModalActivities(updated);
                      }}
                      className="border p-1 rounded w-20"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Period"
                      value={a.period}
                      onChange={e => {
                        const updated = [...modalActivities];
                        updated[i].period = e.target.value;
                        setModalActivities(updated);
                      }}
                      className="border p-1 rounded w-16"
                      required
                    />
                    <select
                      value={a.optional ? 'yes' : 'no'}
                      onChange={e => {
                        const updated = [...modalActivities];
                        updated[i].optional = e.target.value === 'yes';
                        setModalActivities(updated);
                      }}
                      className="border p-1 rounded"
                    >
                      <option value="no">Required</option>
                      <option value="yes">Optional</option>
                    </select>
                    <button
                      type="button"
                      className="bg-red-500 text-white px-2 rounded"
                      onClick={() => {
                        const updated = [...modalActivities];
                        updated.splice(i, 1);
                        setModalActivities(updated);
                      }}
                    >✕</button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="bg-green-600 text-white px-3 py-1 rounded mb-4"
                onClick={() =>
                  setModalActivities([
                    ...modalActivities,
                    { name: '', hour: '', period: '', optional: false },
                  ])
                }
              >
                + Add Activity
              </button>
              <div className="flex gap-3 justify-end">
                <button onClick={handleSaveActivities} className="bg-blue-600 text-white px-4 py-1 rounded">Save</button>
                <button onClick={handleCloseActivitiesModal} className="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TABLE */}
        <div className="mb-10 bg-white rounded-3xl shadow-lg p-8 border border-slate-200 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-green-700">
            <span role="img" aria-label="ticket">🎟️</span> Bookings
          </h2>
          <div className="flex gap-4 mb-2 w-full overflow-x-auto">
            <button onClick={handleExportBookings} className="bg-green-600 text-white px-2 py-1 rounded mb-2">Export Bookings to Excel</button>
            <select value={bookingFilterDestination} onChange={(e) => setBookingFilterDestination(e.target.value)} className="border p-2 rounded">
              <option value="">All Destinations</option>
              {uniqueBookingDestinations.map((dest) => <option key={dest} value={dest}>{dest}</option>)}
            </select>
            <select value={bookingFilterDate} onChange={(e) => setBookingFilterDate(e.target.value)} className="border p-2 rounded">
              <option value="">All Dates</option>
              {uniqueBookingDates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="text"
              value={bookingCinSearch}
              onChange={e => setBookingCinSearch(e.target.value)}
              placeholder="Search by CIN"
              className="border p-2 rounded"
              style={{ minWidth: 120 }}
            />
          </div>
          <table className="min-w-full border mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Age</th>
                <th className="border px-2 py-1">Gender</th>
                <th className="border px-2 py-1">CIN</th>
                <th className="border px-2 py-1">Destination</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Red Flag</th>
                <th className="border px-2 py-1">Comment</th>
                <th className="border px-2 py-1">In Bus</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id}>
                  <td className="border px-2 py-1">{b.name}</td>
                  <td className="border px-2 py-1">{b.phone}</td>
                  <td className="border px-2 py-1">{b.age}</td>
                  <td className="border px-2 py-1">{b.gender}</td>
                  <td className="border px-2 py-1">{b.cin}</td>
                  <td className="border px-2 py-1">{b.destination}</td>
                  <td className="border px-2 py-1">{b.date}</td>
                  <td className={`border px-2 py-1 ${statusCellColor(b.status)}`}>
                    {editingBookingId === b._id ? (
                      <select value={bookingEditMap[b._id]?.status || 'pending'} onChange={(e) => handleEditBookingChange(b._id, 'status', e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : b.status || 'pending'}
                  </td>
                  <td className="border px-2 py-1">
                    {editingBookingId === b._id ? (
                      <input type="checkbox" checked={bookingEditMap[b._id]?.redFlag || false} onChange={(e) => handleEditBookingChange(b._id, 'redFlag', e.target.checked)} />
                    ) : b.redFlag ? '🚩' : ''}
                  </td>
                  <td className="border px-2 py-1">
                    {editingBookingId === b._id ? (
                      <input value={bookingEditMap[b._id]?.comment || ''} onChange={(e) => handleEditBookingChange(b._id, 'comment', e.target.value)} className="border p-1 rounded w-full" />
                    ) : b.comment || ''}
                  </td>
                  <td className={`border px-2 py-1 font-bold ${b.inBus ? 'bg-green-400 text-white' : 'bg-red-400 text-white'}`}>
                    {b.inBus ? 'YES' : 'NO'}
                  </td>
                  <td className="border px-2 py-1">
                    {editingBookingId === b._id ? (
                      <>
                        <button onClick={() => handleSaveBooking(b._id)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                        <button onClick={handleCancelBookingEdit} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                        <button onClick={() => handleDeleteBooking(b._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditBookingClick(b)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* User Requests */}
        <div className="mb-10 bg-yellow-50 rounded-3xl shadow p-8 border border-yellow-200 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-yellow-700">
            <span role="img" aria-label="message">📩</span> User Requests
          </h2>
          <button
            onClick={handleExportRequests}
            className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 mb-3"
          >
            Export to Excel
          </button>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">CIN</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Message</th>
                <th className="border px-2 py-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td className="border px-2 py-1">{r.name}</td>
                  <td className="border px-2 py-1">{r.cin}</td>
                  <td className="border px-2 py-1">{r.phone}</td>
                  <td className="border px-2 py-1">{r.message}</td>
                  <td className="border px-2 py-1">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scan Ticket Section */}
        <div className="mb-12 bg-green-50 rounded-3xl shadow-lg p-8 border border-green-200 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
            <span role="img" aria-label="barcode">🎫</span> Scan Ticket Barcode
          </h2>
          {!scanning ? (
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold text-lg shadow"
              onClick={() => {
                setScanStatus('');
                setScanResult('');
                setScanning(true);
              }}
            >
              Start Scanning
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <div style={{ width: 250 }}>
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                  constraints={{
                    video: { facingMode: "environment" }
                  }}
                />
              </div>
              <button
                className="mt-4 bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-xl"
                onClick={() => setScanning(false)}
              >
                Stop
              </button>
            </div>
          )}
          <div className="mt-4">
            {scanResult && (
              <div className="text-blue-700 font-medium mb-2">Scanned: {scanResult}</div>
            )}
            {scanStatus && (
              <div className={scanStatus.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                {scanStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
