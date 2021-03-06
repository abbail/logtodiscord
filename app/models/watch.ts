import { CommandType } from "./command-type";
import { AuctionType } from "./auction-type";

export class Watch {
    constructor (public discordId: string, public name: string, public text: string, public type: CommandType | AuctionType) { }
}