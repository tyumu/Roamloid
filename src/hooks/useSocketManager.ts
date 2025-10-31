import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type JoinedPayload = {
  is_ai_here: boolean;
  ai_location: string | null;
};

export type MovedPayload = {
  to_device_name: string;
  text: string;
};

export type ReceivePayload = {
  device_name: string;
  msg: string;
  text: string;
};

export type UseSocketManagerParams = {
  apiUrl: string;
  deviceName: string;
  onJoined?: (payload: JoinedPayload) => void;
  onMoved3d?: (payload: MovedPayload) => void;
  onReceiveData?: (payload: ReceivePayload) => void;
};

export type UseSocketManagerReturn = {
  isLoading: boolean;
  isConnected: boolean;
  myDeviceName: string | null;
  aiLocation: string | null;
  sendMessage: (message: string) => void;
};

export const useSocketManager = ({
  apiUrl,
  deviceName,
  onJoined,
  onMoved3d,
  onReceiveData,
}: UseSocketManagerParams): UseSocketManagerReturn => {
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef(onJoined);
  const movedRef = useRef(onMoved3d);
  const receiveRef = useRef(onReceiveData);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [myDeviceName, setMyDeviceName] = useState<string | null>(null);
  const [aiLocation, setAiLocation] = useState<string | null>(null);

  useEffect(() => {
    joinedRef.current = onJoined;
  }, [onJoined]);

  useEffect(() => {
    movedRef.current = onMoved3d;
  }, [onMoved3d]);

  useEffect(() => {
    receiveRef.current = onReceiveData;
  }, [onReceiveData]);

  useEffect(() => {
    const socket = io(apiUrl, { withCredentials: true });
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      if (deviceName) {
        console.log(`Socket: "${deviceName}" としてルームに参加します...`);
        socket.emit("join_room", { device_name: deviceName });
        setMyDeviceName(deviceName);
      } else {
        console.error("Socket: デバイス名が App.tsx から渡されませんでした。");
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleJoined = (payload: JoinedPayload) => {
      setAiLocation(payload.ai_location);
      joinedRef.current?.(payload);
      setTimeout(() => setIsLoading(false), 500);
    };

    const handleMoved = (payload: MovedPayload) => {
      setAiLocation(payload.to_device_name);
      movedRef.current?.(payload);
    };

    const handleReceive = (payload: ReceivePayload) => {
      receiveRef.current?.(payload);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("joined", handleJoined);
    socket.on("moved_3d", handleMoved);
    socket.on("receive_data", handleReceive);
    socket.on("error", (err) => {
      console.error("Socket.IO エラー:", err);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("joined", handleJoined);
      socket.off("moved_3d", handleMoved);
      socket.off("receive_data", handleReceive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiUrl]);

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }
      const socket = socketRef.current;
      if (!socket || !myDeviceName) {
        return;
      }
      socket.emit("send_data", {
        device_name: myDeviceName,
        msg: trimmed,
      });
    },
    [myDeviceName]
  );

  return {
    isLoading,
    isConnected,
    myDeviceName,
    aiLocation,
    sendMessage,
  };
};
