const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

export const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-'));
};

export const initAnalytics = (): void => {
  if (initialized || !isAnalyticsEnabled()) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  // Disable default pageview so SPA route changes can be tracked manually.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  initialized = true;
};

export const trackPageView = (path: string): void => {
  if (!initialized || !isAnalyticsEnabled()) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
): void => {
  if (!initialized || !isAnalyticsEnabled()) {
    return;
  }

  window.gtag('event', eventName, params || {});
};
