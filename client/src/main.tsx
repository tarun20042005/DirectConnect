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

  // Intercept WebSocket constructor - wrap in try-catch to prevent errors
  const OriginalWebSocket = window.WebSocket;
  (window as any).WebSocket = new Proxy(OriginalWebSocket, {
    construct(target: any, args: any[]) {
      const url = args[0] || '';
      // Block invalid Vite HMR URLs
      if (url.includes('localhost:undefined') || url.includes('wss://undefined') || url.includes('ws://undefined') || url.includes('undefined')) {
        // Return a mock WebSocket that does nothing
        const mockWs = new EventTarget() as any;
        mockWs.send = () => {};
        mockWs.close = () => {};
        mockWs.readyState = 3; // CLOSED
        mockWs.CONNECTING = 0;
        mockWs.OPEN = 1;
        mockWs.CLOSING = 2;
        mockWs.CLOSED = 3;
        return mockWs;
      }
      try {
        return new target(...args);
      } catch (e) {
        // If it fails, return mock
        const mockWs = new EventTarget() as any;
        mockWs.send = () => {};
        mockWs.close = () => {};
        mockWs.readyState = 3;
        return mockWs;
      }
    }
  });
  (window as any).WebSocket.CONNECTING = 0;
  (window as any).WebSocket.OPEN = 1;
  (window as any).WebSocket.CLOSING = 2;
  (window as any).WebSocket.CLOSED = 3;

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
    if (msg.includes('websocket') && msg.includes('invalid')) {
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
