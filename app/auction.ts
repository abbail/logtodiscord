import { LogEntry } from "./log-entry";

export class Auction extends LogEntry {
    private auctionRegExp: RegExp = /^\[[^\]]+\]\s([A-Za-z]+)\sauctions,\s'(.+)'/i;
    private sellingRegExp: RegExp = /(?:WTS)|(?:sell)|(?:selling)/i
    private buyingRegExp: RegExp = /(?:WTB)|(?:buy)|(?:buying)/i
    public body = '';
    public auctioneer = '';
    public type: AuctionType = AuctionType.Other;

    constructor(logLine: string) {
        super(logLine);
        this.parseAuction();
    }

    private parseAuction() {
        const matches = this.logLine.match(this.auctionRegExp);
        if (matches !== null) {
            if (matches.length < 3) {
                console.error(this.logLine);
                throw 'Corrput Auction Log Entry';
            }
            this.auctioneer = matches[1];
            this.body = matches[2];

            this.parseBody();
        } else {
            console.error(this.logLine);
            throw 'Invalid Auction Log Entry';
        }
    }

    private parseBody() {
        let wasBuy = false;
        if (this.buyingRegExp.test(this.body)) {
            wasBuy = true;
            this.type = AuctionType.Buy;
        }

        if (this.sellingRegExp.test(this.body)) {
            this.type = AuctionType.Sell;
        }
        
        // it is both a buy and a sell
        if (wasBuy && this.type == AuctionType.Sell) {
            this.type = AuctionType.Both;
        }
    }
}

export enum AuctionType {
    Buy, Sell, Both, Other
}