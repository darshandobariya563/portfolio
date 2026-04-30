const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
const yearTarget = document.querySelector("[data-year]");
const progressBar = document.querySelector(".scroll-progress-bar");
const root = document.documentElement;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const syncHeaderState = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 16);
};

const syncScrollProgress = () => {
  if (!progressBar) {
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));
};

syncHeaderState();
syncScrollProgress();
window.addEventListener("scroll", syncHeaderState, { passive: true });
window.addEventListener("scroll", syncScrollProgress, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

revealNodes.forEach((node, index) => {
  node.style.setProperty("transition-delay", `${Math.min(index * 45, 240)}ms`);
});

window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  root.style.setProperty("--pointer-x", `${x}%`);
  root.style.setProperty("--pointer-y", `${y}%`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));

  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const activeId = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const targetId = link.getAttribute("href")?.slice(1);
          if (targetId === activeId) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      threshold: 0.4,
      rootMargin: "-18% 0px -44% 0px"
    }
  );

  sections.forEach((section) => activeSectionObserver.observe(section));

  window.setTimeout(() => {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }, 900);
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
