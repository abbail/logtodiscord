import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs';
import { Subject } from 'rxjs';
import { LogEntry } from './log-entry';

export class LogManager {
    // 512 is plenty
    private bufferSize = 512;
    // for storing file reads
    private buffer: Buffer;
    // acctual file watcher
    private watcher: FSWatcher;

    // for subscribing to in order to see log entries in real time
    public logStream: Subject<LogEntry> = new Subject<LogEntry>();

    constructor (filePath: string) {
        // init the file change watcher for the correct path
        this.watcher = chokidar.watch(filePath, { persistent: true });
        // allocate the buffer for file reads later
        this.buffer = Buffer.alloc(this.bufferSize);
        // start watching for file changes
        this.watcher.on('change', (fileName: string) => this.handleFileChange(fileName));
    }

    public handleNewLogLine(logLine: string) {
        // don't process blank log lines
        if(logLine.length) {
            // send the log entry to everyone who is subscribed
            this.logStream.next(new LogEntry(logLine));
        }
    }

    private readFileLastLine(fileName: string, fileSize: number) {
        // open the file for reading
        const fileDescriptor = fs.openSync(fileName, 'r');
        // only read the end of the file, these files can be big and run you out of memory
        const startPosition = fileSize > this.bufferSize ? fileSize - this.bufferSize : 0;
        // do the actual read
        fs.readSync(fileDescriptor, this.buffer, 0, this.bufferSize, startPosition);
        // close the file now that we are done
        fs.closeSync(fileDescriptor);
        // only get the last line and return it
        return this.fileContentsEndToLastLine(this.buffer);
    }

    private fileContentsEndToLastLine(fileData: Buffer) {
        // decode the buffer as utf8 data
        const fileString = fileData.toString("utf8");
        // break the contents in to individual lines
        const logLines = fileString.split('\r\n');
        // the last line is just empty so ignore it
        return logLines[logLines.length - 2];
    }

    private handleFileChange(fileName: string) {
        // use stats to get the file size
        const stats = fs.statSync(fileName);
        // get the last line of the file
        const logLine = this.readFileLastLine(fileName, stats.size);
        // process the most recent log file entry
        this.handleNewLogLine(logLine);
    }
}