// ----- ANALYTICS & META PIXEL CONFIG (LOADS ONLY WITH REAL IDS) -----
const TRACKING_CONFIG = {
  GA4_ID: 'G-XXXXXXXXXX',          // Replace with Google Analytics 4 Measurement ID
  CLARITY_ID: 'XXXXXXXXXX',        // Replace with Microsoft Clarity Project ID
  META_PIXEL_ID: '000000000000000' // Replace with Meta Pixel ID
};

const isConfiguredId = (val) => Boolean(val && !/X{4,}|^0+$/.test(String(val).trim()));

const CONSENT_STORAGE_KEY = 'cookie_consent_v1';
const loadedTrackers = { ga4: false, clarity: false, pixel: false };
let consentState = null;

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch (e) {
    return null;
  }
}

function expireTrackingCookies() {
  const prefixes = ['_ga', '_gid', '_gat', '_clck', '_clsk', '_fbp', '_fbc'];
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (prefixes.some((p) => name === p || name.startsWith(p + '_'))) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
}

function syncTrackingWithConsent(consent) {
  consentState = consent;
  if (!consent) return;

  if (consent.analytics && isConfiguredId(TRACKING_CONFIG.GA4_ID) && !loadedTrackers.ga4) {
    loadedTrackers.ga4 = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', TRACKING_CONFIG.GA4_ID, { send_page_view: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(TRACKING_CONFIG.GA4_ID)}`;
    document.head.appendChild(s);
  }

  if (consent.analytics && isConfiguredId(TRACKING_CONFIG.CLARITY_ID) && !loadedTrackers.clarity) {
    loadedTrackers.clarity = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', TRACKING_CONFIG.CLARITY_ID);
  }

  if (consent.marketing && isConfiguredId(TRACKING_CONFIG.META_PIXEL_ID) && !loadedTrackers.pixel) {
    loadedTrackers.pixel = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', TRACKING_CONFIG.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  if (!consent.analytics && !consent.marketing) {
    expireTrackingCookies();
  }
}

syncTrackingWithConsent(readConsent());

function trackEvent(eventName, params = {}, metaStandardEvent = null, metaParams = {}) {
  if (consentState && consentState.analytics) {
    if (typeof window.gtag === 'function' && isConfiguredId(TRACKING_CONFIG.GA4_ID)) {
      window.gtag('event', eventName, params);
    }
    if (typeof window.clarity === 'function' && isConfiguredId(TRACKING_CONFIG.CLARITY_ID)) {
      window.clarity('event', eventName);
    }
  }
  if (consentState && consentState.marketing && metaStandardEvent && typeof window.fbq === 'function' && isConfiguredId(TRACKING_CONFIG.META_PIXEL_ID)) {
    window.fbq('track', metaStandardEvent, metaParams);
  }
}

// ----- SIGNATURE CORAL ORANGE PALETTE (DARK + LIGHT SAFE) -----
const ACCENTS = {
  coral: {
    dark:  { accent: '#FF6B4A', text: '#FF8566', ink: '#09090B', soft: 'rgba(255,107,74,0.14)', glow: 'rgba(255,107,74,0.22)' },
    light: { accent: '#E04F2E', text: '#D64120', ink: '#FFFFFF', soft: 'rgba(224,79,46,0.11)', glow: 'rgba(224,79,46,0.18)' },
  },
};

let currentTheme = 'dark';
try { currentTheme = localStorage.getItem('theme') || 'dark'; } catch (e) {}

function applyAccent() {
  const palette = ACCENTS.coral[currentTheme];
  const root = document.documentElement;
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-text', palette.text);
  root.style.setProperty('--accent-ink', palette.ink);
  root.style.setProperty('--accent-soft', palette.soft);
  root.style.setProperty('--accent-glow', palette.glow);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  const sun = document.getElementById('sunIcon');
  const moon = document.getElementById('moonIcon');
  if (sun && moon) {
    if (theme === 'light') {
      sun.classList.remove('hidden');
      moon.classList.add('hidden');
    } else {
      sun.classList.add('hidden');
      moon.classList.remove('hidden');
    }
  }
  applyAccent();
}

