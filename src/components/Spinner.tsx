import React from "react";

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default Spinner;
