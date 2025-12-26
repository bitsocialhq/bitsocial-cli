import { runCommand } from "@oclif/test";
import { expect } from "chai";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("plebbit subplebbit get", () => {
    const sandbox = Sinon.createSandbox();
    const fakeSubplebbit = {
        address: "plebbit.eth",
        title: "Plebbit",
        posts: [{ cid: "post1" }, { cid: "post2" }],
        updatedAt: 1234
    };

    const getSubplebbitFake = sandbox.fake.resolves(fakeSubplebbit);
    const destroyFake = sandbox.fake();

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            getSubplebbit: getSubplebbitFake,
            destroy: destroyFake
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => {
        getSubplebbitFake.resetHistory();
        destroyFake.resetHistory();
    });

    after(() => sandbox.restore());

    it("Outputs subplebbit json and keeps posts first", async () => {
        const result = await runCommand("subplebbit get plebbit.eth", process.cwd(), { stripAnsi: true });

        expect(result.error).to.be.undefined;
        expect(getSubplebbitFake.calledOnceWith({ address: "plebbit.eth" })).to.be.true;
        expect(destroyFake.calledOnce).to.be.true;

        const output = result.stdout.trim();
        const parsed = JSON.parse(output);
        expect(parsed).to.deep.equal(fakeSubplebbit);

        const postsIndex = output.indexOf('"posts"');
        const addressIndex = output.indexOf('"address"');
        expect(postsIndex).to.be.greaterThan(-1);
        expect(addressIndex).to.be.greaterThan(-1);
        expect(postsIndex).to.be.lessThan(addressIndex);
    });
});
