const EXCLUDED_SOURCES = [
  'economist.com',
  'newyorker.com',
  'ft.com',
  'wsj.com',
  'bloomberg.com',
  'nytimes.com',
  'washingtonpost.com',
  'harpers.org',
  'theinformation.com',
  'stratechery.com',
];

const PAYWALL_URL_PATTERNS = [
  /\/subscriber/,
  /\/subscribers-only/,
  /\/paid/,
  /\/members-only/,
  /\/premium/,
  /\/pro\//,
  /\/plus\//,
];

const PAYWALL_CATEGORIES = [
  'subscriber-only',
  'members-only',
  'paid-content',
  'premium',
  'paywall',
];

const PAYWALL_HTML_MARKERS = [
  'Subscribe to continue',
  'This article is for subscribers',
  'Become a member',
];

export interface PaywallCheckResult {
  blocked: boolean;
  reason?: string;
}

export function checkUrl(url: string): PaywallCheckResult {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace('www.', '');
  } catch {
    return { blocked: false };
  }
  if (EXCLUDED_SOURCES.some((s) => hostname.includes(s))) {
    return { blocked: true, reason: `excluded source: ${hostname}` };
  }
  for (const p of PAYWALL_URL_PATTERNS) {
    if (p.test(url)) return { blocked: true, reason: `paywall URL pattern: ${p}` };
  }
  return { blocked: false };
}

export function checkCategories(categories: string[]): PaywallCheckResult {
  const lower = categories.map((c) => c.toLowerCase());
  for (const marker of PAYWALL_CATEGORIES) {
    if (lower.some((c) => c.includes(marker))) {
      return { blocked: true, reason: `paywall category: ${marker}` };
    }
  }
  return { blocked: false };
}

export function checkHtml(html: string): PaywallCheckResult {
  if (
    html.includes('"isAccessibleForFree": false') ||
    html.includes('"isAccessibleForFree":"false"')
  ) {
    return { blocked: true, reason: 'isAccessibleForFree: false in JSON-LD' };
  }
  for (const marker of PAYWALL_HTML_MARKERS) {
    if (html.includes(marker)) {
      return { blocked: true, reason: `HTML paywall marker: ${marker}` };
    }
  }
  return { blocked: false };
}
