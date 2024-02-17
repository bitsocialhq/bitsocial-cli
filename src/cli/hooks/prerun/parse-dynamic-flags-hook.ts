import { Flags, Hook } from "@oclif/core";

const hook: Hook<"prerun"> = async function (opts) {
    // Need to parse flag here and add it to opts.Command._flags
    if (opts.Command.id === "subplebbit:edit" || opts.Command.id === "subplebbit:create") {
        // Parse the dynamic flags and add them to opts.Command.flags so that it wouldn't throw
        for (let i = 0; i < opts.argv.length; i++) if (typeof opts.argv[i] !== "string") opts.argv[i] = String(opts.argv[i]);

        const keys = <string[]>opts.argv
            .slice(Object.keys(opts.Command.args).length) // remove the <address>
            .filter((_, i) => i % 2 === 0) // remove values, we only need keys here
            .map((key) => key.split("--")[1]);
        if (keys.length > 0 && !opts.Command.flags) opts.Command.flags = {};
        for (const key of keys) {
            opts.Command.flags[key] = Flags.string({
                //@ts-expect-error
                parse: async (input) => {
                    if (input === "true") return true;
                    else if (input === "false") return false;
                    else if (input === "null") return null;
                    else if (!Number.isNaN(parseInt(input))) return parseInt(input);
                    return input;
                }
            });
        }
    }
};

export default hook;
