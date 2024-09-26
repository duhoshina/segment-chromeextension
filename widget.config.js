// Flag para verificar se o widget já foi carregado
let widgetLoaded = false;

// Função para carregar o widget HTML
function loadWidget() {
  // Verifica se o widget já foi carregado
  if (widgetLoaded) return;

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
      widgetContainer.id = 'segment-tracker-widget';
      document.body.appendChild(widgetContainer);

      // Carrega o CSS e JS do widget
      loadWidgetCSS();
      loadWidgetJS();

      widgetLoaded = true; // Marca o widget como carregado
    });
}

// Função para carregar o CSS do widget
function loadWidgetCSS() {
  // Verifica se o CSS já foi adicionado
  if (document.querySelector('link[href="' + chrome.runtime.getURL('widget.css') + '"]')) return;

  // Cria e adiciona o elemento <link> para o Google Fonts
  const googleFontsLink = document.createElement('link');
  googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap';
  googleFontsLink.rel = 'stylesheet';
  document.head.appendChild(googleFontsLink);

  // Cria e adiciona o elemento <link> para o Font Awesome
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
  fontAwesomeLink.rel = 'stylesheet';
  document.head.appendChild(fontAwesomeLink);

  // Cria e adiciona o elemento <link> para o CSS do widget
  const widgetCSSLink = document.createElement('link');
  widgetCSSLink.rel = 'stylesheet';
  widgetCSSLink.href = chrome.runtime.getURL('widget.css');

  widgetCSSLink.onload = () => {
    console.log('Widget CSS carregado com sucesso.');
  };
  widgetCSSLink.onerror = () => {
    console.error('Falha ao carregar o Widget CSS.');
  };

  document.head.appendChild(widgetCSSLink);
}

// Função para carregar o JS do widget
function loadWidgetJS() {
  // Verifica se o JS já foi adicionado
  if (document.querySelector('script[src="' + chrome.runtime.getURL('widget.js') + '"]')) return;

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
