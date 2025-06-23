import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const data = await res.json();
    if (data.token) {
      login(data.token);
      window.location.href = "/"; // or use navigate
    } else {
      setMsg(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={usernameOrEmail}
        onChange={e => setUsernameOrEmail(e.target.value)}
        placeholder="Email or Username"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {msg && <p>{msg}</p>}
      <a href="/forgot-password">Forgot password?</a>
    </form>
  );
};

export default Login;
