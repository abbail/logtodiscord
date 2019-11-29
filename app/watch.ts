import { AuctionType } from "./models/auction-type";

export class Watch {
    constructor (public discordId: string, public name: string, public watchText: string, public type: AuctionType, public negated = false) { }
}