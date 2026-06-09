const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 API Config:', {
    envVar: process.env.NEXT_PUBLIC_API_URL,
    finalURL: API_BASE_URL
  });
}

export default API_BASE_URL;
