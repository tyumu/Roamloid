import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CharacterModel, startAIMock } from './components/CharacterModel'
import type { AnimationClip } from 'three'

export default function App() {
  const [clipNames, setClipNames] = useState<string[]>([])
  const [requestedAnimation, setRequestedAnimation] = useState<string | undefined>(undefined)
  const [displayText, setdisplayText] = useState<string>('')
    // クリップ名が揃ったらモックを開始
  useEffect(() => {
    if (clipNames.length === 0) return
    const handle = startAIMock((text) => {
      const commandIndex = text.indexOf('command:')
      console.log("受信テキスト：" + text)
      if (commandIndex !== -1) {
        const displayText = text.substring(0, commandIndex).trim()// 表示用テキスト
        const commandText = text.substring(commandIndex + 8).trim()// command:以降のテキスト
        setdisplayText(displayText)
        setRequestedAnimation(commandText)
        console.log("コマンド認識：" + commandText)
      } else {
        setdisplayText(text)
      }
      if (clipNames.includes(text)) {
        setRequestedAnimation(text)
      }
    }, 5000, true)
    return () => handle.stop()
  }, [clipNames])

  const initialAnimation = useMemo(() => clipNames[0] ?? undefined, [clipNames])

  const handleLoaded = useCallback((clips: AnimationClip[]) => {
  const names = clips.map(c => c.name)
  setClipNames(prev => (JSON.stringify(prev) === JSON.stringify(names) ? prev : names))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/*テキスト表示エリア*/}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
        <p>{displayText}</p>
      </div>
      <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          castShadow
          intensity={1.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        <Suspense fallback={null}>
          <CharacterModel
            path="/models/character/hatunemini!.glb"
            scale={1}
            animationPaths={[
              "/models/character/animation-run.glb",
              "/models/character/animation-jump.glb"
            ]}
            initialAnimation={initialAnimation}
            requestedAnimation={requestedAnimation}
            onLoaded={handleLoaded}
            logClipsOnLoad={true}
          />
        </Suspense>

        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  )
}