import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Capture unhandled rejections BEFORE any other listeners
  window.addEventListener('unhandledrejection', (event: any) => {
    const reason = event?.reason;
    const msg = String(reason?.message || reason || '').toLowerCase();
    if (msg.includes('websocket') || msg.includes('localhost:undefined') || msg.includes('failed to construct')) {
      event.preventDefault?.();
    }
  }, true);

  // Capture errors
  window.addEventListener('error', (event: any) => {
    const msg = String(event?.message || '').toLowerCase();
    if (msg.includes('websocket') || msg.includes('localhost:undefined')) {
      event.preventDefault?.();
      return false;
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
