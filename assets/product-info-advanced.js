// @ts-nocheck
// assets/product-info-advanced.js
/**
 * Product Info Advanced - Section JavaScript
 * Completely modular ES6 class to handle Bundles, Subscription logic, Accordions & Image Gallerey.
 * Does not rely on jQuery.
 */

class ProductInfoAdvanced {
    constructor(container) {
        this.container = container;

        // Forms and Inputs
        this.form = this.container.querySelector('form[action^="/cart/add"]');
        if (!this.form) return;

        this.variantInput = this.form.querySelector('input[name="id"]');
        this.sellingPlanInput = this.form.querySelector('input[name="selling_plan"]');

        // UI Elements
        this.bundles = Array.from(this.container.querySelectorAll('[data-pia-bundle]'));
        this.subscriptionToggle = this.container.querySelector('[data-pia-subscription]');
        this.submitBtn = this.container.querySelector('[data-pia-submit]');
        this.submitNowPrice = this.container.querySelector('[data-pia-submit-price]');
        this.submitWasPrice = this.container.querySelector('[data-pia-submit-was]');

        // Gallery
        this.mainImage = this.container.querySelector('[data-pia-main-image]');
        this.thumbnails = Array.from(this.container.querySelectorAll('[data-pia-thumb]'));

        // Accordions
        this.accordions = Array.from(this.container.querySelectorAll('[data-pia-accordion]'));

        // State
        this.activeBundle = null;
        this.isSubscribed = false;

        this.init();
    }

    init() {
        this.initGallery();
        this.initMediaCarousels();
        this.initAccordions();
        this.initBundles();
        this.initSubscription();
        this.initFormSubmit();
        this.initTrustPopups();

        // Initial Render
        if (this.bundles.length > 0) {
            this.selectBundle(this.bundles[0]); // Select first by default
        }
    }

    initGallery() {
        if (!this.mainImage || this.thumbnails.length === 0) return;

        this.thumbnails.forEach((thumb) => {
            thumb.addEventListener('click', (e) => {
                const targetSrc = thumb.dataset.src;
                if (!targetSrc) return;

                // Update main image
                this.mainImage.src = targetSrc;

                // Update active class
                this.thumbnails.forEach(t => t.classList.remove('is-active'));
                thumb.classList.add('is-active');
            });
        });

        // Gallery Arrows
        const prevArrow = this.container.querySelector('.product-info-advanced__gallery-prev');
        const nextArrow = this.container.querySelector('.product-info-advanced__gallery-next');

        if (prevArrow && nextArrow) {
            prevArrow.addEventListener('click', () => this.navigateGallery(-1));
            nextArrow.addEventListener('click', () => this.navigateGallery(1));
        }
    }

    navigateGallery(direction) {
        if (!this.thumbnails.length) return;

        let activeIndex = this.thumbnails.findIndex(t => t.classList.contains('is-active'));
        if (activeIndex === -1) activeIndex = 0; // fallback

        let nextIndex = activeIndex + direction;

        // Loop around
        if (nextIndex < 0) nextIndex = this.thumbnails.length - 1;
        if (nextIndex >= this.thumbnails.length) nextIndex = 0;

        // Trigger the thumbnail click handler
        this.thumbnails[nextIndex].click();
    }

    initMediaCarousels() {
        const carousels = Array.from(this.container.querySelectorAll('[data-pia-media-carousel]'));
        carousels.forEach(el => this._initSingleCarousel(el));
    }

    _initSingleCarousel(carouselEl) {
        const track = carouselEl.querySelector('[data-mc-track]');
        const origSlides = Array.from(carouselEl.querySelectorAll('[data-mc-slide]'));
        const dotsContainer = carouselEl.querySelector('[data-mc-dots]');
        const origDots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('[data-dot-index]')) : [];
        const prevBtn = carouselEl.querySelector('.product-info-advanced__mc-prev');
        const nextBtn = carouselEl.querySelector('.product-info-advanced__mc-next');
        const playBtns = Array.from(carouselEl.querySelectorAll('[data-video-url]'));

