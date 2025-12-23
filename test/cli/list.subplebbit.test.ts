import { runCommand } from "@oclif/test";
import { expect } from "chai";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command";

describe("plebbit subplebbit list", () => {
    const sandbox = Sinon.createSandbox();
    const fakeSubplebbits = ["plebbit1.eth", "plebbit2.eth"];

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            subplebbits: fakeSubplebbits,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => sandbox.resetHistory());
    after(() => sandbox.restore());

    it(`-q Outputs only subplebbit addresses`, async () => {
        const result = await runCommand("subplebbit list -q");
        expect(result.error).to.be.undefined;
        const trimmedOutput: string[] = result.stdout.trim().split("\n");
        expect(trimmedOutput).to.deep.equal(fakeSubplebbits);
    });
});
