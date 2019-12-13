import { Message } from "discord.js";
import { CommandType } from "./models/command-type";
import { LogDecoder } from "./log-decoder";
import { Watch } from "./models/watch";
import { AuctionType } from "./models/auction-type";

export class ChatCommand extends Watch {
    private watchStringRegExp: RegExp = /^(?:watch|unwatch|ignore)\s(?:WTS|sell|selling|WTB|buy|buying|person|match)\s(.+)$/i;
    private watchRegExp: RegExp = /^watch\s/i;
    private listWatchRegExp: RegExp = /^list watch$/i;
    private unwatchRegExp: RegExp = /^unwatch\s/i;

    constructor(message: Message) {
        super(message.author.id, message.author.username, '', CommandType.Unknown);
        this.watchText = this.getWatchString(message.content);
        this.type = this.getCommandType(message.content);
    }

    toWatch() {
        let watchType = AuctionType.Unknown;
        if (this.type === CommandType.UnwatchBuy || this.type === CommandType.WatchBuy){
            watchType = AuctionType.Buy;
        } else {
            watchType = AuctionType.Sell;
        }

        return new Watch(this.discordId, this.name, this.watchText, watchType);
    }

    private getWatchString(message: string) {
        // run the regex on the body
        const results = message.match(this.watchStringRegExp);
        // if there are results
        if (results !== null && results.length > 1) {
            // grab the capture group string
            return results[1];
        } else {
            // something went wrong
            console.error(message);
            return '';
        }
    }

    private getCommandType(message: string) {
        if(this.isWatch(message)) {
            return this.getWatchType(message);
        }

        if (this.isUnwatch(message)) {
            return this.getUnwatchType(message);
        }

        if (this.isListWatch(message)) {
            return CommandType.ListWatch;
        }

        throw new Error('Invalid Command Type.');
    }

    private getWatchType(message: string) {
        return this.isBuy(message) ? CommandType.WatchBuy : this.isSell(message) ? CommandType.WatchSell : CommandType.Unknown;
    }

    private getUnwatchType(message: string) {
        return this.isBuy(message) ? CommandType.UnwatchBuy : this.isSell(message) ? CommandType.UnwatchSell : CommandType.Unknown;
    }

    private isWatch(message: string) {
        return this.watchRegExp.test(message);
    }

    private isListWatch(message: string) {
        return this.listWatchRegExp.test(message);
    }

    private isUnwatch(message: string) {
        return this.unwatchRegExp.test(message);
    }

    private isBuy(message: string) {
        return LogDecoder.buyingRegExp.test(message);
    }

    private isSell(message: string) {
        return LogDecoder.sellingRegExp.test(message);
    }
}