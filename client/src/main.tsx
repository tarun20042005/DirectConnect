import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Vite HMR WebSocket errors in Replit environment IMMEDIATELY
if (typeof window !== 'undefined') {
  // Set up error suppression at the very first opportunity
  const suppressViteHmrErrors = (event: Event) => {
    const reason = (event as any)?.reason;
    const message = reason?.message || String(reason);
    if (message?.includes('WebSocket') && (message?.includes('undefined') || message?.includes('invalid'))) {
      event.preventDefault();
      return;
    }
  };

  // Capture phase handler - runs first
  window.addEventListener('unhandledrejection', suppressViteHmrErrors, true);
  
  // Regular error handler as backup
  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (msg.includes('WebSocket') && msg.includes('invalid')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
