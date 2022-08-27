/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import os, { NetworkInterfaceInfo } from 'os';
import axios from 'axios';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
interface AdressInterface {
  name: string;
  address: string;
}
interface JsonDataBaseInterface {
  connection?: boolean;
  addresses?: AdressInterface[];
}
const jsonDatabase: JsonDataBaseInterface = {
  connection: false,
  addresses: [],
};
const fetchInterfaces = async () => {
  let lastInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = {};
  const addressesAll: AdressInterface[] = [];
  const interfacesReal: NodeJS.Dict<NetworkInterfaceInfo[]> =
    os.networkInterfaces();
  if (interfacesReal !== lastInterfaces && interfacesReal !== null) {
    lastInterfaces = interfacesReal;
    try {
      const ip = await axios.get('https://api.ipify.org');
      if (ip?.data) {
        jsonDatabase.connection = true;
        addressesAll.push({ name: 'WAN', address: ip.data });
      } else jsonDatabase.connection = false;
    } catch (err) {
      jsonDatabase.connection = true;
    }
    for (const key of Object.keys(interfacesReal)) {
      const k: NetworkInterfaceInfo[] = interfacesReal[
        key
      ] as NetworkInterfaceInfo[];
      for (const k2 of k) {
        if (k2.family === 'IPv4' && !k2.internal) {
          addressesAll.push({ name: key, address: k2.address });
        }
      }
    }
  }
  jsonDatabase.addresses = addressesAll;
  setTimeout(() => fetchInterfaces(), 1000);
};
fetchInterfaces();
let mainWindow: BrowserWindow | null = null;

ipcMain.on('get-connection-and-adresses', async (event) => {
  const returnData: JsonDataBaseInterface = {
    connection: jsonDatabase.connection,
    addresses: jsonDatabase.addresses,
  };
  event.reply('get-connection-and-adresses', returnData);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 300,
    height: 300,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    resizable: false,
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  if (isDebug) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
