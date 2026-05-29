// script.js
(() => {
    "use strict";

    const SELECTORS = {
        themeToggle: ".theme-toggle",
        navToggle: ".nav-toggle",
        navMenu: ".nav-menu",
        navLinks: ".nav-link",
        particles: ".particles",
        customCursor: ".custom-cursor",
        cards: ".card-glass, .card-glass-demis",
        revealItems: ".card-glass, .card-glass-demis, .timeline-item",
        quoteCards: ".quote-card",
        actionButtons: ".action-btn",
        year: "#year",
        hero: ".hero"
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const mobileQuery = window.matchMedia("(max-width: 860px)");

    const storage = {
        get(key) {
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                // LocalStorage pode estar indisponível em alguns navegadores/modos privados.
            }
        }
    };

    const isMobileDevice = () => {
        return mobileQuery.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    };

    const setTheme = (theme, persist = true) => {
        const normalizedTheme = theme === "dark" ? "dark" : "light";
        const root = document.documentElement;
        const themeToggle = document.querySelector(SELECTORS.themeToggle);

        root.setAttribute("data-theme", normalizedTheme);

        if (themeToggle) {
            const isDark = normalizedTheme === "dark";
            themeToggle.textContent = isDark ? "☀️" : "🌙";
            themeToggle.setAttribute("aria-pressed", String(isDark));
            themeToggle.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
        }

        if (persist) {
            storage.set("theme", normalizedTheme);
        }
    };

    const initTheme = () => {
        const themeToggle = document.querySelector(SELECTORS.themeToggle);
        const savedTheme = storage.get("theme");
        const initialTheme = savedTheme || (prefersDarkTheme.matches ? "dark" : "light");

        setTheme(initialTheme, Boolean(savedTheme));

        themeToggle?.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            setTheme(currentTheme === "dark" ? "light" : "dark");
        });

        prefersDarkTheme.addEventListener?.("change", (event) => {
            if (!storage.get("theme")) {
                setTheme(event.matches ? "dark" : "light", false);
            }
        });
    };

    const initNavMenu = () => {
        const navToggle = document.querySelector(SELECTORS.navToggle);
        const navMenu = document.querySelector(SELECTORS.navMenu);
        const navLinks = [...document.querySelectorAll(SELECTORS.navLinks)];

        if (!navToggle || !navMenu) return;

        const closeMenu = () => {
            navMenu.classList.remove("active");
            navToggle.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Abrir menu");
            document.body.classList.remove("menu-open");
        };

        const openMenu = () => {
            navMenu.classList.add("active");
            navToggle.classList.add("is-open");
            navToggle.setAttribute("aria-expanded", "true");
            navToggle.setAttribute("aria-label", "Fechar menu");
            document.body.classList.add("menu-open");
        };

        const toggleMenu = () => {
            const isOpen = navMenu.classList.contains("active");
            isOpen ? closeMenu() : openMenu();
        };

        navToggle.addEventListener("click", toggleMenu);

        navLinks.forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Node)) return;

            const clickedOutside = !navMenu.contains(target) && !navToggle.contains(target);
            if (clickedOutside) {
                closeMenu();
            }
        });

        mobileQuery.addEventListener?.("change", (event) => {
            if (!event.matches) {
                closeMenu();
            }
        });
    };

    const initSmoothScroll = () => {
        const links = [...document.querySelectorAll('a[href^="#"]')];

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const href = link.getAttribute("href");

                if (!href || href === "#") return;

                const target = document.querySelector(href);
                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
                    block: "start"
                });

                history.pushState(null, "", href);
            });
        });
    };

    const initActiveNavigation = () => {
        const navLinks = [...document.querySelectorAll(SELECTORS.navLinks)];
        const sectionIds = navLinks
            .map((link) => link.getAttribute("href"))
            .filter((href) => href && href.startsWith("#"))
            .map((href) => href.slice(1));

        const sections = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!navLinks.length || !sections.length) return;

        const setActiveLink = (id) => {
            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${id}`;
                link.classList.toggle("active", isActive);
            });
        };

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const visibleEntries = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                    if (visibleEntries[0]?.target?.id) {
                        setActiveLink(visibleEntries[0].target.id);
                    }
                },
                {
                    root: null,
                    threshold: [0.25, 0.45, 0.65],
                    rootMargin: "-20% 0px -55% 0px"
                }
            );

            sections.forEach((section) => observer.observe(section));
        } else {
            const updateActiveOnScroll = () => {
                let currentId = sections[0].id;

                sections.forEach((section) => {
                    if (window.scrollY >= section.offsetTop - 180) {
                        currentId = section.id;
                    }
                });

                setActiveLink(currentId);
            };

            updateActiveOnScroll();
            window.addEventListener("scroll", throttle(updateActiveOnScroll, 120), { passive: true });
        }
    };

    const createParticles = () => {
        const particlesContainer = document.querySelector(SELECTORS.particles);

        if (!particlesContainer || prefersReducedMotion.matches) return;

        particlesContainer.textContent = "";

        const particleCount = isMobileDevice() ? 14 : 42;

        for (let i = 0; i < particleCount; i += 1) {
            const particle = document.createElement("span");
            const size = `${Math.random() * 4 + 2}px`;
            const hue = Math.round(Math.random() * 70 + 260);

            particle.className = "particle";
            particle.style.setProperty("--size", size);
            particle.style.setProperty("--color", `hsl(${hue}, 72%, 62%)`);
            particle.style.setProperty("--opacity", `${Math.random() * 0.45 + 0.18}`);
            particle.style.setProperty("--duration", `${Math.random() * 16 + 18}s`);
            particle.style.setProperty("--delay", `-${Math.random() * 22}s`);
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100 + 10}%`;

            particlesContainer.appendChild(particle);
        }
    };

    const initRevealAnimations = () => {
        const revealItems = [...document.querySelectorAll(SELECTORS.revealItems)];

        if (!revealItems.length || prefersReducedMotion.matches) {
            revealItems.forEach((item) => item.classList.add("visible"));
            return;
        }

        revealItems.forEach((item) => item.classList.add("reveal"));

        if (!("IntersectionObserver" in window)) {
            revealItems.forEach((item) => item.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -80px 0px"
            }
        );

        revealItems.forEach((item) => observer.observe(item));
    };

    const initQuoteRotation = () => {
        const quoteCards = [...document.querySelectorAll(SELECTORS.quoteCards)];

        if (quoteCards.length < 2 || prefersReducedMotion.matches) return;

        let currentQuote = 0;

        const updateQuotes = () => {
            quoteCards.forEach((quote, index) => {
                const isCurrent = index === currentQuote;
                quote.style.opacity = isCurrent ? "1" : "0.55";
                quote.style.transform = isCurrent ? "scale(1)" : "scale(0.985)";
            });

            currentQuote = (currentQuote + 1) % quoteCards.length;
        };

        updateQuotes();
        window.setInterval(updateQuotes, 5000);
    };

    const initCustomCursor = () => {
        const cursor = document.querySelector(SELECTORS.customCursor);

        if (!cursor || isMobileDevice() || prefersReducedMotion.matches) return;

        let cursorPulseTimeout = 0;

        document.addEventListener(
            "mousemove",
            (event) => {
                cursor.style.left = `${event.clientX}px`;
                cursor.style.top = `${event.clientY}px`;
                cursor.classList.add("active");
            },
            { passive: true }
        );

        document.addEventListener("mouseleave", () => {
            cursor.classList.remove("active");
        });

        document.addEventListener("mousedown", () => {
            cursor.classList.add("pulse");
            window.clearTimeout(cursorPulseTimeout);
            cursorPulseTimeout = window.setTimeout(() => cursor.classList.remove("pulse"), 160);
        });
    };

    const initCardLightEffect = () => {
        if (isMobileDevice() || prefersReducedMotion.matches) return;

        const cards = [...document.querySelectorAll(SELECTORS.cards)];
        if (!cards.length) return;

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                card.style.boxShadow = `
                    0 10px 34px rgba(143, 74, 159, 0.18),
                    ${(x - rect.width / 2) * 0.035}px ${(y - rect.height / 2) * 0.035}px 24px rgba(217, 70, 166, 0.18)
                `;
            });

            card.addEventListener("pointerleave", () => {
                card.style.boxShadow = "";
            });
        });
    };

    const initActionButtons = () => {
        const actionButtons = [...document.querySelectorAll(SELECTORS.actionButtons)];

        actionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.action;

                if (action === "share") {
                    showToast("Compartilhe sua história com a comunidade! 🏳️‍🌈");
                    return;
                }

                if (action === "support") {
                    showToast("Obrigado por apoiar a comunidade LGBTQIAPN+! 💜");
                    return;
                }

                showToast("Obrigado por fazer parte dessa celebração!");
            });
        });
    };

    const showToast = (message) => {
        const existingToast = document.querySelector(".toast");
        existingToast?.remove();

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("is-visible");
        });

        window.setTimeout(() => {
            toast.classList.remove("is-visible");

            window.setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3200);
    };

    const initFooterYear = () => {
        const yearElement = document.querySelector(SELECTORS.year);

        if (yearElement) {
            yearElement.textContent = String(new Date().getFullYear());
        }
    };

    const initHeroParallax = () => {
        const hero = document.querySelector(SELECTORS.hero);

        if (!hero || isMobileDevice() || prefersReducedMotion.matches) return;

        const updateParallax = () => {
            const offset = window.scrollY * 0.08;
            hero.style.backgroundPosition = `center ${offset}px`;
        };

        updateParallax();
        window.addEventListener("scroll", throttle(updateParallax, 80), { passive: true });
    };

    function throttle(callback, delay = 100) {
        let lastRun = 0;
        let timeoutId = null;

        return (...args) => {
            const now = Date.now();
            const remaining = delay - (now - lastRun);

            if (remaining <= 0) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
                lastRun = now;
                callback(...args);
                return;
            }

            if (!timeoutId) {
                timeoutId = window.setTimeout(() => {
                    lastRun = Date.now();
                    timeoutId = null;
                    callback(...args);
                }, remaining);
            }
        };
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initNavMenu();
        initSmoothScroll();
        initActiveNavigation();
        createParticles();
        initRevealAnimations();
        initQuoteRotation();
        initCustomCursor();
        initCardLightEffect();
        initActionButtons();
        initFooterYear();
        initHeroParallax();

        console.info("🏳️‍🌈 Site de celebração da diversidade carregado com sucesso.");
    });
})();