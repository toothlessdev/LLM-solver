import { PipeLine } from '../pipeline/index.js';
import { Container } from 'typedi';
export default async () => {
    const middlewares = Container.get('middlewares');
    const pipelineInstance = PipeLine.create(middlewares);
    await pipelineInstance.execute({});
    Container.set('pipeline', pipelineInstance);
};
