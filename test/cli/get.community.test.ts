import { runCommand } from "@oclif/test";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community get", () => {
    const sandbox = Sinon.createSandbox();
    const fakeCommunity = {
        address: "plebbit.eth",
        title: "Plebbit",
        posts: [{ cid: "post1" }, { cid: "post2" }],
        updatedAt: 1234
    };

    const getSubplebbitFake = sandbox.fake.resolves(fakeCommunity);
    const destroyFake = sandbox.fake();

    beforeAll(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            getSubplebbit: getSubplebbitFake,
            destroy: destroyFake
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => {
        getSubplebbitFake.resetHistory();
        destroyFake.resetHistory();
    });

    afterAll(() => sandbox.restore());

    it("Outputs community json and keeps posts first", async () => {
        const result = await runCommand("community get plebbit.eth", process.cwd(), { stripAnsi: true });

        expect(result.error).toBeUndefined();
        expect(getSubplebbitFake.calledOnceWith({ address: "plebbit.eth" })).toBe(true);
        expect(destroyFake.calledOnce).toBe(true);

        const output = result.stdout.trim();
        const parsed = JSON.parse(output);
        expect(parsed).toEqual(fakeCommunity);

        const postsIndex = output.indexOf('"posts"');
        const addressIndex = output.indexOf('"address"');
        expect(postsIndex).toBeGreaterThan(-1);
        expect(addressIndex).toBeGreaterThan(-1);
        expect(postsIndex).toBeLessThan(addressIndex);
    });
});
