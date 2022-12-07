import { expect, test } from "@oclif/test";
import { statusCodes } from "../../dist/src/api/response-statuses.js";
import { CreateSubplebbitOptions } from "../../src/cli/types.js";
import defaults from "../../dist/src/common-utils/defaults.js";
import signers from "../fixtures/signers";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";

describe("plebbit subplebbit create", () => {
    const createOptions: CreateSubplebbitOptions = {
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
    const createOptionsFlattened = DataObjectParser.untranspose(createOptions);
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/create")
            .reply((_, requestBody) => [statusCodes.SUCCESS_SUBPLEBBIT_CREATED, { address: signers[0]?.address, ...createOptions }])
            .post(`/subplebbit/start?address=${signers[0]!.address}`)
            .reply((_, requestBody) => [statusCodes.SUCCESS_SUBPLEBBIT_STARTED, requestBody])

            .post("/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit create"].concat(Object.entries(createOptionsFlattened).map(([key, value]) => `--${key}=${value}`)))
        .it(`Parse create options correctly`, (ctx) => {
            expect(JSON.parse(ctx.stdout)).to.deep.equal({ ...createOptions, address: signers[0]!.address });
        });
        });
});
