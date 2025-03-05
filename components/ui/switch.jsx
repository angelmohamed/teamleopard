import React from "react";

export const Switch = ({ checked, onCheckedChange }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckedChange}
          className="sr-only"
        />
        <div
          className={`block w-10 h-5 rounded-full ${
            checked ? "bg-blue-500" : "bg-gray-400"
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition ${
            checked ? "translate-x-5" : ""
          }`}
        ></div>
      </div>
    </label>
  );
};
