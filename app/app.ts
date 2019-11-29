import { LogManager } from './log-manager'
import { ChatManager } from './chat-manager';

const config = require('../config.json');

const logManager: LogManager = new LogManager(config.logFilePath);
const chatManager: ChatManager = new ChatManager(config.token, logManager.logStream);
