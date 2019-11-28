export class LogEntry {
    readonly logLine: string;
    private timeStampRegExp: RegExp = /^\[[^\]]+\]/g;
    private auctionDetectionRegex: RegExp = /^\[[^\]]+\]\s[A-Za-z]+\sauctions,\s'/g;
    readonly timeStamp: Date;
    readonly isAuction: boolean;

    constructor(logLine: string) {
        this.logLine = logLine;
        this.timeStamp = this.parseTimeStamp();
        this.isAuction = this.auctionDetectionRegex.test(this.logLine);
    }

    private parseTimeStamp() {
        const results = this.logLine.match(this.timeStampRegExp);
        if (results !== null) {
            // strip off the []s and type it as a date
            return new Date(results[0].replace(/[\[\]]/g, ''));
        } else {
            console.error(this.logLine);
            throw 'Invalid Log Line';
        }
    }
}