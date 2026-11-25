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
  if (typeof updateAvatarAccent === 'function') updateAvatarAccent(palette.accent);
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
    overlay.style.backgroundColor = nextTheme === 'light' ? '#F6F6F2' : '#09090B';
    overlay.style.opacity = '1';
    gsap.fromTo(
      overlay,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      {
        clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: () => {
          applyTheme(nextTheme);
          gsap.to(overlay, { opacity: 0, duration: 0.25 });
        },
      }
    );
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
  let rafPending = false;

  const measureScrollBounds = () => {
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

  measureScrollBounds();
  updateOnScroll();

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      measureScrollBounds();
      scheduleUpdate();
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

// ----- MAGNETIC BUTTONS -----
function initMagneticButtons() {
  if (typeof gsap === 'undefined' || window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * 0.22);
      yTo(relY * 0.22);
    });
    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

// ----- NATIVE WEBGL PORTRAIT WITH ON-DEMAND RENDER & SYNCED BLINKING (ZERO THREE.JS DEPENDENCY) -----
let requestAvatarRender = null;
let updateAvatarAccentFn = null;
let isHeroVisible = true;

function parseHexColor(hex) {
  const clean = (hex || '#FF6B4A').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [1.0, 0.42, 0.29];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function updateAvatarAccent(hex) {
  if (updateAvatarAccentFn) updateAvatarAccentFn(parseHexColor(hex));
}

function initWebGLAvatar() {
  const canvas = document.getElementById('avatarCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;

  const wrap = canvas.parentElement;
  const getDpr = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);

  const vertSrc = `
    attribute vec2 aPos;
    uniform float uAspect;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      // Match Three.js camera(32deg, z=4.4) + PlaneGeometry(2.48) + offset(y=-0.04)
      float scaleY = 0.982817;
      float scaleX = scaleY / max(uAspect, 0.01);
      float offsetY = -0.031704;
      gl_Position = vec4(aPos.x * scaleX, aPos.y * scaleY + offsetY, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    uniform sampler2D uColorMap;
    uniform vec3 uAccent;
    uniform float uBlink;
    varying vec2 vUv;

    float eyeMask(vec2 uv, vec2 center, vec2 radii) {
      vec2 d = (uv - center) / radii;
      return smoothstep(1.0, 0.28, length(d));
    }

    void main() {
      vec4 texel = texture2D(uColorMap, vUv);
      if (texel.a < 0.02) discard;

      if (uBlink > 0.001) {
        vec2 leftEye = vec2(0.4102, 0.5850);
        vec2 leftRadii = vec2(0.042, 0.025);
        vec2 rightEye = vec2(0.5625, 0.5850);
        vec2 rightRadii = vec2(0.040, 0.025);
        float mEye = clamp(eyeMask(vUv, leftEye, leftRadii) + eyeMask(vUv, rightEye, rightRadii), 0.0, 1.0);
        if (mEye > 0.01) {
          float eyeTop = 0.608;
          float eyeBot = 0.564;
          float lidY = mix(eyeTop, eyeBot, uBlink);
          float lidMask = smoothstep(lidY - 0.005, lidY + 0.003, vUv.y) * mEye;
          float lashMask = exp(-pow((vUv.y - lidY) / 0.0032, 2.0)) * mEye * smoothstep(0.02, 0.15, uBlink);
          vec3 lidColor = texture2D(uColorMap, vec2(vUv.x, 0.556)).rgb * 0.96;
          texel.rgb = mix(texel.rgb, lidColor, lidMask * 0.96);
          texel.rgb = mix(texel.rgb, vec3(0.14, 0.08, 0.06), lashMask * 0.72);
        }
      }

      vec2 rimOffset = vec2(0.010, -0.006);
      float neighborAlpha = texture2D(uColorMap, clamp(vUv + rimOffset, 0.0, 1.0)).a;
      float rimMask = clamp((texel.a - neighborAlpha) * 1.4, 0.0, 1.0);
      vec3 finalRgb = texel.rgb + uAccent * rimMask * 0.28;

      gl_FragColor = vec4(finalRgb, texel.a);
    }
  `;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPosLoc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPosLoc);
  gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

  const uAspectLoc = gl.getUniformLocation(prog, 'uAspect');
  const uColorMapLoc = gl.getUniformLocation(prog, 'uColorMap');
  const uAccentLoc = gl.getUniformLocation(prog, 'uAccent');
  const uBlinkLoc = gl.getUniformLocation(prog, 'uBlink');

  let texReady = false;
  let accentVec = parseHexColor(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF6B4A');
  const blinkState = { value: 0 };

  gl.uniform3fv(uAccentLoc, accentVec);
  gl.uniform1f(uBlinkLoc, 0);
  gl.uniform1i(uColorMapLoc, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let cachedW = 0;
  let cachedH = 0;
  const syncSize = (w, h) => {
    const nw = Math.round(w || cachedW || wrap.clientWidth || 300);
    const nh = Math.round(h || cachedH || wrap.clientHeight || 300);
    cachedW = nw;
    cachedH = nh;
    const dpr = getDpr();
    const pw = Math.round(nw * dpr);
    const ph = Math.round(nh * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uAspectLoc, nw / nh);
  };

  const renderFrame = () => {
    if (!texReady) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3fv(uAccentLoc, accentVec);
    gl.uniform1f(uBlinkLoc, blinkState.value);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  requestAvatarRender = renderFrame;
  updateAvatarAccentFn = (rgb) => {
    accentVec = rgb;
    renderFrame();
  };

  const tex = gl.createTexture();
  const loadImageTex = (src, fallbackSrc) => {
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      texReady = true;
      requestAnimationFrame(() => {
        syncSize();
        renderFrame();
      });
    };
    if (fallbackSrc) {
      img.onerror = () => loadImageTex(fallbackSrc, null);
    }
    img.src = src;
  };
  loadImageTex('./avatar.webp', './avatar.png');

  window.triggerAvatarBlink = () => {
    if (!isHeroVisible || document.hidden || typeof gsap === 'undefined') return;
    gsap.fromTo(blinkState, { value: 0 }, {
      value: 1,
      duration: 0.11,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      overwrite: true,
      onUpdate: renderFrame,
      onComplete: renderFrame,
    });
  };

  const ro = new ResizeObserver((entries) => {
    const rect = entries[0] && entries[0].contentRect;
    syncSize(rect && rect.width, rect && rect.height);
    renderFrame();
  });
  ro.observe(wrap);
}

// ----- INIT LENIS + GSAP + EVENTS -----
window.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  updateBrief();

  if (typeof gsap !== 'undefined') {
    if (typeof Lenis !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      lenisInstance = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    initMagneticButtons();

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-line', { yPercent: 115, duration: 0.95, stagger: 0.14 })
      .from('.hero-stagger', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.5');
  }

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

  // Dynamic centered headline rotation with batched measurements
  const swapSlot1 = document.getElementById('swapSlot1');
  const swapSlot2 = document.getElementById('swapSlot2');
  let swapTimeline = null;
  const measureWord = (slot, cls) => {
    const el = slot ? slot.querySelector(`.${cls}`) : null;
    return el ? Math.ceil(el.getBoundingClientRect().width) + 2 : 0;
  };
  const applySwapWidths = (cls) => {
    const w1 = measureWord(swapSlot1, cls);
    const w2 = measureWord(swapSlot2, cls);
    if (swapSlot1) swapSlot1.style.width = `${w1}px`;
    if (swapSlot2) swapSlot2.style.width = `${w2}px`;
  };
  requestAnimationFrame(() => applySwapWidths('swap-a'));

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && swapSlot1 && swapSlot2 && typeof gsap !== 'undefined') {
    let activeCls = 'swap-a';
    const runSwapInit = () => {
      gsap.set('.swap-a', { yPercent: 0, opacity: 1 });
      gsap.set('.swap-b, .swap-c', { yPercent: 110, opacity: 0 });
      requestAnimationFrame(() => applySwapWidths('swap-a'));

      swapTimeline = gsap.timeline({ repeat: -1, delay: 1.8 });
      const addStep = (fromCls, toCls) => {
        swapTimeline
          .call(() => {
            activeCls = toCls;
            if (window.triggerAvatarBlink) window.triggerAvatarBlink();
          })
          .to(swapSlot1, { width: () => measureWord(swapSlot1, toCls), duration: 0.5, ease: 'power3.inOut' }, '<')
          .to(swapSlot2, { width: () => measureWord(swapSlot2, toCls), duration: 0.5, ease: 'power3.inOut' }, '<')
          .to(`.${fromCls}`, { yPercent: -110, opacity: 0, duration: 0.5, ease: 'power3.inOut' }, '<')
          .fromTo(`.${toCls}`, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.52, ease: 'power3.out', immediateRender: false }, '<0.06')
          .to({}, { duration: 1.8 });
      };
      addStep('swap-a', 'swap-b');
      addStep('swap-b', 'swap-c');
      addStep('swap-c', 'swap-a');
      if (!isHeroVisible || document.hidden) swapTimeline.pause();
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runSwapInit);
    } else {
      runSwapInit();
    }
    window.addEventListener('resize', () => {
      applySwapWidths(activeCls);
    });
  }

  // Visibility-aware 3D Solar-System Orbit Animation
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
    let orbitR = 300 * 0.65;
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
      orbitLogos.forEach((el) => {
        const isRingA = el.dataset.ring === 'a';
        const baseDeg = parseFloat(el.dataset.angle || '0');
        const theta = (baseDeg * Math.PI / 180) + elapsed * 0.34;

        const x0 = R * Math.cos(theta);
        const y1 = R * Math.sin(theta) * sinX;
        const z1 = R * Math.sin(theta) * cosX;

        const tiltZ = isRingA ? tiltA : tiltB;
        const x = x0 * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
        const y = x0 * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);

        const depthNorm = z1 / (R * cosX);
        const scale = 0.84 + (depthNorm + 1) * 0.16;
        const opacity = 0.65 + (depthNorm + 1) * 0.175;

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(2);
        el.style.zIndex = z1 >= 0 ? '4' : '1';
      });
    };

    const onOrbitTick = (_time, deltaTime) => {
      orbitElapsed += Math.min(deltaTime || 16.67, 50) / 1000;
      renderOrbit(orbitElapsed);
    };

    let orbitRunning = false;
    const syncHeroActivity = () => {
      const active = isHeroVisible && !document.hidden;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced && typeof gsap !== 'undefined') {
        if (active && !orbitRunning) {
          gsap.ticker.add(onOrbitTick);
          orbitRunning = true;
        } else if (!active && orbitRunning) {
          gsap.ticker.remove(onOrbitTick);
          orbitRunning = false;
        }
      }
      if (swapTimeline) {
        if (active) swapTimeline.resume();
        else swapTimeline.pause();
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

  // Initialize Native WebGL Avatar
  initWebGLAvatar();

  // Cursor spotlight (skipped on touch devices)
  if (!window.matchMedia('(hover: none)').matches && typeof gsap !== 'undefined') {
    const glow = document.getElementById('cursorGlow');
    window.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    });
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
