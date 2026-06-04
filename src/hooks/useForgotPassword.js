import { useState, useCallback } from "react";
import { API_BASE } from "../utils/constants";

/**
 * Shared hook for forgot-password flow.
 * @param {Object} [options]
 * @param {string} [options.endpoint] - Override the forgot-password API endpoint.
 * @returns {{ showForgot, setShowForgot, forgotEmail, setForgotEmail, forgotLoading, forgotMsg, setForgotMsg, handleForgotPassword }}
 */
export default function useForgotPassword(options = {}) {
  const endpoint = options.endpoint || `${API_BASE}/auth/forgot-password`;

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleForgotPassword = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("\u274C Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      setForgotMsg(data.message || "\u2705 Reset link sent! Check your inbox.");
    } catch {
      setForgotMsg("\u274C Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail, endpoint]);

  const resetForgotState = useCallback(() => {
    setShowForgot(false);
    setForgotEmail("");
    setForgotMsg("");
  }, []);

  return {
    showForgot,
    setShowForgot,
    forgotEmail,
    setForgotEmail,
    forgotLoading,
    forgotMsg,
    setForgotMsg,
    handleForgotPassword,
    resetForgotState,
  };
}
