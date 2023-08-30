import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from "electron";
import path from "node:path";

// setup relevant directories
process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  // main config
  win = new BrowserWindow({
    // width: 1920,
    // height: 1080,
    transparent: true,
    frame: false,
    webPreferences: {
      // HACK: personal use only, extremely dangerous in production
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // load HTML document
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }

  // open dev tools with <C-S-i>
  win.webContents.on("before-input-event", (_, input) => {
    if (
      input.type === "keyDown" &&
      input.control &&
      input.shift &&
      input.key === "I"
    ) {
      if (win !== null) {
        win.webContents.isDevToolsOpened()
          ? win.webContents.closeDevTools()
          : win.webContents.openDevTools({ mode: "right" });
      }
    }
  });

  // ipcMain message passing example
  ipcMain.on("show-window", () => {
    win?.show();
  });

  ipcMain.on("hide-window", () => {
    win?.hide();
  });
}

// disable window closing on <C-w>
Menu.setApplicationMenu(null);

// house keeping
app.on("window-all-closed", () => {
  win = null;
});

// global shortcuts example
(async () => {
  await app.whenReady();

  globalShortcut.register("Alt+CommandOrControl+I", () => {
    console.log("Electron loves global shortcuts!");
    win?.show();
  });

  createWindow();
})();
