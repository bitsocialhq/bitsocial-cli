import { runCommand } from "@oclif/test";
import { expect } from "chai";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community list", () => {
    const sandbox = Sinon.createSandbox();
    const fakeCommunities = ["plebbit1.eth", "plebbit2.eth"];

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            subplebbits: fakeCommunities,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => sandbox.resetHistory());
    after(() => sandbox.restore());

    it(`-q Outputs only community addresses`, async () => {
        const result = await runCommand("community list -q", process.cwd());
        expect(result.error).to.be.undefined;
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).to.deep.equal(fakeCommunities);
    });
});
