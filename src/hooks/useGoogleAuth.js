import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE, GOOGLE_CLIENT_ID } from "../utils/constants";

/**
 * Shared hook for Google Sign-In logic.
 * @param {Object} options
 * @param {function} options.onSuccess - Called with { token, user } after successful auth and login.
 * @param {function} [options.onError] - Called with error message string.
 * @param {function} [options.validate] - Called with data before login. Throw to reject.
 * @param {boolean} [options.skipLogin] - If true, onSuccess receives data but login() is not called automatically.
 * @param {React.RefObject} [options.buttonRef] - If provided, renders a Google Sign-In button into this element.
 * @returns {{ googleLoading, googleError, setGoogleError, handleGoogleLogin, GOOGLE_CLIENT_ID }}
 */
export default function useGoogleAuth({ onSuccess, onError, validate, skipLogin, buttonRef }) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const { login } = useContext(AuthContext);

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const googleUser = JSON.parse(jsonPayload);

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      if (validate) validate(data);
      if (!skipLogin) login(data.token, data.user);
      onSuccess(data);
    } catch (err) {
      const msg = err.message || "Google authentication failed. Please try again.";
      setGoogleError(msg);
      if (onError) onError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }, [login, onSuccess, onError, validate, skipLogin]);

  const initializeGoogleSignIn = useCallback(() => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      if (buttonRef && buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: "100%",
        });
        setGoogleLoading(false);
      } else {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            setGoogleError("Google Sign-In popup was blocked. Please allow popups or use email/password.");
            setGoogleLoading(false);
          }
        });
      }
    } catch {
      setGoogleError("Google Sign-In initialization failed. Please use email/password.");
      setGoogleLoading(false);
    }
  }, [handleGoogleCredentialResponse, buttonRef]);

  const handleGoogleLogin = useCallback(() => {
    setGoogleLoading(true);
    setGoogleError("");

    try {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initializeGoogleSignIn();
        script.onerror = () => {
          setGoogleError("Failed to load Google Sign-In. Please try again or use email/password.");
          setGoogleLoading(false);
        };
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch {
      setGoogleError("Google Sign-In is not configured. Please use email/password.");
      setGoogleLoading(false);
    }
  }, [initializeGoogleSignIn]);

  return { googleLoading, googleError, setGoogleError, handleGoogleLogin, GOOGLE_CLIENT_ID };
}
