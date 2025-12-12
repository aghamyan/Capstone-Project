const resolveApiOrigin = () => {
  // Highest priority: explicit override
  if (import.meta.env.VITE_API_ORIGIN) return import.meta.env.VITE_API_ORIGIN;

  if (typeof window !== "undefined") {
    // When running `npm run dev`, serve API from the backend on port 5001
    if (window.location.port === "4000") {
      return `http://${window.location.hostname || "localhost"}:5001`;
    }

    // In production builds, default to the same origin that served the app
    return window.location.origin;
  }

  // Server-side or unknown environment: fallback to localhost backend
  return "http://localhost:5001";
};

export const ASSET_BASE = resolveApiOrigin();
export const API_BASE = `${ASSET_BASE}/api`;
