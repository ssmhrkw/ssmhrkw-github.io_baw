---
layout: default
title: 共同住宅
permalink: /use/apartment/
---

# 共同住宅 × 全技術

{% assign notes = site.notes | default: "" | split: "" %}
{% if notes == empty %}
  （まだノートがありません）
{% else %}
  {% assign notes = site.notes | sort: "title" %}
  {% assign found = false %}
  <ul class="notes">
  {% for p in notes %}
    {% if p['用途'] and p['用途'] contains '共同住宅' %}
      <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a> — {{ p.description | default:'' }}</li>
      {% assign found = true %}
    {% endif %}
  {% endfor %}
  </ul>
  {% unless found %}
    （共同住宅に紐づくノートはまだありません）
  {% endunless %}
{% endif %}
