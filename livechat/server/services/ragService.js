const { HfInference } = require('@huggingface/inference');
const { ChromaClient } = require('chromadb');

class RAGService {
    constructor(config = {}) {
        this.huggingFaceApiKey = config.apiKey;
        this.embeddingModel = config.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2';
        this.chromaHost = config.chromaHost || 'localhost';
        this.chromaPort = config.chromaPort || 8000;
        this.collectionName = config.collectionName || 'digimax_knowledge_base';
        this.similarityThreshold = config.similarityThreshold || 0.8;
        this.topK = config.topK || 3;
        this.fallbackMessage = config.fallbackMessage ||
            'Maaf mungkin pertanyaan yang anda ajukan tidak sesuai, saya akan hubungkan ke live agent';

        this.chromaClient = null;
        this.collection = null;

        // Initialize HuggingFace Inference client
        this.hf = new HfInference(this.huggingFaceApiKey);
    }

    /**
     * Initialize ChromaDB client and collection
     */
    async initialize() {
        try {
            console.log(`🔍 Initializing RAG Service...`);
            console.log(`   ChromaDB: ${this.chromaHost}:${this.chromaPort}`);
            console.log(`   Collection: ${this.collectionName}`);
            console.log(`   Embedding Model: ${this.embeddingModel}`);
            console.log(`   Similarity Threshold: ${this.similarityThreshold}`);

            // Initialize ChromaDB client
            this.chromaClient = new ChromaClient({
                path: `http://${this.chromaHost}:${this.chromaPort}`
            });

            // Test connection
            await this.chromaClient.heartbeat();
            console.log('   ✅ ChromaDB connection successful');

            // Get or create collection
            try {
                this.collection = await this.chromaClient.getCollection({
                    name: this.collectionName
                });
                console.log('   ✅ Collection loaded');

                // Get collection count
                const count = await this.collection.count();
                console.log(`   📊 Knowledge base contains ${count} documents`);

                if (count === 0) {
                    console.warn('   ⚠️  Warning: Knowledge base is empty. Run `npm run seed:kb` to populate it.');
                }
            } catch (error) {
                // Collection doesn't exist, create it
                console.log('   📦 Creating new collection...');
                this.collection = await this.chromaClient.createCollection({
                    name: this.collectionName,
                    metadata: {
                        description: 'DigiMax knowledge base for RAG',
                        embedding_model: this.embeddingModel
                    }
                });
                console.log('   ✅ Collection created');
            }

            console.log('🎉 RAG Service initialized successfully\n');
        } catch (error) {
            console.error('❌ RAG Service initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate embedding using HuggingFace API
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - Embedding vector (384 dimensions for all-MiniLM-L6-v2)
     */
    async generateEmbedding(text) {
        if (!this.huggingFaceApiKey) {
            throw new Error('HuggingFace API key not configured');
        }

        try {
            // Use HuggingFace Inference SDK for feature extraction
            const response = await this.hf.featureExtraction({
                model: this.embeddingModel,
                inputs: text
            });

            // Convert response to array if needed
            let embedding = Array.isArray(response) ? response : Array.from(response);

            // Handle nested array format
            if (Array.isArray(embedding[0])) {
                embedding = embedding[0];
            }

            // Validate embedding
            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error('Invalid embedding response from HuggingFace');
            }

            // For all-MiniLM-L6-v2, should be 384 dimensions
            if (embedding.length !== 384) {
                console.warn(`⚠️  Expected 384 dimensions, got ${embedding.length}`);
            }

            return embedding;
        } catch (error) {
            console.error('HuggingFace Error:', error.message);
            if (error.message?.includes('loading')) {
                throw new Error('HuggingFace model is loading. Please try again in a few seconds.');
            }
            throw error;
        }
    }

    /**
     * Search knowledge base for similar documents
     * @param {string} query - User query
     * @returns {Promise<Array>} - Array of search results with similarity scores
     */
    async searchKnowledgeBase(query) {
        try {
            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(query);

            // Search ChromaDB
            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: this.topK,
                include: ['documents', 'metadatas', 'distances']
            });

            // Process results
            if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
                return [];
            }

            // Convert distances to similarity scores
            // ChromaDB uses L2 (Euclidean) distance, convert to similarity: 1 / (1 + distance)
            const processedResults = results.ids[0].map((id, idx) => {
                const distance = results.distances[0][idx];
                const similarity = 1 / (1 + distance);

                return {
                    id: id,
                    document: results.documents[0][idx],
                    metadata: results.metadatas[0][idx],
                    distance: distance,
                    similarity: similarity
                };
            });

            // Sort by similarity (highest first)
            processedResults.sort((a, b) => b.similarity - a.similarity);

            return processedResults;
        } catch (error) {
            console.error('Knowledge base search error:', error);
            throw error;
        }
    }

    /**
     * Normalize text by reducing repeated characters
     * Examples: "hellooo" -> "hello", "hiii" -> "hi", "yesss" -> "yes"
     * @param {string} text - Text to normalize
     * @returns {string} - Normalized text
     */
    normalizeText(text) {
        if (!text) return text;

        // Reduce 3+ repeated characters to 1
        // This handles cases like "hellooo" -> "hello", "hiii" -> "hi"
        return text.replace(/(.)\1{2,}/g, '$1');
    }

    /**
     * Generate response using RAG
     * @param {string} userMessage - User's message
     * @param {Array} conversationHistory - Previous messages (optional)
     * @returns {Promise<Object>} - Response object with answer and metadata
     */
    async generateResponse(userMessage, conversationHistory = []) {
        try {
            console.log(`📊 RAG Query: "${userMessage}"`);

            // Normalize text to handle variations like "hellooo", "hiii"
            const normalizedMessage = this.normalizeText(userMessage);
            if (normalizedMessage !== userMessage) {
                console.log(`   📝 Normalized: "${userMessage}" -> "${normalizedMessage}"`);
            }

            // Search knowledge base with normalized text
            const results = await this.searchKnowledgeBase(normalizedMessage);

            // Check if we have any results
            if (!results || results.length === 0) {
                console.log('   ❌ No matches found in knowledge base');
                return {
                    response: this.fallbackMessage,
                    needsHandoff: true,
                    sources: []
                };
            }

            // Get top result
            const topResult = results[0];
            console.log(`   🎯 Top match: "${topResult.metadata.question}" (similarity: ${topResult.similarity.toFixed(3)})`);
            console.log(`   📌 Category: ${topResult.metadata.category}`);

            // Check if similarity meets threshold
            if (topResult.similarity >= this.similarityThreshold) {
                console.log(`   ✅ Similarity ${topResult.similarity.toFixed(3)} >= ${this.similarityThreshold} - Responding with answer`);

                return {
                    response: topResult.document,
                    needsHandoff: false,
                    matchedDocument: {
                        id: topResult.id,
                        question: topResult.metadata.question,
                        similarity: topResult.similarity,
                        category: topResult.metadata.category,
                        language: topResult.metadata.language
                    },
                    sources: results.map(r => ({
                        id: r.id,
                        question: r.metadata.question,
                        similarity: r.similarity,
                        category: r.metadata.category
                    }))
                };
            } else {
                console.log(`   ⚠️  Similarity ${topResult.similarity.toFixed(3)} < ${this.similarityThreshold} - Triggering handoff`);

                return {
                    response: this.fallbackMessage,
                    needsHandoff: true,
                    sources: results.map(r => ({
                        id: r.id,
                        question: r.metadata.question,
                        similarity: r.similarity,
                        category: r.metadata.category
                    }))
                };
            }
        } catch (error) {
            console.error('❌ RAG generation error:', error.message);

            // On any error, trigger handoff
            return {
                response: this.fallbackMessage,
                needsHandoff: true,
                error: error.message,
                sources: []
            };
        }
    }

    /**
     * Check ChromaDB connection status
     */
    async checkStatus() {
        try {
            await this.chromaClient.heartbeat();
            const count = await this.collection.count();

            return {
                isConnected: true,
                collectionName: this.collectionName,
                documentCount: count,
                embeddingModel: this.embeddingModel
            };
        } catch (error) {
            return {
                isConnected: false,
                error: error.message
            };
        }
    }
}

module.exports = RAGService;
