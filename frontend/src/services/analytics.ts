// Simple Analytics Wrapper

export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  // In a real environment, this could push to PostHog, Google Analytics, or Supabase
  // Currently logging to console for MVP / Development.
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Track Event: ${eventName}`, eventProperties || {});
  }
  
  // Example PostHog integration stub:
  // if (window.posthog) {
  //   posthog.capture(eventName, eventProperties);
  // }
};

export const trackPageView = (pageName: string) => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Page View: ${pageName}`);
  }
};
