import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

export default function TaskCard({ task, gradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} text-black rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105 flex flex-col justify-between`}>
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
  );
}