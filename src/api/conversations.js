const API_BASE =
  import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    let message = data?.error || "Request failed";
    if (res.status === 401) message = "Session expired. Please sign in again.";
    throw new Error(message);
  }

  return data;
}

// Start (or reopen) the thread about a listing. recipientId is only needed when
// the listing has both an owner and an assigned agent and the caller must pick.
export function startConversation({ contextType, contextId, recipientId, message }) {
  return request("/conversations", {
    method: "POST",
    body: JSON.stringify({ contextType, contextId, recipientId, message }),
  });
}

export function listConversations() {
  return request("/conversations");
}

export function getConversationSummary() {
  return request("/conversations/summary");
}

export function listMessages(conversationId, { before, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return request(`/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`);
}

export function sendConversationMessage(conversationId, text) {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function markConversationRead(conversationId) {
  return request(`/conversations/${conversationId}/read`, { method: "PUT" });
}

export function archiveConversation(conversationId) {
  return request(`/conversations/${conversationId}`, { method: "DELETE" });
}

export const LISTING_PATH = {
  property: "/listings",
  accommodation: "/accommodation",
  business: "/business",
};
