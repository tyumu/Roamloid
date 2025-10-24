import React, { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { CharacterModel, startAIMock } from './components/3d/CharacterModel'
import type { AnimationClip, Group } from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'

// 浮遊するオブジェクトコンポーネント
function FloatingObjects() {
  const torusRef = useRef<THREE.InstancedMesh>(null!)
  const boxRef = useRef<THREE.InstancedMesh>(null!)
  const sphereRef = useRef<THREE.InstancedMesh>(null!)
  
  const count = 45 // インスタンス数（3の倍数にする）
  
  // 各インスタンスの初期位置とアニメーションパラメータ
  const instances = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      let x, z
      do {
        x = (Math.random() - 0.5) * 20
        z = (Math.random() - 0.5) * 30
      } while (Math.sqrt(x * x + z * z) < 1.5) // 原点から半径1.5以内は避ける
      
      return {
        position: new THREE.Vector3(
          x,
          Math.random() * 6 + 0.5,
          z
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.3 + Math.random() * 0.5,
        rotSpeed: 0.2 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2
      }
    })
  }, [count])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const tempObject = new THREE.Object3D()
    
    // トーラス
    if (torusRef.current) {
      let torusIndex = 0
      instances.forEach((inst, i) => {
        if (i % 3 === 0) {
          tempObject.position.copy(inst.position)
          tempObject.position.y += Math.sin(t * inst.speed + inst.offset) * 0.3
          tempObject.rotation.set(
            inst.rotation.x + t * inst.rotSpeed * 0.5,
            inst.rotation.y + t * inst.rotSpeed,
            inst.rotation.z
          )
          tempObject.scale.setScalar(inst.scale)
          tempObject.updateMatrix()
          torusRef.current.setMatrixAt(torusIndex, tempObject.matrix)
          torusIndex++
        }
      })
      torusRef.current.instanceMatrix.needsUpdate = true
    }
    
    // ボックス
    if (boxRef.current) {
      let boxIndex = 0
      instances.forEach((inst, i) => {
        if (i % 3 === 1) {
          tempObject.position.copy(inst.position)
          tempObject.position.y += Math.cos(t * inst.speed + inst.offset) * 0.35
          tempObject.rotation.set(
            inst.rotation.x + t * inst.rotSpeed,
            inst.rotation.y + t * inst.rotSpeed,
            inst.rotation.z + t * inst.rotSpeed * 0.5
          )
          tempObject.scale.setScalar(inst.scale)
          tempObject.updateMatrix()
          boxRef.current.setMatrixAt(boxIndex, tempObject.matrix)
          boxIndex++
        }
      })
      boxRef.current.instanceMatrix.needsUpdate = true
    }
    
    // スフィア
    if (sphereRef.current) {
      let sphereIndex = 0
      instances.forEach((inst, i) => {
        if (i % 3 === 2) {
          tempObject.position.copy(inst.position)
          tempObject.position.y += Math.sin(t * inst.speed * 0.8 + inst.offset) * 0.25
          tempObject.rotation.copy(inst.rotation)
          tempObject.scale.setScalar(inst.scale * 0.8)
          tempObject.updateMatrix()
          sphereRef.current.setMatrixAt(sphereIndex, tempObject.matrix)
          sphereIndex++
        }
      })
      sphereRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      {/* インスタンス化されたトーラス */}
      <instancedMesh ref={torusRef} args={[undefined, undefined, count / 3]} castShadow>
        <torusGeometry args={[0.5, 0.12, 12, 24]} />
        <meshStandardMaterial color="#4dd0e1" emissive="#4dd0e1" emissiveIntensity={0.05} metalness={0.9} roughness={0.2} />
      </instancedMesh>
      
      {/* インスタンス化されたボックス */}
      <instancedMesh ref={boxRef} args={[undefined, undefined, count / 3]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#b3e5fc" emissive="#4dd0e1" emissiveIntensity={0.03} metalness={0.95} roughness={0.1} />
      </instancedMesh>
      
      {/* インスタンス化されたスフィア */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, count / 3]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#4dd0e1" emissiveIntensity={0.08} metalness={0.8} roughness={0.3} />
      </instancedMesh>
    </group>
  )
}

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

  const navigate = useNavigate();
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/*デバック用メニュー*/}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
        <select onChange={(e) => { 
          const value = e.target.value;
          if (value === 'loginページへ') {
            // ログインページへの遷移処理
            navigate('/login');
          } else if (clipNames.includes(value)) {
            // アニメーションの場合の処理
            setRequestedAnimation(value);
            console.log("手動選択：" + value);
          }
        }}>
          <option value="" disabled selected>-- デバック用メニュー --</option>
          {clipNames.map(name => (
            <option key={name} value={name}>{"アニメーション：" + name}</option>
          ))}
          {/* 追加のオプション例: ログインページへ */}
          <option value="loginページへ">ログインページへ</option>
        </select>
      </div>
      {/*AI(モック)テキスト表示エリア*/}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px' }}>
        <p>{displayText}</p>
      </div>
      <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
        <color attach="background" args={['#e8e8e8']} />
        <Environment preset="city" environmentIntensity={0.5} />
        {/* Lights - トゥーン調に調整 */}
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

        {/* 無限に続く床 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#d5d5d5" 
            metalness={0.1} 
            roughness={0.8}
            fog={true}
          />
        </mesh>

        {/* グリッド（オプション） */}
        <gridHelper args={[100, 100, '#aaaaaa', '#cccccc']} position={[0, 0, 0]} />

        {/* 浮遊するオブジェクト */}
        <FloatingObjects />

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

        {/* 軽量なポストプロセッシング */}
        <EffectComposer enableNormalPass>
          <Bloom 
            intensity={0.03} 
            luminanceThreshold={0.99} 
            luminanceSmoothing={0.98}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
  }