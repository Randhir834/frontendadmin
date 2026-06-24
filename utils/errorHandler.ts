/**
 * User-Friendly Error Handler for Frontend
 * Converts technical error messages to user-friendly messages
 */

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

/**
 * Extracts a user-friendly error message from various error formats
 */
export function getUserFriendlyError(err: unknown): string {
  // Handle null/undefined
  if (!err) {
    return 'Something went wrong. Please try again.';
  }

  const error = err as ErrorResponse;

  // If backend already provided a user-friendly message, use it
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle HTTP status codes
  const status = error.response?.status;
  if (status) {
    switch (status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'Please check your input and try again.';
      case 429:
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Something went wrong on our end. Please try again later.';
    }
  }

  // Handle network errors
  const message = error.message || '';
  const code = error.code || '';

  if (
    message.includes('ECONNREFUSED') ||
    message.includes('ENETUNREACH') ||
    code === 'ECONNREFUSED' ||
    code === 'ENETUNREACH'
  ) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (message.includes('ENOTFOUND') || code === 'ENOTFOUND') {
    return 'Unable to reach the server. Please try again later.';
  }

  if (
    message.includes('timeout') ||
    message.includes('ETIMEDOUT') ||
    code === 'ETIMEDOUT'
  ) {
    return 'The request took too long. Please try again.';
  }

  if (message.includes('Network Error') || message.includes('network')) {
    return 'Network connection problem. Please check your internet connection.';
  }

  // Don't expose technical error messages
  const technicalTerms = [
    'undefined',
    'null',
    'Cannot read',
    'Cannot access',
    'is not a function',
    'is not defined',
    'Unexpected token',
    'SyntaxError',
    'ReferenceError',
    'TypeError',
    'stack trace',
    'at Object',
    'at Function',
  ];

  const hasTechnicalTerms = technicalTerms.some((term) =>
    message.toLowerCase().includes(term.toLowerCase())
  );

  if (hasTechnicalTerms) {
    return 'Something went wrong. Please try again.';
  }

  // If message seems user-friendly (short, no code-like syntax), use it
  if (message.length > 0 && message.length < 150 && !message.includes('Error:')) {
    return message;
  }

  // Default fallback
  return 'Something went wrong. Please try again.';
}

/**
 * Logs technical error details to console (for developers)
 * Only logs in development mode
 */
export function logTechnicalError(context: string, err: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Technical Error:`, err);
  }
}
