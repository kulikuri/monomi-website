require('dotenv').config();
const path = require('path');
const RAGService = require('../services/ragService');
const KnowledgeBaseSeeder = require('../services/knowledgeBaseSeeder');

async function main() {
    console.log('='.repeat(60));
    console.log('     DigiMax Knowledge Base Seeding Script');
    console.log('='.repeat(60));

    // Validate environment variables
    if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('\n❌ Error: HUGGINGFACE_API_KEY not found in .env file');
        console.error('   Please add your HuggingFace API key to .env:');
        console.error('   HUGGINGFACE_API_KEY=your_key_here\n');
        process.exit(1);
    }

    try {
        // Initialize RAG service
        console.log('\n🔧 Initializing RAG Service...');
        const ragService = new RAGService({
            apiKey: process.env.HUGGINGFACE_API_KEY,
            embeddingModel: process.env.AI_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
            chromaHost: process.env.CHROMA_HOST || 'localhost',
            chromaPort: parseInt(process.env.CHROMA_PORT) || 8000,
            collectionName: process.env.CHROMA_COLLECTION || 'digimax_knowledge_base',
            similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.8,
            topK: parseInt(process.env.RAG_TOP_K) || 3,
            fallbackMessage: process.env.RAG_FALLBACK_MESSAGE ||
                'Maaf mungkin pertanyaan yang anda ajukan tidak sesuai, saya akan hubungkan ke live agent'
        });

        await ragService.initialize();

        // Initialize seeder
        const seeder = new KnowledgeBaseSeeder(ragService);

        // Parse command line arguments
        const args = process.argv.slice(2);
        const shouldClear = args.includes('--clear');

        // Clear existing data if requested
        if (shouldClear) {
            await seeder.clearCollection();
        }

        // Seed from JSON
        const kbPath = path.join(__dirname, '../data/knowledgeBase.json');
        console.log(`📁 Knowledge base file: ${kbPath}`);

        const result = await seeder.seedFromJSON(kbPath);

        // Display summary
        console.log('='.repeat(60));
        console.log('                    SEEDING SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Status: ${result.success ? 'Success' : 'Failed'}`);
        console.log(`📊 Documents processed: ${result.processed}`);
        if (result.failed > 0) {
            console.log(`⚠️  Documents failed: ${result.failed}`);
        }
        console.log(`📚 Total in collection: ${result.total}`);
        console.log('='.repeat(60));

        console.log('\n✨ Knowledge base is ready!');
        console.log('   You can now start the livechat service with: npm run dev\n');

        process.exit(0);

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ SEEDING FAILED');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        console.error('\nCommon issues:');
        console.error('1. ChromaDB not running - Start with: docker-compose up chromadb -d');
        console.error('2. Invalid HuggingFace API key - Check .env file');
        console.error('3. Network issues - Check your internet connection');
        console.error('='.repeat(60) + '\n');
        process.exit(1);
    }
}

// Run main function
main();
