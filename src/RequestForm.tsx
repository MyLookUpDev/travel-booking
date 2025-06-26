import React, { useState } from "react";
import Navbar from './components/Navbar';

const RequestForm = () => {
  const [form, setForm] = useState({ name: '', cin: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setStatus('✅ Request sent!');
      setForm({ name: '', cin: '', phone: '', message: '' });
    } else {
      setStatus('❌ Failed to send request');
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900">
      <Navbar />
      <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-2xl shadow-lg mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Send a Request to Admin</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border border-blue-200 focus:border-blue-600 transition p-3 rounded shadow-sm"
            placeholder="Your Name"
            required
          />
          <input
            name="cin"
            value={form.cin}
            onChange={handleChange}
            className="border border-blue-200 focus:border-blue-600 transition p-3 rounded shadow-sm"
            placeholder="CIN"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="border border-blue-200 focus:border-blue-600 transition p-3 rounded shadow-sm"
            placeholder="Phone Number"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="border border-blue-200 focus:border-blue-600 transition p-3 rounded shadow-sm min-h-[100px]"
            placeholder="Your Request"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold shadow-md"
          >
            Send Request
          </button>
          {status && (
            <div className={`text-center text-base ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
