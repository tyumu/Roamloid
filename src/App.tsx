import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CharacterModel } from './components'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
          {/* animationPaths にアニメだけGLB、initialAnimation にクリップ名を指定 */}
          <CharacterModel
            path="/models/character/hatunemini!.glb"
            scale={1}
            animationPaths={["/models/character/animation-run.glb", "/models/character/animation-jump.glb"]}
            initialAnimation="アクション"
            onLoaded={(clips) => {
              console.log('アニメーションクリップ名:', clips.map(c => c.name))
            }}
          />
        </Suspense>

        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  )
}
