import './styles.css';
import 'highlight.js/styles/github.css';

import { Message, AnthropicApiRequest } from './types';
import { MAX_HISTORY_LENGTH_KEY, API_KEY_STORAGE_KEY, getStoredValue, setStoredValue, createMessageElement, sendMessageToApi, prepareMessages } from './utils';

let MAX_HISTORY_LENGTH = parseInt(getStoredValue(MAX_HISTORY_LENGTH_KEY, '20'));
let conversationHistory: Message[] = [];

const elements = {
    maxHistoryLengthInput: document.getElementById('maxHistoryLength') as HTMLInputElement,
    modelSelect: document.getElementById('modelSelect') as HTMLSelectElement,
    clearConversationButton: document.getElementById('clearConversation') as HTMLButtonElement,
    promptForm: document.getElementById('promptForm') as HTMLFormElement,
    chatContainer: document.getElementById('chatContainer') as HTMLDivElement,
    sidebar: document.getElementById('sidebar') as HTMLDivElement,
    mainContent: document.getElementById('mainContent') as HTMLDivElement,
    apiKeyInput: document.getElementById('apiKey') as HTMLInputElement,
    promptTextarea: document.getElementById('prompt') as HTMLTextAreaElement,
    promptButton: document.getElementById('prompt-button') as HTMLButtonElement,
    loadingIndicator: document.getElementById('loadingIndicator') as HTMLElement,
};

function updateMaxHistoryLength(e: Event): void {
    MAX_HISTORY_LENGTH = parseInt((e.target as HTMLInputElement).value);
    setStoredValue(MAX_HISTORY_LENGTH_KEY, MAX_HISTORY_LENGTH.toString());
}

function clearConversation(): void {
    conversationHistory = [];
    elements.chatContainer.innerHTML = '';
}

function addMessageToChat(role: 'user' | 'assistant', content: string): void {
    const messageElement = createMessageElement(role, content);
    elements.chatContainer.appendChild(messageElement);
    
    // Smooth scroll to bottom
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

    conversationHistory.push({ role, content });

    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
        while (elements.chatContainer.childElementCount > MAX_HISTORY_LENGTH) {
            elements.chatContainer.removeChild(elements.chatContainer.firstChild as Node);
        }
    }
}

async function handleFormSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const formData = new FormData(elements.promptForm);
    const prompt = (formData.get('prompt') as string).trim();
    
    if (prompt === '') {
        // Don't send empty messages
        return;
    }

    const apiKey = elements.apiKeyInput.value;
    const temperature = parseFloat((document.getElementById('temperature') as HTMLInputElement).value);
    const maxTokens = parseInt((document.getElementById('maxTokens') as HTMLInputElement).value);

    // Disable the button and show loading indicator
    elements.promptButton.disabled = true;
    elements.loadingIndicator.classList.remove('hidden');

    addMessageToChat('user', prompt);
    elements.promptTextarea.value = '';
    const selectedModel = elements.modelSelect.value;


    try {
        const apiRequest: AnthropicApiRequest = {
            apiKey,
            model: selectedModel,
            max_tokens: maxTokens,
            temperature,
            messages: prepareMessages(conversationHistory)
        };

        const assistantResponse = await sendMessageToApi(apiRequest);
        addMessageToChat('assistant', assistantResponse);
    } catch (error) {
        console.error('Detailed error:', error);
        addMessageToChat('assistant', `Error: ${(error as Error).message}`);
    } finally {
        // Re-enable the button and hide loading indicator
        elements.promptButton.disabled = false;
        elements.loadingIndicator.classList.add('hidden');
    }
}

function saveApiKey(e: Event): void {
    const apiKey = (e.target as HTMLInputElement).value;
    setStoredValue(API_KEY_STORAGE_KEY, apiKey);
}

const autoResizeTextarea = (e: Event): void => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = (target.scrollHeight) + 'px';
};

function saveSelectedModel(e: Event): void {
    const model = (e.target as HTMLSelectElement).value;
    setStoredValue('selectedModel', model);
}

// Event listeners
elements.maxHistoryLengthInput.addEventListener('change', updateMaxHistoryLength);
elements.clearConversationButton.addEventListener('click', clearConversation);
elements.promptForm.addEventListener('submit', handleFormSubmit);
elements.apiKeyInput.addEventListener('change', saveApiKey);
elements.promptTextarea.addEventListener('input', autoResizeTextarea);
elements.modelSelect.addEventListener('change', saveSelectedModel);


// Initialization
elements.maxHistoryLengthInput.value = MAX_HISTORY_LENGTH.toString();
elements.apiKeyInput.value = getStoredValue(API_KEY_STORAGE_KEY, '');
elements.modelSelect.value = getStoredValue('selectedModel', 'claude-3-haiku-20240307');

