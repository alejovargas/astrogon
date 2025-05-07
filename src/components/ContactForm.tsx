declare global {
  interface Window {
    turnstile?: {
      render: (selector: string, options: any) => string;
      reset: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
    onTurnstileSuccess?: (token: string) => void;
  }
}

import { useState, useEffect, useRef } from "react";

// Get the site key from environment variables
const turnstileSiteKey = "0x4AAAAAABaLZZaiNLUM39vK";

interface FormState {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm = () => {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    message: "",
    turnstileToken: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  // Load Turnstile script and set up callbacks
  useEffect(() => {
    // Remove any document.domain setting code if it exists

    // Add event listener for cross-domain communication
    const handleTurnstileMessage = (event: MessageEvent) => {
      // Only accept messages from Cloudflare domains
      if (event.origin.endsWith("cloudflare.com")) {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (data && data.type === "turnstile" && data.token) {
            console.log("Received Turnstile token via postMessage");
            setFormState((prev) => ({ ...prev, turnstileToken: data.token }));
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }
    };

    window.addEventListener("message", handleTurnstileMessage);

    // Define the Turnstile success callback
    // This needs to be on the window object for the Turnstile script to find it
    window.onTurnstileSuccess = (token: string) => {
      console.log("Turnstile verification successful");
      setFormState((prev) => ({ ...prev, turnstileToken: token }));
    };

    // Only load if not already loaded
    if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      console.log("Loading Turnstile script");
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;

      // Define the onload callback function for the script itself
      window.onloadTurnstileCallback = function () {
        console.log("Turnstile script loaded");
        setTurnstileLoaded(true);
        // The Turnstile widget will automatically render if the div is present
        // and call onTurnstileSuccess when verified.
      };

      document.head.appendChild(script);
    } else {
      // If script was already there (e.g., from another component or navigation)
      setTurnstileLoaded(true);
      // Ensure Turnstile renders if it hasn't, e.g. if window.turnstile.render is needed
      // For data-sitekey and data-callback, it should auto-initialize.
    }

    return () => {
      // Cleanup global callbacks when the component unmounts
      window.removeEventListener("message", handleTurnstileMessage);
      window.onloadTurnstileCallback = undefined;
      window.onTurnstileSuccess = undefined;
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (formState.honeypot.length > 0) {
      console.log("Bot detected: honeypot field filled");
      return true;
    }

    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formState.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formState.honeypot.length > 0) {
      console.log("Bot detected, pretending to submit form");
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus({
          success: true,
          message: "Thank you for your message. We'll be in touch soon!",
        });
      }, 1500);
      return;
    }

    if (!formState.turnstileToken) {
      setSubmitStatus({
        success: false,
        message: "Please complete the CAPTCHA verification",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      console.log("Submitting form with data:", {
        name: formState.name,
        email: formState.email,
        message: formState.message.substring(0, 20) + "...",
        turnstileToken: formState.turnstileToken.substring(0, 10) + "...",
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
          turnstileToken: formState.turnstileToken,
        }),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (response.ok) {
        // Reset form on success
        setFormState({
          name: "",
          email: "",
          message: "",
          turnstileToken: "",
          honeypot: "",
        });

        // Reset Turnstile
        if (window.turnstile) {
          window.turnstile.reset();
        }

        setSubmitStatus({
          success: true,
          message:
            data.message ||
            "Thank you for your message. We'll be in touch soon!",
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.message || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        success: false,
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {submitStatus.success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{submitStatus.message}</p>
        </div>
      ) : submitStatus.message ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{submitStatus.message}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Full Name i.e.: John Doe"
          className={`glass mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
            errors.name
              ? "border-red-500 dark:border-yellow-400"
              : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-yellow-400">
            {errors.name}
          </p>
        )}

        <input
          type="email"
          id="email"
          name="email"
          placeholder="email i.e.: john.doe@email.com"
          value={formState.email}
          onChange={handleChange}
          className={`glass mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
            errors.email
              ? "border-red-500 dark:border-yellow-400"
              : "border-gray-300"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-yellow-400">
            {errors.email}
          </p>
        )}

        <textarea
          id="message"
          name="message"
          rows={5}
          value={formState.message}
          onChange={handleChange}
          placeholder="Message i.e.: Hello, I'm interested in..."
          className={`glass mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
            errors.message
              ? "border-red-500 dark:border-yellow-400"
              : "border-gray-300"
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600 dark:text-yellow-400">
            {errors.message}
          </p>
        )}

        {/* Honeypot field - hidden from humans but visible to bots */}
        <div
          style={{
            opacity: 0,
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            height: 0,
            width: 0,
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="honeypot"
            value={formState.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Turnstile widget */}
        <div className="glass rounded-md shadow-sm pt-2 px-3 border border-gray-300 flex justify-center">
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-callback="onTurnstileSuccess"
            data-theme="light"
          ></div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-b hover:bg-opacity-20 hover:backdrop-blur-none px-4 py-2 rounded-md font-bold"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
