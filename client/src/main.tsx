import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress HMR WebSocket errors in Replit environment
// These occur when Vite's HMR tries to connect with an invalid URL
if (typeof window !== 'undefined') {
  const originalAddEventListener = window.addEventListener;
  window.addEventListener('error', (event) => {
    if (event.message?.includes('WebSocket') && event.message?.includes('undefined')) {
      event.preventDefault();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebSocket') && event.reason?.message?.includes('undefined')) {
      event.preventDefault();
      return true;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