function toggleThemeWithRipple() {
  const btn = document.getElementById('themeToggleBtn');
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme);
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 620,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }).catch(() => {});
  } else {
    const overlay = document.getElementById('rippleOverlay');
    if (overlay && overlay.animate) {
      overlay.style.backgroundColor = nextTheme === 'light' ? '#F6F6F2' : '#09090B';
      overlay.style.opacity = '1';
      const anim = overlay.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ],
        { duration: 550, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
      );
      anim.onfinish = () => {
        applyTheme(nextTheme);
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }).onfinish = () => {
          overlay.style.opacity = '0';
        };
      };
    } else {
      applyTheme(nextTheme);
    }
  }
}

// ----- STATE -----
let lenisInstance = null;
const quoteState = {
  origin: 'Build from scratch',
  market: 'Bangladesh',
  services: new Set(['Custom Web App / CRM / POS', 'Meta Ads']),
  note: '',
};

// ----- TOAST & CLIPBOARD -----
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('opacity-0', 'translate-y-3');
  toast.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2200);
}

function copyText(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (e) {
    showToast('Could not copy automatically');
  }
  document.body.removeChild(ta);
}

// ----- ZERO-REFLOW GPU SCROLL REVEAL & PROGRESS BAR -----
function initScrollMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const sectionSelectors = ['#big-picture', '#services', '#results', '#why-me', '#process', '#faq', '#quote'];
  const targets = [];

  sectionSelectors.forEach((selector, sectionIndex) => {
    const section = document.querySelector(selector);
    if (!section) return;

    const heading = section.querySelector('h2');
    if (heading) {
      heading.classList.add('scroll-item', 'scroll-heading', sectionIndex % 2 === 0 ? 'is-hidden-left' : 'is-hidden-right');
      targets.push(heading);
    }

    section.querySelectorAll('p.scroll-fade').forEach((p) => {
      p.classList.add('scroll-item', 'is-hidden-up');
      targets.push(p);
    });

    const items = section.querySelectorAll('.result-card, .process-card, .reveal-block, .metric-item:not(.result-card):not(.process-card)');
    let itemIdx = 0;
    items.forEach((el) => {
      if (el.closest('.reveal-block') && !el.classList.contains('reveal-block')) return;
      const fromLeft = (itemIdx + sectionIndex) % 2 === 0;
      el.style.transitionDelay = `${(itemIdx % 3) * 50}ms`;
      el.classList.add('scroll-item', fromLeft ? 'is-hidden-left' : 'is-hidden-right');
      targets.push(el);
      itemIdx++;
    });
  });

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-inview', entry.isIntersecting);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initScrollProgressAndParallax() {
  const progressBar = document.getElementById('scrollProgress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopQuery = window.matchMedia('(min-width: 768px)');
  const parallaxEls = reduceMotion
    ? []
    : Array.from(document.querySelectorAll('#big-picture .max-w-4xl, #services .text-center, #why-me .text-center, #process .text-center'));

  let maxScroll = 1;
  let vh = window.innerHeight || 1;
  let parallaxMetrics = [];
  let boundsMeasured = false;
  let rafPending = false;

  const measureScrollBounds = () => {
    boundsMeasured = true;
    vh = window.innerHeight || 1;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    if (!reduceMotion && desktopQuery.matches && parallaxEls.length) {
      const sy = window.scrollY || window.pageYOffset || 0;
      parallaxMetrics = parallaxEls.map((el, i) => {
        const sec = el.closest('section') || el;
        const rect = sec.getBoundingClientRect();
        return { el, top: rect.top + sy, height: rect.height || 1, dir: i % 2 ? -12 : 12 };
      });
    } else {
      parallaxEls.forEach((el) => {
        el.style.transform = '';
      });
      parallaxMetrics = [];
    }
  };

  const updateOnScroll = () => {
    rafPending = false;
    if (!boundsMeasured) measureScrollBounds();
    const sy = window.scrollY || window.pageYOffset || 0;
    if (progressBar) {
      const progress = Math.min(1, Math.max(0, sy / maxScroll));
      progressBar.style.transform = `scaleX(${progress})`;
    }
    if (parallaxMetrics.length) {
      for (let i = 0; i < parallaxMetrics.length; i++) {
        const item = parallaxMetrics[i];
        const raw = (sy + vh - item.top) / (vh + item.height);
        const clamped = Math.min(1, Math.max(0, raw));
        item.el.style.transform = `translate3d(0, ${(clamped * item.dir).toFixed(2)}px, 0)`;
      }
    }
  };

  const scheduleUpdate = () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(updateOnScroll);
  };

  if ((window.scrollY || window.pageYOffset || 0) > 0) {
    scheduleUpdate();
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      measureScrollBounds();
      updateOnScroll();
    });
  }, { passive: true });
}

