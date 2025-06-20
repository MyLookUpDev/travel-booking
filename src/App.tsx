// src/App.tsx
//import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import PaymentPage from './Payment'
import BookingForm from './BookingForm'
import AdminPage from './AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
