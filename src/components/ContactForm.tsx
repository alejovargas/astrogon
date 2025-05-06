// src/components/ContactForm.tsx
declare global {
  interface Window {
    turnstile?: {
      render: (selector: string, options: any) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

import { useState } from "react";
import TurnstileReact from "./TurnstileReact.tsx";

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Check if honeypot field is filled (bot detected)
    if (formState.honeypot.length > 0) {
      console.log("Bot detected: honeypot field filled");
      // We'll still return true but silently mark this as a bot
      return true; // Let the form submit but we'll handle it in handleSubmit
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

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTurnstileVerify = (token: string) => {
    setFormState((prev) => ({ ...prev, turnstileToken: token }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If honeypot is filled, silently "succeed" without actually sending the form
    if (formState.honeypot.length > 0) {
      console.log("Bot detected, pretending to submit form");
      // Show success message but don't actually submit
      setIsSubmitting(true);

      // Simulate a delay to make it look real
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus({
          success: true,
          message: "Thank you for your message. We'll be in touch soon!",
        });
      }, 1500);

      return;
    }

    // Get the token from the hidden input if it's not in state
    let token = formState.turnstileToken;
    if (!token) {
      const tokenInput = document.getElementById(
        "cf-turnstile-response",
      ) as HTMLInputElement;

      if (tokenInput && tokenInput.value) {
        token = tokenInput.value;
        setFormState((prev) => ({ ...prev, turnstileToken: token }));
      } else {
        console.error("No Turnstile token found");
        setSubmitStatus({
          success: false,
          message:
            "Please complete the CAPTCHA verification. If issues persist, try refreshing the page.",
        });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      console.log("Submitting form with data:", {
        name: formState.name,
        email: formState.email,
        message: formState.message.substring(0, 20) + "...",
        turnstileToken: token ? token.substring(0, 10) + "..." : "MISSING",
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
          turnstileToken: token,
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

        // Reset Turnstile if possible
        if (window.turnstile) {
          try {
            window.turnstile.reset();
          } catch (error) {
            console.error("Error resetting Turnstile:", error);
          }
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formState.message}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

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

        {/* Connect to the Turnstile widget */}
        <TurnstileReact onVerify={handleTurnstileVerify} />

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
