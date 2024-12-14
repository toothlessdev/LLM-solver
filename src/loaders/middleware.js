import { RetrieveAssetsMiddleware } from '../middlewares/RetrieveAssetsMiddleware.js';
import { RetrieveContextMiddleware } from '../middlewares/RetrieveContextMiddleware.js';
import { ExtractPDFMiddleware } from '../middlewares/ExtractPDFMiddleware.js';

import { Container } from 'typedi';

export default async () => {
    const middlewares = [
        new RetrieveAssetsMiddleware(),
        new ExtractPDFMiddleware(),
        new RetrieveContextMiddleware(),
    ];

    Container.set('middlewares', middlewares);
};
