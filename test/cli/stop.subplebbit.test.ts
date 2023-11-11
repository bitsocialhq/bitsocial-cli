import { expect, test } from "@oclif/test";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import Sinon from "sinon";
import PlebbitRpcClient from "@plebbit/plebbit-js/dist/node/clients/plebbit-rpc-client.js";

describe("plebbit subplebbit stop", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    const sandbox = Sinon.createSandbox();

    let stopFake: Sinon.SinonSpy;
    before(() => {
        stopFake = sandbox.fake();

        sandbox.replace(Plebbit.prototype, "createSubplebbit", sandbox.fake());

        sandbox.replace(PlebbitRpcClient.prototype, "stopSubplebbit", stopFake);
    });

    after(() => sandbox.restore());
    test.stdout()
        .command(["subplebbit stop"].concat(addresses))
        .it(`Parses and submits addresses correctly`, (ctx) => {
            // Validate calls to stop here
            expect(stopFake.callCount).to.equal(addresses.length);

            for (let i = 0; i < addresses.length; i++) {
                //@ts-expect-error
                const addressToStop = stopFake.args[i][0];
                expect(addressToStop).to.equal(addresses[i]);
            }

            // Validate outputs
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(addresses);
            expect(ctx.error).to.be.undefined;
        });
});