        if (!track || origSlides.length === 0) return;

        const isInfinite = carouselEl.dataset.mcInfinite === 'true';
        const isAutoplay = carouselEl.dataset.mcAutoplay === 'true';
        const autoplaySpeed = parseInt(carouselEl.dataset.mcAutoplaySpeed) || 3000;
        const isMarquee = carouselEl.dataset.mcMarquee === 'true';
        const marqueeSpeed = parseInt(carouselEl.dataset.mcMarqueeSpeed) || 60;
        const GAP = 12;

        // ── MARQUEE ────────────────────────────────────────────────
        if (isMarquee) {
            origSlides.forEach(s => track.appendChild(s.cloneNode(true)));
            let pos = 0, lastTs = null, rafId;
            const animate = (ts) => {
                if (lastTs !== null) {
                    pos += (marqueeSpeed * (ts - lastTs)) / 1000;
                    const origW = origSlides.reduce((acc, s) => acc + s.offsetWidth + GAP, 0);
                    if (pos >= origW) pos -= origW;
                    track.style.transform = `translateX(-${pos}px)`;
                }
                lastTs = ts;
                rafId = requestAnimationFrame(animate);
            };
            rafId = requestAnimationFrame(animate);
            carouselEl.addEventListener('mouseenter', () => { cancelAnimationFrame(rafId); lastTs = null; });
            carouselEl.addEventListener('mouseleave', () => { rafId = requestAnimationFrame(animate); });
            return;
        }

        // ── INFINITE: clone slides at both ends for seamless wrap ──
        const N = origSlides.length;
        let allSlides = origSlides;
        let offset0 = 0;

        if (isInfinite && N > 1) {
            [...origSlides].reverse().forEach(s => {
                const c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true');
                track.insertBefore(c, track.firstChild);
            });
            origSlides.forEach(s => {
                const c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true');
                track.appendChild(c);
            });
            allSlides = Array.from(track.querySelectorAll('[data-mc-slide]'));
            offset0 = N;
        }

        let idx = offset0;
        let autoplayTimer = null;

        const slideW = () => allSlides[0] ? allSlides[0].getBoundingClientRect().width : 0;

        const maxScrollOff = () => {
            if (isInfinite) return Infinity;
            const cw = track.parentElement ? track.parentElement.getBoundingClientRect().width : 0;
            const tw = origSlides.reduce((a, s) => a + s.getBoundingClientRect().width + GAP, 0) - GAP;
            return Math.max(0, tw - cw);
        };

