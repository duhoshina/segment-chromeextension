// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);

  // Atualiza o ícone do botão conforme o tema
  const themeIcon = document.getElementById("theme-icon");
  if (newTheme === "dark") {
    themeIcon.classList.replace("fa-sun", "fa-moon");
    updateLogo("https://cdn.g4educacao.com/g4_logo_white_f68a6b6559.png"); // Logo para tema claro
  } else {
    themeIcon.classList.replace("fa-moon", "fa-sun");
    updateLogo("https://www.abcdacomunicacao.com.br/wp-content/uploads/Logo_G4EDU.jpg"); // Logo para tema escuro
  }

  // Armazena o tema atual no localStorage
  localStorage.setItem("theme", newTheme);
}

// Função para aplicar o tema inicial
function applyInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeIcon = document.getElementById("theme-icon");
    themeIcon.classList.toggle("fa-sun", savedTheme === "light");
    themeIcon.classList.toggle("fa-moon", savedTheme === "dark");

    // Atualiza a logo com base no tema salvo
    if (savedTheme === "dark") {
      updateLogo("https://cdn.g4educacao.com/g4_logo_dark.png");
    } else {
      updateLogo("https://cdn.g4educacao.com/g4_logo_white_f68a6b6559.png");
    }
  }
}

// Função para atualizar a logo
function updateLogo(src) {
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = src;
  }
}

// Evento de clique no botão de alternância
const themeToggleButton = document.getElementById("theme-toggle-button");

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', toggleTheme);
}

// Aplica o tema inicial ao carregar a página
applyInitialTheme();
