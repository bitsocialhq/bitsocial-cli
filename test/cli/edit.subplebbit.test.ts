import { expect, test } from "@oclif/test";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import { CliEditSubplebbitOptions } from "../../src/cli/types.js";
import Sinon from "sinon";
import { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

describe("plebbit subplebbit edit", () => {
    const sandbox = Sinon.createSandbox();

    const editFake = sandbox.fake();

    before(() => {
        sandbox.replace(Plebbit.prototype, "createSubplebbit", sandbox.fake.resolves({ edit: editFake }));
    });
    after(() => {
        sandbox.restore();
    });

    const editOptions: Required<CliEditSubplebbitOptions> = {
        title: "testEditTitle",
        description: "testEditDescription",
        pubsubTopic: "testEditTopic",
        suggested: {
            primaryColor: "testEditPrimaryColor",
            secondaryColor: "testEditSecondaryColor",
            avatarUrl: "http://localhost:8080/avatar2.png",
            bannerUrl: "http://localhost:8080/banner2.png",
            backgroundUrl: "http://localhost:8080/background2.png",
            language: "testEditLanguage"
        },
        address: "newaddress.eth"
    };
    const editOptionsFlattend = DataObjectParser.untranspose(editOptions);
    test.command(
        ["subplebbit edit", "plebbit.eth"].concat(Object.entries(editOptionsFlattend).map(([key, value]) => `--${key}=${value}`))
    ).it(`Parse edit options correctly`, () => {
        expect(editFake.calledOnce).to.be.true;
        //@ts-expect-error
        const parsedArgs = <SubplebbitEditOptions>editFake.firstArg;
        for (const editKey of Object.keys(editOptions)) {
            //@ts-expect-error
            expect(JSON.stringify(parsedArgs[editKey])).to.equal(JSON.stringify(editOptions[editKey]));
        }
    });
});
