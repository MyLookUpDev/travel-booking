// src/App.tsx
//import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import PaymentPage from './Payment'
import BookingForm from './BookingForm'
import AdminPage from './AdminPage'
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Register from "./pages/Register"
import RequireAdmin from "./pages/RequireAdmin"
import RequestForm from "./RequestForm"
import AdminStats from "./AdminStats"
import './i18n'
import RequireClient from "./pages/RequireClient"
import ClientBookingsPage from "./ClientBookingsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/request" element={<RequestForm />} />
        <Route path="/admin-stats" element={<RequireAdmin><AdminStats /></RequireAdmin>} />
        <Route path="/client" element={<RequireClient><ClientBookingsPage /></RequireClient>} />
      </Routes>
    </BrowserRouter>
  )
}
