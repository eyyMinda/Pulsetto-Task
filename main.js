const HeaderNavigation = {
  elements: {
    root: null,
    dropdown: null,
    dropdownTrigger: null,
    dropdownLinks: [],
    desktopLinks: [],
  },

  init() {
    this.elements.root = document.querySelector('[data-site-header]');
    if (!this.elements.root) {
      return;
    }

    this.elements.dropdown = this.elements.root.querySelector('.header__nav-dropdown');
    this.elements.dropdownTrigger = this.elements.root.querySelector('.header__nav-dropdown-trigger');
    this.elements.dropdownLinks = [...this.elements.root.querySelectorAll('.header__nav-dropdown-link')];
    this.elements.desktopLinks = [...this.elements.root.querySelectorAll('.header__nav-link')];

    this.updateHeaderState();
    window.addEventListener('scroll', () => this.updateHeaderState(), { passive: true });

    for (const dropdownLink of this.elements.dropdownLinks) {
      dropdownLink.addEventListener('click', (event) => this.handleDropdownLinkClick(event, dropdownLink));
    }

    for (const desktopLink of this.elements.desktopLinks) {
      desktopLink.addEventListener('click', (event) => this.handleDesktopLinkClick(event, desktopLink));
    }
  },

  updateHeaderState() {
    const shouldFixHeader = window.scrollY > 6;
    this.elements.root.classList.toggle('header--fixed', shouldFixHeader);
  },

  getSelectedValue(linkElement) {
    return linkElement.dataset.navValue || linkElement.textContent.trim();
  },

  updateTriggerLabel(selectedValue) {
    if (this.elements.dropdownTrigger) {
      this.elements.dropdownTrigger.textContent = selectedValue;
    }
  },

  updateActiveNav(selectedValue) {
    for (const link of this.elements.dropdownLinks) {
      const isActive = link.dataset.navValue === selectedValue;
      link.classList.toggle('header__nav-dropdown-link--active', isActive);
    }

    for (const link of this.elements.desktopLinks) {
      const isActive = link.dataset.navValue === selectedValue;
      link.classList.toggle('header__nav-link--active', isActive);
    }
  },

  closeDropdown() {
    if (this.elements.dropdown) {
      this.elements.dropdown.removeAttribute('open');
    }
  },

  handleDropdownLinkClick(event, linkElement) {
    event.preventDefault();
    const selectedValue = this.getSelectedValue(linkElement);

    this.updateTriggerLabel(selectedValue);
    this.updateActiveNav(selectedValue);
    this.closeDropdown();
  },

  handleDesktopLinkClick(event, linkElement) {
    event.preventDefault();
    const selectedValue = this.getSelectedValue(linkElement);

    this.updateTriggerLabel(selectedValue);
    this.updateActiveNav(selectedValue);
  },
};

const StatsCounter = {
  elements: [],
  observer: null,
  prefersReducedMotion: false,

  init() {
    this.elements = [...document.querySelectorAll('[data-stat-target]')];
    if (this.elements.length === 0) {
      return;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer = new IntersectionObserver((entries) => this.handleIntersect(entries), { threshold: 0.45 });

    for (const statElement of this.elements) {
      this.observer.observe(statElement);
    }
  },

  handleIntersect(entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const statElement = entry.target;
      const targetValue = Number(statElement.dataset.statTarget);
      if (!Number.isFinite(targetValue)) {
        this.observer.unobserve(statElement);
        continue;
      }

      if (this.prefersReducedMotion) {
        statElement.textContent = `${targetValue}%`;
        this.observer.unobserve(statElement);
        continue;
      }

      this.animateStatValue(statElement, targetValue);
      this.observer.unobserve(statElement);
    }
  },

  animateStatValue(statElement, targetValue) {
    const durationMs = 1400;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(targetValue * easedProgress);

      statElement.textContent = `${currentValue}%`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  },
};

const ReviewsTabs = {
  elements: {
    root: null,
    panels: [],
    navButtons: [],
  },

  init() {
    this.elements.root = document.querySelector('.reviews');
    if (!this.elements.root) {
      return;
    }

    this.elements.panels = [...this.elements.root.querySelectorAll('[data-review-panel]')];
    this.elements.navButtons = [...this.elements.root.querySelectorAll('[data-review-target]')];
    if (this.elements.panels.length === 0 || this.elements.navButtons.length === 0) {
      return;
    }

    for (const navButton of this.elements.navButtons) {
      navButton.addEventListener('click', () => this.setActiveReview(navButton.dataset.reviewTarget || ''));
    }
  },

  setActiveReview(reviewKey) {
    if (!reviewKey) {
      return;
    }

    for (const panel of this.elements.panels) {
      const isActive = panel.dataset.reviewPanel === reviewKey;
      panel.classList.toggle('reviews__panel--active', isActive);
    }

    for (const navButton of this.elements.navButtons) {
      const isActive = navButton.dataset.reviewTarget === reviewKey;
      navButton.classList.toggle('reviews__nav-btn--active', isActive);
    }
  },
};

const App = {
  init() {
    HeaderNavigation.init();
    StatsCounter.init();
    ReviewsTabs.init();
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
