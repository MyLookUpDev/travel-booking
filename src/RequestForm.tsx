import { useState } from "react";
import Navbar from './components/Navbar';

const RequestForm = () => {
  const [form, setForm] = useState({ name: '', cin: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900">
      <Navbar />
      <div className="max-w-lg mx-auto mt-14 mb-20 p-8 rounded-3xl shadow-2xl bg-white/90 border border-blue-100 relative">
        <h2 className="text-3xl font-extrabold mb-7 text-blue-800 flex items-center gap-2 justify-center drop-shadow">
          <span role="img" aria-label="mail">📩</span>
          Send a Request to Admin
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fadeIn">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border-2 border-blue-200 focus:border-blue-500 transition p-4 rounded-2xl shadow bg-white/70 text-lg"
            placeholder="Your Name"
            required
          />
          <input
            name="cin"
            value={form.cin}
            onChange={handleChange}
            className="w-full border-2 border-blue-200 focus:border-blue-500 transition p-4 rounded-2xl shadow bg-white/70 text-lg"
            placeholder="National ID (CIN)"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border-2 border-blue-200 focus:border-blue-500 transition p-4 rounded-2xl shadow bg-white/70 text-lg"
            placeholder="Phone Number"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="w-full border-2 border-purple-200 focus:border-purple-500 transition p-4 rounded-2xl shadow bg-white/70 text-lg min-h-[110px] resize-none"
            placeholder="Type your request or question..."
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-tr from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span role="img" aria-label="send">🚀</span> Send Request
          </button>
          {status && (
            <div className={`text-center text-base font-semibold ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
