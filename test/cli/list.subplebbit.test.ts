import { expect, test } from "@oclif/test";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import Sinon from "sinon";

describe("plebbit subplebbit list", () => {
    const sandbox = Sinon.createSandbox();

    let listSubplebbitsFake: Sinon.SinonSpy;
    before(() => {
        listSubplebbitsFake = sandbox.fake.resolves(fakeSubplebbits);
        sandbox.replace(Plebbit.prototype, "listSubplebbits", listSubplebbitsFake);
    });

    after(() => sandbox.restore());
    const fakeSubplebbits = ["plebbit1.eth", "plebbit2.eth"];

    test.stdout()
        .command(["subplebbit list", "-q"])
        .it(`-q Outputs only subplebbit addresses`, (ctx) => {
            expect(listSubplebbitsFake.callCount).to.equal(2); // should call once to confirm connection, and second to print subplebbits
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(fakeSubplebbits);
        });
});
