const { Ollama } = require('ollama');
const axios = require('axios');

class AIService {
    constructor(config = {}) {
        this.provider = config.provider || 'ollama'; // ollama, huggingface, openai, claude
        this.model = config.model || 'llama3'; // Default Ollama model
        this.apiKey = config.apiKey || null;
        this.apiUrl = config.apiUrl || 'http://localhost:11434'; // Ollama default
        this.temperature = config.temperature || 0.7;
        this.maxTokens = config.maxTokens || 500;

        // Initialize provider
        if (this.provider === 'ollama') {
            this.ollama = new Ollama({ host: this.apiUrl });
        }

        // Keywords that trigger human handoff
        this.handoffKeywords = [
            'human', 'agent', 'representative', 'real person', 'live chat',
            'speak to someone', 'talk to someone', 'customer service',
            'manager', 'supervisor', 'help me'
        ];

        // System prompt for the AI
        this.systemPrompt = `You are a helpful customer service AI assistant for DigiMax, a digital marketing agency.
Your role is to:
- Answer general questions about digital marketing services
- Provide information about common topics like SEO, social media marketing, web design, and content creation
- Be friendly, professional, and concise
- If you don't know something or the question is complex, suggest talking to a human agent

If the customer asks to speak with a human, agent, or representative, respond politely and let them know you're connecting them to a live agent.

Keep responses brief (2-3 sentences maximum unless asked for more detail).`;
    }

    /**
     * Check if message should trigger human handoff
     */
    shouldHandoffToHuman(message) {
        const lowerMessage = message.toLowerCase();
        return this.handoffKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Generate AI response based on provider
     */
    async generateResponse(message, conversationHistory = []) {
        try {
            switch (this.provider) {
                case 'ollama':
                    return await this.generateOllamaResponse(message, conversationHistory);
                case 'huggingface':
                    return await this.generateHuggingFaceResponse(message, conversationHistory);
                case 'openai':
                    return await this.generateOpenAIResponse(message, conversationHistory);
                case 'claude':
                    return await this.generateClaudeResponse(message, conversationHistory);
                default:
                    throw new Error(`Unsupported AI provider: ${this.provider}`);
            }
        } catch (error) {
            console.error('AI Service Error:', error);
            return this.getFallbackResponse();
        }
    }

    /**
     * Generate response using Ollama (local LLM)
     */
    async generateOllamaResponse(message, conversationHistory) {
        try {
            // Build conversation context
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                ...conversationHistory.map(msg => ({
                    role: msg.sender_is_admin ? 'assistant' : 'user',
                    content: msg.message
                })),
                {
                    role: 'user',
                    content: message
                }
            ];

            const response = await this.ollama.chat({
                model: this.model,
                messages: messages,
                stream: false,
                options: {
                    temperature: this.temperature,
                    num_predict: this.maxTokens
                }
            });

            return response.message.content.trim();
        } catch (error) {
            console.error('Ollama Error:', error.message);

            // Check if Ollama is not running
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Ollama is not running. Please start Ollama with: ollama serve');
            }

            // Check if model is not available
            if (error.message && error.message.includes('not found')) {
                throw new Error(`Model "${this.model}" not found. Please pull it with: ollama pull ${this.model}`);
            }

            throw error;
        }
    }

    /**
     * Generate response using Hugging Face Inference API
     */
    async generateHuggingFaceResponse(message, conversationHistory) {
        if (!this.apiKey) {
            throw new Error('Hugging Face API key not configured');
        }

        try {
            // Build conversation context
            let context = this.systemPrompt + '\n\n';
            conversationHistory.forEach(msg => {
                const role = msg.sender_is_admin ? 'Assistant' : 'User';
                context += `${role}: ${msg.message}\n`;
            });
            context += `User: ${message}\nAssistant:`;

            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${this.model}`,
                {
                    inputs: context,
                    parameters: {
                        max_new_tokens: this.maxTokens,
                        temperature: this.temperature,
                        return_full_text: false
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data[0] && response.data[0].generated_text) {
                return response.data[0].generated_text.trim();
            } else {
                throw new Error('Invalid response from Hugging Face');
            }
        } catch (error) {
            console.error('Hugging Face Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate response using OpenAI API
     */
    async generateOpenAIResponse(message, conversationHistory) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                ...conversationHistory.map(msg => ({
                    role: msg.sender_is_admin ? 'assistant' : 'user',
                    content: msg.message
                })),
                {
                    role: 'user',
                    content: message
                }
            ];

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: this.model,
                    messages: messages,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate response using Claude (Anthropic) API
     */
    async generateClaudeResponse(message, conversationHistory) {
        if (!this.apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        try {
            const messages = conversationHistory.map(msg => ({
                role: msg.sender_is_admin ? 'assistant' : 'user',
                content: msg.message
            }));
            messages.push({
                role: 'user',
                content: message
            });

            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: this.model,
                    max_tokens: this.maxTokens,
                    system: this.systemPrompt,
                    messages: messages,
                    temperature: this.temperature
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.content[0].text.trim();
        } catch (error) {
            console.error('Claude Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Fallback response when AI fails
     */
    getFallbackResponse() {
        const fallbacks = [
            "I'm having trouble connecting right now. Let me connect you with a human agent who can help you better.",
            "I apologize, but I'm experiencing technical difficulties. Would you like to speak with a live agent?",
            "Sorry, I'm not able to process that right now. Let me transfer you to a human representative."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * Get FAQ response (predefined answers)
     */
    getFAQResponse(message) {
        const lowerMessage = message.toLowerCase();

        const faqs = {
            'hours': {
                keywords: ['hours', 'open', 'available', 'schedule', 'business hours'],
                response: 'We are available Monday to Friday, 9 AM to 6 PM EST. Our AI assistant is available 24/7 to answer basic questions!'
            },
            'pricing': {
                keywords: ['price', 'cost', 'pricing', 'how much', 'quote'],
                response: 'Our pricing varies based on your specific needs. I can connect you with a sales representative who can provide a detailed quote. Would you like to speak with someone?'
            },
            'services': {
                keywords: ['services', 'what do you do', 'offerings', 'provide'],
                response: 'DigiMax offers SEO optimization, social media marketing, web design, content creation, and digital advertising. Which service interests you?'
            },
            'contact': {
                keywords: ['contact', 'email', 'phone', 'reach you'],
                response: 'You can reach us at support@digimax.com or call us at (555) 123-4567. You can also continue chatting here with our AI assistant or request a human agent!'
            }
        };

        for (const [key, faq] of Object.entries(faqs)) {
            if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return faq.response;
            }
        }

        return null; // No FAQ match
    }

    /**
     * Check if Ollama is running and model is available
     */
    async checkOllamaStatus() {
        try {
            const response = await axios.get(`${this.apiUrl}/api/tags`);
            const models = response.data.models || [];
            const modelExists = models.some(m => m.name.includes(this.model.split(':')[0]));

            return {
                isRunning: true,
                modelAvailable: modelExists,
                availableModels: models.map(m => m.name)
            };
        } catch (error) {
            return {
                isRunning: false,
                modelAvailable: false,
                availableModels: [],
                error: error.message
            };
        }
    }
}

module.exports = AIService;
