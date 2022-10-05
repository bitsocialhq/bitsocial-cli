export type SubplebbitList = { address: string; title: string; status: "running" | "starting" | "off" }[];

export class SubplebbitService {
    public list(): SubplebbitList {
        return []; // TODO implement
    }
}
