import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  return (
    <header className="w-full max-w-full flex justify-between items-center">
      <h1 className="text-4xl font-bold flex items-center bg-gradient-to-r from-yellow-400 to-pink-700 text-transparent bg-clip-text ml-5 mt-2">
        ZipTask
      </h1>
      <button className="bg-black text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 flex items-center mr-5 mt-2">
        <FontAwesomeIcon icon={faRocket} className="mr-2" />
        Get Started
      </button>
    </header>
  );
}