import React, { useEffect, useState } from "react";
import RequireAdmin from "./pages/RequireAdmin";
import Navbar from "./components/Navbar";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

void RequireAdmin;

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#fbbf24", "#8b5cf6", "#eab308"];

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

  // Male vs Female %
  const genderCounts = bookings.reduce(
    (acc, b) => {
      if (b.gender === "female") acc.female++;
      else acc.male++;
      return acc;
    },
    { male: 0, female: 0 }
  );
  const genderDataPie = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [genderCounts.male, genderCounts.female],
        backgroundColor: [COLORS[1], COLORS[2]],
        borderWidth: 1,
      },
    ],
  };

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

  // Chart.js chart data
  const tripCountsBar = {
    labels: tripCounts.map(tc => tc.destination),
    datasets: [
      {
        label: "Bookings",
        data: tripCounts.map(tc => tc.bookings),
        backgroundColor: COLORS,
      },
    ],
  };

  const profitBar = {
    labels: topProfitTrips.map(tp => tp.destination),
    datasets: [
      {
        label: "Profit",
        data: topProfitTrips.map(tp => tp.profit),
        backgroundColor: COLORS,
      },
    ],
  };

  const topUsersBar = {
    labels: topUsers.map(u => u.name),
    datasets: [
      {
        label: "Bookings",
        data: topUsers.map(u => u.count),
        backgroundColor: COLORS,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {},
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    },
  };

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
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-purple-700">Top Trips (Most Booked)</h2>
            <Bar data={tripCountsBar} options={chartOptions} />
          </div>
          {/* Top Profitable Trips */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-emerald-700">Top Profitable Trips</h2>
            <Bar data={profitBar} options={chartOptions} />
          </div>
          {/* Male vs Female */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-blue-700">Gender Distribution</h2>
            <Pie data={genderDataPie} options={{
              plugins: { legend: { position: "bottom" as const } }
            }} />
          </div>
          {/* Top Users */}
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-yellow-700">Top Users</h2>
            <Bar data={topUsersBar} options={chartOptions} />
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
