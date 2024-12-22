import fs from 'fs';
import path from 'path';
import PdfParse from 'pdf-parse/lib/pdf-parse.js';

export default class PDFExtractor {
    static async extractTextsFromPdf(filePath) {
        const buffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));

        const { text } = await PdfParse(buffer);
        return { fileName, text };
    }
}
