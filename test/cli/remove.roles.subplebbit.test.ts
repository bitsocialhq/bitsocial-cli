import { expect, test } from "@oclif/test";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { statusCodes } from "../../dist/src/api/response-statuses.js";
import { exitStatuses } from "../../dist/src/cli/exit-codes.js";
import defaults from "../../dist/src/common-utils/defaults.js";

describe("plebbit subplebbit role remove", () => {
    const existingRoles: SubplebbitType["roles"] = { "estebanabaroa.eth": { role: "admin" }, "rinse12.eth": { role: "owner" } };
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create", { address: "plebbit.eth" })
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, { address: "plebbit.eth", roles: existingRoles } as SubplebbitType)
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply((_, body) => {
                //@ts-ignore
                expect(body["roles"]).to.deep.equal({ "estebanabaroa.eth": { role: "admin" } });
                return [statusCodes.SUCCESS_SUBPLEBBIT_EDITED];
            })
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit role remove", "plebbit.eth", "rinse12.eth"])
        .it(`Can remove role of author while preserving rest of authors' roles`);

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create", { address: "plebbit.eth" })
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, {
                address: "plebbit.eth",
                roles: { "estebanabaroa.eth": { role: "admin" } }
            })
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit role remove", "plebbit.eth", "rinse12.eth"])
        .exit(exitStatuses.ERR_AUTHOR_ROLE_DOES_NOT_EXIST)
        .it(`Fails to remove role of author that has no role`);

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create", { address: "plebbit.eth" })
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, {
                address: "plebbit.eth",
                roles: { "estebanabaroa.eth": { role: "admin" } }
            })
    )
        .loadConfig({ root: process.cwd() })
        .command(["subplebbit role remove", "plebbit.eth", "rinse12.eth"])
        .exit(exitStatuses.ERR_AUTHOR_ROLE_DOES_NOT_EXIST)
        .it(`Fails to remove role of author that has no role`);

    // We need to implement /api/v0/subplebbit/create returning a standard error code if sub does not exist
    // test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
    //     api.post("/subplebbit/list").reply(200, []).post("/subplebbit/create").reply(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    // )
    //     .loadConfig({ root: process.cwd() })
    //     .command(["subplebbit role remove", "plebbit.eth", "rinse12.eth"])
    //     .exit(exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    //     .it(`Fails to remove role of a sub that does not exist`);
});
