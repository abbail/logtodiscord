import { LogEntry } from "./log-entry";
import { LogDecoder } from "./log-decoder";
import { AuctionPieces } from "./models/auction-pieces";
import { WatchType } from "./models/watch-type";

export class Auction extends LogEntry implements AuctionPieces {
    body = '';
    auctioneer = '';
    type: WatchType = WatchType.Unknown;

    constructor(logLine: string) {
        super(logLine);
        Object.assign(this, LogDecoder.getAuctionPieces(logLine));
    }
}