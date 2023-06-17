const fs = require("fs");
const path = require("path");

class Storage {
  fileName;

  constructor(fileN) {
    this.fileName = fileN;
  }

  get(key) {
    let path = this.fileName;

    if (fs.existsSync(path)) {
      let jsonData = fs.readFileSync(path);

      if (jsonData != "") {
        let data = JSON.parse(jsonData);
        return data[key];
      } else return null;
    } else {
      return null;
    }
  }

  set(key, value) {
    let path = this.fileName;

    let data = {};
    if (fs.existsSync(path)) {
      let jsonData = fs.readFileSync(path);
      if (jsonData != "") data = JSON.parse(jsonData);
    }
    data[key] = value;

    fs.writeFileSync(path, JSON.stringify(data));
    return true;
  }
}

module.exports = { Storage };
