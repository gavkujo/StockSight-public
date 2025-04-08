// API configuration
const config = {
  // In development, use the local server
  // In production, use the Render backend URL or environment variable
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_API_URL || 'https://stocksight-backend.onrender.com'
    : 'http://127.0.0.1:5000'
};

export default config;
