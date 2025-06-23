import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Decode JWT to get role
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (payload.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setMsg(data.message || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      setMsg("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-300">
      <div className="w-full max-w-md bg-white/95 p-8 rounded-2xl shadow-2xl border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email or Username</label>
            <input
              className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              placeholder="Email or Username"
              autoFocus
              autoComplete="username"
              required
            />
          </div>
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPwd ? "text" : "password"}
              className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-indigo-300 focus:outline-none pr-12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-400 hover:text-indigo-700"
              tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {msg && <div className="text-center text-red-500 font-medium">{msg}</div>}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></span>
            ) : "Log In"}
          </button>
        </form>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-sm">
          <a href="/register" className="text-indigo-600 hover:underline font-semibold mb-2 md:mb-0">
            Create an account
          </a>
          <a href="/forgot-password" className="text-gray-500 hover:text-indigo-500 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
