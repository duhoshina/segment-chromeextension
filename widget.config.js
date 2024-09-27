function loadStyleSheet(
  href,
  rel = "stylesheet",
  onloadMessage = null,
  onErrorMessage = null
) {
  if (document.querySelector(`link[href="${href}"]`)) {
    console.log(`Stylesheet ${href} já carregado.`);
    return;
  }

  const link = document.createElement("link");
  link.href = href;
  link.rel = rel;

  if (onloadMessage) {
    link.onload = () => console.log(onloadMessage);
  }

  if (onErrorMessage) {
    link.onerror = () => console.error(onErrorMessage);
  }

  document.head.appendChild(link);
}

function loadWidgetCSS() {
  loadStyleSheet(
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
  );
  loadStyleSheet(
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
  );
  loadStyleSheet(
    chrome.runtime.getURL("widget.css"),
    "stylesheet",
    "Widget CSS carregado com sucesso.",
    "Falha ao carregar o Widget CSS."
  );
}

function loadScript(src, successMessage, errorMessage) {
  if (document.querySelector(`script[src="${src}"]`)) {
    console.log(`Script ${src} já carregado.`);
    return;
  }

  const script = document.createElement("script");
  script.src = src;

  if (successMessage) {
    script.onload = () => console.log(successMessage);
  }

  if (errorMessage) {
    script.onerror = () => console.error(src, errorMessage);
  }

  document.body.appendChild(script);
}

function loadWidgetJS() {
  loadScript(
    chrome.runtime.getURL("widget.js"),
    "Widget JS carregado com sucesso.",
    "Falha ao carregar o Widget JS."
  );
  loadScript(
    chrome.runtime.getURL("events.js"),
    "Events JS carregado com sucesso.",
    "Falha ao carregar o Events JS."
  );
  loadScript(
    chrome.runtime.getURL("theme.js"),
    "Theme JS carregado com sucesso.",
    "Falha ao carregar o Theme JS."
  );
}

function loadWidget() {
  if (document.querySelector("#segment-tracker-widget")) {
    console.log("Widget já carregado.");
    return;
  }

  fetch(chrome.runtime.getURL("widget.html"))
    .then((response) => response.text())
    .then((html) => {
      const widgetContainer = document.createElement("div");
      widgetContainer.innerHTML = html;
      widgetContainer.id = "segment-tracker-widget";
      document.body.appendChild(widgetContainer);

      loadWidgetCSS();
      loadWidgetJS();
    });
}

loadWidget();
