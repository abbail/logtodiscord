import { Client, TextChannel, RichEmbed } from 'discord.js';
import { Auction, AuctionType } from './auction';
import { LogEntry } from './log-entry';
import { Observable } from 'rxjs';

export class ChatManager {
    // discord.js client
    public client: Client;
    // local copy of the stream of log entries
    public readonly logStream: Observable<LogEntry>;

    constructor(token: string, logStream: Observable<LogEntry>) {
        // store the stream
        this.logStream = logStream;
        // create a client
        this.client = new Client();
        // log in with the token
        this.client.login(token);

        // subscribe to the ready event
        this.client.on('ready', () => {
            // when logged in
            console.debug('Logged in as', this.client.user.tag);

            // begin watching the log stream
            this.watchLogStream();
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
        // create a RichEmbed message so we can color code it and get fancy
        const richEmbed = new RichEmbed();
        // set the title to who sent the auction
        richEmbed.setTitle(auction.auctioneer);
        // and the description as the body
        richEmbed.setDescription(auction.body);

        // all of this just to set the color per auction type
        switch(auction.type) {
            case AuctionType.Buy:
            console.debug('BUY', auction.body);
            richEmbed.setColor(0x5555FF);
            break;
            case AuctionType.Sell:
            console.debug('SELL', auction.body);
            richEmbed.setColor(0x55FF55);
            break;
            case AuctionType.Both:
            console.debug('BOTH', auction.body);
            richEmbed.setColor(0x22FFFF);
            break;
            case AuctionType.Other:
            console.debug('OTHER', auction.body);
            richEmbed.setColor(0x555555);
            break;
        }

        // send the messages out
        this.broadcastRichEmbedMessage(richEmbed);
    }
    
    broadcastRichEmbedMessage(richEmbed: RichEmbed) {
        // for every channel the bot is in
        this.client.channels.tap((channel, key, collection)=>{
            // if the channel is a TextChannel
            if (channel instanceof TextChannel) {
                // send the message
                channel.send(richEmbed);
            }
        });
    }
}