import { Auction } from "./auction";
import { RichEmbed } from "discord.js";
import { AuctionType } from "./models/auction-type";

export class AuctionMessage {
    public static auctionToPlaneText(auction: Auction) {
        return `__**${auction.auctioneer}**__ - "${auction.body}"`;
    }

    public static auctionToRichEmbed(auction: Auction, items: string[]) {
        // create a RichEmbed message so we can color code it and get fancy
        const richEmbed = new RichEmbed();
        // set the title to who sent the auction
        richEmbed.setTitle('__**' + auction.auctioneer + '**__');
        // and the description as the body
        richEmbed.setDescription(AuctionMessage.markupItems(auction.body, items));

        // color by auction type
        richEmbed.setColor(AuctionMessage.getAuctionColor(auction));

        return richEmbed;
    }

    public static markupItems(body: string, items: string[]) {
        let itemMatches: string[] = this.findItemMatches(body, items);
        itemMatches = this.removeItemDuplicates(itemMatches);
        body = this.markupMatches(body, itemMatches);
        return body;
    }

    public static findItemMatches(message: string, items: string[]) {
        const itemMatches: string[] = [];

        for(const item of items) {
            if (message.indexOf(item) !== -1) {
                itemMatches.push(item);
            }
        }
        return itemMatches;
    }

    public static removeItemDuplicates(itemMatches: string[]) {
        return itemMatches.filter((match, index, matches) => {
            for(let i = 0; i < matches.length; i++) {
                if (index !== i && matches[i].indexOf(match) !== -1) {
                    return false;
                }
            }
            return true;
        });
    }

    public static markupMatches(body: string, matches: string[]) {
        for (const match of matches) {
            body = body.replace(
                match,
                `[${match}](https://wiki.project1999.com/index.php?title=Special%3ASearch&search=${encodeURI(match)}&go=Go)`
            );
        }
        return body;
    }

    public static getAuctionColor(auction: Auction) {
        switch (auction.type) {
            case AuctionType.Buy:
                return 0x5555FF;
            case AuctionType.Sell:
                return 0x55FF55;
            case AuctionType.Both:
                return 0x22FFFF;
            case AuctionType.Unknown:
                return 0x555555;
            default:
                return 0xFF0000;
        }
    }
}