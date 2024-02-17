import { expect, test } from "@oclif/test";
import Sinon from "sinon";
import { BaseCommand } from "../../dist/cli/base-command";

describe("plebbit subplebbit stop", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();

    const stopFake = sandbox.fake();
    before(() => {


        const plebbitInstanceFake = sandbox.fake.resolves({
            plebbitRpcClient: {
                stopSubplebbit: stopFake
            },
            destroy: () => {}
        });

        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);

    });

    after(() => sandbox.restore());
    test.stdout()
        .command(["subplebbit stop"].concat(addresses))
        .it(`Parses and submits addresses correctly`, (ctx) => {
            // Validate calls to stop here
            expect(stopFake.callCount).to.equal(addresses.length);

            for (let i = 0; i < addresses.length; i++) {
                const addressToStop = <string>stopFake.args[i][0];
                expect(addressToStop).to.equal(addresses[i]);
            }

            // Validate outputs
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(addresses);
            expect(ctx.error).to.be.undefined;
        });
});
