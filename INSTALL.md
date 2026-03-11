# 📥 Installation Guide

Installing **Product Info Advanced** into a client's Shopify theme takes under 5 minutes.

---

## What you need

- Shopify CLI installed (`npm install -g @shopify/cli`)
- Access to the client's Shopify store (Partner access or store login)
- The client's theme ID (get it with `shopify theme list`)

---

## Step 1: Copy the 3 files into the theme

From this repo, copy these files into your local copy of the client's theme:

```
sections/product-info-advanced.liquid  →  <client-theme>/sections/
assets/product-info-advanced.css       →  <client-theme>/assets/
assets/product-info-advanced.js        →  <client-theme>/assets/
```

---

## Step 2: Find the theme ID

```bash
shopify theme list --store <store-name>.myshopify.com
```

Note the numeric ID next to the theme you want to update (e.g. `#186679689538`).

---

## Step 3: Push only the section files

> ⚠️ Always use `--only` to push selectively. This preserves all existing theme customizer settings.

```bash
shopify theme push --theme <theme-id> \
  --only sections/product-info-advanced.liquid \
  --only assets/product-info-advanced.css \
  --only assets/product-info-advanced.js \
  --allow-live
```

**Example:**
```bash
shopify theme push --theme 186679689538 \
  --only sections/product-info-advanced.liquid \
  --only assets/product-info-advanced.css \
  --only assets/product-info-advanced.js \
  --allow-live
```

---

## Step 4: Add the section in the Theme Editor

1. Go to **Shopify Admin → Online Store → Themes**
2. Click **Customize** on the live theme
3. Navigate to the **Product** page template
4. Click **Add section** and select **Product Info Advanced**
5. Configure all settings (see Step 5 below)

---

## Step 5: Configure the section

### Trust Signals
- Add up to **4 Trust Signal blocks**
- For each block, set: flag image, label text, link behaviour, and link URL
- For popup/modal links: use a Shopify page URL (e.g. `/pages/guarantee`) for best results

### Bundle Options
- Add **Bundle Card blocks**, one per bundle option
- Set the image, variant, quantity, and price label for each card
- Set **Image fit** and **Aspect ratio** to match the product photography style

### Subscription Toggle
- Enable the toggle and assign a **Selling Plan** from the dropdown
- Set the default state to `One-time` or `Subscribe & Save`
- Your existing subscription app (Recharge, Skio, Bold, etc.) will process it automatically

### Main Image Badge
- Set badge text or upload a custom badge icon
- Choose position (corner), font size, padding, and margin via the sliders

### Media Carousel
- Set **Visible cards (mobile)** to `2.5` for the swipe-peek effect on mobile

---

## Quick-push script (optional)

Save this as `push-pia.ps1` in your project and run it whenever you update the section:

```powershell
shopify theme push --theme <theme-id> `
  --only sections/product-info-advanced.liquid `
  --only assets/product-info-advanced.css `
  --only assets/product-info-advanced.js `
  --allow-live
```

---

## Updating an existing install

When you receive a new version of the section, repeat Steps 1 and 3.  
The `--only` flag ensures **no existing customizer settings are overwritten**.
