export function getCSP() {
  const csp = [
    // Default policies
    "default-src 'self'",

    // Script sources
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",

    // Style sources
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",

    // Font sources
    "font-src 'self' data:",

    // Image sources
    "img-src 'self' data: blob:",

    // Connect sources - add turnstile API
    "connect-src 'self' https://api.mailchannels.net https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",

    // Frame sources for Turnstile - add sandbox permissions
    "frame-src 'self' https://challenges.cloudflare.com",

    // Add frame-ancestors directive
    "frame-ancestors 'self'",

    // Add form-action directive
    "form-action 'self'",
  ].join("; ");

  return csp;
}
