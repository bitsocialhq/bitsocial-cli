import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { clearPkcRpcConnectOverride, setPkcRpcConnectOverride } from "../helpers/pkc-test-overrides.js";
import { runCliCommand } from "../helpers/run-cli.js";

describe("bitsocial community list", () => {
    const sandbox = Sinon.createSandbox();
    const fakeCommunities = ["plebbit1.bso", "plebbit2.bso"];

    beforeAll(() => {
        const pkcInstanceFake = sandbox.fake.resolves({
            communities: fakeCommunities,
            destroy: () => {}
        });
        setPkcRpcConnectOverride(pkcInstanceFake);
    });

    afterEach(() => sandbox.resetHistory());
    afterAll(() => {
        clearPkcRpcConnectOverride();
        sandbox.restore();
    });

    it(`-q Outputs only community addresses`, async () => {
        const { result, stdout } = await runCliCommand("community list -q");
        expect(result.error).toBeUndefined();
        const trimmedOutput: string[] = stdout.trim().split("\n");
        expect(trimmedOutput).toEqual(fakeCommunities);
    });
});
