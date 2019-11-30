import { AuctionPieces } from "./models/auction-pieces";
import { AuctionType } from "./models/auction-type";

export class LogDecoder {
    // used to pull out the timestamp
    private static timeStampRegExp: RegExp = /^\[([^\]]+)\]/g;
    // used to tell if it is an auction
    private static auctionDetectionRegex: RegExp = /^\[[^\]]+\]\s[A-Za-z]+\sauctions,\s'/g;
    // used to break an auction into its pieces
    private static auctionRegExp: RegExp = /^\[[^\]]+\]\s([A-Za-z]+)\sauctions,\s'(.+)'/i;
    // used to detect auction type (sell)
    static sellingRegExp: RegExp = /(?:WTS)|(?:sell)|(?:selling)/i
    // used to detect auction type (buy)
    static buyingRegExp: RegExp = /(?:WTB)|(?:buy)|(?:buying)/i

    public static isAuction(message: string) {
        return this.auctionDetectionRegex.test(message);
    }

    public static getTimestamp(message: string) {
        // run the regex on the body
        const results = message.match(this.timeStampRegExp);
        // if there are results
        if (results !== null) {
            // grab the date and type it as a date
            return new Date(results[1]);
        } else {
            // something went wrong
            console.error(message);
            throw 'Invalid Log Line';
        }
    }

    public static getAuctionPieces(message: string) {
        const matches = message.match(this.auctionRegExp);
        const auctionPieces: AuctionPieces = {
            type: AuctionType.Other,
            auctioneer: '',
            body: ''
        };

        if (matches !== null) {
            if (matches.length < 3) {
                console.error(message);
                throw 'Corrput Auction Log Entry';
            }
            auctionPieces.auctioneer = matches[1];
            // replace people's ||s so they don't trigger spoiler notation
            auctionPieces.body = matches[2].replace(/\|+/g, '|');
            auctionPieces.type = this.getAuctionType(message);
        } else {
            console.error(message);
            throw 'Invalid Auction Log Entry';
        }
        return auctionPieces;
    }

    public static getAuctionType(message: string) {
        let wasBuy = false;
        let auctionType: AuctionType = AuctionType.Other;

        if (this.buyingRegExp.test(message)) {
            wasBuy = true;
            auctionType = AuctionType.Buy;
        }

        if (this.sellingRegExp.test(message)) {
            auctionType = AuctionType.Sell;
        }
        
        // it is both a buy and a sell
        if (wasBuy && auctionType == AuctionType.Sell) {
            auctionType = AuctionType.Both;
        }

        return auctionType;
    }
}