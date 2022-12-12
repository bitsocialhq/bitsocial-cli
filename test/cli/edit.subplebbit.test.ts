import { expect, test } from "@oclif/test";
import { statusCodes, statusMessages } from "../../dist/src/api/response-statuses.js";
import defaults from "../../dist/src/common-utils/defaults.js";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { EditSubplebbitOptions } from "../../dist/src/cli/types.js";
import { exitStatuses } from "../../dist/src/cli/exit-codes.js";

describe("plebbit subplebbit edit", () => {
    const editOptions: EditSubplebbitOptions = {
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
        }
    };
    const editOptionsFlattend = DataObjectParser.untranspose(editOptions);
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply((_, requestBody) => {
                expect(requestBody).to.deep.equal(editOptions);
                return [statusCodes.SUCCESS_SUBPLEBBIT_EDITED, requestBody];
            })
            .post("/subplebbit/list")
            .reply(200, ["plebbit.eth"])
    )
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit edit", "plebbit.eth"].concat(Object.entries(editOptionsFlattend).map(([key, value]) => `--${key}=${value}`)))
        .it(`Parse edit options correctly`, (ctx) => {
            expect(ctx.stdout.trim()).to.equal("plebbit.eth");
        });

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply(() => [statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST])
            .post("/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit edit", "plebbit.eth"].concat(Object.entries(editOptionsFlattend).map(([key, value]) => `--${key}=${value}`)))
        .exit(exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
        .it(`Fails when subplebbit does not exist`);
});
