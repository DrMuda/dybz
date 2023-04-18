const fs = require("fs");
module.exports = function (path_way, defaultData = "") {
  return new Promise((resolve, reject) => {
    fs.access(path_way, (err) => {
      if (err) {
        fs.mkdir("../data/", () => {
          fs.appendFile(path_way, defaultData, "utf-8", (err) => {
            if (err) {
              console.log(`${path_way}; 该文件不存在，重新创建失败！`);
              reject(false);
            } else {
              console.log(`${path_way}; 文件不存在，已重新创建`);
              resolve(true);
            }
          });
        });
      } else {
        resolve(true);
      }
    });
  });
};
