// @ts-nocheck
/**
 * Product Information V2 - Section JavaScript
 * Handles: Bundle selection, dynamic price updates, gallery, carousel, accordions
 */

(function () {
  'use strict';

  // ============================================
  // GALLERY CLASS
  // ============================================
  class ProductV2Gallery {
    constructor(el) {
      this.el = el;
      this.mainImg = el.querySelector('[data-piv2-main-img]');
      this.thumbs = el.querySelectorAll('[data-piv2-thumb]');
      this.navPrev = el.querySelector('[data-piv2-prev]');
      this.navNext = el.querySelector('[data-piv2-next]');
      this.mediaItems = Array.from(el.querySelectorAll('[data-piv2-media]'));
      this.currentIndex = 0;

      this.init();
    }

    init() {
      if (this.navPrev) this.navPrev.addEventListener('click', () => this.move(-1));
      if (this.navNext) this.navNext.addEventListener('click', () => this.move(1));

      this.thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => this.goTo(i));
      });
    }

    goTo(index) {
      if (index < 0 || index >= this.mediaItems.length) return;
      this.currentIndex = index;

      const selected = this.mediaItems[index];
      const newSrc = selected.dataset.src;
      const newAlt = selected.dataset.alt || '';

      if (this.mainImg) {
        this.mainImg.style.opacity = '0';
        setTimeout(() => {
          this.mainImg.src = newSrc;
          this.mainImg.alt = newAlt;
          this.mainImg.style.opacity = '1';
        }, 150);
      }

      this.thumbs.forEach((t, i) => {
        t.classList.toggle('is-active', i === index);
      });
    }

    move(dir) {
      const next = (this.currentIndex + dir + this.mediaItems.length) % this.mediaItems.length;
      this.goTo(next);
    }
  }

  // ============================================
  // BUNDLE SELECTION + DYNAMIC PRICE
  // ============================================
  class ProductV2BundleSelector {
    constructor(el) {
      this.el = el;
      this.bundles = Array.from(el.querySelectorAll('[data-piv2-bundle]'));
      this.atcBtn = el.querySelector('[data-piv2-atc]');
      this.priceNow = el.querySelector('[data-piv2-price-now]');
      this.priceWas = el.querySelector('[data-piv2-price-was]');
      this.subscribeToggle = el.querySelector('[data-piv2-subscribe]');
      this.subscribeCheckbox = el.querySelector('[data-piv2-subscribe-checkbox]');
      this.subscribeDiscount = parseFloat(
        el.dataset.piv2SubscribeDiscount || '20'
      );
      this.selectedBundle = null;
      this.isSubscribed = true;

      this.init();
    }

    init() {
      this.bundles.forEach((bundle) => {
        bundle.addEventListener('click', () => this.selectBundle(bundle));
      });

      // Select first bundle by default
      if (this.bundles.length > 0) {
        this.selectBundle(this.bundles[0]);
      }

      // Subscription toggle
      if (this.subscribeToggle) {
        this.subscribeToggle.addEventListener('click', () => {
          this.isSubscribed = !this.isSubscribed;
          this.updateSubscribeUI();
          this.updateAtcPrice();
        });
      }

      // Add to cart
      if (this.atcBtn) {
        this.atcBtn.addEventListener('click', (e) => this.handleAtc(e));
      }
    }

    selectBundle(bundle) {
      this.bundles.forEach((b) => b.classList.remove('is-selected'));
      bundle.classList.add('is-selected');
      this.selectedBundle = bundle;
      this.updateAtcPrice();
    }

    updateAtcPrice() {
      if (!this.selectedBundle) return;

      let price = parseFloat(this.selectedBundle.dataset.price || 0);
      const comparePrice = parseFloat(this.selectedBundle.dataset.comparePrice || 0);
      const priceFormatted = this.selectedBundle.dataset.priceFormatted || '';
      const comparePriceFormatted = this.selectedBundle.dataset.comparePriceFormatted || '';

      if (this.isSubscribed && this.subscribeDiscount > 0) {
        price = price * (1 - this.subscribeDiscount / 100);
      }

      if (this.priceNow) {
        this.priceNow.textContent = priceFormatted || this.formatMoney(price);
      }
      if (this.priceWas && comparePrice > 0) {
        this.priceWas.textContent = comparePriceFormatted || this.formatMoney(comparePrice);
        this.priceWas.style.display = '';
      } else if (this.priceWas) {
        this.priceWas.style.display = 'none';
      }

      // Update variant ID on form if applicable
      const variantId = this.selectedBundle.dataset.variantId;
      const formVariantInput = this.el.querySelector('[name="id"]');
      if (formVariantInput && variantId) {
        formVariantInput.value = variantId;
      }
    }

    updateSubscribeUI() {
      if (!this.subscribeCheckbox) return;
      const icon = this.subscribeCheckbox.querySelector('svg');
      if (this.isSubscribed) {
        this.subscribeCheckbox.style.background = 'var(--piv2-primary)';
        if (icon) icon.style.display = '';
      } else {
        this.subscribeCheckbox.style.background = 'transparent';
        if (icon) icon.style.display = 'none';
      }
    }

    formatMoney(cents) {
      if (window.Shopify && window.Shopify.currency) {
        // Shopify money formatting helper
        const format = window.Shopify.money_format || '£{{amount}}';
        return format.replace('{{amount}}', (cents / 100).toFixed(2));
      }
      return '£' + (cents / 100).toFixed(2);
    }

    handleAtc(e) {
      e.preventDefault();
      const variantId = this.selectedBundle?.dataset.variantId;
      if (!variantId) return;

      const qty = 1;
      const formData = {
        id: variantId,
        quantity: qty,
        selling_plan: this.isSubscribed ? this.selectedBundle?.dataset.sellingPlanId : null,
      };

      // Filter null values
      Object.keys(formData).forEach((k) => {
        if (formData[k] === null || formData[k] === undefined) delete formData[k];
      });

      const btn = this.atcBtn;
      btn.disabled = true;
      btn.classList.add('is-loading');

      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<span style="opacity:0.7;">Adding...</span>`;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status) {
            // Error from Shopify
            console.warn('Cart add error:', data.description);
            btn.innerHTML = `<span style="opacity:0.7;">Error</span>`;
            setTimeout(() => {
              btn.innerHTML = originalHtml;
              btn.disabled = false;
              btn.classList.remove('is-loading');
            }, 2000);
            return;
          }
          // Success - fire cart updated events
          btn.innerHTML = `<span>✓ Added to Cart</span>`;
          document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
          window.dispatchEvent(new CustomEvent('piv2:cart-added', { detail: data }));

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            btn.classList.remove('is-loading');
          }, 2000);

          // Try to trigger Shopify cart drawer if available
          if (typeof window.CartDrawer !== 'undefined') {
            window.CartDrawer.open?.();
          }
        })
        .catch((err) => {
          console.error('Add to cart failed:', err);
          btn.innerHTML = `<span style="opacity:0.7;">Error</span>`;
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            btn.classList.remove('is-loading');
          }, 2000);
        });
    }
  }

  // ============================================
  // REVIEW CAROUSEL
  // ============================================
  class ProductV2ReviewCarousel {
    constructor(el) {
      this.el = el;
      this.track = el.querySelector('[data-piv2-reviews-track]');
      this.slides = Array.from(el.querySelectorAll('[data-piv2-review-slide]'));
      this.dots = Array.from(el.querySelectorAll('[data-piv2-review-dot]'));
      this.prevBtn = el.querySelector('[data-piv2-reviews-prev]');
      this.nextBtn = el.querySelector('[data-piv2-reviews-next]');
      this.currentIndex = 0;
      this.slidesVisible = 3;
      this.totalSlides = this.slides.length;

      this.init();
    }

    init() {
      if (!this.track || this.totalSlides === 0) return;
      this.updateSlidesVisible();

      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.move(-1));
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.move(1));

      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });

      window.addEventListener('resize', () => {
        this.updateSlidesVisible();
        this.goTo(this.currentIndex);
      });

      // Touch/swipe support
      let startX = 0;
      this.track.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
      this.track.addEventListener('touchend', (e) => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) this.move(diff > 0 ? 1 : -1);
      });

      this.render();
    }

    updateSlidesVisible() {
      const width = window.innerWidth;
      if (width < 750) {
        this.slidesVisible = 2;
      } else if (width < 990) {
        this.slidesVisible = 1;
      } else {
        this.slidesVisible = 3;
      }
    }

    goTo(index) {
      const max = Math.max(0, this.totalSlides - this.slidesVisible);
      this.currentIndex = Math.min(Math.max(index, 0), max);
      this.render();
    }

    move(dir) {
      this.goTo(this.currentIndex + dir);
    }

    render() {
      if (!this.track) return;
      const gap = 16;
      const slideWidth = (this.track.parentElement.offsetWidth - gap * (this.slidesVisible - 1)) / this.slidesVisible;
      const offset = this.currentIndex * (slideWidth + gap);
      this.track.style.transform = `translateX(-${offset}px)`;

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === this.currentIndex);
      });
    }
  }

  // ============================================
  // ACCORDIONS
  // ============================================
  function initAccordions(el) {
    const accordions = el.querySelectorAll('details.piv2-accordion');
    accordions.forEach((acc) => {
      const trigger = acc.querySelector('.piv2-accordion__trigger');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = acc.hasAttribute('open');
        // Close others
        accordions.forEach((a) => {
          if (a !== acc) a.removeAttribute('open');
        });
        if (isOpen) {
          acc.removeAttribute('open');
        } else {
          acc.setAttribute('open', '');
        }
      });
    });
  }

  // ============================================
  // INIT ALL
  // ============================================
  function initProductV2(sectionEl) {
    const galleryEl = sectionEl.querySelector('[data-piv2-gallery]');
    if (galleryEl && galleryEl.querySelectorAll('[data-piv2-media]').length > 0) {
      new ProductV2Gallery(galleryEl);
    }

    const bundleEl = sectionEl.querySelector('[data-piv2-bundles]');
    if (bundleEl) {
      new ProductV2BundleSelector(bundleEl);
    }

    const reviewsEl = sectionEl.querySelector('[data-piv2-reviews]');
    if (reviewsEl) {
      new ProductV2ReviewCarousel(reviewsEl);
    }

    initAccordions(sectionEl);
  }

  // Run on DOMContentLoaded or Theme Editor section:load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-section-type="product-information-v2"]').forEach(initProductV2);
  });

  document.addEventListener('shopify:section:load', (e) => {
    const sectionEl = e.target;
    if (sectionEl.dataset.sectionType === 'product-information-v2') {
      initProductV2(sectionEl);
    }
  });
})();
