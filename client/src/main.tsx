import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// CRITICAL: Suppress Vite HMR WebSocket errors in Replit environment
if (typeof window !== 'undefined') {
  // Suppress console errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = String(args[0] || '');
    if (errorStr.includes('WebSocket') || errorStr.includes('localhost:undefined')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Intercept WebSocket constructor for Vite HMR issues
  const OriginalWebSocket = window.WebSocket;
  (window as any).WebSocket = function(url: string, ...args: any[]) {
    // Block invalid Vite HMR URLs
    if (url.includes('localhost:undefined') || url.includes('wss://undefined') || url.includes('ws://undefined')) {
      // Return a mock WebSocket that does nothing
      const mockWs = new EventTarget() as any;
      mockWs.send = () => {};
      mockWs.close = () => {};
      mockWs.readyState = 3; // CLOSED
      return mockWs;
    }
    return new OriginalWebSocket(url, ...args);
  };
  (window as any).WebSocket.CONNECTING = 0;
  (window as any).WebSocket.OPEN = 1;
  (window as any).WebSocket.CLOSING = 2;
  (window as any).WebSocket.CLOSED = 3;

  // Suppress unhandledrejection events
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if ((msg.includes('WebSocket') || msg.includes('localhost:undefined')) && msg.includes('invalid')) {
      event.preventDefault();
    }
  }, true);

  // Suppress error events
  window.addEventListener('error', (event: ErrorEvent) => {
    if ((event.message || '').includes('WebSocket') && (event.message || '').includes('invalid')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
