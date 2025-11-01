---
layout: default
title: BAwiki — 建築音響 Knowledge Base
---

# 建築音響 Wiki（用途 × 技術）

本サイトは、**用途（ホテル・共同住宅…）** と **技術（床衝撃音・開口部…）** 等の知識ベースです。

## 目的
- 実務者が迷わず辿れる、使いやすい「用途 × 技術」の索引の作成

## 新着ノート（自動）
{% assign notes = site.notes | default: "" | split: "" %}
{% if notes != empty %}
  {% assign notes = site.notes | sort: "date" | reverse %}
  <ul>
  {% for p in notes limit:8 %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a> — {{ p.date | date: "%Y-%m-%d" }}</li>
  {% endfor %}
  </ul>
{% else %}
（ノート未登録）
{% endif %}

## 索引
- **[用途（Use）]({{ "/use/" | relative_url }})**
- **[技術（Tech）]({{ "/tech/" | relative_url }})**

## 数式例
インピーダンスの簡易例：$Z = F / v$
