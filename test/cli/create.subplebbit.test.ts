import { test, expect } from "@oclif/test";
import signers from "../fixtures/signers";
import Sinon from "sinon";
//@ts-expect-error
import type { CreateSubplebbitOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import { CliCreateSubplebbitOptions } from "../../dist/cli/types.js";

import { BaseCommand } from "../../dist/cli/base-command";

const cliCreateOptions: CliCreateSubplebbitOptions = {
    privateKeyPath: "test/fixtures/sub_0_private_key.pem",
    title: "testTitle",
    description: "testDescription",
    suggested: {
        primaryColor: "testPrimaryColor",
        secondaryColor: "testSecondaryColor",
        avatarUrl: "http://localhost:8080/avatar.png",
        bannerUrl: "http://localhost:8080/banner.png",
        backgroundUrl: "http://localhost:8080/background.png",
        language: "testLanguage"
    }
};

describe("plebbit subplebbit create", () => {
    const sandbox = Sinon.createSandbox();

    const startFake = sandbox.fake();
    const plebbitCreateStub = sandbox.fake.resolves({ address: signers[0]!.address, start: startFake, started: false });
    before(async () => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: plebbitCreateStub,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });
    after(() => sandbox.restore());

    test.stdout()
        .command([
            "subplebbit create",
            "--privateKeyPath",
            "test/fixtures/sub_0_private_key.pem",
            "--title",
            "testTitle",
            "--description",
            "testDescription",
            "--suggested.primaryColor",
            "testPrimaryColor",
            "--suggested.secondaryColor",
            "testSecondaryColor",
            "--suggested.avatarUrl",
            "http://localhost:8080/avatar.png",
            "--suggested.bannerUrl",
            "http://localhost:8080/banner.png",
            "--suggested.backgroundUrl",
            "http://localhost:8080/background.png",
            "--suggested.language",
            "testLanguage"
        ])
        .it(`Parse create options correctly`, (ctx) => {
            expect(plebbitCreateStub.calledOnce).to.be.true;
            const parsedArgs = <CreateSubplebbitOptions>plebbitCreateStub.args[0][0];
            // PrivateKeyPath will be processed to signer
            expect(parsedArgs.title).to.equal(cliCreateOptions.title);
            expect(parsedArgs.description).to.equal(cliCreateOptions.description);
            expect(parsedArgs.suggested).to.deep.equal(cliCreateOptions.suggested);

            expect(parsedArgs.signer).to.be.a("object");
            expect(parsedArgs.signer!.privateKey).to.be.a("string");
            expect(parsedArgs!.signer!.type).to.equal("ed25519");
        });

    it(`Starts subplebbit after creation`, () => {
        expect(startFake.calledOnce).to.be.true;
    });
});