        const applyPos = (i, instant) => {
            const sw = slideW();
            let off = i * (sw + GAP);
            if (!isInfinite) off = Math.min(off, maxScrollOff());
            if (instant) {
                const prev = track.style.transition;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${off}px)`;
                track.getBoundingClientRect();
                track.style.transition = prev;
            } else {
                track.style.transform = `translateX(-${off}px)`;
            }
        };

        const realIdx = (vi) => ((vi - offset0) % N + N) % N;
        const syncDots = (ri) => origDots.forEach((d, i) => d.classList.toggle('is-active', i === ri));
        const syncBtns = () => {
            if (isInfinite) { if (prevBtn) prevBtn.disabled = false; if (nextBtn) nextBtn.disabled = false; return; }
            if (prevBtn) prevBtn.disabled = idx === 0;
            if (nextBtn) nextBtn.disabled = idx >= N - 1;
        };

        const goTo = (newIdx, instant = false) => {
            if (!isInfinite) {
                newIdx = Math.max(0, Math.min(newIdx, N - 1));
                const sw = slideW(); const maxOff = maxScrollOff();
                const curOff = Math.min(idx * (sw + GAP), maxOff);
                const newOff = Math.min(newIdx * (sw + GAP), maxOff);
                if (Math.abs(newOff - curOff) < 0.5) { idx = newIdx; syncDots(idx); syncBtns(); return; }
            }
            idx = newIdx;
            applyPos(idx, instant);
            syncDots(isInfinite ? realIdx(idx) : idx);
            syncBtns();
        };

        if (isInfinite) {
            track.addEventListener('transitionend', (e) => {
                if (e.propertyName !== 'transform') return;
                if (idx >= offset0 + N) { idx -= N; applyPos(idx, true); }
                else if (idx < offset0) { idx += N; applyPos(idx, true); }
            });
        }

        const resetAutoplay = () => {
            if (!isAutoplay) return;
            clearInterval(autoplayTimer);
            autoplayTimer = setInterval(() => goTo(idx + 1), autoplaySpeed);
        };

        if (prevBtn) prevBtn.addEventListener('click', () => { goTo(idx - 1); resetAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goTo(idx + 1); resetAutoplay(); });
        origDots.forEach(d => d.addEventListener('click', () => {
            const ri = parseInt(d.dataset.dotIndex, 10);
            goTo(isInfinite ? ri + offset0 : ri); resetAutoplay();
        }));

        if (isAutoplay) {
            autoplayTimer = setInterval(() => goTo(idx + 1), autoplaySpeed);
            carouselEl.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
            carouselEl.addEventListener('mouseleave', () => resetAutoplay());
        }

        // Video playback
        playBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.videoUrl;
                const mediaWrap = btn.closest('.product-info-advanced__review-media');
                if (!mediaWrap || !url) return;
                let el;
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
                    if (!id) return;
                    el = document.createElement('iframe');
                    el.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
                    el.allow = 'autoplay; encrypted-media; fullscreen';
                    el.allowFullscreen = true;
                } else if (url.includes('vimeo.com')) {
                    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
                    if (!id) return;
                    el = document.createElement('iframe');
                    el.src = `https://player.vimeo.com/video/${id}?autoplay=1`;
                    el.allow = 'autoplay; fullscreen';
                    el.allowFullscreen = true;
                } else {
                    el = document.createElement('video');
                    el.src = url; el.controls = true; el.autoplay = true; el.playsInline = true;
                }
                el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;object-fit:cover;';
                mediaWrap.innerHTML = '';
                mediaWrap.appendChild(el);
            });
        });

        // Touch swipe
        let tx = 0, ty = 0;
        track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
        track.addEventListener('touchend', e => {
            const dx = tx - e.changedTouches[0].clientX;
            const dy = Math.abs(ty - e.changedTouches[0].clientY);
            if (Math.abs(dx) > 40 && Math.abs(dx) > dy) { goTo(idx + (dx > 0 ? 1 : -1)); resetAutoplay(); }
        }, { passive: true });

        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { applyPos(idx, true); syncBtns(); }, 100); });

        applyPos(idx, true);
        syncDots(isInfinite ? realIdx(idx) : idx);
        syncBtns();
    }

    initTrustPopups() {
        const popupLinks = Array.from(this.container.querySelectorAll('a[data-pia-popup]'));
        if (!popupLinks.length) return;

        let modal = document.getElementById('pia-trust-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pia-trust-modal';
            modal.innerHTML = `
                <div class="pia-modal-overlay" data-pia-modal-close></div>
                <div class="pia-modal-container">
                    <button type="button" class="pia-modal-close" data-pia-modal-close aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <div class="pia-modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelectorAll('[data-pia-modal-close]').forEach(el => {
                el.addEventListener('click', () => modal.classList.remove('is-open'));
            });

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') modal.classList.remove('is-open');
            });
        }

        const modalBody = modal.querySelector('.pia-modal-body');

        const showError = (url, detail) => {
            const debugLine = detail ? `<small style="display:block;margin-top:8px;font-size:11px;color:#9ca3af;word-break:break-all;opacity:.8;">${detail}</small>` : '';
            modalBody.innerHTML = `
                <div class="pia-modal-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p>Could not load content.</p>
                    ${debugLine}
                    <a href="${url}" target="_blank" rel="noopener">Open in new tab ↗</a>
                </div>`;
        };

        const renderHtml = (html, url) => {
            try {
                // Inject a <base> tag so all relative URLs (CSS, images, links)
                // resolve correctly inside the srcdoc iframe.
                const base = `<base href="${window.location.origin}/">`;
                const htmlWithBase = html.replace(/<head([^>]*)>/i, (m) => m + base);

                const iframe = document.createElement('iframe');
                iframe.setAttribute('sandbox', 'allow-same-origin allow-popups allow-forms');
                iframe.style.cssText = 'display:block;width:100%;height:100%;border:0;';
                // srcdoc renders inline HTML, bypassing X-Frame-Options completely
                iframe.srcdoc = htmlWithBase;

                modalBody.innerHTML = '';
                modalBody.appendChild(iframe);
            } catch (err) {
                console.warn('[PIA Modal] Render error:', err.message);
                showError(url, 'Render error: ' + err.message);
            }
        };

        popupLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const rawUrl = link.getAttribute('href');
                if (!rawUrl) return;

                modal.classList.add('is-open');
                modalBody.innerHTML = '<div class="pia-modal-loading"><span></span>Loading…</div>';

                let isSameOrigin = false;
                let fetchUrl = rawUrl;
                try {
                    const parsed = new URL(rawUrl, window.location.origin);
                    isSameOrigin = (parsed.origin === window.location.origin);
                    if (isSameOrigin) {
                        fetchUrl = parsed.pathname + (parsed.search || '');
                    }
                } catch (_) { /* keep rawUrl */ }

                if (isSameOrigin) {
                    // Same-origin Shopify page: fetch then render in srcdoc iframe
                    // (srcdoc bypasses X-Frame-Options entirely)
                    fetch(fetchUrl, {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Accept': 'text/html, */*' }
                    })
                        .then(r => r.text())
                        .then(html => {
                            if (!html || html.trim().length < 50) throw new Error('empty response');
                            renderHtml(html, rawUrl);
                        })
                        .catch(err => {
                            console.warn('[PIA Modal] Fetch failed:', fetchUrl, err.message);
                            showError(rawUrl, err.message);
                        });
                } else {
                    // External URL: try direct iframe src.
                    // If the site blocks embedding (X-Frame-Options), show a friendly fallback bar.
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');
                    iframe.style.cssText = 'display:block;width:100%;flex:1;min-height:0;border:0;';
                    iframe.src = rawUrl;

                    const bar = document.createElement('div');
                    bar.className = 'pia-modal-ext-bar';
                    bar.innerHTML = `<span>Can&#39;t see the page?</span><a href="${rawUrl}" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>`;

                    modalBody.innerHTML = '';
                    modalBody.appendChild(iframe);
                    modalBody.appendChild(bar);
                }
            });
        });
    }

    initAccordions() {
        this.accordions.forEach(acc => {
            const trigger = acc.querySelector('[data-pia-accordion-trigger]');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = acc.classList.contains('is-open');

                    // Optionally close others
                    this.accordions.forEach(a => a.classList.remove('is-open'));

                    if (!isOpen) {
                        acc.classList.add('is-open');
                    }
                });
            }
        });
    }

    initBundles() {
        this.bundles.forEach(bundle => {
            bundle.addEventListener('click', () => {
                this.selectBundle(bundle);
            });
        });
    }

    initSubscription() {
        if (this.subscriptionToggle) {
            // Check initial configured state
            this.isSubscribed = this.subscriptionToggle.classList.contains('is-active');

            this.subscriptionToggle.addEventListener('click', () => {
                this.isSubscribed = !this.isSubscribed;
                this.subscriptionToggle.classList.toggle('is-active', this.isSubscribed);
                this.updateFormState();
                this.updatePricingUI();
            });
        }
    }

    initFormSubmit() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!this.activeBundle) return;
            const variantId = this.activeBundle.dataset.variantId;
            if (!variantId) return;

            let planId = null;
            if (this.isSubscribed && this.subscriptionToggle) {
                // Determine the correct selling plan ID for the active bundle
                // Fallback to the default plan ID if the bundle doesn't specify one
                const rawPlanId = this.activeBundle.dataset.sellingPlanId || this.subscriptionToggle.dataset.defaultPlanId;
                if (rawPlanId && String(rawPlanId).trim() !== "") {
                    planId = parseInt(String(rawPlanId).trim(), 10);
                }
            }

            // Wrap in the standard multiple-item payload structure
            const formData = {
                items: [{
                    id: parseInt(variantId, 10),
                    quantity: 1
                }]
            };

            if (planId) {
                formData.items[0].selling_plan = planId;
            }

            const btn = this.submitBtn;
            let btnTextSpan = null;
            if (btn) {
                btnTextSpan = btn.querySelector('.product-info-advanced__submit-text');
                btn.disabled = true;
                btn.classList.add('is-loading');
                if (btnTextSpan) {
                    btn.dataset.originalText = btnTextSpan.innerHTML;
                    btnTextSpan.innerHTML = `Adding to Cart...`;
                    btnTextSpan.style.opacity = '0.7';
                }
            }

            // Collect all cart-items-component section IDs so we can request updated HTML
            const cartItemsComponents = document.querySelectorAll('cart-items-component[data-section-id]');
            const sectionIds = Array.from(cartItemsComponents).map(el => el.dataset.sectionId);

            const requestBody = {
                ...formData,
                sections: sectionIds.join(',') || undefined,
                sections_url: window.location.pathname,
            };

            // Bypass Appstle and other global interceptors by using a pristine fetch from an iframe
            let pristineFetch = window.fetch;
            try {
                let iframe = document.getElementById('pia-clean-fetch');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'pia-clean-fetch';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }
                pristineFetch = iframe.contentWindow.fetch || window.fetch;
            } catch (e) {
                console.warn('[PIA] Could not create pristine fetch', e);
            }

            pristineFetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(requestBody),
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.status) {
                        console.warn('Cart add error:', data.description);
                        if (btnTextSpan) {
                            btnTextSpan.innerHTML = `Error`;
                        }
                        setTimeout(() => {
                            if (btnTextSpan) {
                                btnTextSpan.innerHTML = btn.dataset.originalText;
                                btnTextSpan.style.opacity = '';
                            }
                            if (btn) {
                                btn.disabled = false;
                                btn.classList.remove('is-loading');
                            }
                        }, 2000);
                        return;
                    }

                    // Success — dispatch a proper 'cart:update' event matching CartAddEvent structure.
                    // cart-items-component will use event.detail.data.sections to morph its HTML.
                    // cart-drawer-component listens for 'cart:update' and opens when auto-open attr is set.
                    document.dispatchEvent(new CustomEvent('cart:update', {
                        bubbles: true,
                        detail: {
                            resource: data,
                            sourceId: 'product-info-advanced',
                            data: {
                                sections: data.sections || {},
                                itemCount: data.item_count,
                                variantId: String(variantId),
                                source: 'product-info-advanced',
                            },
                        },
                    }));

                    if (btnTextSpan) {
                        btnTextSpan.innerHTML = `✓ Added`;
                        btnTextSpan.style.opacity = '1';
                    }

                    // Open the cart drawer
                    const cartDrawer = document.querySelector('cart-drawer-component');
                    if (cartDrawer && typeof cartDrawer.open === 'function') {
                        cartDrawer.open();
                    }

                    setTimeout(() => {
                        if (btnTextSpan) {
                            btnTextSpan.innerHTML = btn.dataset.originalText;
                            btnTextSpan.style.opacity = '';
                        }
                        if (btn) {
                            btn.disabled = false;
                            btn.classList.remove('is-loading');
                        }
                    }, 2000);
                })
                .catch((err) => {
                    console.error('Add to cart failed:', err);
                    if (btnTextSpan) {
                        btnTextSpan.innerHTML = `Error`;
                    }
                    setTimeout(() => {
                        if (btnTextSpan) {
                            btnTextSpan.innerHTML = btn.dataset.originalText;
                            btnTextSpan.style.opacity = '';
                        }
                        if (btn) {
                            btn.disabled = false;
                            btn.classList.remove('is-loading');
                        }
                    }, 2000);
                });
        });
    }

    selectBundle(bundle) {
        this.activeBundle = bundle;
        this.bundles.forEach(b => b.classList.remove('is-selected'));
        bundle.classList.add('is-selected');

        this.updateFormState();
        this.updatePricingUI();
    }

    updateFormState() {
        if (!this.activeBundle) return;

        const variantId = this.activeBundle.dataset.variantId;
        if (this.variantInput && variantId) {
            this.variantInput.value = variantId;
        }

        if (this.sellingPlanInput) {
            if (this.isSubscribed) {
                const planId = this.activeBundle.dataset.sellingPlanId || this.subscriptionToggle.dataset.defaultPlanId;
                this.sellingPlanInput.value = planId || "";
                this.sellingPlanInput.removeAttribute('disabled');
            } else {
                this.sellingPlanInput.value = "";
                this.sellingPlanInput.setAttribute('disabled', 'disabled');
            }
        }
    }

    updatePricingUI() {
        if (!this.activeBundle) return;

        let priceCents = parseInt(this.activeBundle.dataset.price, 10);
        const compareCents = parseInt(this.activeBundle.dataset.comparePrice, 10);
        const compareValid = this.activeBundle.dataset.compareValid === 'true';

        let finalFormat = this.activeBundle.dataset.priceFormatted;

        // Apply subscription discount if active
        if (this.isSubscribed && this.subscriptionToggle) {
            const discountPct = parseFloat(this.subscriptionToggle.dataset.discountPct || 0);
            if (discountPct > 0) {
                priceCents = Math.round(priceCents * (1 - (discountPct / 100)));
                finalFormat = this.formatMoney(priceCents);
            }
        }

        // Update Button
        if (this.submitNowPrice) {
            this.submitNowPrice.innerHTML = finalFormat;
        }

        if (this.submitWasPrice) {
            if (compareValid && compareCents > priceCents) {
                this.submitWasPrice.innerHTML = this.formatMoney(compareCents);
                this.submitWasPrice.style.display = 'inline';
            } else {
                this.submitWasPrice.style.display = 'none';
            }
        }
    }

    /**
     * Shopify money formatter utility.
     * Uses the shop money_format (with currency symbol, not ISO code) to format prices.
     * Priority: Shopify.money_format → window.theme.moneyFormat → symbol lookup → plain symbol fallback.
     */
    formatMoney(cents) {
        const value = (cents / 100).toFixed(2);
        const valueWithComma = parseFloat(value).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // 1. Prefer Shopify.money_format — contains the symbol (e.g. "£{{amount}}")
        const moneyFormat = (window.Shopify && window.Shopify.money_format)
            || (window.theme && window.theme.moneyFormat)
            || null;

        if (moneyFormat) {
            return moneyFormat
                .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, valueWithComma)
                .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, Math.round(cents / 100).toLocaleString('en'))
                .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, Math.round(cents / 100))
                .replace(/\{\{\s*amount\s*\}\}/g, value);
        }

        // 2. Symbol lookup table for common currencies — no ISO code used
        const symbolMap = {
            GBP: '£', USD: '$', EUR: '€', AUD: '$', CAD: '$', NZD: '$',
            JPY: '¥', CHF: 'CHF ', SEK: 'kr', NOK: 'kr', DKK: 'kr',
            SGD: 'S$', HKD: 'HK$', ZAR: 'R', MXN: '$', BRL: 'R$',
            INR: '₹', AED: 'AED ', SAR: 'SAR '
        };
        const isoCode = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'GBP';
        const symbol = symbolMap[isoCode] || isoCode + ' ';
        return symbol + value;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-section-type="product-info-advanced"]').forEach(el => {
        new ProductInfoAdvanced(el);
    });
});

// Re-init on Shopify theme editor changes
document.addEventListener('shopify:section:load', (e) => {
    if (e.target.querySelector('[data-section-type="product-info-advanced"]')) {
        new ProductInfoAdvanced(e.target.querySelector('[data-section-type="product-info-advanced"]'));
    }
});
