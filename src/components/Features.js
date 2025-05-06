import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faMapMarkerAlt, faCheckCircle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const cardGradients = [
  "from-blue-400 to-purple-500",
  "from-pink-500 to-purple-500",
  "from-orange-400 to-pink-500",
  "from-green-400 to-cyan-500",
];

const features = [
  { title: "One-Hour Tasks", desc: "Quick and easy jobs", icon: faClock },
  { title: "Nearby Helpers", desc: "Local task assistance", icon: faMapMarkerAlt },
  { title: "Verified Users", desc: "Trusted and secure profiles", icon: faCheckCircle },
  { title: "Flexible Options", desc: "Online and offline work", icon: faSyncAlt },
];

export default function Features() {
  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full px-4 mx-auto">
      {features.map((feature, idx) => (
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
  );
}