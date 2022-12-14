import { expect, test } from "@oclif/test";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { statusCodes } from "../../dist/src/api/response-statuses.js";
import { exitStatuses } from "../../dist/src/cli/exit-codes.js";
import defaults from "../../dist/src/common-utils/defaults.js";

describe("plebbit subplebbit role set", () => {
    const singleRoleToBeSet: SubplebbitType["roles"] = { "estebanabaroa.eth": { role: "admin" } };
    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, { address: "plebbit.eth" })
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply((_, body) => {
                //@ts-ignore
                expect(body["roles"]).to.deep.equal(singleRoleToBeSet);
                return [statusCodes.SUCCESS_SUBPLEBBIT_EDITED];
            })
    )
        .loadConfig({ root: process.cwd() })
        .command([
            "subplebbit role set",
            "plebbit.eth",
            <string>Object.keys(singleRoleToBeSet)[0],
            `--role=${Object.values(singleRoleToBeSet)[0]?.role}`
        ])
        .it(`role set command parses roles correctly`);

    const secondRoleToBeSet: SubplebbitType["roles"] = { "rinse12.eth": { role: "moderator" } };

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, { address: "plebbit.eth", roles: singleRoleToBeSet })
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply((_, body) => {
                //@ts-ignore
                expect(body["roles"]).to.deep.equal({ ...singleRoleToBeSet, ...secondRoleToBeSet });
                return [statusCodes.SUCCESS_SUBPLEBBIT_EDITED];
            })
    )
        .loadConfig({ root: process.cwd() })
        .command([
            "subplebbit role set",
            "plebbit.eth",
            <string>Object.keys(secondRoleToBeSet)[0],
            `--role=${Object.values(secondRoleToBeSet)[0]?.role}`
        ])
        .it(`Can set an author role while preserving rest of authors' roles`);

    const thirdRoleToBeSet: SubplebbitType["roles"] = { "rinse12.eth": { role: "owner" } };

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api
            .post("/subplebbit/list")
            .reply(200, [])
            .post("/subplebbit/create")
            .reply(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, {
                address: "plebbit.eth",
                roles: { ...singleRoleToBeSet, ...secondRoleToBeSet }
            })
            .post("/subplebbit/edit?address=plebbit.eth")
            .reply((_, body) => {
                //@ts-ignore
                expect(body["roles"]).to.deep.equal({ ...singleRoleToBeSet, ...thirdRoleToBeSet });
                return [statusCodes.SUCCESS_SUBPLEBBIT_EDITED];
            })
    )
        .loadConfig({ root: process.cwd() })
        .command([
            "subplebbit role set",
            "plebbit.eth",
            <string>Object.keys(thirdRoleToBeSet)[0],
            `--role=${Object.values(thirdRoleToBeSet)[0]?.role}`
        ])
        .it(`Overrides author old role with new role`);

    test.nock(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`, (api) =>
        api.post("/subplebbit/list").reply(200, []).post("/subplebbit/create").reply(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    )
        .loadConfig({ root: process.cwd() })
        .command([
            "subplebbit role set",
            "plebbit12345.eth",
            <string>Object.keys(thirdRoleToBeSet)[0],
            `--role=${Object.values(thirdRoleToBeSet)[0]?.role}`
        ])
        .exit(exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
        .it(`Fails to set role to a sub that does not exist`);
});
