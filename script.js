// =========================================================
// PREFERS REDUCED MOTION
// If the visitor has this on, skip animation entirely —
// reveal everything immediately, no observers needed.
// =========================================================
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    el.classList.add('is-visible');
  });
}


// =========================================================
// SCROLL REVEAL
// Anything with a data-reveal attribute starts hidden/offset
// (see styles.css) and toggles .is-visible as it crosses into
// or out of view — so it plays again scrolling back up too,
// not just once on the way down.
// =========================================================
if (!prefersReducedMotion) {
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll('[data-reveal]');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i * 90, 540)}ms`;
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    revealObserver.observe(el);
  });
}


// =========================================================
// STICKY NAV
// Hidden until the visitor scrolls past the hero, then it
// slides in and stays. Also tracks which section is on
// screen and underlines the matching nav link.
// =========================================================
const siteNav = document.getElementById('siteNav');
const hero = document.getElementById('hero');

const navVisibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      siteNav.classList.toggle('is-visible', !entry.isIntersecting);
    });
  },
  { threshold: 0 }
);
if (hero) navVisibilityObserver.observe(hero);

const navLinks = document.querySelectorAll('[data-nav]');
const trackedSections = document.querySelectorAll('main > section[id]');

const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.5 }
);
trackedSections.forEach((section) => activeLinkObserver.observe(section));


// =========================================================
// MOBILE MENU TOGGLE
// =========================================================
const navToggle = document.getElementById('navToggle');
const navLinksPanel = document.getElementById('navLinks');

if (navToggle && navLinksPanel) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksPanel.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the panel once a link is tapped
  navLinksPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinksPanel.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}


// =========================================================
// WAVE THREAD ANCHORS
// #threadStart marks the hero; #threadEnd sits right at the
// ocean's true bottom edge, inside .ocean itself, before its
// closing tag. The kelp connector's height is measured as the
// pixel distance between those two points specifically — NOT
// .thread-scope's full height, which also includes Contact's
// own bottom padding below the ocean and was causing the
// connector to visibly overshoot past the water.
// =========================================================
const threadStart = document.getElementById('threadStart');
const threadEnd = document.getElementById('threadEnd');
const waveThreadEl = document.getElementById('waveThread');

if (threadStart && threadEnd && waveThreadEl) {
  const pinThreadHeight = () => {
    const startY = threadStart.getBoundingClientRect().top + window.scrollY;
    const endY = threadEnd.getBoundingClientRect().top + window.scrollY;
    const h = Math.max(0, endY - startY);
    waveThreadEl.style.height = `${h}px`;
  };

  pinThreadHeight();
  window.addEventListener('load', pinThreadHeight);
  window.addEventListener('resize', pinThreadHeight);

  if ('ResizeObserver' in window) {
    new ResizeObserver(pinThreadHeight).observe(document.body);
  } else {
    [300, 800, 1600, 3000].forEach((ms) => setTimeout(pinThreadHeight, ms));
  }
}


// =========================================================
// SUN
// Sets into the ocean as you scroll — moves continuously
// from the top-left corner down toward the water the entire
// way, tied directly to scroll progress between the hero and
// the ocean surface. Its vertical position is also hard-capped
// against the ocean's real on-screen bottom edge (#threadEnd)
// every frame — a fixed vh value alone isn't reliable here,
// since 62vh means "62% of the current window," which doesn't
// always line up with where the ocean actually ends once
// you've scrolled past it.
// =========================================================
const sun = document.getElementById('sun');
const oceanSurface = document.getElementById('oceanSurface');

if (sun && threadStart && oceanSurface && threadEnd && !prefersReducedMotion) {
  const startTopVh = 8, startLeftVw = 8;
  const endTopVh = 62, endLeftVw = 48;

  const updateSun = () => {
    const startY = threadStart.getBoundingClientRect().top + window.scrollY;
    const endY = oceanSurface.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, endY - startY);
    const progress = Math.min(1, Math.max(0, (window.scrollY - startY) / range));

    let top = startTopVh + (endTopVh - startTopVh) * progress;
    const left = startLeftVw + (endLeftVw - startLeftVw) * progress;

    // Hard cap: never let the sun sit lower on screen than the
    // ocean's own bottom edge currently renders.
    const oceanBottomVh = (threadEnd.getBoundingClientRect().top / window.innerHeight) * 100;
    top = Math.min(top, oceanBottomVh);

    sun.style.top = `${top}vh`;
    sun.style.left = `${left}vw`;
    sun.style.opacity = String(0.3 - progress * 0.08);
  };

  window.addEventListener('scroll', updateSun, { passive: true });
  window.addEventListener('resize', updateSun);
  updateSun();
}


// =========================================================
// FOLDER — "WHAT'S IN MY PORTFOLIO"
// Items stay tucked away until the folder itself is clicked,
// then they pop out with a staggered bounce (see styles.css).
// =========================================================
const folderScene = document.getElementById('folderScene');
const folderTrigger = document.getElementById('folderTrigger');

if (folderScene && folderTrigger) {
  folderTrigger.addEventListener('click', () => {
    const isOpen = folderScene.classList.toggle('is-open');
    folderTrigger.setAttribute('aria-expanded', String(isOpen));
  });
}


// =========================================================
// SONG PLAYER
// The button above "hi, i'm" plays a real local audio file
// (audio/texas-sun.mp3), jumping straight to SONG_START_TIME
// and fading the volume in — same technique as the other
// site's hover-preview song cards, just triggered by a click
// instead of a hover, and looping instead of a short preview.
// A separate fixed pause button appears once playback starts,
// staying reachable while scrolling.
// =========================================================
const songPlayBtn = document.getElementById('songPlayBtn');
const songFloatBtn = document.getElementById('songFloatBtn');
const SONG_SRC = 'audio/texas-sun.mp3';
const SONG_START_TIME = 14; // seconds — 0:14
const SONG_VOLUME = 0.5;

if (songPlayBtn && songFloatBtn) {
  const songAudio = new Audio(SONG_SRC);
  songAudio.preload = 'auto';
  songAudio.loop = true;

  let fadeInterval = null;
  let hasStartedOnce = false;
  let audioUnlocked = false;

  // Browsers block audio.play() until the visitor has interacted
  // with the page at least once — the button click itself counts,
  // but this also unlocks it globally in case anything else on
  // the page ever wants to play audio too.
  document.addEventListener('click', () => { audioUnlocked = true; }, { once: true });

  const clearFade = () => {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  };

  const fadeIn = (targetVolume = SONG_VOLUME) => {
    clearFade();
    songAudio.volume = 0;
    songAudio.play().catch(() => {
      // Autoplay can still be blocked in some browsers even after
      // a click — fail quietly rather than throwing to console.
    });
    let v = 0;
    fadeInterval = setInterval(() => {
      v += 0.05;
      if (v >= targetVolume) {
        v = targetVolume;
        clearFade();
      }
      songAudio.volume = v;
    }, 30);
  };

  const fadeOut = () => {
    clearFade();
    let v = songAudio.volume;
    fadeInterval = setInterval(() => {
      v -= 0.05;
      if (v <= 0) {
        songAudio.volume = 0;
        songAudio.pause();
        clearFade();
      } else {
        songAudio.volume = v;
      }
    }, 30);
  };

  const setPlayingUI = (isPlaying) => {
    songPlayBtn.classList.toggle('is-playing', isPlaying);
    songPlayBtn.setAttribute('aria-label', isPlaying ? 'Pause Texas Sun' : "Play Texas Sun by Leon Bridges & Khruangbin");
    songFloatBtn.classList.toggle('is-playing', isPlaying);
    songFloatBtn.setAttribute('aria-label', isPlaying ? 'Pause Texas Sun' : 'Play Texas Sun');
    // Stays visible once the song has ever started, so it's still
    // reachable to resume playback — only fully hidden before the
    // first play, when there's nothing yet to resume.
    songFloatBtn.hidden = !hasStartedOnce;
  };

  const startFromBeginning = () => {
    if (!hasStartedOnce) {
      // Jump to 0:14 only the first time it plays — resuming
      // later should continue from wherever it was, not snap
      // back to 0:14 again.
      hasStartedOnce = true;
      songAudio.currentTime = SONG_START_TIME;
    }
    fadeIn();
  };

  songPlayBtn.addEventListener('click', () => {
    if (songAudio.paused) {
      startFromBeginning();
    } else {
      fadeOut();
    }
  });

  songFloatBtn.addEventListener('click', () => {
    if (songAudio.paused) {
      startFromBeginning();
    } else {
      fadeOut();
    }
  });

  songAudio.addEventListener('play', () => setPlayingUI(true));
  songAudio.addEventListener('pause', () => setPlayingUI(false));
}


// =========================================================
// RESUME VIEWER
// Toggles an inline PDF viewer instead of downloading.
// =========================================================
const resumeToggle = document.getElementById('resumeToggle');
const resumeViewer = document.getElementById('resumeViewer');

if (resumeToggle && resumeViewer) {
  resumeToggle.addEventListener('click', () => {
    const isOpen = resumeViewer.classList.toggle('is-open');
    resumeToggle.setAttribute('aria-expanded', String(isOpen));
    resumeToggle.querySelector('.resume-cta-label').textContent =
      isOpen ? 'Hide my resume' : 'View my resume';
  });
}


// =========================================================
// ABOUT — PHOTOS DRIFTING UP FROM THE CAMERA SCREEN
// As the About section scrolls through the viewport, each
// photo travels upward by its own distance, staggered for
// a layered parallax feel, and fades in as it goes.
// =========================================================
const aboutMedia = document.querySelector('.about-media');
const digiPhotos = document.querySelectorAll('.digi-photo');

if (aboutMedia && digiPhotos.length && !prefersReducedMotion) {
  const travel = [260, 360, 300]; // px each photo drifts over the full scroll range

  const updateDigiParallax = () => {
    const rect = aboutMedia.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh;
    const scrolled = vh - rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / total));

    digiPhotos.forEach((photo, i) => {
      const distance = travel[i % travel.length];
      const rotate = photo.dataset.rotate || 0;
      photo.style.transform = `translateY(${-progress * distance}px) rotate(${rotate}deg)`;
      photo.style.opacity = Math.min(1, progress * 2.5);
    });
  };

  window.addEventListener('scroll', updateDigiParallax, { passive: true });
  window.addEventListener('resize', updateDigiParallax);
  updateDigiParallax();
}


// =========================================================
// CONTACT FORM
// Submits to Formspree via fetch() instead of letting the
// browser do a native form POST — a plain POST would navigate
// the whole page away to Formspree's own confirmation page.
// This intercepts that, sends the data in the background, and
// shows a status message right on the page instead.
// =========================================================
const contactForm = document.querySelector('.contact-form');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.contact-button');
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = '';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        contactForm.reset();
        if (formStatus) {
          formStatus.textContent = "Thanks — your message is on its way!";
          formStatus.className = 'form-status form-status--success';
        }
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = "Something went wrong — try again, or email me directly.";
        formStatus.className = 'form-status form-status--error';
      }
    } finally {
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    }
  });
}


// =========================================================
// WORK FILTER
// Toggles which case files are visible based on category.
// =========================================================
const filterButtons = document.querySelectorAll('.filter-pill');
const workCards = document.querySelectorAll('.project');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    workCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.style.display = matches ? '' : 'none';
    });
  });
});