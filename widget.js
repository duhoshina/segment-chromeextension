
/*---------------------------------------------------------------------*/

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Atualiza o ícone para refletir o tema atual
  const icon = document.querySelector('#theme-toggle-button i');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function helloWorld() {
  console.log('Hello World!');
}

// Certifica-se de que o conteúdo é injetado após o DOM estar carregado
document.addEventListener('DOMContentLoaded', injectStylesAndButton);