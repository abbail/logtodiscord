import { Database } from "sqlite3";
import { resolve } from "path";
import { existsSync, copyFileSync } from 'fs';

export class Bootstrap {
    private static database: Database;
    public static readonly defaultDatabaseLocation = resolve(__dirname, 'data-default.db');
    public static readonly databasePath = resolve(__dirname, 'data.db');

    constructor() {
        Bootstrap.database = new Database(resolve(Bootstrap.databasePath));
    }

    private installDatabase() {
        if (!existsSync(Bootstrap.databasePath)) {
            console.log('User database doesn\'t exist.  Using the default database.  This may take a minute.');
            copyFileSync(Bootstrap.defaultDatabaseLocation, Bootstrap.databasePath);
        }
    }

    run() {
        this.installDatabase();
        return Promise.all<Error | null>([this.createAuctionWatSchema(), this.boostrapItems()]);
    }

    private createAuctionWatSchema() {
        const promise = new Promise<Error | null>((resolvePromise) => {
            Bootstrap.database.run('CREATE TABLE IF NOT EXISTS auctionWatches (name TEXT, discordId TEXT, watchedText TEXT, type INTEGER)', (error) => {
                resolvePromise(error);
            });
        });
        return promise;
    }

    private boostrapItems() {
        const promise = new Promise<Error | null>((resolvePromise) => {
            Bootstrap.database.run('CREATE TABLE IF NOT EXISTS items (name INTEGER)', createResult => {
                Bootstrap.database.all("SELECT COUNT(*) AS count FROM items", (err, rows) => {
                    // if there aren't any items in the table
                    if (rows[0].count === 0) {
                        console.log('Database is missing items.  Reading them from default database.');
                        this.insertItems().then((error) => {
                            resolvePromise(error);
                        });
                    } else {
                        resolvePromise(null);
                    }
                });
            });
        });
        return promise;
    }

    private insertItems() {
        const promise = new Promise<Error>((resolvePromise) => {
            this.getDefaultItems().then((items) => {
                Bootstrap.database.serialize(() => {
                    const statement = Bootstrap.database.prepare("INSERT INTO items VALUES (?)");
                    for(const item of items) {
                        statement.run(item);
                    }

                    statement.finalize((err: Error) => {
                        resolvePromise(err);
                        console.log('Items imported.');
                    });
                });
            });
        });
        return promise;
    }

    private getDefaultItems() {
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