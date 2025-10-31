# Roamloid

「1 体の 3D キャラが“端末をまたいで存在している感”を出す」ことをゴールにした学習用プロジェクト。リアルタイム通信 / 認証 / 3D / AI の練習土台。

---
## このリポジトリでやりたいこと（用途）
| 用途 | 目的 | 今の状態 |
|------|------|----------|
| リアルタイム接続 | SocketIO で接続/切断検知し状態共有 | デバイス間の移動、チャット、Presenceを実装済み |
| 認証基盤 | Flaskによるユーザー認証（サインアップ、ログイン、セッション管理） | 実装済み |
| アバター表現 | React Three Fiber で 3D 描画 | GLBモデルとアニメーション、ワープエフェクトを実装済み |
| 会話/生成 | Gemini API を使った発話生成 | 基本的なチャットUIとAI応答の仕組みを実装済み |

---
## まず触ってみる（ローカル環境）
1. Backend 起動 → `http://localhost:5000/api/health` が 200 になるか確認
2. Frontend 起動 → `http://localhost:5173` にアクセス
3. **アカウント作成**: `http://localhost:5173/register` を開き、新しいユーザーを作成します。
4. **ログイン**: `http://localhost:5173/login` (ログインページ) に遷移するので、作成したアカウントでログインします。
5. **デバイス選択**: デバイスを作成・選択し、3D空間に参加します。
6. **操作**: 3Dキャラクターが表示され、TキーでチャットUIを開けます。

### Backend 起動 (Python 3.11+)
バックエンドのリポジトリはこちら↓
https://github.com/arcsino/roamloid-flask
### Frontend 起動 (Node 18+)
```powershell
npm install
npm run dev
```

---
## 今できること（API / Realtime）
| 種別 | パス / イベント | 内容 |
|------|-----------------|------|
| HTTP | POST /api/auth/signup | ユーザー登録 |
| HTTP | POST /api/auth/login | ログイン（セッション開始） |
| HTTP | GET /api/room/devices | ユーザーに紐づくデバイス一覧を取得 |
| HTTP | POST /api/room/devices | 新規デバイスを作成 |
| WS   | join_room       | 指定したデバイス名でルームに参加 |
| WS   | send_data       | AIへのメッセージ送信 |
| WS   | receive_data    | AIからの応答メッセージ受信 |
| WS   | moved_3d        | AIが別デバイスへ移動した通知 |

---
## 開発の基本フロー
1. `develop` を更新
2. `名前/feat-xxx` でブランチを作る
3. 少し書いて `feat: 〜` などでコミット
4. PR を `develop` に出す

コミット書き方（最低限）:
```
feat: add health endpoint
fix: prevent duplicate socket event
docs: update readme for setup
```
詳しくは `CONTRIBUTING.md`。

---
## .env 作成例（開発）
`.env` ファイルをプロジェクトルートに作成します。
```
APP_ENV=development
DEBUG=1
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173
# FIREBASE_CREDENTIALS_JSON={"type":"service_account", ...}
```
`.env.development` ファイルをプロジェクトルートに作成します。
```
VITE_API_BASE_URL=http://localhost:5000
```

---
## よくあるトラブルと対処
| 症状 | ヒント |
|------|--------|
| ImportError / ModuleNotFoundError | venv 有効化したか / `pip install -r requirements.txt` 済みか |
| CORS エラー | `.env` の CORS_ORIGINS が `http://localhost:5173` になっているか |
| 500 エラー | ターミナルのスタックトレースを読む / 変更直前を戻す |
| ポート競合 | 既に他プロセスが 5000 or 5173 を使用していないか |
