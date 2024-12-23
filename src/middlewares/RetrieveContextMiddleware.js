import fs from 'fs';
import path from 'path';
import { ChromaClient } from 'chromadb';
import { BaseMiddleware } from './BaseMiddleware.js';
import { Container } from 'typedi';

class ContextLoader {
    static loadContexts(contextsDir) {
        const files = fs.readdirSync(contextsDir);
        const contexts = [];

        files.forEach((file) => {
            if (path.extname(file) === '.txt') {
                const content = fs.readFileSync(
                    path.join(contextsDir, file),
                    'utf-8'
                );
                contexts.push({ fileName: file, text: content });
            }
        });
        return contexts;
    }
}

export class RetrieveContextMiddleware extends BaseMiddleware {
    constructor() {
        super();
        this.COLLECTION_NAME = process.env.CHROMA_DB_COLLECTION_NAME;
        this.openAIModel = Container.get('openai_model');
        this.chromaDB = new ChromaClient({ path: process.env.CHROMA_DB_PATH });
        this.openAIEmbeddingModel = Container.get('openai_embedding_model');
    }

    async getCollection() {
        return this.chromaDB.getOrCreateCollection({
            name: this.COLLECTION_NAME,
        });
    }

    async getEmbeddings(text) {
        try {
            const response = await this.openAIEmbeddingModel(text);
            return response.data[0].embedding;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async next(context, next) {
        const { contextsDir } = context;
        const collection = await this.getCollection();

        const contexts = ContextLoader.loadContexts(contextsDir);

        await this.log('Loading Contexts ...');
        for (const context of contexts) {
            const { fileName, text } = context;
            const embedding = await this.getEmbeddings(text);
            await collection.add({
                ids: [fileName],
                embeddings: [embedding],
                documents: [text],
            });
        }
        await this.log('Contexts Loaded');
        await next();
    }
}
