import React from "react";

export const Select = ({ className = "", children, ...props }) => {
  return (
    <select
      className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
