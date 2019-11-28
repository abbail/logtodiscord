import { LogManager } from './log-manager'
import { Auction, AuctionType } from './auction';
import { Client, TextChannel, RichEmbed } from 'discord.js';

const fileToWatch = 'C:/Program Files (x86)/Sony/EverQuest/Logs/eqlog_Sprout_P1999Green.txt';
const logManager: LogManager = new LogManager(fileToWatch);
const client = new Client();
client.login('token goes here');

client.on('ready', () => {
  console.log('Logged in as', client.user.tag);
  initLogManager();
});

function initLogManager() {
  logManager.logStream.subscribe((logLine) => {
    if (logLine.isAuction) {
      const auction = new Auction(logLine.logLine);
      handleAuction(auction);
    } 
    /*
    else {
      console.log(logLine.logLine);
    }
    */
  });
}

function handleAuction(auction: Auction) {
  const richEmbed = new RichEmbed();
  richEmbed.setTitle(auction.auctioneer);
  richEmbed.setDescription(auction.body);

  switch(auction.type) {
    case AuctionType.Buy:
      console.log('BUY', auction.body);
      richEmbed.setColor(0x5555FF);
      break;
    case AuctionType.Sell:
      console.log('SELL', auction.body);
      richEmbed.setColor(0x55FF55);
      break;
    case AuctionType.Both:
      console.log('BOTH', auction.body);
      richEmbed.setColor(0x22FFFF);
      break;
    case AuctionType.Other:
      console.log('OTHER', auction.body);
      richEmbed.setColor(0x555555);
      break;
  }
  broadcastMessage(richEmbed);
}

function broadcastMessage(richEmbed: RichEmbed) {
  client.channels.tap((channel, key, collection)=>{
    if (channel instanceof TextChannel) {
      channel.send(richEmbed);
    }
  });
}
