# Backend Skeleton

最小構成の Flask + SocketIO 基盤。まだビジネス機能は未実装。

## 目的
後続で会話 / Presence / Gemini / 認証を段階的に追加しやすいよう層を先に分離。

## ディレクトリ
```
backend/
  app/
    __init__.py          # create_app, SocketIO 初期化
    config/              # 設定読込 (dotenv)
    routes/              # HTTP ルート (api, health)
    realtime/            # SocketIO イベント
    services/            # 外部サービス (firebase など)
    models/              # データモデル (Firestore 抽象予定)
  run.py                 # ローカル起動
  requirements.txt       # バックエンド依存（最小）
```

## 環境変数 (.env 推奨)
```
APP_ENV=development
DEBUG=1
CORS_ORIGINS=http://localhost:5173
# FIREBASE_CREDENTIALS_JSON= {...}
```

## 起動
```
cd backend
python -m venv .venv
.venv/Scripts/activate  # mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

## エンドポイント
| Method | Path             | Description |
|--------|------------------|-------------|
| GET    | /api/health      | ヘルスチェック |
| GET    | /api/hello       | サンプル |

## SocketIO
- 接続時 `system` イベント `{message: "connected"}` を返すのみ。

## 今後の追加予定（優先例）
1. 認証ミドルウェア (Firebase Token)
2. Firestore モデル (User / Conversation / Message)
3. Presence 更新 (connect/disconnect)
4. Gemini サービスラッパ
5. 会話ストリーム (SocketIO)
6. 単体テスト基盤 (pytest)

## 削除予定の旧構成
`flask/` ディレクトリは移行完了後に削除。現時点では残して比較参照できる状態。

## ライセンス
TBD
