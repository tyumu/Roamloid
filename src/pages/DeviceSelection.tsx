import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { FaPlus, FaListUl, FaSignInAlt, FaTabletAlt } from "react-icons/fa";

type Device = {
  id: string;
  name: string;
  in_3d: boolean;
};

const DeviceSelection = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [newDeviceName, setNewDeviceName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const navigate = useNavigate();

    const fetchDevices = useCallback(async () => {
        setMessage("");
        try {
            const { ok, data } = await apiFetch<{ devices: Device[] }>("/api/room/devices");
            if (ok && data.devices?.length > 0) {
                setDevices(data.devices);
                setSelectedDeviceId(data.devices[0].id); 
            } else {
                setDevices([]);
                if (!ok) setMessage((data as any)?.error_message || "デバイス一覧の取得に失敗しました。");
            }
        } catch (e) {
            console.error("デバイス一覧の取得に失敗", e);
            setMessage("通信エラーが発生しました。");
        }
    }, []);

    const handleCreateDevice = async () => {
        if (!newDeviceName.trim()) return;
        setMessage("");
        try {
            const { ok, data } = await apiFetch<Device>(`/api/room/devices`, {
                method: "POST",
                body: JSON.stringify({ name: newDeviceName.trim() }),
            });
            if (ok) {
                setNewDeviceName("");
                fetchDevices();
            } else {
                alert(`デバイスの作成に失敗しました: ${(data as any)?.error_message || "不明なエラー"}`);
            }
        } catch (e) {
            console.error("デバイス作成に失敗", e);
            alert("通信エラーが発生しました。");
        }
    };

    const handleJoinRoom = () => {
        const selectedDevice = devices.find(d => d.id === selectedDeviceId);
        if (selectedDevice) {
            navigate("/app", { state: { deviceName: selectedDevice.name } });
        } else {
            alert("参加するデバイスを選択してください。");
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    return (
        <div style={{
            minHeight: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #39C5BB 0%, #e8e8e8 140%)",
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                background: "rgba(255,255,255,0.97)",
                borderRadius: 28,
                boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
                padding: "48px 36px 36px 36px",
                maxWidth: 440,
                width: "100%",
                animation: "slideIn 0.6s cubic-bezier(.4,1.4,.6,1)",
                position: "relative",
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 24,
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, #39C5BB, #00ACC1)",
                        borderRadius: "50%",
                        width: 64,
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 18px rgba(57,197,187,0.18)",
                        marginBottom: 10,
                    }}>
                        <FaTabletAlt size={32} color="#fff" />
                    </div>
                    <h2 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#333",
                        margin: 0,
                        letterSpacing: 1,
                    }}>
                        デバイス選択
                    </h2>
                    <div style={{
                        fontSize: 15,
                        color: "#666",
                        marginTop: 8,
                        marginBottom: 0,
                        textAlign: "center",
                        lineHeight: 1.6,
                        maxWidth: 320,
                    }}>
                        参加するデバイスを選択、または新規作成してください。
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <FaPlus style={{
                            position: "absolute", left: 14, top: "50%",
                            transform: "translateY(-50%)", color: "#39C5BB"
                        }} />
                        <input
                            type="text"
                            placeholder="新規デバイス名"
                            value={newDeviceName}
                            onChange={(e) => setNewDeviceName(e.target.value)}
                            style={{
                                width: "100%", padding: "12px 12px 12px 44px",
                                borderRadius: 12, border: "1px solid #d0d0d0",
                                fontSize: 16, outline: "none", boxSizing: "border-box",
                                background: "#f7fafb",
                                transition: "border 0.2s",
                            }}
                        />
                    </div>
                    <button onClick={handleCreateDevice} style={{
                        padding: "0 20px",
                        background: "linear-gradient(135deg, #39C5BB, #00ACC1)",
                        color: "white", border: "none", borderRadius: 12,
                        fontSize: 16, fontWeight: 600, cursor: "pointer",
                        boxShadow: "0 6px 18px rgba(57, 197, 187, 0.22)",
                        transition: "background 0.2s",
                        minWidth: 72,
                    }}>
                        作成
                    </button>
                </div>
                {/* デバイスリストをカード風にリッチ表示 */}
                <div style={{
                    marginBottom: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    maxHeight: 220,
                    overflowY: "auto",
                }}>
                    {devices.length === 0 ? (
                        <div style={{
                            color: "#aaa",
                            textAlign: "center",
                            padding: "28px 0",
                            fontSize: 16,
                        }}>
                            デバイスを読み込み中...
                        </div>
                    ) : (
                        devices.map(dev => (
                            <div
                                key={dev.id}
                                onClick={() => setSelectedDeviceId(dev.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "14px 18px",
                                    borderRadius: 14,
                                    border: dev.id === selectedDeviceId
                                        ? "2px solid #39C5BB"
                                        : "1px solid #e0e0e0",
                                    background: dev.id === selectedDeviceId
                                        ? "linear-gradient(135deg, #e0f7fa 60%, #f7fafb 100%)"
                                        : "#f7fafb",
                                    boxShadow: dev.id === selectedDeviceId
                                        ? "0 4px 16px rgba(57,197,187,0.10)"
                                        : "0 2px 8px rgba(57,197,187,0.06)",
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                    position: "relative",
                                }}
                            >
                                <div style={{
                                    background: dev.in_3d
                                        ? "linear-gradient(135deg, #00ACC1, #39C5BB)"
                                        : "linear-gradient(135deg, #bdbdbd, #e0e0e0)",
                                    borderRadius: "50%",
                                    width: 36,
                                    height: 36,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 8px rgba(57,197,187,0.10)",
                                }}>
                                    <FaTabletAlt size={20} color="#fff" />
                                </div>
                                <div style={{ flex: 1, fontWeight: 600, color: "#333", fontSize: 16 }}>
                                    {dev.name}
                                </div>
                                {dev.in_3d && (
                                    <span style={{
                                        background: "linear-gradient(135deg, #00ACC1, #39C5BB)",
                                        color: "#fff",
                                        borderRadius: 8,
                                        padding: "2px 10px",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        marginLeft: 6,
                                        letterSpacing: 0.5,
                                        boxShadow: "0 1px 4px rgba(57,197,187,0.12)",
                                    }}>
                                        AI
                                    </span>
                                )}
                                {dev.id === selectedDeviceId && (
                                    <span style={{
                                        position: "absolute",
                                        right: 10,
                                        top: 10,
                                        background: "#39C5BB",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        width: 18,
                                        height: 18,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        boxShadow: "0 1px 4px rgba(57,197,187,0.18)",
                                    }}>✓</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <button onClick={handleJoinRoom} style={{
                    width: "100%", padding: "14px 0",
                    background: "linear-gradient(135deg, #39C5BB, #00ACC1)",
                    color: "white", border: "none", borderRadius: 12,
                    fontSize: 17, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 12, boxShadow: "0 6px 18px rgba(57, 197, 187, 0.22)",
                    marginBottom: 6,
                    transition: "background 0.2s",
                    letterSpacing: 1,
                }}>
                    <FaSignInAlt />
                    このデバイスで参加
                </button>
                {message && (
                    <p style={{
                        marginTop: 18, textAlign: "center",
                        color: message.includes("成功") ? "#4caf50" : "#f44336",
                        fontWeight: 600,
                        fontSize: 15,
                    }}>
                        {message}
                    </p>
                )}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                div[style*="overflow-y: auto"]::-webkit-scrollbar {
                    width: 8px;
                }
                div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
                    background: #e0f7fa;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default DeviceSelection;