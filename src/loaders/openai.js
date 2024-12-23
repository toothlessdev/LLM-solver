import OpenAI from 'openai';
import { Container } from 'typedi';
export default async () => {
    const openAIModel = new OpenAI({
        apiKey: process.env.OPEN_AI_API_KEY,
    });

    const openAIEmbeddingModel = async (text) => {
        return await openAIModel.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });
    };

    Container.set('openai_model', openAIModel);
    Container.set('openai_embedding_model', openAIEmbeddingModel);
};
