import { type JSX, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(t('You must be an admin to access this page.'));
      navigate("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== "admin") {
        alert(t('You must be an admin to access this page.'));
        navigate("/login");
      }
    } catch {
      alert(t('You must be an admin to access this page.'));
      navigate("/login");
    }
  }, [navigate, t]);

  return children;
}
