import { runCommand } from "@oclif/test";
import { expect } from "chai";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("plebbit subplebbit start", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();
    const startFake = sandbox.fake();

    before(() => {
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
    after(() => sandbox.restore());

    it(`Parses and submits addresses correctly`, async () => {
        const result = await runCommand(["subplebbit", "start", ...addresses], process.cwd());
        // Validate calls to start here
        expect(startFake.callCount).to.equal(addresses.length);

        // Validate outputs
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).to.deep.equal(addresses);
        expect(result.error).to.be.undefined;
    });
});
