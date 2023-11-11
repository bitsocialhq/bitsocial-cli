import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import { expect, test } from "@oclif/test";
import signers from "../fixtures/signers";
import lodash from "lodash";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import Sinon from "sinon";
import { CreateSubplebbitOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import { CliCreateSubplebbitOptions } from "../../src/cli/types.js";

describe("plebbit subplebbit create", () => {
    const sandbox = Sinon.createSandbox();

    const startFake = sandbox.fake();
    let plebbitCreateStub: Sinon.SinonSpy;

    before(() => {
        plebbitCreateStub = sandbox.replace(
            Plebbit.prototype,
            "createSubplebbit",
            sandbox.fake.resolves({ address: signers[0]!.address, start: startFake })
        );
    });
    after(() => sandbox.restore());

    const cliCreateOptions: CliCreateSubplebbitOptions = {
        privateKeyPath: "test/fixtures/sub_0_private_key.pem",
        title: "testTitle",
        description: "testDescription",
        pubsubTopic: "testPubsubTopic",
        suggested: {
            primaryColor: "testPrimaryColor",
            secondaryColor: "testSecondaryColor",
            avatarUrl: "http://localhost:8080/avatar.png",
            bannerUrl: "http://localhost:8080/banner.png",
            backgroundUrl: "http://localhost:8080/background.png",
            language: "testLanguage"
        }
    };
    const cliCreateOptionsFlattened = DataObjectParser.untranspose(cliCreateOptions);

    test.stdout()
        .command(["subplebbit create"].concat(Object.entries(cliCreateOptionsFlattened).map(([key, value]) => `--${key}=${value}`)))
        .it(`Parse create options correctly`, (ctx) => {
            expect(plebbitCreateStub.calledOnce).to.be.true;
            //@ts-expect-error
            const parsedArgs = <CreateSubplebbitOptions>plebbitCreateStub.firstArg;
            // PrivateKeyPath will be processed to signer
            expect(parsedArgs.signer).to.be.a("object");
            expect(parsedArgs.signer!.privateKey).be.a("string");
            expect(parsedArgs!.signer!.type).to.equal("ed25519");
            // Validate rest of args now
            for (const createKey of Object.keys(lodash.omit(cliCreateOptions, "privateKeyPath"))) {
                //@ts-expect-error
                expect(JSON.stringify(parsedArgs[createKey])).to.equal(JSON.stringify(cliCreateOptions[createKey]));
            }
            const output = ctx.stdout.trim();
            expect(output).to.equal(signers[0]!.address);
        });

    it(`Starts subplebbit after creation`, () => {
        expect(startFake.calledOnce).to.be.true;
    });
});
