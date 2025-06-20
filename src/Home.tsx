// Home.tsx
import React, { useEffect, useState } from 'react';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';

void React;

type Trip = {
  _id: string;
  destination: string;
  date: string;
  seats: number;
  gender: string;
  price: number;
  image?: string;
};

const isWeekend = (dateStr: string) => {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6; // 0=Sunday, 6=Saturday
};

const Home = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [genderFilter, setGenderFilter] = useState('');
  const [weekendOnly, setWeekendOnly] = useState(false);

  // Slideshow logic
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    mode: 'snap',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/trips')
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch(() => setTrips([]));
  }, []);

  // Filter trips for packages and slideshow
  const filteredTrips = trips.filter(
    (t) =>
      (!genderFilter || t.gender === genderFilter || t.gender === 'all') &&
      (!weekendOnly || isWeekend(t.date))
  );

  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Khouloud Voyage</h1>
        <nav className="space-x-6">
          <a href="#home" className="hover:text-blue-500">Home</a>
          <a href="/booking" className="hover:text-blue-500">Booking</a>
          <a href="#packages" className="hover:text-blue-500">Packages</a>
          <a
            href="https://wa.me/212656290454"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="h-[55vh] md:h-[70vh] bg-black flex items-center justify-center text-white relative">
        <div ref={sliderRef} className="keen-slider w-full h-full rounded-2xl overflow-hidden shadow-xl">
          {filteredTrips.length > 0 ? (
            filteredTrips.slice(0, 8).map((trip) => (
              <div key={trip._id} className="keen-slider__slide flex items-center justify-center h-full relative">
                <img
                  src={trip.image || '/images/banner.jpg'}
                  alt={trip.destination}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="relative z-10 text-center px-6 py-12 bg-black bg-opacity-30 rounded-2xl max-w-lg mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold mb-2">{trip.destination}</h2>
                  <p className="text-xl mb-4">
                    <span className="font-semibold">{trip.price} MAD</span>
                    &nbsp;|&nbsp;{new Date(trip.date).toLocaleDateString()} &nbsp;|&nbsp;
                    <span className="font-semibold">{trip.seats}</span> seats left
                  </p>
                  <a
                    href="/booking"
                    className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-white text-2xl">No trips found</span>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 py-6 px-6 flex flex-wrap justify-center gap-6 items-center">
        <div>
          <label className="font-semibold mr-2">Gender:</label>
          <select
            className="border p-2 rounded"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="male">Men Only</option>
            <option value="female">Women Only</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Weekend only:</label>
          <input
            type="checkbox"
            checked={weekendOnly}
            onChange={(e) => setWeekendOnly(e.target.checked)}
          />
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">Our Packages</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {filteredTrips.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No packages found.</div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg flex flex-col">
                <img src={trip.image || '/images/package1.jpg'} alt={trip.destination} className="w-full h-48 object-cover" />
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-xl mb-1">{trip.destination}</h4>
                  <div className="mb-1 text-blue-700 font-bold text-lg">{trip.price} MAD</div>
                  <div className="text-gray-600 mb-1">Date: {new Date(trip.date).toLocaleDateString()}</div>
                  <div className="text-gray-600 mb-2">Seats left: {trip.seats}</div>
                  <div className="flex-1"></div>
                  <a
                    href={`/booking?destination=${encodeURIComponent(trip.destination)}&date=${encodeURIComponent(trip.date)}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Book
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>&copy; 2025 Trovol Travel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
