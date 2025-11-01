---
layout: default
title: BAwiki — 建築音響 Knowledge Base
---

# 建築音響 Wiki（用途 × 技術）

本サイトは、**用途（ホテル・共同住宅…）** と **技術（床衝撃音・開口部…）** を交差して学べる知識ベースです。

## 目的
- 実務者が迷わず辿れる「用途 × 技術」の索引
- 図表・写真・数式（MathJax）で一次情報を整理
- JSの重いツール類は分離して保守性を確保

## 新着ノート（自動）
{% assign notes = site.notes | default: "" | split: "" %}
{% if notes != empty %}
  {% assign notes = site.notes | sort: "title" %}
  <ul class="notes">
  {% for p in notes %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a> <span class="meta">— {{ p.description | default: "" }}</span></li>
  {% endfor %}
  </ul>
{% else %}
（まだノートが登録されていません）
{% endif %}

## 索引
- **[用途（Use）]({{ "/use/" | relative_url }})**
- **[技術（Tech）]({{ "/tech/" | relative_url }})**

## 数式例
インピーダンスの簡易例：$Z = F / v$
