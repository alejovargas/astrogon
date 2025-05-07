// For HTTP Headers (includes frame-ancestors)
export function getHeaderCSP() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.mailchannels.net https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    "frame-ancestors 'self'", // Included for HTTP Header
    "form-action 'self'",
  ].join("; ");
  return csp;
}

// For <meta> Tag (excludes frame-ancestors)
export function getMetaTagCSP() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.mailchannels.net https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com https://*.turnstile.cloudflare.com",
    // "frame-ancestors 'self'", // OMITTED for meta tag
    "form-action 'self'",
  ].join("; ");
  return csp;
}
