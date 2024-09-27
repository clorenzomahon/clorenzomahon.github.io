// Typing effect for changing text
const dynamicTextElement = document.getElementById("dynamic-text");
const words = [
	"front-end developer",
	"problem solver",
	"debugger",
	"gamer",
	"creative",
	"learner",
	"woman",
	"dog mum",
	"wife",
];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;
let deletingSpeed = 100;
let delayBetweenWords = 3000; // Delay before starting to delete the word

function type() {
	const currentWord = words[wordIndex];

	if (!isDeleting) {
		dynamicTextElement.textContent = currentWord.substring(0, charIndex + 1);
		charIndex++;

		if (charIndex === currentWord.length) {
			setTimeout(() => (isDeleting = true), delayBetweenWords);
			setTimeout(type, delayBetweenWords);
		} else {
			setTimeout(type, typingSpeed);
		}
	} else {
		dynamicTextElement.textContent = currentWord.substring(0, charIndex - 1);
		charIndex--;

		if (charIndex === 0) {
			isDeleting = false;
			wordIndex = (wordIndex + 1) % words.length;
			setTimeout(type, typingSpeed);
		} else {
			setTimeout(type, deletingSpeed);
		}
	}
}

// Function to limit blog description to 25 words
function truncateText(selector, wordLimit) {
	const elements = document.querySelectorAll(selector); // Select all elements matching the selector
	elements.forEach((element) => {
		const text = element.innerText.trim(); // Get the text content of the element and trim whitespace
		const words = text.split(/\s+/); // Split the text into an array of words (account for multiple spaces)

		if (words.length > wordLimit) {
			const truncated = words.slice(0, wordLimit).join(" ") + "..."; // Truncate the text and add "..."
			element.innerText = truncated; // Update the text content with the truncated version
		}
	});
}

// Apply the function to elements with the class "blog-description" after the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
	truncateText(".blog-description", 25); // 25 is the word limit
});

// Start typing effect with cursor flashing
setTimeout(type, typingSpeed);

// Smooth scroll behavior for internal nav links (same page links)
document.querySelectorAll(".nav-links a").forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		const href = this.getAttribute("href");

		// Check if it's a hash link (i.e., within the same page)
		if (href.startsWith("#")) {
			e.preventDefault(); // Prevent default behavior only for same-page links
			document.querySelector(href).scrollIntoView({
				behavior: "smooth",
			});
		}
		// If it's an external link (e.g., "about.html"), we let the default behavior occur
	});
});

// Scroll animation using Intersection Observer
document.addEventListener("DOMContentLoaded", function () {
	const footer = document.querySelector("footer");
	const navbar = document.querySelector(".navbar");
	const logo = document.querySelector(".logo");
	const sections = document.querySelectorAll(".full-page-section");

	// Create an observer for the footer
	const footerObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				footer.classList.add("footer-animate");
			} else {
				footer.classList.remove("footer-animate");
			}
		});
	});
	footerObserver.observe(footer);

	// Intersection Observer callback function for sections
	const observerCallback = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				if (entry.target.id === "hero") {
					navbar.style.backgroundColor = "#0c0c0c";
					navbar.style.color = "#ffffff";
					logo.style.color = "#ffffff";
					logo.style.fontWeight = "bold";
					document.querySelectorAll(".nav-links a").forEach((link) => {
						link.style.color = "#ffffff";
					});
				} else if (entry.target.id === "about") {
					navbar.style.backgroundColor = "#1a1a1a";
					navbar.style.boxShadow = "none";
					navbar.style.color = "#ffffff";
					logo.style.color = "#ffffff";
					logo.style.fontWeight = "bold";
					document.querySelectorAll(".nav-links a").forEach((link) => {
						link.style.color = "#ffffff";
					});
				} else if (entry.target.id === "contact") {
					navbar.style.backgroundColor = "#d4ff00";
					navbar.style.color = "#000000";
					logo.style.color = "#000000";
					logo.style.fontWeight = "900";
					document.querySelectorAll(".nav-links a").forEach((link) => {
						link.style.color = "#000000";
					});
				}
			}
		});
	};

	// Intersection Observer options
	const observerOptions = {
		threshold: 0.6, // 60% of the section should be visible for the color change
	};

	// Create an observer instance for sections
	const sectionObserver = new IntersectionObserver(
		observerCallback,
		observerOptions
	);

	// Observe each section
	sections.forEach((section) => {
		sectionObserver.observe(section);
	});

	// Create an observer for the about section
	const aboutObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const aboutSection = entry.target;
				if (entry.isIntersecting) {
					aboutSection.classList.add("fade-in");
					aboutSection.classList.remove("fade-out");
				} else {
					aboutSection.classList.remove("fade-in");
					aboutSection.classList.add("fade-out");
				}
			});
		},
		{
			threshold: 0.1, // Trigger when 10% of the section is in view
		}
	);

	// Target the "About" section for observing
	const aboutSection = document.querySelector(".about-section");
	aboutObserver.observe(aboutSection);
});

