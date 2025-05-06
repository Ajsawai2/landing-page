import React from "react";

export default function Modal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl text-center relative">
        <button
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Welcome to ZipTask!</h2>
        <p className="text-sm mb-6 text-gray-600">
          Sign up or log in to get started with posting and accepting tasks nearby.
        </p>
        <div className="flex flex-col gap-3">
          <button className="bg-black text-white py-2 px-4 rounded-xl hover:bg-purple-800 transition">
            Sign Up
          </button>
          <button className="border border-gray-400 py-2 px-4 rounded-xl hover:bg-gray-100 transition">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}