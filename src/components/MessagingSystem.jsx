import { useState, useEffect } from "react";
import { API_BASE } from "../utils/constants";

export default function MessagingSystem({ recipientId, recipientName, recipientType = "landlord", propertyId = null, propertyTitle = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load current user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadMessages();
  }, [recipientId]);

  const loadMessages = () => {
    const conversationKey = `messages_${recipientId}`;
    const savedMessages = localStorage.getItem(conversationKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  const saveMessages = (updatedMessages) => {
    const conversationKey = `messages_${recipientId}`;
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      senderId: currentUser._id || currentUser.id,
      senderName: currentUser.name || "You",
      recipientId,
      recipientName,
      timestamp: new Date().toISOString(),
      propertyId,
      propertyTitle,
    };

    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={styles.openBtn}
        title={`Message ${recipientName}`}
      >
        💬 Message
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <span style={styles.headerIcon}>💬</span>
          <div>
            <h3 style={styles.headerTitle}>{recipientName}</h3>
            <p style={styles.headerSubtitle}>{recipientType}</p>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
      </div>

      {/* Property Context */}
      {propertyTitle && (
        <div style={styles.propertyContext}>
          <span style={styles.propertyLabel}>Regarding:</span>
          <span style={styles.propertyTitle}>{propertyTitle}</span>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === (currentUser?._id || currentUser?.id);
            return (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  ...(isOwn ? styles.ownMessage : styles.otherMessage),
                }}
              >
                <div style={styles.messageContent}>
                  <p style={styles.messageText}>{msg.text}</p>
                  <span style={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            ...styles.sendBtn,
            opacity: newMessage.trim() ? 1 : 0.5,
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "100px",
    right: "20px",
    width: "380px",
    maxHeight: "500px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  openBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #334155",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "16px 16px 0 0",
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIcon: {
    fontSize: "1.5rem",
  },
  headerTitle: {
    color: "#f1f5f9",
    fontSize: "1rem",
    margin: 0,
    fontWeight: 600,
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    margin: "2px 0 0",
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#94a3b8",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  propertyContext: {
    padding: "12px 16px",
    background: "rgba(59, 130, 246, 0.1)",
    borderBottom: "1px solid #334155",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  propertyLabel: {
    color: "#94a3b8",
    fontSize: "0.8rem",
  },
  propertyTitle: {
    color: "#3b82f6",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "300px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: 0,
  },
  message: {
    maxWidth: "80%",
    padding: "12px 16px",
    borderRadius: "12px",
  },
  ownMessage: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    alignSelf: "flex-end",
    borderBottomRightRadius: "4px",
  },
  otherMessage: {
    background: "rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
  },
  messageContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  messageText: {
    color: "#f1f5f9",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.4,
  },
  messageTime: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.7rem",
    alignSelf: "flex-end",
  },
  inputContainer: {
    display: "flex",
    gap: "8px",
    padding: "16px",
    borderTop: "1px solid #334155",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "0 0 16px 16px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

const css = `
  .messages-container::-webkit-scrollbar {
    width: 6px;
  }
  .messages-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  .messages-container::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
`;
