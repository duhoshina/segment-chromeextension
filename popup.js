// SVG para o ícone de cópia de JSON, obtido do link fornecido.
const copyJsonSVG = '<svg width="32" height="32" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z" stroke="gray" fill="white" fill-opacity="0.5"/></g></svg>';

// Define o domínio padrão para a API.
let apiDomainDefault = 'api.segment.io,cdn.dreamdata.cloud,track.attributionapp.com,api.analytics.g4educacao.com';

// Estabelece uma conexão com o background script da extensão do Chrome.
let connection = chrome.runtime.connect();

// Função para exibir o conteúdo do evento com base no número.
function showEvent(number) {
	document.getElementById('eventContent_' + number).style.display = 'block';
}

// Função para imprimir variáveis de um objeto JSON com identação para melhor visualização.
function printVariable(jsonObject, level) {
	var returnString = '';
	for (var key in jsonObject) {
		if (jsonObject.hasOwnProperty(key)) {
			returnString += '<div style="padding-left: ' + (level * 10) + 'px;">';
			returnString += '<span class="key">' + key + '</span>';

			if (typeof jsonObject[key] == 'object') {
				// Se o valor for um objeto, chama a função recursivamente e adiciona chaves de nível superior.
				returnString += ' {' + printVariable(jsonObject[key], level + 1) + '}';
			} else {
				// Se o valor não for um objeto, determina o tipo e formata o valor.
				var type = 'number';
				if (isNaN(jsonObject[key])) {
					type = 'string';
				}

				returnString += ': <span class="' + type + '">' + jsonObject[key] + '</span>';
			}
			returnString += '</div>';
		}
	}
	return returnString;
}

// Consulta a guia ativa e envia uma mensagem para atualizar os eventos.
function queryForUpdate() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		var currentTab = tabs[0];

		connection.postMessage({
			type: "update",
			tabId: currentTab.id
		});
	});
}

// Consulta a guia ativa e envia uma mensagem para limpar os eventos.
function clearTabLog() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		var currentTab = tabs[0];

		connection.postMessage({
			type: "clear",
			tabId: currentTab.id
		});
	});
}

// Inicializa a atualização dos eventos.
queryForUpdate();

// Adiciona um ouvinte para mensagens recebidas do background script.
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
	if (message.type == 'new_event') {
		queryForUpdate(); // Atualiza a consulta de eventos se houver uma nova mensagem.
	}
});

// Adiciona um ouvinte para mensagens recebidas da conexão com o background script.
connection.onMessage.addListener((msg) => {
	if (msg.type == "update") {
		var prettyEventsString = '';

		if (msg.events.length > 0) {
			// Para cada evento recebido, gera um HTML formatado.
			for (var i = 0; i < msg.events.length; i++) {
				var event = msg.events[i];
				var jsonObject = JSON.parse(event.raw);
				var eventString = '';

				eventString += '<div class="eventTracked eventType_' + event.type + '">';
					eventString += '<div class="eventInfo" id="eventInfo_' + i + '">';
					eventString += '<span class="eventName">' + event.eventName + '</span>';
					eventString += ' - ' + event.trackedTime + '<br />' + event.hostName;
					eventString += '<div class="copyEvent" id="copy_' + i + '"><a title="Copy json to clipboard">' + copyJsonSVG + '</a></div>';
					eventString += '<div class="eventContent" id="eventContent_' + i + '" >';
					eventString += printVariable(jsonObject, 0); // Imprime as variáveis formatadas.
					eventString += '</div>';
					eventString += '</div>';
				eventString += '</div>';

				prettyEventsString += eventString;
			}
		} else {
			prettyEventsString += 'No events tracked in this tab yet.';
		}
		document.getElementById('trackMessages').innerHTML = prettyEventsString;

		// Adiciona eventos de clique para exibir/ocultar o conteúdo do evento e copiar o JSON.
		for (var i = 0; i < msg.events.length; i++) {
			const number = i;
			document.getElementById('eventInfo_' + number).onclick = function() {
				var contentDiv = document.getElementById('eventContent_' + number);
				contentDiv.style.display = (contentDiv.style.display == 'block') ? 'none' : 'block';
			};
			document.getElementById('copy_' + number).onclick = (event) => {
				navigator.clipboard.writeText(msg.events[number].raw);
				event.stopPropagation(); // Impede a propagação do clique para o elemento pai.
			};
		}
	}
});

// Função para filtrar eventos com base no texto digitado no campo de filtro.
function filterEvents(keyPressedEvent) {
	var filter = new RegExp(keyPressedEvent.target.value, 'gi');
	var eventElements = document.getElementById('trackMessages').getElementsByClassName('eventTracked');
	for (eventElement of eventElements) {
		var eventName = eventElement.getElementsByClassName('eventName')[0].textContent;
		if (eventName.match(filter)) {
			eventElement.classList.remove('hidden');
		} else {
			eventElement.classList.add('hidden');
		}
	}
}

// Função para alternar a visibilidade das configurações.
function toggleConfiguration() {
	var configurationDiv = document.getElementById('configurationDiv');
	configurationDiv.hidden = !configurationDiv.hidden;

	var contentDiv = document.getElementById('contentDiv');
	contentDiv.hidden = !contentDiv.hidden;
}

// Atualiza o domínio da API armazenado localmente.
function updateApiDomain(apiDomain) {
	chrome.storage.local.set({segment_api_domain: apiDomain || apiDomainDefault}, function() {});
}

// Lida com as atualizações do domínio da API e configura o campo de entrada com o valor armazenado.
function handleApiDomainUpdates() {
	var apiDomainInput = document.getElementById('apiDomain');

	chrome.storage.local.get(['segment_api_domain'], function(result) {
		apiDomainInput.value = result.segment_api_domain || apiDomainDefault;
		apiDomainInput.onchange = () => updateApiDomain(apiDomainInput.value);
	});
}

// Inicializa os elementos da página quando o conteúdo é carregado.
document.addEventListener('DOMContentLoaded', function() {
	var clearButton = document.getElementById('clearButton');
	clearButton.onclick = clearTabLog; // Adiciona ação ao botão de limpar.

	var filterInput = document.getElementById('filterInput');
	filterInput.onkeyup = filterEvents; // Adiciona ação ao campo de filtro.
	filterInput.focus(); // Foca no campo de filtro.

	var configureButton = document.getElementById('configureButton');
	configureButton.onclick = toggleConfiguration; // Adiciona ação ao botão de configuração.

	handleApiDomainUpdates(); // Configura o campo de domínio da API.
});
