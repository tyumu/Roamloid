import React, { useEffect, useRef } from "react";
import { FaRobot, FaUser, FaInfoCircle } from "react-icons/fa";

export type ChatLogAuthor = "ME" | "AI" | "SYSTEM";

export type ChatLogEntry = {
  id: string;
  author: ChatLogAuthor;
  message: string;
  timestamp: string;
};

type ChatLogPanelProps = {
  entries: ChatLogEntry[];
};

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 100,
  right: 20,
  zIndex: 2,
  width: 340,
  maxHeight: 320,
  display: "flex",
  flexDirection: "column",
  padding: 16,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)",
  overflowY: "auto",
  gap: 12,
};

const entryStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 12,
  animation: "fadeInUp 0.3s ease-out",
};

const textBlockStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const messageStyle: React.CSSProperties = {
  margin: 0,
  color: "#333",
  fontSize: 14,
  lineHeight: 1.4,
  wordBreak: "break-word",
};

const timestampStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#666",
  alignSelf: "flex-end",
};

const iconWrapperStyle: React.CSSProperties = {
  width: 20,
  display: "flex",
  justifyContent: "center",
  marginTop: 2,
};

const getEntryColors = (author: ChatLogAuthor) => {
  switch (author) {
    case "ME":
      return { background: "linear-gradient(135deg, #e3f2fd, #bbdefb)", icon: "#2196f3" };
    case "AI":
      return { background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)", icon: "#4caf50" };
    default:
      return { background: "rgba(0, 0, 0, 0.05)", icon: "#9e9e9e" };
  }
};

const ChatLogPanel: React.FC<ChatLogPanelProps> = ({ entries }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [entries]);

  return (
    <div style={containerStyle} ref={containerRef}>
      {entries.map((entry) => {
        const colors = getEntryColors(entry.author);
        const IconComponent =
          entry.author === "ME" ? FaUser : entry.author === "AI" ? FaRobot : FaInfoCircle;

        return (
          <div key={entry.id} style={{ ...entryStyle, background: colors.background }}>
            <div style={iconWrapperStyle}>
              <IconComponent color={colors.icon} size={14} />
            </div>
            <div style={textBlockStyle}>
              <p style={messageStyle}>{entry.author === "SYSTEM" ? <em>{entry.message}</em> : entry.message}</p>
              <span style={timestampStyle}>{entry.timestamp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatLogPanel;
