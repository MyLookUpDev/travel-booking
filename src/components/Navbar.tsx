import React from "react";

void React;

const Navbar = () => (
  <header className="bg-gray-100 shadow-md py-4 px-6 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-blue-700">Khouloud Voyage</h1>
    <nav className="space-x-6">
      <a href="/" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Home</a>
      <a href="/booking" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Booking</a>
      <a href="#packages" className="px-2 py-1 text-black bg-blue-100 rounded hover:text-blue-500">Packages</a>
      <a
        href="https://wa.me/212656290454"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-1 text-black bg-blue-100 rounded hover:text-green-600"
      >
        Contact
      </a>
      <a href="/login" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
        Login
      </a>
    </nav>
  </header>
);

export default Navbar;
