import { LogEntry } from "./log-entry";
import { LogDecoder } from "./log-decoder";
import { AuctionPieces } from "./models/auction-pieces";
import { AuctionType } from "./models/auction-type";

export class Auction extends LogEntry implements AuctionPieces {
    body = '';
    auctioneer = '';
    type: AuctionType = AuctionType.Other;

    constructor(logLine: string) {
        super(logLine);
        Object.assign(this, LogDecoder.getAuctionPieces(logLine))
    }
}