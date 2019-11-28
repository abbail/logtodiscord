"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chokidar_1 = __importDefault(require("chokidar"));
var fs_1 = __importDefault(require("fs"));
var FILE_TO_WATCH = 'log.txt';
var watcher = chokidar_1.default.watch(FILE_TO_WATCH, { persistent: true });
watcher.on('change', handleLogChange);
function handleLogChange(fileName) {
    var stats = fs_1.default.statSync(fileName);
    var fileDescriptor = fs_1.default.openSync(fileName, 'r');
    console.log('-', stats.size, '-');
    var startPosition = stats.size > 1024 ? stats.size - 1024 : 0;
    var length = stats.size > 1024 ? 1024 : stats.size;
    var buffer = Buffer.alloc(1024);
    var bytesRead = fs_1.default.readSync(fileDescriptor, buffer, 0, length, startPosition);
    // console.log('<', startPosition, length, '>');
    // console.log(fileEndToLastLine(buffer));
    fs_1.default.closeSync(fileDescriptor);
}
function fileEndToLastLine(fileData) {
    var fileString = fileData.toString("utf8");
    return fileString;
}
