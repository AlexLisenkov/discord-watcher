"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ViewHelper_1 = require("./ViewHelper");
const discord_js_1 = require("discord.js");
const ProfanityFilter_1 = require("./ProfanityFilter");
const fs = require('fs');
const usrCfg = require('../app/usrcfg.json');
const client = new discord_js_1.Client();
let mainWindow;
electron_1.app.on('ready', () => {
    mainWindow = new electron_1.BrowserWindow();
    authenticateScreen();
});
function authenticateScreen() {
    ViewHelper_1.default.renderFile('index', {
        title: 'Welcome',
        lastToken: usrCfg.lastUsedToken,
        warnMessage: usrCfg.warnMessage,
    }).then((html) => {
        mainWindow.loadURL(html);
    });
    electron_1.ipcMain.on('tokenSubmit', (event, args) => {
        usrCfg.warnMessage = args.warnMessage;
        fs.writeFile(__dirname + '/usrcfg.json', JSON.stringify(usrCfg));
        authenticate(args.token);
    });
}
function authenticate(token) {
    ViewHelper_1.default.renderFile('authenticating', {
        title: 'Authenticating',
    }).then((html) => {
        mainWindow.loadURL(html);
        client.login(token).then(() => {
            usrCfg.lastUsedToken = token;
            fs.writeFile(__dirname + '/usrcfg.json', JSON.stringify(usrCfg));
            messageScreen();
        });
    });
}
function messageScreen() {
    ViewHelper_1.default.renderFile('messages', {
        title: 'Listening',
    }).then((html) => {
        mainWindow.loadURL(html);
        const messages = [];
        electron_1.ipcMain.once('imHere', (event, arg) => {
            client.on('message', (message) => {
                if (!message.author.bot) {
                    messages[message.id] = message;
                    const profanityCheck = ProfanityFilter_1.default.check(message.content);
                    event.sender.send('message', {
                        message: message,
                        vulgairWords: profanityCheck,
                        isVulgair: profanityCheck.length > 0
                    });
                    if (profanityCheck.length > 0) {
                        const notify = new electron_1.Notification({
                            title: "Profanity alert",
                            subtitle: message.member.displayName + '(' + profanityCheck.join(', ') + ')',
                            body: message.content,
                            icon: __dirname + '/images/icon.png'
                        });
                        notify.show();
                    }
                }
            });
            electron_1.ipcMain.on('tokenSubmit', (event, token) => {
                authenticate(token);
            });
        });
        electron_1.ipcMain.on('deleteMessage', (event, id) => {
            messages[id].delete();
        });
        electron_1.ipcMain.on('warn', (event, id) => {
            messages[id].reply(usrCfg.warnMessage);
        });
        electron_1.ipcMain.on('warnAndDelete', (event, id) => {
            messages[id].reply(usrCfg.warnMessage);
            messages[id].delete();
        });
        electron_1.ipcMain.on('mute', (event, id) => {
            messages[id].member.setMute(true);
        });
        electron_1.ipcMain.on('kick', (event, id) => {
            messages[id].member.kick();
        });
        electron_1.ipcMain.on('ban', (event, id) => {
            const message = messages[id];
            const banWindow = new electron_1.BrowserWindow({
                width: 500,
                height: 415
            });
            banWindow.setAlwaysOnTop(true);
            ViewHelper_1.default.renderFile('ban', {
                title: 'Banning',
                username: message.member.displayName
            }).then((html) => {
                banWindow.loadURL(html);
            });
            banWindow.focus();
            electron_1.ipcMain.once('confirmBan', (event, arg) => {
                message.member.ban(arg);
            });
            electron_1.ipcMain.once('closeWindow', (event, id) => {
                banWindow.close();
            });
        });
    });
}
//# sourceMappingURL=main.js.map