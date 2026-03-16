# Install Guide

This repository currently exposes two main Shopify sections:

- `Product Info Advanced`
- `Product Announcement Bar`

## Files To Copy

Copy these files into your target Shopify theme:

```text
sections/product-info-advanced.liquid
assets/product-info-advanced.css
assets/product-info-advanced.js
sections/product-announcement-bar.liquid
assets/product-announcement-bar.css
```

## Recommended Push Command

Use a selective push so you only update these sections and preserve the rest of the live theme:

```bash
shopify theme push --theme <theme-id> \
  --only sections/product-info-advanced.liquid \
  --only assets/product-info-advanced.css \
  --only assets/product-info-advanced.js \
  --only sections/product-announcement-bar.liquid \
  --only assets/product-announcement-bar.css \
  --allow-live
```

## Add In Theme Editor

### Product Info Advanced

1. Open the product template in the Shopify Theme Editor.
2. Add the `Product Info Advanced` section.
3. Configure the product media, bundles, trust blocks, rating block, benefits grid, sticky left column, and media carousel settings.

### Product Announcement Bar

1. Add the `Product Announcement Bar` section where you want promotional messaging to appear.
2. Add announcement blocks for each message.
3. Configure separators, scrolling mode, colors, spacing, and mobile typography.

## Notes

- `Product Info Advanced` uses both Liquid and JavaScript, so all three related files are required.
- `Product Announcement Bar` uses one section file and one CSS asset.
- For best results, test desktop and mobile separately after pushing because both sections include independent mobile controls.
