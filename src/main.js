import dotenv from "dotenv";
import readline from "readline";

import { Logger } from "./log/Logger.js";
import { AnswerGenerator } from "./modules/AnswerGenerator.js";
import { Container } from "typedi";
import loaders from "./loaders/index.js";

dotenv.config();

const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

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
    await loaders();
    const context = {};
    const pipeline = Container.get("pipeline");
    await pipeline.execute(context);

    Logger.log("Main", "Pipeline executed");

    const answerGenerator = new AnswerGenerator();
    readQuestions(async (question) => {
        await answerGenerator.generateAnswer(question);
    });
}

main();
