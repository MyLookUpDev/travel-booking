import React from 'react'

export default function Payment() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
        <p className="mb-6">
          This is a placeholder for your payment system. Integrate with Stripe,
          PayPal, or any gateway you prefer.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded">
          Proceed with Payment
        </button>
      </div>
    </div>
  )
}
