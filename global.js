const path = require("path");
const { Storage } = require("./workers/storage");
const { app } = require("electron");
const fs = require("fs");

const APPNAME = "QRCode";
const APPCODE = "qrcodeapp";
const API_URL = "https://teknikforce.com/api/";
const FREE_APP_API_SECRET = "FaUR5TyK";

const dataDir = path.join(
  app.getPath("appData"),
  `\\Teknikforce\\${APPNAME}\\userdata`
);

let setAppDataPath = () => {
  const usPath = path.join(
    app.getPath("appData"),
    `../Teknikforce/${app.name}`
  );

  if (!fs.existsSync(usPath)) {
    fs.mkdirSync(usPath);
  }

  app.setPath("appData", usPath);
};

try {
  fs.accessSync(dataDir);
} catch {
  fs.mkdirSync(dataDir, { recursive: true });
}

const storeQrdata = new Storage(path.join(dataDir, "qrdata.json"));

module.exports = {
  appName: APPNAME,
  debugMode: true,
  dataDir: dataDir,
  storeQrdata: storeQrdata,
  appCode: APPCODE,
  setAppDataPath,
};
