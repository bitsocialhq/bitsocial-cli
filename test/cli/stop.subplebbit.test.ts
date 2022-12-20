import { expect, test } from "@oclif/test";
import { statusCodes, statusMessages } from "../../dist/src/api/response-statuses.js";
import { exitStatuses } from "../../dist/src/cli/exit-codes.js";
import defaults from "../../dist/src/common-utils/defaults.js";

describe("plebbit subplebbit stop", () => {
    const addresses = ["plebbit.eth", "plebbit2.eth"];
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}`, (api) =>
        api
            .post("/api/v0/subplebbit/stop?address=plebbit.eth")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED)
            .post("/api/v0/subplebbit/stop?address=plebbit2.eth")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED)
            .post("/api/v0/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .stdout()
        .command(["subplebbit stop"].concat(addresses))
        .it(`Parses and submits addresses correctly`, (ctx) => {
            const trimmedOutput: string[] = ctx.stdout.trim().split("\n");
            expect(trimmedOutput).to.deep.equal(addresses);
            expect(ctx.error).to.be.undefined;
        });

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}`, (api) =>
        api
            .post("/api/v0/subplebbit/stop?address=plebbit3.eth")
            .reply(statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING, statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING)
            .post("/api/v0/subplebbit/list")
            .reply(200, [])
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit stop", "plebbit3.eth"])
        .exit(exitStatuses.ERR_SUBPLEBBIT_NOT_RUNNING)
        .it(`Fails if subplebbit already not running`);
});
