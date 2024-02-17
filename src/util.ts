export async function getPlebbitLogger() {
    const Logger = await import("@plebbit/plebbit-logger");
    return Logger.default;
}
