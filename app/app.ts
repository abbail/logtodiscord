import { LogManager } from './log-manager';
import { ChatManager } from './chat-manager';
import { AuctionWatcher } from './auction-watcher';
import { SQLManager } from './sql-manager';
import config from '../config.json';

const sqlManager = new SQLManager(config.sqlite3DBPath);
const logManager = new LogManager(config.logFilePath).logStream;
const chatManager: ChatManager = new ChatManager(config.token, sqlManager);
const auctionWatcher: AuctionWatcher = new AuctionWatcher(sqlManager, logManager, chatManager);
