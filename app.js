// Portfolio Website JavaScript - Fixed Navigation

// Global function for smooth scrolling to sections
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');
            navToggle.setAttribute('aria-label', navMenu.classList.contains('active') ? 'Close navigation menu' : 'Open navigation menu');
            
            // Animate hamburger menu
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Open navigation menu'); }
            
            // Reset hamburger menu
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // Fixed smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1); // Remove the #
            scrollToSection(targetId);
        });
    });

    // Active navigation link highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 120; // Offset for header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`a[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current nav link
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }

    // Header scroll effect
    function handleHeaderScroll() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.style.background = 'rgba(9, 10, 11, 0.97)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(9, 10, 11, 0.90)';
            header.style.boxShadow = 'none';
        }
    }

    // Scroll animations for elements
    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.highlight-card, .film-card, .ad-card, .serial-item, .timeline__item, .detail-card');
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Initialize scroll animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.highlight-card, .film-card, .ad-card, .serial-item, .timeline__item, .detail-card');
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    }

    // Timeline animation
    function animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline__item');
        
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        });
    }

    // Hero section typing effect
    function typewriterEffect() {
        const tagline = document.querySelector('.hero__tagline');
        if (!tagline) return;
        
        const text = tagline.textContent;
        tagline.textContent = '';
        tagline.style.borderRight = '2px solid #32b8c6';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                tagline.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    tagline.style.borderRight = 'none';
                }, 1000);
            }
        }, 100);
    }

    // Card hover effects
    function initCardEffects() {
        const cards = document.querySelectorAll('.highlight-card, .film-card, .ad-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = 'none';
            });
        });
    }

    // Social link effects
    function initSocialEffects() {
        const socialLinks = document.querySelectorAll('.social-link');
        
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0) scale(1)';
            });
        });
    }

    // Loading animation
    function showLoadingComplete() {
        if (prefersReducedMotion) return;
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navToggle && navMenu) {
            const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open navigation menu');
                
                // Reset hamburger menu
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });

    // Add CSS for active nav link
    const style = document.createElement('style');
    style.textContent = `
        .nav__link.active {
            color: var(--cinema-gold-light, #e4b08d) !important;
            position: relative;
        }
        
        .nav__link.active::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--cinema-gold, #c46b4f);
            border-radius: 1px;
        }
        
        @media (max-width: 768px) {
            .nav__link.active::after {
                bottom: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Accessible filmography category filters.
    const filmFilters = document.querySelectorAll('[data-film-filter]');
    const filmCategories = document.querySelectorAll('[data-film-category]');
    const filmographyStatus = document.getElementById('filmography-status');
    filmFilters.forEach(button => {
        button.addEventListener('click', function() {
            const selected = this.dataset.filmFilter;
            let visibleCount = 0;
            filmFilters.forEach(filter => {
                const isActive = filter === this;
                filter.classList.toggle('is-active', isActive);
                filter.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
            filmCategories.forEach(category => {
                const visible = selected === 'all' || category.dataset.filmCategory === selected;
                category.hidden = !visible;
                if (visible) visibleCount++;
            });
            if (filmographyStatus) {
                filmographyStatus.textContent = selected === 'all'
                    ? 'Showing all ' + visibleCount + ' categories'
                    : 'Showing ' + visibleCount + ' ' + (visibleCount === 1 ? 'category' : 'categories');
            }
            // Reveal newly shown cards that are already inside the viewport.
            handleScrollAnimations();
        });
    });

    // Keep the copyright year current without manual edits.
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

    // Initialize everything
    function init() {
        showLoadingComplete();
        if (!prefersReducedMotion) {
            initScrollAnimations();
            animateTimeline();
            initCardEffects();
            initSocialEffects();
            // Start typewriter effect after a delay
            setTimeout(typewriterEffect, 1000);
        }
        
        // Initial scroll position check
        updateActiveNavLink();
        handleHeaderScroll();
        
        // Trigger initial scroll animations
        setTimeout(handleScrollAnimations, 500);
    }

    // Performance optimized scroll handler
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveNavLink();
                handleHeaderScroll();
                handleScrollAnimations();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Scroll event listener
    window.addEventListener('scroll', requestTick);

    // Add resize handler for responsive behavior
    window.addEventListener('resize', function() {
        // Close mobile menu on resize
        if (window.innerWidth > 768 && navMenu) {
            navMenu.classList.remove('active');
            if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Open navigation menu'); }
            
            // Reset hamburger menu
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        }
    });

    // Initialize the application
    init();

    // Test navigation links after DOM is ready
    setTimeout(() => {
        console.log('Navigation links initialized');
        navLinks.forEach(link => {
            console.log('Nav link href:', link.getAttribute('href'));
        });
    }, 1000);
});