import fs from 'fs';
import path from 'path';
import { BaseMiddleware } from './BaseMiddleware.js';

const __dirname = path.resolve();

class AssetRetriever {
    static retrieveAssets(assetsDir) {
        return fs
            .readdirSync(assetsDir)
            .filter((file) => path.extname(file).toLowerCase())
            .map((file) => path.join(assetsDir, file));
    }
}

export class RetrieveAssetsMiddleware extends BaseMiddleware {
    constructor() {
        super();
        this.ASSETS_DIR = path.join(__dirname, 'src', 'assets');
    }

    async next(context, next) {
        this.log('Retrieving assets ...');

        const assetsPath = AssetRetriever.retrieveAssets(this.ASSETS_DIR);

        this.log(`Found ${assetsPath.length} assets`);

        context.assetsPath = assetsPath;
        await next();
    }
}
