import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waNumber] = useState(""); // Current number (fetched from backend)
  const w_path = `https://wa.me/${waNumber}`;
  const [showContactMenu, setShowContactMenu] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="bg-gradient-to-tr from-blue-50 to-purple-100 shadow-lg py-4 px-6 flex justify-between items-center rounded-b-3xl border-b-2 border-blue-200 relative z-30">
      <div className="flex items-center gap-3">
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe text-blue-700"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg>
        <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight bg-gradient-to-tr from-blue-600 to-purple-500 text-transparent bg-clip-text">Khouloud Voyage</h1>
      </div>
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-3">
        <a href="/" className="px-4 py-2 rounded-2xl font-semibold transition-all bg-white/70 text-blue-800 hover:bg-blue-600 hover:text-white shadow">Home</a>
        <a href="/booking" className="px-4 py-2 rounded-2xl font-semibold transition-all bg-white/70 text-blue-800 hover:bg-blue-600 hover:text-white shadow">Booking</a>
        <a href="/request" className="px-4 py-2 rounded-2xl font-semibold transition-all bg-white/70 text-blue-800 hover:bg-blue-600 hover:text-white shadow">Request</a>
        {/* Contact Dropdown */}
        <div className="relative" ref={contactRef}>
          <button
            type="button"
            className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-tr from-green-200 to-green-100 text-green-900 hover:bg-green-500 hover:text-white transition-all shadow flex items-center gap-2"
            onClick={() => setShowContactMenu((v) => !v)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="feather feather-phone"><path d="M22 16.92V23a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 1 5.18 2 2 0 0 1 3 3h6.09a2 2 0 0 1 2 1.72l.72 5.47a2 2 0 0 1-1 2.18l-2.2 1.11a16.11 16.11 0 0 0 7.29 7.29l1.11-2.2a2 2 0 0 1 2.18-1l5.47.72A2 2 0 0 1 23 16.91V23z"/></svg>
            Contact
          </button>
          {showContactMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-green-200 rounded-2xl shadow-xl z-20 animate-fadeIn">
              <a
                href={w_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 hover:bg-green-50 rounded-t-2xl transition"
                onClick={() => setShowContactMenu(false)}
              >
                <span className="text-green-600 text-lg">🟢</span> WhatsApp
              </a>
              <a
                href="https://www.instagram.com/khouloud.voyage?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 hover:bg-pink-50 transition"
                onClick={() => setShowContactMenu(false)}
              >
                <span className="text-pink-400 text-lg">📸</span> Instagram
              </a>
              <a
                href="https://web.facebook.com/Khouloud.Voyage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 hover:bg-blue-100 rounded-b-2xl transition"
                onClick={() => setShowContactMenu(false)}
              >
                <span className="text-blue-600 text-lg">📘</span> Facebook
              </a>
            </div>
          )}
        </div>
        <a href="/login" className="px-6 py-2 ml-3 bg-gradient-to-tr from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white rounded-2xl font-bold shadow transition-all">Login</a>
        {username && (
          <span className="ml-4 font-semibold text-blue-700 bg-blue-100 rounded-2xl px-3 py-1 shadow">
            👤 {username}
          </span>
        )}
      </nav>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 rounded-xl bg-white/70 shadow-lg border border-blue-200"
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
            className="ml-auto bg-gradient-to-tr from-blue-50 to-purple-100 w-3/4 max-w-xs h-full p-8 flex flex-col gap-5 shadow-2xl rounded-l-3xl animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <a href="/" className="px-4 py-3 rounded-2xl font-semibold hover:bg-blue-100 transition" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/booking" className="px-4 py-3 rounded-2xl font-semibold hover:bg-blue-100 transition" onClick={() => setMenuOpen(false)}>Booking</a>
            <a href="/request" className="px-4 py-3 rounded-2xl font-semibold hover:bg-blue-100 transition" onClick={() => setMenuOpen(false)}>Request</a>
            <a
              href={w_path}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl font-semibold hover:bg-green-100 transition"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-green-600 mr-2">🟢</span> WhatsApp
            </a>
            <a
              href="https://www.instagram.com/khouloud.voyage?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl font-semibold hover:bg-pink-100 transition"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-pink-400 mr-2">📸</span> Instagram
            </a>
            <a
              href="https://web.facebook.com/Khouloud.Voyage"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl font-semibold hover:bg-blue-100 transition"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-blue-600 mr-2">📘</span> Facebook
            </a>
            <a href="/login" className="px-6 py-3 bg-gradient-to-tr from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white rounded-2xl font-bold shadow mt-2 transition" onClick={() => setMenuOpen(false)}>
              Login
            </a>
            {username && (
              <span className="mt-5 font-semibold text-blue-700 bg-blue-100 rounded-2xl px-3 py-2 shadow flex items-center">
                👤 {username}
              </span>
            )}
          </nav>
        </div>
      )}
    </header>

  );
}
