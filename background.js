// Array para armazenar eventos rastreados
var trackedEvents = new Array();

// Domínios padrão da API que serão rastreados
var apiDomainDefault = 'api.segment.io,cdn.dreamdata.cloud,track.attributionapp.com,api.analytics.g4educacao.com';
var apiDomain = apiDomainDefault;

// Recupera o valor segment_api_domain do armazenamento local, se existir, ou usa o valor padrão
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getData") {
    // Aqui você pode pegar dados, por exemplo, do armazenamento
    chrome.storage.local.get(["segment_api_domain"], (result) => {
      sendResponse({ domain: result.segment_api_domain || apiDomainDefault });
    });
    return true; // Indica que você vai enviar uma resposta de forma assíncrona
  }
});

// Ouvinte para mudanças no armazenamento local
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local' && changes && changes.segment_api_domain) {
		apiDomain = changes.segment_api_domain.newValue || apiDomainDefault;
		console.log('API Domain changed to:', apiDomain); // Log da mudança de domínio
	}
});

// Função para adicionar zero à esquerda em números menores que 10
function zeroPad(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

// Formata a data para exibir a hora no formato local
function formatDateToTime(date) {
	return date.toLocaleTimeString();
}

// Executa uma ação com a aba ativa atual
function withOpenTab(callback) {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, (tabs) => {
		var tab = tabs[0];
		if (tab) {
			callback(tab);
		}
	});
}

// Adiciona um novo evento ao início do array de eventos e envia uma mensagem para o runtime
function addEvent(event) {
	trackedEvents.unshift(event);
	console.log('New event added:', event); // Log do novo eventos
	chrome.runtime.sendMessage({ type: "new_event" });
}

// Atualiza os eventos rastreados para uma aba específica
function updateTrackedEventsForTab(tabId, connection) {
	var sendEvents = [];
	for (var i = 0; i < trackedEvents.length; i++) {
		if (trackedEvents[i].tabId == tabId) {
			sendEvents.push(trackedEvents[i]);
		}
	}
	connection.postMessage({
		type: 'update',
		events: sendEvents
	});
}

// Limpa os eventos rastreados para uma aba específica
function clearTrackedEventsForTab(tabId, connection) {
	var newTrackedEvents = [];
	for (var i = 0; i < trackedEvents.length; i++) {
		if (trackedEvents[i].tabId != tabId) {
			newTrackedEvents.push(trackedEvents[i]);
		}
	}
	trackedEvents = newTrackedEvents;
}

// Adiciona um ouvinte para conexões de porta no runtime
chrome.runtime.onConnect.addListener((connection) => {
	var connectionHandler = (msg) => {
		var tabId = msg.tabId;
		if (msg.type == 'update') {
			updateTrackedEventsForTab(tabId, connection);
		} else if (msg.type == 'clear') {
			clearTrackedEventsForTab(tabId, connection);
			updateTrackedEventsForTab(tabId, connection);
		}
	};
	connection.onMessage.addListener(connectionHandler);
});

// Verifica se a chamada é para a API do Segment
function isSegmentApiCall(url) {
	var apiDomainParts = apiDomain.split(',');
	return apiDomainParts.findIndex(d => url.startsWith(`https://${d.trim()}`)) != -1;
}

// Executa um callback se a resposta for do próprio servidor
function onOwnServerResponse(url, callback) {
	withOpenTab((tab) => {
		try {
			if ((new URL(tab.url)).host === (new URL(url)).host) {
				callback();
			}
		} catch (exception) {
			console.log('Não foi possível criar a URL.');
			console.log(exception);
		}
	});
}

// Converte o tipo de evento em um nome legível
function eventTypeToName(eventType) {
	switch (eventType) {
		case 'identify':
			return 'Identify';
		case 'pageLoad':
			return 'Page Loaded';
		case 'batch':
			return 'Batch';
	}
}

// Manipulador para interceptar requisições antes de serem enviadas
const onBeforeRequestHandler = (details) => {
	if (isSegmentApiCall(details.url)) {
		var bytes = new Uint8Array(details.requestBody.raw[0].bytes);
		var decoder = new TextDecoder('utf-8');
		var postedString = decoder.decode(bytes);
		var rawEvent = JSON.parse(postedString);

		var event = {
			raw: postedString,
			trackedTime: formatDateToTime(new Date()),
		};

		withOpenTab((tab) => {
			event.hostName = tab.url;
			event.tabId = tab.id;

			// Define o tipo de evento baseado na URL
			if (details.url.endsWith('/v1/t') || details.url.endsWith('/v2/t') || details.url.endsWith('/v1/track')) {
				event.type = 'track';
			} else if (details.url.endsWith('/v1/i') || details.url.endsWith('/v2/i') || details.url.endsWith('/v1/identify')) {
				event.type = 'identify';
			} else if (details.url.endsWith('/v1/p') || details.url.endsWith('/v2/p') || details.url.endsWith('/v1/page')) {
				event.type = 'pageLoad';
			} else if (details.url.endsWith('/v1/batch') || details.url.endsWith('/v2/batch') || details.url.endsWith('/v1/b') || details.url.endsWith('/v2/b')) {
				event.type = 'batch';
			}

			// Se o tipo de evento for identificado, ele é adicionado ao array de eventos
			if (event.type) {
				event.eventName = eventTypeToName(event.type) || rawEvent.event;
				addEvent(event);
			}

			console.log('Segment API call detected:', details.url); // Log da chamada da API
		});
	}
};

// Ouvinte que intercepta requisições antes de serem enviadas
chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		onBeforeRequestHandler(details);
	},
	{
		urls: ['<all_urls>'],
	},
	["requestBody"]
);

// Manipulador para interceptar cabeçalhos recebidos e capturar eventos
const onHeadersReceivedHandler = (details) => {
	onOwnServerResponse(details.url, () => {
		const eventsHeader = details.responseHeaders.find(({ name }) => !!name && name.toLowerCase() === 'x-tracked-events');
		if (!eventsHeader) return;

		withOpenTab((tab) => {
			const serverTrackedEvents = JSON.parse(eventsHeader.value);
			serverTrackedEvents.forEach((serverEvent) => {
				const event = {
					type: serverEvent.type,
					eventName: serverEvent.event || eventTypeToName(serverEvent.type),
					raw: JSON.stringify(serverEvent),
					trackedTime: formatDateToTime(new Date(serverEvent.timestamp)),
					hostName: details.url,
					tabId: tab.id
				};
				addEvent(event);
			});
			console.log('Server events received:', serverTrackedEvents); // Log dos eventos recebidos do servidor
		});
	});
};

// Ouvinte que intercepta cabeçalhos de respostas
chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		onHeadersReceivedHandler(details);
	},
	{
		urls: ['<all_urls>'],
	},
	['responseHeaders']
);

// Scripts internos do widget

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["events.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "connect") {
		// Responde ao script de conteúdo
		sendResponse({ message: "Conexão estabelecida!" });
	}
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['widget.config.js']
  });
});
