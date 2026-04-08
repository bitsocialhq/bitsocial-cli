import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { clearPkcRpcConnectOverride, setPkcRpcConnectOverride } from "../helpers/pkc-test-overrides.js";
import { runCliCommand } from "../helpers/run-cli.js";

describe("bitsocial community get", () => {
    const sandbox = Sinon.createSandbox();
    const fakeCommunity = {
        address: "plebbit.bso",
        title: "Plebbit",
        posts: [{ cid: "post1" }, { cid: "post2" }],
        updatedAt: 1234
    };

    const getCommunityFake = sandbox.fake.resolves(fakeCommunity);
    const destroyFake = sandbox.fake();

    beforeAll(() => {
        const pkcInstanceFake = sandbox.fake.resolves({
            getCommunity: getCommunityFake,
            destroy: destroyFake
        });
        setPkcRpcConnectOverride(pkcInstanceFake);
    });

    afterEach(() => {
        getCommunityFake.resetHistory();
        destroyFake.resetHistory();
    });

    afterAll(() => {
        clearPkcRpcConnectOverride();
        sandbox.restore();
    });

    it("Outputs community json and keeps posts first", async () => {
        const { result, stdout } = await runCliCommand("community get plebbit.bso");

        expect(result.error).toBeUndefined();
        expect(getCommunityFake.calledOnceWith({ address: "plebbit.bso" })).toBe(true);
        expect(destroyFake.calledOnce).toBe(true);

        const output = stdout.trim();
        const parsed = JSON.parse(output);
        expect(parsed).toEqual(fakeCommunity);

        const postsIndex = output.indexOf('"posts"');
        const addressIndex = output.indexOf('"address"');
        expect(postsIndex).toBeGreaterThan(-1);
        expect(addressIndex).toBeGreaterThan(-1);
        expect(postsIndex).toBeLessThan(addressIndex);
    });
});
