import { Message, AnthropicApiRequest } from './types';
import hljs from 'highlight.js';



export const MAX_HISTORY_LENGTH_KEY = 'maxHistoryLength';
export const API_KEY_STORAGE_KEY = 'anthropicApiKey';

export function getStoredValue(key: string, defaultValue: string): string {
    return localStorage.getItem(key) || defaultValue;
}

export function setStoredValue(key: string, value: string): void {
    localStorage.setItem(key, value);
}


export function createMessageElement(role: 'user' | 'assistant', content: string): HTMLDivElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-4 ${role === 'user' ? 'bg-indigo-100' : 'bg-white'} rounded-lg shadow-md border border-indigo-200`;
    
    const roleSpan = document.createElement('span');
    roleSpan.className = 'font-semibold text-indigo-600 block mb-2';
    roleSpan.textContent = role === 'user' ? 'You:' : 'Assistant:';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-gray-800 text-lg';
    
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    parts.forEach(part => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const codeBlockContent = part.slice(3, -3).trim(); // Remove ``` at start and end
            const firstLineBreakIndex = codeBlockContent.indexOf('\n');
            let language = 'plaintext';
            let codeContent = codeBlockContent;

            if (firstLineBreakIndex !== -1) {
                language = codeBlockContent.slice(0, firstLineBreakIndex).trim();
                codeContent = codeBlockContent.slice(firstLineBreakIndex + 1).trim();
            }

            const codeBlockId = `code-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const codeBlockHeader = document.createElement('div');
            codeBlockHeader.className = 'code-block-header flex justify-between items-center bg-gray-200 px-2 py-1 rounded-t';
            
            const languageSpan = document.createElement('span');
            languageSpan.textContent = language || 'plaintext';
            codeBlockHeader.appendChild(languageSpan);
            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.className = 'copy-button bg-indigo-500 text-white px-2 py-1 rounded text-sm';
            copyButton.setAttribute('data-target', codeBlockId);
            copyButton.addEventListener('click', copyCodeToClipboard);
            codeBlockHeader.appendChild(copyButton);
            
            contentDiv.appendChild(codeBlockHeader);
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.id = codeBlockId;
            code.className = language;
            code.textContent = codeContent;
            pre.appendChild(code);
            contentDiv.appendChild(pre);
            
            // Apply highlight.js
            hljs.highlightElement(code);
        } else {
            // Split the text into paragraphs and create separate <p> elements
            const paragraphs = part.split(/\n\s*\n/);
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.innerHTML = paragraph.replace(/\n/g, '<br>');
                contentDiv.appendChild(p);
            });
        }
    });
    
    messageDiv.appendChild(roleSpan);
    messageDiv.appendChild(contentDiv);
    return messageDiv;
}

function copyCodeToClipboard(event: MouseEvent): void {
    const button = event.target as HTMLButtonElement;
    const codeBlockId = button.getAttribute('data-target');
    if (!codeBlockId) return;

    const codeBlock = document.getElementById(codeBlockId);
    if (!codeBlock) return;
    
    const textArea = document.createElement('textarea');
    textArea.value = codeBlock.textContent || '';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Provide visual feedback
    const originalText = button.textContent || '';
    button.textContent = 'Copied!';
    button.classList.add('bg-green-500');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
    }, 2000);
}

export async function sendMessageToApi(apiRequest: AnthropicApiRequest): Promise<string> {
    try {
        const response = await fetch('http://othmane.hopto.org:3000/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiRequest)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(JSON.stringify(errorData, null, 2));
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

export function prepareMessages(history: Message[]): Message[] {
    // Remove any empty messages
    const filteredHistory = history.filter(msg => msg.content.trim() !== '');

    // Ensure roles alternate correctly
    const preparedMessages: Message[] = [];
    let lastRole: 'user' | 'assistant' | null = null;

    for (const msg of filteredHistory) {
        if (msg.role !== lastRole) {
            preparedMessages.push(msg);
            lastRole = msg.role;
        } else if (msg.role === 'user') {
            // If we have two user messages in a row, add a placeholder assistant message
            preparedMessages.push({ role: 'assistant', content: 'Understood.' });
            preparedMessages.push(msg);
            lastRole = 'user';
        }
        // If we have two assistant messages in a row, we can just ignore the second one
    }

    // Ensure the conversation starts with a user message
    if (preparedMessages.length > 0 && preparedMessages[0].role !== 'user') {
        preparedMessages.unshift({ role: 'user', content: 'Hello' });
    }

    return preparedMessages;
}