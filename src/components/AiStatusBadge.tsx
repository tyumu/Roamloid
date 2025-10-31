import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

type AiStatusBadgeProps = {
  isPresent: boolean;
  location: string | null;
};

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 20,
  left: 20,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: 20,
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  color: "#333",
  fontSize: 14,
};

const iconStyle: React.CSSProperties = {
  marginRight: 8,
  fontSize: 16,
};

const textStyle: React.CSSProperties = {
  margin: 0,
  fontWeight: 500,
};

const AiStatusBadge: React.FC<AiStatusBadgeProps> = ({ isPresent, location }) => {
  const statusText = isPresent
    ? "AIはここにいます"
    : location
    ? `AIは「${location}」にいます`
    : "AIの現在地を取得中...";

  const iconColor = isPresent ? "#39C5BB" : "#ff6b6b";

  return (
    <div style={containerStyle}>
      <FaMapMarkerAlt style={{ ...iconStyle, color: iconColor }} />
      <p style={textStyle}>{statusText}</p>
    </div>
  );
};

export default AiStatusBadge;
