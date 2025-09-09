import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function SpinningBox() {
  const ref = useRef<any>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.6
      ref.current.rotation.y += delta * 0.8
    }
  })
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4cc9f0" />
    </mesh>
  )
}

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
          <SpinningBox />
        </Suspense>

        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  )
}
