import { Client, TextChannel, Message, RichEmbed, User } from 'discord.js';
import { DiscordDecoder } from './discord-decoder';
import { Watch } from './watch';
import { SQLManager } from './sql-manager';
import { AuctionType } from './models/auction-type';

export class ChatManager {
    // discord.js client
    public client: Client;

    constructor(token: string, private sqlManager: SQLManager) {
        // create a client
        this.client = new Client();
        // log in with the token
        this.client.login(token);
    }

    handleMessage(message: Message) {
        // ignore your own messages
        if (message.author.id !== this.client.user.id) {
            const watch = DiscordDecoder.messageToWatch(message);
            const errorMessage = 'Invalid statement.  Example watch:\nwatch WTS Stein of Maggok';

            if (watch !== null) {
                // if it's a subscribe
                if (DiscordDecoder.isWatch(message.content)) {
                    return this.handleWatch(watch);
                // if it's an ubsubscribe
                } else if (DiscordDecoder.isUnwatch(message.content)) {
                    return this.handleUnwatch(watch);
                // what is this?
                } else {
                    console.error(errorMessage);
                    this.sendUserMessage(message.author.id, errorMessage);
                    return;
                }
            // if it is a list watch
            } else if (DiscordDecoder.isListWatch(message.content)) {
                this.handleListWatch(message.author);
                return;
            } else {
                console.debug('Discord message seen that didn\'t look like a watch.');
            }
        }
    }

    private handleListWatch(user: User) {
        console.debug('Listing ' + user.username + '\'s watches');
        this.sqlManager.getWatchByDiscordId(user.id).then((watches)=>{
            let message = 'You are watching:\n';
            for (const watch of watches) {
                const type = ChatManager.auctionTypeToDescription(watch.type);
                message += type + ' ' + watch.watchText + '\n';
            }
            this.sendUserMessage(user.id, message);
        });
    }

    private handleWatch(watch: Watch) {
        console.debug('Subscribing ' + watch.name + ' to ' + watch.watchText);
        this.sendUserMessage(watch.discordId, 'Subscribing you to ' + watch.watchText);
        return watch;
    }

    private handleUnwatch(watch: Watch) {
        console.debug('Unsubscribed ' + watch.name + ' from ' + watch.watchText);
        this.sendUserMessage(watch.discordId, 'Unsubscribed you from ' + watch.watchText);
        watch.negated = true;
        return watch;
    }
    
    broadcastMessage(message: string | RichEmbed) {
        // for every channel the bot is in
        this.client.channels.tap((channel)=>{
            // if the channel is a TextChannel
            if (channel instanceof TextChannel) {
                // send the message
                this.sendChannelMessage(channel, message);
            }
        });
    }

    sendChannelMessage(channel: TextChannel, message: string | RichEmbed) {
        // send a message to a channel
        channel.send(message);
    }

    sendUserMessage(discordId: string, message: string | RichEmbed) {
        this.client.fetchUser(discordId, true).then(user => {
            if(message instanceof RichEmbed) {
                user.sendEmbed(message);
            } else {
                user.send(message);
            }
        });
    }

    public static auctionTypeToDescription(auctionType: AuctionType) {
        switch(auctionType) {
            case AuctionType.Buy:
            return "WTB";
            case AuctionType.Sell:
            return "WTS";
            case AuctionType.Both:
            return "Both";
            case AuctionType.Other:
            return "Other";
            default:
            return "Unknown";
        }
    }
}