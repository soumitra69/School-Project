// Duplicate the notification text for a seamless scroll; keep one accessible copy.
(() => {
  const marquee = document.getElementById('notification-marquee');
  if (!marquee) return;
  const track = marquee.querySelector('.notification-track');
  const copy = track.querySelector('.notification-content').cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  copy.querySelectorAll('a').forEach(link => link.tabIndex = -1);
  track.append(copy);
  marquee.classList.add('is-scrolling');
  function updateVisibility() {
    marquee.classList.toggle('is-document-hidden', document.hidden);
  }
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();
})();

// Academic buttons outside the main menu select the matching learning wing.
document.querySelectorAll('.footer-wing-button[data-wing]').forEach(link => {
  link.addEventListener('click', () => switchWing(link.dataset.wing));
});

// Gallery filters and an accessible, keyboard-operated photo viewer.
(() => {
  const gallery = document.getElementById('gallery-section');
  const dialog = document.getElementById('school-photo-dialog');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;
  const items = [...gallery.querySelectorAll('[data-gallery-category]')];
  const filters = [...gallery.querySelectorAll('[data-gallery-filter]')];
  const photo = dialog.querySelector('img');
  const title = document.getElementById('photo-dialog-title');
  const counter = document.getElementById('photo-dialog-counter');
  const status = document.getElementById('gallery-status');
  let currentItem = null;
  let opener = null;
  const visibleItems = () => items.filter(item => !item.hidden);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealObserver = null;
  let filterFrame = null;

  function setUpGalleryReveal() {
    revealObserver?.disconnect();
    if (motion.matches || !('IntersectionObserver' in window)) {
      gallery.classList.remove('gallery-motion-ready');
      items.forEach(item => item.classList.add('is-gallery-visible'));
      return;
    }
    gallery.classList.add('gallery-motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-gallery-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' });
    items.forEach((item, index) => {
      item.style.setProperty('--gallery-delay', `${index % 3 * 100}ms`);
      revealObserver.observe(item);
    });
  }
  function animateFilteredPhotos() {
    cancelAnimationFrame(filterFrame);
    const visible = visibleItems();
    visible.forEach((item, index) => {
      item.style.setProperty('--gallery-delay', `${index * 75}ms`);
      item.classList.toggle('is-gallery-visible', motion.matches);
    });
    if (motion.matches) return;
    filterFrame = requestAnimationFrame(() => {
      filterFrame = requestAnimationFrame(() => {
        visible.filter(item => !item.hidden).forEach(item => item.classList.add('is-gallery-visible'));
      });
    });
  }
  motion.addEventListener('change', setUpGalleryReveal);
  gallery.addEventListener('focusin', event => {
    event.target.closest('.gallery-item')?.classList.add('is-gallery-visible');
  });
  setUpGalleryReveal();

  function showPhoto(item) {
    currentItem = item;
    const thumbnail = item.querySelector('img');
    photo.src = item.href;
    photo.alt = thumbnail.alt;
    title.textContent = item.dataset.galleryTitle;
    const visible = visibleItems();
    counter.textContent = `Photo ${visible.indexOf(item) + 1} of ${visible.length}`;
  }
  function changePhoto(direction) {
    const visible = visibleItems();
    const index = (visible.indexOf(currentItem) + direction + visible.length) % visible.length;
    showPhoto(visible[index]);
  }
  gallery.querySelector('.gallery-filter').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.galleryFilter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    items.forEach(item => { item.hidden = category !== 'all' && item.dataset.galleryCategory !== category; });
    animateFilteredPhotos();
    status.textContent = `${visibleItems().length} photos shown`;
  }));
  items.forEach(item => item.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = item;
    showPhoto(item);
    dialog.showModal();
    document.body.classList.add('photo-dialog-open');
  }));
  dialog.querySelector('[data-photo-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-photo-previous]').addEventListener('click', () => changePhoto(-1));
  dialog.querySelector('[data-photo-next]').addEventListener('click', () => changePhoto(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('photo-dialog-open');
    opener?.focus({ preventScroll: true });
  });
})();

// Prepare an email the family can review and send in their own email app.
(() => {
  const form = document.getElementById('admission-inquiry-form');
  if (!form) return;
  document.querySelectorAll('[data-inquiry-stream]').forEach(link => {
    link.addEventListener('click', () => {
      form.elements.namedItem('admission-class').value = link.dataset.inquiryStream;
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const stream = form.elements.namedItem('admission-class');
    const stay = form.elements.namedItem('student-stay');
    const body = [
      'Dear Admissions Office,', '', 'I would like to enquire about admission.', '',
      `Student name: ${values.get('student-name').trim()}`,
      `Parent mobile: ${values.get('parent-mobile').trim()}`,
      `Class / stream: ${stream.options[stream.selectedIndex].text}`,
      `Day scholar / hostel: ${stay.options[stay.selectedIndex].text}`, '',
      'Please share the admission process, availability, and fee details.', '', 'Thank you.'
    ].join('\n');
    const status = document.getElementById('inquiry-status');
    status.textContent = 'Your email app will open with your enquiry ready to review. You can also email admissions@sferrandosamsymper.edu.in directly.';
    status.hidden = false;
    window.location.href = `mailto:admissions@sferrandosamsymper.edu.in?subject=${encodeURIComponent('School admission enquiry')}&body=${encodeURIComponent(body)}`;
  });
})();

// Header scroll elevation & glassmorphism trigger
(() => {
  const header = document.getElementById('site-header');
  if (!header) return;
  let ticking = false;
  function updateHeaderState() {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 35);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }, { passive: true });
  updateHeaderState();
})();

// Caption entrances share a compositor-friendly animation; no forced reflow.
(() => {
  const title = document.getElementById('slideshow-title');
  const badge = document.getElementById('slideshow-badge');
  const caption = document.getElementById('slideshow-caption');
  if (!title || !badge || !caption) return;

  const captionTargets = [title, badge, caption];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  function cancelCaptionAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }
  const observer = new MutationObserver(() => {
    cancelCaptionAnimations();
    if (motion.matches || document.hidden || typeof title.animate !== 'function') return;
    captionTargets.forEach((el, index) => {
      const animation = el.animate([
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 350, delay: index * 35, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    });
  });
  motion.addEventListener('change', cancelCaptionAnimations);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelCaptionAnimations();
  });
  observer.observe(title, { childList: true, characterData: true, subtree: true });
})();
