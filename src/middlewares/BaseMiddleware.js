import { Logger } from '../log/Logger.js';

export class BaseMiddleware {
    log(message) {
        Logger.log(this.constructor.name, message);
    }

    async next(context, next) {
        throw new Error("Method 'next()' must be implemented.");
    }

    setNext(middleware) {
        this.nextMiddleware = middleware;
    }

    async execute(context) {
        if (this.nextMiddleware) {
            await this.next(context, () =>
                this.nextMiddleware.execute(context)
            );
        } else {
            await this.next(context, () => Promise.resolve());
        }
    }
}
