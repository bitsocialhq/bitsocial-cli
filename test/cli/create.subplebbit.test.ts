import { expect, test, Config } from "@oclif/test";
import { statusCodes } from "../../src/api/responseStatuses.js";
import { CreateSubplebbitOptions } from "../../src/cli/types.js";
import defaults from "../../src/common-utils/defaults.js";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { exitStatuses } from "../../src/cli/exit-codes.js";

describe("plebbit subplebbit create", () => {
    const createOptions: CreateSubplebbitOptions = {
        signer: { privateKey: "testPrivateKey" },
        database: { connection: { filename: "testFilename" } },
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
    const createOptionsFlattened = DataObjectParser.untranspose(createOptions);
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/create")
            .reply((_, requestBody) => [statusCodes.SUCCESS_SUBPLEBBIT_CREATED, requestBody])
            .post("/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit create"].concat(Object.entries(createOptionsFlattened).map(([key, value]) => `--${key}=${value}`)))
        .it(`Parse create options correctly`, (ctx) => {
            expect(JSON.parse(ctx.stdout)).to.deep.equal(createOptions);
            expect(ctx.error).to.be.undefined;
        });

    test.loadConfig({ root: process.cwd() })
        .nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
            api.post("/subplebbit/list").replyWithError("Any error would suffice here")
        )
        .command(["subplebbit create"])
        .exit(exitStatuses.ERROR_DAEMON_IS_DOWN)
        .it(`Fails when daemon is down`);
    // Test: show error
    // Test: Show correct output
});
