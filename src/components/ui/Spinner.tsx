import React from "react";

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-4 border-t-4 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};
