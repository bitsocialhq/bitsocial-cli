import { expect, test } from "@oclif/test";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command";

describe("plebbit subplebbit start", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();
    const startFake = sandbox.fake();

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            plebbitRpcClient: {
                startSubplebbit: startFake
            },
            destroy: () => {}
        });

        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    after(() => sandbox.restore());
    test.stdout()
        .command(["subplebbit start"].concat(addresses))
        .it(`Parses and submits addresses correctly`, (ctx) => {
            // Validate calls to start here
            expect(startFake.callCount).to.equal(addresses.length);

            for (let i = 0; i < addresses.length; i++) {
                const addressToStart = <string>startFake.args[i][0];
                expect(addressToStart).to.equal(addresses[i]);
            }

            // Validate outputs
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(addresses);
            expect(ctx.error).to.be.undefined;
        });
});
