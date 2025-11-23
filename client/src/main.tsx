import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors BEFORE anything else runs
if (typeof window !== 'undefined') {
  // Override console.error to silently catch Vite HMR errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = String(args[0] || '');
    if (errorStr.includes('WebSocket') && (errorStr.includes('undefined') || errorStr.includes('localhost:undefined'))) {
      return; // Silently ignore Vite HMR errors
    }
    originalError.apply(console, args);
  };

  // Suppress unhandledrejection events
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const msg = event.reason?.message || String(event.reason);
    if (String(msg).includes('WebSocket') && (String(msg).includes('undefined') || String(msg).includes('invalid'))) {
      event.preventDefault();
    }
  }, true);
  
  // Suppress error events
  window.addEventListener('error', (event: ErrorEvent) => {
    if (String(event.message).includes('WebSocket') && String(event.message).includes('invalid')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
