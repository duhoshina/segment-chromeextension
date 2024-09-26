
/*---------------------------------------------------------------------*/

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Função para adicionar o botão e a lógica de clique
function initializeThemeToggle() {
  const buttonHTML = '<div id="theme-toggle-button" class="rounded-button"><i class="fas fa-times"></i></div>';
  document.body.insertAdjacentHTML('beforeend', buttonHTML);

  const themeToggleButton = document.getElementById('theme-toggle-button');
  
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      console.log('Button Clicked!');
      toggleTheme();
    });
  } else {
    console.log('Theme Toggle Button not found.');
  }
}

// Adicionar o botão e lógica quando o conteúdo estiver pronto
initializeThemeToggle();