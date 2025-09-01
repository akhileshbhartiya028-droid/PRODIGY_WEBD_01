class ModernNavigation {
  constructor() {
    
    this.navbar = document.getElementById('navbar');
    this.navMenu = document.getElementById('nav-menu');
    this.mobileMenuToggle = document.getElementById('mobile-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('.section');
    
    // Configuration options
    this.scrollThreshold = 50;
    this.debounceDelay = 10;
    this.smoothScrollDuration = 800;
    
    // State management
    this.isScrolled = false;
    this.isMobileMenuOpen = false;
    this.currentActiveSection = null;
    
    // Bind methods to preserve context
    this.handleScroll = this.debounce(this.handleScroll.bind(this), this.debounceDelay);
    this.handleMobileMenuToggle = this.handleMobileMenuToggle.bind(this);
    this.handleNavLinkClick = this.handleNavLinkClick.bind(this);
    this.handleSectionIntersection = this.handleSectionIntersection.bind(this);
    
    // Initialize the navigation
    this.init();
  }
  
  /**
   * Initialize all navigation functionality
   */
  init() {
    this.setupScrollEffects();
    this.setupSmoothScrolling();
    this.setupActiveSectonTracking();
    this.setupMobileMenu();
    this.setupAccessibility();
    
    // Set initial active section
    this.setInitialActiveSection();
    
    console.log('ModernNavigation initialized successfully');
  }
  
  /**
   * Setup scroll effects for navbar transformation
   */
  setupScrollEffects() {
    // Use passive event listener for better scroll performance
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Check initial scroll position
    this.handleScroll();
  }
  
  /**
   * Handle scroll events with performance optimization
   */
  handleScroll() {
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const shouldBeScrolled = scrollPosition > this.scrollThreshold;
      
      // Only update if state has changed to avoid unnecessary DOM manipulation
      if (shouldBeScrolled !== this.isScrolled) {
        this.isScrolled = shouldBeScrolled;
        this.updateNavbarAppearance();
      }
    });
  }
  
  /**
   * Update navbar appearance based on scroll state
   */
  updateNavbarAppearance() {
    if (this.isScrolled) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }
  
  /**
   * Setup smooth scrolling for navigation links
   */
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavLinkClick);
    });
  }
  
  /**
   * Handle navigation link clicks with smooth scrolling
   */
  handleNavLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove focus outline immediately
    event.target.blur();
    
    const href = event.target.getAttribute('href');
    const targetId = href ? href.substring(1) : event.target.getAttribute('data-section');
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      // Close mobile menu if open
      if (this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Perform smooth scroll with custom easing
      this.smoothScrollToSection(targetSection);
      
      // Update active state immediately for better UX
      this.updateActiveNavLink(event.target);
    } else {
      console.warn(`Section with ID "${targetId}" not found`);
    }
  }
  
  /**
   * Smooth scroll to target section with custom easing
   */
  smoothScrollToSection(targetSection) {
    const navbarHeight = this.navbar.offsetHeight;
    const targetPosition = targetSection.offsetTop - navbarHeight - 10; // Add small offset
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    
    // If already at target, don't scroll
    if (Math.abs(distance) < 5) return;
    
    let startTime = null;
    
    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / this.smoothScrollDuration, 1);
      
      // Custom easing function for smooth animation (easeInOutQuart)
      const easeInOutQuart = progress < 0.5
        ? 8 * progress * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 4) / 2;
      
      const currentPosition = startPosition + (distance * easeInOutQuart);
      
      // Use both methods for cross-browser compatibility
      window.scrollTo({
        top: currentPosition,
        behavior: 'auto' // We're handling the animation manually
      });
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
  
  /**
   * Setup active section tracking using Intersection Observer
   */
  setupActiveSectonTracking() {
    // Use Intersection Observer for efficient section detection
    const observerOptions = {
      root: null,
      rootMargin: `-${this.navbar.offsetHeight + 20}px 0px -50% 0px`,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    };
    
    this.sectionObserver = new IntersectionObserver(
      this.handleSectionIntersection,
      observerOptions
    );
    
    // Observe all sections
    this.sections.forEach(section => {
      this.sectionObserver.observe(section);
    });
  }
  
  /**
   * Handle section intersection for active navigation highlighting
   */
  handleSectionIntersection(entries) {
    // Find the section with highest intersection ratio
    let mostVisibleSection = null;
    let maxIntersectionRatio = 0;
    
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = entry.intersectionRatio;
        mostVisibleSection = entry.target;
      }
    });
    
    // Update active navigation if we found a visible section
    if (mostVisibleSection && mostVisibleSection !== this.currentActiveSection) {
      this.currentActiveSection = mostVisibleSection;
      const targetNavLink = document.querySelector(`[href="#${mostVisibleSection.id}"]`) || 
                            document.querySelector(`[data-section="${mostVisibleSection.id}"]`);
      if (targetNavLink) {
        this.updateActiveNavLink(targetNavLink);
      }
    }
  }
  
  /**
   * Update active navigation link styling
   */
  updateActiveNavLink(activeLink) {
    // Remove active class from all nav links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current link
    activeLink.classList.add('active');
  }
  
  /**
   * Set initial active section based on scroll position
   */
  setInitialActiveSection() {
    const scrollPosition = window.pageYOffset + this.navbar.offsetHeight + 50;
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      if (section.offsetTop <= scrollPosition) {
        const navLink = document.querySelector(`[href="#${section.id}"]`) ||
                        document.querySelector(`[data-section="${section.id}"]`);
        if (navLink) {
          this.updateActiveNavLink(navLink);
        }
        break;
      }
    }
  }
  
  /**
   * Setup mobile hamburger menu functionality
   */
  setupMobileMenu() {
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', this.handleMobileMenuToggle);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isMobileMenuOpen && 
          !this.navMenu.contains(event.target) && 
          !this.mobileMenuToggle.contains(event.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Handle window resize to close mobile menu on desktop
    window.addEventListener('resize', this.debounce(() => {
      if (window.innerWidth > 768 && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    }, 250));
  }
  
  /**
   * Toggle mobile menu open/close state
   */
  handleMobileMenuToggle() {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  /**
   * Open mobile menu with animation
   */
  openMobileMenu() {
    this.isMobileMenuOpen = true;
    this.navMenu.classList.add('active');
    this.mobileMenuToggle.classList.add('active');
    
    // Prevent body scrolling when menu is open
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.navMenu.setAttribute('aria-expanded', 'true');
  }
  
  /**
   * Close mobile menu with animation
   */
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.navMenu.classList.remove('active');
    this.mobileMenuToggle.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Focus management for accessibility
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-expanded', 'false');
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA labels and roles
    this.navbar.setAttribute('role', 'navigation');
    this.navbar.setAttribute('aria-label', 'Main navigation');
    
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.setAttribute('aria-label', 'Toggle mobile menu');
      this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      this.mobileMenuToggle.setAttribute('aria-controls', 'nav-menu');
    }
    
    this.navMenu.setAttribute('aria-expanded', 'false');
    
    // Keyboard navigation support
    this.navLinks.forEach(link => {
      link.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          link.click();
        }
      });
    });
  }
  
  /**
   * Debounce utility function for performance optimization
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Cleanup method for removing event listeners (useful for SPA)
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    
    this.navLinks.forEach(link => {
      link.removeEventListener('click', this.handleNavLinkClick);
    });
    
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.removeEventListener('click', this.handleMobileMenuToggle);
    }
    
    // Disconnect Intersection Observer
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    console.log('ModernNavigation destroyed successfully');
  }
}

/**
 * Enhanced smooth scrolling fallback for older browsers
 */
function smoothScrollPolyfill() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 16);
    };
  }
}

/**
 * Initialize the navigation when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  // Apply smooth scrolling polyfill for older browsers
  smoothScrollPolyfill();
  
  // Initialize the modern navigation system
  const navigation = new ModernNavigation();
  
  // Make navigation instance globally available for debugging
  window.ModernNav = navigation;
  
  // Add loading complete class for any CSS animations
  document.body.classList.add('loaded');
});

/**
 * Handle page visibility changes to optimize performance
 */
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden, could pause heavy animations here
    console.log('Page hidden - optimizing performance');
  } else {
    // Page is visible again
    console.log('Page visible - resuming full functionality');
  }
});

/**
 * Performance monitoring (development helper)
 */
if (window.performance && window.performance.mark) {
  window.performance.mark('navigation-start');
  
  window.addEventListener('load', function() {
    window.performance.mark('navigation-end');
    window.performance.measure('navigation-init', 'navigation-start', 'navigation-end');
    
    const measure = window.performance.getEntriesByName('navigation-init')[0];
    console.log(`Navigation initialized in ${measure.duration.toFixed(2)}ms`);
  });
}