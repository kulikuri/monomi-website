const fs = require('fs').promises;
const path = require('path');

class KnowledgeBaseSeeder {
    constructor(ragService) {
        this.ragService = ragService;
    }

    /**
     * Seed knowledge base from JSON file
     * @param {string} jsonPath - Path to knowledge base JSON file
     */
    async seedFromJSON(jsonPath) {
        try {
            console.log(`\n🌱 Starting knowledge base seeding from ${jsonPath}...`);

            // Read knowledge base JSON
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            const data = JSON.parse(jsonContent);

            if (!data.documents || !Array.isArray(data.documents)) {
                throw new Error('Invalid knowledge base format. Expected { documents: [...] }');
            }

            console.log(`📚 Found ${data.documents.length} documents to seed\n`);

            // Prepare data for ChromaDB
            const documents = [];
            const embeddings = [];
            const metadatas = [];
            const ids = [];

            let processed = 0;
            let failed = 0;

            // Process each document
            for (const doc of data.documents) {
                try {
                    console.log(`[${processed + 1}/${data.documents.length}] Processing: ${doc.id}`);
                    console.log(`   Question: "${doc.question}"`);

                    // Validate document structure
                    if (!doc.id || !doc.question || !doc.answer || !doc.metadata) {
                        console.warn(`   ⚠️  Skipping invalid document (missing required fields)`);
                        failed++;
                        continue;
                    }

                    // Generate embedding for the question
                    const embedding = await this.ragService.generateEmbedding(doc.question);
                    console.log(`   ✅ Embedding generated (${embedding.length} dimensions)`);

                    // Store answer as the document (this is what gets returned)
                    documents.push(doc.answer);
                    embeddings.push(embedding);

                    // Store question and metadata for retrieval
                    metadatas.push({
                        question: doc.question,
                        category: doc.metadata.category,
                        tags: doc.metadata.tags ? doc.metadata.tags.join(',') : '',
                        language: doc.metadata.language || 'id'
                    });

                    ids.push(doc.id);
                    processed++;

                    // Small delay to avoid rate limiting
                    await this.sleep(200);

                } catch (error) {
                    console.error(`   ❌ Failed to process ${doc.id}:`, error.message);
                    failed++;
                }
            }

            if (processed === 0) {
                throw new Error('No documents were processed successfully');
            }

            // Add to ChromaDB collection in batch
            console.log(`\n📦 Adding ${processed} documents to ChromaDB collection...`);

            await this.ragService.collection.add({
                ids: ids,
                documents: documents,
                metadatas: metadatas,
                embeddings: embeddings
            });

            console.log(`\n✅ Seeding complete!`);
            console.log(`   📊 Successfully added: ${processed} documents`);
            if (failed > 0) {
                console.log(`   ⚠️  Failed: ${failed} documents`);
            }

            // Verify collection
            const count = await this.ragService.collection.count();
            console.log(`   📚 Total documents in collection: ${count}\n`);

            return {
                success: true,
                processed: processed,
                failed: failed,
                total: count
            };

        } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            throw error;
        }
    }

    /**
     * Clear all documents from collection
     */
    async clearCollection() {
        try {
            console.log(`\n🗑️  Clearing collection "${this.ragService.collectionName}"...`);

            // Get all document IDs
            const results = await this.ragService.collection.get({
                limit: 10000
            });

            if (results.ids && results.ids.length > 0) {
                // Delete all documents
                await this.ragService.collection.delete({
                    ids: results.ids
                });

                console.log(`✅ Deleted ${results.ids.length} documents`);
            } else {
                console.log(`✅ Collection is already empty`);
            }

            const count = await this.ragService.collection.count();
            console.log(`📊 Collection count: ${count}\n`);

        } catch (error) {
            console.error('❌ Clear collection failed:', error.message);
            throw error;
        }
    }

    /**
     * Update specific document
     * @param {string} docId - Document ID to update
     * @param {Object} newDoc - New document data
     */
    async updateDocument(docId, newDoc) {
        try {
            console.log(`\n📝 Updating document: ${docId}...`);

            // Delete old document
            await this.ragService.collection.delete({
                ids: [docId]
            });

            // Generate new embedding
            const embedding = await this.ragService.generateEmbedding(newDoc.question);

            // Add updated document
            await this.ragService.collection.add({
                ids: [docId],
                documents: [newDoc.answer],
                metadatas: [{
                    question: newDoc.question,
                    category: newDoc.metadata.category,
                    tags: newDoc.metadata.tags ? newDoc.metadata.tags.join(',') : '',
                    language: newDoc.metadata.language || 'id'
                }],
                embeddings: [embedding]
            });

            console.log(`✅ Document updated successfully\n`);

        } catch (error) {
            console.error('❌ Update failed:', error.message);
            throw error;
        }
    }

    /**
     * Sleep helper for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = KnowledgeBaseSeeder;
