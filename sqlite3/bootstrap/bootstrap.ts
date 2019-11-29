import { resolve } from "path";
import { Database } from "sqlite3";

const config = require('../../config.json');
const dbPath = resolve(config.sqlite3DBPath)

var db = new Database(dbPath);
db.serialize(function() {
    db.run("CREATE TABLE auctionWatches (name TEXT, discordId TEXT, watchedText TEXT, type INTEGER)");

    var stmt = db.prepare("INSERT INTO auctionWatches VALUES (?, ?, ?, ?)");
    stmt.run('xss', '378374141948067851', 'Ghoulbane', 1);
    stmt.finalize();

    db.each("SELECT rowid AS id, name, discordId, watchedText, type FROM auctionWatches", function(err, row) {
        console.log(row.id, row);
    });
});

db.close();