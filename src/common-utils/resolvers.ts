import { BsoResolver } from "@bitsocial/bso-resolver";

const DEFAULT_PROVIDERS = ["viem", "https://ethrpc.xyz"];

export function createBsoResolvers(providers?: string[], dataPath?: string): BsoResolver[] {
    const resolverProviders = providers && providers.length > 0 ? providers : DEFAULT_PROVIDERS;
    return resolverProviders.map((provider) => new BsoResolver({ key: `bso-${provider}`, provider, dataPath }));
}
