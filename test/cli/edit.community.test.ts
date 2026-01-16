import { runCommand } from "@oclif/test";
import { expect } from "chai";
//@ts-ignore
import Sinon from "sinon";
import type { SubplebbitEditOptions } from "../types/communityTypes.js";
import { currentSubProps } from "../fixtures/communityForEditFixture.js";
import { BaseCommand } from "../../dist/cli/base-command.js";

describe("bitsocial community edit", () => {
    const sandbox = Sinon.createSandbox();

    const editFake = sandbox.fake();

    const runEditCommand = (args: string) => runCommand(args, process.cwd(), { stripAnsi: true });

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: sandbox.fake.resolves({
                edit: editFake,
                ...currentSubProps,
                toJSONInternalRpc: () => JSON.parse(JSON.stringify(currentSubProps))
            }),
            subplebbits: ["plebbit.eth"],
            destroy: () => {}
        });
        sandbox.replace(BaseCommand.prototype as any, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => editFake.resetHistory());
    after(() => {
        sandbox.restore();
    });

    // passing string flag

    it(`Can pass a string value to a first level flag`, async () => {
        const result = await runEditCommand(
            'community edit plebbit.eth --title "new Title" --address newAddress.eth --description "new Description" --pubsubTopic "new Pubsub topic"'
        );
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const parsedArgs = <SubplebbitEditOptions>editFake.args[0][0];
        expect(parsedArgs.title).to.equal("new Title");
        expect(parsedArgs.description).to.equal("new Description");
        expect(parsedArgs.pubsubTopic).to.equal("new Pubsub topic");
        expect(parsedArgs.address).to.equal("newAddress.eth");
    });

    it(`Can set a string value to a nested prop`, async () => {
        const result = await runEditCommand('community edit plebbit.eth --suggested.secondaryColor "new suggested.secondaryColor"');
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        expect(mergedEditOptions.suggested!.secondaryColor).to.equal("new suggested.secondaryColor");
    });

    // passing array flags

    it(`Can pass flag to set specific indices in an array`, async () => {
        const result = await runEditCommand(
            'community edit plebbit.eth --rules[2] "User input Rule 3" --rules[3] "User input Rule 4"'
        );
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const argsOfSubEdit = <SubplebbitEditOptions>editFake.args[0][0];
        const mergedRules = <string[]>argsOfSubEdit["rules"]; // merging the input from user and current state of sub

        expect(mergedRules).to.deep.equal([
            currentSubProps.rules?.[0],
            currentSubProps.rules?.[1],
            "User input Rule 3",
            "User input Rule 4"
        ]);
    });

    it("A single flag name being passed multiple times equates to an array", async () => {
        const result = await runEditCommand('community edit plebbit.eth --rules "New Rule1 random" --rules "New Rule2 random"');
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        const mergedRulesAfterEdit = <string[]>mergedEditOptions["rules"];
        expect(mergedRulesAfterEdit).to.deep.equal([
            "New Rule1 random",
            "New Rule2 random",
            currentSubProps.rules![2],
            currentSubProps.rules![3]
        ]);
    });

    it(`Can pass nested array elements in a nested field`, async () => {
        const result = await runEditCommand(
            'community edit plebbit.eth --settings.challenges[1].options.question "What is the password" --settings.challenges[1].options.answer "The password"'
        );
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        expect(mergedEditOptions.settings).to.be.a("object");

        // test for settings.challenges here
        expect(mergedEditOptions.settings?.challenges![0]).to.deep.equal(currentSubProps.settings?.challenges![0]); // should not change since we're only modifying challenge[1]

        // should add new challenge
        expect(mergedEditOptions.settings?.challenges![1]).to.deep.equal({
            options: { question: "What is the password", answer: "The password" }
        });
    });

    // TODO Add a test for trying to edit a non local sub

    // Setting boolean fields

    it(`Can set a boolean field to true on first level (implicit)`, async () => {
        const result = await runEditCommand("community edit plebbit.eth --randomBooleanField");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        const randomBoolean = (mergedEditOptions as Record<string, unknown>)["randomBooleanField"];
        expect(randomBoolean).to.be.true;
    });

    it(`Can set a boolean field to true on first level (explicit)`, async () => {
        const result = await runEditCommand("community edit plebbit.eth --randomBooleanField=true");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        const randomBoolean = (mergedEditOptions as Record<string, unknown>)["randomBooleanField"];
        expect(randomBoolean).to.be.true;
    });

    it("Can parse boolean=true in nested props correctly (implicit)", async () => {
        const result = await runEditCommand("community edit plebbit.eth --settings.fetchThumbnailUrls");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        expect(mergedEditOptions.settings).to.be.a("object");
        expect(mergedEditOptions.settings!.fetchThumbnailUrls).to.be.true;
    });

    it("Can parse boolean=true in nested props correctly (explicit)", async () => {
        const result = await runEditCommand("community edit plebbit.eth --settings.fetchThumbnailUrls=true");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        expect(mergedEditOptions.settings).to.be.a("object");
        expect(mergedEditOptions.settings!.fetchThumbnailUrls).to.be.true;
    });

    // setting boolean = false

    it(`Can set a boolean field to false on first level (explicit)`, async () => {
        const result = await runEditCommand("community edit plebbit.eth --randomBooleanField=false");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        const randomBoolean = (mergedEditOptions as Record<string, unknown>)["randomBooleanField"];
        expect(randomBoolean).to.be.false;
    });

    it("Can parse boolean=false in nested props correctly (explicit)", async () => {
        const result = await runEditCommand("community edit plebbit.eth --settings.fetchThumbnailUrls=false");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];
        expect(mergedEditOptions.settings).to.be.a("object");
        expect(mergedEditOptions.settings!.fetchThumbnailUrls).to.be.false;
    });

    // Setting null

    it(`Can set null as a value to a nested flag`, async () => {
        const result = await runEditCommand("community edit plebbit.eth --roles['rinse12.eth'] null");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];

        expect(mergedEditOptions.roles!["rinse12.eth"]).to.be.null;
        expect(mergedEditOptions.roles!["estebanabaroa.eth"]).to.deep.equal(currentSubProps.roles!["estebanabaroa.eth"]);
    });

    it(`Can set null as a value to a flag`, async () => {
        const result = await runEditCommand("community edit plebbit.eth --nullField] null");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];

        const nullField = (mergedEditOptions as Record<string, unknown>)["nullField"];
        expect(nullField).to.be.null;
    });

    it("Can set a null to a whole object", async () => {
        const result = await runEditCommand("community edit plebbit.eth --settings null");
        expect(result.error).to.be.undefined;
        expect(editFake.calledOnce).to.be.true;
        const mergedEditOptions = <SubplebbitEditOptions>editFake.args[0][0];

        expect(mergedEditOptions.settings).to.be.null;
    });
});
