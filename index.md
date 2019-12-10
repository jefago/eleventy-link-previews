---
title: Rich link previews in Eleventy
layout: layout.njk
---
# Rich link previews in Eleventy
This is a demonstration of rich link previews in Eleventy

## With image
{{"https://www.jefago.com/product-leadership/creating-product-roadmaps/" | linkPreview | safe}}

## Without image
{{"https://www.jefago.com/" | linkPreview | safe}}
