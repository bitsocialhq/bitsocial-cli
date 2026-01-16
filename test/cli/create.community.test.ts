import { runCommand } from "@oclif/test";
import { describe, it, beforeAll, afterAll, afterEach, expect } from "vitest";
import signers from "../fixtures/signers.js";
import Sinon from "sinon";
import type { CreateSubplebbitOptions } from "../types/communityTypes.js";

import { BaseCommand } from "../../dist/cli/base-command.js";

const cliCreateOptions = {
    privateKeyPath: "test/fixtures/community_0_private_key.pem",
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

describe("bitsocial community create", () => {
    const sandbox = Sinon.createSandbox();

    const startFake = sandbox.fake();
    const plebbitCreateStub = sandbox.fake.resolves({ address: signers[0]!.address, start: startFake, started: false });
    const runCreateCommand = (args: string) => runCommand(args, process.cwd(), { stripAnsi: true });
    beforeAll(async () => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: plebbitCreateStub,
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => {
        plebbitCreateStub.resetHistory();
        startFake.resetHistory();
    });

    afterAll(() => sandbox.restore());

    it(`Parses minimal create options correctly`, async () => {
        const result = await runCreateCommand("community create --description testDescription");
        expect(result.error).toBeUndefined();
        expect(plebbitCreateStub.calledOnce).toBe(true);
        const parsedArgs = <CreateSubplebbitOptions>plebbitCreateStub.args[0][0];
        // PrivateKeyPath will be processed to signer
        expect(parsedArgs.description).toBe("testDescription");
        expect(startFake.calledOnce).toBe(true);
    });

    it(`Parses full create options correctly`, async () => {
        const result = await runCreateCommand(
            'community create --privateKeyPath test/fixtures/community_0_private_key.pem --title "testTitle" --description "testDescription" --suggested.primaryColor testPrimaryColor --suggested.secondaryColor testSecondaryColor --suggested.avatarUrl http://localhost:8080/avatar.png --suggested.bannerUrl http://localhost:8080/banner.png --suggested.backgroundUrl http://localhost:8080/background.png --suggested.language testLanguage'
        );
        expect(result.error).toBeUndefined();
        expect(plebbitCreateStub.calledOnce).toBe(true);
        const parsedArgs = <CreateSubplebbitOptions>plebbitCreateStub.args[0][0];
        // PrivateKeyPath will be processed to signer
        expect(parsedArgs.title).toBe(cliCreateOptions.title);
        expect(parsedArgs.description).toBe(cliCreateOptions.description);
        expect(parsedArgs.suggested).toEqual(cliCreateOptions.suggested);
        if (!("signer" in parsedArgs) || !parsedArgs.signer) throw Error("signer should be defined");

        const signer = parsedArgs.signer;
        expect(typeof signer).toBe("object");
        expect(signer).not.toBeNull();

        if ("privateKey" in (signer as Record<string, unknown>)) expect(typeof (signer as { privateKey: unknown }).privateKey).toBe("string");
        else expect(typeof (signer as { address: unknown }).address).toBe("string");

        expect((signer as { type: unknown }).type).toBe("ed25519");
        expect(startFake.calledOnce).toBe(true);
    });
});
