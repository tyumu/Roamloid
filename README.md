# Roamloid
1体の3Dキャラクターが端末間を移動することで、あたかも“そこにいる”ように感じさせるWebアプリ
## React + React Three Fiber サンプル

このリポジトリは Vite + React + TypeScript 構成で、React Three Fiber によるシンプルな 3D サンプル（回転する Box と軌道カメラ）を表示します。

### 前提
- Node.js 18+（推奨: 20+）

### クローン後の環境構築（Windows PowerShell）
1. リポジトリをクローンして移動

```powershell
git clone https://github.com/tyumu/Roamloid.git
cd Roamloid
```

2. 依存関係をインストール（lockfile がある場合は ci、無ければ install）

```powershell
if (Test-Path package-lock.json) { npm ci } else { npm i }
```

3. 開発サーバーを起動

```powershell
npm run dev
```

4. ブラウザで表示

- http://localhost:5173/

停止はターミナルで Ctrl+C。

### セットアップ
1. 依存関係をインストール
	- すでに `node_modules` が無い場合は自動でインストールしてください。
2. 開発サーバーを起動
	- `npm run dev`
3. ブラウザでアクセス
	- http://localhost:5173/

### スクリプト
- `npm run dev` 開発サーバー起動
- `npm run build` 本番ビルド
- `npm run preview` ビルド結果のプレビュー

### 主なファイル
- `index.html` ルート HTML
- `src/main.tsx` React エントリ
- `src/App.tsx` React Three Fiber のサンプル

### 画面
- 画面には回転する立方体が表示され、ドラッグでカメラを回転（OrbitControls）が可能です。
