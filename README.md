# 🛍️ Shopify — Product Info Advanced + Product Announcement Bar

A high-conversion Shopify theme setup for Online Store 2.0 with two fully customizable sections:

- `Product Info Advanced` for product pages
- `Product Announcement Bar` for promo, shipping, urgency, and trust messaging

Everything is built with native Liquid, CSS, and vanilla JavaScript, with the newest customizer options already included in this repository.

![Shopify](https://img.shields.io/badge/Shopify-96BF48?style=flat-square&logo=shopify&logoColor=white)
![Liquid](https://img.shields.io/badge/Liquid-000000?style=flat-square&logo=shopify&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS_Custom_Properties-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## 📸 Visual Preview

`Figma-Shopify-Demo.mp4`

### Figma Design References

#### Desktop
![Desktop Figma Design](docs/figma-design-desktop.png)

#### Mobile
![Mobile Figma Design](docs/figma-design-mobile.png)

---

## ✨ Included Sections

### `Product Info Advanced`

A conversion-focused product section for DTC and supplement brands that need social proof, urgency, bundles, sticky product media, and highly customizable product content without third-party apps.

### `Product Announcement Bar`

A configurable announcement bar section that supports multiple messages, icons, optional scrolling marquee behavior, centered separators between messages, and separate desktop/mobile spacing controls.

---

## 🚀 Highlights

### Product Info Advanced

- App-free bundle picker with per-card image, quantity, variant, label, and pricing
- Built-in subscription toggle using Shopify's standard `selling_plan` field
- Trust signal blocks with popup modal, redirect, or new-tab link behavior
- Rating block with rich text, typography controls, star sizing, color, count, custom icons, and half-star support
- Benefits Grid block with up to 9 items, desktop/mobile column control, image or SVG icons, and responsive typography/icon sizing
- Sticky left column support for desktop product media and left-side content
- Mobile image spacing controls for reducing or tightening the gap below the main product media
- Description typography controls for desktop and mobile
- Gallery arrow sizing controls for desktop and mobile, including custom arrow uploads
- Media Carousel with:
  - infinite looping
  - autoplay
  - marquee mode
  - hide/show arrows and dots
  - custom arrow uploads
  - navigation background styling
  - support for image, video, YouTube, Vimeo, and `cdn.shopify.com` video URLs
  - image/video fit and aspect ratio controls

### Product Announcement Bar

- Multiple announcement blocks with icon image or inline SVG support
- Optional scrolling marquee mode
- Centered separators inserted automatically between messages
- Section-level separator controls for enable/disable, style, color, and size
- Independent desktop and mobile spacing controls
- Mobile-specific text size control
- Desktop/mobile visibility toggles

---

## 📦 Important Files

```text
sections/product-info-advanced.liquid
assets/product-info-advanced.css
assets/product-info-advanced.js
sections/product-announcement-bar.liquid
assets/product-announcement-bar.css
README.md
INSTALL.md
docs/figma-design-desktop.png
docs/figma-design-mobile.png
```

---

## ⚙️ Quick Install

1. Copy these files into your Shopify theme:

```text
sections/product-info-advanced.liquid
assets/product-info-advanced.css
assets/product-info-advanced.js
sections/product-announcement-bar.liquid
assets/product-announcement-bar.css
```

2. Push only the section files you want to update:

```bash
shopify theme push --theme <theme-id> \
  --only sections/product-info-advanced.liquid \
  --only assets/product-info-advanced.css \
  --only assets/product-info-advanced.js \
  --only sections/product-announcement-bar.liquid \
  --only assets/product-announcement-bar.css \
  --allow-live
```

3. In the Shopify Theme Editor:

- Add `Product Info Advanced` to your product template
- Add `Product Announcement Bar` where you want promotional messaging to appear
- Configure the new desktop/mobile controls, carousel behavior, sticky left column, rating styles, and separator settings

More setup detail is available in `INSTALL.md`.

---

## 🧩 How It Works

### Product Info Advanced

- Liquid outputs scoped CSS variables from the section and block settings
- CSS handles layout, responsive sizing, sticky behavior, and visual styling
- Vanilla JS powers bundles, subscription toggle, media carousel, gallery interactions, and video playback

### Product Announcement Bar

- Liquid renders announcement items and inserts separators automatically between messages
- Section settings control separator appearance and responsive spacing
- CSS handles static and scrolling layouts

---

## 🛒 Compatibility

| Setup | Notes |
|---|---|
| Any Shopify Online Store 2.0 theme | Copy the files above and add the sections in the Theme Editor |
| Shopify subscription apps | Works with apps that read the standard `selling_plan` field |
| Shopify pages in modal | Same-origin pages can be fetched and rendered inside the popup |
| External modal URLs | Loaded by iframe, with fallback behavior for restricted sites |
| Native images and hosted videos | Includes support for direct image uploads and `cdn.shopify.com` video links |

---

## 🧪 Testing Checklist

- Bundle cards update variant, quantity, and displayed price correctly
- Subscription toggle injects and removes `selling_plan` correctly
- Trust signal popup loads same-origin Shopify pages
- Rating block typography, star size, star gap, and mobile controls render correctly
- Benefits Grid respects desktop/mobile columns and item visibility
- Sticky left column holds the media stack in place on desktop while the right column scrolls
- Main gallery custom arrows resize correctly on desktop and mobile
- Media Carousel infinite mode loops cleanly without empty end space
- Media Carousel nav background applies only where expected
- Product Announcement Bar separators stay centered between messages
- Product Announcement Bar scrolling mode repeats cleanly without gap breaks
- Product Announcement Bar mobile spacing and mobile text size render correctly

---

## 🐛 Troubleshooting

| Issue | What to check |
|---|---|
| Sticky left column not working | Check for ancestor overflow rules that create a scroll container |
| Modal content fails to load | Verify the target URL is public and iframe-compatible |
| Custom icons look distorted | Check icon size settings and confirm the uploaded asset has enough resolution |
| Carousel reaches the end incorrectly | Confirm infinite mode, visible card count, and nav options are configured as intended |
| Announcement bar spacing looks off on mobile | Review mobile margin, padding, and font size settings |

---

## 📄 License

MIT. Free for personal and commercial use. See `LICENSE`.

---

## 💬 Support

- Open an issue on GitHub
- Contact: `rsusano123s@gmail.com`
