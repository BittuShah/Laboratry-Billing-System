const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");

//SET ENV
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

const menu = [
  {
    label: "New",
  },
  {
    label: "Receipts",
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectall" },
    ],
  },
  {
    label: "Exit",
    click: function () {
      app.quit();
    },
    accelerator: "Alt + F4",
  },
  {
    label: "Developer",
    submenu: [{ role: "reload" }, { role: "toggledevtools" }],
  },
];

let mainWindow;
let aboutWindow;

//for createing a main widnow
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Jay Laboratry",
    // width: 500,
    // height: 600,
    // icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.maximize();
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }
  mainWindow.loadFile("./index.html");
}

//for creating a about window
function createAboutWindow(info) {
  aboutWindow = new BrowserWindow({
    title: "Developer Info",
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });
  aboutWindow.maximize();
  aboutWindow.loadFile("./app/about.html");
}

function createAboutInstaWindow() {
  aboutWindow = new BrowserWindow({
    title: "Developer Instagram",
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });
  aboutWindow.maximize();
  aboutWindow.loadURL("https://www.instagram.com/n__i__s__u/");
}

app.on("ready", () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  mainWindow.on("ready", () => (mainWindow = null));
});

ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageshrink");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });

    log.info(files);

    //     Changed from shell.openItem() for v9
    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (err) {
    log.error(err);
  }
}
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
