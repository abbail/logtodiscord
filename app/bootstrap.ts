import { Database } from "sqlite3";
import { resolve } from "path";
import { createReadStream, existsSync, copyFileSync } from 'fs';
import * as fs from 'fs';
import csv from 'csv-parser';

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
                    console.log('Database is missing items.  Reading items.csv.');
                    this.insertItems();
                }
            });
        });
    }

    insertItems() {
        this.database.serialize(() => {
            const statement = this.database.prepare("INSERT INTO items VALUES (?)");
            // TODO: eventually this should use the default database since we are shipping this data twice
            createReadStream('app/items.csv').pipe(csv())
            .on('data', (row: any) => {
                statement.run(row.name);
            })
            .on('end', () => {
                console.log('Done parsing items csv.  Inserting items.  This may take a minute...');
                statement.finalize(() => {
                    console.log('Done inserting items.');
                });
            });
        });
    }
}