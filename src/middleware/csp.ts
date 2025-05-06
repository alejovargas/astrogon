export function getCSP() {
  const csp = [
    // Default policies
    "default-src 'self'",

    // Script sources
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",

    // Style sources - remove Google Fonts
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",

    // Font sources - remove Google Fonts
    "font-src 'self' data:",

    // Image sources
    "img-src 'self' data: blob:",

    // Connect sources
    "connect-src 'self' https://api.mailchannels.net https://challenges.cloudflare.com",

    // Frame sources for Turnstile - add allow-scripts
    "frame-src 'self' https://challenges.cloudflare.com",
  ].join("; ");

  return csp;
}
