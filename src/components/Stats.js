import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks, faUserCheck, faRocket } from "@fortawesome/free-solid-svg-icons";

export default function Stats() {
  return (
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
  );
}
