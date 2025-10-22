# Roamloid

「1 体の 3D キャラが“端末をまたいで存在している感”を出す」ことをゴールにした学習用プロジェクト。リアルタイム通信 / 認証 / 3D / AI の練習土台。

---
## このリポジトリでやりたいこと（用途）
| 用途 | 目的 | 今の状態 |
|------|------|----------|
| リアルタイム接続 | SocketIO で接続/切断検知し状態共有 | 接続イベントのみ実装済み |
| 認証基盤 | ローカル DB (SQLite) + Flask-Login による認証 | 実装済み |
| アバター表現 | React Three Fiber で 3D 描画 | 回転する箱のプレースホルダ |
| 会話/生成 | Gemini API を使った発話生成 | 未着手 |
| Presence | 「今どこに居るか」記録と更新 | 未着手 |
| 学習教材 | 初心者が少しずつ触れる構成 | シンプル README & ルール整備済み |

---
## まず触ってみる（5 分）
1. Backend 起動 → `/api/health` が 200 になるか
2. Frontend 起動 → 3D の箱が回って表示されるか
3. ブラウザ DevTools -> Network で `/api/hello` のレスポンスを確認

### Backend 起動 (Python 3.11+)
```powershell
cd backend
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\..\.env.example .env  # 失敗したら手動コピー
python run.py  # http://localhost:5000/api/health
```

### Frontend 起動 (Node 18+)
```powershell
npm install
npm run dev  # http://localhost:5173/
```

---
## 今できること（API / Realtime 最小）
| 種別 | パス / イベント | 内容 |
|------|-----------------|------|
| HTTP | GET /api/health | サーバー生存確認 |
| HTTP | GET /api/hello  | サンプル JSON |
| WS   | connect         | 接続時 `system` メッセージ |

---
## ディレクトリ概要
```
backend/
	app/
		routes/      # HTTP エンドポイント
		realtime/    # SocketIO イベント
		services/    # Firebase など外部連携予定
src/             # React + Vite + 3D
tests/           # Python テスト
CONTRIBUTING.md  # ブランチ & コミット簡易ルール
.env.example     # 環境変数サンプル
```

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
```
APP_ENV=development
DEBUG=1
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173
# FIREBASE_CREDENTIALS_JSON={"type":"service_account", ...}
```

---
## よくあるトラブルと対処
| 症状 | ヒント |
|------|--------|
| ImportError / ModuleNotFoundError | venv 有効化したか / `pip install -r requirements.txt` 済みか |
| CORS エラー | `.env` の CORS_ORIGINS が合っているか |
| 500 エラー | ターミナルのスタックトレースを読む / 変更直前を戻す |
| ポート競合 | 既に他プロセスが 5000 or 5173 を使用していないか |

---
## 次のステップ（段階的）
1. 現状: SQLite + Flask-Login ベースの認証が実装されています（`/api/auth/*` エンドポイント）。
2. オプション: 将来的に外部認証を導入する場合は、フロント側／サーバ側の設計を検討してください（現状は SQLite + Flask-Login で完結しています）。
3. Presence: 接続/切断で DB に状態保存（現在は SocketIO 側で device / chat 保存が追加されています）
4. Gemini: テキスト生成を SocketIO でストリーム送信
5. アバター: 生成テキスト → 表情 / 動き へ反映

焦らず「動く最小」→「拡張」の順に進める。

---
## 参加するときの考え方
| 状態 | どうする | 目的 |
|------|----------|------|
| 何を触ればいいかわからない | README の「次のステップ」から 1 つ選ぶ | 学習の迷子防止 |
| 変更が大きくなりそう | 先に小さく分割して 2 PR に | レビューしやすく |
| 詰まった | 失敗手順をメモして共有 | 再発防止 |

---
## ライセンス
TBD

