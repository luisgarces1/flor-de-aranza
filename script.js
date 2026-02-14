document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE MENU TOGGLE ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const navLinksItems = navLinks.querySelectorAll('.nav-link');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // --- NAVBAR SCROLL EFFECT ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- PARTICLE SYSTEM ---
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';

        // Random size for particles
        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particlesContainer.appendChild(particle);
    }

    // --- COUNTER ANIMATION ---
    const stats = document.querySelectorAll('.stat-number');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out expo
            const easeValue = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(easeValue * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + '+';
            }
        };

        requestAnimationFrame(update);
    };

    // --- REVEAL ON SCROLL ---
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                } else {
                    entry.target.style.animation = 'fade-in-up 0.8s forwards';
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Elements to reveal
    const revealElements = document.querySelectorAll('.service-card-flip, .about-image, .about-text, .cta-section, #formulario');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        revealObserver.observe(el);
    });

    stats.forEach(stat => revealObserver.observe(stat));

    // --- SMOOTH SCROLL ---
    const smoothLinks = document.querySelectorAll('a[href^="#"]');
    smoothLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar') ? document.getElementById('navbar').offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Fail-safe: ensure target is revealed if it has opacity 0
                if (getComputedStyle(target).opacity === '0') {
                    target.style.animation = 'fade-in-up 0.8s forwards';
                }

                // Focus name field if targeting form
                if (targetId === '#formulario') {
                    const nameInput = document.getElementById('name');
                    if (nameInput) setTimeout(() => nameInput.focus(), 600);
                }
            }
        });
    });

    // --- MOBILE FLIP CARD TAP ---
    const cards = document.querySelectorAll('.service-card-inner');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Check if mobile
            if (window.innerWidth < 768) {
                // If already flipped, unflip, else flip
                if (card.style.transform === 'rotateY(180deg)') {
                    card.style.transform = 'rotateY(0deg)';
                } else {
                    card.style.transform = 'rotateY(180deg)';
                }
            }
        });
    });

    // --- FORM SUBMISSION (WEBHOOK) ---
    const contactForm = document.getElementById('whatsappForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            const submitBtn = whatsappForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const formData = {
                nombre: name,
                email: email,
                telefono: phone,
                mensaje: message,
                fecha: new Date().toLocaleString(),
                sitio: 'Flor de Arantza'
            };

            try {
                // Send to n8n Webhook
                await fetch('https://n8n-production-e7a7c.up.railway.app/webhook/7cf3b994-a850-4c9b-9984-4118c6f58663', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // Success feedback
                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
            } catch (error) {
                console.error('Error al enviar al formulario:', error);
                alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
            }

            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
    }
});
