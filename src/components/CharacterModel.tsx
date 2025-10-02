import React, { useEffect, useMemo, useRef, useCallback } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationClip, AnimationMixer, Group, LoopRepeat, LoopOnce, AnimationAction } from 'three'
import { Clone } from '@react-three/drei'


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
}

/**
 * ベースモデル + 外部 GLB からアニメーションクリップを統合して再生するコンポーネント。
 * - base glb の scene を Clone し、AnimationMixer で管理
 * - animationPaths で与えた glb の animations を統合
 */
export const CharacterModel: React.FC<CharacterModelProps> = ({
  path,
  animationPaths = [],
  initialAnimation,
  scale = 1,
  onLoaded,
}) => {
  // ベース GLB
  const baseGltf = useLoader(GLTFLoader, path)
  // 追加アニメ GLB 群
  const extraGltfs = useLoader(GLTFLoader, animationPaths.length ? animationPaths : ['']) as any

  // useLoader で空文字を読ませるとエラーになるのでガード
  const extras: { animations: AnimationClip[] }[] = Array.isArray(extraGltfs)
    ? extraGltfs.filter(g => g && g.animations)
    : animationPaths.length
      ? [extraGltfs]
      : []

  const allAnimations: AnimationClip[] = useMemo(() => {
    const arr: AnimationClip[] = []
    if (baseGltf.animations) arr.push(...baseGltf.animations)
    extras.forEach(g => arr.push(...g.animations))
    // 名前重複対策: 同名があれば後勝ちにせず suffix を付与
    const nameCount: Record<string, number> = {}
    arr.forEach(clip => {
      if (!nameCount[clip.name]) {
        nameCount[clip.name] = 1
      } else {
        nameCount[clip.name] += 1
        clip.name = `${clip.name} (${nameCount[clip.name]})`
      }
    })
    return arr
  }, [baseGltf.animations, extras])

  const rootRef = useRef<Group>(null)
  const cloneGroupRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const activeActionRef = useRef<ReturnType<AnimationMixer['clipAction']> | null>(null)

  // 初回セットアップ
  useEffect(() => {
  const target = cloneGroupRef.current ?? rootRef.current
  if (!target) return
  mixerRef.current = new AnimationMixer(target)
    if (onLoaded) onLoaded(allAnimations)
  }, [allAnimations, onLoaded])

  // 初期アニメーション再生
  useEffect(() => {
    if (!initialAnimation || !mixerRef.current) return
    const clip = allAnimations.find(c => c.name === initialAnimation) || allAnimations[0]
    if (!clip) return
    const action = mixerRef.current.clipAction(clip)
    action.reset().setLoop(LoopRepeat, Infinity).play()
    activeActionRef.current = action
  }, [initialAnimation, allAnimations])

  // 毎フレーム更新
  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  const handlePointerDown = useCallback(() => {
    playAnimation(mixerRef.current, allAnimations, 'Standing Jump', {
      loop: LoopRepeat,
      repetitions: Infinity,
    })
  }, [allAnimations])

  return (
    <group ref={rootRef} scale={scale} onPointerDown={handlePointerDown}>
      <Clone ref={cloneGroupRef as any} object={baseGltf.scene} />
    </group>
  )
}
type PlayAnimationOptions = {
  fadeDuration?: number
  loop?: Parameters<AnimationAction['setLoop']>[0]
  repetitions?: number
  clampWhenFinished?: boolean
}
export function playAnimation(
  mixer: AnimationMixer | null,
  clips: AnimationClip[],
  name: string,
  options: PlayAnimationOptions = {}
) {
  if (!mixer) return null
  const clip = clips.find(c => c.name === name)
  if (!clip) return null

  const {
    fadeDuration = 0.3,
    loop = LoopRepeat,
    repetitions = Infinity,
    clampWhenFinished = false,
  } = options

  mixer.stopAllAction()
  const action = mixer.clipAction(clip)
  action.reset().setLoop(loop, repetitions)
  action.clampWhenFinished = clampWhenFinished
  if (fadeDuration > 0) action.fadeIn(fadeDuration)
  action.play()
  return action
}
