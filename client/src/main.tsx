import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Suppress all Vite/WebSocket construction errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = String(args[0] || '');
    if (errorStr.includes('WebSocket') || errorStr.includes('localhost:undefined')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress WebSocket unhandledrejection events at capture phase
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if ((msg.includes('WebSocket') || msg.includes('localhost:undefined')) && msg.includes('invalid')) {
      event.preventDefault();
    }
  }, true);

  // Suppress error event for WebSocket construction failures
  window.addEventListener('error', (event: ErrorEvent) => {
    if ((event.message || '').includes('WebSocket') && (event.message || '').includes('invalid')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
