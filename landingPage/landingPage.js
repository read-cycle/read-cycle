AOS.init();

document.addEventListener("DOMContentLoaded", function () {
  const downBtn = document.querySelector(".downBtn");
  const aboutSection = document.querySelector("#about");
  let themerActive = false;

  downBtn.addEventListener("click", function () {
    const aboutSectionTop = aboutSection.offsetTop;
    window.scrollTo({
      top: aboutSectionTop,
      behavior: "smooth"
    });

    setTimeout(function () {
      downBtn.classList.add("fade-out");
    }, 500);
  });

  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const aboutSectionTop = aboutSection.offsetTop;

    if (scrollPosition >= aboutSectionTop) {
      downBtn.classList.add("fade-out");
    }
  });

  document.querySelector(".themeSwitcher").addEventListener("click", () => {
    document.querySelector(".themesDiv").style.display = themerActive ? "none" : "flex";
    themerActive = !themerActive;
  });

  // Theme switching functionality
  document.querySelector(".bright").addEventListener("click", () => {
    applyTheme("bright");
  });

  document.querySelector(".dark").addEventListener("click", () => {
    applyTheme("dark");
  });

  document.querySelector(".forest").addEventListener("click", () => {
    applyTheme("forest");
  });

  // Load the saved theme from sessionStorage on page load
  window.addEventListener("load", () => {
    const savedTheme = sessionStorage.getItem("selectedTheme");
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  });

  function applyTheme(theme) {
    // Save the selected theme to sessionStorage
    sessionStorage.setItem("selectedTheme", theme);

    // Remove the existing theme CSS files
    const linkElements = document.querySelectorAll('.theme-stylesheet');
    linkElements.forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.includes(".css") && !href.includes(theme + ".css")) {
        link.parentNode.removeChild(link);
      }
    });

    // Add the new theme CSS file
    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = `${theme}.css`;
    newLink.classList.add("theme-stylesheet");
    document.head.appendChild(newLink);
    AOS.init();
  }
});

let width = document.querySelector(".imageDiv").clientWidth;
document.querySelectorAll(".Ltxt").forEach(Ltxt => {
  Ltxt.style.left = `${width / 2}px`;
  Ltxt.style.width = `calc(100% - ${width / 2}px)`;
});
document.querySelectorAll(".Rtxt").forEach(Rtxt => {
  Rtxt.style.width = `calc(100% - ${width / 2}px)`;
});

window.addEventListener("resize", () => {
  width = document.querySelector(".imageDiv").clientWidth;
  document.querySelectorAll(".Ltxt").forEach(Ltxt => {
    Ltxt.style.left = `${width / 2}px`;
    Ltxt.style.width = `calc(100% - ${width / 2}px)`;
  });
  document.querySelectorAll(".Rtxt").forEach(Rtxt => {
    Rtxt.style.width = `calc(100% - ${width / 2}px)`;
  });
});
