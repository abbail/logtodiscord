import { Database } from "sqlite3";
import { resolve } from "path";
import { existsSync, copyFileSync } from 'fs';

export class Bootstrap {
    private database: Database;
    public static readonly defaultDatabaseLocation = resolve(__dirname, 'data-default.db');
    public static readonly databasePath = resolve(__dirname, 'data.db');

    constructor() {
        this.installDatabase();

        this.database = new Database(resolve(Bootstrap.databasePath));

        this.boostrapDatabase();
    }

    installDatabase() {
        if (!existsSync(Bootstrap.databasePath)) {
            console.log('User database doesn\'t exist.  Using the default database.');
            copyFileSync(Bootstrap.defaultDatabaseLocation, Bootstrap.databasePath);
        }
    }

    boostrapDatabase() {
        this.createAuctionWatSchema();
        this.boostrapItems();
    }

    createAuctionWatSchema() {
        this.database.run('CREATE TABLE IF NOT EXISTS auctionWatches (name TEXT, discordId TEXT, watchedText TEXT, type INTEGER)');
    }

    boostrapItems() {
        this.database.run('CREATE TABLE IF NOT EXISTS items (name INTEGER)', createResult => {
            this.database.all("SELECT COUNT(*) AS count FROM items", (err, rows) => {
                // if there aren't any items in the table
                if (rows[0].count === 0) {
                    console.log('Database is missing items.  Reading them from default database.');
                    this.insertItems();
                }
            });
        });
    }

    insertItems() {
        this.getDefaultItems().then((items) => {
            this.database.serialize(() => {
                const statement = this.database.prepare("INSERT INTO items VALUES (?)");
                for(const item of items) {
                    statement.run(item);
                }
                console.log('Items imported.');
            });
        });
    }

    getDefaultItems() {
        const defaultDatabase = new Database(resolve(Bootstrap.defaultDatabaseLocation));

        const promise = new Promise<string[]>((resolvePromise) => {
            const items: string[] = [];
            defaultDatabase.serialize(() => {
                defaultDatabase.all("SELECT name FROM items", (err, rows) => {
                    for (const row of rows) {
                        items.push(row.name);
                    }
                    resolvePromise(items);
                    defaultDatabase.close();
                });
            });
        });

        return promise;
    }
}