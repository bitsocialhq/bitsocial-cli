import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { clearPkcRpcConnectOverride, setPkcRpcConnectOverride } from "../helpers/pkc-test-overrides.js";
import { runCliCommand } from "../helpers/run-cli.js";

describe("bitsocial community start", () => {
    const addresses = ["plebbit.bso", "plebbit2.bso"];
    const sandbox = Sinon.createSandbox();
    const startFake = sandbox.fake();

    beforeAll(() => {
        const pkcInstanceFake = sandbox.fake.resolves({
            createCommunity: () => ({
                start: startFake
            }),
            destroy: () => {}
        });

        setPkcRpcConnectOverride(pkcInstanceFake);
    });

    afterEach(() => startFake.resetHistory());
    afterAll(() => {
        clearPkcRpcConnectOverride();
        sandbox.restore();
    });

    it(`Parses and submits addresses correctly`, async () => {
        const { result, stdout } = await runCliCommand(["community", "start", ...addresses]);
        // Validate calls to start here
        expect(startFake.callCount).toBe(addresses.length);

        // Validate outputs (order may vary with concurrency > 1)
        const trimmedOutput: string[] = stdout.trim().split(/\r?\n/);
        expect(trimmedOutput).toEqual(expect.arrayContaining(addresses));
        expect(trimmedOutput).toHaveLength(addresses.length);
        expect(result.error).toBeUndefined();
    });

    it(`Respects --concurrency flag`, async () => {
        const { result, stdout } = await runCliCommand(["community", "start", ...addresses, "--concurrency", "1"]);
        expect(startFake.callCount).toBe(addresses.length);

        // With concurrency 1 (sequential), order is deterministic
        const trimmedOutput: string[] = stdout.trim().split(/\r?\n/);
        expect(trimmedOutput).toEqual(addresses);
        expect(result.error).toBeUndefined();
    });

    it(`Treats --concurrency 0 as sequential`, async () => {
        const { result, stdout } = await runCliCommand(["community", "start", ...addresses, "--concurrency", "0"]);
        expect(startFake.callCount).toBe(addresses.length);

        const trimmedOutput: string[] = stdout.trim().split(/\r?\n/);
        expect(trimmedOutput).toEqual(addresses);
        expect(result.error).toBeUndefined();
    });
});
