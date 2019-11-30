import { Client, TextChannel, Message, RichEmbed } from 'discord.js';
import { DiscordDecoder } from './discord-decoder';

export class ChatManager {
    // discord.js client
    public client: Client;

    constructor(token: string) {
        // create a client
        this.client = new Client();
        // log in with the token
        this.client.login(token);
    }

    handleMessage(message: Message) {
        // ignore your own messages
        if (message.author.id !== this.client.user.id) {
            let watch = null;
            try {
                watch = DiscordDecoder.messageToWatch(message);
            } catch (errorText) {
                console.error(errorText);
                this.sendChannelMessage(message.channel as TextChannel, errorText);
                return;
            }

            if (DiscordDecoder.isWatch(message.content)) {
                console.debug('Subscribing ' + watch.name + ' to ' + watch.watchText);
                this.sendUserMessage(watch.discordId, 'Subscribing you to ' + watch.watchText)
                return watch;
            } else if (DiscordDecoder.isUnwatch(message.content)) {
                console.debug('Unsubscribed ' + watch.name + ' from ' + watch.watchText);
                this.sendUserMessage(watch.discordId, 'Unsubscribed you from ' + watch.watchText)
                watch.negated = true;
                return watch;
            } else {
                console.debug('Discord message seen that didn\'t look like a watch.');
            }
        }
    }
    
    broadcastMessage(message: string | RichEmbed) {
        // for every channel the bot is in
        this.client.channels.tap((channel)=>{
            // if the channel is a TextChannel
            if (channel instanceof TextChannel) {
                // send the message
                this.client.user.sendMessage
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
                user.sendMessage(message);
            }
        });
    }
}