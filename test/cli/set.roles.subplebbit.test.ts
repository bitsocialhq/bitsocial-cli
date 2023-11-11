import { expect, test } from "@oclif/test";
import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import Sinon from "sinon";
import { SubplebbitEditOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/subplebbit/types";

describe("plebbit subplebbit role set", () => {
    const sandbox = Sinon.createSandbox();

    let editFake: Sinon.SinonSpy;
    const existingRoles: SubplebbitType["roles"] = { "estebanabaroa.eth": { role: "admin" } };

    before(() => {
        editFake = sandbox.fake();
        sandbox.replace(
            Plebbit.prototype,
            "createSubplebbit",
            sandbox.fake.resolves({ address: "plebbit.eth", edit: editFake, roles: existingRoles })
        );
    });

    afterEach(async () => {
        editFake.resetHistory();
    });

    after(() => sandbox.restore());

    test.command(["subplebbit role set", "plebbit.eth", "rinse12.eth", `--role=admin`]).it(
        `Can set an author role while preserving rest of authors' roles`,
        async () => {
            expect(editFake.calledOnce).to.be.true;
            //@ts-expect-error
            const parsedArgs = <SubplebbitEditOptions>editFake.firstArg; // should be the new roles without rinse12.eth

            expect(parsedArgs).to.deep.equal({ roles: { ...existingRoles, "rinse12.eth": { role: "admin" } } });
        }
    );

    test
        .command(["subplebbit role set", "plebbit.eth", "estebanabaroa.eth", `--role=moderator`])
        .it(`Overrides author old role with new role`),
        async () => {
            expect(editFake.calledOnce).to.be.true;
            //@ts-expect-error
            const parsedArgs = <SubplebbitEditOptions>editFake.firstArg; // should be the new roles without rinse12.eth

            expect(parsedArgs).to.deep.equal({ roles: { "estebanabaroa.eth": { role: "moderator" } } });
        };
});
