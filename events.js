// Armazena eventos capturados
const capturedEvents = [];

// Sobrescreve o método push do dataLayer
const originalPush = window.dataLayer.push;
const scrollEventCount = { count: 1 };

// Função de inicialização para sobrescrever o método push
function initializeDataLayer() {
  window.dataLayer.push = function (event) {
    originalPush.apply(window.dataLayer, arguments);

    if (isValidEvent(event)) {
      capturedEvents.push(event);
      renderEvent(event);
    }
  };
}

// Verifica se o evento é um objeto válido
function isValidEvent(event) {
  return typeof event === "object" && event !== null;
}

// Renderiza o evento com base no tipo
function renderEvent(event) {
  let listItem;

  switch (event.event) {
    case "page_clicked":
      listItem = createInteractionEventItem(event);
      break;
    case "page_viewed":
      listItem = createViewEventItem(event);
      break;
    case "page_scrolled":
      listItem = createScrollEventItem(event);
      break;
    case "user_identified":
      listItem = createUserIdentifiedEventItem(event);
      break;
    default:
      return; // Caso não seja um evento conhecido, não faz nada
  }

  const eventList = document.getElementById(
    event.event === "page_clicked" ? "interaction-events" : "view-events"
  );
  eventList.insertBefore(listItem, eventList.firstChild);
}

// Função para renderizar todos os eventos ao inicializar a extensão
function renderAllEvents() {
  capturedEvents.forEach((event) => renderEvent(event));
}

// Cria um item da lista de eventos para page_clicked
function createInteractionEventItem(event) {
  const listItem = document.createElement("li");
  listItem.className = "event";
  listItem.innerHTML = `
        <header class="header-event top">
            <div class="squared-icon">
                <i class="fa fa-mouse-pointer" aria-hidden="true"></i>
            </div>
            <div class="shortcut-event">
                <p>Clique do Usuário</p>
                <div class="shortcut-details">
                    <p>${event.click_cta || "N/A"}</p>
                </div>
            </div>
            <div class="rounded-button">
                <i class="fa fa-angle-down accordion-icon" aria-hidden="true"></i>
            </div>
            <input type="checkbox">
        </header>
    <div class="details-container bottom">
      <div class="details">
        <p>event: page_clicked</p>
        <p>type: track</p>
        <p>properties {</p>
        <p>...</p>
      </div>
      <div class="details-buttons">
        <div class="squared-icon">
          <i class="fa fa-clone" aria-hidden="true"></i>
        </div>
        <div class="squared-icon">
          <i class="fa fa-tag" aria-hidden="true"></i>
        </div>
      </div>
    </div>
    `;

  addToggleDetailsEvent(listItem);
  return listItem;
}

function createViewEventItem(event) {
  const listItem = document.createElement("li");
  listItem.className = "event";
  listItem.innerHTML = `
        <header class="header-event top">
            <div class="squared-icon">
                <i class="fa fa-eye" aria-hidden="true"></i>
            </div>
            <div class="shortcut-event">
                <p>Página Visualizada</p>
                <div class="shortcut-details">
                    <p>${event.page_name || "N/A"}</p>
                </div>
            </div>
            <div class="rounded-button">
                <i class="fa fa-angle-down accordion-icon" aria-hidden="true"></i>
            </div>
            <input type="checkbox">
        </header>
        <div class="details-container bottom">
            <div class="details">
                <p>event: ${event.event}</p>
                <p>type: ${event.type || "N/A"}</p>
                <p>properties {</p>
                <p>...</p>
            </div>
        </div>
    `;

  addToggleDetailsEvent(listItem);
  return listItem;
}

// Cria ou atualiza o item para o evento page_scrolled
function createScrollEventItem(event) {
  const listItemId = 'scroll-event-item'; // ID único para o item

  // Tenta encontrar o item existente
  let listItem = document.getElementById(listItemId);

  if (!listItem) {
    // Se o item não existe, cria um novo
    listItem = document.createElement("li");
    listItem.id = listItemId;
    listItem.className = "event";
    listItem.innerHTML = `
        <header class="header-event top">
            <div class="squared-icon">
                <i class="fa fa-angle-double-down" aria-hidden="true"></i>
            </div>
            <div class="shortcut-event">
                <p>Página Rolada <span class="scroll-count" style="background-color: orange; border-radius: 50%; padding: 2px; color: white;">${scrollEventCount.count}</span></p>
                <div class="shortcut-details">
                    <p>${event.percentage_scrolled || "N/A"}%</p>
                </div>
            </div>
            <div class="rounded-button">
                <i class="fa fa-angle-down accordion-icon" aria-hidden="true"></i>
            </div>
            <input type="checkbox">
        </header>
        <div class="details-container bottom">
            <div class="details">
                <p>event: ${event.event}</p>
                <p>type: ${event.type || "N/A"}</p>
                <p>properties {</p>
                <p>...</p>
            </div>
        </div>
    `;
    
    // Adiciona o novo item à lista
    const eventList = document.getElementById("view-events");
    eventList.insertBefore(listItem, eventList.firstChild);
  } else {
    // Se o item já existe, atualiza a contagem e o percentage_scrolled
    scrollEventCount.count++;
    const countElement = listItem.querySelector(".scroll-count");
    countElement.textContent = scrollEventCount.count;

    const percentageElement = listItem.querySelector(".shortcut-details p");
    percentageElement.textContent = `${event.percentage_scrolled || "N/A"}%`; // Atualiza o percentage_scrolled
  }

  addToggleDetailsEvent(listItem);
  return listItem;
}

