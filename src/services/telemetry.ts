import * as Sentry from '@sentry/react-native';

export function trackFunnelStep(step: string) {
  Sentry.addBreadcrumb({
    category: 'funnel',
    message: step,
    level: 'info',
  });
}
