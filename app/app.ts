import { LogManager } from './log-manager'
import { ChatManager } from './chat-manager';
import { AuctionWatcher } from './auction-watcher';
import { SQLManager } from './sql-manager';

const config = require('../config.json');

const chatManager: ChatManager = new ChatManager(
    config.token
);

const auctionWatcher: AuctionWatcher = new AuctionWatcher(new SQLManager(config.sqlite3DBPath), new LogManager(config.logFilePath).logStream, chatManager);
