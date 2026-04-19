import { describe, it, expect, afterEach } from "vitest";
import { createBsoResolvers } from "../../dist/common-utils/resolvers.js";

describe("createBsoResolvers", () => {
    let resolvers: ReturnType<typeof createBsoResolvers> = [];

    afterEach(async () => {
        for (const r of resolvers) await r.destroy();
        resolvers = [];
    });

    it("creates resolvers with default providers when none specified", () => {
        resolvers = createBsoResolvers(undefined, "/tmp/test-data");
        expect(resolvers).toHaveLength(6);
        expect(resolvers[0].key).toBe("bso-https://eth.drpc.org");
        expect(resolvers[0].provider).toBe("https://eth.drpc.org");
        expect(resolvers[0].dataPath).toBe("/tmp/test-data");
        expect(resolvers[5].key).toBe("bso-https://eth-pokt.nodies.app");
        expect(resolvers[5].provider).toBe("https://eth-pokt.nodies.app");
    });

    it("creates resolvers with default providers when empty array passed", () => {
        resolvers = createBsoResolvers([], "/tmp/test-data");
        expect(resolvers).toHaveLength(6);
        expect(resolvers[0].provider).toBe("https://eth.drpc.org");
        expect(resolvers[5].provider).toBe("https://eth-pokt.nodies.app");
    });

    it("creates resolvers from custom provider list", () => {
        resolvers = createBsoResolvers(["https://mainnet.infura.io/v3/KEY"], "/tmp/test-data");
        expect(resolvers).toHaveLength(1);
        expect(resolvers[0].key).toBe("bso-https://mainnet.infura.io/v3/KEY");
        expect(resolvers[0].provider).toBe("https://mainnet.infura.io/v3/KEY");
    });

    it("canResolve returns true for .bso and .eth names", () => {
        resolvers = createBsoResolvers();
        expect(resolvers[0].canResolve({ name: "example.bso" })).toBe(true);
        expect(resolvers[0].canResolve({ name: "example.eth" })).toBe(true);
        expect(resolvers[0].canResolve({ name: "example.com" })).toBe(false);
        expect(resolvers[0].canResolve({ name: "example" })).toBe(false);
    });

    it("passes dataPath to resolvers for SQLite caching", () => {
        resolvers = createBsoResolvers(["viem"], "/my/data/path");
        expect(resolvers[0].dataPath).toBe("/my/data/path");
    });

    it("works without dataPath", () => {
        resolvers = createBsoResolvers(["viem"]);
        expect(resolvers[0].dataPath).toBeUndefined();
    });

    it("resolvers conform to the NameResolver interface expected by pkc-js", () => {
        resolvers = createBsoResolvers(["viem"], "/tmp/test-data");
        const resolver = resolvers[0];
        expect(typeof resolver.key).toBe("string");
        expect(typeof resolver.provider).toBe("string");
        expect(typeof resolver.canResolve).toBe("function");
        expect(typeof resolver.resolve).toBe("function");
    });
});

describe("daemon wiring: chainProviderUrls -> PKC nameResolvers", () => {
    let resolvers: ReturnType<typeof createBsoResolvers> = [];

    afterEach(async () => {
        for (const r of resolvers) await r.destroy();
        resolvers = [];
    });

    it("default chain provider URLs produce resolvers in pkcOptions.nameResolvers", () => {
        const chainProviderUrls = [
            "https://eth.drpc.org",
            "https://ethereum.publicnode.com",
            "https://ethereum-rpc.publicnode.com",
            "https://rpc.mevblocker.io",
            "https://1rpc.io/eth",
            "https://eth-pokt.nodies.app"
        ];
        const dataPath = "/tmp/test-data";

        resolvers = createBsoResolvers(chainProviderUrls, dataPath);
        const pkcOptions: Record<string, any> = { dataPath };
        pkcOptions.nameResolvers = [...(pkcOptions.nameResolvers || []), ...resolvers];

        expect(pkcOptions.nameResolvers).toHaveLength(6);
        expect(pkcOptions.nameResolvers[0].key).toBe("bso-https://eth.drpc.org");
        expect(pkcOptions.nameResolvers[0].provider).toBe("https://eth.drpc.org");
        expect(pkcOptions.nameResolvers[0].dataPath).toBe(dataPath);
        expect(pkcOptions.nameResolvers[5].key).toBe("bso-https://eth-pokt.nodies.app");
        expect(pkcOptions.nameResolvers[5].provider).toBe("https://eth-pokt.nodies.app");
        for (const resolver of pkcOptions.nameResolvers) {
            expect(resolver.canResolve({ name: "test.bso" })).toBe(true);
            expect(typeof resolver.resolve).toBe("function");
        }
    });

    it("custom chain provider URLs override defaults in pkcOptions.nameResolvers", () => {
        const chainProviderUrls = ["https://mainnet.infura.io/v3/KEY"];
        const dataPath = "/tmp/test-data";

        resolvers = createBsoResolvers(chainProviderUrls, dataPath);
        const pkcOptions: Record<string, any> = { dataPath };
        pkcOptions.nameResolvers = [...(pkcOptions.nameResolvers || []), ...resolvers];

        expect(pkcOptions.nameResolvers).toHaveLength(1);
        expect(pkcOptions.nameResolvers[0].key).toBe("bso-https://mainnet.infura.io/v3/KEY");
        expect(pkcOptions.nameResolvers[0].provider).toBe("https://mainnet.infura.io/v3/KEY");
    });

    it("resolvers are appended to existing nameResolvers without replacing them", () => {
        const existingResolver = { key: "existing", provider: "existing", canResolve: () => false, resolve: async () => undefined };
        resolvers = createBsoResolvers(["viem"], "/tmp/test-data");
        const pkcOptions: Record<string, any> = { nameResolvers: [existingResolver] };
        pkcOptions.nameResolvers = [...(pkcOptions.nameResolvers || []), ...resolvers];

        expect(pkcOptions.nameResolvers).toHaveLength(2);
        expect(pkcOptions.nameResolvers[0].key).toBe("existing");
        expect(pkcOptions.nameResolvers[1].key).toBe("bso-viem");
    });
});
