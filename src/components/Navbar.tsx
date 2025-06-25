import { useEffect, useState } from "react";

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waNumber] = useState(""); // Current number (fetched from backend)
  const w_path = `https://wa.me/${waNumber}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch { /* empty */ }
    }
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowX = '';
    }
  }, [menuOpen]);

  return (
    <header className="bg-gray-100 shadow-md py-4 px-6 flex justify-between items-center relative">
      <h1 className="text-2xl font-bold text-blue-700">Khouloud Voyage</h1>
      {/* Desktop Nav */}
      <nav className="space-x-6 flex items-center max-md:hidden">
        <a href="/" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Home</a>
        <a href="/booking" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Booking</a>
        <a href="#packages" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Packages</a>
        <a
          href={w_path}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1 text-black bg-blue-100 rounded hover:text-green-600"
        >
          Contact
        </a>
        <a href="/login" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Login
        </a>
        {username && (
          <span className="ml-4 font-semibold text-blue-700">
            Hello, {username}
          </span>
        )}
      </nav>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 rounded focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Open Menu"
      >
        <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
        </svg>
      </button>
      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            className="ml-auto bg-white w-3/4 max-w-xs h-full p-6 flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <a href="/" className="px-2 py-2 rounded hover:bg-blue-100" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/booking" className="px-2 py-2 rounded hover:bg-blue-100" onClick={() => setMenuOpen(false)}>Booking</a>
            <a href="#packages" className="px-2 py-2 rounded hover:bg-blue-100" onClick={() => setMenuOpen(false)}>Packages</a>
            <a
              href={w_path}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded hover:bg-green-100"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setMenuOpen(false)}>
              Login
            </a>
            {username && (
              <span className="mt-4 font-semibold text-blue-700">
                Hello, {username}
              </span>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
