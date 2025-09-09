# 開発環境（Flask）のセットアップ

## 必要条件

- Python 3.13.7（Python 3.10 以上なら大丈夫かな。知らんけど）

## セットアップ手順

1. Flask ディレクトリへ移動

   ```sh
   cd flask
   ```

2. 仮想環境の作成

   ```sh
   python -m venv .venv
   ```

3. 仮想環境の有効化

   - Windows:
     ```sh
     .venv\Scripts\activate
     ```
   - macOS/Linux:
     ```sh
     source .venv/bin/activate
     ```

4. 依存パッケージのインストール

   ```sh
   pip install -r requirements.txt
   ```

5. `.env` ファイルを作成し、以下を記述

   ```
   FLASK_APP=apps.roamloid.py
   FLASK_ENV=development
   FLASK_DEBUG=1
   ```

6. Flask アプリの起動

   ```sh
   flask run
   ```

## 補足

- デフォルトでは [http://localhost:5000/](http://localhost:5000/) でアプリが起動します。
- 開発用の設定や環境変数が必要な場合は `.env` ファイルを編集してください。
