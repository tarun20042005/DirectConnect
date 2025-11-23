import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit
if (typeof window !== 'undefined') {
  // Intercept and suppress Vite HMR WebSocket connection errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = String(args[0] || '');
    if (errorStr.includes('WebSocket') && errorStr.includes('undefined')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress unhandledrejection with capture phase
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (msg.includes('WebSocket') && msg.includes('undefined')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
