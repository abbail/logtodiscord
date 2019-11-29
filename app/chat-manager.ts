import { Client, TextChannel, RichEmbed, Message } from 'discord.js';
import { Auction, AuctionType } from './auction';
import { LogEntry } from './log-entry';
import { Observable } from 'rxjs';
import { AuctionWatcher } from './auction-watcher';
import { Watch } from './watch';

export class ChatManager {
    // discord.js client
    public client: Client;

    constructor(token: string) {
        // create a client
        this.client = new Client();
        // log in with the token
        this.client.login(token);
    }

    broadcastRichEmbedMessage(richEmbed: RichEmbed, watchMatches: Watch[]) {
        // for every channel the bot is in
        this.client.channels.tap((channel, key, collection)=>{
            let mentions = 'Watched items mentioned in above auction\n';
            for(const match of watchMatches) {
                mentions += '<@' + match.discordId + '> ' + match.watchText;
            }

            // if the channel is a TextChannel
            if (channel instanceof TextChannel) {
                // send the message
                channel.send(richEmbed);
                if (watchMatches.length > 0) {
                    channel.send(mentions);
                }
            }
        });
    }
    
    broadcastMessage(message: string) {
        // for every channel the bot is in
        this.client.channels.tap((channel, key, collection)=>{
            // if the channel is a TextChannel
            if (channel instanceof TextChannel) {
                // send the message
                channel.send(message);
            }
        });
    }
}