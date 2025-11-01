---
layout: default
title: サイト内検索
permalink: /search/
lang: ja
---

# サイト内検索

<p>
  <input id="search-input" type="search" placeholder="キーワードを入力（日本語可）。例：床衝撃音、共同住宅" style="width:100%;padding:0.6rem;font-size:1rem;border:1px solid #ddd;border-radius:6px;">
</p>

<div id="results">読み込み中...</div>

<!-- -----------------------
  設定: 絶対URL優先 + 相対フォールバック
  （iPadなどで baseurl が絡む場合に確実に動かすため）
-------------------------->
<script>
  window.SEARCH_JSON_URL = "https://ssmhrkw.github.io/ssmhrkw-github.io_baw/search.json";
  window.SEARCH_JSON_URL_FALLBACK = "{{ '/search.json' | relative_url }}";
  // 上の絶対URLをリポジトリ移転後に直すこともできます
</script>

<!-- ライブラリ -->
<script src="https://unpkg.com/tiny-segmenter@0.2.0/tiny_segmenter.js" defer></script>
<script src="https://unpkg.com/lunr/lunr.js" defer></script>

<!-- 結果表示の CSS（簡易モバイル最適化：カード表示） -->
<style>
  .search-card{border:1px solid #e6edf6;border-radius:8px;padding:12px;margin:10px 0;box-shadow:0 1px 0 rgba(10,10,10,0.02);background:#fff}
  .search-title{font-size:1.05rem;margin-bottom:6px;color:#0b2f7a;text-decoration:none}
  .search-meta{color:#666;font-size:.85rem;margin-bottom:8px}
  .search-excerpt{color:#111;line-height:1.6}
  .search-tags{color:#444;font-size:.85rem;margin-top:8px}
  mark{background:#fff59d;padding:0 .15rem;border-radius:2px}
  @media (max-width:640px){
    .search-card{padding:10px}
    .search-title{font-size:1rem}
  }
  .search-summary{color:#555;margin:8px 0;font-size:.95rem}
</style>

<!-- メイン検索ロジック（完全版） -->
<script>
(async function(){
  const MAX_RESULTS = 20; // ユーザー指定：20
  const input = document.getElementById('search-input');
  const out = document.getElementById('results');

  // デバッグモード ?debug=1
  const debug = (new URLSearchParams(location.search)).get('debug') === '1';

  // 決定する URL（絶対優先、無ければフォールバック）
  const SEARCH_JSON = window.SEARCH_JSON_URL || window.SEARCH_JSON_URL_FALLBACK || '{{ "/search.json" | relative_url }}' || '/search.json';

  // ユーティリティ
  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // 表示: デバッグ情報（あれば）
  if (debug) out.innerHTML = '<p class="search-summary">デバッグモード: search.json を取得中…</p>';

  // 1) fetch search.json
  let docs = [];
  try {
    const r = await fetch(SEARCH_JSON + '?_=' + Date.now(), { cache: 'no-store' });
    if (debug) {
      out.innerHTML += '<p>使用 URL: <code>' + SEARCH_JSON + '</code></p>';
      out.innerHTML += '<p>HTTP ステータス: ' + r.status + '</p>';
      out.innerHTML += '<p>Content-Type: ' + (r.headers.get('content-type') || 'n/a') + '</p>';
    }
    if (!r.ok) {
      out.innerHTML = '<p style="color:#b00">検索データが取得できませんでした（HTTP ' + r.status + '）。</p>';
      if (debug) out.innerHTML += '<p>リクエストした URL を再確認してください。</p>';
      return;
    }
    const txt = await r.text();
    try {
      docs = JSON.parse(txt);
    } catch(e) {
      out.innerHTML = '<p style="color:#b00">検索データの解析に失敗しました（JSON parse error）。</p>';
      if (debug) out.innerHTML += '<pre style="white-space:pre-wrap;background:#f6f8fa;padding:8px;border:1px solid #eee;">' + escapeHtml(txt.slice(0,2000)) + (txt.length>2000?'\n...(truncated)':'') + '</pre>';
      return;
    }
  } catch(e){
    out.innerHTML = '<p style="color:#b00">検索データの取得に失敗しました（ネットワーク）。</p>';
    if (debug) out.innerHTML += '<pre style="white-space:pre-wrap;color:#b00;">' + escapeHtml(String(e)) + '</pre>';
    return;
  }

  if (!Array.isArray(docs)) {
    out.innerHTML = '<p style="color:#b00">search.json の形式が配列ではありません。</p>';
    return;
  }

  // 2) 前処理: 各 doc に検索用テキストと ja tokens を作る
  docs.forEach(d => {
    const fields = [
      d.title || '',
      d.description || '',
      d.content || '',
      Array.isArray(d.用途) ? d.用途.join(' ') : (d.用途 || ''),
      Array.isArray(d.技術) ? d.技術.join(' ') : (d.技術 || '')
    ];
    // 検索用フラットテキスト（小文字化／英字対応）
    d.__search_text = fields.join(' ').toLowerCase();
  });

  // 3) Build lunr index using ja field tokenized by TinySegmenter (if available)
  let idx = null;
  try {
    // prepare docs' ja token field
    let segmenter = null;
    try { if (typeof TinySegmenter !== 'undefined') segmenter = new TinySegmenter(); } catch(e){ segmenter = null; }

    docs.forEach(d => {
      const txt = (d.title || '') + ' ' + (d.description || '') + ' ' + (d.content || '') + ' ' + (d.用途 || '') + ' ' + (d.技術 || '');
      if (segmenter) {
        try { d.__ja = segmenter.segment(txt).join(' '); } catch(e){ d.__ja = txt; }
      } else {
        d.__ja = txt;
      }
    });

    idx = lunr(function(){
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('__ja');
      // add docs
      docs.forEach(d => this.add(d));
    });
  } catch(e){
    console.warn('lunr build failed', e);
    idx = null;
  }

  // UI 初期表示
  out.innerHTML = '<p class="search-summary">データ読み込み完了（件数=' + docs.length + '）。キーワードを入力してください。</p>';

  // Helper: create excerpt and perform highlight while preserving TeX
  function makeHighlightedExcerpt(doc, tokens, maxlen=200){
    let raw = (doc.content || doc.description || doc.title || '').trim();
    if (!raw) return '';

    // truncate intelligently around first match if possible
    if (tokens && tokens.length){
      const lowered = raw.toLowerCase();
      let firstPos = -1;
      for (const t of tokens){
        const p = lowered.indexOf(t.toLowerCase());
        if (p >= 0 && (firstPos < 0 || p < firstPos)) firstPos = p;
      }
      if (firstPos >= 0) {
        const start = Math.max(0, firstPos - 40);
        raw = (start > 0 ? '...' : '') + raw.substr(start, maxlen) + (raw.length > start + maxlen ? '...' : '');
      } else {
        raw = raw.substr(0, maxlen) + (raw.length > maxlen ? '...' : '');
      }
    } else {
      raw = raw.substr(0, maxlen) + (raw.length > maxlen ? '...' : '');
    }

    // 1) extract TeX blocks and replace with placeholders
    const texBlocks = [];
    let placeholderId = 0;
    const replacer = (m)=>{ const key = '__TEX__' + (placeholderId++); texBlocks.push(m); return key; };

    // patterns: $$...$$ , \(...\) , $...$
    raw = raw.replace(/\$\$[\s\S]*?\$\$/g, replacer);
    raw = raw.replace(/\\\([^\)]*?\\\)/g, replacer);
    raw = raw.replace(/\$[^\$]+\$/g, replacer);

    // 2) escape HTML
    let escaped = escapeHtml(raw);

    // 3) highlight tokens (case-insensitive). tokens may be Japanese; do plain replace
    if (tokens && tokens.length){
      tokens.forEach(tok => {
        if (!tok) return;
        const escTok = escapeRegExp(tok);
        // global, case-insensitive
        const re = new RegExp(escTok, 'gi');
        escaped = escaped.replace(re, (m)=> '<mark>' + m + '</mark>');
      });
    }

    // 4) restore TeX placeholders with original (unescaped) content
    texBlocks.forEach((orig, i) => {
      const key = '__TEX__' + i;
      escaped = escaped.replace(key, orig);
    });

    return escaped;
  }

  // render function
  function renderResults(refs, queryTokens){
    // refs: array of {ref: id} from lunr OR array of docs (fallback)
    if (!refs || refs.length === 0){
      out.innerHTML = '<p>一致する記事が見つかりませんでした。</p>';
      return;
    }

    const total = refs.length;
    const shown = Math.min(total, MAX_RESULTS);
    const fragment = document.createDocumentFragment();
    const head = document.createElement('div');
    head.className = 'search-summary';
    head.textContent = '一致数: ' + total + ' 件（上位 ' + shown + ' 件を表示）';
    fragment.appendChild(head);

    for (let i=0;i<shown;i++){
      const r = refs[i];
      // r may be doc id or {ref:id}
      const id = r.ref ? r.ref : (typeof r === 'string' ? r : (r.id || ''));
      const doc = docs.find(d => d.id === id);
      if (!doc) continue;

      const card = document.createElement('article');
      card.className = 'search-card';

      const a = document.createElement('a');
      a.className = 'search-title';
      a.href = doc.id;
      a.textContent = doc.title || doc.id;
      // user chose same-tab navigation
      // a.target = '_self'; // default

      const meta = document.createElement('div');
      meta.className = 'search-meta';
      const parts = [];
      if (doc.date) parts.push(doc.date);
      // tags: 用途・技術
      const tags = [];
      if (doc.用途) tags.push('用途: ' + (Array.isArray(doc.用途) ? doc.用途.join(',') : doc.用途));
      if (doc.技術) tags.push('技術: ' + (Array.isArray(doc.技術) ? doc.技術.join(',') : doc.技術));
      if (tags.length) parts.push(tags.join(' | '));
      meta.textContent = parts.join(' 　');

      const excerptDiv = document.createElement('div');
      excerptDiv.className = 'search-excerpt';
      const excerptHtml = makeHighlightedExcerpt(doc, queryTokens, 240);
      excerptDiv.innerHTML = excerptHtml;

      // add to card
      card.appendChild(a);
      card.appendChild(meta);
      card.appendChild(excerptDiv);

      // small tags row
      if (tags.length){
        const tdiv = document.createElement('div');
        tdiv.className = 'search-tags';
        tdiv.textContent = tags.join(' | ');
        card.appendChild(tdiv);
      }

      fragment.appendChild(card);
    }

    out.innerHTML = '';
    out.appendChild(fragment);

    // MathJax render for dynamic content
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([out]).catch(err => console.warn('MathJax typeset failed', err));
    }
  }

  // input handler: run lunr search if idx exists, else fallback to substring match
  input.addEventListener('input', function(){
    const q = this.value.trim();
    if (!q) { out.innerHTML = '<p class="search-summary">キーワードを入力してください（例: 床衝撃音）。</p>'; return; }

    // segment query tokens if possible
    let tokens = null;
    try {
      if (typeof TinySegmenter !== 'undefined') {
        const seg = new TinySegmenter();
        tokens = seg.segment(q).filter(t => t.trim());
      } else {
        // simple whitespace split
        tokens = q.split(/\s+/).filter(t => t.trim());
      }
    } catch(e) {
      tokens = q.split(/\s+/).filter(t => t.trim());
    }

    // prefer lunr index search
    let refs = [];
    if (idx) {
      // build AND query: +token*
      try {
        const qParts = tokens.map(t => '+' + t + '*').join(' ');
        refs = idx.search(qParts); // returns [{ref, score}, ...]
      } catch(e) {
        // fallback: try wildcard-free
        try {
          const qParts2 = tokens.map(t => '+' + t).join(' ');
          refs = idx.search(qParts2);
        } catch(e2){
          refs = [];
        }
      }
    }

    // If no lunr results, fallback to substring search on __search_text
    if ((!refs || refs.length === 0) && tokens && tokens.length) {
      const ql = tokens.join(' ').toLowerCase();
      const fallbackHits = docs
        .map(d => ({ id: d.id, score: 0 }))
        .filter(d => {
          const doc = docs.find(x => x.id === d.id);
          return doc && doc.__search_text && tokens.every(t => doc.__search_text.indexOf(t.toLowerCase()) !== -1);
        })
        .map(x => ({ ref: x.id }));
      if (fallbackHits.length) refs = fallbackHits;
    }

    renderResults(refs, tokens);
  });

  // 初期メッセージ
  out.innerHTML = '<p class="search-summary">データ読み込み完了（件数=' + docs.length + '）。検索語を入力してください。</p>';

})();
</script>
