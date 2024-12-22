import fs from 'fs';

export default class FileSystemManager {
    static createDirIfNotExists(dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    }

    static writeFile(filePath, content) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }

    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    static readFile(filePath) {
        return fs.readFileSync(filePath, 'utf-8');
    }
}
