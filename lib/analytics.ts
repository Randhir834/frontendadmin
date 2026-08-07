// Google Analytics event tracking utilities

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-00P3F888CW', {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track admin actions
export const trackAdminAction = (action: string, details?: string) => {
  trackEvent(action, 'admin', details);
};

// Track content management
export const trackContentManagement = (action: string, contentType: string) => {
  trackEvent(action, 'content_management', contentType);
};

// Track user login
export const trackLogin = (method: string) => {
  trackEvent('login', 'user_engagement', method);
};
