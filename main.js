const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const globals = require("./global");
const { Storage } = require("./workers/storage");
const installer = require("./installer");
const { License } = require("./models/license");

let isLicense;

//Initializing functions
installer.install(app);
//installer.update();

globals.setAppDataPath();

let createWindow = async () => {
  let isMac = process.platform === "darwin" ? true : false;
  let iconName = isMac ? "Qrcode-logo-32.icns" : "Qrcode-logo-32.png";

  console.log("preloadPath==>", path.join(__dirname, "./main_preload.js"));

  const mainWindow = new BrowserWindow({
    width: 1450,
    height: 800,
    minWidth: 1450,
    minHeight: 800,
    autoHideMenuBar: true,
    maximizable: true,
    icon: path.join(__dirname, `./assets/icons/app-icon/${iconName}`),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "main_preload.js"),
    },
  });

  isLicense = new License(mainWindow);
  let isthereAlicense = await isLicense.checkLicense();

  console.log("isthere a license==>", isthereAlicense);

  if (!isthereAlicense) {
    mainWindow.loadFile("./screen/main/index.html");
  } else {
    mainWindow.loadFile("./screen/license/licenseIndex.html");
  }

  let wc = mainWindow.webContents;
  if (globals.debugMode) {
    wc.openDevTools({ mode: "undocked" });
  }
};

//Set the app path to appdata folder, app name
/* let setAppDataPath = () => {
  const usPath = path.join(
    app.getPath("appData"),
    `../Teknikforce/${app.name}`
  );

  if (!fs.existsSync(usPath)) {
    fs.mkdirSync(usPath);
  }

  app.setPath("appData", usPath);
}; */

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("generate-qrcode", async (event, details) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(details, {
      width: 300,
      height: 300,
      color: {
        dark: "#FFFFFF",
        light: "#2d278e",
      },
      correctLevel: 3,
    });
    event.sender.send("qrcode", qrCodeDataUrl);
  } catch (error) {
    console.error("Error generating QR code", error);
  }
});

ipcMain.handle("downloadQRCode", async (event, dataURL) => {
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
  const filenamePrefix = "myqrcode";
  const imageExtension = ["png", "jpg", "jpeg", "gif", "bmp", "webp"];
  const defaultFilename = `${filenamePrefix}${Date.now()}.${imageExtension[0]}`;
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Download QR code",
    defaultPath: defaultFilename,
    filters: [
      { name: "PNG", extensions: ["png"] },
      { name: "JPG", extensions: ["jpg"] },
      { name: "JPEG", extensions: ["jpeg"] },
      { name: "BMP", extensions: ["bmp"] },
      { name: "WEBP", extensions: ["webp"] },
    ],
  });

  if (!canceled && filePath) {
    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        console.error("Error saving file:", err);
      } else {
        console.log("File saved successfully");
      }
    });
  }
});

ipcMain.on("save-data", (event, data) => {
  let savedData = globals.storeQrdata.get("qrCodedata");
  let savedQrArr = savedData ? savedData : [];
  savedQrArr.push(data);
  globals.storeQrdata.set("qrCodedata", savedQrArr);
});

ipcMain.on("getSavedData", (event) => {
  let savedData = globals.storeQrdata.get("qrCodedata");
  event.sender.send("gotSavedData", savedData);
});

ipcMain.on("openExternalUrl", (e, url) => {
  shell.openExternal(url);
});

ipcMain.handle("deleteSavedData", (event, urlToDelete) => {
  deleteSavedData(urlToDelete);
});

// Request to getVersion of App//
ipcMain.on("getVersion", (event) => {
  event.sender.send("gotVersion", app.getVersion());
});

ipcMain.on("getLicense", (e, data) => {
  console.log("getLicense===>", data);
  isLicense.createNewLicenseOnline(data);
});
