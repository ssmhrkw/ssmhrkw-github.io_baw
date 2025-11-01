// assets/js/search.js
// Liquid を含まない安全版。ページ側で window.SEARCH_JSON_URL をセットすることを前提とする。
// 依存ライブラリ: tiny-segmenter, lunr はページで読み込む（search/index.md にある想定）。

(async function(){
  const resultsEl = document.getElementById('results');
  const inputEl = document.getElementById('search-input');

  if (!resultsEl || !inputEl) {
    console.warn('search.js: results or input element not found on page.');
    return;
  }

  // Determine search.json URL: prefer page-provided absolute URL
  const SEARCH_JSON = (typeof window !== 'undefined' && window.SEARCH_JSON_URL) ? window.SEARCH_JSON_URL : '/search.json';

  // Fetch with cache-bust
  let fetchedText = null;
  try {
    const resp = await fetch(SEARCH_JSON + '?_=' + Date.now(), { cache: 'no-store' });
    if (!resp.ok) {
      resultsEl.innerHTML = '<p style="color:#b00">検索データが取得できませんでした（HTTP ' + resp.status + '）。</p>';
      console.error('search.js fetch failed', resp.status, await resp.text());
      return;
    }
    const ct = resp.headers.get('content-type') || '';
    fetchedText = await resp.text();
    // try to parse JSON
    let docs;
    try {
      docs = JSON.parse(fetchedText);
    } catch (e) {
      resultsEl.innerHTML = '<p style="color:#b00">検索データの解析に失敗しました（JSON parse error）。</p>';
      console.error('search.js JSON parse error', e, fetchedText.slice(0,1200));
      return;
    }

    if (!Array.isArray(docs)) {
      resultsEl.innerHTML = '<p style="color:#b00">検索データの形式が配列ではありません。</p>';
      console.error('search.js: expected array', docs);
      return;
    }

    // Preprocess: build ja field using tiny-segmenter if available
    let segmenter = null;
    try { if (typeof TinySegmenter !== 'undefined') segmenter = new TinySegmenter(); } catch(e){ segmenter = null; }

    docs.forEach(doc => {
      const txt = [doc.title || '', doc.description || '', doc.content || '', doc.用途 || '', doc.技術 || ''].join(' ');
      if (segmenter) {
        try { doc.ja = segmenter.segment(txt).join(' '); } catch(e) { doc.ja = txt; }
      } else {
        doc.ja = txt;
      }
    });

    // Build lunr index
    let idx;
    try {
      idx = lunr(function() {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('ja');
        docs.forEach(d => this.add(d));
      });
    } catch (e) {
      console.error('search.js lunr build failed', e);
      resultsEl.innerHTML = '<p style="color:#b00">検索エンジンの準備に失敗しました。</p>';
      return;
    }

    // map id->doc
    const docMap = {};
    docs.forEach(d => docMap[d.id] = d);

    // helpers
    function escapeHtml(s){
      return (s || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
    }
    function excerpt(text, q, len=200){
      if(!text) return '';
      const idx = q ? text.indexOf(q) : -1;
      if(idx >= 0) {
        const start = Math.max(0, idx - 40);
        return (start>0 ? '...':'') + text.substr(start, len) + (text.length > start+len ? '...' : '');
      }
      return text.substr(0, len) + (text.length > len ? '...' : '');
    }

    function renderResults(refs, query) {
      if (!refs || refs.length === 0) {
        resultsEl.innerHTML = '<p>一致する記事が見つかりませんでした。</p>';
        return;
      }
      const ul = document.createElement('ul');
      ul.style.paddingLeft = '1rem';
      refs.forEach(r => {
        const doc = docMap[r.ref];
        const li = document.createElement('li');

        const a = document.createElement('a');
        a.href = doc.id;
        a.textContent = doc.title || doc.id;
        a.style.fontWeight = '600';
        a.target = '_blank';

        const meta = document.createElement('div');
        meta.style.color = '#666';
        meta.style.fontSize = '.9rem';
        meta.textContent = '— ' + (doc.description || '') + (doc.date ? ' (' + doc.date + ')' : '');

        const snippet = document.createElement('div');
        snippet.className = 'search-snippet';
        const raw = excerpt(doc.content || '', query || '', 260);
        let escaped = escapeHtml(raw);
        // try to preserve $...$ for MathJax: restore simple $...$ occurrences
        escaped = escaped.replace(/\\\$([^\$]+)\\\$/g, function(m,p1){ return '$' + p1 + '$'; });
        escaped = escaped.replace(/\$([^\$]+)\$/g, function(m,p1){ return '$' + p1 + '$'; });
        snippet.innerHTML = escaped;

        li.appendChild(a);
        li.appendChild(meta);
        li.appendChild(snippet);
        ul.appendChild(li);
      });
      resultsEl.innerHTML = '';
      resultsEl.appendChild(ul);

      // MathJax typeset if available
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise([resultsEl]).catch(err => console.warn('MathJax typeset failed', err));
      }
    }

    // input handler
    inputEl.addEventListener('input', function(){
      const q = inputEl.value.trim();
      if (!q) { resultsEl.innerHTML = ''; return; }

      let qtokens = q;
      if (segmenter) {
        try { qtokens = segmenter.segment(q).join(' '); } catch(e) { qtokens = q; }
      }
      let refs;
      try {
        refs = idx.search(qtokens + '*');
      } catch (err) {
        // fallback substring search
        refs = docs
          .filter(d => ((d.title||'') + ' ' + (d.content||'') + ' ' + (d.description||'') + ' ' + (d.用途||'') + ' ' + (d.技術||'')).indexOf(q) !== -1)
          .map(d => ({ ref: d.id }));
      }
      renderResults(refs, q);
    });

    // initial: show nothing / or a short hint
    resultsEl.innerHTML = '<p>検索語を入力してください（日本語可）。</p>';

  } catch (e) {
    resultsEl.innerHTML = '<p style="color:#b00">検索データの取得に失敗しました（例外）。コンソールを確認してください。</p>';
    console.error('search.js top-level error', e, fetchedText);
  }
})();
