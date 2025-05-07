import { getHeaderCSP } from "./csp"; // Ensure this line imports getHeaderCSP
import type { APIContext, MiddlewareNext } from "astro"; // Updated type imports

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  // Execute the rest of the request pipeline
  const response = await next();

  // Get the CSP string intended for HTTP headers
  const csp = getHeaderCSP();

  // Set the Content-Security-Policy header
  response.headers.set("Content-Security-Policy", csp);

  // It's good practice to also set other security headers here if you're
  // managing them via middleware. If they are in public/_headers,
  // this might be redundant for static assets on Cloudflare Pages,
  // but ensures they are set for any server-handled requests.
  // Example:
  // response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // response.headers.set("X-Content-Type-Options", "nosniff");
  // response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // response.headers.set("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");

  return response;
}
