import { Watch } from "./watch";
import { Observable } from "rxjs";
import { LogEntry } from "./log-entry";
import { Auction } from "./auction";
import { ChatManager } from "./chat-manager";
import { SQLManager } from "./sql-manager";

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
            }
        });
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
        return this.sqlManager.watches.filter(watch => auction.body.indexOf(watch.watchText) !== -1 && auction.type == watch.type);
    }
}