# FAQ

## Can I use this with any theme?

Yes. Copy the 5 files into any Online Store 2.0 theme and add the sections in the Theme Editor.

## Does the subscription toggle work with my app?

It works with any app that reads the standard `selling_plan` hidden form field (Recharge, Skio, Bold, native Shopify Subscriptions).

## Why does the modal show "refused to connect" for some URLs?

External sites often block iframes via `X-Frame-Options`. Use a Shopify page URL (`/pages/...`) instead — those load correctly.
