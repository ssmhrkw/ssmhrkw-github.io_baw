// assets/js/search.js
(async function(){
  const resultsEl = document.getElementById('results');
  const inputEl = document.getElementById('search-input');

  // fetch search.json
  let res = await fetch('{{ "/search.json" | relative_url }}');
  if (!res.ok) {
    resultsEl.innerHTML = '<p>検索データが取得できませんでした。</p>';
    return;
  }
  const docs = await res.json();

  // tiny-segmenter がグローバル TinySegementer を提供する想定
  // window.segment は tiny-segmenter の関数ではないので、以下のように使います:
  // var segmenter = new TinySegmenter();
  const segmenter = new TinySegmenter();

  // Preprocess: create a space-separated 'ja' field for lunr tokenization
  docs.forEach(doc => {
    const txt = [doc.title, doc.description, doc.content, doc.用途, doc.技術].join(' ');
    // tiny-segmenter returns array of tokens
    try {
      const toks = segmenter.segment(txt).join(' ');
      doc.ja = toks;
    } catch (e) {
      doc.ja = txt;
    }
  });

  // Build lunr index
  const idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('ja');
    // add docs
    docs.forEach(d => this.add(d));
  });

  // map id->doc for quick access
  const docMap = {};
  docs.forEach(d => docMap[d.id] = d);

  function renderResults(refs) {
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
      a.textContent = doc.title;
      const meta = document.createElement('div');
      meta.style.color = '#666';
      meta.style.fontSize = '.9rem';
      meta.textContent = '— ' + (doc.description || '') + ' (' + doc.date + ')';
      li.appendChild(a);
      li.appendChild(meta);
      ul.appendChild(li);
    });
    resultsEl.innerHTML = '';
    resultsEl.appendChild(ul);
  }

  // Simple search handler: tokenize query with tiny-segmenter and search
  inputEl.addEventListener('input', function(e){
    const q = inputEl.value.trim();
    if (!q) { resultsEl.innerHTML = ''; return; }

    // segment query
    const qtokens = segmenter.segment(q).join(' ');
    // use lunr search (search in ja field and title)
    let refs;
    try {
      refs = idx.search(qtokens + '*'); // wildcard to help partial matches
    } catch (err) {
      // fallback: simple substring search (for safety)
      const fallback = docs
        .filter(d => (d.title + ' ' + d.content + ' ' + d.description + ' ' + d.用途 + ' ' + d.技術).indexOf(q) !== -1)
        .map(d => ({ ref: d.id }));
      refs = fallback;
    }
    renderResults(refs);
  });

})();
