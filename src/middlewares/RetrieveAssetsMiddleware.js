import fs from "fs";
import path from "path";
import { Logger } from "../log/Logger.js";

const __dirname = path.resolve();

export class RetrieveAssetsMiddleware {
    constructor() {
        this.ASSETS_DIR = path.join(__dirname, "src", "assets");
    }

    async next(context, next) {
        Logger.log("RetrieveAssetsMiddleware", "Retrieving assets ...");

        const assetsPath = fs
            .readdirSync(this.ASSETS_DIR)
            .filter((file) => path.extname(file).toLowerCase())
            .map((file) => path.join(this.ASSETS_DIR, file));

        Logger.log("RetrieveAssetsMiddleware", `Found ${assetsPath.length} assets`);

        context.assetsPath = assetsPath;
        await next();
    }
}
