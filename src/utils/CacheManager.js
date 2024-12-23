import path from 'path';
import FileSystemManager from './FileSystemManager.js';

const __dirname = path.resolve();

export default class CacheManager {
    static instance;

    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    async createContextsDir() {
        const contextsDir = path.join(__dirname, 'src', 'contexts');
        FileSystemManager.createDirIfNotExists(contextsDir);
        return contextsDir;
    }

    async readCachedText(contextsDir, fileName) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        return FileSystemManager.readFile(txtPath);
    }

    async cacheExtractedTexts(contextsDir, fileName, extractedText) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        FileSystemManager.writeFile(txtPath, extractedText);
        return { fileName, text: extractedText };
    }

    async isCached(contextsDir, fileName) {
        const txtPath = path.join(contextsDir, `${fileName}.txt`);
        return FileSystemManager.fileExists(txtPath);
    }
}
