import { Database } from "sqlite3";
import { resolve } from "path";
import { Watch } from "./watch";

export class SQLManager {
    private database: Database;
    public watches: Watch[] = [];

    constructor(databasePath: string) {
        this.database = new Database(resolve(databasePath));
        this.refreshWatchList();
    }

    private refreshWatchList() {
        this.database.serialize(() => {
            this.watches.slice();
            this.database.each("SELECT name, discordId, watchedText, type FROM auctionWatches", (err, row) => {
                this.watches.push(new Watch(row.discordId, row.name, row.watchedText, row.type));
            });
        });
    }

    addWatch(watch: Watch) {
        this.database.serialize(() => {
            var stmt = this.database.prepare("INSERT INTO auctionWatches VALUES (?, ?, ?, ?)");
            stmt.run(watch.name, watch.discordId, watch.watchText, watch.type);
            stmt.finalize();

            this.refreshWatchList();
        });
    }
       
    removeWatch(watch: Watch) {
        this.database.serialize(() => {
            var stmt = this.database.prepare("DELETE FROM auctionWatches WHERE discordId=? AND watchedText=? AND type=?");
            stmt.run(watch.discordId, watch.watchText, watch.type);
            stmt.finalize();

            this.refreshWatchList();
        });
    }

}