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

<!-- 絶対 URL をここに貼る（確実に使われる）-->
<script>
  window.SEARCH_JSON_URL = "https://ssmhrkw.github.io/ssmhrkw-github.io_baw/search.json";
</script>

<script src="https://unpkg.com/tiny-segmenter@0.2.0/tiny_segmenter.js"></script>
<script src="https://unpkg.com/lunr/lunr.js"></script>
<script src="{{ '/assets/js/search.js' | relative_url }}"></script>
<!-- === Inline quick-check script: paste this at the end of search/index.md === -->
<script>
(async function(){
  const out = document.getElementById('results') || (function(){ const d=document.createElement('div'); document.body.appendChild(d); return d; })();
  out.innerHTML = '<p>テスト: search.json を取得中…</p>';

  // uses the absolute URL you already set in the page
  const url = window.SEARCH_JSON_URL || '{{ "/search.json" | relative_url }}' || '/search.json';
  out.innerHTML += '<p>使用 URL: <code>' + url + '</code></p>';

  try {
    const r = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
    out.innerHTML += '<p>HTTP ステータス: ' + r.status + '</p>';
    const ct = r.headers.get('content-type') || 'n/a';
    out.innerHTML += '<p>Content-Type: ' + ct + '</p>';
    const txt = await r.text();
    out.innerHTML += '<p>レスポンス長: ' + (txt ? txt.length : 0) + '</p>';
    out.innerHTML += '<details style="max-height:240px;overflow:auto;"><summary>レスポンス先頭（表示）</summary><pre style="white-space:pre-wrap;">' + txt.slice(0,1200) + (txt.length>1200? '\\n...(truncated)':'') + '</pre></details>';

    // try to parse and show titles/links
    try {
      const docs = JSON.parse(txt);
      if (Array.isArray(docs)) {
        const list = document.createElement('ul');
        docs.forEach(d => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          // doc.id in your JSON is absolute-path-like; use as-is
          a.href = d.id;
          a.textContent = (d.title || d.id);
          a.target = '_blank';
          li.appendChild(a);
          if (d.description) {
            const meta = document.createElement('div');
            meta.style.color='#666'; meta.style.fontSize='.9rem';
            meta.textContent = d.description;
            li.appendChild(meta);
          }
          list.appendChild(li);
        });
        out.appendChild(document.createElement('hr'));
        out.appendChild(document.createElement('h4')).textContent = '検索データ内の記事一覧';
        out.appendChild(list);
      } else {
        out.appendChild(document.createElement('p')).textContent = '注意: search.json は配列ではありません';
      }
    } catch (e) {
      out.appendChild(document.createElement('p')).textContent = 'JSON parse error: ' + (e && e.message ? e.message : e);
    }

  } catch (e) {
    out.innerHTML += '<p style="color:#b00">fetch エラー: ' + (e && e.message ? e.message : e) + '</p>';
    console && console.error(e);
  }
})();
</script>
