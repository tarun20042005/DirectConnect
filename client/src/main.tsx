import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Override the rejection handler for WebSocket errors
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  
  // Suppress all WebSocket and Vite errors at the highest level
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'unhandledrejection' || type === 'error') {
      const wrappedListener = function(event: any) {
        const msg = String(event?.reason?.message || event?.message || '');
        if (msg.includes('WebSocket') || msg.includes('localhost:undefined')) {
          event.preventDefault?.();
          return;
        }
        return listener(event);
      };
      return originalAddEventListener.call(window, type, wrappedListener, options);
    }
    return originalAddEventListener.call(window, type, listener, options);
  };

  // Suppress unhandledrejection for WebSocket errors
  originalAddEventListener.call(window, 'unhandledrejection', (event: any) => {
    const msg = String(event?.reason?.message || event?.reason || '');
    if (msg.includes('WebSocket') || msg.includes('localhost:undefined') || msg.includes('Failed to construct')) {
      event.preventDefault?.();
    }
  }, true);

  // Suppress error events for WebSocket
  originalAddEventListener.call(window, 'error', (event: any) => {
    const msg = String(event?.message || '').toLowerCase();
    if (msg.includes('websocket')) {
      event.preventDefault?.();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
