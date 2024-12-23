import { BaseMiddleware } from './BaseMiddleware.js';
import CacheManager from '../utils/CacheManager.js';
import PDFExtractor from '../utils/PDFExtractor.js';

export class ExtractPDFMiddleware extends BaseMiddleware {
    async next(context, next) {
        const { assetsPath } = context;

        this.log('Creating Contexts Directory ...');
        const contextsDir = await this.createContextsDirectory();
        context.contextsDir = contextsDir;
        this.log('Contexts Directory Created at', contextsDir);

        await this.processAssets(contextsDir, assetsPath);

        delete context.assetsPath;
        await next();
    }

    async createContextsDirectory() {
        return await CacheManager.getInstance().createContextsDir();
    }

    async processAssets(contextsDir, assetsPath) {
        for (const assetPath of assetsPath) {
            await this.processAsset(contextsDir, assetPath);
        }
    }

    async processAsset(contextsDir, assetPath) {
        const cached = await this.isAssetCached(contextsDir, assetPath);
        this.log(`Asset ${assetPath} is ${cached ? 'cached' : 'not cached'}`);

        if (!cached) {
            await this.extractAndCacheTexts(contextsDir, assetPath);
        } else {
            await this.readCachedTexts(contextsDir, assetPath);
        }
    }

    async isAssetCached(contextsDir, assetPath) {
        return await CacheManager.getInstance().isCached(
            contextsDir,
            assetPath
        );
    }

    async extractAndCacheTexts(contextsDir, assetPath) {
        this.log('Extracting Texts from PDF', assetPath);
        const { fileName: pdfFileName, text: pdfText } =
            await PDFExtractor.extractTextsFromPdf(assetPath);
        this.log('Texts Extracted');

        this.log('Caching Extracted Texts ...');
        const { fileName } =
            await CacheManager.getInstance().cacheExtractedTexts(
                contextsDir,
                pdfFileName,
                pdfText
            );
        this.log('Extracted Texts Cached at', fileName);
    }

    async readCachedTexts(contextsDir, assetPath) {
        this.log('Reading Cached Texts ...');
        await CacheManager.getInstance().readCachedText(contextsDir, assetPath);
        this.log('Cached Texts Read');
    }
}
