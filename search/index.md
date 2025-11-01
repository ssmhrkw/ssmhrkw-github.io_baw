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

<!-- ページ内で正しい search.json の URL を Jekyll に解決させてグローバルに置く -->
<script>
  // relative_url を使って baseurl に追随する（例: /<repo>/search.json になる）
  window.SEARCH_JSON_URL = "{{ '/search.json' | relative_url }}";
  // もし絶対URLで確実にしたければ、次のように書き換えてください（手動で）:
  // window.SEARCH_JSON_URL = "https://ssmhrkw.github.io/ssmhrkw-github.io_baw/search.json";
</script>

<!-- ライブラリ読み込み（日本語分かち書き + lunr） -->
<script src="https://unpkg.com/tiny-segmenter@0.2.0/tiny_segmenter.js" defer></script>
<script src="https://unpkg.com/lunr/lunr.js" defer></script>

<!-- 主要な検索ロジック（外部ファイルを使う場合） -->
<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>

<!-- デバッグモード（?debug=1 を URL に付けるとページ上に fetch の詳細を出します） -->
<script>
(function(){
  // パラメータに debug=1 があるか
  const params = new URLSearchParams(location.search);
  const debug = params.get('debug') === '1';

  if (!debug) return;

  // 小さなデバッグUIを追加
  (async function(){
    const out = document.getElementById('results') || (function(){ const d=document.createElement('div'); document.body.appendChild(d); return d; })();
    out.innerHTML = '<p>デバッグモード: search.json を取得中…</p>';
    const url = window.SEARCH_JSON_URL || '/search.json';
    out.innerHTML += '<p>使用 URL: <code>' + url + '</code></p>';
    try {
      const r = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
      out.innerHTML += '<p>HTTP ステータス: ' + r.status + '</p>';
      out.innerHTML += '<p>Content-Type: ' + (r.headers.get('content-type') || 'n/a') + '</p>';
      const txt = await r.text();
      out.innerHTML += '<p>レスポンス長: ' + (txt ? txt.length : 0) + '</p>';
      out.innerHTML += '<details style="max-height:240px;overflow:auto;"><summary>レスポンス先頭（表示）</summary><pre style="white-space:pre-wrap;">' + (txt ? txt.slice(0,1200) : '(empty)') + (txt && txt.length>1200 ? '\n...(truncated)' : '') + '</pre></details>';

      try {
        const docs = JSON.parse(txt);
        if (Array.isArray(docs)) {
          const list = document.createElement('ul');
          docs.forEach(d => {
            const li = document.createElement('li');
            const a = document.createElement('a'); a.href = d.id; a.textContent = (d.title || d.id); a.target = '_blank';
            li.appendChild(a);
            if (d.description) {
              const meta = document.createElement('div'); meta.style.color='#666'; meta.style.fontSize='.9rem';
              meta.textContent = d.description;
              li.appendChild(meta);
            }
            list.appendChild(li);
          });
          out.appendChild(document.createElement('hr'));
          const h = document.createElement('h4'); h.textContent = '検索データ内の記事一覧'; out.appendChild(h);
          out.appendChild(list);
        } else {
          out.appendChild(document.createElement('p')).textContent = '注意: search.json は配列ではありません';
        }
      } catch(e) {
        out.appendChild(document.createElement('p')).textContent = 'JSON parse error: ' + (e && e.message ? e.message : e);
      }
    } catch (e) {
      out.innerHTML += '<p style="color:#b00">fetch エラー: ' + (e && e.message ? e.message : e) + '</p>';
      console && console.error(e);
    }
  })();
})();
</script>

<!-- 補足メモ（編集用）:
 - assets/js/search.js は Liquid を含まない純粋な JS にしてください（ページ側で window.SEARCH_JSON_URL を供給する前提）。
 - 日本語検索の精度向上は CI で分かち書きしたトークンを search.json に保存する方法や、kuromoji を用いた事前処理を検討してください。
-->
