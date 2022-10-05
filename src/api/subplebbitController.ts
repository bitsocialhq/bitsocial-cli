import { Controller, Post, Route } from "tsoa";
import { SubplebbitList, SubplebbitService } from "./subplebbitService.js";

@Route("subplebbit")
export class SubplebbitController extends Controller {
    @Post()
    public async list(): Promise<SubplebbitList> {
        return new SubplebbitService().list();
    }
}
