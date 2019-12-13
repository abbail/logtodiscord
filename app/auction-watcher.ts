import { Observable } from 'rxjs';
import { LogEntry } from './log-entry';
import { Auction } from './auction';
import { ChatManager } from './chat-manager';
import { SQLManager } from './sql-manager';
import { RichEmbed } from 'discord.js';
import { AuctionType } from './models/auction-type';
import { CommandType } from './models/command-type';
import { ChatCommand } from './chat-command';

export class AuctionWatcher {
    private items: string[] = [];
    private chatManager: ChatManager;

    constructor(private sqlManager: SQLManager, private logStream: Observable<LogEntry>, private discordToken: string) {
        // set up the chat manager
        this.chatManager = new ChatManager(discordToken, sqlManager);

        // subscribe to the ready event
        this.chatManager.client.on('ready', () => {
            // when logged in
            console.debug('Logged in as', this.chatManager.client.user.tag);
            // begin watching the log stream
            this.watchLogStream();

            // announce online
            this.chatManager.broadcastMessage('I am now online @everyone');
        });

        // subscribe to messages
        this.chatManager.client.on('message', message => {
            let chatCommand: ChatCommand;
            // don't listen to your own messages
            if (message.author.id !== this.chatManager.client.user.id) {
                try {
                    chatCommand = new ChatCommand(message);
                } catch (e) {
                    this.chatManager.sendUserMessage(message.author.id, e.message);
                    return;
                }
            } else {
                return;
            }

            this.chatManager.handleChatCommand(chatCommand);

            if (chatCommand && (chatCommand.type === CommandType.WatchBuy || chatCommand.type === CommandType.WatchSell)) {
                console.debug('adding watch', chatCommand.watchText);
                this.sqlManager.addWatch(chatCommand.toWatch());
            } else if (chatCommand && (chatCommand.type === CommandType.UnwatchBuy || chatCommand.type === CommandType.UnwatchSell)) {
                console.debug('removing watch', chatCommand.watchText);
                this.sqlManager.removeWatch(chatCommand.toWatch());
            } // else no further processing is needed because no data changed
        });

        this.sqlManager.getItems().then(items => {
            this.items = items;
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
        const message = this.getRichEmbedForAuction(auction);
        // const message = this.getTextForAuction(auction);
        this.chatManager.broadcastMessage(message);

        // notify all the watchers
        for (const match of this.getMatchingWatches(auction)) {
            const responseMessage = this.getRichEmbedForAuction(auction);
            responseMessage.addField('Found match', match.watchText);
            this.chatManager.sendUserMessage(match.discordId, responseMessage);
        }

    }

    getMatchingWatches(auction: Auction) {
        return this.sqlManager.watches.filter(
            watch => {
                if(auction.body.indexOf(watch.watchText) !== -1){
                    console.log(watch, auction);
                }
                return auction.body.indexOf(watch.watchText) !== -1 && auction.type === watch.type;
            });
    }

    getTextForAuction(auction: Auction) {
        return `__**${auction.auctioneer}**__ - "${auction.body}"`;
    }

    markupItems(body: string) {
        let itemMatches: string[] = this.findItemMatches(body);
        itemMatches = this.removeItemDuplicates(itemMatches);
        body = this.markupMatches(body, itemMatches);
        return body;
    }

    private markupMatches(body: string, matches: string[]) {
        for (const match of matches) {
            body = body.replace(
                match,
                `[${match}](https://wiki.project1999.com/index.php?title=Special%3ASearch&search=${encodeURI(match)}&go=Go)`
            );
        }
        return body;
    }

    private findItemMatches(message: string) {
        const itemMatches: string[] = [];

        for(const item of this.items) {
            if (message.indexOf(item) !== -1) {
                itemMatches.push(item);
            }
        }
        return itemMatches;
    }

    private removeItemDuplicates(itemMatches: string[]) {
        return itemMatches.filter((match, index, matches) => {
            for(let i = 0; i < matches.length; i++) {
                if (index !== i && matches[i].indexOf(match) !== -1) {
                    return false;
                }
            }
            return true;
        });
    }

    getRichEmbedForAuction(auction: Auction) {
        // create a RichEmbed message so we can color code it and get fancy
        const richEmbed = new RichEmbed();
        // set the title to who sent the auction
        richEmbed.setTitle('__**' + auction.auctioneer + '**__');
        // and the description as the body
        richEmbed.setDescription(this.markupItems(auction.body));

        // color by auction type
        richEmbed.setColor(this.getColorForAuction(auction));

        return richEmbed;
    }

    getColorForAuction(auction: Auction) {
        // color by auction type
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
