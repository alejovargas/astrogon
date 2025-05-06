import { getCSP } from "./csp";
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (
  { request, locals, cookies },
  next,
) => {
  // Get the response from the next middleware or page handler
  const response = await next();

  // Set the main CSP header
  response.headers.set("Content-Security-Policy", getCSP());

  // Set frame-ancestors as a separate CSP header
  response.headers.append("Content-Security-Policy", "frame-ancestors 'self'");

  return response;
};
