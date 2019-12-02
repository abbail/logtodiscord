import { LogDecoder } from "./log-decoder";
import { Message } from "discord.js";
import { Watch } from "./watch";
import { AuctionType } from "./models/auction-type";

export class DiscordDecoder {
    // used to detech the type of message we received (watch)
    private static watchRegExp: RegExp = /^watch\s/i;
    private static listWatchRegExp: RegExp = /^list watch$/i;
    private static unwatchRegExp: RegExp = /^unwatch\s/i;
    private static watchStringRegExp: RegExp = /^(?:watch|unwatch)\s(?:WTS|sell|selling|WTB|buy|buying)\s(.+)$/i;

    public static messageToWatch(message: Message) {
        let type = AuctionType.Other;
        if (this.isBuy(message.content)) {
            type = AuctionType.Buy;
        } else if (this.isSell(message.content)) {
            type = AuctionType.Sell;
        } else {
            // something went wrong
            console.error(message.content);
            return null;
        }

        const watchString = this.getWatchString(message.content);
        if (watchString === null) {
            return null;
        }

        return new Watch(message.author.id, message.author.username, watchString, type);
    }

    public static getWatchString(message: string) {
        // run the regex on the body
        const results = message.match(this.watchStringRegExp);
        // if there are results
        if (results !== null && results.length > 1) {
            // grab the capture group string
            return results[1];
        } else {
            // something went wrong
            console.error(message);
            return null;
        }
    }

    public static isWatch(message: string) {
        return this.watchRegExp.test(message);
    }

    public static isListWatch(message: string) {
        return this.listWatchRegExp.test(message);
    }

    public static isUnwatch(message: string) {
        return this.unwatchRegExp.test(message);
    }

    public static isBuy(message: string) {
        return LogDecoder.buyingRegExp.test(message);
    }

    public static isSell(message: string) {
        return LogDecoder.sellingRegExp.test(message);
    }
}