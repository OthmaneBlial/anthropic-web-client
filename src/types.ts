export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface AnthropicApiRequest {
    apiKey: string;
    model?: string;
    max_tokens: number;
    temperature: number;
    messages: Message[];
}