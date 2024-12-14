import { PipeLine } from "../pipe/index.js";
import { Container } from "typedi";
export default async () => {
    const middlewares = Container.get("middlewares");
    const pipelineInstance = PipeLine.create(middlewares);

    Container.set("pipeline", pipelineInstance);
};
