import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";
import { Logger } from "../log/Logger.js";

export class RetrieveContextMiddleware {
    constructor() {
        this.COLLECTION_NAME = process.env.CHROMA_DB_COLLECTION_NAME;

        this.openAI = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY,
        });

        this.chromaDB = new ChromaClient({
            path: process.env.CHROMA_DB_PATH,
        });
    }

    async getCollection() {
        return this.chromaDB.getOrCreateCollection({ name: this.COLLECTION_NAME });
    }

    async getEmbeddings(text) {
        try {
            const response = await this.openAI.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async loadContexts(contextsDir) {
        const files = fs.readdirSync(contextsDir);
        const contexts = [];

        files.forEach((file) => {
            if (path.extname(file) === ".txt") {
                const content = fs.readFileSync(path.join(contextsDir, file), "utf-8");
                contexts.push({ fileName: file, text: content });
            }
        });
        return contexts;
    }

    async next(context, next) {
        const { contextsDir } = context;
        const collection = await this.getCollection();

        const contexts = await this.loadContexts(contextsDir);

        await Logger.log("RetrieveContextMiddleware", "Loading Contexts ...");
        contexts.forEach(async (context) => {
            const { fileName, text } = context;
            const embedding = await this.getEmbeddings(text);
            await collection.add({
                ids: [fileName],
                embeddings: [embedding],
                documents: [text],
            });
        });
        await Logger.log("RetrieveContextMiddleware", "Contexts Loaded");
        await next();
    }
}
