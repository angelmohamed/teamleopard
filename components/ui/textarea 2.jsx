import React from "react";

export const Textarea = ({ id, className = "", ...props }) => {
  return (
    <textarea
      id={id}
      className={`border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
};
