export class PipeLine {
    constructor() {
        this.middlewares = [];
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
