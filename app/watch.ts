import { AuctionType } from "./auction";

export class Watch {
    constructor (public discordId: string, public name: string, public watchText: string, public type: AuctionType) { }
}