import fs from "fs";
import path from "path";
import PdfParse from "pdf-parse/lib/pdf-parse.js";
import { Logger } from "../log/Logger.js";

const __dirname = path.resolve();

export class ExtractPDFMiddleware {
    async createContextsDir() {
        const contextsDir = path.join(__dirname, "src", "contexts");
        if (!fs.existsSync(contextsDir)) fs.mkdirSync(contextsDir);
        return contextsDir;
    }

    async extractTextsFromPdf(filePath) {
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));

        const { text } = await PdfParse(buffer);
        return { fileName, text };
    }

    async cacheExtractedTexts(contextsDir, fileName, extractedText) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        fs.writeFileSync(txtPath, extractedText, "utf-8");
        return { fileName, text: extractedText };
    }

    async isCached(contextsDir, fileName) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        return fs.existsSync(txtPath);
    }

    async readCachedText(contextsDir, fileName) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        return fs.readFileSync(txtPath, "utf-8");
    }

    async next(context, next) {
        const { assetsPath } = context;

        Logger.log("ExtractPDFMiddleware", "Creating Contexts Directory ...");
        const contextsDir = await this.createContextsDir();
        context.contextsDir = contextsDir;
        Logger.log("ExtractPDFMiddleware", "Contexts Directory Created at", contextsDir);

        await assetsPath.forEach(async (assetPath) => {
            const cached = await this.isCached(contextsDir, assetPath);
            Logger.log("ExtractPDFMiddleware", `Asset ${assetPath} is ${cached ? "cached" : "not cached"}`);

            if (!cached) {
                Logger.log("ExtractPDFMiddleware", "Extracting Texts from PDF", assetPath);
                const { fileName: pdfFileName, text: pdfText } = await this.extractTextsFromPdf(assetPath);
                Logger.log("ExtractPDFMiddleware", "Texts Extracted");

                Logger.log("ExtractPDFMiddleware", "Caching Extracted Texts ...");
                const { fileName, _text } = await this.cacheExtractedTexts(contextsDir, pdfFileName, pdfText);
                Logger.log("ExtractPDFMiddleware", "Extracted Texts Cached at", fileName);
            } else {
                Logger.log("ExtractPDFMiddleware", "Reading Cached Texts ...");
                const _cachedText = await this.readCachedText(contextsDir, assetPath);
                Logger.log("ExtractPDFMiddleware", "Cached Texts Read");
            }
        });

        delete context.assetsPath;
        await next();
    }
}
