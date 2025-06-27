import React, { useEffect, useState } from "react";
import RequireAdmin from "./pages/RequireAdmin";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, LabelList } from "recharts";
import Navbar from "./components/Navbar";

void RequireAdmin;

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f", "#ffbb28", "#ff7300"];

const AdminStats = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/trips`).then(r => r.json()).then(setTrips);
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`).then(r => r.json()).then(setBookings);
  }, []);

  // Top Trip Planned
  const tripCounts = trips.map(trip => ({
    destination: trip.destination,
    bookings: bookings.filter(b => b.destination === trip.destination).length,
  })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  // Top Profitable Trips
  const topProfitTrips = trips
    .map(trip => ({
      destination: trip.destination,
      profit: trip.profit || 0,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

    console.log("tripCounts", tripCounts);
    console.log("topProfitTrips", topProfitTrips);

  // Male vs Female %
  const genderCounts = bookings.reduce(
    (acc, b) => {
      if (b.gender === "female") acc.female++;
      else acc.male++;
      return acc;
    },
    { male: 0, female: 0 }
  );
  const genderData = [
    { name: "Male", value: genderCounts.male },
    { name: "Female", value: genderCounts.female },
  ];

  // Top Users (by number of bookings)
  const userCounts: Record<string, { name: string; phone: string; count: number }> = {};
  bookings.forEach(b => {
    const key = b.phone + b.name;
    if (!userCounts[key]) userCounts[key] = { name: b.name, phone: b.phone, count: 0 };
    userCounts[key].count++;
  });
  const topUsers = Object.values(userCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  console.log(tripCounts)

  return (
    <div className="bg-gradient-to-tr from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-2">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black flex items-center gap-2">
            <img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/bar-chart-2.svg" className="h-8 w-8 text-purple-600" alt="Stats" />
            <span className="bg-gradient-to-tr from-purple-700 to-blue-400 text-transparent bg-clip-text">Statistics</span>
          </h1>
          <a
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl shadow transition"
          >
            ← Back to Admin
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Trips Planned */}
          <div className="bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-purple-700">Top Trips (Most Booked)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tripCounts}>
                <XAxis dataKey="destination" tick={{fontSize: 14}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#a78bfa" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="bookings" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Top Profitable Trips */}
          <div className="bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-emerald-700">Top Profitable Trips</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProfitTrips}>
                <XAxis dataKey="destination" tick={{fontSize: 14}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#34d399" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="profit" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Male vs Female */}
          <div className="bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-blue-700">Gender Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(1) : "0.0"}%`
                  }
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Top Users */}
          <div className="bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-yellow-700">Top Users</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topUsers}>
                <XAxis dataKey="name" tick={{fontSize: 14}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#fbbf24" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ul className="mt-4 text-base text-gray-700">
              {topUsers.map(u => (
                <li key={u.phone} className="flex justify-between border-b py-1 font-semibold">
                  <span>{u.name} ({u.phone})</span>
                  <span>{u.count} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
