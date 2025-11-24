import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Suppress unhandledrejection events at capture phase (highest priority)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if (msg.includes('WebSocket') || msg.includes('localhost:undefined') || msg.includes('undefined')) {
      event.preventDefault();
    }
  }, true);

  // Suppress error events at capture phase
  window.addEventListener('error', (event: ErrorEvent) => {
    const msg = (event.message || '').toLowerCase();
    if (msg.includes('websocket') || msg.includes('cannot assign')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
