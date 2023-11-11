import { expect, test } from "@oclif/test";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import Sinon from "sinon";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import lodash from "lodash";
import { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

describe("plebbit subplebbit role remove", () => {
    const sandbox = Sinon.createSandbox();

    let editFake: Sinon.SinonSpy;

    const existingRoles: SubplebbitType["roles"] = { "estebanabaroa.eth": { role: "admin" }, "rinse12.eth": { role: "owner" } };

    before(() => {
        editFake = sandbox.fake();

        sandbox.replace(
            Plebbit.prototype,
            "createSubplebbit",
            sandbox.fake.resolves({ address: "plebbit.eth", edit: editFake, roles: existingRoles })
        );
    });

    after(() => sandbox.restore());

    test.command(["subplebbit role remove", "plebbit.eth", "rinse12.eth"]).it(
        `Can remove role of author while preserving rest of authors' roles`,
        async () => {
            expect(editFake.calledOnce).to.be.true;
            //@ts-expect-error
            const parsedArgs = <SubplebbitEditOptions>editFake.firstArg; // should be the new roles without rinse12.eth

            expect(parsedArgs.roles).to.deep.equal(lodash.omit(existingRoles, "rinse12.eth"));
        }
    );

    test.command(["subplebbit role remove", "plebbit.eth", "somerandomauthor.eth"])
        .exit(2)
        .it(`Fails to remove role of author that has no role`);
});
