import { Container } from 'typedi';
import { PROMPT_TEMPLATE } from '../constants/index.js';

export class AnswerGenerator {
    constructor() {
        this.COLLECTION_NAME = process.env.CHROMA_DB_COLLECTION_NAME;

        this.openAI = Container.get('openai_model');
        this.chromaDB = Container.get('chroma');
    }

    async getRelevantEntry(question) {
        const collection = await this.chromaDB.getOrCreateCollection({
            name: this.COLLECTION_NAME,
        });
        const embeddings = await this.openAI.embeddings.create({
            model: 'text-embedding-ada-002',
            input: question,
        });

        const relevantEntry = await collection.query({
            queryEmbeddings: [embeddings.data[0].embedding],
            nResults: 2,
        });

        console.log(
            '> 질문과 가장 관련있는 Context : ',
            relevantEntry.ids.join(', ')
        );
        console.log('> 질문과 Context 의 유사도 : ', relevantEntry.distances);

        return relevantEntry;
    }

    async getRelevantContext(relevantEntry) {
        return relevantEntry.documents;
    }

    async generateAnswer(question) {
        const relevantEntry = await this.getRelevantEntry(question);

        if (!relevantEntry) return 'No relevant entry found.';

        const relevantContext = await this.getRelevantContext(relevantEntry);

        const response = await this.openAI.chat.completions.create({
            model: process.env.OPEN_AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: PROMPT_TEMPLATE.replace(
                        '{context}',
                        relevantContext
                    ),
                },
                { role: 'user', content: question },
            ],
        });

        const answer = response.choices[0].message.content;

        console.log('------------------');
        console.log(answer);
        console.log('------------------');

        return answer;
    }
}
