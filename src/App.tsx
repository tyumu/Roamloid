import React, { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment ,Points, PointMaterial} from '@react-three/drei'
import { CharacterModel, startAIMock } from './components/CharacterModel'
import type { AnimationClip, Group ,Mesh} from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { io, Socket } from "socket.io-client";
import { FaMapMarkerAlt, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'; // アイコンライブラリ（react-icons）を追加

const API_URL = "http://localhost:5000";

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

//ワープ機能追加：WarpParticles コンポーネント
type WarpParticlesProps = {
  mesh: THREE.Mesh
  mode: 'WARP_OUT' | 'WARP_IN'
  onAnimationComplete: () => void
}

/**
 * ワープ（消滅・出現）用のパーティクルエフェクト コンポーネント
 * @param {THREE.Mesh} mesh - パーティクルの発生源（または収束先）となるメッシュ
 * @param {'WARP_OUT' | 'WARP_IN'} mode - 'WARP_OUT' (消滅) か 'WARP_IN' (出現) かを指定
 * @param {() => void} onAnimationComplete - パーティクルアニメーション完了時に呼ばれるコールバック
 */
function WarpParticles({ mesh, mode, onAnimationComplete }: WarpParticlesProps) {
  // <Points> コンポーネント（パーティクル全体）への参照
  const pointsRef = useRef<THREE.Points>(null!)
  // 生成するパーティクルの総数
  const particleCount = 2000

  // 1. パーティクルの初期計算 (useMemoでメッシュやモードが変わった時だけ実行)
  const particles = useMemo(() => {
    if (!mesh) return null // メッシュがまだ読み込まれていない場合は何もしない

    // MeshSurfaceSampler を初期化し、メッシュ表面の情報を解析
    const sampler = new MeshSurfaceSampler(mesh).build()

    // 各パーティクルの情報を格納する配列
    const tempParticles: {
      startPos: THREE.Vector3 // アニメーション開始時の位置
      endPos: THREE.Vector3 // アニメーション終了時の位置
      life: number // 寿命 (1.0 -> 0.0)
    }[] = []

    // .sample() で使う一時的な Vector3 オブジェクト (メモリ効率化のため)
    const _pos = new THREE.Vector3()
    const _normal = new THREE.Vector3()

    // particleCount の数だけパーティクルを生成
    for (let i = 0; i < particleCount; i++) {
      // sampler.sample(位置, 法線) でメッシュ表面のランダムな座標と、その地点の法線（外向きの方向）を取得
      sampler.sample(_pos, _normal)

      if (mode === 'WARP_OUT') {
        // --- 消滅モード ---
        tempParticles.push({
          startPos: _pos.clone(), // 開始位置 = メッシュ表面
          // 終了位置 = メッシュ表面から法線方向（外側）へランダムな距離だけ離れた位置
          endPos: _pos.clone().add(_normal.multiplyScalar(0.5 + Math.random() * 0.5)),
          life: 1.0, // 寿命は 1.0 (フル) からスタート
        })
      } else {
        // --- 出現モード ---
        tempParticles.push({
          // 開始位置 = メッシュ表面から法線方向（外側）へランダムな距離だけ離れた位置
          startPos: _pos.clone().add(_normal.multiplyScalar(0.5 + Math.random() * 0.5)),
          endPos: _pos.clone(), // 終了位置 = メッシュ表面
          life: 1.0, // 寿命は 1.0 (フル) からスタート
        })
      }
    }
    return tempParticles // 計算結果の配列を返す
  }, [mesh, mode])

  // 2. 毎フレームのアニメーション処理 (useFrame)
  useFrame((state, delta) => {
    // particles がまだ計算されていないか、<Points> の参照がなければ何もしない
    if (!particles || !pointsRef.current) return
    
    // <Points> の geometry から、全パーティクルの位置情報を保持する Float32Array を取得
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    // すべてのパーティクルのアニメーションが完了したかどうかのフラグ
    let allDone = true

    // 全パーティクルをループ処理
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i] // i番目のパーティクルの情報

      // 寿命がまだ残っているか？
      if (p.life > 0) {
        allDone = false // 少なくとも1つはまだ動作中
        
        // 寿命を経過時間(delta)ぶんだけ減らす (0.8 はアニメーション速度の係数)
        p.life -= delta * 0.8
        
        // 寿命を 0.0 ~ 1.0 の範囲にクランプ (マイナスにしない)
        const t = Math.max(0.0, p.life)

        // 線形補間 (lerpVectors) を使って、startPos と endPos の中間点を計算
        // t=1.0 (開始時) のとき startPos
        // t=0.0 (終了時) のとき endPos
        // (mode が 'WARP_OUT' でも 'WARP_IN' でも、この計算式で両方のアニメーションが実現できる)
        const currentPos = new THREE.Vector3().lerpVectors(p.endPos, p.startPos, t)
        
        // 計算した現在位置 (currentPos) を、positions 配列の正しい位置 (i * 3) にセット
        positions.set(currentPos.toArray(), i * 3)
      } else {
        // 寿命が尽きたパーティクルは、画面外の適当な場所 (1000, 1000, 1000) へ移動させて非表示にする
        positions.set([1000, 1000, 1000], i * 3)
      }
    }

    // positions 配列を更新したので、three.js に「要再描画」のフラグを立てる
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // もし全パーティクルの寿命が尽きていたら
    if (allDone) {
      onAnimationComplete() // 親コンポーネント (App) にアニメーション完了を通知
    }
  })

  // 3. レンダリング
  if (!particles) return null // パーティクルが計算されるまでは何も描画しない

  // useMemo で計算したパーティクルの「開始位置」だけを抜き出して、Float32Array を作成
  // これが <Points> の初期描画位置になる
  const initialPositions = new Float32Array(particles.flatMap(p => p.startPos.toArray()))

  return (
    // <Points> コンポーネントに、初期位置と ref を渡す
    <Points ref={pointsRef} positions={initialPositions}>
      {/* パーティクルの見た目を定義 */}
      <PointMaterial
        transparent // 透明を許可
        color="#00ffff" // 色 (シアン)
        size={0.03} // パーティクルのサイズ
        blending={THREE.AdditiveBlending} // 加算合成 (重なった部分が白く光るように見える)
        depthWrite={false} // 深度バッファへの書き込みをオフ (パーティクルが重なっても綺麗に見える)
      />
    </Points>
  )
}

