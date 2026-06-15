import { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function decodeGoogleCredential(credential) {
  const base64Url = credential.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export function useGoogleSignIn({ onCredential, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;
    let intervalId;

    const renderButton = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const googleUser = decodeGoogleCredential(response.credential);
              await onCredential(googleUser);
            } catch (err) {
              onError?.(err.message || "Google authentication failed");
            }
          },
          auto_select: false,
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: Math.min(400, Math.max(280, buttonRef.current.offsetWidth || 380)),
        });
        return true;
      } catch (err) {
        onError?.("Google Sign-In initialization failed. Please use email/password.");
        return false;
      }
    };

    const start = () => {
      if (renderButton()) return;
      intervalId = window.setInterval(() => {
        if (renderButton()) window.clearInterval(intervalId);
      }, 150);
    };

    if (window.google?.accounts?.id) {
      start();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", start);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = start;
        script.onerror = () => onError?.("Failed to load Google Sign-In. Use email/password instead.");
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [onCredential, onError]);

  return { buttonRef, clientId: GOOGLE_CLIENT_ID };
}

export { GOOGLE_CLIENT_ID, decodeGoogleCredential };
