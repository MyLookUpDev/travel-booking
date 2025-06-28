import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    setMsg(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-blue-100"
        style={{ marginTop: 40, marginBottom: 40 }}
      >
        <h2 className="text-2xl font-extrabold text-blue-800 mb-2 text-center drop-shadow">
          {t('Reset Password')}
        </h2>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder={t('New password')}
          className="border-2 border-blue-200 focus:border-blue-500 p-4 rounded-2xl shadow bg-white/90 text-lg"
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-tr from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all text-lg"
        >
          {t('Reset Password')}
        </button>
        {msg && (
          <div
            className={`text-center text-base font-semibold mt-2 ${
              msg.toLowerCase().includes('success') || msg.startsWith('✅')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {t(msg)}
          </div>
        )}
      </form>
    </div>
  );

};

export default ResetPassword;
