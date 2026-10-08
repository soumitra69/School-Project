// Desktop hover dropdowns, with click/tap and keyboard controls on every device.
  const siteHeader = document.getElementById('site-header');
  const primaryNavigation = document.getElementById('primary-navigation');
  const navToggle = document.getElementById('nav-toggle');
  const navDropdowns = [...primaryNavigation.querySelectorAll('.nav-dropdown')];
  const desktopNavigation = window.matchMedia('(min-width: 1024px)');
  const hoverNavigation = window.matchMedia('(hover: hover) and (pointer: fine)');

  function closeDropdowns(except = null) {
    navDropdowns.forEach(dropdown => {
      if (dropdown !== except) dropdown.open = false;
    });
  }

  function setNavigationOpen(isOpen) {
    primaryNavigation.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    if (!isOpen) closeDropdowns();
  }

  siteHeader.classList.add('nav-enhanced');
  navToggle.addEventListener('click', () => {
    setNavigationOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navDropdowns.forEach(dropdown => {
    dropdown.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !desktopNavigation.matches || !hoverNavigation.matches) return;
      closeDropdowns(dropdown);
      dropdown.open = true;
    });
    dropdown.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse' || !desktopNavigation.matches || !hoverNavigation.matches) return;
      // Allow keyboard users to continue through a focused submenu.
      const focused = document.activeElement;
      if (dropdown.contains(focused) && focused.matches(':focus-visible')) return;
      dropdown.open = false;
    });
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget) && !dropdown.matches(':hover')) dropdown.open = false;
    });
    dropdown.querySelector('summary').addEventListener('click', event => {
      closeDropdowns(dropdown);
      // A mouse click on a menu already opened by hover should keep it open.
      if (event.detail > 0 && desktopNavigation.matches && hoverNavigation.matches && dropdown.matches(':hover')) {
        event.preventDefault();
        dropdown.open = true;
      }
    });
    dropdown.addEventListener('toggle', () => {
      if (dropdown.open) closeDropdowns(dropdown);
    });
  });

  primaryNavigation.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.dataset.wing) switchWing(link.dataset.wing);
    if (link.dataset.notice) filterNotices(link.dataset.notice);

    primaryNavigation.querySelectorAll('.active').forEach(item => item.classList.remove('active'));
    primaryNavigation.querySelectorAll('[aria-current]').forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
    const dropdown = link.closest('.nav-dropdown');
    (dropdown ? dropdown.querySelector('summary') : link).classList.add('active');
    setNavigationOpen(false);

    // Keep keyboard focus at the destination after the navigation closes.
    const destination = document.getElementById(link.hash.slice(1));
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  });

  document.addEventListener('click', event => {
    if (!siteHeader.contains(event.target)) setNavigationOpen(false);
    else if (!primaryNavigation.contains(event.target)) closeDropdowns();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openDropdown = navDropdowns.find(dropdown => dropdown.open);
    if (openDropdown) {
      closeDropdowns();
      openDropdown.querySelector('summary').focus();
    } else if (navToggle.getAttribute('aria-expanded') === 'true') {
      setNavigationOpen(false);
      navToggle.focus();
    }
  });

  desktopNavigation.addEventListener('change', () => {
    const focusWasInNavigation = primaryNavigation.contains(document.activeElement);
    setNavigationOpen(false);
    if (!desktopNavigation.matches && focusWasInNavigation) navToggle.focus();
    else if (desktopNavigation.matches && document.activeElement === navToggle) {
      primaryNavigation.querySelector('a').focus();
    }
  });

  // Floating quick navigation and back-to-top shortcuts.
  const floatingActions = document.getElementById('floating-actions');
  const floatingNavigation = document.getElementById('floating-navigation');
  const floatingMenuToggle = document.getElementById('floating-menu-toggle');
  const backToTop = document.getElementById('back-to-top');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Keep full messages readable without JavaScript; enhance each card independently.
  document.querySelectorAll('.message-read-more').forEach(button => {
    const content = document.getElementById(button.getAttribute('aria-controls'));
    const title = button.closest('article').querySelector('h2').textContent.trim();
    function setMessageExpanded(expanded) {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${expanded ? 'Read less' : 'Read more'} of the ${title}`);
      button.querySelector('[data-message-label]').textContent = expanded ? 'Read Less' : 'Read More';
      content.classList.toggle('is-collapsed', !expanded);
      content.inert = !expanded;
      content.setAttribute('aria-hidden', String(!expanded));
    }
    setMessageExpanded(false);
    button.hidden = false;
    button.addEventListener('click', () => {
      setMessageExpanded(button.getAttribute('aria-expanded') !== 'true');
    });
  });

  function setQuickNavigationOpen(isOpen, restoreFocus = false) {
    floatingNavigation.hidden = !isOpen;
    floatingMenuToggle.setAttribute('aria-expanded', String(isOpen));
    floatingMenuToggle.setAttribute('aria-label', isOpen ? 'Close quick navigation' : 'Open quick navigation');
    if (restoreFocus) floatingMenuToggle.focus({ preventScroll: true });
  }

  floatingMenuToggle.hidden = false;
  floatingMenuToggle.addEventListener('click', () => {
    const isOpen = floatingNavigation.hidden;
    setNavigationOpen(false);
    setQuickNavigationOpen(isOpen);
    if (isOpen) floatingNavigation.querySelector('a').focus({ preventScroll: true });
  });

  floatingNavigation.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const destination = document.getElementById(link.hash.slice(1));
    setQuickNavigationOpen(false);
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  });

  document.addEventListener('click', event => {
    if (!floatingActions.contains(event.target)) {
      const focusWasInMenu = floatingNavigation.contains(document.activeElement);
      setQuickNavigationOpen(false, focusWasInMenu);
    }
  });

  floatingActions.addEventListener('focusout', event => {
    if (!floatingActions.contains(event.relatedTarget)) setQuickNavigationOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !floatingNavigation.hidden) {
      setQuickNavigationOpen(false, true);
    }
  });

  backToTop.addEventListener('click', event => {
    event.preventDefault();
    setQuickNavigationOpen(false);
    setNavigationOpen(false);
    siteHeader.querySelector('.school-brand').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });

  // Reading progress and section highlighting share one update per animation frame.
  const quickLinks = [...floatingNavigation.querySelectorAll('a')];
  const navigationItems = [...primaryNavigation.children].map(item => ({
    element: item.matches('.nav-dropdown') ? item.querySelector('summary') : item,
    route: (item.matches('a') ? item : item.querySelector('a')).hash.slice(1)
  }));
  const navigationGroups = {
    'mission-vision-section': 'about-section',
    'vice-president-section': 'principal-message',
    'chairman-section': 'principal-message',
    'why-ferrando': 'about-section',
    'academic-pathways': 'wings-section',
    'resources-section': 'admission-steps',
    'visit-section': 'campus-visit-geo'
  };
  const sectionRoutes = [...document.querySelectorAll('main > section[id]')].map(section => ({
    section,
    route: section.id === 'student-portal' ? 'admission-steps' : section.id
  })).filter(({ route }) => quickLinks.some(link => link.hash === `#${route}`));
  let activeSection = '';
  let scrollUpdatePending = false;

  function updateReadingProgress() {
    scrollUpdatePending = false;
    const scrollRange = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollRange > 0 ? Math.max(0, Math.min(window.scrollY / scrollRange, 1)) : 0;
    document.documentElement.style.setProperty('--page-progress', progress.toFixed(4));
    let current = 'home';
    sectionRoutes.forEach(({ section, route }) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.25) current = route;
    });
    if (current === activeSection) return;
    activeSection = current;
    primaryNavigation.querySelectorAll('[aria-current]').forEach(item => item.removeAttribute('aria-current'));
    navigationItems.forEach(({ element, route }) => {
      const active = route === (navigationGroups[current] || current);
      element.classList.toggle('active', active);
      if (active) element.setAttribute('aria-current', 'location');
    });
    quickLinks.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleScrollUpdate() {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    requestAnimationFrame(updateReadingProgress);
  }

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  window.addEventListener('load', scheduleScrollUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScrollUpdate).observe(document.body);
  scheduleScrollUpdate();

  // K-12 Wings Tab Switching
  function switchWing(targetId) {
    const tabs = document.querySelectorAll('.wing-tab-btn');
    tabs.forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-target') === targetId));
      btn.setAttribute('aria-controls', btn.getAttribute('data-target'));
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.remove('bg-white', 'text-slate-700', 'border');
        btn.classList.add('bg-[#0B1B3D]', 'text-white', 'shadow');
      } else {
        btn.classList.remove('bg-[#0B1B3D]', 'text-white', 'shadow');
        btn.classList.add('bg-white', 'text-slate-700', 'border');
      }
    });

    const wings = document.querySelectorAll('.wing-content');
    wings.forEach(wing => {
      if (wing.id === targetId) {
        wing.classList.remove('hidden');
        wing.classList.add('grid');
        wing.classList.add('is-revealed');
      } else {
        wing.classList.remove('grid');
        wing.classList.add('hidden');
      }
    });
  }

  // Category filters and text search work together without reloading the page.
  let currentNoticeCategory = 'all';
  const noticeSearch = document.getElementById('notice-search');
  document.getElementById('notice-search-tools').hidden = false;
  function filterNotices(category, animate = true) {
    currentNoticeCategory = category;
    const query = noticeSearch.value.trim().toLocaleLowerCase();
    const tabs = document.querySelectorAll('.notice-tab');
    tabs.forEach(tab => {
      tab.setAttribute('aria-pressed', String(tab.getAttribute('data-cat') === category));
      if (tab.getAttribute('data-cat') === category) {
        tab.classList.remove('bg-white', 'text-slate-700', 'border');
        tab.classList.add('bg-[#0B1B3D]', 'text-white', 'shadow-md');
      } else {
        tab.classList.remove('bg-[#0B1B3D]', 'text-white', 'shadow-md');
        tab.classList.add('bg-white', 'text-slate-700', 'border');
      }
    });

    const items = document.querySelectorAll('.notice-item');
    let visibleCount = 0;
    items.forEach(item => {
      item.getAnimations().forEach(animation => animation.cancel());
      const matchesCategory = category === 'all' || item.classList.contains(category);
      const matchesSearch = item.textContent.toLocaleLowerCase().includes(query);
      if (matchesCategory && matchesSearch) {
        item.style.display = 'flex';
        if (animate && !reducedMotion.matches) {
          item.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 280, delay: visibleCount * 45, easing: 'ease-out' });
        }
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    document.getElementById('notice-results').textContent = `${visibleCount} of ${items.length} circulars shown`;
    document.getElementById('notice-empty').hidden = visibleCount > 0;
  }
  noticeSearch.addEventListener('input', () => filterNotices(currentNoticeCategory));
  filterNotices('all', false);
  document.querySelectorAll('.wing-tab-btn').forEach(button => {
    button.setAttribute('aria-controls', button.dataset.target);
    button.setAttribute('aria-pressed', String(!document.getElementById(button.dataset.target).classList.contains('hidden')));
  });

  // Reveal every section and its cards as they enter the viewport.
  document.addEventListener('DOMContentLoaded', () => {
    const sections = [...document.querySelectorAll('main > section, footer')];
    const counters = [...document.querySelectorAll('[data-counter]')];
    const numberFormatter = new Intl.NumberFormat('en-IN');
    const counted = new WeakSet();
    const counterFrames = new WeakMap();
    // Animate the containing block once instead of animating its heading again.
    const revealElements = [...document.querySelectorAll('.reveal-on-scroll, main .interactive-card, main .wing-content, main .notice-item, main h2, footer h4, main .section-heading-row > .school-button, main .section-tabs, main .gallery-filter')]
      .filter(element => !element.parentElement.closest('.reveal-on-scroll'));

    sections.forEach(section => {
      section.classList.add('section-animated');
      section.querySelector(':scope > .max-w-7xl')?.classList.add('section-content');
    });

    revealElements.forEach(element => {
      element.classList.add('reveal-on-scroll');
      const delayClass = [...element.classList].find(name => /^delay-\d+$/.test(name));
      const siblings = [...element.parentElement.children].filter(child => child.matches('.interactive-card, .notice-item'));
      const cardIndex = Math.max(0, siblings.indexOf(element));
      const delay = delayClass ? Number(delayClass.slice(6)) : cardIndex * 70;
      element.style.setProperty('--reveal-delay', `${Math.min(delay, 320)}ms`);
      if (element.matches('.interactive-card, .notice-item')) {
        element.style.setProperty('--reveal-x', '0px');
        element.style.setProperty('--reveal-y', '18px');
        element.style.setProperty('--reveal-scale', '1');
      }
    });

    function renderCounter(counter, value) {
      counter.textContent = numberFormatter.format(value) + (counter.dataset.counterSuffix || '');
    }

    function animateCounter(counter) {
      if (counted.has(counter)) return;
      counted.add(counter);
      const target = Number(counter.dataset.counter);
      if (reducedMotion.matches) {
        renderCounter(counter, target);
        return;
      }
      const startedAt = performance.now();
      function updateCounter(now) {
        const progress = Math.min((now - startedAt) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        renderCounter(counter, Math.floor(target * eased));
        if (progress < 1 && !reducedMotion.matches) counterFrames.set(counter, requestAnimationFrame(updateCounter));
        else {
          counterFrames.delete(counter);
          renderCounter(counter, target);
        }
      }
      counterFrames.set(counter, requestAnimationFrame(updateCounter));
    }

    counters.forEach(counter => {
      counter.setAttribute('aria-label', counter.textContent.trim());
      renderCounter(counter, reducedMotion.matches ? Number(counter.dataset.counter) : 0);
    });

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      sections.forEach(section => section.classList.add('is-section-visible'));
      revealElements.forEach(element => element.classList.add('is-revealed'));
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target;
        if (!entry.isIntersecting) return;
        if (element.matches('.section-animated')) element.classList.add('is-section-visible');
        if (element.matches('.reveal-on-scroll')) element.classList.add('is-revealed');
        if (element.matches('[data-counter]')) animateCounter(element);
        observer.unobserve(element);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    document.documentElement.classList.add('motion-ready');
    [...sections, ...revealElements, ...counters].forEach(element => observer.observe(element));

    // Focused destinations stay visible when reached by keyboard or navigation links.
    document.addEventListener('focusin', event => {
      let element = event.target;
      while (element && element !== document.body) {
        if (element.matches('.reveal-on-scroll')) element.classList.add('is-revealed');
        if (element.matches('.section-animated')) element.classList.add('is-section-visible');
        element = element.parentElement;
      }
    });

    reducedMotion.addEventListener('change', event => {
      if (!event.matches) return;
      sections.forEach(section => section.classList.add('is-section-visible'));
      revealElements.forEach(element => element.classList.add('is-revealed'));
      counters.forEach(counter => {
        cancelAnimationFrame(counterFrames.get(counter));
        counterFrames.delete(counter);
        counted.add(counter);
        renderCounter(counter, Number(counter.dataset.counter));
      });
      observer.disconnect();
    });
  });

  // Seven local photos, advancing every two seconds while the banner is visible.
  document.addEventListener('DOMContentLoaded', () => {
    const slideshow = document.getElementById('hero-slideshow');
    const controls = document.getElementById('slideshow-controls');
    const slides = [...slideshow.querySelectorAll('.hero-slide')];
    const dots = [...controls.querySelectorAll('.slideshow-dot')];
    let currentSlide = 0;
    let timer = null;
    let isVisible = !('IntersectionObserver' in window);
    let isHovered = false;

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentSlide;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        dots[slideIndex].setAttribute('aria-current', String(active));
      });
      const slide = slides[currentSlide];
      document.getElementById('slideshow-title').textContent = slide.dataset.title;
      document.getElementById('slideshow-badge').textContent = slide.dataset.badge;
      document.getElementById('slideshow-caption').textContent = slide.dataset.caption;
    }

    function updateAutoplay() {
      clearInterval(timer);
      timer = null;
      const navigatingPhotos = controls.contains(document.activeElement);
      if (reducedMotion.matches || !isVisible || isHovered || document.hidden || navigatingPhotos) return;
      timer = setInterval(() => showSlide(currentSlide + 1), 2000);
    }

    function chooseSlide(index) {
      showSlide(index);
      updateAutoplay();
    }

    dots.forEach(dot => dot.addEventListener('click', () => chooseSlide(Number(dot.dataset.slide))));
    controls.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      isHovered = true;
      updateAutoplay();
    });
    controls.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      isHovered = false;
      updateAutoplay();
    });
    controls.addEventListener('focusin', updateAutoplay);
    controls.addEventListener('focusout', () => queueMicrotask(updateAutoplay));
    document.addEventListener('visibilitychange', updateAutoplay);
    reducedMotion.addEventListener('change', updateAutoplay);
    if ('IntersectionObserver' in window) {
      const slideshowObserver = new IntersectionObserver(entries => {
        isVisible = entries[0].isIntersecting;
        updateAutoplay();
      }, { threshold: 0.15 });
      slideshowObserver.observe(slideshow);
    }
    document.getElementById('slideshow-controls').hidden = false;
    updateAutoplay();
  });
