# BAwiki — 建築音響 Knowledge Base

**目的**  
建築音響の知見を「**用途 × 技術**」で横断できるよう最小コストで運用・拡張できるWiki（Jekyll + GitHub Pages）。  
— 日本語を先行、将来は英語追加。図表・写真は自己提供。数式はMathJax対応。

## すぐに公開する手順（GitHub Pages / Jekyll 有効）
1. GitHubで新規リポジトリを作成（例：`BAwiki`）。  
2. このリポジトリに本フォルダ一式をアップロード（`_config.yml` と `index.md` があればJekyllが動作）。  
3. GitHubリポジトリ → **Settings** → **Pages** → **Build and deployment**  
   - **Source**: *Deploy from a branch*  
   - **Branch**: `main` / `/root` を選択 → **Save**  
   - 数十秒後、`https://<username>.github.io/BAwiki/` で公開。  
4. サイトURLに合わせて `_config.yml` の `url` と `baseurl` を設定。

> **プロジェクトサイト**構成推奨：`url: https://<username>.github.io`、`baseurl: "/BAwiki"`。  
> **ユーザーサイト**として運用する場合はリポジトリ名を `<username>.github.io` とし、`baseurl: ""`。

## 情報設計
- 実体は **`_notes/`** コレクションに集約（Front-matterで `用途` と `技術` を**別配列**で保持）。
- **用途** と **技術** の索引ページから交差的に辿れる。  
- JSの重いインタラクティブは `assets/tools/<tool>/index.html` に置き、Markdownから**リンク or iframe埋め込み**。

## ライセンス
- **コンテンツ（文章・図表・画像）**: CC0 1.0（一切の権利を放棄 / Public Domain）  
- **コード（スクリプト・スニペット）**: MIT License  
必要に応じて変更可。詳しくは `LICENSE` と `LICENSE-CODE` を参照。

## ローカルプレビュー（任意）
```bash
bundle install
bundle exec jekyll serve
# http://127.0.0.1:4000/BAwiki/  (baseurlに応じて変化)
```
