import { expect, test } from "@oclif/test";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command";

describe("plebbit subplebbit list", () => {
    const sandbox = Sinon.createSandbox();
    const fakeSubplebbits = ["plebbit1.eth", "plebbit2.eth"];

    const listSubplebbitsFake = sandbox.fake.resolves(fakeSubplebbits);
    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            listSubplebbits: listSubplebbitsFake,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    after(() => sandbox.restore());

    test.stdout()
        .command(["subplebbit list", "-q"])
        .it(`-q Outputs only subplebbit addresses`, (ctx) => {
            expect(listSubplebbitsFake.callCount).to.equal(1);
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(fakeSubplebbits);
        });
});
