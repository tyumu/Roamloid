# Contributing / 開発ルール（初心者向けシンプル版）

最初は「ブランチ運用」と「コミットメッセージ」だけ守れば OK。他は後で足す。  
困ったら既存コミットを真似して大丈夫。

---
## 1. ブランチ運用（main / develop 方式）

基本ブランチ:
- `main` : 常に動く安定版（リリース用）。
- `develop` : 日常開発の集約先。PR はまずここへ。

作業ブランチ命名ルール（自分の名前 + ざっくり内容）:
```
<name>/<type>-<短い説明>
```
例:
```
tarou/feat-presence
hanako/fix-socket-reconnect
jiro/docs-readme
```

POINT:
- 名前は GitHub / Slack などで分かる呼び名に統一。
- 1 ブランチ = 1 トピック（でかくなったら分割）。
- 終わったら `develop` に PR → 問題なければマージ。`main` へはまとめて（必要なタイミングで）リリース。

---
## 2. コミットメッセージ規約（超シンプル）

形式:
```
<type>: <短い説明>
```
説明は「何をしたか」が一行で分かるように（日本語 OK）。

使う type（これだけ覚えれば十分）:
- feat: 機能追加
- fix: 不具合修正
- docs: ドキュメント / README など
- refactor: 挙動を変えない整理
- chore: 依存更新 / 設定 / 雑多
- test: テスト追加 / 修正

例:
```
feat: add basic presence socket event
fix: prevent duplicate system event on reconnect
docs: update readme with setup steps
refactor: extract init helper
chore: add commit template file
test: add socket connect test
```

補足（無理に書かなくていいけどできれば役立つ）:
- もう一行書きたいときは空行を挟んで下に詳細。
- どう直したかより「何ができるようになったか / 何が直ったか」を意識。

NG 例:
- `update` / `fix bug` / `aaa` など意味が伝わらないもの。

---
## 3. よくある流れ（例）
```
git switch develop
git pull origin develop
git switch -c tarou/feat-presence
# 変更する
git add .
git commit -m "feat: add presence placeholder"
git push origin tarou/feat-presence
# GitHub で develop 向け PR 作成
```

---
## 4. 困ったら
- 迷ったら `feat:` / `fix:` / `docs:` のどれかで短く。
- コミットまとめたくなったら後から squash でも OK。
- もっと正式なルール（BREAKING CHANGE など）は慣れてきたら導入予定。

---
## 5. 追加で使いたくなったら（将来）
後から以下を足す想定: テストカバレッジ目標 / CI 必須チェック / 変更履歴生成 / バージョニング方針。

---
最初は“ブランチ名 + コミットメッセージ”だけ気にして進めよう。
