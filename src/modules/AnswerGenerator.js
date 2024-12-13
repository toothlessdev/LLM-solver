import { ChromaClient } from "chromadb";
import OpenAI from "openai";

export class AnswerGenerator {
    constructor() {
        this.COLLECTION_NAME = process.env.CHROMA_DB_COLLECTION_NAME;

        this.openAI = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY,
        });

        this.chromaDB = new ChromaClient({
            path: process.env.CHROMA_DB_PATH,
        });
    }

    async getRelevantEntry(question) {
        const collection = await this.chromaDB.getOrCreateCollection({ name: this.COLLECTION_NAME });
        const embeddings = await this.openAI.embeddings.create({
            model: "text-embedding-ada-002",
            input: question,
        });

        const relevantEntry = await collection.query({
            queryEmbeddings: [embeddings.data[0].embedding],
            nResults: 2,
        });

        console.log("> 질문과 가장 관련있는 Context : ", relevantEntry.ids.join(", "));
        console.log("> 질문과 Context 의 유사도 : ", relevantEntry.distances);

        return relevantEntry;
    }

    async getRelevantContext(relevantEntry) {
        return relevantEntry.documents;
    }

    async generateAnswer(question) {
        const relevantEntry = await this.getRelevantEntry(question);

        if (!relevantEntry) return "No relevant entry found.";

        const relevantContext = await this.getRelevantContext(relevantEntry);

        const response = await this.openAI.chat.completions.create({
            model: process.env.OPEN_AI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `a. 다음 제시되는 context 에 대한 질문에 대한 답변을 생성해주세요.
                                 - context: ${relevantContext}
                                 - 제시된 context 에 질문에 대한 내용이 없는경우, 외부 정보를 참고하여 답변을 생성해주세요.
                              b. 답변에 대한 풀이과정과 교차검증을 수행해주세요.
                              c. 해당 답변이 옳을 가능성은 얼마나 될지 예측해주세요.

                              정답 : 
                              풀이과정 : 
                              교차검증 결과 : 
                              해당 답변이 옳을 가능성 : (백분위 형태로 작성해주세요)%

                              형식으로 답변을 작성해주세요.
                    `,
                },
                { role: "user", content: question },
            ],
        });

        const answer = response.choices[0].message.content;

        console.log("------------------");
        console.log(answer);
        console.log("------------------");

        return answer;
    }
}
