import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Intercept unhandledrejection before anything else
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason);
    if (msg?.includes('WebSocket') && msg?.includes('invalid')) {
      event.preventDefault();
    }
  }, true);

  // Suppress errors at capture phase
  window.addEventListener('error', (event) => {
    if (event?.message?.includes('WebSocket') && event?.message?.includes('invalid')) {
      event.preventDefault();
      return true;
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
