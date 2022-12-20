import { BaseCommand } from "../../base-command.js";
export default class Stop extends BaseCommand {
    static description: string;
    static strict: boolean;
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static examples: string[];
    run(): Promise<void>;
}
