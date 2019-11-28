import { LogManager } from './log-manager'
import { Auction, AuctionType } from './auction';

const fileToWatch = 'C:/Program Files (x86)/Sony/EverQuest/Logs/eqlog_Sprout_P1999Green.txt';
const logManager: LogManager = new LogManager(fileToWatch);

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

function handleAuction(auction: Auction) {
  switch(auction.type) {
    case AuctionType.Buy:
      console.log('BUY', auction.body);
      break;
    case AuctionType.Sell:
      console.log('SELL', auction.body);
      break;
    case AuctionType.Both:
      console.log('BOTH', auction.body);
      break;
    case AuctionType.Other:
      console.log('OTHER', auction.body);
      break;
  }
}