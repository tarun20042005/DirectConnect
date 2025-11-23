import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Vite HMR WebSocket errors in Replit environment
// These occur when Vite's HMR tries to connect with an invalid URL (localhost:undefined)
if (typeof window !== 'undefined') {
  // Capture and suppress unhandled promise rejections from Vite HMR
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    // Suppress Vite HMR connection errors with undefined port
    if (message?.includes('WebSocket') && (message?.includes('undefined') || message?.includes('localhost:undefined'))) {
      event.preventDefault();
    }
  });

  // Also suppress as error events
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (message.includes('WebSocket') && (message.includes('undefined') || message.includes('localhost:undefined'))) {
      event.preventDefault();
      return true;
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
