let apiDomainDefaultWidget = 'api.segment.io,cdn.dreamdata.cloud,track.attributionapp.com,api.analytics.g4educacao.com';

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