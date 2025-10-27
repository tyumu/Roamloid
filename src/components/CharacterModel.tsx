import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationClip, AnimationMixer, Group, LoopRepeat, LoopOnce, AnimationAction, Mesh, SkinnedMesh} from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { Points, PointMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
//aisamples.tsxの文字列を順番に通知していく
import { aiSamples } from './aisamples'
export type AIMockHandle = { stop: () => void }

export function startAIMock(onText: (text: string) => void, interval = 2500, loop = true): AIMockHandle {
  let i = 0
  const id = setInterval(() => {
    onText(aiSamples[i])
    i += 1
    if (i >= aiSamples.length) {
      if (loop) i = 0
      else clearInterval(id)
    }
  }, interval)
  console.log('AIモック開始')
  return { stop: () => clearInterval(id) }
}

type CharacterModelProps = {
  /** ベースモデル(GLB) のパス */
  path: string
  /** 追加アニメーションGLBのパス（アニメーションのみ入ったGLB想定） */
  animationPaths?: string[]
  /** 初期再生する AnimationClip 名 */
  initialAnimation?: string
  /** スケール */
  scale?: number
  /** 読み込み完了後に利用可能な AnimationClips を返す */
  onLoaded?: (clips: AnimationClip[]) => void
  /** 外部から再生指示されたクリップ名 */
  requestedAnimation?: string
  /** 読み込み完了時にクリップ名をコンソールに出力するか */
  logClipsOnLoad?: boolean
  /** App.tsxからワープ状態を制御するためのProps */
  position?: [number, number, number];
  visible?: boolean;
  /** メッシュをAppに渡すためのコールバックProps */
  onMeshReady?: (mesh: Mesh) => void;
  /** ワープ開始(消滅)時に再生するアニメーション名 */
  warpOutAnimation?: string
  /** ワープ終了(出現)時に再生するアニメーション名 */
  warpInAnimation?: string
  /** (Modelから通知) warpOutAnimation の再生が完了したことを App に通知するコールバック */
  onWarpOutAnimationFinished?: () => void
  /** アニメーション完了時のコールバック */
  onAnimationFinished?: (clipName: string) => void
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  path,
  animationPaths = [],
  initialAnimation,
  scale = 1,
  onLoaded,
  requestedAnimation,
  logClipsOnLoad = false,
  position = [0, 0, 0],
  visible = true,
  onMeshReady,
  warpInAnimation,
  warpOutAnimation,
  onWarpOutAnimationFinished,
  onAnimationFinished
}) => {
  // ベース GLB
  const baseGltf = useLoader(GLTFLoader, path)
  // 追加アニメ GLB 群
  const extraGltfs = useLoader(GLTFLoader, animationPaths) as any[]

  // 複製したシーンを保持
  const clonedSceneRef = useRef<Group | null>(null)

  // extras を安定化
  const stableExtras = useMemo(() => {
    return Array.isArray(extraGltfs)
      ? extraGltfs.filter(g => g && g.animations)
      : []
  }, [extraGltfs])

  const allAnimations: AnimationClip[] = useMemo(() => {
    const arr: AnimationClip[] = []
    if (baseGltf.animations) arr.push(...baseGltf.animations)
    stableExtras.forEach(g => arr.push(...g.animations))
    
    const nameCount: Record<string, number> = {}
    // 名前の重複を避けるため、同じ名前があれば (2), (3) ... を付与する
    arr.forEach(clip => {
      if (!nameCount[clip.name]) {
        nameCount[clip.name] = 1
      } else {
        nameCount[clip.name] += 1
        clip.name = `${clip.name} (${nameCount[clip.name]})`
      }
    })
    return arr
  }, [baseGltf.animations, stableExtras])

  const rootRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const activeActionRef = useRef<ReturnType<AnimationMixer['clipAction']> | null>(null)
  const currentClipNameRef = useRef<string | null>(null)
  // アニメーション終了監視用の state
  const [
    finishCallback,
    setFinishCallback,
  ] = useState<(() => void) | null>(null)

  // シーンの複製とmixerの初期化
  useEffect(() => {
    if (!baseGltf.scene) return

    // SkeletonUtilsでシーンを複製
    const clonedScene = clone(baseGltf.scene) as Group
    clonedSceneRef.current = clonedScene

    // メッシュを検索して App (親) に通知
    if (onMeshReady) {
      let foundMesh: Mesh | null = null
      clonedScene.traverse(object => {
        if (!foundMesh && object instanceof Mesh) {
          foundMesh = object
        }
      })
      if (foundMesh) {
        onMeshReady(foundMesh)
      } else {
        console.warn('CharacterModel: パーティクル用のメッシュが見つかりませんでした。')
      }
    }

    // rootRefに追加
    if (rootRef.current) {
      rootRef.current.clear()
      rootRef.current.add(clonedScene)
    }

    // AnimationMixerを初期化
    if (allAnimations.length > 0) {
      const mixer = new AnimationMixer(clonedScene)
      mixerRef.current = mixer

      if (logClipsOnLoad) {
        console.log('Available clips:', allAnimations.map(c => c.name))
      }
      onLoaded?.(allAnimations)

      // 初期アニメーションを再生
      if (initialAnimation) {
        const action = playAnimation(mixer, allAnimations, initialAnimation)
        if (action) {
          activeActionRef.current = action
          currentClipNameRef.current = initialAnimation
        }
      }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [baseGltf.scene, allAnimations, initialAnimation, onLoaded, logClipsOnLoad, onMeshReady])

  // requestedAnimationの変更でアニメーション切り替え
  useEffect(() => {
    // ワープ準備アニメ(finishCallback がセットされている)が再生中の場合は、通常のアニメ切り替えリクエストを無視する
    if (finishCallback) return

    if (
      mixerRef.current &&
      requestedAnimation &&
      requestedAnimation !== currentClipNameRef.current
    ) {
      const newAction = playAnimation(mixerRef.current, allAnimations, requestedAnimation, {
        prevAction: activeActionRef.current,
        crossFade: true,
      })
      if (newAction) {
        activeActionRef.current = newAction
        currentClipNameRef.current = requestedAnimation
      }
    }
  }, [requestedAnimation, allAnimations, finishCallback])

  // ワープ開始 (WARP_OUT) アニメーションのトリガー用 useEffect
  useEffect(() => {
    // App から warpOutAnimation の指示が来て、ミキサーがあり、コールバックがセットされているか？
    if (warpOutAnimation && mixerRef.current && onWarpOutAnimationFinished) {
      console.log(`CharacterModel: warpOutAnimation "${warpOutAnimation}" を再生します。`)

      // 終了時に呼び出すコールバック関数を state にセット
      // (useFrame 内で参照するため、関数をラップして渡す)
      setFinishCallback(() => onWarpOutAnimationFinished)

      const newAction = playAnimation(mixerRef.current, allAnimations, warpOutAnimation, {
        prevAction: activeActionRef.current,
        crossFade: true,
        loop: LoopOnce, // 1回だけ再生
        repetitions: 1,
      })

      if (newAction) {
        activeActionRef.current = newAction
        currentClipNameRef.current = warpOutAnimation
      }
    }
    // warpOutAnimation が undefined に戻った時は何もしない (コールバックでリセットされる)
  }, [warpOutAnimation, allAnimations, onWarpOutAnimationFinished])

  // ワープ出現 (WARP_IN) アニメーションのトリガー用 useEffect
  useEffect(() => {
    if (warpInAnimation && mixerRef.current) {
      console.log(`CharacterModel: warpInAnimation "${warpInAnimation}" を再生します。`)
      
      const newAction = playAnimation(mixerRef.current, allAnimations, warpInAnimation, {
        prevAction: activeActionRef.current,
        crossFade: true,
        loop: LoopOnce,
        repetitions: 1,
        clampWhenFinished: true,
      });

      if (newAction) {
        activeActionRef.current = newAction;
        currentClipNameRef.current = warpInAnimation;
      }
    }
  }, [warpInAnimation, allAnimations]);

// mixer の更新と、アニメーション終了イベントの監視
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)

      // アニメーション終了コールバック (finishCallback) がセットされているか？
      // (ワープアニメの終了検知: こちらを先に処理します)
      if (finishCallback) {
        // 現在のアクションが再生中で、かつループ設定ではないか？
        if (activeActionRef.current && !activeActionRef.current.isRunning()) {
          console.log(
            `CharacterModel: ワープアニメ "${currentClipNameRef.current}" が終了しました。`,
          )
          
          // App.tsx (親) に通知
          finishCallback() // onWarpOutAnimationFinished が呼ばれる
          
          // コールバックをリセット (重要: これで無限ループを防ぐ)
          setFinishCallback(null)

          // ワープアニメが終了したので、参照をクリア
          currentClipNameRef.current = null 
          activeActionRef.current = null
        }
        
        // finishCallback がある（＝ワープアニメ再生中）場合は、
        // 以下の汎用終了検知はスキップする
        return; 
      }

      // 一回再生アニメの終了検知 (汎用)
      // (finishCallback が null の場合のみ、こちらが実行されます)
      if (
        activeActionRef.current &&
        !activeActionRef.current.isRunning() &&
        currentClipNameRef.current
      ) {
        // コールバックがあれば通知
        if (onAnimationFinished) {
          onAnimationFinished(currentClipNameRef.current)
        }
        currentClipNameRef.current = null
      }
    }
  })

  const handlePointerDown = useCallback(() => {
    const newAction = playAnimation(mixerRef.current, allAnimations, 'Standing Jump', {
      loop: LoopRepeat,
      repetitions: Infinity,
      fadeDuration: 0.3,
      prevAction: activeActionRef.current,
      crossFade: true,
    })
    if (newAction) {
      activeActionRef.current = newAction
      currentClipNameRef.current = 'Standing Jump'
    }
    console.log('クリックで Standing Jump')
  }, [allAnimations])

  return (
    <group ref={rootRef} scale={scale} onPointerDown={handlePointerDown} position={position} visible={visible} />
  )
}
type PlayAnimationOptions = {
  fadeDuration?: number
  loop?: Parameters<AnimationAction['setLoop']>[0]
  repetitions?: number
  clampWhenFinished?: boolean
  /** 直前のアクション（クロスフェード用） */
  prevAction?: AnimationAction | null
  /** crossFadeFrom を使うか（true 推奨） */
  crossFade?: boolean
}
export function playAnimation(
  mixer: AnimationMixer | null,
  clips: AnimationClip[],
  name: string,
  options: PlayAnimationOptions = {}
) {
  if (!mixer) {
    console.warn('Mixer is not initialized')
    return null
  }
  
  const clip = clips.find(c => c.name === name)
  if (!clip) {
    console.warn(`Animation clip "${name}" not found. Available clips:`, clips.map(c => c.name))
    return null
  }

  const {
    fadeDuration = 0.3,
    loop = LoopRepeat,
    repetitions = Infinity,
    clampWhenFinished = false,
    prevAction = null,
    crossFade = true,
  } = options

  const action = mixer.clipAction(clip)
  
  // 1. アクションをリセット（前の再生状態をクリア）
  action.reset()
  
  // 2. ループ設定を適用
  action.setLoop(loop, repetitions)
  action.clampWhenFinished = clampWhenFinished
  
  // 3. weight を明示的に設定（初期化）
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(1)

  // 4. 前のアクションとの切り替え処理
  if (prevAction && prevAction !== action) {
    // 同じアクションでないことを確認済み
    if (crossFade) {
      // クロスフェード（推奨）: スムーズに切り替わる
      prevAction.enabled = true // 確実に有効化
      // ポーズが固定された (clamp) 状態からフェードすると描画が破綻するため、
      // フェードアウトする側 (prevAction) のクランプをここで解除します
      if (prevAction.clampWhenFinished) {
        prevAction.clampWhenFinished = false;
      }
      action.enabled = true
      action.setEffectiveWeight(1)
      action.crossFadeFrom(prevAction, fadeDuration, true) // warp=true で前のアクションを自動停止
      action.play()
    } else {
      // 手動フェード: より細かい制御が可能
      prevAction.fadeOut(fadeDuration)
      action.fadeIn(fadeDuration).play()
    }
  } else {
    // 5. 初回 or 同一アクション
    if (fadeDuration > 0 && action.weight === 0) {
      // weightが0の場合のみフェードイン
      action.fadeIn(fadeDuration)
    }
    action.play()
  }
  
  console.log(
    `Playing animation: "${name}" (loop: ${
      loop === LoopRepeat ? 'repeat' : loop === LoopOnce ? 'once' : 'unknown'
    })`,
  )

  
  return action
}