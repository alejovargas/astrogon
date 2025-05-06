// src/turnstile.d.ts
interface Window {
  turnstile?: {
    render: (container: HTMLElement | string, options: any) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
  };
  onTurnstileLoad?: () => void;
  onTurnstileSuccess?: (token: string) => void;
}
