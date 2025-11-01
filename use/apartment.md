---
layout: default
title: 共同住宅
parent: 用途
nav_order: 2
---

# 共同住宅 × 全技術

{% assign items = site.notes | where_exp: "item", "item.用途 contains '共同住宅'" | sort: "title" %}
{% if items.size > 0 %}
{% for p in items %}
- [{{ p.title }}]({{ p.url }}) — {{ p.description | default: '' }}
{% endfor %}
{% else %}
（まだ該当記事がありません）
{% endif %}
