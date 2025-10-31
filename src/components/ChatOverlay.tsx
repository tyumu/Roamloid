import React, { useCallback } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

type ChatOverlayProps = {
  isOpen: boolean;
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const containerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  width: 420,
  maxWidth: "90vw",
  padding: "16px 20px",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(12px)",
  color: "#333",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 2,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontWeight: 600,
};

const hintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: 20,
  padding: "6px 12px",
  borderRadius: 12,
  backgroundColor: "rgba(0, 0, 0, 0.55)",
  color: "white",
  fontSize: 12,
  zIndex: 2,
};

const inputRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 16,
  border: "1px solid #d0d0d0",
  outline: "none",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  color: "#333",
  fontSize: 15,
};

const sendButtonStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  border: "none",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  background: "linear-gradient(135deg, #39C5BB, #00ACC1)",
  color: "white",
  boxShadow: "0 4px 14px rgba(57, 197, 187, 0.35)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#777",
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
};

const ChatOverlay: React.FC<ChatOverlayProps> = ({
  isOpen,
  message,
  onMessageChange,
  onSubmit,
  onClose,
}) => {
  const canSend = message.trim().length > 0;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  if (!isOpen) {
    return <div style={hintStyle}>Tキーでチャットを開く</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>チャット</span>
        <button style={closeButtonStyle} onClick={onClose} aria-label="閉じる">
          <FaTimes />
        </button>
      </div>
      <div style={inputRowStyle}>
        <input
          style={inputStyle}
          placeholder="AIにメッセージを送信..."
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          style={{
            ...sendButtonStyle,
            opacity: canSend ? 1 : 0.4,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
          onClick={onSubmit}
          aria-label="送信"
          disabled={!canSend}
        >
          <FaPaperPlane size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatOverlay;
