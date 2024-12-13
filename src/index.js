import dotenv from "dotenv";
import readline from "readline";

import { PipeLine } from "./pipe/index.js";
import { ExtractPDFMiddleware } from "./middlewares/ExtractPDFMiddleware.js";
import { RetrieveAssetsMiddleware } from "./middlewares/RetrieveAssetsMiddleware.js";
import { RetrieveContextMiddleware } from "./middlewares/RetrieveContextMiddleware.js";
import { Logger } from "./log/Logger.js";
import { AnswerGenerator } from "./modules/AnswerGenerator.js";

dotenv.config();

const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function pipelineLoader() {
    const pipeline = new PipeLine();

    pipeline.use(new RetrieveAssetsMiddleware());
    pipeline.use(new ExtractPDFMiddleware());
    pipeline.use(new RetrieveContextMiddleware());

    return pipeline;
}

async function readQuestions(callback) {
    readLine.question("> 질문을 입력하세요 : ", async (question) => {
        if (question.toLowerCase() === "exit") {
            readLine.close();
        } else {
            await callback(question);
            readQuestions(callback);
        }
    });
}

async function main() {
    const context = {};
    const pipeline = await pipelineLoader();
    await pipeline.execute(context);

    Logger.log("Main", "Pipeline executed");

    const answerGenerator = new AnswerGenerator();
    readQuestions(async (question) => {
        await answerGenerator.generateAnswer(question);
    });
}

main();
