import {app, shell, BrowserWindow, ipcMain, Notification, Menu} from "electron";
import ViewHelper from "./ViewHelper";
import {renderFile} from 'node-twig';
import {Client, Message} from 'discord.js';
import ProfanityFilter from "./ProfanityFilter";
const defaultMenu = require('electron-default-menu');
const fs = require('fs');
const usrCfg = require('../app/usrcfg.json');

const client = new Client();

let mainWindow;

app.on('ready', () => {
    const menu = defaultMenu(app, shell);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
    mainWindow = new BrowserWindow({
        icon: __dirname+'/images/icon.png'
    });
    authenticateScreen();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

function authenticateScreen() {
    ViewHelper.renderFile('index', {
        title: 'Welcome',
        lastToken: usrCfg.lastUsedToken,
        warnMessage: usrCfg.warnMessage,
    }).then((html) => {
        mainWindow.loadURL(html);
    });

    ipcMain.on('tokenSubmit', (event, args) => {
        usrCfg.warnMessage = args.warnMessage;
        fs.writeFile(__dirname+'/usrcfg.json', JSON.stringify(usrCfg));
        authenticate(args.token);
    });
}

function authenticate(token) {
    ViewHelper.renderFile('authenticating', {
        title: 'Authenticating',
    }).then((html) => {
        mainWindow.loadURL(html);
        client.login(token).then( () => {
            usrCfg.lastUsedToken = token;
            fs.writeFile(__dirname+'/usrcfg.json', JSON.stringify(usrCfg));
            messageScreen();
        });
    });
}

function messageScreen() {
    ViewHelper.renderFile('messages', {
        title: 'Listening',
    }).then((html) => {
        mainWindow.loadURL(html);

        const messages = [];

        ipcMain.once('imHere', (event, arg) => {
            client.on('message', (message:Message) => {
                if(!message.author.bot){
                    messages[message.id] = message;
                    const profanityCheck = ProfanityFilter.check(message.content);
                    event.sender.send('message', {
                        message: message,
                        vulgairWords: profanityCheck,
                        isVulgair: profanityCheck.length > 0
                    });

                    if( profanityCheck.length > 0 ){
                        const notify = new Notification({
                            title: "Profanity alert",
                            subtitle: message.member.displayName+'('+profanityCheck.join(', ')+')',
                            body: message.content,
                            icon: __dirname+'/images/icon.png'
                        });
                        notify.show();
                    }
                }
            });

            ipcMain.on('tokenSubmit', (event, token) => {
                authenticate(token);
            });
        });

        ipcMain.on('deleteMessage', (event, id) => {
            messages[id].delete();
        });

        ipcMain.on('warn', (event, id) => {
            messages[id].reply(usrCfg.warnMessage);
        });

        ipcMain.on('warnAndDelete', (event, id) => {
            messages[id].reply(usrCfg.warnMessage);
            messages[id].delete();
        });

        ipcMain.on('mute', (event, id) => {
            messages[id].member.setMute(true);
        });

        ipcMain.on('kick', (event, id) => {
            messages[id].member.kick();
        });

        ipcMain.on('ban', (event, id) => {
            const message = messages[id];

            const banWindow = new BrowserWindow({
                width: 500,
                height: 415
            });
            banWindow.setAlwaysOnTop(true);

            ViewHelper.renderFile('ban', {
                title: 'Banning',
                username: message.member.displayName
            }).then((html) => {
                banWindow.loadURL(html);
            });

            banWindow.focus();

            ipcMain.once('confirmBan', (event, arg) => {
                message.member.ban(arg);
            });

            ipcMain.once('closeWindow', (event, id) => {
                banWindow.close();
            });
        });
    });
}
