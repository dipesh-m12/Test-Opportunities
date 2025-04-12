import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <div className="font-poppins">
    <StrictMode>
      <App />
    </StrictMode>
  </div>
);
