const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
const yearTarget = document.querySelector("[data-year]");
const progressBar = document.querySelector(".scroll-progress-bar");
const themeToggle = document.querySelector("[data-theme-toggle]");
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsPointerAura = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const themeColor = document.querySelector('meta[name="theme-color"]');

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const syncThemeControl = () => {
  const isDark = root.dataset.theme === "dark";
  themeToggle?.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeColor?.setAttribute("content", isDark ? "#09111f" : "#f7fbff");
};

syncThemeControl();

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("portfolio-theme", nextTheme);
  syncThemeControl();
});

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
window.addEventListener(
  "scroll",
  () => {
    syncHeaderState();
    syncScrollProgress();
  },
  { passive: true }
);

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

if (!prefersReducedMotion) {
  revealNodes.forEach((node, index) => {
    node.style.setProperty("transition-delay", `${Math.min(index * 45, 240)}ms`);
  });
}

if (!prefersReducedMotion && supportsPointerAura) {
  let auraFrame = 0;
  let nextX = "22%";
  let nextY = "12%";

  window.addEventListener(
    "pointermove",
    (event) => {
      nextX = `${(event.clientX / window.innerWidth) * 100}%`;
      nextY = `${(event.clientY / window.innerHeight) * 100}%`;

      if (auraFrame) {
        return;
      }

      auraFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", nextX);
        root.style.setProperty("--pointer-y", nextY);
        auraFrame = 0;
      });
    },
    { passive: true }
  );
}

const revealInViewNodes = () => {
  revealNodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      node.classList.add("is-visible");
    }
  });
};

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

  window.requestAnimationFrame(revealInViewNodes);
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
