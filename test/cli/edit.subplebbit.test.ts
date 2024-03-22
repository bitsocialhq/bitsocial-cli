import { expect, test } from "@oclif/test";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import Sinon from "sinon";
//@ts-expect-error
import type { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import { currentSubProps, firstLevelPropsToEdit, objectPropsToEdit, rulesToEdit } from "../fixtures/subplebbitForEditFixture";
import { BaseCommand } from "../../dist/cli/base-command";

const createEditCommand = (editOptions: SubplebbitEditOptions) => {
    let command = ["subplebbit edit", "plebbit.eth"];
    const editOptionsFlattend: Record<string, string> = DataObjectParser.untranspose(editOptions);
    for (const [key, value] of Object.entries(editOptionsFlattend)) command = command.concat(`--${key}`, value);
    console.log("Final command: ", command.join(" "));
    return command;
};

describe("plebbit subplebbit edit", () => {
    const sandbox = Sinon.createSandbox();

    const editFake = sandbox.fake();

    before(() => {
        const plebbitInstanceFake = sandbox.fake.resolves({
            createSubplebbit: sandbox.fake.resolves({ edit: editFake, ...currentSubProps, toJSONInternalRpc: () => currentSubProps }),
            listSubplebbits: sandbox.fake.resolves(["plebbit.eth"]),
            destroy: () => {}
        });
        //@ts-expect-error
        sandbox.replace(BaseCommand.prototype, "_connectToPlebbitRpc", plebbitInstanceFake);
    });

    afterEach(() => editFake.resetHistory());
    after(() => {
        sandbox.restore();
    });

    test.command(createEditCommand(firstLevelPropsToEdit)).it(`Parse first level edit options correctly`, () => {
        expect(editFake.calledOnce).to.be.true;
        //@ts-expect-error
        const parsedArgs = <SubplebbitEditOptions>editFake.firstArg;
        for (const editKey of Object.keys(firstLevelPropsToEdit)) {
            //@ts-expect-error
            expect(JSON.stringify(parsedArgs[editKey])).to.equal(JSON.stringify(firstLevelPropsToEdit[editKey]));
        }
    });

    test.command(createEditCommand(rulesToEdit)).it(`Parses rules edit options correctly`, () => {
        expect(editFake.calledOnce).to.be.true;
        //@ts-expect-error
        const parsedArgs = <SubplebbitEditOptions>editFake.firstArg;
        const newRules = <string[]>rulesToEdit["rules"];
        for (let i = 0; i < newRules!.length; i++) {
            if (newRules[i] === undefined) {
                // The subplebbit edit should fallback to current state
                //@ts-expect-error
                expect(parsedArgs!.rules[i]).to.equal(currentSubProps!.rules[i]);
            }
            //@ts-expect-error
            else expect(parsedArgs.rules[i]).to.equal(newRules[i]);
        }
    });

    test.command(createEditCommand(objectPropsToEdit)).it(`Parses nested props edit options correctly`, async () => {
        expect(editFake.calledOnce).to.be.true;
        //@ts-expect-error
        const parsedArgs = <SubplebbitEditOptions>editFake.firstArg;

        // test for settings.challenges here
        expect(parsedArgs.settings?.challenges![0]).to.deep.equal(currentSubProps.settings?.challenges![0]); // should not change since we're only modifying challenge[1]
        expect(parsedArgs.settings?.challenges![1]).to.deep.equal(objectPropsToEdit.settings?.challenges![1]); // should add new challenge

        expect(parsedArgs.settings!.fetchThumbnailUrls).to.equal(objectPropsToEdit.settings!.fetchThumbnailUrls);
        expect(parsedArgs.settings!.fetchThumbnailUrlsProxyUrl).to.equal(currentSubProps.settings!.fetchThumbnailUrlsProxyUrl); // we have explicitly left it without editing

        // test for roles here
        expect(parsedArgs.roles!["rinse12.eth"]).to.be.null; // we have explicitly removed this mod
        expect(parsedArgs.roles!["esteban.eth"]).to.deep.equal(objectPropsToEdit.roles["esteban.eth"]);

        // test for features here
        expect(parsedArgs.features).to.deep.equal(objectPropsToEdit.features);

        // test for suggested here
        expect(parsedArgs.suggested).to.deep.equal(objectPropsToEdit.suggested);
    });
});
