import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LISTING_PATH,
  archiveConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendConversationMessage,
} from "../api/conversations";

const POLL_THREAD_MS = 20000;
const POLL_INBOX_MS = 30000;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const mins = Math.floor((now - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

function formatClock(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [threadConversation, setThreadConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const openedInitialThread = useRef(false);
  const lastThreadCountRef = useRef(-1);
  const myId = String(user?._id || user?.id || "");

  const loadInbox = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingInbox(true);
    try {
      const data = await listConversations();
      setConversations(data.conversations || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoadingInbox(false);
    }
  }, []);

  const loadThread = useCallback(async (id, { silent = false } = {}) => {
    if (!silent) setLoadingThread(true);
    try {
      const data = await listMessages(id);
      const nextMessages = data.messages || [];
      setMessages(nextMessages);
      setThreadConversation(data.conversation || null);
      if (nextMessages.length !== lastThreadCountRef.current) {
        lastThreadCountRef.current = nextMessages.length;
        markConversationRead(id).catch(() => {});
      }
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
      );
      if (!silent) setError("");
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, []);

  const openConversation = useCallback(
    (conv) => {
      openedInitialThread.current = true;
      lastThreadCountRef.current = -1;
      setSelectedId(conv._id);
      setSearchParams({ c: conv._id }, { replace: true });
      setMessages([]);
      loadThread(conv._id);
    },
    [loadThread, setSearchParams]
  );

  const closeConversation = useCallback(() => {
    lastThreadCountRef.current = -1;
    setSelectedId(null);
    setThreadConversation(null);
    setMessages([]);
    setSearchParams({}, { replace: true });
    loadInbox({ silent: true });
  }, [loadInbox, setSearchParams]);

  useEffect(() => {
    if (!token || user?.role === "guest") {
      navigate("/user-login", { state: { from: "/messages" } });
      return;
    }
    loadInbox();
  }, [token, user, navigate, loadInbox]);

  // Open a thread linked from a listing page (?c=<conversationId>).
  useEffect(() => {
    if (!token || openedInitialThread.current) return;
    const c = searchParams.get("c");
    if (!c) return;
    openedInitialThread.current = true;
    lastThreadCountRef.current = -1;
    setSelectedId(c);
    loadThread(c);
    loadInbox({ silent: true });
  }, [token, searchParams, loadThread, loadInbox]);

  // Live-ish updates without websockets: poll the open thread and the inbox.
  useEffect(() => {
    if (!token) return undefined;
    const inboxTimer = setInterval(() => loadInbox({ silent: true }), POLL_INBOX_MS);
    return () => clearInterval(inboxTimer);
  }, [token, loadInbox]);

  useEffect(() => {
    if (!token || !selectedId) return undefined;
    const threadTimer = setInterval(
      () => loadThread(selectedId, { silent: true }),
      POLL_THREAD_MS
    );
    return () => clearInterval(threadTimer);
  }, [token, selectedId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      const data = await sendConversationMessage(selectedId, text);
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
      setError("");
      loadInbox({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedId) return;
    if (!window.confirm("Archive this conversation? You can start it again from the listing.")) return;
    try {
      await archiveConversation(selectedId);
      setConversations((prev) => prev.filter((c) => c._id !== selectedId));
      closeConversation();
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedConvo =
    conversations.find((c) => c._id === selectedId) || null;
  const activeConversation = selectedConvo || threadConversation;
  const peerName = selectedConvo?.peer?.name || "Conversation";
  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  const filtered = searchQuery
    ? conversations.filter((c) => {
        const haystack = `${c.peer?.name || ""} ${c.contextTitle || ""}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      })
    : conversations;

  const showSidebar = !isMobile || !selectedId;
  const showChat = !isMobile || Boolean(selectedId);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h1 style={styles.title}>Messages</h1>
          <p style={styles.subtitle}>
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            {totalUnread > 0 ? ` · ${totalUnread} unread` : ""}
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.errorBar}>
          {error}
          <button style={styles.errorClose} onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <div
        style={{
          ...styles.layout,
          ...(isMobile ? styles.layoutMobile : {}),
        }}
      >
        {showSidebar && (
          <div style={{ ...styles.sidebar, ...(isMobile ? styles.sidebarMobile : {}) }}>
            <input
              style={styles.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div style={styles.sidebarScroll}>
              {loadingInbox ? (
                <div style={styles.sidebarEmpty}>
                  <p style={styles.emptyText}>Loading conversations...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div style={styles.sidebarEmpty}>
                  <p style={styles.emptyTitle}>No conversations yet</p>
                  <p style={styles.emptyText}>
                    Open a property, stay or business listing and tap Message to
                    talk directly with the owner.
                  </p>
                </div>
              ) : (
                filtered.map((convo) => (
                  <div
                    key={convo._id}
                    style={{
                      ...styles.convoItem,
                      ...(selectedId === convo._id ? styles.convoItemActive : {}),
                    }}
                    onClick={() => openConversation(convo)}
                  >
                    <div style={styles.convoAvatar}>
                      {(convo.peer?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.convoInfo}>
                      <div style={styles.convoName}>
                        {convo.peer?.name || "User"}
                      </div>
                      <div style={styles.convoContext}>
                        {convo.contextTitle || "Listing"}
                      </div>
                      <div style={styles.convoLastMsg}>
                        {convo.lastMessage || "No messages yet"}
                      </div>
                    </div>
                    <div style={styles.convoMeta}>
                      <div style={styles.convoTime}>
                        {formatTime(convo.lastMessageAt)}
                      </div>
                      {convo.unreadCount > 0 && (
                        <span style={styles.unreadBadge}>
                          {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showChat && (
          <div style={styles.chatArea}>
            {!selectedId ? (
              <div style={styles.chatEmpty}>
                <h3 style={styles.chatEmptyTitle}>Select a conversation</h3>
                <p style={styles.emptyText}>
                  Choose a conversation on the left, or message an owner from any
                  listing page.
                </p>
              </div>
            ) : (
              <>
                <div style={styles.chatHeader}>
                  {isMobile && (
                    <button style={styles.chatBackBtn} onClick={closeConversation}>
                      ←
                    </button>
                  )}
                  <div style={styles.chatHeaderAvatar}>
                    {(peerName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.chatHeaderBody}>
                    <div style={styles.chatHeaderName}>{peerName}</div>
                    {activeConversation?.contextTitle && (
                      <Link
                        to={`${LISTING_PATH[activeConversation.contextType] || "/"}/${activeConversation.contextId}`}
                        style={styles.chatHeaderListing}
                      >
                        Re: {activeConversation.contextTitle}
                      </Link>
                    )}
                  </div>
                  <button
                    style={styles.archiveBtn}
                    onClick={handleArchive}
                    title="Archive conversation"
                  >
                    Archive
                  </button>
                </div>

                <div style={styles.messageList}>
                  {loadingThread && messages.length === 0 ? (
                    <p style={styles.emptyText}>Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p style={styles.emptyText}>
                      No messages yet. Say hello to start the conversation.
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const senderId = String(msg.sender?._id || msg.sender || "");
                      const isMine = senderId === myId;
                      return (
                        <div
                          key={msg._id}
                          style={{
                            ...styles.messageBubbleWrap,
                            justifyContent: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              ...styles.messageBubble,
                              ...(isMine ? styles.myBubble : styles.theirBubble),
                            }}
                          >
                            <div style={styles.messageText}>{msg.text}</div>
                            <div style={styles.messageTime}>
                              {formatClock(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} style={styles.inputBar}>
                  <input
                    style={styles.msgInput}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    style={styles.sendBtn}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    maxWidth: 1100,
    margin: "0 auto 20px",
  },
  backBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },

  errorBar: {
    maxWidth: 1100,
    margin: "0 auto 12px",
    background: "rgba(225,29,72,0.15)",
    border: "1px solid rgba(225,29,72,0.4)",
    color: "#fecdd3",
    padding: "10px 14px",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    fontSize: "0.9rem",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#fecdd3",
    fontSize: "1.2rem",
    cursor: "pointer",
    lineHeight: 1,
  },

  layout: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    gap: 16,
    height: "calc(100vh - 160px)",
    minHeight: 400,
  },
  layoutMobile: { flexDirection: "column", height: "calc(100vh - 150px)" },

  sidebar: {
    width: 320,
    flexShrink: 0,
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarMobile: { width: "100%", flex: 1 },
  sidebarScroll: { flex: 1, overflowY: "auto" },
  searchInput: {
    padding: "12px 16px",
    background: "rgba(15,23,42,0.8)",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  },
  sidebarEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 24,
    textAlign: "center",
  },
  emptyTitle: { color: "#f1f5f9", fontWeight: 700, margin: "0 0 6px" },
  emptyText: { color: "#94a3b8", margin: 0, fontSize: "0.85rem", lineHeight: 1.5 },

  convoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "background 0.15s",
  },
  convoItemActive: { background: "rgba(251,191,36,0.1)" },
  convoAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#fbbf24",
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "1rem",
    flexShrink: 0,
  },
  convoInfo: { flex: 1, minWidth: 0 },
  convoName: {
    color: "#f1f5f9",
    fontWeight: 600,
    fontSize: "0.9rem",
    marginBottom: 1,
  },
  convoContext: {
    color: "#fbbf24",
    fontSize: "0.72rem",
    marginBottom: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convoLastMsg: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convoMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  convoTime: { color: "#64748b", fontSize: "0.7rem" },
  unreadBadge: {
    background: "#e11d48",
    color: "#fff",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.68rem",
    fontWeight: 800,
  },

  chatArea: {
    flex: 1,
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  chatEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 24,
    textAlign: "center",
  },
  chatEmptyTitle: { color: "#f1f5f9", margin: "0 0 6px" },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(15,23,42,0.5)",
  },
  chatBackBtn: {
    background: "none",
    border: "none",
    color: "#f1f5f9",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "4px 8px",
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#fbbf24",
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },
  chatHeaderBody: { flex: 1, minWidth: 0 },
  chatHeaderName: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" },
  chatHeaderListing: {
    color: "#94a3b8",
    fontSize: "0.78rem",
    textDecoration: "none",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  archiveBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#94a3b8",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: "0.78rem",
    cursor: "pointer",
    flexShrink: 0,
  },

  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  messageBubbleWrap: { display: "flex" },
  messageBubble: { maxWidth: "70%", padding: "10px 16px", borderRadius: 14 },
  myBubble: {
    background: "rgba(251,191,36,0.2)",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    background: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    lineHeight: 1.4,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  messageTime: {
    color: "#64748b",
    fontSize: "0.7rem",
    marginTop: 4,
    textAlign: "right",
  },

  inputBar: {
    display: "flex",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(15,23,42,0.5)",
  },
  msgInput: {
    flex: 1,
    padding: "12px 16px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1f2937",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};
