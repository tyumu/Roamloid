// src/App.tsx

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import { CharacterModel, startAIMock, AIMockHandle } from './components/CharacterModel'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'

type ReceiveData = {
  device_name: string;
  text: string;
}

// ソケットの初期化
const socket = io('http://localhost:5000', {
  autoConnect: false,
  transportOptions: {
    polling: {
      withCredentials: true
    },
    websocket: {
      withCredentials: true
    }
  }
})

function App() {
  const [modelReady, setModelReady] = useState(false)
  const [clips, setClips] = useState<string[]>([])
  const [currentClip, setCurrentClip] = useState('Idle')
  const [chatHistory, setChatHistory] = useState<{ sender: string, text: string }[]>([])
  
  // UIの表示状態を管理するState
  const [isChatVisible, setChatVisible] = useState(false)
  const [isMenuVisible, setMenuVisible] = useState(false)
  
  // 自動応答（モック）の実行状態を管理するState
  const [isAutoChatRunning, setAutoChatRunning] = useState(true)
  
  // 自動応答のon/offを制御するためのRef
  const mockHandleRef = useRef<AIMockHandle | null>(null)
  
  // ログアウト時の画面遷移用
  const navigate = useNavigate()

  // グローバルなキーボードイベントを監視
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tキーでチャット表示/非表示をトグル
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey) {
        if (document.activeElement?.tagName.toLowerCase() !== 'input') {
          e.preventDefault()
          setChatVisible(v => !v)
        }
      }
      // Escキーでメニュー表示/非表示をトグル
      if (e.key === 'Escape') {
        e.preventDefault()
        if (isChatVisible) {
          setChatVisible(false)
        } else {
          setMenuVisible(v => !v)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isChatVisible])

  // ログアウト処理
  const handleLogout = () => {
    console.log('ログアウトします')
    socket.disconnect()
    navigate('/login')
  }

  const handleMoveDevice = (deviceName: string) => {
    console.log(`${deviceName} へ移動します`)
    socket.emit('send_data', {
      device_name: 'current_device_name', 
      move: {
        to_device_name: deviceName
      }
    })
    setMenuVisible(false) 
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // server-side check for current session
        const res = await fetch('/api/auth/detail', { credentials: 'include' })
        if (!mounted) return
        if (!res.ok) {
          console.warn('サーバー上で認証されていません。ログインしてください。')
          navigate('/login')
          return
        }

        // authenticated -> connect socket and setup handlers
        socket.connect()

        socket.on('connect', () => {
          console.log('Socket.IO connected')
          socket.emit('join_room', { device_name: 'Browser ' + Date.now() })
        })

        socket.on('receive_data', (data: ReceiveData) => {
          console.log('Received data:', data)
          setChatHistory(prev => [...prev, { sender: 'Other', text: data.text }])
          // parse command:COMMAND_NAME in the message and trigger animation if present
          const match = data.text && data.text.match(/command:\s*([\w\s!-]+)/i)
          if (match && match[1]) {
            const cmd = match[1].trim()
            console.log('Detected command from socket:', cmd)
            setCurrentClip(cmd)
          }
        })

        if (isAutoChatRunning) {
          mockHandleRef.current = startAIMock((text) => {
            setChatHistory(prev => [...prev, { sender: 'AI', text }])
            // AI mock may include 'command:NAME' -> trigger animation
            const match = text && text.match(/command:\s*([\w\s!-]+)/i)
            if (match && match[1]) {
              const cmd = match[1].trim()
              console.log('Detected command from AI mock:', cmd)
              setCurrentClip(cmd)
            }
          })
          console.log('自動応答を開始しました')
        } else {
          mockHandleRef.current?.stop()
          console.log('自動応答を停止しました')
        }
      } catch (err) {
        console.error('認証チェック中にエラー:', err)
        navigate('/login')
      }
    }

    init()

    return () => {
      mounted = false
      console.log('Socket.IO disconnecting...')
      socket.disconnect()
      mockHandleRef.current?.stop()
    }
  }, [navigate, isAutoChatRunning])

  const handleLoaded = (clips: any) => {
    const names = clips.map((c: any) => c.name)
    setClips(names)
    setModelReady(true)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#333' }}>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, 5, -5]} intensity={1} />
        {/* Background: Sky + Stars for nicer environment */}
        <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0.49} azimuth={0.25} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        <Suspense fallback={null}>
          <CharacterModel
            path="/models/character/hatunemini!.glb"
            animationPaths={['/models/character/animation-jump.glb', '/models/character/animation-run.glb']}
            onLoaded={handleLoaded}
            scale={1.0}
            initialAnimation="Idle"
            requestedAnimation={currentClip}
            logClipsOnLoad
          />
        </Suspense>
        <OrbitControls />
        <gridHelper />
      </Canvas>
      
      {/* アニメーションデバッグ用UI */}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: 10, color: 'white' }}>
        <div>Ready: {modelReady ? 'OK' : 'Loading...'}</div>
        <div>
          {clips.map(name => (
            <button key={name} onClick={() => setCurrentClip(name)} style={{ background: currentClip === name ? 'red' : 'white' }}>
              {name}
            </button>
          ))}
        </div>
        <pre style={{ maxHeight: 200, overflowY: 'auto' }}>
          {chatHistory.map((msg, i) => <div key={i}>{msg.sender}: {msg.text}</div>)}
        </pre>
      </div>
      
      {/* Tキー: チャットUI */}
      {isChatVisible && (
        <div className="overlay chat-ui">
          <div className="chat-log">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender.toLowerCase()}`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input type="text" placeholder="メッセージを入力... (Enterで送信)" autoFocus />
            <button>送信</button>
          </div>
        </div>
      )}

      {/* Escキー: メインメニューUI */}
      {isMenuVisible && (
        <div className="overlay menu-ui">
          <div className="menu-content">
            <h3>メニュー</h3>
            
            <div className="menu-section">
              <h4>アバターを移動</h4>
              <p style={{fontSize: '0.8em', color: '#ccc'}}>（※現在はダミーです。今後デバイスリストを取得する機能が必要です）</p>
              <button onClick={() => handleMoveDevice('PC (Main)')}>PC (Main)</button>
              <button onClick={() => handleMoveDevice('Smartphone')}>Smartphone</button>
              <button onClick={() => handleMoveDevice('Tablet')}>Tablet</button>
            </div>
            
            <div className="menu-section">
              <h4>設定</h4>
              <button onClick={() => setAutoChatRunning(v => !v)}>
                {isAutoChatRunning ? '自動応答を OFF にする' : '自動応答を ON にする'}
              </button>
            </div>

            <div className="menu-section">
              <h4>システム</h4>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </div>

            <button onClick={() => setMenuVisible(false)} className="close-button">
              閉じる (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App