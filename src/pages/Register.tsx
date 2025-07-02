import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Register() {
  //const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [form, setForm] = useState({
    username: "",   // (use for "Name")
    email: "",
    password: "",
    cin: "",
    address: "",
    phone: "",
    gender: "",
    age: ""
  });
  const [message, setMessage] = useState("");
  const [msgColor, setMsgColor] = useState<"green" | "red">("green");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessage("🎉 Account created! Redirecting...");
        setMsgColor("green");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || "Failed to register.");
        setMsgColor("red");
      }
    } catch {
      setLoading(false);
      setMessage("Server error.");
      setMsgColor("red");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-indigo-300">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">{t('Create Account')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              name="username"
              id="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
              autoFocus
            />
            <label
              htmlFor="username"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Username')}
            </label>
          </div>
          <div className="relative">
            <input
              name="email"
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Email')}
            </label>
          </div>
          <div className="relative">
            <input
              name="password"
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Password')}
            </label>
          </div>
          <div className="relative">
            <input
              name="cin"
              id="cin"
              type="text"
              value={form.cin}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="cin"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('CIN')}
            </label>
          </div>

          <div className="relative">
            <input
              name="address"
              id="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="address"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Address')}
            </label>
          </div>

          <div className="relative">
            <input
              name="phone"
              id="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="phone"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Phone')}
            </label>
          </div>

          <div className="relative">
            <select
              name="gender"
              id="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>{t('Gender')}</option>
              <option value="male">{t('Male')}</option>
              <option value="female">{t('Female')}</option>
            </select>
            <label
              htmlFor="gender"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Gender')}
            </label>
          </div>

          <div className="relative">
            <input
              name="age"
              id="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              required
              min={1}
              className="w-full peer border-b-2 border-indigo-200 bg-transparent p-3 pt-6 text-gray-900 rounded-t-md focus:outline-none focus:border-indigo-500"
              placeholder=" "
            />
            <label
              htmlFor="age"
              className="absolute left-3 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm"
            >
              {t('Age')}
            </label>
          </div>
          {message && (
            <div className={`text-center font-medium mb-1 ${msgColor === "green" ? "text-green-600" : "text-red-600"}`}>
              {t(message)}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-150 active:scale-95"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </span>
            ) : t('Create Account')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {t('Already have an account?')} {" "}
          <a href="/login" className="text-indigo-600 hover:underline font-semibold">
            {t('Log In')}
          </a>
        </div>
      </div>
    </div>
  );
}
