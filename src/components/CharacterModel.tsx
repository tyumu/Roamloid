import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group } from 'three'

/*
使い方例:
  <CharacterModel
    path="/models/character/character.gltf"  // public/models/ 以下に配置した glTF
    scale={1}
    onLoaded={(clips) => console.log('読み込んだアニメーションクリップ', clips.map(c => c.name))}
  />

アセットは public/models/... 配下に置くと、ビルド無しで /models/... のパスで参照できます。
*/

export interface CharacterModelProps {
  path: string
  scale?: number
  /** 初期再生したいアニメーションクリップ名。省略時は最初のクリップ */
  initialAnimation?: string
  onLoaded?: (clips: { name: string }[]) => void
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  path,
  scale = 1,
  initialAnimation,
  onLoaded
}) => {
  const group = useRef<Group>(null!)
  // useGLTF は内部でキャッシュされる
  const gltf = useGLTF(path)
  const { actions, clips, mixer } = useAnimations(gltf.animations, group)

  // 最初（または指定された）のアニメーションを再生
  useEffect(() => {
    if (!clips.length) return
    const targetName =
      initialAnimation && clips.find(c => c.name === initialAnimation)
        ? initialAnimation
        : clips[0].name
    const action = actions[targetName]
    if (action) {
      action.reset().fadeIn(0.3).play()
    }
    onLoaded?.(clips.map(c => ({ name: c.name })))
    return () => {
      if (action) action.fadeOut(0.2)
    }
  }, [actions, clips, initialAnimation, onLoaded])

  return <primitive ref={group} object={gltf.scene} scale={scale} />
}

// 必要に応じて利用側で preload する: useGLTF.preload('/models/character/hatunemini!.gltf')
