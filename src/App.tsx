import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { AnimationClip } from "three";
import { useNavigate } from "react-router-dom";
import WarpParticles from "./components/WarpParticles";
import ChatOverlay from "./components/ChatOverlay";
import DebugMenu from "./components/DebugMenu";
import AiStatusBadge from "./components/AiStatusBadge";
import ChatLogPanel, { type ChatLogEntry } from "./components/ChatLogPanel";
import { CharacterModel } from "./components/CharacterModel";
import { useWarpControl } from "./hooks/useWarpControl";
import {
  useSocketManager,
  type JoinedPayload,
  type MovedPayload,
  type ReceivePayload,
} from "./hooks/useSocketManager";

const API_URL = "http://localhost:5000";

function FloatingObjects() {
  const torusRef = useRef<THREE.InstancedMesh>(null!);
  const boxRef = useRef<THREE.InstancedMesh>(null!);
  const sphereRef = useRef<THREE.InstancedMesh>(null!);

  const count = 45;

  const instances = useMemo(() => {
    return Array.from({ length: count }, () => {
      let x = 0;
      let z = 0;
      do {
        x = (Math.random() - 0.5) * 20;
        z = (Math.random() - 0.5) * 30;
      } while (Math.sqrt(x * x + z * z) < 1.5);

      return {
        position: new THREE.Vector3(x, Math.random() * 6 + 0.5, z),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.3 + Math.random() * 0.5,
        rotSpeed: 0.2 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const tempObject = new THREE.Object3D();

    if (torusRef.current) {
      let torusIndex = 0;
      instances.forEach((inst, i) => {
        if (i % 3 === 0) {
          tempObject.position.copy(inst.position);
          tempObject.position.y += Math.sin(t * inst.speed + inst.offset) * 0.3;
          tempObject.rotation.set(
            inst.rotation.x + t * inst.rotSpeed * 0.5,
            inst.rotation.y + t * inst.rotSpeed,
            inst.rotation.z
          );
          tempObject.scale.setScalar(inst.scale);
          tempObject.updateMatrix();
          torusRef.current.setMatrixAt(torusIndex, tempObject.matrix);
          torusIndex += 1;
        }
      });
      torusRef.current.instanceMatrix.needsUpdate = true;
    }

    if (boxRef.current) {
      let boxIndex = 0;
      instances.forEach((inst, i) => {
        if (i % 3 === 1) {
          tempObject.position.copy(inst.position);
          tempObject.position.y += Math.cos(t * inst.speed + inst.offset) * 0.35;
          tempObject.rotation.set(
            inst.rotation.x + t * inst.rotSpeed,
            inst.rotation.y + t * inst.rotSpeed,
            inst.rotation.z + t * inst.rotSpeed * 0.5
          );
          tempObject.scale.setScalar(inst.scale);
          tempObject.updateMatrix();
          boxRef.current.setMatrixAt(boxIndex, tempObject.matrix);
          boxIndex += 1;
        }
      });
      boxRef.current.instanceMatrix.needsUpdate = true;
    }

    if (sphereRef.current) {
      let sphereIndex = 0;
      instances.forEach((inst, i) => {
        if (i % 3 === 2) {
          tempObject.position.copy(inst.position);
          tempObject.position.y += Math.sin(t * inst.speed * 0.8 + inst.offset) * 0.25;
          tempObject.rotation.copy(inst.rotation);
          tempObject.scale.setScalar(inst.scale * 0.8);
          tempObject.updateMatrix();
          sphereRef.current.setMatrixAt(sphereIndex, tempObject.matrix);
          sphereIndex += 1;
        }
      });
      sphereRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={torusRef} args={[undefined, undefined, count / 3]} castShadow>
        <torusGeometry args={[0.5, 0.12, 12, 24]} />
        <meshStandardMaterial
          color="#4dd0e1"
          emissive="#4dd0e1"
          emissiveIntensity={0.05}
          metalness={0.9}
          roughness={0.2}
        />
      </instancedMesh>
      <instancedMesh ref={boxRef} args={[undefined, undefined, count / 3]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#b3e5fc"
          emissive="#4dd0e1"
          emissiveIntensity={0.03}
          metalness={0.95}
          roughness={0.1}
        />
      </instancedMesh>
      <instancedMesh ref={sphereRef} args={[undefined, undefined, count / 3]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#4dd0e1"
          emissiveIntensity={0.08}
          metalness={0.8}
          roughness={0.3}
        />
      </instancedMesh>
    </group>
  );
}

export default function App() {
  const [clipNames, setClipNames] = useState<string[]>([]);
  const [requestedAnimation, setRequestedAnimation] = useState<string | undefined>();
  const [selectedDebugOption, setSelectedDebugOption] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);

  const navigate = useNavigate();

  const {
    warpState,
    isWarping,
    characterPos,
    characterVisible,
    setCharacterVisible,
    sourceMesh,
    setSourceMesh,
    effectPosition,
    warpOutAnim,
    warpInAnim,
    triggerFullWarp,
    triggerWarpOutOnly,
    triggerWarpInOnly,
    handleWarpOutAnimationFinished,
    handleWarpOutComplete,
    handleWarpInComplete,
    handleAnimationFinished,
  } = useWarpControl({ clipNames, onRequestAnimation: setRequestedAnimation });

  const handleJoined = useCallback(
    (payload: JoinedPayload) => {
      setCharacterVisible(payload.is_ai_here);
    },
    [setCharacterVisible]
  );

  const appendChatEntry = useCallback((author: ChatLogEntry["author"], message: string) => {
    const entry: ChatLogEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatLog((prev) => [...prev, entry]);
  }, []);

  const handleReceiveData = useCallback(
    (payload: ReceivePayload) => {
      const currentDevice = myDeviceNameRef.current;
      if (payload.device_name === currentDevice) {
        return;
      }
      appendChatEntry("AI", payload.text);
      setIsChatOpen(true);
    },
    [appendChatEntry]
  );

  const myDeviceNameRef = useRef<string | null>(null);

  const handleAiMoved = useCallback(
    async (payload: MovedPayload) => {
      const deviceName = myDeviceNameRef.current;
      if (!deviceName) {
        console.warn("デバイス名が未設定のため、移動イベントを処理できません。");
        return;
      }

      const targetDevice = payload.to_device_name;
      appendChatEntry("SYSTEM", `AIが${targetDevice}に移動しました。`);
      if (warpState !== "DEFAULT") {
        console.warn(`ワープ中 (state: ${warpState}) に移動イベントを受信。無視します。`);
        return;
      }

      if (targetDevice === deviceName) {
        console.log(`AIがここ(${deviceName})に来ています...2500ms 後にワープイン`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        if (!sourceMesh) {
          console.warn("ワープインしようとしましたが、sourceMesh がまだ準備できていません");
          return;
        }
        triggerWarpInOnly();
      } else if (characterVisible) {
        if (!sourceMesh) {
          console.warn("ワープアウトしようとしましたが、sourceMesh がまだ準備できていません");
          return;
        }
        triggerWarpOutOnly();
      }
    },
    [appendChatEntry, characterVisible, sourceMesh, triggerWarpInOnly, triggerWarpOutOnly, warpState]
  );

  const { isLoading, aiLocation, myDeviceName, sendMessage } = useSocketManager({
    apiUrl: API_URL,
    onJoined: handleJoined,
    onMoved3d: handleAiMoved,
    onReceiveData: handleReceiveData,
  });

  useEffect(() => {
    myDeviceNameRef.current = myDeviceName;
  }, [myDeviceName]);

  const initialAnimation = useMemo(() => clipNames[0] ?? undefined, [clipNames]);

  const handleLoaded = useCallback((clips: AnimationClip[]) => {
    const names = clips.map((clip) => clip.name);
    setClipNames((prev) => (JSON.stringify(prev) === JSON.stringify(names) ? prev : names));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は何もしない
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!isChatOpen) {
          setIsChatOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatOpen]);

  const handleDebugSelect = useCallback(
    (value: string) => {
      setSelectedDebugOption(value);

      if (value === "loginページへ") {
        navigate("/login");
        setTimeout(() => setSelectedDebugOption(""), 100);
        return;
      }

      let handled = false;

      if (value === "ワープ (現在地 to 0,0,0)") {
        handled = triggerFullWarp();
      } else if (value === "消えるだけ (現在地)") {
        handled = triggerWarpOutOnly();
      } else if (value === "現れるだけ (at 3,0,3)") {
        handled = triggerWarpInOnly([3, 0, 3]);
      } else if (clipNames.includes(value)) {
        setRequestedAnimation(value);
        handled = true;
      }

      if (handled) {
        setTimeout(() => setSelectedDebugOption(""), 100);
      } else {
        setSelectedDebugOption("");
      }
    },
    [clipNames, navigate, triggerFullWarp, triggerWarpInOnly, triggerWarpOutOnly]
  );

  const handleSendMessage = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed) {
      return;
    }
    appendChatEntry("ME", trimmed);
    sendMessage(trimmed);
    setChatInput("");
  }, [appendChatEntry, chatInput, sendMessage]);

  const handleChatClose = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#39C5BB",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <p>Loading...</p>
        </div>
      )}

      <DebugMenu
        clipNames={clipNames}
        value={selectedDebugOption}
        isWarping={isWarping}
        onSelect={handleDebugSelect}
      />

      <AiStatusBadge isPresent={characterVisible} location={aiLocation} />

      <ChatLogPanel entries={chatLog} />

      <ChatOverlay
        isOpen={isChatOpen}
        message={chatInput}
        onMessageChange={setChatInput}
        onSubmit={handleSendMessage}
        onClose={handleChatClose}
      />

      <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
        <color attach="background" args={["#e8e8e8"]} />
        <Environment preset="city" environmentIntensity={0.5} />
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight
          position={[5, 8, 5]}
          castShadow
          intensity={0.8}
          color="#ffffff"
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.2} color="#4dd0e1" />
        <pointLight position={[5, 3, 5]} intensity={0.2} color="#80deea" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#d5d5d5" metalness={0.1} roughness={0.8} fog />
        </mesh>

        <gridHelper args={[100, 100, "#aaaaaa", "#cccccc"]} position={[0, 0, 0]} />

        <FloatingObjects />

        <Suspense fallback={null}>
          <CharacterModel
            path="/models/character/hatunemini!.glb"
            scale={1}
            animationPaths={[
              "/models/character/animation-run.glb",
              "/models/character/animation-jump.glb",
            ]}
            initialAnimation={initialAnimation}
            requestedAnimation={isWarping || warpInAnim ? undefined : requestedAnimation}
            onLoaded={handleLoaded}
            logClipsOnLoad
            position={characterPos}
            visible={characterVisible}
            onMeshReady={setSourceMesh}
            warpOutAnimation={warpOutAnim}
            warpInAnimation={warpInAnim}
            onWarpOutAnimationFinished={handleWarpOutAnimationFinished}
            onAnimationFinished={handleAnimationFinished}
          />
        </Suspense>

        {warpState === "WARP_OUT" && sourceMesh && (
          <group position={effectPosition}>
            <WarpParticles
              mesh={sourceMesh}
              mode="WARP_OUT"
              onAnimationComplete={handleWarpOutComplete}
            />
          </group>
        )}

        {warpState === "WARP_IN" && sourceMesh && (
          <group position={effectPosition}>
            <WarpParticles
              mesh={sourceMesh}
              mode="WARP_IN"
              onAnimationComplete={handleWarpInComplete}
            />
          </group>
        )}

        <OrbitControls enableDamping makeDefault />

        <EffectComposer enableNormalPass>
          <Bloom intensity={0.03} luminanceThreshold={0.99} luminanceSmoothing={0.98} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}