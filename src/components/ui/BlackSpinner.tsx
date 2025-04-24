import React from "react";

export const BlackSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-4 border-t-4 border-gray-100 border-t-slate-700 hover:border-t-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};
