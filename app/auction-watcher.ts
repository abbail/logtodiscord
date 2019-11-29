import { Database } from "sqlite3";
import { Watch } from "./watch";
import { resolve } from "path";
import { Observable } from "rxjs";
import { LogEntry } from "./log-entry";
import { Auction, AuctionType } from "./auction";
import { RichEmbed } from "discord.js";
import { ChatManager } from "./chat-manager";

export class AuctionWatcher {
    private database: Database
    public watches: Watch[] = [];
    constructor(databasePath: string, private logStream: Observable<LogEntry>, private chatManager: ChatManager) {
        this.database = new Database(resolve(databasePath));
        this.refreshWatchList();

        // subscribe to the ready event
        this.chatManager.client.on('ready', () => {
            // when logged in
            console.debug('Logged in as', this.chatManager.client.user.tag);

            // begin watching the log stream
            this.watchLogStream();
        });
    }

    refreshWatchList() {
        this.database.serialize(() => {
            this.watches.slice();
            this.database.each("SELECT name, discordId, watchedText, type FROM auctionWatches", (err, row) => {
                this.watches.push(new Watch(row.discordId, row.name, row.watchedText, row.type));
            });
        });

        this.database.close();
    }

    private watchLogStream() {
        // subscribe to every log entry
        this.logStream.subscribe((logLine) => {
            // if the log entry is an auction
            if (logLine.isAuction) {
                // make an auction object out of it
                const auction = new Auction(logLine.logLine);
                // and process it
                this.handleGeneralAuction(auction);
            } 
        });
    }

    handleGeneralAuction(auction: Auction) {
        console.debug(auction.auctioneer, '-', auction.body);

        let message = '__**' + auction.auctioneer + '**__\n';

        message += auction.body + '\n';
        for(const match of this.getMatchingWatches(auction)) {
            message += '<@' + match.discordId + '>';
        }

        this.chatManager.broadcastMessage(message);
    }

    getMatchingWatches(auction: Auction) {
        return this.watches.filter(watch => auction.body.indexOf(watch.watchText) !== -1 && auction.type == watch.type);
    }
}