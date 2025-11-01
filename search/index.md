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
