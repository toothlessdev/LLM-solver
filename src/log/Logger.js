export class Logger {
    static context = "Main";

    static setContext(context) {
        this.context = context;
    }

    static log(context, ...args) {
        console.log(`[${context}]`, ...args);
    }
}
