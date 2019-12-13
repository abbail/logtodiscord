import { WatchType } from "./models/watch-type";

export class Watch {
    constructor (public discordId: string, public name: string, public watchText: string, public type: WatchType, public negated = false) { }
}
