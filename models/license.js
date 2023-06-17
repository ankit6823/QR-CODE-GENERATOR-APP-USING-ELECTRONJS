const { app } = require("electron");
const path = require("path");
const fs = require(`fs`);
const macAddr = require("macaddress");
const cryptoJs = require("crypto-js");
const os = require("os");
const axios = require("axios");
const global = require("../global");
const { dataDir } = require("../global");

class License {
  #appDataPath = null;
  #CRYPTOKEY = "f2at96w4";
  #ACCESSKEY = "Smooth river never made a skilful sailor";
  #CREATEKEY = "e6Dssd3d";
  #PRODCODE = "qrcodegenapp";
  #USECOUNT_THRESHOLD = 10;

  constructor(window, appDataPath) {
    this.#appDataPath = appDataPath;
    this.window = window;
  }

  /*
    Workflow: 
    Check whether there's a license file present. 
    If it's there, try to get data from it.
    If the data is valid and usecount is below threshold  , return true.
    If the file is not there or the data is not valid, return false.

    In checkLicense, we will check license on drive.

    In checkLicenseOnline, we will just verify the license with the online api.

    In createNewLicenseOnline, we will request a new license for the user and save the resulting info.


    ===

    Implementing

    On app start, checkLicense() will be called. If it returns false, we will show the license window.

    The license window will have name and email field. Validate email and name, and on success, call createNewLicenseOnline().

    */

  checkLicense = async () => {
    let licData = this.getLicense();

    if (licData !== null) {
      if (licData.useCount >= this.#USECOUNT_THRESHOLD) {
        let result = await checkLicenseOnline(licData);
        if (result.result) {
          licData.useCount = 0;
          this.saveLicense(licData);
          return true;
        }
      } else {
        licData.useCount++;

        console.log("licData in checkLicense===>", licData);
        this.saveLicense(licData);
        return true;
      }
    } else {
      return false;
    }
  };

  checkLicenseOnline = async (licData) => {
    const { saleCode, usedCount, maccAddr, email, name } = licData;
    const url = "https://teknikforce.com/api/getsale";

    const formData = new FormData();
    formData.append("secret", this.#ACCESSKEY);
    formData.append("licence", saleCode);

    const response = await axios.post(url, formData);

    if (response.status == 200) {
      const macAddr = this.getMacAddr();
      const data = JSON.parse(response.data);

      if (data.value.status == "Pending") {
        return { result: false, message: "LicensePending" };
      } else if (
        data.value.status == "Executed" &&
        macAddr == data.value.custmacaddr
      ) {
        return { result: true };
      } else {
        return { result: false, message: "LicenseInvalid" };
      }
    }
  };

  createNewLicenseOnline = async (dt) => {
    let name, email;
    name = dt.name;
    email = dt.email;

    const maccAddr = this.getMacAddr();
    const url = "https://teknikforce.com/api/createbonus";

    const formData = new FormData();
    formData.append("secret", this.#CREATEKEY);
    formData.append("appcode", this.#PRODCODE);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("macAddr", maccAddr);

    const response = await axios.post(url, formData);

    if (response.status == 200) {
      const saleCode = response.statusText;
      const licData = { saleCode, usedCount: 0, maccAddr, email, name };
      this.saveLicense(licData);
      this.window.webContents.send("savedLicense", true);
    } else if (response.status == 401) {
      return { result: false, message: "InvalidCode" };
    } else if (response.status == 400) {
      return { result: false, message: "AlreadyExists" };
    } else {
      return { result: false, message: "UnknownError" };
    }
  };

  getLicense = () => {
    try {
      let licensePath = this.getLicFilePath();
      let licData = fs.readFileSync(licensePath, "utf8");
      console.log("licData===>", licData);

      licData = JSON.parse(licData);
      licData.saleCode = cryptoJs.AES.decrypt(
        licData.saleCode,
        this.#CRYPTOKEY
      );
      licData.usedCount = cryptoJs.AES.decrypt(
        licData.usedCount,
        licData.saleCode
      );

      return licData;
    } catch (e) {
      console.log("error in getLicense==>", e);
      return null;
    }
  };

  /*   isLicenseFileExisting = () => {
    const fileExists = fs.existsSync(this.getLicFilePath());
    return fileExists;
  }; */

  saveLicense = (licInfo) => {
    licInfo.usedCount = cryptoJs.AES.encrypt(
      licInfo.usedCount,
      licInfo.saleCode
    ).toString(cryptoJs.enc.Utf8);

    licInfo.saleCode = cryptoJs.AES.encrypt(
      licInfo.saleCode,
      this.#CRYPTOKEY
    ).toString(cryptoJs.enc.Utf8);

    let licensePath = this.getLicFilePath();
    fs.writeFileSync(licensePath, JSON.stringify(licInfo));
  };

  getMacAddr = () => {
    return Object.values(os.networkInterfaces())
      .flat()
      .find(({ mac }) => mac !== "00:00:00:00:00:00" && !mac.startsWith("fe:"))
      .mac;
  };

  getLicFilePath = () => {
    /* const appDataPath = app.getPath("appData");
    return path.join(appDataPath, "lic.json"); */

    const licPath = path.join(global.dataDir, "lic.json");
    return licPath;
  };
}

module.exports = { License };
