export function getCSP() {
  const csp = [
    // Default policies
    "default-src 'self'",

    // Script sources
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",

    // Style sources - allow Google Fonts
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",

    // Font sources - explicitly allow Google Fonts
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",

    // Image sources
    "img-src 'self' data: blob:",

    // Connect sources
    "connect-src 'self' https://api.mailchannels.net https://challenges.cloudflare.com",

    // Frame sources for Turnstile - add allow-scripts
    "frame-src 'self' https://challenges.cloudflare.com",
  ].join("; ");

  return csp;
}
