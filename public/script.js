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
  const lightSlides = new Set([1, 5, 6]);

  // ═══════════════════════════════════════════
  // COLOR SCHEMES per slide type
  // ═══════════════════════════════════════════
  const darkScheme = {
    red: '#B22234',
    white: '#FFFFFF',
    blue: '#3C3B6E',
    flagOpacity: 0.7,
    particleColors: ['255,255,255', '212,168,67', '255,255,255', '255,255,255', '160,185,230'],
    particleOpacityRange: [0.2, 0.55],
    connectionOpacity: 0.14,
  };

  const lightScheme = {
    red: '#B22234',
    white: '#EAEAEA',
    blue: '#3C3B6E',
    flagOpacity: 0.8,
    particleColors: ['40,55,90', '100,115,155', '50,70,110', '70,90,140', '120,138,175'],
    particleOpacityRange: [0.15, 0.4],
    connectionOpacity: 0.1,
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

    if (arrowLeft) arrowLeft.classList.toggle('hidden', current === 0);
    if (arrowRight) arrowRight.classList.toggle('hidden', current === TOTAL - 1);

    const isLight = lightSlides.has(current);
    if (arrowLeft) arrowLeft.classList.toggle('on-light', isLight);
    if (arrowRight) arrowRight.classList.toggle('on-light', isLight);

    navLinks.forEach(link => {
      const idx = parseInt(link.dataset.slide, 10);
      link.classList.toggle('active', idx === current);
    });

    slides.forEach((s, i) => s.classList.toggle('active', i === current));

    setTimeout(() => { isAnimating = false; }, 900);
  }

  // Arrow clicks
  if (arrowLeft) arrowLeft.addEventListener('click', () => goTo(current - 1));
  if (arrowRight) arrowRight.addEventListener('click', () => goTo(current + 1));

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
  [arrowLeft, arrowRight].filter(Boolean).forEach(arrow => {
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
  // INTERACTIVE PRECINCT MAP
  // ═══════════════════════════════════════════
  function initDistrictMap() {
    const svg = document.getElementById('mapSvg');
    const tooltip = document.getElementById('mapTooltip');
    const container = document.getElementById('districtMap');
    if (!svg || !tooltip) return;

    fetch('map/cd3_web.json')
      .then(r => r.json())
      .then(geo => renderMap(geo))
      .catch(err => console.warn('Map load failed:', err));

    function renderMap(geo) {
      const features = geo.features;

      // Compute bounds
      let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
      features.forEach(f => {
        const coords = f.geometry.type === 'MultiPolygon'
          ? f.geometry.coordinates.flat(2)
          : f.geometry.coordinates.flat(1);
        coords.forEach(([lon, lat]) => {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        });
      });

      const padding = 10;
      const geoW = maxLon - minLon;
      const geoH = maxLat - minLat;
      // Use a fixed scale and let viewBox match the data's aspect ratio
      const pixelsPerDeg = 600;
      const svgW = Math.ceil(geoW * pixelsPerDeg + padding * 2);
      const svgH = Math.ceil(geoH * pixelsPerDeg + padding * 2);
      svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
      const scale = pixelsPerDeg;
      const offsetX = padding;
      const offsetY = padding;

      function project([lon, lat]) {
        const x = (lon - minLon) * scale + offsetX;
        const y = (maxLat - lat) * scale + offsetY;
        return [x, y];
      }

      // Find voter range for color scale
      let minVoters = Infinity, maxVoters = 0;
      features.forEach(f => {
        const v = f.properties.t || 0;
        if (v > 0 && v < minVoters) minVoters = v;
        if (v > maxVoters) maxVoters = v;
      });

      // Use log scale for better distribution
      const logMin = Math.log(minVoters || 1);
      const logMax = Math.log(maxVoters);

      function voterColor(voters) {
        if (!voters || voters <= 0) return '#2a2a2a';
        const t = (Math.log(voters) - logMin) / (logMax - logMin);
        // Dark grey → Bright yellow
        return lerpHex('#2a2a2a', '#facc15', t);
      }

      function lerpHex(a, b, t) {
        const ar = parseInt(a.slice(1,3),16), ag = parseInt(a.slice(3,5),16), ab = parseInt(a.slice(5,7),16);
        const br = parseInt(b.slice(1,3),16), bg = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
      }

      // Convert coordinates to SVG path
      function ringToPath(ring) {
        return ring.map((coord, i) => {
          const [x, y] = project(coord);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join('') + 'Z';
      }

      function featureToPath(feature) {
        const geom = feature.geometry;
        if (geom.type === 'Polygon') {
          return geom.coordinates.map(ringToPath).join('');
        } else if (geom.type === 'MultiPolygon') {
          return geom.coordinates.map(poly => poly.map(ringToPath).join('')).join('');
        }
        return '';
      }

      // Store original viewBox for zoom-out
      const origViewBox = `0 0 ${svgW} ${svgH}`;
      let isZoomed = false;
      let selectedPath = null;
      let zoomAnim = null;

      // Create precinct detail panel
      const detailPanel = document.createElement('div');
      detailPanel.className = 'precinct-detail';
      detailPanel.innerHTML = '<button class="precinct-detail-close">&times;</button><div class="precinct-detail-content"></div>';
      container.appendChild(detailPanel);

      const detailClose = detailPanel.querySelector('.precinct-detail-close');
      const detailContent = detailPanel.querySelector('.precinct-detail-content');

      // Animate viewBox smoothly
      function animateViewBox(from, to, duration, cb) {
        if (zoomAnim) cancelAnimationFrame(zoomAnim);
        const fromVals = from.split(' ').map(Number);
        const toVals = to.split(' ').map(Number);
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const cur = fromVals.map((v, i) => v + (toVals[i] - v) * ease);
          svg.setAttribute('viewBox', cur.map(v => v.toFixed(1)).join(' '));
          if (t < 1) { zoomAnim = requestAnimationFrame(tick); }
          else { zoomAnim = null; if (cb) cb(); }
        }
        zoomAnim = requestAnimationFrame(tick);
      }

      // Compute bounding box of a feature in SVG coords
      function featureBBox(feature) {
        const coords = feature.geometry.type === 'MultiPolygon'
          ? feature.geometry.coordinates.flat(2)
          : feature.geometry.coordinates.flat(1);
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        coords.forEach(c => {
          const [px, py] = project(c);
          if (px < x1) x1 = px;
          if (py < y1) y1 = py;
          if (px > x2) x2 = px;
          if (py > y2) y2 = py;
        });
        return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
      }

      // Build demographics bar chart HTML
      function demoBars(p) {
        if (!p.t || p.t <= 0) return '';
        const groups = [
          { label: 'Anglo', val: p.anglo || 0, color: '#60a5fa' },
          { label: 'Hispanic', val: p.hisp || 0, color: '#f59e0b' },
          { label: 'Black', val: p.black || 0, color: '#34d399' },
          { label: 'Asian', val: p.asian || 0, color: '#a78bfa' },
        ];
        return groups.map(g => {
          const pct = Math.round(g.val / p.t * 100);
          return `<div class="demo-bar-row">
            <span class="demo-bar-label">${g.label}</span>
            <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${pct}%;background:${g.color}"></div></div>
            <span class="demo-bar-pct">${pct}%</span>
          </div>`;
        }).join('');
      }

      // Show detail panel for a feature
      function showPrecinctDetail(feature) {
        const p = feature.properties;
        detailContent.innerHTML = `
          <div class="pd-header">
            <span class="pd-county">${p.c || 'Unknown'} County</span>
            <span class="pd-vtd">VTD ${p.v || 'Unknown'}</span>
          </div>
          <div class="pd-stats">
            <div class="pd-stat">
              <div class="pd-stat-num">${p.t ? p.t.toLocaleString() : 'N/A'}</div>
              <div class="pd-stat-lbl">Registered Voters</div>
            </div>
            <div class="pd-stat">
              <div class="pd-stat-num">${p.vap ? p.vap.toLocaleString() : 'N/A'}</div>
              <div class="pd-stat-lbl">Voting Age Pop</div>
            </div>
          </div>
          <div class="pd-demos-title">Demographics</div>
          <div class="pd-demos">${demoBars(p)}</div>
        `;
        detailPanel.classList.add('visible');
      }

      function hidePrecinctDetail() {
        detailPanel.classList.remove('visible');
      }

      // Zoom into a precinct
      function zoomToPrecinct(pathEl, feature) {
        if (selectedPath) selectedPath.classList.remove('precinct-selected');
        selectedPath = pathEl;
        pathEl.classList.add('precinct-selected');
        svg.classList.add('zoomed');
        isZoomed = true;

        const bb = featureBBox(feature);
        // Add padding around the precinct (at least 40% of the bbox on each side)
        const padFactor = 1.8;
        const cx = bb.x + bb.w / 2;
        const cy = bb.y + bb.h / 2;
        const zw = Math.max(bb.w * padFactor, 60);
        const zh = Math.max(bb.h * padFactor, 60);
        const targetVB = `${cx - zw/2} ${cy - zh/2} ${zw} ${zh}`;

        const currentVB = svg.getAttribute('viewBox');
        animateViewBox(currentVB, targetVB, 500);
        tooltip.classList.remove('visible');
        showPrecinctDetail(feature);
      }

      // Zoom out to full map
      function zoomOut() {
        if (!isZoomed) return;
        if (selectedPath) selectedPath.classList.remove('precinct-selected');
        selectedPath = null;
        svg.classList.remove('zoomed');
        isZoomed = false;

        const currentVB = svg.getAttribute('viewBox');
        animateViewBox(currentVB, origViewBox, 400);
        hidePrecinctDetail();
      }

      // Close button
      detailClose.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomOut();
      });

      // Click outside precinct to dismiss (on map container background)
      container.addEventListener('click', (e) => {
        if (isZoomed && !e.target.closest('.precinct') && !e.target.closest('.precinct-detail')) {
          zoomOut();
        }
      });

      // Draw precincts
      features.forEach(f => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', featureToPath(f));
        path.setAttribute('class', 'precinct');
        path.setAttribute('fill', voterColor(f.properties.t));

        path.addEventListener('mouseenter', (e) => {
          if (isZoomed) return;
          const p = f.properties;
          const county = p.c || 'Unknown';
          const vtd = p.v || 'Unknown';
          const voters = p.t ? p.t.toLocaleString() : 'N/A';
          const vap = p.vap ? p.vap.toLocaleString() : 'N/A';
          let demo = '';
          if (p.t > 0) {
            const pcts = [
              p.anglo ? `Anglo ${Math.round(p.anglo/p.t*100)}%` : '',
              p.hisp ? `Hisp ${Math.round(p.hisp/p.t*100)}%` : '',
              p.black ? `Black ${Math.round(p.black/p.t*100)}%` : '',
              p.asian ? `Asian ${Math.round(p.asian/p.t*100)}%` : ''
            ].filter(Boolean).join(' · ');
            demo = `<br><span style="opacity:0.7">${pcts}</span>`;
          }
          tooltip.innerHTML = `<strong>${county} County — VTD ${vtd}</strong>Registered: ${voters} · VAP: ${vap}${demo}`;
          tooltip.classList.add('visible');
        });

        path.addEventListener('mousemove', (e) => {
          if (isZoomed) return;
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left + 12;
          const y = e.clientY - rect.top - 10;
          tooltip.style.left = x + 'px';
          tooltip.style.top = y + 'px';
        });

        path.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });

        path.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isZoomed && selectedPath === path) {
            zoomOut();
          } else {
            zoomToPrecinct(path, f);
          }
        });

        svg.appendChild(path);
      });

      // Group features by county
      const counties = {};
      features.forEach(f => {
        const c = f.properties.c || 'Unknown';
        if (!counties[c]) counties[c] = { features: [], centroids: [] };
        counties[c].features.push(f);
        const coords = f.geometry.type === 'MultiPolygon'
          ? f.geometry.coordinates.flat(2)
          : f.geometry.coordinates.flat(1);
        let cx = 0, cy = 0;
        coords.forEach(([lon, lat]) => { cx += lon; cy += lat; });
        cx /= coords.length;
        cy /= coords.length;
        counties[c].centroids.push([cx, cy]);
      });

      // Draw county borders (all precinct outlines merged per county for thicker boundary)
      Object.entries(counties).forEach(([name, data]) => {
        const allPaths = data.features.map(f => featureToPath(f)).join('');
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        border.setAttribute('d', allPaths);
        border.setAttribute('class', 'county-border');
        svg.appendChild(border);
      });

      // Add county labels on top
      Object.entries(counties).forEach(([name, data]) => {
        let cx = 0, cy = 0;
        data.centroids.forEach(([x, y]) => { cx += x; cy += y; });
        cx /= data.centroids.length;
        cy /= data.centroids.length;
        const [sx, sy] = project([cx, cy]);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'county-label');
        text.setAttribute('x', sx.toFixed(1));
        text.setAttribute('y', sy.toFixed(1));
        text.textContent = name;
        svg.appendChild(text);
      });
    }
  }

  initDistrictMap();

  // ═══════════════════════════════════════════
  // WIN NUMBER AREA CHART + TABLE ANIMATION
  // ═══════════════════════════════════════════
  function initWinChart() {
    const canvas = document.getElementById('winChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;

    const data = [
      { label: '50%', scenario: 'Baseline Midterm', total: 273187, win: 136594 },
      { label: '55%', scenario: 'Elevated Midterm', total: 300505, win: 150253 },
      { label: '60%', scenario: 'High Engagement', total: 327824, win: 163913 },
      { label: '65%', scenario: 'Wave Midterm', total: 355143, win: 177572 },
      { label: '70%', scenario: 'Exceptional', total: 382461, win: 191231 },
      { label: '75%', scenario: 'Near-Presidential', total: 409780, win: 204891 },
      { label: '80%', scenario: 'Very High', total: 437099, win: 218550 },
      { label: '85%', scenario: 'Max Protection', total: 464417, win: 232209 },
    ];

    const maxVal = 480000;
    let chartAnimated = false;
    let hoveredIdx = -1;
    let chartDims = {};

    // Create chart tooltip
    const chartTip = document.createElement('div');
    chartTip.className = 'chart-tooltip';
    wrap.style.position = 'relative';
    wrap.appendChild(chartTip);

    function getChartDims() {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      const padL = 55, padR = 16, padT = 30, padB = 32;
      return { W, H, padL, padR, padT, padB, chartW: W - padL - padR, chartH: H - padT - padB, stepX: (W - padL - padR) / (data.length - 1) };
    }

    function drawChart(progress, hIdx) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      const { W, H, padL, padR, padT, padB, chartW, chartH, stepX } = chartDims = getChartDims();

      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padT + chartH * (1 - i / 4);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((maxVal * i / 4 / 1000).toFixed(0) + 'K', padL - 5, y + 3);
      }

      const clipX = padL + chartW * progress;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, clipX, H); ctx.clip();

      // Highlight zone (60-70%)
      const z1 = padL + 2 * stepX, z2 = padL + 4 * stepX;
      ctx.fillStyle = 'rgba(37,99,235,0.05)';
      ctx.fillRect(z1, padT, z2 - z1, chartH);
      ctx.strokeStyle = 'rgba(37,99,235,0.15)';
      ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(z1, padT); ctx.lineTo(z1, padT + chartH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(z2, padT); ctx.lineTo(z2, padT + chartH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(96,165,250,0.85)';
      ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('WAVE ZONE', (z1 + z2) / 2, padT + 12);

      // Hover column highlight
      if (hIdx >= 0) {
        const hx = padL + hIdx * stepX;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(hx, padT); ctx.lineTo(hx, padT + chartH); ctx.stroke();
      }

      // Total area
      const lastX = padL + (data.length - 1) * stepX;
      ctx.beginPath();
      data.forEach((d, i) => { const x = padL + i * stepX, y = padT + chartH * (1 - d.total / maxVal); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.lineTo(lastX, padT + chartH); ctx.lineTo(padL, padT + chartH); ctx.closePath();
      const tg = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      tg.addColorStop(0, 'rgba(255,255,255,0.1)'); tg.addColorStop(1, 'rgba(255,255,255,0.01)');
      ctx.fillStyle = tg; ctx.fill();

      // Win area
      ctx.beginPath();
      data.forEach((d, i) => { const x = padL + i * stepX, y = padT + chartH * (1 - d.win / maxVal); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.lineTo(lastX, padT + chartH); ctx.lineTo(padL, padT + chartH); ctx.closePath();
      const wg = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      wg.addColorStop(0, 'rgba(37,99,235,0.3)'); wg.addColorStop(1, 'rgba(37,99,235,0.03)');
      ctx.fillStyle = wg; ctx.fill();

      // Total line
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
      data.forEach((d, i) => { const x = padL + i * stepX, y = padT + chartH * (1 - d.total / maxVal); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();

      // Win line
      ctx.beginPath(); ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
      data.forEach((d, i) => { const x = padL + i * stepX, y = padT + chartH * (1 - d.win / maxVal); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();

      // Points
      data.forEach((d, i) => {
        const x = padL + i * stepX;
        const isH = i === hIdx;
        const wy = padT + chartH * (1 - d.win / maxVal);
        const ty = padT + chartH * (1 - d.total / maxVal);

        // Total dot
        ctx.beginPath(); ctx.arc(x, ty, isH ? 4 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isH ? '#ffffff' : 'rgba(255,255,255,0.6)'; ctx.fill();

        // Win dot
        ctx.beginPath(); ctx.arc(x, wy, isH ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isH ? '#60a5fa' : '#2563eb'; ctx.fill();
        if (isH) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }

        // Value labels on hover
        if (isH) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText((d.total / 1000).toFixed(0) + 'K', x, ty - 10);
          ctx.fillStyle = '#60a5fa';
          ctx.fillText((d.win / 1000).toFixed(0) + 'K', x, wy - 10);
        }
      });

      ctx.restore();

      // X labels
      ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
      data.forEach((d, i) => {
        const x = padL + i * stepX;
        ctx.fillStyle = i === hIdx ? '#ffffff' : 'rgba(255,255,255,0.6)';
        ctx.fillText(d.label, x, padT + chartH + 18);
      });

      // Legend (top-left)
      ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(padL + 6, padT + 6, 12, 3);
      ctx.fillText('Total Votes', padL + 22, padT + 10);
      ctx.fillStyle = '#2563eb'; ctx.fillRect(padL + 6, padT + 20, 12, 3);
      ctx.fillStyle = 'rgba(96,165,250,0.9)'; ctx.fillText('Win Number', padL + 22, padT + 24);
    }

    // Chart mouse interaction
    function getHoverIdx(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const { padL, stepX } = chartDims;
      if (!stepX) return -1;
      const idx = Math.round((mx - padL) / stepX);
      return idx >= 0 && idx < data.length ? idx : -1;
    }

    const tableRows = document.querySelectorAll('.vtable-row:not(.vtable-header)');

    canvas.addEventListener('mousemove', (e) => {
      const idx = getHoverIdx(e);
      if (idx !== hoveredIdx) {
        hoveredIdx = idx;
        drawChart(1, hoveredIdx);
        // Sync table
        tableRows.forEach((r, i) => r.classList.toggle('vtable-hover', i === idx));
        // Tooltip
        if (idx >= 0) {
          const d = data[idx];
          chartTip.innerHTML = `<strong>${d.scenario}</strong>${d.label} turnout · Win: ${d.win.toLocaleString()}`;
          chartTip.classList.add('visible');
          const rect = canvas.getBoundingClientRect();
          const wRect = wrap.getBoundingClientRect();
          chartTip.style.left = (e.clientX - wRect.left + 12) + 'px';
          chartTip.style.top = (e.clientY - wRect.top - 8) + 'px';
        } else {
          chartTip.classList.remove('visible');
        }
      } else if (idx >= 0) {
        const wRect = wrap.getBoundingClientRect();
        chartTip.style.left = (e.clientX - wRect.left + 12) + 'px';
        chartTip.style.top = (e.clientY - wRect.top - 8) + 'px';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredIdx = -1;
      drawChart(1, -1);
      tableRows.forEach(r => r.classList.remove('vtable-hover'));
      chartTip.classList.remove('visible');
    });

    // Table row hover → chart sync
    tableRows.forEach((row, i) => {
      row.addEventListener('mouseenter', () => {
        hoveredIdx = i;
        drawChart(1, i);
        tableRows.forEach((r, j) => r.classList.toggle('vtable-hover', j === i));
      });
      row.addEventListener('mouseleave', () => {
        hoveredIdx = -1;
        drawChart(1, -1);
        tableRows.forEach(r => r.classList.remove('vtable-hover'));
      });
    });

    function animateChart() {
      if (chartAnimated) return;
      chartAnimated = true;
      const start = performance.now();
      const duration = 1800;
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        drawChart(eased, -1);
        tableRows.forEach(row => {
          const bar = row.querySelector('.vtable-bar');
          if (bar) bar.style.width = ((parseInt(row.dataset.turnout) / 85) * 100 * eased) + '%';
        });
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // Add progress bars
    tableRows.forEach(row => {
      const bar = document.createElement('div');
      bar.className = 'vtable-bar';
      row.appendChild(bar);
    });

    // Trigger on slide active
    const victorySlide = slides[4];
    if (victorySlide) {
      const observer = new MutationObserver(() => {
        if (victorySlide.classList.contains('active')) setTimeout(animateChart, 400);
      });
      observer.observe(victorySlide, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('resize', () => { if (chartAnimated) drawChart(1, hoveredIdx); });
  }

  initWinChart();

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  goTo(0, true);

});