const userTraits = localStorage.getItem("ajs_user_traits");

function createUserIdentifiedEventItem(event) {
  if(!userTraits) return;

  const userTraitsObject = JSON.parse(userTraits);
  
  const listItem = document.createElement("li");
  listItem.className = "event";
  listItem.innerHTML = `
        <header class="header-event top">
            <div class="squared-icon">
                <i class="fa fa-user" aria-hidden="true"></i>
            </div>
            <div class="shortcut-event">
                <p>Usuário Identificado</p>
                <div class="shortcut-details">
                    <p>${userTraitsObject.email || "N/A"}</p>
                </div>
            </div>
            <div class="rounded-button">
                <i class="fa fa-angle-down accordion-icon" aria-hidden="true"></i>
            </div>
            <input type="checkbox">
        </header>
        <div class="details-container bottom">
            <div class="details">
                <p>event: ${event.event}</p>
                <p>type: ${event.type || "N/A"}</p>
                <p>properties {</p>
                <p>...</p>
            </div>
        </div>
    `;

  addToggleDetailsEvent(listItem);
  return listItem;
}

function renderInteractionEvent(event) {
  const eventList = document.getElementById("interaction-events");
  const listItem = createEventListItem(
    event,
    "Clique do Usuário",
    "fa-mouse-pointer"
  );

  eventList.insertBefore(listItem, eventList.firstChild);
}

function renderViewEvent(event) {
  const eventList = document.getElementById("view-events");
  const eventTitle = getEventTitle(event);
  const icon = getEventIcon(event);
  const listItem = createEventListItem(event, eventTitle, icon);

  eventList.insertBefore(listItem, eventList.firstChild);
}

function createEventListItem(event, title, icon) {
  const listItem = document.createElement("li");
  listItem.className = "event";

  listItem.innerHTML = `
        <header class="header-event top">
            <div class="squared-icon">
                <i class="fa ${icon}" aria-hidden="true"></i>
            </div>
            <div class="shortcut-event">
                <p>${title}</p>
                <div class="shortcut-details">
                    <p>${event.click_cta || "N/A"}</p>
                </div>
            </div>
            <div class="rounded-button">
                <i class="fa fa-angle-down accordion-icon" aria-hidden="true"></i>
            </div>
            <input type="checkbox">
        </header>
        <div class="details-container bottom">
            <div class="details">
                <p>event: ${event.event}</p>
                <p>type: ${event.type || "N/A"}</p>
                <p>properties {</p>
                <p>...</p>
            </div>
        </div>
    `;

  addToggleDetailsEvent(listItem);
  return listItem;
}

function addToggleDetailsEvent(listItem) {
  const checkbox = listItem.querySelector('input[type="checkbox"]');
  const detailsContainer = listItem.querySelector(".details-container");

  checkbox.addEventListener("change", function () {
    detailsContainer.classList.toggle("show", this.checked);
  });
}

function getEventTitle(event) {
  switch (event.event) {
    case "page_viewed":
      return "Página Visualizada";
    case "page_scrolled":
      return "Página Rolada";
    case "user_identified":
      return "Usuário Identificado";
    default:
      return "Evento Desconhecido";
  }
}

function getEventIcon(event) {
  switch (event.event) {
    case "page_viewed":
    case "page_scrolled":
      return "fa-angle-double-down";
    case "user_identified":
      return "fa-user";
    default:
      return "fa-question-circle";
  }
}

function clearEvents() {
  capturedEvents.length = 0;
  const interactionEventList = document.getElementById("interaction-events");
  const viewEventList = document.getElementById("view-events");
  interactionEventList.innerHTML = "";
  viewEventList.innerHTML = "";
}

// Adiciona o evento de clique ao botão de limpar
document.getElementById("clear-button").addEventListener("click", clearEvents);

// Inicializa o dataLayer e renderiza eventos já capturados ao inicializar
initializeDataLayer();
renderAllEvents();
