# Roamloid

1 体の 3D キャラが複数端末に“存在”している感を出すリアルタイム Web アプリ（学習用プロトタイプ）。

---
## 今できること（最小）
- `GET /api/health` でサーバー生存確認
- `GET /api/hello` サンプルレスポンス
- SocketIO 接続で `system` メッセージ受信

---
## 5 分クイックスタート

### 1. Backend 起動
前提: Python 3.11+
```powershell
cd backend
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\..\.env.example .env  # 失敗したら手動で .env 作成
python run.py   # → http://localhost:5000/api/health
```

### 2. Frontend 起動
前提: Node.js 18+ (20 推奨)
```powershell
npm install
npm run dev   # → http://localhost:5173/
```

両方起動したら: ブラウザを開き、開発しつつ `api/health` が 200 になるのを確認。

---
## フォルダざっくり
```
backend/        ← Flask + SocketIO
	app/
		routes/     ← /api/*
		realtime/   ← WebSocket イベント
		services/   ← Firebase など後で
src/            ← React + Vite + (将来 3D)
tests/          ← 簡単な Python テスト
.env.example    ← 環境変数サンプル
CONTRIBUTING.md ← ブランチ & コミットルール
```

---
## ブランチ & コミット
初心者向けに超シンプル運用:
1. 作業前に `develop` を最新に
2. `自分の名前/feat-〇〇` などでブランチ作成
3. コミットメッセージ形式: `<type>: 説明`

`type` 一覧: `feat` / `fix` / `docs` / `refactor` / `chore` / `test` だけ覚えれば OK。詳しくは `CONTRIBUTING.md`。

例:
```
tarou/feat-presence
feat: add presence placeholder
```

---
## .env 作成例
```
APP_ENV=development
DEBUG=1
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173
```

---
## よくあるミス
| 症状 | 対処 |
|------|------|
| `ModuleNotFoundError` | venv 有効化できてるか確認 / 再インストール |
| `pip` 遅い | `python -m pip install -r requirements.txt` を再試行 |
| フロント CORS エラー | `.env` の `CORS_ORIGINS` が合ってるか |
| Socket 繋がらない | バックエンドを 5000 番で起動しているか |

---
## 次やりたい（メモ）
- Firebase 認証
- Presence 更新ロジック
- Firestore モデル
- Gemini 連携

深い設計は慣れてから別ドキュメント化予定。

---
## ライセンス
TBD

