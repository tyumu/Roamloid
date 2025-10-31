import React from "react";

type DebugMenuProps = {
  clipNames: string[];
  value: string;
  isWarping: boolean;
  onSelect: (value: string) => void;
};

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 2,
};

const selectStyle: React.CSSProperties = {
  minWidth: 220,
  padding: "6px 10px",
  borderRadius: 6,
};

const DebugMenu: React.FC<DebugMenuProps> = ({ clipNames, value, isWarping, onSelect }) => {
  return (
    <div style={containerStyle}>
      <select value={value} onChange={(event) => onSelect(event.target.value)} style={selectStyle}>
        <option value="" disabled>
          -- デバック用メニュー --
        </option>
        {clipNames.map((name) => (
          <option key={name} value={name}>
            {`アニメーション：${name}`}
          </option>
        ))}
        <option value="loginページへ">ログインページへ</option>
        <option value="ワープ (現在地 to 0,0,0)" disabled={isWarping}>
          ワープ (現在地 → 0,0,0)
        </option>
        <option value="消えるだけ (現在地)" disabled={isWarping}>
          消えるだけ (現在地)
        </option>
        <option value="現れるだけ (at 3,0,3)" disabled={isWarping}>
          現れるだけ (at 3,0,3)
        </option>
      </select>
    </div>
  );
};

export default DebugMenu;