// ----- QUOTE BRIEF BUILDER -----
function updateBrief() {
  const selected = Array.from(quoteState.services);
  const servicesText = selected.length ? selected.join(', ') : 'General Consultation';
  const noteLine = quoteState.note.trim() ? `\nNote: ${quoteState.note.trim()}` : '';

  const brief =
    `Hi Sameer,\n` +
    `Setup: ${quoteState.origin}\n` +
    `Market: ${quoteState.market}\n` +
    `Services: ${servicesText}${noteLine}\n` +
    `Looking for a custom quote.`;

  document.getElementById('briefPreview').textContent = brief;

  const whatsappUrl = `https://wa.me/mdsameersakib?text=${encodeURIComponent(brief)}`;
  document.getElementById('whatsappBriefBtn').href = whatsappUrl;

  const mailto = `mailto:mdsameersakib@gmail.com?subject=${encodeURIComponent('Project Inquiry — ' + servicesText)}&body=${encodeURIComponent(brief)}`;
  document.getElementById('emailBriefBtn').href = mailto;
  return brief;
}

// ----- MAGNETIC BUTTONS (DESKTOP FINE POINTER ONLY, ZERO GSAP) -----
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    let tx = 0;
    let ty = 0;
    let rafId = 0;
    const flush = () => {
      rafId = 0;
      btn.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
    };
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      tx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      ty = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      if (!rafId) rafId = requestAnimationFrame(flush);
    });
    btn.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
      if (!rafId) rafId = requestAnimationFrame(flush);
    });
  });
}

// ----- LIGHTWEIGHT 2D AVATAR EYE BLINK OVERLAY (ZERO WEBGL BOOT COST) -----
let isHeroVisible = true;

