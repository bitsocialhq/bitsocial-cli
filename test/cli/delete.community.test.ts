import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import Sinon from "sinon";
import { clearPkcRpcConnectOverride, setPkcRpcConnectOverride } from "../helpers/pkc-test-overrides.js";
import { runCliCommand } from "../helpers/run-cli.js";

describe("bitsocial community delete", () => {
    const addresses = ["plebbit.bso", "plebbit2.bso"];
    const sandbox = Sinon.createSandbox();

    const deleteFake = sandbox.fake();
    beforeAll(() => {
        const pkcInstanceFake = sandbox.fake.resolves({
            createCommunity: () => ({
                delete: deleteFake
            }),
            destroy: () => {}
        });

        setPkcRpcConnectOverride(pkcInstanceFake);
    });

    afterEach(() => deleteFake.resetHistory());
    afterAll(() => {
        clearPkcRpcConnectOverride();
        sandbox.restore();
    });

    it(`Parses and submits addresses correctly`, async () => {
        const { result, stdout } = await runCliCommand(["community", "delete", ...addresses]);
        // Validate calls to delete here
        expect(deleteFake.callCount).toBe(addresses.length);

        // Validate outputs
        const trimmedOutput: string[] = stdout.trim().split(/\r?\n/);
        expect(trimmedOutput).toEqual(addresses);
        expect(result.error).toBeUndefined();
    });
});
