import { Flags, Hook } from "@oclif/core";

import * as remeda from "remeda";

const parseCommandInputToProperType = (input: any) => {
    if (input === "true") return true;
    else if (input === "false") return false;
    else if (input === "null") return null;
    else if (!Number.isNaN(parseInt(input))) return parseInt(input);
    else return input;
};

const parseFlags = (argv: string[]) => {
    const args = argv.slice(1);

    return args.reduce((accumulator, currentArg, index) => {
        // Skip if not a flag
        if (!currentArg.startsWith("--")) {
            return accumulator;
        }

        const flag = currentArg.slice(2); // Remove '--'

        // Handle --flag=value syntax
        if (flag.includes("=")) {
            const [flagPath, value] = flag.split("=");
            return setNestedValue(accumulator, flagPath, value);
        }

        const nextArg = args[index + 1];

        // Handle boolean flags (no value or next arg is a flag)
        if (!nextArg || nextArg.startsWith("--")) {
            return setNestedValue(accumulator, flag, true);
        }

        // Handle regular --flag value syntax
        return setNestedValue(accumulator, flag, nextArg);
    }, {});
};

// Helper function to set nested values
const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".");
    const lastKey = <string>keys.pop();

    // Traverse/create nested objects
    let current = obj;
    keys.forEach((key) => {
        current[key] = current[key] || {};
        current = current[key];
    });

    // Set or append value at final position
    if (typeof value === "boolean") {
        current[lastKey] = value;
    } else {
        current[lastKey] = [...(current[lastKey] || []), value];
    }

    return obj;
};

const traverseObjectToSetAsFlagInOclif = (opts: Parameters<Hook<"prerun">>[0], flagsGrouped: any, path = "") => {
    for (const flagName of Object.keys(flagsGrouped)) {
        if (remeda.isPlainObject(flagsGrouped[flagName])) {
            traverseObjectToSetAsFlagInOclif(opts, flagsGrouped[flagName], path + flagName + ".");
            if (Object.keys(flagsGrouped[flagName]).length !== 0) continue;
        }

        const flagsIndices = <Record<string, number>>Object.assign({}, ...Object.keys(flagsGrouped).map((flag) => ({ [flag]: 0 })));
        const multipleValues = Array.isArray(flagsGrouped[flagName]) && flagsGrouped[flagName].length > 1;

        const parsedValue = flagsGrouped[flagName];
        if (typeof parsedValue === "boolean") opts.Command.flags[path + flagName] = Flags.boolean({ default: true });
        else
            opts.Command.flags[path + flagName] = Flags.string({
                //@ts-expect-error
                multiple: multipleValues,

                parse: async (input) => {
                    const parsed = parseCommandInputToProperType(parsedValue[flagsIndices[flagName]++]);
                    return parsed;
                }
            });
    }
};

const hook: Hook<"prerun"> = async function (opts) {
    // Need to parse flag here and add it to opts.Command._flags
    if (opts.Command.id === "subplebbit:edit" || opts.Command.id === "subplebbit:create" || opts.Command.id === "daemon") {
        // Parse the dynamic flags and add them to opts.Command.flags so that it wouldn't throw
        if (opts.argv.length <= 1) return; // if no flags are provided, then we don't need to do anything
        for (let i = 0; i < opts.argv.length; i++) if (typeof opts.argv[i] !== "string") opts.argv[i] = String(opts.argv[i]);

        const flagsGrouped = <Record<string, any>>parseFlags(opts.Command.id === "daemon" ? ["", ...opts.argv] : opts.argv);
        if (Object.keys(flagsGrouped).length > 0 && !opts.Command.flags) opts.Command.flags = {};
        traverseObjectToSetAsFlagInOclif(opts, flagsGrouped);
    }
};

export default hook;
