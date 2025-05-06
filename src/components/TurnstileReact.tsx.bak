import { useEffect } from "react";

interface TurnstileReactProps {
  onVerify: (token: string) => void;
}

const TurnstileReact = ({ onVerify }: TurnstileReactProps) => {
  useEffect(() => {
    // Check if there's already a token in the input field
    const tokenInput = document.getElementById(
      "cf-turnstile-response",
    ) as HTMLInputElement;

    if (tokenInput && tokenInput.value) {
      onVerify(tokenInput.value);
    }

    // Listen for the turnstileVerified event from the Astro component
    const handleTurnstileVerified = (event: CustomEvent) => {
      if (event.detail && event.detail.token) {
        onVerify(event.detail.token);
      }
    };

    // Add event listener
    document.addEventListener(
      "turnstileVerified",
      handleTurnstileVerified as EventListener,
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "turnstileVerified",
        handleTurnstileVerified as EventListener,
      );
    };
  }, [onVerify]);

  return null; // The container is already in the DOM from the Astro component
};

export default TurnstileReact;
