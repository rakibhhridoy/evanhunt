/* ============================================
   EVAN HUNT FOR CONGRESS — Horizontal Slider
   Global Waving Flag + Particles on ALL slides
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const track = document.getElementById('slidesTrack');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight');
  const counterCurrent = document.querySelector('.counter-current');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navLinks');

  const TOTAL = slides.length;
  let current = 0;
  let isAnimating = false;

  // Light-background slides
  const lightSlides = new Set([1, 3, 4, 5]);

  // ═══════════════════════════════════════════
  // COLOR SCHEMES per slide type
  // ═══════════════════════════════════════════
  const darkScheme = {
    red: '#B22234',
    white: '#FFFFFF',
    blue: '#3C3B6E',
    flagOpacity: 0.35,
    particleColors: ['255,255,255', '212,168,67', '255,255,255', '255,255,255', '160,185,230'],
    particleOpacityRange: [0.15, 0.5],
    connectionOpacity: 0.12,
  };

  const lightScheme = {
    red: '#B22234',
    white: '#E8E8E8',
    blue: '#3C3B6E',
    flagOpacity: 0.4,
    particleColors: ['40,55,90', '100,115,155', '50,70,110', '70,90,140', '120,138,175'],
    particleOpacityRange: [0.12, 0.38],
    connectionOpacity: 0.09,
  };

  let activeScheme = darkScheme;
  let targetScheme = darkScheme;
  let schemeBlend = 1; // 0 = activeScheme, 1 = targetScheme (start fully at target)

  function getCurrentScheme() {
    return lightSlides.has(current) ? lightScheme : darkScheme;
  }

  function lerpColor(a, b, t) {
    // a, b are hex like '#B22234'
    const ar = parseInt(a.slice(1,3),16), ag = parseInt(a.slice(3,5),16), ab = parseInt(a.slice(5,7),16);
    const br = parseInt(b.slice(1,3),16), bg = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ═══════════════════════════════════════════
  // GLOBAL WAVING FLAG (fixed canvas)
  // ═══════════════════════════════════════════
  function initFlag() {
    const canvas = document.createElement('canvas');
    canvas.id = 'flagCanvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;

    const STRIPE_COUNT = 13;
    const WAVE_AMP = 14;
    const WAVE_SPEED = 0.0008;
    const WAVE_FREQ = 0.008;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function drawFlag(time) {
      ctx.clearRect(0, 0, w, h);

      const scheme = getCurrentScheme();
      ctx.globalAlpha = scheme.flagOpacity;

      const stripeH = h / STRIPE_COUNT;
      const cantonH = stripeH * 7;
      const cantonW = w * 0.4;

      // Stripes
      for (let i = 0; i < STRIPE_COUNT; i++) {
        const isRed = i % 2 === 0;
        ctx.fillStyle = isRed ? scheme.red : scheme.white;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const baseY = i * stripeH;
          const wave = Math.sin(x * WAVE_FREQ + time * WAVE_SPEED + i * 0.3) * WAVE_AMP;
          const wave2 = Math.sin(x * WAVE_FREQ * 0.6 + time * WAVE_SPEED * 1.3 + i * 0.5) * WAVE_AMP * 0.5;
          const y = baseY + wave + wave2;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        for (let x = w; x >= 0; x -= 4) {
          const baseY = (i + 1) * stripeH;
          const wave = Math.sin(x * WAVE_FREQ + time * WAVE_SPEED + (i + 1) * 0.3) * WAVE_AMP;
          const wave2 = Math.sin(x * WAVE_FREQ * 0.6 + time * WAVE_SPEED * 1.3 + (i + 1) * 0.5) * WAVE_AMP * 0.5;
          const y = baseY + wave + wave2;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Canton
      ctx.fillStyle = scheme.blue;
      ctx.beginPath();
      for (let x = 0; x <= cantonW; x += 4) {
        const wave = Math.sin(x * WAVE_FREQ + time * WAVE_SPEED) * WAVE_AMP;
        const wave2 = Math.sin(x * WAVE_FREQ * 0.6 + time * WAVE_SPEED * 1.3) * WAVE_AMP * 0.5;
        if (x === 0) ctx.moveTo(x, wave + wave2); else ctx.lineTo(x, wave + wave2);
      }
      for (let y = 0; y <= cantonH; y += 4) {
        const wave = Math.sin(cantonW * WAVE_FREQ + time * WAVE_SPEED + y * 0.01) * WAVE_AMP;
        ctx.lineTo(cantonW + wave, y);
      }
      for (let x = cantonW; x >= 0; x -= 4) {
        const wave = Math.sin(x * WAVE_FREQ + time * WAVE_SPEED + 7 * 0.3) * WAVE_AMP;
        const wave2 = Math.sin(x * WAVE_FREQ * 0.6 + time * WAVE_SPEED * 1.3 + 7 * 0.5) * WAVE_AMP * 0.5;
        ctx.lineTo(x, cantonH + wave + wave2);
      }
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Stars
      ctx.fillStyle = scheme.white;
      const starRows = [
        { count: 6, offset: false }, { count: 5, offset: true },
        { count: 6, offset: false }, { count: 5, offset: true },
        { count: 6, offset: false }, { count: 5, offset: true },
        { count: 6, offset: false }, { count: 5, offset: true },
        { count: 6, offset: false },
      ];
      const sx = cantonW / 12;
      const sy = cantonH / 10;
      const starSize = Math.min(sx, sy) * 0.35;

      starRows.forEach((row, ri) => {
        for (let c = 0; c < row.count; c++) {
          const bx = sx * (1 + c * 2 + (row.offset ? 1 : 0));
          const by = sy * (1 + ri);
          const wave = Math.sin(bx * WAVE_FREQ + time * WAVE_SPEED + by * 0.008) * WAVE_AMP;
          const wave2 = Math.sin(bx * WAVE_FREQ * 0.6 + time * WAVE_SPEED * 1.3 + by * 0.012) * WAVE_AMP * 0.5;
          drawStar(ctx, bx + wave * 0.3, by + wave + wave2, starSize, 5);
        }
      });

      // Fabric shading
      ctx.globalAlpha = 0.03;
      for (let x = 0; x < w; x += 8) {
        const shade = Math.sin(x * WAVE_FREQ + time * WAVE_SPEED) * 0.5 + 0.5;
        ctx.fillStyle = shade > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, 0, 8, h);
      }

      ctx.globalAlpha = 1;
    }

    function drawStar(ctx, cx, cy, r, points) {
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const radius = i % 2 === 0 ? r : r * 0.4;
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.fill();
    }

    function animate(time) {
      drawFlag(time);
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate(0);
  }

  // ═══════════════════════════════════════════
  // GLOBAL PARTICLES (fixed canvas)
  // ═══════════════════════════════════════════
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particlesCanvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const PARTICLE_COUNT = 65;
    const CONNECT_DIST = 110;
    const MOUSE_RADIUS = 150;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.8 + 0.4;
        this.baseOpacity = Math.random() * 0.4 + 0.1;
        this.colorIdx = Math.floor(Math.random() * 5);
        this.twinkleSpeed = Math.random() * 0.016 + 0.004;
        this.twinkleOffset = Math.random() * Math.PI * 2;
      }

      getColor() {
        const scheme = getCurrentScheme();
        return scheme.particleColors[this.colorIdx];
      }

      getOpacity(time) {
        const scheme = getCurrentScheme();
        const range = scheme.particleOpacityRange;
        const base = range[0] + (range[1] - range[0]) * this.baseOpacity;
        return base * (0.55 + 0.45 * Math.sin(time * this.twinkleSpeed + this.twinkleOffset));
      }

      update(time) {
        this.x += this.vx;
        this.y += this.vy;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.vx += (dx / dist) * force * 0.2;
          this.vy += (dy / dist) * force * 0.2;
        }

        this.vx *= 0.993;
        this.vy *= 0.993;

        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;

        this.currentOpacity = this.getOpacity(time);
        this.currentColor = this.getColor();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.currentColor}, ${this.currentOpacity})`;
        ctx.fill();

        if (this.size > 1.1) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.currentColor}, ${this.currentOpacity * 0.07})`;
          ctx.fill();
        }
      }
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    }

    function drawConnections() {
      const scheme = getCurrentScheme();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * scheme.connectionOpacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particles[i].currentColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate(time) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(time); p.draw(); });
      drawConnections();
      requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    animate(0);
  }

  initFlag();
  initParticles();

  // ═══════════════════════════════════════════
  // SLIDE NAVIGATION
  // ═══════════════════════════════════════════
  function goTo(index, skipAnim) {
    if (isAnimating && !skipAnim) return;
    if (index < 0 || index >= TOTAL) return;

    isAnimating = true;
    current = index;

    track.style.transform = `translateX(-${current * 100}vw)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    counterCurrent.style.transform = 'translateY(-8px)';
    counterCurrent.style.opacity = '0';
    setTimeout(() => {
      counterCurrent.textContent = String(current + 1).padStart(2, '0');
      counterCurrent.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        counterCurrent.style.transition = 'all 0.3s ease';
        counterCurrent.style.transform = 'translateY(0)';
        counterCurrent.style.opacity = '1';
      });
    }, 200);

    arrowLeft.classList.toggle('hidden', current === 0);
    arrowRight.classList.toggle('hidden', current === TOTAL - 1);

    const isLight = lightSlides.has(current);
    arrowLeft.classList.toggle('on-light', isLight);
    arrowRight.classList.toggle('on-light', isLight);

    navLinks.forEach(link => {
      const idx = parseInt(link.dataset.slide, 10);
      link.classList.toggle('active', idx === current);
    });

    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    slides[current].scrollTop = 0;

    setTimeout(() => { isAnimating = false; }, 900);
  }

  // Arrow clicks
  arrowLeft.addEventListener('click', () => goTo(current - 1));
  arrowRight.addEventListener('click', () => goTo(current + 1));

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.slide, 10)));
  });

  // Nav & data-slide links
  document.querySelectorAll('[data-slide]').forEach(el => {
    if (el.classList.contains('dot')) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(el.dataset.slide, 10);
      if (!isNaN(idx)) goTo(idx);
      navMenu.classList.remove('open');
    });
  });

  // Mobile menu
  navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(TOTAL - 1); }
  });

  // Wheel / trackpad
  let wheelCooldown = false;
  document.addEventListener('wheel', (e) => {
    const activeSlide = slides[current];
    const isScrollable = activeSlide.scrollHeight > activeSlide.clientHeight + 2;
    if (isScrollable) {
      const atTop = activeSlide.scrollTop <= 0;
      const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2;
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }
    e.preventDefault();
    if (wheelCooldown) return;
    wheelCooldown = true;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if (e.deltaY > 0) goTo(current + 1); else goTo(current - 1);
    } else {
      if (e.deltaX > 0) goTo(current + 1); else goTo(current - 1);
    }
    setTimeout(() => { wheelCooldown = false; }, 1100);
  }, { passive: false });

  // Touch swipe
  let touchStartX = 0, touchStartY = 0, touchMoved = false;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchMoved = false;
  }, { passive: true });
  document.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!touchMoved) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goTo(current + 1); else goTo(current - 1);
    }
  }, { passive: true });

  // ═══════════════════════════════════════════
  // COUNTER ANIMATIONS (District data)
  // ═══════════════════════════════════════════
  function animateCounters() {
    const counters = document.querySelectorAll('.data-number');
    let animated = false;
    const observer = new MutationObserver(() => {
      if (slides[3] && slides[3].classList.contains('active') && !animated) {
        animated = true;
        setTimeout(() => {
          counters.forEach(c => {
            const text = c.textContent.trim();
            const numMatch = text.replace(/,/g, '').match(/^(\d+)$/);
            if (numMatch) animateNumber(c, parseInt(numMatch[1], 10), text.includes(','));
          });
        }, 500);
      }
    });
    observer.observe(slides[3], { attributes: true, attributeFilter: ['class'] });
  }

  function animateNumber(el, target, useCommas) {
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = Math.floor(eased * target);
      el.textContent = useCommas ? val.toLocaleString() : val.toString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = useCommas ? target.toLocaleString() : target.toString();
    };
    requestAnimationFrame(step);
  }

  animateCounters();

  // ═══════════════════════════════════════════
  // MAGNETIC HOVER on arrows
  // ═══════════════════════════════════════════
  [arrowLeft, arrowRight].forEach(arrow => {
    arrow.addEventListener('mousemove', (e) => {
      const rect = arrow.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.2;
      const dy = (e.clientY - cy) * 0.2;
      arrow.style.transform = `translateY(-50%) translate(${dx}px, ${dy}px)`;
    });
    arrow.addEventListener('mouseleave', () => {
      arrow.style.transform = 'translateY(-50%)';
    });
  });

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  goTo(0, true);

});
