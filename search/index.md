---
layout: default
title: サイト内検索
permalink: /search/
---

# サイト内検索

<p>
  <input id="search-input" type="search" placeholder="キーワードを入力（日本語可）" style="width:100%;padding:0.6rem;font-size:1rem;">
</p>
<div id="results">読み込み中...</div>

<!-- 日本語分かち書き + lunr + 実装ファイル -->
<script src="https://unpkg.com/tiny-segmenter@0.2.0/tiny_segmenter.js"></script>
<script src="https://unpkg.com/lunr/lunr.js"></script>
<script src="{{ '/assets/js/search.js' | relative_url }}"></script>

<!-- フォールバック表示（search.jsonが取得できないときにわかりやすくする） -->
<script>
  // 10秒後にまだ results が "読み込み中..." のままなら注意メッセージを出す
  setTimeout(()=> {
    const r = document.getElementById('results');
    if (r && r.textContent.trim() === '読み込み中...') {
      r.innerHTML = '<p style="color:#b00">検索データの読み込みに失敗しました。<br>まず以下を確認してください：<br>・`search.json` が公開されている（https://ssmhrkw.github.io/ssmhrkw-github.io_baw/search.json をブラウザで開いて確認）<br>・`assets/js/search.js` が公開されている（https://ssmhrkw.github.io/ssmhrkw-github.io_baw/assets/js/search.js をブラウザで開いて確認）</p>';
    }
  }, 10000);
</script>
