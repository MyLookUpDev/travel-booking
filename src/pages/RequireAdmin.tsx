import { type JSX, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== "admin") {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  return children;
}
