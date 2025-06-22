import React from "react";
import { useTranslation } from "react-i18next";

void React;

const Navbar = () => (
  <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-blue-700">Khouloud Voyage</h1>
    <LanguageSwitcher />
    <nav className="space-x-6">
      <a href="/" className="hover:text-blue-500">Home</a>
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
);

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border rounded p-2"
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="ar">العربية</option>
    </select>
  );
};

export default Navbar;
