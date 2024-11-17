// Typing effect for changing text
const dynamicTextElement = document.getElementById("dynamic-text");
const words = [
	"front-end developer",
	"designer",
	"creative",
	"problem solver",
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
		const words = text.split(/\s+/); // Split the text into an array of words

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

		if (href.startsWith("#")) {
			e.preventDefault(); // Prevent default behavior only for same-page links
			document.querySelector(href).scrollIntoView({
				behavior: "smooth",
			});
		}
	});
});

// Scroll animation using Intersection Observer
document.addEventListener("DOMContentLoaded", function () {
	const sections = document.querySelectorAll(".full-page-section");
	const navbar = document.querySelector(".navbar");
	const logo = document.querySelector(".logo");
	const footer = document.querySelector("footer");

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
				// Handle navbar style changes based on the section in view
				if (entry.target.id === "hero") {
					navbar.style.backgroundColor = "#0c0c0c";
					navbar.style.color = "#ffffff";
					logo.style.color = "#ffffff";
					logo.style.fontWeight = "bold";
					document.querySelectorAll(".nav-links a").forEach((link) => {
						link.style.color = "#ffffff";
					});
				} else if (entry.target.id === "about") {
					navbar.style.backgroundColor = "#000000"; // Set to black for about section
					navbar.style.color = "#ffffff";
					logo.style.color = "#ffffff";
					logo.style.fontWeight = "bold";
					document.querySelectorAll(".nav-links a").forEach((link) => {
						link.style.color = "#ffffff";
					});
				} else if (entry.target.id === "experience") {
					navbar.style.backgroundColor = "#0c0c0c";
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

	const sectionObserver = new IntersectionObserver(
		observerCallback,
		observerOptions
	);

	// Observe each section
	sections.forEach((section) => {
		sectionObserver.observe(section);
	});

	// Intersection Observer to handle fade-in for sections
	const aboutSection = document.querySelector(".about-section");
	const experienceSection = document.querySelector(".experience-section");

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
			threshold: 0.1, // Trigger when 10% of the section is in view
		}
	);

	// Observe About and Experience sections
	fadeInObserver.observe(aboutSection);
	fadeInObserver.observe(experienceSection);
});

// Adjust textarea height based on content
const messageBox = document.getElementById("message");
messageBox.addEventListener("input", function () {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
});

// Stop Text from being copied
document.addEventListener("copy", function (e) {
	e.preventDefault();
	alert("Copying is disabled on this text.");
});

// objects dragable = false
document.querySelectorAll("nav a").forEach((item) => {
	item.setAttribute("draggable", "false");
});
function revealOnScroll() {
	const timelineItems = document.querySelectorAll(".timeline-item");
	const windowHeight = window.innerHeight;

	timelineItems.forEach((item) => {
		const positionFromTop = item.getBoundingClientRect().top;

		if (positionFromTop < windowHeight - 100) {
			item.classList.add("visible");
		} else {
			item.classList.remove("visible");
		}
	});
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll(); // Run on page load
