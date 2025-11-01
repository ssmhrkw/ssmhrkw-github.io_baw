---
layout: default
title: サイト内検索
permalink: /search/
lang: ja
---

# サイト内検索

<p>
  <input id="search-input" type="search" placeholder="キーワードを入力（日本語可）" style="width:100%;padding:0.6rem;font-size:1rem;">
</p>

<div id="results">読み込み中...</div>

<script>
  // --- 絶対URLを優先（iPadなどで確実に動かすため）
  window.SEARCH_JSON_URL = "https://ssmhrkw.github.io/ssmhrkw-github.io_baw/search.json";
  // --- 万一リポジトリを移す等あれば相対URLをフォールバックに
  window.SEARCH_JSON_URL_FALLBACK = "{{ '/search.json' | relative_url }}";
</script>

<script src="https://unpkg.com/tiny-segmenter@0.2.0/tiny_segmenter.js" defer></script>
<script src="https://unpkg.com/lunr/lunr.js" defer></script>
<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>

<script>
(function(){
  const params = new URLSearchParams(location.search);
  const debug = params.get('debug') === '1';
  if (!debug) return;

  (async function(){
    const out = document.getElementById('results') || (function(){ const d=document.createElement('div'); document.body.appendChild(d); return d; })();
    out.innerHTML = '<p>デバッグモード: search.json を取得中…</p>';
    const url = window.SEARCH_JSON_URL || window.SEARCH_JSON_URL_FALLBACK || '/search.json';
    out.innerHTML += '<p>使用 URL: <code>' + url + '</code></p>';
    try {
      const r = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
      out.innerHTML += '<p>HTTP ステータス: ' + r.status + '</p>';
      out.innerHTML += '<p>Content-Type: ' + (r.headers.get('content-type') || 'n/a') + '</p>';
      const txt = await r.text();
      out.innerHTML += '<p>レスポンス長: ' + (txt ? txt.length : 0) + '</p>';
      out.innerHTML += '<details style="max-height:240px;overflow:auto;"><summary>レスポンス先頭（表示）</summary><pre style="white-space:pre-wrap;">' + (txt ? txt.slice(0,1200) : '(empty)') + (txt && txt.length>1200 ? '\n...(truncated)' : '') + '</pre></details>';
    } catch (e) {
      out.innerHTML += '<p style="color:#b00">fetch エラー: ' + (e && e.message ? e.message : e) + '</p>';
      console && console.error(e);
    }
  })();
})();
</script>
