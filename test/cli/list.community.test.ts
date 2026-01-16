import { runCommand } from "@oclif/test";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community list", () => {
    const sandbox = Sinon.createSandbox();
    const fakeCommunities = ["plebbit1.eth", "plebbit2.eth"];

    beforeAll(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            subplebbits: fakeCommunities,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => sandbox.resetHistory());
    afterAll(() => sandbox.restore());

    it(`-q Outputs only community addresses`, async () => {
        const result = await runCommand("community list -q", process.cwd());
        expect(result.error).toBeUndefined();
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).toEqual(fakeCommunities);
    });
});
