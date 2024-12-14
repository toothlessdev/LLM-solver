export default async () => {
    (await import("./middleware.js")).default();
    (await import("./pipeline.js")).default();
};
