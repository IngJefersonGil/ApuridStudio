document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations using highly optimized IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed for max performance
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Navbar scroll effect optimized with requestAnimationFrame
    const navbar = document.querySelector('.navbar');
    let isTicking = false;

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // Smooth scroll for anchors with custom easing (easeOutQuart)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId.length > 1) {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();

                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - 80;

                    const startPosition = window.pageYOffset;
                    const distance = offsetPosition - startPosition;
                    const duration = 1200;
                    let start = null;

                    const easeOutQuint = (time) => 1 - Math.pow(1 - time, 5);

                    function animation(currentTime) {
                        if (start === null) start = currentTime;
                        const timeElapsed = currentTime - start;
                        let progress = Math.min(timeElapsed / duration, 1);
                        let ease = easeOutQuint(progress);

                        window.scrollTo(0, startPosition + distance * ease);

                        if (timeElapsed < duration) {
                            window.requestAnimationFrame(animation);
                        }
                    }

                    window.requestAnimationFrame(animation);

                    // Note: URL hash update optional
                    // history.pushState(null, null, targetId);
                }
            }
        });
    });

    // Active Nav State based on scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.style.fontWeight = '400';
            if (item.getAttribute('href') === `#${current}`) {
                item.style.fontWeight = '600';
                item.style.color = 'var(--text-primary)';
            } else if (!item.classList.contains('btn-primary')) {
                item.style.color = 'var(--text-secondary)';
            }
        });
    });

    // Automatic Theme Detection (System Preference)
    const rootEl = document.documentElement;
    const mainLogo = document.getElementById('main-logo');
    const footerLogo = document.getElementById('footer-logo');

    const updateLogos = (theme) => {
        const logoSrc = theme === 'light' ? '/ApuridLogo.svg' : '/ApuridLogoModoOscuro.svg';
        if (mainLogo) mainLogo.src = logoSrc;
        if (footerLogo) footerLogo.src = logoSrc;
    };

    const setTheme = (isDark) => {
        if (isDark) {
            rootEl.removeAttribute('data-theme');
            updateLogos('dark');
        } else {
            rootEl.setAttribute('data-theme', 'light');
            updateLogos('light');
        }
    };

    // Initialize based on system preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(darkModeMediaQuery.matches);

    // Listen for system theme changes
    darkModeMediaQuery.addEventListener('change', (e) => {
        setTheme(e.matches);
    });

    // Mobile Menu Toggle Logic
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');

            // Lock body scroll when menu is open
            if (mobileOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Contact Form submission logic
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = contactForm?.querySelector('.form-submit');

    if (contactForm && formStatus && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Set loading state
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';

            const formData = new FormData(contactForm);
            const data = {
                nombre: formData.get('name'),
                email: formData.get('email'),
                asunto: formData.get('subject'),
                mensaje: formData.get('message')
            };

            try {
                const response = await fetch('https://apurid-contact-api.apuridstudio.workers.dev', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    formStatus.innerText = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
                    formStatus.classList.add('success');
                    formStatus.style.display = 'flex';
                    contactForm.reset();
                } else {
                    throw new Error('Server responded with an error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                formStatus.innerText = 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
                formStatus.classList.add('error');
                formStatus.style.display = 'flex';
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});

