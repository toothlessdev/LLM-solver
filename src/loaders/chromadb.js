import { ChromaClient } from 'chromadb';
import { Container } from 'typedi';
export default async () => {
    const chromaClient = new ChromaClient({
        path: process.env.CHROMA_DB_PATH,
    });
    Container.set('chroma', chromaClient);
};
