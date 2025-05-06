import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faTasks,
  faClock,
  faMapMarkerAlt,
  faCheckCircle,
  faSyncAlt,
  faUserCheck,
  faSearch,
  faBookOpen,
  faBook,
  faPenNib,
  faLaptop,
  faUtensils,
  faBroom,
  faPrint,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(null); // null, 'signup', 'login'

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setFormType(null);
  };

  const renderForm = () => {
    return (
      <form className="flex flex-col gap-4 text-left">
        <input
          type="text"
          placeholder="Username"
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
        {formType === "signup" && (
          <input
            type="text"
            placeholder="Area/Location"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        )}
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
        <button className="bg-black text-white py-2 rounded-md hover:bg-purple-800 transition">
          {formType === "signup" ? "Sign Up" : "Log In"}
        </button>
        <p className="text-sm text-center text-gray-500 mt-2">
          {formType === "signup" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-purple-600 cursor-pointer"
                onClick={() => setFormType("login")}
              >
                Log In
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                className="text-purple-600 cursor-pointer"
                onClick={() => setFormType("signup")}
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </form>
    );
  };

  const cardGradients = [
    "from-blue-400 to-purple-500",
    "from-pink-500 to-purple-500",
    "from-orange-400 to-pink-500",
    "from-green-400 to-cyan-500",
    "from-yellow-400 to-red-400",
    "from-purple-500 to-indigo-500",
    "from-teal-400 to-blue-500",
    "from-red-400 to-pink-400",
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center font-sans overflow-hidden text-black">
      {/* Background Blur Animation */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          animation: "moveBg 20s ease-in-out infinite alternate",
          background:
            "radial-gradient(circle at 50% 40%, rgba(255, 124, 209, 0.8), rgba(99, 194, 248, 0.47), transparent 50%), radial-gradient(circle at 70% 60%, rgba(142, 119, 255, 0.75), transparent 100%)",
          filter: "blur(150px)",
          backgroundSize: "200% 200%",
        }}
      ></div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <header className="w-full max-w-full flex justify-between items-center">
          <h1 className="text-4xl font-bold flex items-center bg-gradient-to-r from-yellow-400 to-pink-700 text-transparent bg-clip-text ml-5 mt-2">
            ZipTask
          </h1>
          <button className="bg-black text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 flex items-center mr-5 mt-2">
            <FontAwesomeIcon icon={faRocket} className="mr-2" />
            Get Started
          </button>
        </header>

        {/* Hero Section */}
        <main className="text-center mt-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-black">
            ZipTask — Your Hyperlocal Task Marketplace
          </h2>
          <p className="mt-4 text-gray-700">
            Connect with nearby people to get things done quickly — whether online or offline.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button className="bg-black hover:bg-purple-100 hover:text-black hover:scale-105 hover:shadow-xl transition duration-300 transform px-6 py-3 text-white rounded-xl shadow-lg flex items-center">
              <FontAwesomeIcon icon={faTasks} className="mr-2" />
              Post a Task
            </button>
            <button className="border border-purple-500 text-black px-6 py-3 rounded-xl hover:bg-purple-100 flex items-center">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Find Tasks
            </button>
          </div>
        </main>

        {/* Stats */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto">
          <div>
            <h3 className="text-3xl font-semibold flex justify-center items-center text-black">
              <FontAwesomeIcon icon={faTasks} className="mr-2" />
              10+
            </h3>
            <p className="text-gray-600">Tasks Completed</p>
          </div>
          <div>
            <h3 className="text-3xl font-semibold flex justify-center items-center text-black">
              <FontAwesomeIcon icon={faUserCheck} className="mr-2" />
              200+
            </h3>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div>
            <h3 className="text-3xl font-semibold flex justify-center items-center text-black">
              <FontAwesomeIcon icon={faRocket} className="mr-2" />
              ₹ Instant
            </h3>
            <p className="text-gray-600">Payments</p>
          </div>
        </section>

        {/* Features */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full px-4 mx-auto">
          {[
            { title: "One-Hour Tasks", desc: "Quick and easy jobs", icon: faClock },
            { title: "Nearby Helpers", desc: "Local task assistance", icon: faMapMarkerAlt },
            { title: "Verified Users", desc: "Trusted and secure profiles", icon: faCheckCircle },
            { title: "Flexible Options", desc: "Online and offline work", icon: faSyncAlt },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} text-white rounded-2xl p-6 shadow-lg text-center shadow-purple-400 transition-all`}
            >
              <div className="text-3xl mb-2">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h4 className="text-lg font-semibold">{feature.title}</h4>
              <p className="text-sm">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Nearby Tasks Section */}
        <section className="mt-16 max-w-6xl w-full px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-6">
            Nearby Tasks
          </h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in mb-10">
            {[
              { icon: faBookOpen, title: "Assignment Writing", location: "Hostel 5, DU Campus", price: "₹300" },
              { icon: faBook, title: "Deliver Book to Friend", location: "Library → Hostel 3", price: "₹50" },
              { icon: faPenNib, title: "Notes Digitization", location: "PG Block, Mumbai Univ.", price: "₹150" },
              { icon: faLaptop, title: "Online Research Help", location: "Online", price: "₹200" },
              { icon: faUtensils, title: "Food Pickup from Mess", location: "Gate 2, College Mess", price: "₹30" },
              { icon: faBroom, title: "Room Cleanup Help", location: "Flat 12A, Student Housing", price: "₹100" },
              { icon: faPrint, title: "Print and Submit Docs", location: "Print Shop to Office", price: "₹80" },
              { icon: faMobileAlt, title: "Phone Recharge Help", location: "Online", price: "₹20" },
            ].map((task, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} text-black rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105 flex flex-col justify-between`}
              >
                <div>
                  <div className="text-4xl mb-3">
                    <FontAwesomeIcon icon={task.icon} />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
                  <p className="text-sm">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                    {task.location}
                  </p>
                  <p className="font-bold mt-2">{task.price}</p>
                </div>
                <button className="mt-4 bg-black text-white py-2 px-4 rounded-xl hover:bg-purple-800 transition">
                  Accept Task
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white mt-auto">
          <div>
            <p className="text-sm">&copy; {new Date().getFullYear()} ZipTask. All rights reserved.</p>
            <p className="text-xs mt-1">Built for local communities and student networks</p>
          </div>
        </footer>
      </div>

      {/* SignUp/Login Modal */}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl relative text-center">
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
              onClick={closeModal}
            >
              ×
            </button>
            {formType ? (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  {formType === "signup" ? "Create Account" : "Log In"}
                </h2>
                {renderForm()}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Welcome to ZipTask!</h2>
                <p className="text-sm mb-6 text-gray-600">
                  Sign up or log in to get started with posting and accepting tasks nearby.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    className="bg-black text-white py-2 px-4 rounded-xl hover:bg-purple-800 transition"
                    onClick={() => setFormType("signup")}
                  >
                    Sign Up
                  </button>
                  <button
                    className="border border-gray-400 py-2 px-4 rounded-xl hover:bg-gray-100 transition"
                    onClick={() => setFormType("login")}
                  >
                    Log In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Background & Animation Keyframes */}
      <style>
        {`
          @keyframes moveBg {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in {
            animation: slideIn 1s ease-out;
          }
        `}
      </style>
    </div>
  );
}