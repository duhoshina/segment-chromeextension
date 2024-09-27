const themeToggleButton = document.getElementById("theme-toggle-button");

function updateLogo(src) {
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = src;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);

  const themeIcon = document.getElementById("theme-icon");
  if (newTheme === "dark") {
    themeIcon.classList.replace("fa-sun", "fa-moon");
    updateLogo("https://cdn.g4educacao.com/g4_logo_white_f68a6b6559.png");
  } else {
    themeIcon.classList.replace("fa-moon", "fa-sun");
    updateLogo(
      "https://www.abcdacomunicacao.com.br/wp-content/uploads/Logo_G4EDU.jpg"
    );
  }

  localStorage.setItem("theme", newTheme);
}

function applyInitialTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeIcon = document.getElementById("theme-icon");
    themeIcon.classList.toggle("fa-sun", savedTheme === "light");
    themeIcon.classList.toggle("fa-moon", savedTheme === "dark");

    if (savedTheme === "dark") {
      updateLogo("https://cdn.g4educacao.com/g4_logo_dark.png");
    } else {
      updateLogo("https://cdn.g4educacao.com/g4_logo_white_f68a6b6559.png");
    }
  }
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}

applyInitialTheme();