function initAvatarBlink() {
  const img = document.getElementById('avatarImg');
  const canvas = document.getElementById('avatarBlinkCanvas');
  if (!img || !canvas) return;

  let ctx = null;
  let lidTone = 'rgb(214, 158, 132)';
  let toneSampled = false;
  let blinkAnimId = 0;

  const sampleSkinTone = () => {
    if (toneSampled || !img.complete || !img.naturalWidth) return;
    toneSampled = true;
    try {
      const s = document.createElement('canvas');
      s.width = 64;
      s.height = 64;
      const sctx = s.getContext('2d', { willReadFrequently: true });
      sctx.drawImage(img, 0, 0, 64, 64);
      const px = sctx.getImageData(Math.round(64 * 0.48), Math.round(64 * 0.444), 1, 1).data;
      if (px[3] > 20) {
        lidTone = `rgb(${Math.round(px[0] * 0.96)}, ${Math.round(px[1] * 0.96)}, ${Math.round(px[2] * 0.96)})`;
      }
    } catch (e) {}
  };

  const drawBlink = (t) => {
    if (!ctx) {
      canvas.width = 256;
      canvas.height = 256;
      ctx = canvas.getContext('2d');
      sampleSkinTone();
    }
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (t <= 0.01) return;

    const eyes = [
      { cx: 0.4102 * w, cy: 0.415 * h, rx: 0.042 * w, ry: 0.025 * h },
      { cx: 0.5625 * w, cy: 0.415 * h, rx: 0.040 * w, ry: 0.025 * h },
    ];
    const lidY = (0.392 + (0.436 - 0.392) * t) * h;

    eyes.forEach((eye) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(eye.cx, eye.cy, eye.rx, eye.ry, 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = lidTone;
      ctx.fillRect(eye.cx - eye.rx, eye.cy - eye.ry, eye.rx * 2, Math.max(0, lidY - (eye.cy - eye.ry)));

      if (t > 0.05) {
        ctx.strokeStyle = 'rgba(36, 20, 15, 0.72)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(eye.cx - eye.rx, lidY);
        ctx.lineTo(eye.cx + eye.rx, lidY);
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  window.triggerAvatarBlink = () => {
    if (!isHeroVisible || document.hidden || !img.complete) return;
    if (blinkAnimId) cancelAnimationFrame(blinkAnimId);
    const start = performance.now();
    const dur = 220;
    const step = (now) => {
      const elapsed = now - start;
      if (elapsed >= dur) {
        drawBlink(0);
        blinkAnimId = 0;
        return;
      }
      const p = elapsed / dur;
      const val = Math.sin(p * Math.PI);
      drawBlink(val);
      blinkAnimId = requestAnimationFrame(step);
    };
    blinkAnimId = requestAnimationFrame(step);
  };
}

// ----- INIT LENIS (DESKTOP ONLY) + MOTION + EVENTS -----
function initDesktopLenis() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bootLenis = () => {
    if (typeof Lenis !== 'undefined') {
      lenisInstance = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });
      const raf = (time) => {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
    script.integrity = 'sha384-li4UtcFCH6QeUqR4JyV58/VgTprMuz9aauj+oWtew7V4Y7ZVjnvz5px9Y3UCG0Ea';
    script.crossOrigin = 'anonymous';
    script.onload = () => bootLenis();
    document.head.appendChild(script);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(bootLenis, { timeout: 1500 });
  } else {
    setTimeout(bootLenis, 1000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  updateBrief();
  initMagneticButtons();
  initDesktopLenis();

  // Batch below-the-fold IntersectionObserver & scroll progress setup in rAF after initial paint
  requestAnimationFrame(() => {
    initScrollMotion();
    initScrollProgressAndParallax();
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(targetEl, { offset: -64 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    toggleThemeWithRipple();
    trackEvent('theme_toggle', { theme: nextTheme });
  });

  // Dynamic centered headline rotation (cached widths + GPU CSS transitions, zero GSAP/reflow)
  const swapSlot1 = document.getElementById('swapSlot1');
  const swapSlot2 = document.getElementById('swapSlot2');
  const swapOrder = ['swap-a', 'swap-b', 'swap-c'];
  let swapIdx = 0;
  let swapTimer = 0;
  let swapStarted = false;
  const cachedSwapWidths = {};

  const measureWord = (slot, cls) => {
    const el = slot ? slot.querySelector(`.${cls}`) : null;
    return el ? Math.ceil(el.getBoundingClientRect().width) + 2 : 0;
  };
  const cacheAllSwapWidths = () => {
    swapOrder.forEach((cls) => {
      cachedSwapWidths[cls] = {
        w1: measureWord(swapSlot1, cls),
        w2: measureWord(swapSlot2, cls),
      };
    });
    const cur = cachedSwapWidths[swapOrder[swapIdx]];
    if (cur) {
      if (swapSlot1 && cur.w1) swapSlot1.style.width = `${cur.w1}px`;
      if (swapSlot2 && cur.w2) swapSlot2.style.width = `${cur.w2}px`;
    }
  };

  requestAnimationFrame(cacheAllSwapWidths);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(cacheAllSwapWidths));
  }

  const stepWordSwap = () => {
    if (!isHeroVisible || document.hidden) return;
    if (swapSlot1 && !swapSlot1.classList.contains('is-ready')) swapSlot1.classList.add('is-ready');
    if (swapSlot2 && !swapSlot2.classList.contains('is-ready')) swapSlot2.classList.add('is-ready');
    const prevCls = swapOrder[swapIdx];
    swapIdx = (swapIdx + 1) % swapOrder.length;
    const nextCls = swapOrder[swapIdx];

    if (window.triggerAvatarBlink) window.triggerAvatarBlink();

    const nextWidths = cachedSwapWidths[nextCls];
    if (nextWidths) {
      if (swapSlot1 && nextWidths.w1) swapSlot1.style.width = `${nextWidths.w1}px`;
      if (swapSlot2 && nextWidths.w2) swapSlot2.style.width = `${nextWidths.w2}px`;
    }

    const prevWords = document.querySelectorAll(`.${prevCls}`);
    const nextWords = document.querySelectorAll(`.${nextCls}`);
    prevWords.forEach((el) => {
      el.classList.remove('is-active');
      el.classList.add('is-exit');
    });
    nextWords.forEach((el) => {
      el.classList.remove('is-exit', 'is-no-anim');
      el.classList.add('is-active');
    });

    setTimeout(() => {
      prevWords.forEach((el) => el.classList.add('is-no-anim'));
      prevWords.forEach((el) => el.classList.remove('is-exit'));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          prevWords.forEach((el) => el.classList.remove('is-no-anim'));
        });
      });
    }, 560);
  };

  const startSwapLoop = () => {
    if (swapTimer || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !swapSlot1 || !swapSlot2) return;
    swapTimer = setInterval(stepWordSwap, 2300);
  };
  const stopSwapLoop = () => {
    if (!swapTimer) return;
    clearInterval(swapTimer);
    swapTimer = 0;
  };

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && swapSlot1 && swapSlot2) {
    setTimeout(() => {
      swapStarted = true;
      if (isHeroVisible && !document.hidden) {
        stepWordSwap();
        startSwapLoop();
      }
    }, 4500);
    window.addEventListener('resize', () => requestAnimationFrame(cacheAllSwapWidths), { passive: true });
  }

  // Visibility-aware 3D Solar-System Orbit Animation (pure rAF, zero GSAP)
  const heroSection = document.getElementById('heroSection');
  const heroOrb = document.getElementById('heroOrb');
  const orbitLogos = Array.from(document.querySelectorAll('.orbit-logo'));
  if (heroOrb && orbitLogos.length) {
    const tiltX = 22 * (Math.PI / 180);
    const sinX = Math.sin(tiltX);
    const cosX = Math.cos(tiltX);
    const tiltA = -28 * (Math.PI / 180);
    const tiltB = 28 * (Math.PI / 180);
    let orbitElapsed = 0;
    let lastOrbitTs = 0;
    let orbitRafId = 0;
    let orbitR = 300 * 0.65;

    const orbitItems = orbitLogos.map((el) => ({
      el,
      baseRad: (parseFloat(el.dataset.angle || '0') * Math.PI) / 180,
      cosTiltZ: Math.cos(el.dataset.ring === 'a' ? tiltA : tiltB),
      sinTiltZ: Math.sin(el.dataset.ring === 'a' ? tiltA : tiltB),
      lastZ: '',
    }));

    if ('ResizeObserver' in window) {
      new ResizeObserver((entries) => {
        const w = entries[0] && entries[0].contentRect && entries[0].contentRect.width;
        if (w) orbitR = w * 0.65;
      }).observe(heroOrb);
    } else {
      orbitR = (heroOrb.clientWidth || 300) * 0.65;
    }

    const renderOrbit = (elapsed) => {
      const R = orbitR;
      const invZScale = 1 / (R * cosX);
      for (let i = 0; i < orbitItems.length; i++) {
        const item = orbitItems[i];
        const theta = item.baseRad + elapsed * 0.34;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const x0 = R * cosT;
        const y1 = R * sinT * sinX;
        const z1 = R * sinT * cosX;

        const x = x0 * item.cosTiltZ - y1 * item.sinTiltZ;
        const y = x0 * item.sinTiltZ + y1 * item.cosTiltZ;

        const depthNorm = z1 * invZScale;
        const scale = 0.84 + (depthNorm + 1) * 0.16;
        const opacity = 0.65 + (depthNorm + 1) * 0.175;
        const nextZ = z1 >= 0 ? '4' : '1';

        item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        item.el.style.opacity = opacity.toFixed(2);
        if (item.lastZ !== nextZ) {
          item.lastZ = nextZ;
          item.el.style.zIndex = nextZ;
        }
      }
    };

    const onOrbitTick = (now) => {
      if (!lastOrbitTs) lastOrbitTs = now;
      orbitElapsed += Math.min(now - lastOrbitTs, 50) / 1000;
      lastOrbitTs = now;
      renderOrbit(orbitElapsed);
      orbitRafId = requestAnimationFrame(onOrbitTick);
    };

    const syncHeroActivity = () => {
      const active = isHeroVisible && !document.hidden;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        if (active && !orbitRafId) {
          lastOrbitTs = 0;
          orbitRafId = requestAnimationFrame(onOrbitTick);
        } else if (!active && orbitRafId) {
          cancelAnimationFrame(orbitRafId);
          orbitRafId = 0;
        }
      }
      if (swapStarted) {
        if (active) startSwapLoop();
        else stopSwapLoop();
      }
    };

    renderOrbit(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if ('IntersectionObserver' in window && heroSection) {
        const io = new IntersectionObserver((entries) => {
          isHeroVisible = entries[0] ? entries[0].isIntersecting : true;
          syncHeroActivity();
        }, { threshold: 0.05 });
        io.observe(heroSection);
      }
      document.addEventListener('visibilitychange', syncHeroActivity);
      syncHeroActivity();
    }
  }

  // Initialize lightweight 2D eye-blink overlay
  initAvatarBlink();

  // Cursor spotlight (skipped on touch devices, compositor transform only)
  if (!window.matchMedia('(hover: none)').matches) {
    const glow = document.getElementById('cursorGlow');
    if (glow) {
      let gx = 0;
      let gy = 0;
      let glowRaf = 0;
      window.addEventListener('mousemove', (e) => {
        gx = e.clientX;
        gy = e.clientY;
        if (!glowRaf) {
          glowRaf = requestAnimationFrame(() => {
            glowRaf = 0;
            glow.style.opacity = '1';
            glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
          });
        }
      }, { passive: true });
    }
  }

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  // Quote Origin Chips
  document.querySelectorAll('.origin-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      quoteState.origin = btn.dataset.origin;
      document.querySelectorAll('.origin-chip').forEach(b => b.classList.remove('chip-active'));
      btn.classList.add('chip-active');
      updateBrief();
      trackEvent('select_origin', { origin: quoteState.origin });
    });
  });

  // Quote Market Chips
  document.querySelectorAll('.market-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      quoteState.market = btn.dataset.market;
      document.querySelectorAll('.market-chip').forEach(b => b.classList.remove('chip-active'));
      btn.classList.add('chip-active');
      updateBrief();
      trackEvent('select_market', { market: quoteState.market });
    });
  });

  // Quote Service Multi-Select Chips
  document.querySelectorAll('.qservice-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.qservice;
      let selected;
      if (quoteState.services.has(val)) {
        quoteState.services.delete(val);
        btn.classList.remove('chip-active');
        selected = false;
      } else {
        quoteState.services.add(val);
        btn.classList.add('chip-active');
        selected = true;
      }
      updateBrief();
      trackEvent('select_service_chip', { service: val, selected }, 'CustomizeProduct', { content_name: val });
    });
  });

  // Quote Note Input
  document.getElementById('projectNote').addEventListener('input', (e) => {
    quoteState.note = e.target.value;
    updateBrief();
  });

  // Lead & Contact Click Tracking
  document.getElementById('whatsappBriefBtn').addEventListener('click', () => {
    trackEvent('generate_lead', { method: 'whatsapp_brief', market: quoteState.market }, 'Lead', { content_name: 'whatsapp_brief' });
  });
  document.getElementById('emailBriefBtn').addEventListener('click', () => {
    trackEvent('generate_lead', { method: 'email_brief', market: quoteState.market }, 'Lead', { content_name: 'email_brief' });
  });
  document.getElementById('whatsappDirectLink').addEventListener('click', () => {
    trackEvent('contact_click', { method: 'whatsapp_direct' }, 'Contact', { content_name: 'whatsapp_direct' });
  });

  // Outbound Social Link Tracking (GitHub / LinkedIn)
  document.querySelectorAll('a[href^="https://github.com"], a[href^="https://linkedin.com"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('outbound_click', { url: link.href });
    });
  });

  // Scroll Depth Milestones (50% and 90%)
  const reachedMilestones = new Set();
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const pct = (window.scrollY / maxScroll) * 100;
    for (const m of [50, 90]) {
      if (pct >= m && !reachedMilestones.has(m)) {
        reachedMilestones.add(m);
        trackEvent('scroll_milestone', { percent: m });
      }
    }
  }, { passive: true });

  // Copy Brief Text Utility
  document.getElementById('copyBriefBtn').addEventListener('click', () => {
    copyText(updateBrief(), 'Brief copied to clipboard');
    trackEvent('copy_brief');
  });

  // Native Cookie & Privacy Consent Manager
  const cookieBanner = document.getElementById('cookieBanner');
  const cookiePrefsPanel = document.getElementById('cookiePrefsPanel');
  const analyticsToggle = document.getElementById('consentAnalyticsToggle');
  const marketingToggle = document.getElementById('consentMarketingToggle');
  const cookieAcceptAllBtn = document.getElementById('cookieAcceptAllBtn');
  const cookieEssentialBtn = document.getElementById('cookieEssentialBtn');
  const cookieTogglePrefsBtn = document.getElementById('cookieTogglePrefsBtn');
  const cookieSavePrefsBtn = document.getElementById('cookieSavePrefsBtn');
  const closeCookieBannerBtn = document.getElementById('closeCookieBannerBtn');
  const openCookieSettingsBtn = document.getElementById('openCookieSettingsBtn');

  const hideCookieBanner = () => {
    if (!cookieBanner) return;
    cookieBanner.classList.remove('is-visible');
    setTimeout(() => cookieBanner.classList.add('hidden'), 240);
  };

  const showCookieBanner = (expandPrefs = false) => {
    if (!cookieBanner) return;
    const saved = readConsent();
    if (analyticsToggle) analyticsToggle.checked = saved ? saved.analytics : true;
    if (marketingToggle) marketingToggle.checked = saved ? saved.marketing : true;
    if (cookiePrefsPanel) cookiePrefsPanel.classList.toggle('hidden', !expandPrefs);
    if (cookieSavePrefsBtn) cookieSavePrefsBtn.classList.toggle('hidden', !expandPrefs);
    if (cookieTogglePrefsBtn) cookieTogglePrefsBtn.classList.toggle('hidden', expandPrefs);
    cookieBanner.classList.remove('hidden');
    requestAnimationFrame(() => {
      cookieBanner.classList.add('is-visible');
    });
  };

  const saveConsent = (analytics, marketing, msg) => {
    const next = { essential: true, analytics: Boolean(analytics), marketing: Boolean(marketing), updatedAt: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
    syncTrackingWithConsent(next);
    hideCookieBanner();
    if (msg) showToast(msg);
  };

  if (cookieAcceptAllBtn) cookieAcceptAllBtn.addEventListener('click', () => saveConsent(true, true, 'All cookies accepted'));
  if (cookieEssentialBtn) cookieEssentialBtn.addEventListener('click', () => saveConsent(false, false, 'Saved essential cookies only'));
  if (cookieTogglePrefsBtn) cookieTogglePrefsBtn.addEventListener('click', () => showCookieBanner(true));
  if (cookieSavePrefsBtn) {
    cookieSavePrefsBtn.addEventListener('click', () => {
      saveConsent(analyticsToggle && analyticsToggle.checked, marketingToggle && marketingToggle.checked, 'Cookie preferences saved');
    });
  }
  if (closeCookieBannerBtn) closeCookieBannerBtn.addEventListener('click', hideCookieBanner);
  if (openCookieSettingsBtn) openCookieSettingsBtn.addEventListener('click', () => showCookieBanner(true));

  if (!readConsent()) {
    let promptShown = false;
    const triggerBannerOnce = () => {
      if (promptShown || readConsent()) return;
      promptShown = true;
      showCookieBanner(false);
    };
    const onScrollShow = () => {
      if (window.scrollY > 120) {
        window.removeEventListener('scroll', onScrollShow);
        triggerBannerOnce();
      }
    };
    window.addEventListener('scroll', onScrollShow, { passive: true });
    setTimeout(triggerBannerOnce, 2500);
  }
});