// Adjust textarea height based on content
const messageBox = document.getElementById("message");
messageBox.addEventListener("input", function () {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
});

// Handle scroll events for fade-in and navbar color change
window.addEventListener("scroll", function () {
	const contactSection = document.querySelector(".contact");
	const aboutSection = document.querySelector("#about");
	const experienceSection = document.querySelector("#experience");
	const navbar = document.querySelector(".navbar");

	const sectionPosition = contactSection.getBoundingClientRect().top;
	const aboutPosition = aboutSection.getBoundingClientRect().top;
	const experiencePosition = experienceSection.getBoundingClientRect().top;
	const screenPosition = window.innerHeight / 1.3;

	// Handle contact section visibility
	if (sectionPosition < screenPosition) {
		contactSection.classList.add("contact-section-visible");
	} else {
		contactSection.classList.remove("contact-section-visible");
	}

	// Handle about section fade-in
	if (aboutPosition < screenPosition) {
		aboutSection.classList.add("fade-in");
		aboutSection.classList.remove("fade-out");
	} else {
		aboutSection.classList.add("fade-out");
		aboutSection.classList.remove("fade-in");
	}

	// Handle experience section fade-in
	if (experiencePosition < screenPosition) {
		experienceSection.classList.add("fade-in");
		experienceSection.classList.remove("fade-out");
	} else {
		experienceSection.classList.add("fade-out");
		experienceSection.classList.remove("fade-in");
	}

	// Handle navbar color change based on section in view
	if (aboutPosition < screenPosition && experiencePosition > screenPosition) {
		navbar.style.backgroundColor = "#1a1a1a";
		navbar.style.color = "#ffffff";
		document.querySelectorAll(".navbar a").forEach((link) => {
			link.style.color = "#ffffff";
		});
		document.querySelector(".navbar .logo").style.color = "#ffffff";
	} else if (
		experiencePosition < screenPosition &&
		contactSection.getBoundingClientRect().top > screenPosition
	) {
		navbar.style.backgroundColor = "#0c0c0c";
		navbar.style.color = "#ffffff";
		document.querySelectorAll(".navbar a").forEach((link) => {
			link.style.color = "#ffffff";
		});
		document.querySelector(".navbar .logo").style.color = "#ffffff";
	} else if (contactSection.getBoundingClientRect().top < screenPosition) {
		navbar.style.backgroundColor = "#d4ff00";
		navbar.style.color = "#101010";
		document.querySelectorAll(".navbar a").forEach((link) => {
			link.style.color = "#101010";
		});
		document.querySelector(".navbar .logo").style.color = "#101010";
	} else {
		navbar.style.backgroundColor = "#0c0c0c";
		navbar.style.color = "#ffffff";
		document.querySelectorAll(".navbar a").forEach((link) => {
			link.style.color = "#ffffff";
		});
		document.querySelector(".navbar .logo").style.color = "#ffffff";
	}
});

// Intersection Observer to handle fade-in for sections
document.addEventListener("DOMContentLoaded", function () {
	const aboutSection = document.querySelector(".about-section");
	const experienceSection = document.querySelector(".experience-section");

	// Observer for fade-in and fade-out
	const fadeInObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const section = entry.target;
				if (entry.isIntersecting) {
					section.classList.add("fade-in");
					section.classList.remove("fade-out");
				} else {
					section.classList.add("fade-out");
					section.classList.remove("fade-in");
				}
			});
		},
		{
			threshold: 0.1,
		}
	);

	// Observe About and Experience sections
	fadeInObserver.observe(aboutSection);
	fadeInObserver.observe(experienceSection);
});
