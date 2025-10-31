import React, { useCallback } from "react";

type ChatOverlayProps = {
  isOpen: boolean;
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  width: 360,
  padding: "16px 20px",
  borderRadius: 12,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 2,
};

const hintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: 20,
  padding: "6px 12px",
  borderRadius: 8,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  color: "white",
  fontSize: 12,
  zIndex: 2,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  outline: "none",
  backgroundColor: "rgba(0,0,0,0.35)",
  color: "white",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const buttonStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 0",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const ChatOverlay: React.FC<ChatOverlayProps> = ({
  isOpen,
  message,
  onMessageChange,
  onSubmit,
  onClose,
}) => {
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
    <div style={overlayStyle}>
      <strong>Chat</strong>
      <input
        style={inputStyle}
        placeholder="メッセージを入力"
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div style={buttonRowStyle}>
        <button style={{ ...buttonStyle, backgroundColor: "#2196f3", color: "white" }} onClick={onSubmit}>
          送信
        </button>
        <button style={{ ...buttonStyle, backgroundColor: "rgba(255,255,255,0.2)", color: "white" }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default ChatOverlay;
