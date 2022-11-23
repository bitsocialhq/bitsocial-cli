import { expect, test } from "@oclif/test";
import { statusCodes, statusMessages } from "../../src/api/response-statuses.js";
import { exitStatuses } from "../../src/cli/exit-codes.js";
import defaults from "../../src/common-utils/defaults.js";

describe("plebbit subplebbit start", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}`, (api) =>
        api
            .post("/api/v0/subplebbit/start?address=plebbit.eth")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_STARTED)
            .post("/api/v0/subplebbit/start?address=plebbit2.eth")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_STARTED)
            .post("/api/v0/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit start"].concat(addresses))
        .it(`Parses and submits addresses correctly`, (ctx) => {
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(addresses);
            expect(ctx.error).to.be.undefined;
        });

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}`, (api) =>
        api
            .post("/api/v0/subplebbit/start?address=plebbit3.eth")
            .reply(statusCodes.ERR_SUB_ALREADY_STARTED, statusMessages.ERR_SUB_ALREADY_STARTED)
            .post("/api/v0/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit start", "plebbit3.eth"])
        .exit(exitStatuses.ERR_SUB_ALREADY_STARTED)
        .it(`Fails if subplebbit already started`);
});
