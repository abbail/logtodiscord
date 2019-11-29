export class LogEntry {
    // entire text of the log
    readonly logLine: string;

    // used to pull out the timestamp
    private timeStampRegExp: RegExp = /^\[([^\]]+)\]/g;
    // used to tell if it is an auction
    private auctionDetectionRegex: RegExp = /^\[[^\]]+\]\s[A-Za-z]+\sauctions,\s'/g;
    // stores the date parsed
    readonly timeStamp: Date;
    // stores if it is an auction
    readonly isAuction: boolean;

    constructor(logLine: string) {
        // local copy of the logLine
        this.logLine = logLine;
        // local copy of the timestamp
        this.timeStamp = this.parseTimeStamp();
        // local copy of the auction state
        this.isAuction = this.auctionDetectionRegex.test(this.logLine);
    }

    private parseTimeStamp() {
        // run the regex on the body
        const results = this.logLine.match(this.timeStampRegExp);
        // if there are results
        if (results !== null) {
            // grab the date and type it as a date
            return new Date(results[1]);
        } else {
            // something went wrong
            console.error(this.logLine);
            throw 'Invalid Log Line';
        }
    }
}