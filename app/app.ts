import { LogManager } from './log-manager';
import { ChatManager } from './chat-manager';
import { AuctionWatcher } from './auction-watcher';
import { SQLManager } from './sql-manager';
import config from '../config.json';
import { Bootstrap } from './bootstrap';

const bootstrap = new Bootstrap();

console.debug("Bootstrapping...");
bootstrap.run().then(error => {
  console.debug("Bootstrapping complete.");
  const sqlManager = new SQLManager();
  console.debug("Database open.");
  const logManager = new LogManager(config.logFilePath);
  console.debug("Chat Manager running.");
  const auctionWatcher: AuctionWatcher = new AuctionWatcher(sqlManager, logManager.logStream, config.token);
  console.debug("Preparing to log in...");

  /*
  setTimeout(() => {
    logManager.handleNewLogLine('[Wed Nov 27 10:53:58 2019] Tester auctions, \'WTB Brazen Brass Kilij or some junk.  Staff of Writhing, Cloak of Flames, Bronze Dagger\'');
  }, 1500);
  */
});

