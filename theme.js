class ThemeManager {
  constructor(toggleButtonId, logoId, themeIconId) {
    this.themeToggleButton = document.getElementById(toggleButtonId);
    this.logo = document.getElementById(logoId);
    this.themeIcon = document.getElementById(themeIconId);
    this.themes = {
      light: {
        logoSrc: "https://www.abcdacomunicacao.com.br/wp-content/uploads/Logo_G4EDU.jpg",
        iconClass: "fa-sun",
      },
      dark: {
        logoSrc: "https://cdn.g4educacao.com/g4_logo_white_f68a6b6559.png",
        iconClass: "fa-moon",
      },
    };

    this.init();
  }

  updateLogo(theme) {
    if (this.logo) {
      this.logo.src = this.themes[theme]?.logoSrc || this.themes.light.logoSrc; // Fallback to light theme
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
    this.themeIcon.classList.replace(this.themes[currentTheme].iconClass, this.themes[newTheme].iconClass);
    this.updateLogo(newTheme);
    localStorage.setItem("theme", newTheme);
  }

  applyInitialTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"; // Fallback to light theme
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.themeIcon.classList.toggle("fa-sun", savedTheme === "light");
    this.themeIcon.classList.toggle("fa-moon", savedTheme === "dark");
    this.updateLogo(savedTheme);
  }

  init() {
    this.applyInitialTheme();

    if (this.themeToggleButton) {
      this.themeToggleButton.addEventListener("click", () => this.toggleTheme());
    }
  }
}

const themeManager = new ThemeManager("theme-toggle-button", "logo", "theme-icon");