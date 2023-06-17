const { contextBridge, ipcRenderer } = require("electron");

let openExternalURL = (url) => {
  ipcRenderer.send("openExternalUrl", url);
};

let setWebsite = (details) => {
  ipcRenderer.send("generate-qrcode", details);
};

let qrdetails = (qrcodeContainer) => {
  ipcRenderer.on("qrcode", qrcodeContainer);
};

let downloadQRCode = (qrcodeContainer) => {
  ipcRenderer.invoke("downloadQRCode", qrcodeContainer);
};

let SaveQRCode = (data) => {
  ipcRenderer.send("save-data", data);
};

let getSavedData = () => {
  ipcRenderer.send("getSavedData");
};

let gotSavedData = (dt) => {
  ipcRenderer.on("gotSavedData", dt);
};

let getVersion = () => {
  ipcRenderer.send("getVersion");
};

let gotVersion = (callback) => {
  ipcRenderer.on("gotVersion", callback);
};

/* contextBridge.exposeInMainWorld("Bridge", {
  setWebsite,
  qrdetails,
  openExternalURL,
  downloadQRCode,
  SaveQRCode,
  getSavedData,
  gotSavedData,
  getVersion,
  gotVersion,
}); */

let mainPreloadBridge = {
  setWebsite,
  qrdetails,
  openExternalURL,
  downloadQRCode,
  SaveQRCode,
  getSavedData,
  gotSavedData,
  getVersion,
  gotVersion,
};

module.exports = mainPreloadBridge;
