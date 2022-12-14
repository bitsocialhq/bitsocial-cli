import { BaseCommand } from "../../../base-command.js";
export default class Remove extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {};
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    run(): Promise<void>;
}
