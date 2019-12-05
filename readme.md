# About
Simple project for watching a, Everquest log file and sending matching auction entries to Discord.

## Quick Start
Rename or copy config.example.json to config.json.  Then enter your discord bot token and the path to your Everquest log file into config.json

To install this project's dependencies use:
```
npm install
```
To run ther server in development mode:
```
npm run dev
```
To run ther server in production mode:
```
npm run prod
```
## Bot Commands
The bot will respond to messages either in the chat channel or in a direct message.  These commands are not case sensitive.

To have the bot send you a message when it sees an item in an auction use:
```
watch WTS Stein of Maggok
watch WTB deathfist slashed belt
```
Similarly to remove a watched auction use:
```
unwatch WTS Golden Efreeti Boots
```
To list all items that you are currently watching for use:
```
list watch
```
