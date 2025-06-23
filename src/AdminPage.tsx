// AdminPage.tsx
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbar from "./components/Navbar"; // Adjust path if needed


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
}

interface Trip {
  _id: string;
  destination: string;
  date: string;
  seats: number;
  gender: string;
  price: number;
  activities?: Activity[];
  image?: string;
}

const AdminPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripForm, setTripForm] = useState({ destination: '', date: '', seats: '', gender: 'all', price: '', image: '' });
  const [tripMessage, setTripMessage] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [bookingFilterDestination, setBookingFilterDestination] = useState('');
  const [bookingFilterDate, setBookingFilterDate] = useState('');
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ destination: '', date: '', seats: '', gender: 'all', price: '', image: '' });
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingEditMap, setBookingEditMap] = useState<Record<string, Partial<Booking>>>({});
  const [waNumber, setWaNumber] = useState('');         // Current number (fetched from backend)
  const [waNumberInput, setWaNumberInput] = useState(''); // Input for the form
  const [waSaveStatus, setWaSaveStatus] = useState('');
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' });
  const [adminCreateMessage, setAdminCreateMessage] = useState('');
  const [admins, setAdmins] = useState<{username: string, email: string, _id: string}[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAdmins(await res.json());
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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/trips`)
      .then((res) => res.json())
      .then((data) => setTrips(data));
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

  const handleSaveBooking = (id: string) => {
    const updated = bookingEditMap[id];
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, ...updated } : b)));
    setEditingBookingId(null);
  };

  const handleTripChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTripMessage('');
    const payload = { ...tripForm, seats: parseInt(tripForm.seats), price: parseFloat(tripForm.price)  };

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
        setTripForm({ destination: '', date: '', seats: '', gender: 'all', price: '', image: ''  });
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
    setEditForm({ destination: trip.destination, date: trip.date, seats: trip.seats.toString(), gender: trip.gender , price: trip.price.toString(), image: trip.image || ''});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (tripId: string) => {
    const updatedTrip = { ...editForm, seats: parseInt(editForm.seats), price: parseFloat(editForm.price)  };
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

  const uniqueDestinations = Array.from(new Set(trips.map((t) => t.destination)));
  const uniqueDates = Array.from(new Set(trips.map((t) => t.date)));
  const uniqueBookingDestinations = Array.from(new Set(bookings.map((b) => b.destination)));
  const uniqueBookingDates = Array.from(new Set(bookings.map((b) => b.date)));

  const filteredTrips = trips.filter((t) => (filterDestination === '' || t.destination === filterDestination) && (filterDate === '' || t.date === filterDate));
  const filteredBookings = bookings.filter((b) => (bookingFilterDestination === '' || b.destination === bookingFilterDestination) && (bookingFilterDate === '' || b.date === bookingFilterDate));

  const calendarEvents = trips.map((trip) => ({ title: trip.destination, date: trip.date }));

  const statusCellColor = (status: string | undefined) => {
    if (status === 'confirmed') return 'bg-green-400';
    if (status === 'rejected') return 'bg-red-400';
    return 'bg-blue-200';
  };

  return (
    <div className="bg-gray-50 text-gray-900">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Calendar of Trips</h2>
          <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={calendarEvents} height={500} />
        </div>

        {/* WhatsApp Number Form */}
        <div className="mb-6 bg-gray-100 p-4 rounded shadow">
          <form onSubmit={handleWaNumberSave} className="flex items-center gap-4">
            <label className="font-semibold">WhatsApp Number:</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={waNumberInput}
              onChange={e => setWaNumberInput(e.target.value)}
              placeholder="e.g. 212623456789"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            {waSaveStatus && <span className="ml-2 text-sm">{waSaveStatus}</span>}
          </form>
          <p className="mt-2 text-gray-600 text-sm">
            Current WhatsApp Number: <b>{waNumber || 'Not Set'}</b>
          </p>
        </div>

        {/* ===== Add Admin Account (for admins only) ===== */}
        <div className="mb-6 bg-yellow-100 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Create Admin Account</h2>
          <form onSubmit={handleAdminFormSubmit} className="flex flex-col md:flex-row gap-3">
            <input name="username" value={adminForm.username} onChange={handleAdminFormChange} className="border p-2 rounded" placeholder="Username" required />
            <input name="email" value={adminForm.email} onChange={handleAdminFormChange} className="border p-2 rounded" placeholder="Email" type="email" required />
            <input name="password" value={adminForm.password} onChange={handleAdminFormChange} className="border p-2 rounded" placeholder="Password" type="password" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Admin</button>
            {adminCreateMessage && <span className="text-sm ml-2">{adminCreateMessage}</span>}
          </form>
        </div>
        {/* ===== List of All Admins ===== */}
        <div className="mt-6 bg-yellow-50 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">All Admin Accounts</h2>
          {adminsLoading ? (
            <div>Loading admins...</div>
          ) : admins.length === 0 ? (
            <div>No admins found.</div>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="border px-2 py-1">Username</th>
                  <th className="border px-2 py-1">Email</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a._id}>
                    <td className="border px-2 py-1">{a.username}</td>
                    <td className="border px-2 py-1">{a.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleTripSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input type="text" name="destination" placeholder="Destination" value={tripForm.destination} onChange={handleTripChange} className="border p-2 rounded" required />
          <input type="date" name="date" value={tripForm.date} onChange={handleTripChange} className="border p-2 rounded" required />
          <input type="number" name="seats" placeholder="Seats" value={tripForm.seats} onChange={handleTripChange} className="border p-2 rounded" required />
          <select name="gender" value={tripForm.gender} onChange={handleTripChange} className="border p-2 rounded">
            <option value="all">All</option>
            <option value="female">Women Only</option>
          </select>
          <input type="number" name="price" placeholder="Price" value={tripForm.price} onChange={handleTripChange} className="border p-2 rounded" required />
          <input type="text" name="image" placeholder="Image URL" value={tripForm.image} onChange={handleTripChange} className="border p-2 rounded" required />
          <button type="submit" className="col-span-1 md:col-span-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Trip</button>
        </form>
        {tripMessage && <p className="text-sm mt-1 font-medium">{tripMessage}</p>}

        <h2 className="text-xl font-semibold mt-10 mb-2">Trips</h2>
        <div className="flex gap-4 mb-2">
          <select value={filterDestination} onChange={(e) => setFilterDestination(e.target.value)} className="border p-2 rounded">
            <option value="">All Destinations</option>
            {uniqueDestinations.map((dest) => <option key={dest} value={dest}>{dest}</option>)}
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded">
            <option value="">All Dates</option>
            {uniqueDates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <table className="min-w-full border mb-10">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Destination</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Seats</th>
              <th className="border px-2 py-1">Gender</th>
              <th className="border px-2 py-1">Price</th>
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
                    <td><input type="number" value={editForm.seats} name="seats" onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td>
                      <select name="gender" value={editForm.gender} onChange={handleEditChange} className="border p-1 w-full">
                        <option value="all">All</option>
                        <option value="female">Women Only</option>
                      </select>
                    </td>
                    <td><input type="number" value={editForm.price} name="price" onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td>
                      {trip.image && <img src={trip.image} alt="Trip" className="w-10 h-10 object-cover rounded" />}
                    </td>
                    <td>
                      <button onClick={() => handleEditSubmit(trip._id!)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={() => setEditingTripId(null)} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border px-2 py-1">{trip.destination}</td>
                    <td className="border px-2 py-1">{trip.date}</td>
                    <td className="border px-2 py-1">{trip.seats}</td>
                    <td className="border px-2 py-1">{trip.gender}</td>
                    <td className="border px-2 py-1">{trip.price} MAD</td>
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
        <h2 className="text-xl font-semibold mb-2">Bookings</h2>
        <div className="flex gap-4 mb-2">
          <select value={bookingFilterDestination} onChange={(e) => setBookingFilterDestination(e.target.value)} className="border p-2 rounded">
            <option value="">All Destinations</option>
            {uniqueBookingDestinations.map((dest) => <option key={dest} value={dest}>{dest}</option>)}
          </select>
          <select value={bookingFilterDate} onChange={(e) => setBookingFilterDate(e.target.value)} className="border p-2 rounded">
            <option value="">All Dates</option>
            {uniqueBookingDates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Destination</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Red Flag</th>
              <th className="border px-2 py-1">Comment</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b._id}>
                <td className="border px-2 py-1">{b.name}</td>
                <td className="border px-2 py-1">{b.phone}</td>
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
                <td className="border px-2 py-1">
                  {editingBookingId === b._id ? (
                    <>
                      <button onClick={() => handleSaveBooking(b._id)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={handleCancelBookingEdit} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
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
    </div>
  );
};

export default AdminPage;
