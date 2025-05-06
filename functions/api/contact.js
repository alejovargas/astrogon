export async function onRequestPost(context) {
  try {
    // Get the request body
    const request = context.request;
    const body = await request.json();

    // Extract form data and token
    const { name, email, message, turnstileToken } = body;

    // Validate required fields
    if (!name || !email || !message || !turnstileToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify Turnstile token
    const turnstileResponse = await verifyTurnstileToken(
      turnstileToken,
      context.env.TURNSTILE_SECRET_KEY,
    );

    if (!turnstileResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "CAPTCHA verification failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Process the form submission (e.g., send an email)
    // This is where you would integrate with an email service

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

async function verifyTurnstileToken(token, secret) {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secret,
          response: token,
        }),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return { success: false, error: "Verification failed" };
  }
}
