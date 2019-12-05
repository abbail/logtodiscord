import { Database } from "sqlite3";
import { resolve } from "path";
import { Watch } from "./watch";
import { Bootstrap } from "./bootstrap";

export class SQLManager {
    private database: Database;
    public watches: Watch[] = [];

    constructor() {
        this.database = new Database(resolve(Bootstrap.databasePath));
        this.refreshWatchList();
    }

    private refreshWatchList() {
        this.database.serialize(() => {
            this.watches = [];

            this.database.each("SELECT name, discordId, watchedText, type FROM auctionWatches", (err, row) => {
                this.watches.push(new Watch(row.discordId, row.name, row.watchedText, row.type));
            });
        });
    }

    getItems() {
        const promise = new Promise<string[]>((resolvePromise) => {
            const items: string[] = [];
            this.database.serialize(() => {
                this.database.all("SELECT name FROM items", (err, rows) => {
                    for (const row of rows) {
                        items.push(row.name);
                    }
                    resolvePromise(items);
                });
            });
        });

        return promise;
    }

    getWatchByDiscordId(discordId: string) {
        const promise = new Promise<Watch[]>((resolvePromise) => {
            const userWatches: Watch[] = [];
            this.database.serialize(() => {
                this.database.all("SELECT name, discordId, watchedText, type FROM auctionWatches WHERE discordId = ?", discordId, (err, rows) => {
                    for (const row of rows) {
                        userWatches.push(new Watch(row.discordId, row.name, row.watchedText, row.type));
                    }
                    resolvePromise(userWatches);
                });
            });
        });

        return promise;
    }

    addWatch(watch: Watch) {
        this.database.serialize(() => {
            const statement = this.database.prepare("INSERT INTO auctionWatches VALUES (?, ?, ?, ?)");
            statement.run(watch.name, watch.discordId, watch.watchText, watch.type);
            statement.finalize();

            this.refreshWatchList();
        });
    }

    removeWatch(watch: Watch) {
        this.database.serialize(() => {
            const statement = this.database.prepare("DELETE FROM auctionWatches WHERE discordId=? AND watchedText=? AND type=?");
            statement.run(watch.discordId, watch.watchText, watch.type);
            statement.finalize();

            this.refreshWatchList();
        });
    }

}
