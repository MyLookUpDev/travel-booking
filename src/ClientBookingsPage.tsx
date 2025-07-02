// src/pages/ClientBookingsPage.tsx
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import * as XLSX from "xlsx";
import { useTranslation } from 'react-i18next';


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
  inBus?: boolean;
  price?: number;
}

void React;

export default function ClientBookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCIN, setUserCIN] = useState<string | null>(null);
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const { t } = useTranslation();

  const [clientInfo, setClientInfo] = useState<{username: string, email: string, cin: string, phone: string, address: string, gender: string, age: string}>({
    username: "",
    email: "",
    cin: "",
    phone: "",
    address: "",
    gender: "",
    age: "",
    });

  const [profileMsg, setProfileMsg] = useState("");
  
  const [editMode, setEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(clientInfo); // For editing

  /*useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // You can log it to see all fields
        console.log("JWT payload", payload);
        const data = {
            name: payload.name || "",
            email: payload.email || "",
            cin: payload.cin || "",
            phone: payload.phone || "",
            address: payload.address || "",
        };
        setClientInfo(data);
        setEditInfo(data); // sync edit fields
        setUserCIN(payload.cin || payload.CIN || payload.username || null);
        } catch {
        setUserCIN(null);
        }
    }
  }, []);*/

  useEffect(() => {
    async function fetchProfile() {
        try {
            // Fetch profile info from backend
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Profile data:", data);
                // Set client info state
                setClientInfo(data);
                setEditInfo(data);
                // If you use cin as user identifier for bookings:
                setUserCIN(data.cin || data.CIN || data.username || null);
            }
        } catch (err) {
        console.error("Failed to fetch profile info", err);
        }
    }
    fetchProfile();
    }, []);


  useEffect(() => {
    if (!userCIN) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Only this user's bookings
        const myBookings = data.filter((b: Booking) => b.cin === userCIN);
        setAllBookings(myBookings);
        setLoading(false);
      });
  }, [userCIN]);

  useEffect(() => {
    // Filtering logic
    let result = allBookings;
    if (filterDestination) result = result.filter(b => b.destination === filterDestination);
    if (filterDate) result = result.filter(b => b.date === filterDate);
    setFilteredBookings(result);
  }, [allBookings, filterDestination, filterDate]);

  // Compute unique destinations/dates for filters
  const uniqueDestinations = Array.from(new Set(allBookings.map((b) => b.destination)));
  const uniqueDates = Array.from(new Set(allBookings.map((b) => b.date)));

  // Export to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MyBookings");
    XLSX.writeFile(wb, "my_trips.xlsx");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-white min-h-screen text-gray-900">
        <Navbar />
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200 mb-8 max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-800 text-center">{t('My Profile')}</h3>
            {!editMode ? (
                <table className="min-w-full mb-4">
                <tbody>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Name')}</td>
                    <td className="py-2">{clientInfo.username}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Email')}</td>
                    <td className="py-2">{clientInfo.email}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('CIN')}</td>
                    <td className="py-2">{clientInfo.cin}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Phone')}</td>
                    <td className="py-2">{clientInfo.phone}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Address')}</td>
                    <td className="py-2">{clientInfo.address}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Gender')}</td>
                    <td className="py-2">{clientInfo.gender}</td>
                    </tr>
                    <tr>
                    <td className="py-2 pr-4 font-semibold">{t('Age')}</td>
                    <td className="py-2">{clientInfo.age}</td>
                    </tr>
                </tbody>
                </table>
            ) : (
                <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setProfileMsg("");
                    // Send update request to backend here
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(editInfo),
                    });
                    if (res.ok) {
                    setClientInfo(editInfo);
                    setProfileMsg("✅ Profile updated.");
                    setEditMode(false);
                    }
                    else setProfileMsg("❌ Failed to update.");
                }}
                className="space-y-4"
                >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-semibold mb-1">{t('Name')}</label>
                    <input value={editInfo.username} onChange={e => setEditInfo(v => ({...v, username: e.target.value}))} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold mb-1">{t('Email')}</label>
                    <input value={editInfo.email} className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" disabled />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold mb-1">{t('CIN')}</label>
                    <input value={editInfo.cin} onChange={e => setEditInfo(v => ({...v, cin: e.target.value}))} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold mb-1">{t('Phone')}</label>
                    <input value={editInfo.phone} onChange={e => setEditInfo(v => ({...v, phone: e.target.value}))} className="w-full border p-2 rounded" />
                    </div>
                    <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-1">{t('Address')}</label>
                    <input value={editInfo.address} onChange={e => setEditInfo(v => ({...v, address: e.target.value}))} className="w-full border p-2 rounded" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-1">{t('Gender')}</label>
                        <select
                            value={editInfo.gender}
                            onChange={e => setEditInfo(v => ({ ...v, gender: e.target.value }))}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="" disabled>{t('Select gender')}</option>
                            <option value="male">{t('Male')}</option>
                            <option value="female">{t('Female')}</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-1">{t('Age')}</label>
                        <input
                            type="number"
                            value={editInfo.age}
                            onChange={e => setEditInfo(v => ({ ...v, age: e.target.value }))}
                            className="w-full border p-2 rounded"
                            min={1}
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-2 justify-center">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow" type="submit">{t('Save')}</button>
                    <button type="button" onClick={() => { setEditMode(false); setEditInfo(clientInfo); }} className="bg-gray-400 text-white px-6 py-2 rounded-xl shadow">{t('Cancel')}</button>
                </div>
                {profileMsg && <div className="mt-2 text-center text-sm font-medium">{profileMsg}</div>}
                </form>
            )}
            {!editMode && (
                <div className="flex justify-center">
                <button onClick={() => setEditMode(true)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-xl shadow mt-2 font-bold">
                    {t('Edit')}
                </button>
                </div>
            )}
            {profileMsg && !editMode && <div className="mt-2 text-center text-sm font-medium">{profileMsg}</div>}
        </div>


        <div className="max-w-4xl mx-auto p-4 pt-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">
            {t('My Trips')}
            </h2>
            {loading ? (
            <div className="text-center text-blue-600 font-medium">{t('Loading...')}</div>
            ) : filteredBookings.length === 0 ? (
            <div className="text-center text-gray-600">{t('No bookings found.')}</div>
            ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200 overflow-x-auto">
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow font-bold"
                    type="button"
                >
                    {t('Export to Excel')}
                </button>
                <select
                    value={filterDestination}
                    onChange={e => setFilterDestination(e.target.value)}
                    className="border-2 border-blue-200 p-3 rounded-xl shadow"
                >
                    <option value="">{t('All Destinations')}</option>
                    {uniqueDestinations.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                    ))}
                </select>
                <select
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="border-2 border-blue-200 p-3 rounded-xl shadow"
                >
                    <option value="">{t('All Dates')}</option>
                    {uniqueDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                    ))}
                </select>
                </div>
                <table className="min-w-full border mb-8">
                <thead>
                    <tr className="bg-gray-100">
                    <th className="border px-2 py-1">{t('Destination')}</th>
                    <th className="border px-2 py-1">{t('Date')}</th>
                    <th className="border px-2 py-1">{t('Gender')}</th>
                    <th className="border px-2 py-1">{t('Price')}</th>
                    <th className="border px-2 py-1">{t('Status')}</th>
                    <th className="border px-2 py-1">{t('In Bus')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((b) => (
                    <tr key={b._id}>
                        <td className="border px-2 py-1">{b.destination}</td>
                        <td className="border px-2 py-1">{b.date}</td>
                        <td className="border px-2 py-1">{b.gender}</td>
                        <td className="border px-2 py-1">{b.price ? `${b.price} MAD` : '-'}</td>
                        <td className={`border px-2 py-1 font-bold ${
                            b.status === 'confirmed'
                            ? 'text-green-700'
                            : b.status === 'rejected'
                            ? 'text-red-700'
                            : 'text-blue-600'
                        }`}>
                        {t(b.status || 'pending')}
                        </td>
                        <td className={`border px-2 py-1 font-bold ${
                            b.inBus ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                        }`}>
                        {b.inBus ? 'YES' : 'NO'}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <div className="text-gray-500 text-xs text-center">{t('Contact us for any changes or issues.')}</div>
            </div>
            )}
      </div>
    </div>
  );
}