export default function App() {
  // クリップ名リスト
  const [clipNames, setClipNames] = useState<string[]>([])
  // 再生要求されているアニメーション名
  const [requestedAnimation, setRequestedAnimation] = useState<string | undefined>(undefined)
  // AIモックからの表示テキスト
  const [displayText, setdisplayText] = useState<string>('')

  //ワープ状態管理
  const [warpState, setWarpState] = useState<'DEFAULT' | 'PRE_WARP_OUT' | 'WARP_OUT' | 'WARP_IN'>('DEFAULT')
  const [characterPos, setCharacterPos] = useState<[number, number, number]>([0, 0, 0]) // キャラクターの初期位置
  const [characterVisible, setCharacterVisible] = useState<boolean>(true); // キャラクターの表示/非表示管理 モデルデータ読み込みの為、初期値をtrueに変更
  const [sourceMesh, setSourceMesh] = useState<THREE.Mesh | null>(null)

  const [isLoading, setIsLoading] = useState(true);// ローディング画面用

  // アニメーション連携用
  const [warpOutAnim, setWarpOutAnim] = useState<string | undefined>(undefined)
  const [warpInAnim, setWarpInAnim] = useState<string | undefined>(undefined)

  // パーティクルエフェクトを再生する位置
  const [effectPosition, setEffectPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [nextAction, setNextAction] = useState<'NONE' | 'WARP_IN'>('NONE'); // 'WARP_OUT' の後に 'WARP_IN' を実行するかどうか
  const [warpTargetPos, setWarpTargetPos] = useState<[number, number, number]>([0, 0, 0]);  // 'WARP_IN' の目標地点

  const [selectedDebugOption, setSelectedDebugOption] = useState<string>("")  // デバック用セレクトの選択状態管理

  const [chatMessage, setChatMessage] = useState("");// メッセージ管理

  const [myDeviceName, setMyDeviceName] = useState<string | null>(null);// 自分のデバイス名を覚えておくための state

  const [aiLocation, setAiLocation] = useState<string | null>(null); // AIの現在地を覚えておくための state

  const [chatLog, setChatLog] = useState<{ author: "Me" | "AI" | "System", text: string }[]>([]);// チャットログ管理

  const chatLogRef = useRef<HTMLDivElement>(null);//ログの自動スクロール用

  //   // クリップ名が揃ったらモックを開始
  // useEffect(() => {
  //   if (clipNames.length === 0) return
  //   const handle = startAIMock((text) => {
  //     const commandIndex = text.indexOf('command:')
  //     console.log("受信テキスト：" + text)
  //     if (commandIndex !== -1) {
  //       const displayText = text.substring(0, commandIndex).trim()// 表示用テキスト
  //       const commandText = text.substring(commandIndex + 8).trim()// command:以降のテキスト
  //       setdisplayText(displayText)
  //       setRequestedAnimation(commandText)
  //       console.log("コマンド認識：" + commandText)
  //     } else {
  //       setdisplayText(text)
  //     }
  //     if (clipNames.includes(text)) {
  //       setRequestedAnimation(text)
  //     }
  //   }, 5000, true)
  //   return () => handle.stop()
  // }, [clipNames])

  // Socket.IO 接続の初期化
  const socketRef = useRef<Socket | null>(null);

  // 1. 接続用の useEffect (初回1回だけ実行)
  useEffect(() => {
      // クッキー付きで接続
      const newsocket = io(API_URL, {
          withCredentials: true 
      });
      socketRef.current = newsocket;

      // "connect" したら、prompt を出して、自分のデバイス名を state に保存する
      newsocket.on('connect', () => {
          console.log('Socket.IO 接続成功！ (ID:', newsocket.id, ')');
          const device_name = prompt("デバイス名を入力してください", "saba1");
          if(device_name) {
              newsocket.emit('join_room', { device_name });
              setMyDeviceName(device_name); // ← これで 2. の Effect が動く
          }
      });

      // "joined" したら、AIがここにいるか？の初期状態を state に保存する
      newsocket.on('joined', (data) => {
        console.log('ルーム参加成功:', data);
        setCharacterVisible(data.is_ai_here); // これで 2. の Effect が動く
        setAiLocation(data.ai_location);

        // ローディング画面を非表示にする前に少し待つ
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });

      // エラー系はここでOK
      newsocket.on('disconnect', () => console.log('Socket.IO 切断...'));
      newsocket.on('error', (data) => console.error('Socket.IO エラー:', data));

      // コンポーネントが閉じる時に接続を切る
      return () => {
          newsocket.disconnect();
          socketRef.current = null;
      };
  }, []); // [] なので、初回1回だけ実行

  // 2. イベント監視用の useEffect (state が新しくなるたびに再実行)
  useEffect(() => {
    const socket = socketRef.current;
    
    // まだ接続してないか、デバイス名が決まってない時は何もしない
    if (!socket || !myDeviceName) return;

    // --- (A) "moved_3d" の処理 ---
    // (この関数は useEffect の中で定義するので、常に最新の myDeviceName と characterVisible を参照できる)
    const handleMoved3D = async (data: { to_device_name: string }) => {
        console.log('AIが移動しました (moved_3d):', data);
        // チャットログにシステムメッセージを追加
        setChatLog(prevLog => [
            ...prevLog,
            { author: "System", text: `AIが ${data.to_device_name} に移動しました。` }
        ]);
        setAiLocation(data.to_device_name);// AIの現在地を更新

        // 既にワープ中 (DEFAULTじゃない) なら、この新しい `moved_3d` イベントは無視して、すぐに関数を終了する
        const targetDevice = data.to_device_name;
        if (warpState !== 'DEFAULT') {
            console.warn(
              `ワープ中 (state: ${warpState}) に新しい移動指示 (to: ${targetDevice}) を受信。無視します。`
            );
            return; // ← ここで処理を中断
        }

        if (targetDevice === myDeviceName) {
            // AIが「自分」のところに来た
            const warpDelay = 2500;
            console.log(`AIがここ(${myDeviceName})に来ています...${warpDelay}ms 後に triggerWarpIn() を実行します`);
            await new Promise(resolve => setTimeout(resolve, warpDelay));// Promise と setTimeout を使って、指定時間待つ
            if (!sourceMesh) {
                console.warn('ワープインしようとしましたが、sourceMesh がまだ準備できていません');
                return; // メッシュがないのでワープ不可
            }
            console.log("AIがここに来たので、triggerWarpIn() を実行します");
            triggerWarpIn();
        
        } else if (characterVisible) { // ← ここも最新の true/false が入る
            // AIが「自分」じゃないどこかへ行った
            if (!sourceMesh) {
                 console.warn('ワープアウトしようとしましたが、sourceMesh がまだ準備できていません');
                 return;
            }
            console.log("AIがここから去ったので、triggerWarpOut() を実行します");
            triggerWarpOut();
        }
    };
    
    // --- (B) "receive_data" の処理 ---
    const handleReceiveData = (data: { device_name: string, text: string }) => {
        console.log('データ受信 (receive_data):', data);
    };

    // (A) と (B) のリスナーを登録
    socket.on('moved_3d', handleMoved3D);
    socket.on('receive_data', handleReceiveData);

    // クリーンアップ関数 
    // (useEffect が再実行される前に、古いリスナーを解除)
    return () => {
        socket.off('moved_3d', handleMoved3D);
        socket.off('receive_data', handleReceiveData);
    };

  }, [myDeviceName, characterVisible, warpState, sourceMesh]); // state が変わるたびに再実行

  const initialAnimation = useMemo(() => clipNames[0] ?? undefined, [clipNames])

  const handleLoaded = useCallback((clips: AnimationClip[]) => {
  const names = clips.map(c => c.name)
  setClipNames(prev => (JSON.stringify(prev) === JSON.stringify(names) ? prev : names))
  }, [])

  const navigate = useNavigate();

  /** 1. 現在地から (0,0,0) へフルワープ */
  const triggerFullWarp = () => {
    if (warpState !== 'DEFAULT' || !sourceMesh) {
      console.warn('ワープ不可');
      setSelectedDebugOption("");
      return;
    }
    
    const warpAnimName = 'Standing Jump' // ワープ開始アニメ名
    if (!clipNames.includes(warpAnimName)) {
      console.warn(`アニメ "${warpAnimName}" がありません。`);
      setSelectedDebugOption("");
      return;
    }
    
    const target: [number, number, number] = [0, 0, 0];
    console.log(`フルワープ準備: ${characterPos} -> ${target}`);
    
    setEffectPosition(characterPos);  // (消滅)エフェクトは現在地で再生
    setWarpTargetPos(target);         // (出現)の目標地点をセット
    setNextAction('WARP_IN');         // 消滅後に、出現を実行するよう予約
    
    // 状態を「ワープ準備中」へ
    setWarpState('PRE_WARP_OUT');
    // アニメーションをリクエスト
    setWarpOutAnim(warpAnimName);
  };

  /** 2. 現在地で「消えるだけ」 */
  const triggerWarpOut = () => {
    if (warpState !== 'DEFAULT') {
      console.warn('ワープ不可');
      setSelectedDebugOption("");
      return;
    }
    
    const warpAnimName = 'Standing Jump' // ワープ開始アニメ名
    if (!clipNames.includes(warpAnimName)) {
      console.warn(`アニメ "${warpAnimName}" がありません。`);
      setSelectedDebugOption("");
      return;
    }
    
    console.log(`消滅準備: ${characterPos}`);

    setEffectPosition(characterPos); // (消滅)エフェクトは現在地で再生
    setNextAction('NONE');            // 消滅後に何もしないよう設定
    
    // 状態を「ワープ準備中」へ
    setWarpState('PRE_WARP_OUT');
    // アニメーションをリクエスト
    setWarpOutAnim(warpAnimName);
  };

  /** 3. 指定した位置 (例: 3,0,3) で「現れるだけ」 */
  const triggerWarpIn = () => {
    if (warpState !== 'DEFAULT') {
      console.warn('ワープ不可');
      setSelectedDebugOption("");
      return;
    }

    const appearPos: [number, number, number] = [0, 0, 0]; // ここで出現位置を指定
    console.log(`出現実行: ${appearPos}`);

    // キャラクターを(非表示のまま)出現位置へ移動
    setCharacterPos(appearPos);
    setCharacterVisible(false);
    
    setEffectPosition(appearPos); // (出現)エフェクトを出現位置で再生
    setWarpState('WARP_IN');      // 出現アニメーション開始
  };

  /** (Modelから) ワープ開始アニメーションが完了したときの処理 */
  const onWarpOutAnimationFinished = () => {
    console.log('App: ワープアニメ完了。パーティクル消滅を開始 (WARP_OUT)');

    // アニメーションが完了したので、トリガー用の state をリセット
    setWarpOutAnim(undefined);

    // ここでキャラクターを非表示にする
    setCharacterVisible(false); 
    
    // パーティクルアニメーション (WARP_OUT) を開始
    setWarpState('WARP_OUT');
  };

  /** 消滅 (WARP_OUT) が完了したときの処理 */
  const handleWarpOutComplete = () => {
    console.log('消滅完了');
    if (nextAction === 'WARP_IN') {
      console.log('...出現アニメーションへ移行');
      setCharacterPos(warpTargetPos);
      setEffectPosition(warpTargetPos);
      setWarpState('WARP_IN');
    } else {
      console.log('...ワープ停止 (非表示のまま)');
      setCharacterPos(effectPosition); 
      setWarpState('DEFAULT'); // 状態をリセット
      setSelectedDebugOption(""); // select をリセット
    }
    setNextAction('NONE');
  };

  /** 出現 (WARP_IN) が完了したときの処理 */
  const handleWarpInComplete = () => {
    console.log('出現完了');
    setCharacterVisible(true); // キャラクターを表示
    setWarpState('DEFAULT');      // 状態をリセット
    setSelectedDebugOption(""); // select メニューをリセット

    const appearAnimName = 'Standing Jump'; // 出現後のアニメ名
    if (clipNames.includes(appearAnimName)) {
      setWarpInAnim(appearAnimName);
    }
  };
  // ワープ中かどうかの判定フラグ
  const isWarping = warpState !== 'DEFAULT';

  //warpstate === 'DEFAULT' (ワープしていない)時に'Standing Jump'が一回再生ならデフォルトアニメへ復帰
  const handleAnimationFinished = useCallback((clipName: string) => {
    if (warpState === 'DEFAULT') {
      if (clipName === 'Standing Jump') {
        // もしそれが warpInAnim (出現アニメ) だった場合は、
        // アニメが完了したのでトリガーをリセットする
        if (warpInAnim === 'Standing Jump') {
          setWarpInAnim(undefined);
        }
        setRequestedAnimation('アクション') // ループアニメ名
        console.log('デフォルトのループアニメーションへ復帰');
      }
    }
  }, [warpState, warpInAnim]);

  // メッセージ送信ハンドラ
  const handleSendMessage = () => {
    if (chatMessage && socketRef.current) {
        const myMessage = { author: "Me" as const, text: chatMessage };
        setChatLog(prevLog => [...prevLog, myMessage]);

        // バックエンド (handle_send_data) にメッセージを送信
        socketRef.current.emit('send_data', {
            device_name: myDeviceName,
            msg: chatMessage
        });
        setChatMessage(""); // 入力欄をクリア
    }
  };
  // チャットログが更新されるたびにスクロールを一番下に移動させる
  useEffect(() => {
    if (chatLogRef.current) {
      setTimeout(() => {
        if (chatLogRef.current) {
          // .current (div) の一番下 (scrollHeight) までスクロールさせる
          chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [chatLog]);
  return (
    <div style={{ width: '100vw', height: '100vh', fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #39C5BB 0%, #e8e8e8 100%)' }}>
      {/* ローディング画面をアニメーション付きモーダルに変更 */}
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #39C5BB 80%,#373b3e 60%, #e12885 100%)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <div style={{
            width: '50px', height: '50px',
            border: '4px solid #ffffff', // 半透明を避け、不透明な白に変更
            borderTop: '4px solid #39C5BB', // アクセントにミク色を使用
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* チャット入力エリアを洗練されたカードスタイルに変更 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '25px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
        maxWidth: '90vw',
        width: '400px'
      }}>
        <input 
          type="text" 
          value={chatMessage} 
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="AIにメッセージを送信..."
          style={{
            flex: 1,
            background: 'transparent',
            color: '#333',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 12px',
            fontSize: '16px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!chatMessage.trim()}
          style={{
            background: chatMessage.trim() ? 'linear-gradient(135deg, #39C5BB, #00ACC1)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: chatMessage.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(57,197,187,0.3)'
          }}
          onMouseEnter={(e) => { if (chatMessage.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { if (chatMessage.trim()) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FaPaperPlane size={16} />
        </button>
      </div>

      {/* AIの現在地表示をアイコン付きバッジに変更 */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#333',
        animation: 'slideInLeft 0.5s ease-out'
      }}>
        <FaMapMarkerAlt style={{ marginRight: '8px', color: characterVisible ? '#39C5BB' : '#ff6b6b' }} />
        <span>{characterVisible ? "AIはここにいます" : `AIは「${aiLocation}」にいます`}</span>
        <style>{`
          @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>
      </div>
      
      {/* チャットログ表示エリアをメッセージカード形式に改良 */}
      <div
        ref={chatLogRef} 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          width: '350px',
          height: '300px',
          overflowY: 'auto',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s',
          scrollbarWidth: 'thin',
          scrollbarColor: '#39C5BB #f0f0f0'
        }}
      >
        <div>
          {chatLog.map((msg, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: msg.author === 'Me' ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' : msg.author === 'AI' ? 'linear-gradient(135deg, #e8f5e8, #c8e6c9)' : 'rgba(0,0,0,0.05)',
              animation: 'fadeInUp 0.3s ease-out'
            }}>
              <div style={{ marginRight: '8px', marginTop: '2px' }}>
                {msg.author === 'Me' ? <FaUser color="#2196f3" /> : msg.author === 'AI' ? <FaRobot color="#4caf50" /> : <FaMapMarkerAlt color="#9e9e9e" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                  {msg.author === "System" ? <em>{msg.text}</em> : msg.text}
                </p>
                <small style={{ color: '#666', fontSize: '12px' }}>{new Date().toLocaleTimeString()}</small>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 10px; }
          ::-webkit-scrollbar-thumb { background: #39C5BB; border-radius: 10px; }
        `}</style>
      </div>

      <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
        <color attach="background" args={['#f5f5f5']} /> {/* UIと調和させるために背景色を変更 */}
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
            // ワープ中は通常のアニメーションリクエストを止める
            requestedAnimation={(isWarping || warpInAnim) ? undefined : requestedAnimation}
            onLoaded={handleLoaded}
            logClipsOnLoad={true}
            position={characterPos}
            visible={characterVisible}
            onMeshReady={setSourceMesh}
            warpOutAnimation={warpOutAnim}
            warpInAnimation={warpInAnim}
            onWarpOutAnimationFinished={onWarpOutAnimationFinished}
            onAnimationFinished={handleAnimationFinished}
          />
        </Suspense>
        {/* パーティクル表示位置を 'effectPosition' に統一 */}
        {warpState === 'WARP_OUT' && sourceMesh && (
          <group position={effectPosition}> {/* A地点(動的)にエフェクトを配置 */}
            <WarpParticles
              mesh={sourceMesh}
              mode="WARP_OUT"
              onAnimationComplete={handleWarpOutComplete}
            />
          </group>
        )}
        {warpState === 'WARP_IN' && sourceMesh && (
          <group position={effectPosition}> {/* B地点(動的)にエフェクトを配置 */}
            <WarpParticles
              mesh={sourceMesh}
              mode="WARP_IN"
              onAnimationComplete={handleWarpInComplete}
            />
          </group>
        )}

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