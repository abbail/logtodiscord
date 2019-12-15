import { Observable } from 'rxjs';
import { LogEntry } from './log-entry';
import { Auction } from './auction';
import { ChatManager } from './chat-manager';
import { SQLManager } from './sql-manager';
import { CommandType } from './models/command-type';
import { ChatCommand } from './chat-command';
import { AuctionMessage } from './auction-message';

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
                console.debug('adding watch', chatCommand.text);
                this.sqlManager.addWatch(chatCommand.toWatch());
            } else if (chatCommand && (chatCommand.type === CommandType.UnwatchBuy || chatCommand.type === CommandType.UnwatchSell)) {
                console.debug('removing watch', chatCommand.text);
                this.sqlManager.removeWatch(chatCommand.toWatch());
            } else if (chatCommand && chatCommand.type === CommandType.IgnoreAuctioneer) {
                this.sqlManager.addIgnore(chatCommand.toIgnore());
            } else if (chatCommand && chatCommand.type === CommandType.UnignoreAuctioneer) {
                this.sqlManager.removeIgnore(chatCommand.toIgnore());
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
        const message = AuctionMessage.auctionToRichEmbed(auction, this.items);
        // const message = this.getTextForAuction(auction);
        this.chatManager.broadcastMessage(message);

        // notify all the watchers
        for (const match of this.getMatchingWatches(auction)) {
            const responseMessage = AuctionMessage.auctionToRichEmbed(auction, this.items);
            responseMessage.addField('Found match', match.text);
            this.chatManager.sendUserMessage(match.discordId, responseMessage);
        }

    }

    getMatchingWatches(auction: Auction) {
        return this.sqlManager.watches.filter(
            watch => {
                if (auction.body.indexOf(watch.text) !== -1 && auction.type === watch.type) {
                    if(this.sqlManager.ignores.some(ignore => {
                        console.info(`Not showing auction because ${auction.auctioneer} is ignored`);
                        return ignore.text.toLocaleLowerCase() === auction.auctioneer.toLocaleLowerCase();
                    })){
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        );
    }
}
