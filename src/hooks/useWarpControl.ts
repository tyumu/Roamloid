import { useCallback, useMemo, useState } from "react";
import type { Mesh } from "three";

type WarpState = "DEFAULT" | "PRE_WARP_OUT" | "WARP_OUT" | "WARP_IN";

type UseWarpControlParams = {
  clipNames: string[];
  onRequestAnimation: (name: string | undefined) => void;
};

type WarpAction = "NONE" | "WARP_IN";

type UseWarpControlReturn = {
  warpState: WarpState;
  isWarping: boolean;
  characterPos: [number, number, number];
  setCharacterPos: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  characterVisible: boolean;
  setCharacterVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sourceMesh: Mesh | null;
  setSourceMesh: (mesh: Mesh | null) => void;
  effectPosition: [number, number, number];
  warpOutAnim?: string;
  warpInAnim?: string;
  triggerFullWarp: (target?: [number, number, number]) => boolean;
  triggerWarpOutOnly: () => boolean;
  triggerWarpInOnly: (position?: [number, number, number]) => boolean;
  handleWarpOutAnimationFinished: () => void;
  handleWarpOutComplete: () => void;
  handleWarpInComplete: () => void;
  handleAnimationFinished: (clipName: string) => void;
};

const WARP_ANIMATION_NAME = "Standing Jump";
const DEFAULT_APPEAR_POSITION: [number, number, number] = [0, 0, 0];

export const useWarpControl = ({
  clipNames,
  onRequestAnimation,
}: UseWarpControlParams): UseWarpControlReturn => {
  const [warpState, setWarpState] = useState<WarpState>("DEFAULT");
  const [characterPos, setCharacterPos] = useState<[number, number, number]>([0, 0, 0]);
  const [characterVisible, setCharacterVisible] = useState<boolean>(true);
  const [sourceMesh, setSourceMeshState] = useState<Mesh | null>(null);
  const [effectPosition, setEffectPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [warpOutAnim, setWarpOutAnim] = useState<string | undefined>(undefined);
  const [warpInAnim, setWarpInAnim] = useState<string | undefined>(undefined);
  const [nextAction, setNextAction] = useState<WarpAction>("NONE");
  const [warpTargetPos, setWarpTargetPos] = useState<[number, number, number]>([0, 0, 0]);

  const isWarping = useMemo(() => warpState !== "DEFAULT", [warpState]);

  const canPlayWarpAnimation = useCallback(() => {
    if (warpState !== "DEFAULT") {
      console.warn("ワープ中のため操作できません。");
      return false;
    }
    if (!clipNames.includes(WARP_ANIMATION_NAME)) {
      console.warn(`アニメ "${WARP_ANIMATION_NAME}" がありません。`);
      return false;
    }
    return true;
  }, [clipNames, warpState]);

  const triggerFullWarp = useCallback(
    (target: [number, number, number] = DEFAULT_APPEAR_POSITION) => {
      if (!canPlayWarpAnimation()) {
        return false;
      }
      setEffectPosition(characterPos);
      setWarpTargetPos(target);
      setNextAction("WARP_IN");
      setWarpState("PRE_WARP_OUT");
      setWarpOutAnim(WARP_ANIMATION_NAME);
      return true;
    },
    [canPlayWarpAnimation, characterPos]
  );

  const triggerWarpOutOnly = useCallback(() => {
    if (!canPlayWarpAnimation()) {
      return false;
    }
    setEffectPosition(characterPos);
    setNextAction("NONE");
    setWarpState("PRE_WARP_OUT");
    setWarpOutAnim(WARP_ANIMATION_NAME);
    return true;
  }, [canPlayWarpAnimation, characterPos]);

  const triggerWarpInOnly = useCallback(
    (position: [number, number, number] = DEFAULT_APPEAR_POSITION) => {
      if (warpState !== "DEFAULT") {
        console.warn("ワープ中のため操作できません。");
        return false;
      }
      setCharacterPos(position);
      setCharacterVisible(false);
      setEffectPosition(position);
      setWarpState("WARP_IN");
      return true;
    },
    [warpState]
  );

  const handleWarpOutAnimationFinished = useCallback(() => {
    console.log("App: ワープアニメ完了。パーティクル消滅を開始 (WARP_OUT)");
    setWarpOutAnim(undefined);
    setCharacterVisible(false);
    setWarpState("WARP_OUT");
  }, []);

  const handleWarpOutComplete = useCallback(() => {
    console.log("消滅完了");
    if (nextAction === "WARP_IN") {
      console.log("...出現アニメーションへ移行");
      setCharacterPos(warpTargetPos);
      setEffectPosition(warpTargetPos);
      setWarpState("WARP_IN");
    } else {
      console.log("...ワープ停止 (非表示のまま)");
      setCharacterPos(effectPosition);
      setWarpState("DEFAULT");
    }
    setNextAction("NONE");
  }, [effectPosition, nextAction, warpTargetPos]);

  const handleWarpInComplete = useCallback(() => {
    console.log("出現完了");
    setCharacterVisible(true);
    setWarpState("DEFAULT");
    if (clipNames.includes(WARP_ANIMATION_NAME)) {
      setWarpInAnim(WARP_ANIMATION_NAME);
    }
  }, [clipNames]);

  const handleAnimationFinished = useCallback(
    (clipName: string) => {
      if (warpState !== "DEFAULT") {
        return;
      }
      if (clipName === WARP_ANIMATION_NAME) {
        if (warpInAnim === WARP_ANIMATION_NAME) {
          setWarpInAnim(undefined);
        }
        onRequestAnimation("アクション");
        console.log("デフォルトのループアニメーションへ復帰");
      }
    },
    [onRequestAnimation, warpInAnim, warpState]
  );

  const setSourceMesh = useCallback((mesh: Mesh | null) => {
    setSourceMeshState(mesh);
  }, []);

  return {
    warpState,
    isWarping,
    characterPos,
    setCharacterPos,
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
  };
};
