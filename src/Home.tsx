// Home.tsx
import React, { useEffect, useRef, useState } from 'react';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Navbar from './components/Navbar';

void React;

type Trip = {
  _id: string;
  destination: string;
  date: string;
  seats: number;
  gender: string;
  price: number;
  image?: string;
  days?: number;
};

const isWeekend = (dateStr: string) => {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6; // 0=Sunday, 6=Saturday
};

const Home = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [genderFilter, setGenderFilter] = useState('');
  const [weekendOnly, setWeekendOnly] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignore time
  const [sortOption, setSortOption] = useState('');

  // Slideshow logic
  const sliderDomRef = useRef<HTMLDivElement | null>(null); // <-- create a DOM ref
  const [sliderRefCallback, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    mode: "snap",
  });
  // Attach both refs to the same element
  function combinedRef(node: HTMLDivElement | null) {
    sliderRefCallback(node);
    //sliderDomRef.current = node;
    (sliderDomRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }

  // Filter trips for packages and slideshow
  const filteredTrips = trips.filter(
    (t) =>
      (genderFilter === "female" ? t.gender === "female" : true) &&
      (!weekendOnly || isWeekend(t.date)) &&
      (new Date(t.date) >= today) // Only today and future trips
  );

  const sortedTrips = [...filteredTrips].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If user chooses, override with other sorts
  if (sortOption === "cheapest") {
    sortedTrips.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sortOption === "longest") {
    sortedTrips.sort((a, b) => (b.days ?? 1) - (a.days ?? 1));
  }

  // AUTOPLAY LOGIC
  useEffect(() => {
    // Only autoplay if there are 2 or more slides
    if (!instanceRef.current || filteredTrips.length < 2) return;
    const slider = instanceRef.current;
    let interval: NodeJS.Timeout | undefined;
    const start = () => {
      interval = setInterval(() => {
        if (slider && slider.track && slider.track.details) slider.next();
      }, 5000);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
    };
    start();

    const node = sliderDomRef.current;
    node?.addEventListener("mouseenter", stop);
    node?.addEventListener("mouseleave", start);

    return () => {
      stop();
      node?.removeEventListener("mouseenter", stop);
      node?.removeEventListener("mouseleave", start);
    };
  }, [instanceRef, filteredTrips]);

  useEffect(() => {
    console.log(`${import.meta.env.VITE_API_URL}/api/trips`);
    fetch(`${import.meta.env.VITE_API_URL}/api/trips`)
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch(() => setTrips([]));
  }, []);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900">
      <Navbar />

      {/* Hero Section with Slideshow */}
      <section className="h-[55vh] md:h-[70vh] bg-gradient-to-br from-blue-900 via-purple-700 to-blue-500 flex items-center justify-center relative">
        <div ref={combinedRef} className="keen-slider w-full h-full rounded-3xl overflow-hidden shadow-2xl">
          {filteredTrips.length > 0 ? (
            sortedTrips.slice(0, 8).map((trip) => (
              <div key={trip._id} className="keen-slider__slide flex items-center justify-center h-full relative">
                <img
                  src={trip.image || '/images/banner.jpg'}
                  alt={trip.destination}
                  className="absolute inset-0 w-full h-full object-cover opacity-75 blur-[1px] scale-105"
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8 py-12 bg-gradient-to-br from-black/70 via-blue-900/40 to-transparent rounded-3xl max-w-xl m-auto">
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-tr from-blue-300 via-white to-blue-200 text-transparent bg-clip-text drop-shadow">
                    {trip.destination}
                  </h2>
                  <p className="text-xl mb-5 bg-white/10 p-2 rounded-xl font-medium text-blue-100 drop-shadow flex flex-wrap justify-center gap-2">
                    <span className="font-semibold text-white">{trip.price} MAD</span>
                    &nbsp;|&nbsp;{new Date(trip.date).toLocaleDateString()} &nbsp;|&nbsp;
                    <span className="font-semibold text-blue-200">{trip.seats}</span> seats left
                    {trip.days && trip.days > 1 ? (
                      <> &nbsp;|&nbsp; <span className="font-semibold text-purple-200">{trip.days} days</span></>
                    ) : (
                      <> &nbsp;|&nbsp; <span className="font-semibold">1 day</span></>
                    )}
                  </p>
                  <a
                    href={`/booking?destination=${encodeURIComponent(trip.destination)}&date=${encodeURIComponent(trip.date)}`}
                    className="inline-block mt-4 bg-gradient-to-tr from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-7 py-3 rounded-2xl font-bold text-lg shadow-lg ring-2 ring-blue-200/30 hover:scale-105 transition"
                  >
                    <span role="img" aria-label="book">✨</span> Book Now
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
      <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-white py-5 px-4 flex flex-wrap justify-center gap-8 items-center shadow-inner border-b">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-blue-700">Gender:</label>
          <select
            className="border-2 border-blue-200 p-2 rounded-2xl focus:border-blue-500 bg-white"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="female">Women Only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-blue-700">Weekend only:</label>
          <input
            type="checkbox"
            checked={weekendOnly}
            onChange={(e) => setWeekendOnly(e.target.checked)}
            className="accent-blue-600 scale-125"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-blue-700">Sort by:</label>
          <select
            className="border-2 border-purple-200 p-2 rounded-2xl focus:border-purple-500 bg-white"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="">Date (Default)</option>
            <option value="cheapest">Cheapest</option>
            <option value="longest">Longest</option>
          </select>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 px-4 bg-white/80">
        <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-14 text-blue-800 drop-shadow flex items-center gap-2 justify-center">
          <span role="img" aria-label="box">📦</span>
          Our Packages
        </h3>
        <div className="grid md:grid-cols-3 gap-10">
          {filteredTrips.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 text-lg">No packages found.</div>
          ) : (
            sortedTrips.map((trip) => (
              <div key={trip._id} className="border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl flex flex-col bg-gradient-to-tr from-blue-50 via-white to-purple-50 hover:scale-105 transition-all duration-300">
                <img src={trip.image || '/images/package1.jpg'} alt={trip.destination} className="w-full h-48 object-cover" />
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-xl mb-1 text-blue-800">{trip.destination}</h4>
                  <div className="mb-1 text-blue-600 font-extrabold text-lg">{trip.price} MAD</div>
                  <div className="text-gray-700 mb-1">Date: {new Date(trip.date).toLocaleDateString()}</div>
                  <div className="text-gray-600 mb-1">Seats left: <b>{trip.seats}</b></div>
                  <div className="text-gray-600 mb-2">
                    {trip.days && trip.days > 1 ? (
                      <span>{trip.days} days</span>
                    ) : (
                      <span>1 day</span>
                    )}
                  </div>
                  <div className="flex-1"></div>
                  <a
                    href={`/booking?destination=${encodeURIComponent(trip.destination)}&date=${encodeURIComponent(trip.date)}`}
                    className="bg-gradient-to-tr from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-2xl font-bold shadow mt-2 text-center transition"
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
      <footer className="bg-gradient-to-r from-blue-900 to-purple-800 text-white py-8 text-center rounded-t-3xl shadow-xl mt-20">
        <p className="text-lg">&copy; 2025 Khouloud Voyage. All rights reserved.</p>
      </footer>
    </div>
  );

};

export default Home;