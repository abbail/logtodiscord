import { Observable } from "rxjs";
import { LogEntry } from "./log-entry";
import { Auction } from "./auction";
import { ChatManager } from "./chat-manager";
import { SQLManager } from "./sql-manager";
import { RichEmbed } from "discord.js";
import { AuctionType } from "./models/auction-type";

export class AuctionWatcher {
    constructor(private sqlManager: SQLManager, private logStream: Observable<LogEntry>, private chatManager: ChatManager) {
        // subscribe to the ready event
        this.chatManager.client.on('ready', () => {
            // when logged in
            console.debug('Logged in as', this.chatManager.client.user.tag);
            // begin watching the log stream
            this.watchLogStream();
        });

        // subscribe to messages
        this.chatManager.client.on('message', message => {
            const watch = this.chatManager.handleMessage(message);
            if (watch && !watch.negated) {
                this.sqlManager.addWatch(watch);
            } else if (watch && watch.negated) {
                this.sqlManager.removeWatch(watch);
            } // else it was handled in the processor
        });
    }

    private watchLogStream() {
        // subscribe to every log entry
        this.logStream.subscribe((logLine) => {
            // if the log entry is an auction
            if (logLine.isAuction) {
                // wrapping this in a try since a blank auction won't parse, etc
                try {
                    // make an auction object out of it
                    const auction = new Auction(logLine.logLine);
                    // and process it
                    this.handleGeneralAuction(auction);
                } catch (e) {
                    // do nothing, skip the auction and move on
                }
            } 
        });
    }

    handleGeneralAuction(auction: Auction) {
        console.debug(auction.auctioneer, '-', auction.body);

        // the general auction announce
        // const message = this.getRichEmbedForAuction(auction);
        const message = this.getTextForAuction(auction);
        this.chatManager.broadcastMessage(message);

        // notify all the watchers
        for(const match of this.getMatchingWatches(auction)) { 
            const message = this.getRichEmbedForAuction(auction);
            message.addField('Found match', match.watchText);
            this.chatManager.sendUserMessage(match.discordId, message);
        }

    }

    getMatchingWatches(auction: Auction) {
        return this.sqlManager.watches.filter(watch => auction.body.indexOf(watch.watchText) !== -1 && auction.type == watch.type);
    }

    getTextForAuction(auction: Auction) {
        return '__**' + auction.auctioneer + '**__ - "' + auction.body + '"';
    }

    getRichEmbedForAuction(auction: Auction) {
        // create a RichEmbed message so we can color code it and get fancy
        const richEmbed = new RichEmbed();
        // set the title to who sent the auction
        richEmbed.setTitle('__**' + auction.auctioneer + '**__');
        // and the description as the body
        richEmbed.setDescription(auction.body);

        // color by auction type
        richEmbed.setColor(this.getColorForAuction(auction));

        return richEmbed;
    }

    getColorForAuction(auction: Auction) {
        // color by auction type
        switch(auction.type) {
            case AuctionType.Buy:
            return 0x5555FF;
            case AuctionType.Sell:
            return 0x55FF55;
            case AuctionType.Both:
            return 0x22FFFF;
            case AuctionType.Other:
            return 0x555555;
            default:
            return 0xFF0000;
        }
    }
}