import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function MessagesPage() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversations = () => {
    const allKeys = Object.keys(localStorage).filter((k) => k.startsWith("messages_"));
    const convos = allKeys.map((key) => {
      const recipientId = key.replace("messages_", "");
      const msgs = JSON.parse(localStorage.getItem(key) || "[]");
      const lastMsg = msgs[msgs.length - 1];
      return {
        recipientId,
        recipientName: lastMsg?.recipientName || lastMsg?.senderName || "Unknown",
        lastMessage: lastMsg?.text || "",
        lastTimestamp: lastMsg?.timestamp || "",
        messageCount: msgs.length,
        propertyTitle: lastMsg?.propertyTitle || null,
      };
    }).filter((c) => c.messageCount > 0).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
    setConversations(convos);
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    // Defer state update to avoid synchronous setState in effect
    const timer = setTimeout(() => loadConversations(), 0);
    return () => clearTimeout(timer);
  }, [token, navigate]);

  const openConversation = (convo) => {
    setSelectedConversation(convo);
    const key = `messages_${convo.recipientId}`;
    const msgs = JSON.parse(localStorage.getItem(key) || "[]");
    setMessages(msgs);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    const msg = {
      id: Date.now(),
      text: newMessage.trim(),
      senderId: user?._id || user?.id,
      senderName: user?.name || "You",
      recipientId: selectedConversation.recipientId,
      recipientName: selectedConversation.recipientName,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    const key = `messages_${selectedConversation.recipientId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    setNewMessage("");
    loadConversations();
  };

  const handleDeleteConversation = (recipientId) => {
    if (!window.confirm("Delete this conversation?")) return;
    localStorage.removeItem(`messages_${recipientId}`);
    if (selectedConversation?.recipientId === recipientId) {
      setSelectedConversation(null);
      setMessages([]);
    }
    loadConversations();
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  };

  const filtered = searchQuery
    ? conversations.filter((c) => c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>Messages</h1>
          <p style={styles.subtitle}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Conversation List */}
        <div style={styles.sidebar}>
          <input
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filtered.length === 0 ? (
            <div style={styles.sidebarEmpty}>
              <span style={{ fontSize: "2rem" }}>💬</span>
              <p style={{ color: "#94a3b8", margin: "8px 0 0", fontSize: "0.85rem" }}>No conversations yet</p>
            </div>
          ) : (
            filtered.map((convo) => (
              <div
                key={convo.recipientId}
                style={{ ...styles.convoItem, ...(selectedConversation?.recipientId === convo.recipientId ? styles.convoItemActive : {}) }}
                onClick={() => openConversation(convo)}
              >
                <div style={styles.convoAvatar}>
                  {(convo.recipientName || "?").charAt(0).toUpperCase()}
                </div>
                <div style={styles.convoInfo}>
                  <div style={styles.convoName}>{convo.recipientName}</div>
                  <div style={styles.convoLastMsg}>
                    {convo.lastMessage.length > 40 ? convo.lastMessage.slice(0, 40) + "..." : convo.lastMessage}
                  </div>
                </div>
                <div style={styles.convoMeta}>
                  <div style={styles.convoTime}>{formatTime(convo.lastTimestamp)}</div>
                  <button
                    style={styles.convoDeleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(convo.recipientId); }}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {!selectedConversation ? (
            <div style={styles.chatEmpty}>
              <span style={{ fontSize: "3rem" }}>💬</span>
              <h3 style={{ color: "#f1f5f9", margin: "12px 0 4px" }}>Select a Conversation</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Choose a conversation from the left to start messaging</p>
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <button style={styles.chatBackBtn} onClick={() => setSelectedConversation(null)}>←</button>
                <div style={styles.chatHeaderAvatar}>
                  {(selectedConversation.recipientName || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.chatHeaderName}>{selectedConversation.recipientName}</div>
                  {selectedConversation.propertyTitle && (
                    <div style={styles.chatHeaderProperty}>Re: {selectedConversation.propertyTitle}</div>
                  )}
                </div>
              </div>

              <div style={styles.messageList}>
                {messages.map((msg) => {
                  const isMine = msg.senderId === (user?._id || user?.id);
                  return (
                    <div key={msg.id} style={{ ...styles.messageBubbleWrap, justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div style={{ ...styles.messageBubble, ...(isMine ? styles.myBubble : styles.theirBubble) }}>
                        <div style={styles.messageText}>{msg.text}</div>
                        <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} style={styles.inputBar}>
                <input
                  style={styles.msgInput}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" style={styles.sendBtn} disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
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
    display: "flex", alignItems: "center", gap: 20,
    maxWidth: 1100, margin: "0 auto 20px",
  },
  backBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },

  layout: {
    maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16,
    height: "calc(100vh - 160px)", minHeight: 400,
  },

  sidebar: {
    width: 320, flexShrink: 0, background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  searchInput: {
    padding: "12px 16px", background: "rgba(15,23,42,0.8)",
    border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9", fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
  },
  sidebarEmpty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 20 },
  convoItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
    cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "background 0.15s",
  },
  convoItemActive: { background: "rgba(251,191,36,0.1)" },
  convoAvatar: {
    width: 42, height: 42, borderRadius: "50%", background: "#fbbf24", color: "#1f2937",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0,
  },
  convoInfo: { flex: 1, minWidth: 0 },
  convoName: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 },
  convoLastMsg: { color: "#94a3b8", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  convoMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 },
  convoTime: { color: "#64748b", fontSize: "0.7rem" },
  convoDeleteBtn: {
    background: "none", border: "none", color: "#64748b", cursor: "pointer",
    fontSize: "1.1rem", padding: 0, lineHeight: 1,
  },

  chatArea: {
    flex: 1, background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden",
  },
  chatEmpty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 },

  chatHeader: {
    display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.5)",
  },
  chatBackBtn: {
    display: "none", background: "none", border: "none", color: "#f1f5f9", fontSize: "1.2rem", cursor: "pointer", padding: "4px 8px",
  },
  chatHeaderAvatar: {
    width: 38, height: 38, borderRadius: "50%", background: "#fbbf24", color: "#1f2937",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0,
  },
  chatHeaderName: { color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" },
  chatHeaderProperty: { color: "#94a3b8", fontSize: "0.8rem" },

  messageList: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 },
  messageBubbleWrap: { display: "flex" },
  messageBubble: { maxWidth: "70%", padding: "10px 16px", borderRadius: 14 },
  myBubble: { background: "rgba(251,191,36,0.2)", borderBottomRightRadius: 4 },
  theirBubble: { background: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 },
  messageText: { color: "#f1f5f9", fontSize: "0.9rem", lineHeight: 1.4, wordBreak: "break-word" },
  messageTime: { color: "#64748b", fontSize: "0.7rem", marginTop: 4, textAlign: "right" },

  inputBar: {
    display: "flex", gap: 10, padding: "14px 20px",
    borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.5)",
  },
  msgInput: {
    flex: 1, padding: "12px 16px", background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#f1f5f9",
    fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
  },
  sendBtn: {
    padding: "12px 24px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1f2937", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer",
    fontSize: "0.9rem",
  },
};

const css = `
  @media (max-width: 768px) {
    .messages-sidebar { display: none; }
  }
`;
