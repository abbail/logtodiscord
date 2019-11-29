import { LogDecoder } from "./log-decoder";

export class LogEntry {
    // stores the date parsed
    readonly timeStamp: Date;
    // stores if it is an auction
    readonly isAuction: boolean;

    constructor(public readonly logLine: string) {
        // local copy of the timestamp
        this.timeStamp = LogDecoder.getTimestamp(this.logLine);
        // local copy of the auction state
        this.isAuction = LogDecoder.isAuction(this.logLine);
    }
}