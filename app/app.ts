import { LogManager } from './log-manager';
import { ChatManager } from './chat-manager';
import { AuctionWatcher } from './auction-watcher';
import { SQLManager } from './sql-manager';
import config from '../config.json';

const sqlManager = new SQLManager(config.sqlite3DBPath);
const logManager = new LogManager(config.logFilePath);
const chatManager: ChatManager = new ChatManager(config.token, sqlManager);
const auctionWatcher: AuctionWatcher = new AuctionWatcher(sqlManager, logManager.logStream, chatManager);

/*
setTimeout(() => {
  logManager.handleNewLogLine('[Wed Nov 27 10:53:58 2019] Tester auctions, \'WTB Brazen Brass Kilij or some junk.  Staff of Writhing, Cloak of Flames, Bronze Dagger\'');
}, 1500);
*/