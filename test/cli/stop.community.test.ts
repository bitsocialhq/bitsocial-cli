import { runCommand } from "@oclif/test";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community stop", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();

    const stopFake = sandbox.fake();
    beforeAll(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: () => ({
                stop: stopFake
            }),
            destroy: () => {}
        });

        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => stopFake.resetHistory());
    afterAll(() => sandbox.restore());

    it(`Parses and submits addresses correctly`, async () => {
        const result = await runCommand(["community", "stop", ...addresses], process.cwd());
        // Validate calls to stop here
        expect(stopFake.callCount).toBe(addresses.length);

        // Validate outputs
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).toEqual(addresses);
        expect(result.error).toBeUndefined();
    });
});
