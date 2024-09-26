// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

const themeToggleButton = document.getElementById("theme-toggle-button");

function handleClickToggleButton() {
  console.log('Botão de alternância de tema clicado!');
  toggleTheme(); // Certifique-se de chamar a função de alternância de tema aqui
}

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', handleClickToggleButton);
}