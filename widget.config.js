/*---------------------------------------------------------------------*/

function injectStyles() {
  // Cria o elemento <link> para o Google Fonts
  const googleFontsLink = document.createElement('link');
  googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap';
  googleFontsLink.rel = 'stylesheet';

  // Cria o elemento <link> para o Font Awesome
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
  fontAwesomeLink.rel = 'stylesheet';

  // Adiciona os elementos ao <head> da página
  const head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(googleFontsLink);
  head.appendChild(fontAwesomeLink);
}

// Chama a função para injetar os estilos
injectStyles();

/*---------------------------------------------------------------------*/

// Função para carregar o widget HTML
function loadWidget() {
  // Verifica se o widget já existe
  const existingWidget = document.getElementById('segment-tracker-widget');
  if (existingWidget) {
    // Remove o widget existente
    existingWidget.remove();
  }

  // Carrega o conteúdo do widget.html
  fetch(chrome.runtime.getURL('widget.html'))
    .then(response => response.text())
    .then(html => {
      // Insere o HTML no body da página
      const widgetContainer = document.createElement('div');
      widgetContainer.innerHTML = html;
      widgetContainer.id = 'segment-tracker-widget'; // Garante que o novo widget tenha o ID correto
      document.body.appendChild(widgetContainer);

      loadWidgetCSS();
      loadWidgetJS();
    });
}

// Função para carregar o CSS do widget
function loadWidgetCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('widget.css');
  document.head.appendChild(link);
}

// Função para carregar o JS do widget
function loadWidgetJS() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('widget.js');
  script.onload = () => {
    console.log('Widget JS carregado com sucesso.');
  };
  script.onerror = () => {
    console.error('Falha ao carregar o Widget JS.');
  };
  document.body.appendChild(script);
}

// Executa a função para carregar o widget
loadWidget();
