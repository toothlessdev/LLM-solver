export default async () => {
    await (await import('./openai.js')).default();
    await (await import('./chromadb.js')).default();
    await (await import('./middleware.js')).default();
    await (await import('./pipeline.js')).default();
};
