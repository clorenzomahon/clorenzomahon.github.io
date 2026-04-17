/**
 * CLM Portfolio — main.js
 * Handles: mobile nav, header scroll state, scroll animations,
 *          smooth scroll with focus management, active nav highlighting,
 *          footer year.
 */

(function () {
	"use strict";

	/* -------------------------------------------------------------------------
     Utility: trap keyboard focus within an element (e.g. mobile menu)
     ------------------------------------------------------------------------- */
	function trapFocus(element) {
		const focusable = Array.from(
			element.querySelectorAll(
				'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
			),
		).filter((el) => !el.closest("[hidden]"));

		if (!focusable.length) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		element.addEventListener("keydown", function handleTrap(e) {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}

			// Remove trap once menu closes
			if (!element.classList.contains("is-open")) {
				element.removeEventListener("keydown", handleTrap);
			}
		});
	}

	/* -------------------------------------------------------------------------
     Mobile Nav Toggle
     ------------------------------------------------------------------------- */
	function initMobileNav() {
		const toggle = document.querySelector(".nav__toggle");
		const menu = document.getElementById("nav-menu");

		if (!toggle || !menu) return;

		function openMenu() {
			menu.classList.add("is-open");
			toggle.classList.add("is-open");
			toggle.setAttribute("aria-expanded", "true");
			toggle.setAttribute("aria-label", "Close navigation menu");
			document.body.style.overflow = "hidden";
			trapFocus(menu);

			// Close on Escape
			document.addEventListener("keydown", handleEscape);
			// Close on outside click
			document.addEventListener("click", handleOutsideClick);
		}

		function closeMenu() {
			menu.classList.remove("is-open");
			toggle.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
			toggle.setAttribute("aria-label", "Open navigation menu");
			document.body.style.overflow = "";
			toggle.focus();

			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("click", handleOutsideClick);
		}

		function handleEscape(e) {
			if (e.key === "Escape") closeMenu();
		}

		function handleOutsideClick(e) {
			if (!menu.contains(e.target) && !toggle.contains(e.target)) {
				closeMenu();
			}
		}

		toggle.addEventListener("click", function () {
			if (menu.classList.contains("is-open")) {
				closeMenu();
			} else {
				openMenu();
			}
		});

		// Close nav when a link is clicked
		menu.querySelectorAll(".nav__link").forEach(function (link) {
			link.addEventListener("click", closeMenu);
		});
	}

	/* -------------------------------------------------------------------------
     Header Scroll State (uses IntersectionObserver — no scroll listener)
     ------------------------------------------------------------------------- */
	function initHeaderScroll() {
		const header = document.querySelector(".site-header");
		const sentinel = document.createElement("div");

		if (!header) return;

		sentinel.setAttribute("aria-hidden", "true");
		sentinel.style.cssText =
			"position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
		document.body.prepend(sentinel);

		const observer = new IntersectionObserver(
			function (entries) {
				header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
			},
			{ threshold: 0 },
		);

		observer.observe(sentinel);
	}

	/* -------------------------------------------------------------------------
     Scroll-Triggered Entrance Animations
     ------------------------------------------------------------------------- */
	function initScrollAnimations() {
		const elements = document.querySelectorAll(".animate-on-scroll");

		if (!elements.length) return;

		// If reduced motion is preferred, make everything visible immediately
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			elements.forEach(function (el) {
				el.classList.add("is-visible");
			});
			return;
		}

		const observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.12,
				rootMargin: "0px 0px -48px 0px",
			},
		);

		elements.forEach(function (el) {
			observer.observe(el);
		});
	}

	/* -------------------------------------------------------------------------
     Smooth Scroll with Focus Management
     ------------------------------------------------------------------------- */
	function initSmoothScroll() {
		document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
			anchor.addEventListener("click", function (e) {
				const targetId = anchor.getAttribute("href");
				if (targetId === "#") return;

				const target = document.querySelector(targetId);
				if (!target) return;

				e.preventDefault();

				const headerHeight =
					parseInt(
						getComputedStyle(document.documentElement).getPropertyValue(
							"--header-height",
						),
						10,
					) || 64;

				const top =
					target.getBoundingClientRect().top + window.scrollY - headerHeight;

				window.scrollTo({ top, behavior: "smooth" });

				// Move keyboard focus to the target section
				if (!target.hasAttribute("tabindex")) {
					target.setAttribute("tabindex", "-1");
				}

				// Wait for scroll to settle before focusing
				setTimeout(function () {
					target.focus({ preventScroll: true });
				}, 400);
			});
		});
	}

	/* -------------------------------------------------------------------------
     Active Nav Link Highlighting
     ------------------------------------------------------------------------- */
	function initActiveNav() {
		const sections = document.querySelectorAll("section[id]");
		const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

		if (!sections.length || !navLinks.length) return;

		const observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						const activeId = entry.target.id;

						navLinks.forEach(function (link) {
							const linkTarget = link.getAttribute("href").slice(1);
							link.classList.toggle("is-active", linkTarget === activeId);
						});
					}
				});
			},
			{
				threshold: 0,
				rootMargin: "-40% 0px -55% 0px",
			},
		);

		sections.forEach(function (section) {
			observer.observe(section);
		});
	}

	/* -------------------------------------------------------------------------
     Footer Year
     ------------------------------------------------------------------------- */
	function initFooterYear() {
		const el = document.getElementById("footer-year");
		if (el) {
			el.textContent = new Date().getFullYear();
		}
	}

	/* -------------------------------------------------------------------------
     Experience Timeline Accordion
     ------------------------------------------------------------------------- */
	function initTimeline() {
		const triggers = document.querySelectorAll(".timeline__trigger");
		if (!triggers.length) return;

		triggers.forEach(function (trigger) {
			trigger.addEventListener("click", function () {
				const item = trigger.closest(".timeline__item");
				const panelId = trigger.getAttribute("aria-controls");
				const panel = document.getElementById(panelId);
				const isOpen = trigger.getAttribute("aria-expanded") === "true";

				// Close all other open items
				triggers.forEach(function (other) {
					if (other === trigger) return;
					const otherItem = other.closest(".timeline__item");
					const otherPanel = document.getElementById(
						other.getAttribute("aria-controls"),
					);
					other.setAttribute("aria-expanded", "false");
					otherItem.classList.remove("is-open");
					if (otherPanel) otherPanel.classList.remove("is-open");
				});

				// Toggle this item
				const opening = !isOpen;
				trigger.setAttribute("aria-expanded", String(opening));
				item.classList.toggle("is-open", opening);
				if (panel) panel.classList.toggle("is-open", opening);
			});
		});
	}

	/* -------------------------------------------------------------------------
     Light / Dark Mode Toggle
     ------------------------------------------------------------------------- */
	function initThemeToggle() {
		const btn = document.getElementById("theme-toggle");
		if (!btn) return;

		function getSystemTheme() {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}

		function getActiveTheme() {
			return localStorage.getItem("theme") || getSystemTheme();
		}

		function applyTheme(theme) {
			document.documentElement.setAttribute("data-theme", theme);
			btn.setAttribute(
				"aria-label",
				theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
			);
		}

		// Sync button state with current theme (already set by FOUC script)
		applyTheme(getActiveTheme());

		btn.addEventListener("click", function () {
			const next = getActiveTheme() === "dark" ? "light" : "dark";
			localStorage.setItem("theme", next);
			applyTheme(next);
		});

		// Respond to OS-level preference changes (only when no stored preference)
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", function (e) {
				if (!localStorage.getItem("theme")) {
					applyTheme(e.matches ? "dark" : "light");
				}
			});
	}

	/* -------------------------------------------------------------------------
     Space Snake Easter Egg
     ------------------------------------------------------------------------- */
	function initSnakeEasterEgg() {
		var trigger  = document.getElementById("snake-trigger");
		var modal    = document.getElementById("snake-modal");
		var closeBtn = document.getElementById("snake-modal-close");
		var backdrop = modal ? modal.querySelector(".snake-modal__backdrop") : null;
		var iframe   = document.getElementById("snake-iframe");

		if (!trigger || !modal || !closeBtn || !backdrop || !iframe) return;

		var previousFocus = null;
		var iframeLoaded  = false;

		function openModal() {
			if (!iframeLoaded) {
				iframe.src = "games/space-snake/index.html";
				iframeLoaded = true;
			}
			previousFocus = document.activeElement;
			modal.removeAttribute("hidden");
			document.body.style.overflow = "hidden";
			trapFocus(modal);
			requestAnimationFrame(function () { closeBtn.focus(); });
			document.addEventListener("keydown", handleEscape);
		}

		function closeModal() {
			modal.setAttribute("hidden", "");
			document.body.style.overflow = "";
			document.removeEventListener("keydown", handleEscape);
			if (previousFocus && previousFocus.focus) previousFocus.focus();
		}

		function handleEscape(e) {
			if (e.key === "Escape") { e.stopPropagation(); closeModal(); }
		}

		trigger.addEventListener("click", openModal);
		closeBtn.addEventListener("click", closeModal);
		backdrop.addEventListener("click", closeModal);

		window.addEventListener("message", function (e) {
			if (e.data && e.data.type === "snake-escape") closeModal();
		});
	}

	/* -------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------- */
	initTimeline();
	initMobileNav();
	initHeaderScroll();
	initScrollAnimations();
	initSmoothScroll();
	initActiveNav();
	initFooterYear();
	initThemeToggle();
	initSnakeEasterEgg();
})();
