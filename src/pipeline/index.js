import { BaseMiddleware } from "../middlewares/BaseMiddleware.js";

export class PipeLine {
    constructor(middlewares) {
        this.middlewares = middlewares;
    }
    /**
     * @param {Array<BaseMiddleware>} middlewares
     * @returns {PipeLine}
     */
    static create(middlewares) {
        return new PipeLine(middlewares);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }

    async execute(context) {
        let idx = 0;
        const next = async () => {
            if (idx < this.middlewares.length) {
                const middleware = this.middlewares[idx++];
                await middleware.next(context, next);
            }
        };

        await next();
        return context;
    }
}
