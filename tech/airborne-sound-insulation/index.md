---
layout: default
title: 空気音遮断
permalink: /tech/airborne-sound-insulation/
---

# 空気音遮断 × 全用途

{% assign notes = site.notes | default: "" | split: "" %}
{% if notes == empty %}
  （まだノートがありません）
{% else %}
  {% assign notes = site.notes | sort: "title" %}
  {% assign found = false %}
  <ul class="notes">
  {% for p in notes %}
    {% if p['技術'] and p['技術'] contains '空気音遮断' %}
      <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a> — {{ p.description | default:'' }}</li>
      {% assign found = true %}
    {% endif %}
  {% endfor %}
  </ul>
  {% unless found %}
    （空気音遮断に紐づくノートはまだありません）
  {% endunless %}
{% endif %}
