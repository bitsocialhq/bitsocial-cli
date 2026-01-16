import { runCommand } from "@oclif/test";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community start", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();
    const startFake = sandbox.fake();

    beforeAll(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: () => ({
                start: startFake
            }),
            destroy: () => {}
        });

        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => startFake.resetHistory());
    afterAll(() => sandbox.restore());

    it(`Parses and submits addresses correctly`, async () => {
        const result = await runCommand(["community", "start", ...addresses], process.cwd());
        // Validate calls to start here
        expect(startFake.callCount).toBe(addresses.length);

        // Validate outputs
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).toEqual(addresses);
        expect(result.error).toBeUndefined();
    });
});
