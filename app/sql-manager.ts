import { Database } from "sqlite3";
import { Bootstrap } from "./bootstrap";
import { Watch } from "./models/watch";
import { Ignore } from "./models/ignore";

export class SQLManager {
    private database: Database;
    public watches: Watch[] = [];
    public ignores: Ignore[] = [];

    constructor() {
        this.database = new Database(Bootstrap.databasePath);
        this.refreshWatchList();
        this.refreshIgnoreList();
    }

    private refreshWatchList() {
        this.database.serialize(() => {
            this.watches = [];

            this.database.each("SELECT name, discordId, watchedText, type FROM auctionWatches WHERE type IN (1,2)", (err, row) => {
                this.watches.push(new Watch(row.discordId, row.name, row.watchedText, row.type));
            });
        });
    }

    private refreshIgnoreList() {
        this.database.serialize(() => {
            this.watches = [];

            this.database.each("SELECT name, discordId, watchedText, type FROM auctionWatches WHERE type IN (5,6,7)", (err, row) => {
                this.ignores.push(new Ignore(row.discordId, row.name, row.watchedText, row.type));
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
                this.database.all("SELECT name, discordId, watchedText, type FROM auctionWatches WHERE type IN (1,2) AND discordId = ?", discordId, (err, rows) => {
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
        this.insertAuctionWatch(watch.name, watch.discordId, watch.text, watch.type).then((err) => {
            this.refreshWatchList();
        });
    }

    addIgnore(ignore: Ignore) {
        this.insertAuctionWatch(ignore.name, ignore.discordId, ignore.text, ignore.type).then((err) => {
            this.refreshIgnoreList();
        });
    }

    private insertAuctionWatch(name: string, discordId: string, text: string, type: number) {
        const promise = new Promise<Error | null>((resolvePromise) => {
            this.database.serialize(() => {
                const statement = this.database.prepare("INSERT INTO auctionWatches VALUES (?, ?, ?, ?)");
                statement.run(name, discordId, text, type);
                statement.finalize((err) => {
                    resolvePromise(err);
                });
            });
        });
        return promise;
    }

    removeWatch(watch: Watch) {
        this.deleteAuctionWatch(watch.discordId, watch.text, watch.type).then((err) => {
            this.refreshWatchList();
        });
    }

    removeIgnore(ignore: Ignore) {
        this.deleteAuctionWatch(ignore.discordId, ignore.text, ignore.type).then((err) => {
            this.refreshIgnoreList();
        });
    }

    deleteAuctionWatch(discordId: string, text: string, type: number) {
        const promise = new Promise<Error | null>((resolvePromise) => {
            this.database.serialize(() => {
                const statement = this.database.prepare("DELETE FROM auctionWatches WHERE discordId=? AND watchedText=? AND type=? COLLATE NOCASE");
                statement.run(discordId, text, type);
                statement.finalize((err) => {
                    resolvePromise(err);
                });
            });
        });
        return promise;
    }
}
