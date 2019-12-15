import { Client, TextChannel, Message, RichEmbed, User } from 'discord.js';
import { SQLManager } from './sql-manager';
import { CommandType } from './models/command-type';
import { ChatCommand } from './chat-command';
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

    handleChatCommand(chatCommand: ChatCommand) {
        switch(chatCommand.type) {
            case CommandType.WatchBuy:
            case CommandType.WatchSell:
                this.handleWatch(chatCommand);
                break;
            case CommandType.UnwatchBuy:
            case CommandType.UnwatchSell:
                this.handleUnwatch(chatCommand);
                break;
            case CommandType.ListWatch:
                this.handleListWatch(chatCommand.name, chatCommand.discordId);
                break;
            case CommandType.IgnoreAuctioneer:
                this.handleIgnoreAuctioneer(chatCommand);
            case CommandType.UnignoreAuctioneer:
                this.handleUnignoreAuctioneer(chatCommand);
        }
    }

    private handleListWatch(username: string, discordId: string) {
        console.debug('Listing ' + username + '\'s watches');
        this.sqlManager.getWatchByDiscordId(discordId).then((watches)=>{
            let message = 'You are watching:\n';
            for (const watch of watches) {
                const type = ChatManager.commandTypeToDescription(watch.type as AuctionType);
                message += type + ' ' + watch.text + '\n';
            }
            this.sendUserMessage(discordId, message);
        });
    }

    private handleIgnoreAuctioneer(chatCommand: ChatCommand) {
        console.debug('Ignoring ' + chatCommand.text + '\'s messages');
        this.sendUserMessage(chatCommand.discordId, 'Ignoring ' + chatCommand.text);
    }

    private handleWatch(chatCommand: ChatCommand) {
        console.debug('Subscribing ' + chatCommand.name + ' to ' + chatCommand.text);
        this.sendUserMessage(chatCommand.discordId, 'Subscribing you to ' + chatCommand.text);
    }

    private handleUnwatch(chatCommand: ChatCommand) {
        console.debug('Unsubscribed ' + chatCommand.name + ' from ' + chatCommand.text);
        this.sendUserMessage(chatCommand.discordId, 'Unsubscribed you from ' + chatCommand.text);
    }

    private handleUnignoreAuctioneer(chatCommand: ChatCommand) {
        console.debug('Unignored ' + chatCommand.text + ' by ' + chatCommand.name);
        this.sendUserMessage(chatCommand.discordId, 'Unignoring ' + chatCommand.text);
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
            user.send(message);
        });
    }

    public static commandTypeToDescription(auctionType: AuctionType) {
        switch(auctionType) {
            case AuctionType.Buy:
                return "WTB";
            case AuctionType.Sell:
                return "WTS";
            case AuctionType.Both:
                // return "Both";
            case AuctionType.Unknown:
                return "Unknwon";
        }
    }
}