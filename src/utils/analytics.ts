declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const isAnalyticsEnabled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

export const trackPageView = (path: string): void => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
): void => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!('event', eventName, params || {});
};
