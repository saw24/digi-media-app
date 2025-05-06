import axios from 'axios';

// Construct base URL using template literals for better readability
const baseURL = `${import.meta.env.VITE_AXIOS_BASE_URL}:${import.meta.env.VITE_AXIOS_PORT}${import.meta.env.VITE_PROXY_DOMAIN}`;

//console.log("axios url:",baseURL);
const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Security headers
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  withCredentials: false,  // Changed to false to allow cross-origin requests
  timeout: 30000,  // Increased timeout to 30 seconds
  validateStatus: (status) => status >= 200 && status < 500,
  // Add retry configuration
  retry: 3,
  retryDelay: (retryCount) => retryCount * 1000
});

// Add response interceptor with enhanced error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = {
      'ERR_NETWORK': 'Network Error: Unable to connect to the server',
      'ECONNABORTED': 'Request timeout - Server took too long to respond',
      'ERR_BAD_REQUEST': 'Invalid request',
      'ERR_BAD_RESPONSE': 'Server returned an invalid response',
      'ERR_CANCELED': 'Request was cancelled',
      'ERR_NOT_FOUND': 'Resource not found',
      'ERR_CONNECTION_REFUSED': 'Connection refused - Server may be down'
    };

    const message = errorMessage[error.code] || 'An unexpected error occurred';
    console.error(`API Error: ${message}`, error);

    // Enhance error object with custom properties
    const enhancedError = new Error(message);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

// Add request interceptor for handling request cancellation and retries
API.interceptors.request.use(
  (config) => {
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    // Generate a simple request ID without using crypto
    const requestId = Math.random().toString(36).substring(2) + 
                     Date.now().toString(36);
    config.headers['X-Request-ID'] = requestId;
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;