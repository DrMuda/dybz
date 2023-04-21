import fs from "fs"
import path from "path"

export default function (filePath: string, defaultData = "") {
  return new Promise((resolve, reject) => {
    fs.access(filePath, (err) => {
      if (err) {
        const pathDir = path.dirname(filePath)
        fs.mkdir(pathDir, () => {
          fs.appendFile(filePath, defaultData, "utf-8", (err) => {
            if (err) {
              console.log(`${filePath}; 该文件不存在，重新创建失败！`)
              reject(false)
            } else {
              console.log(`${filePath}; 文件不存在，已重新创建`)
              resolve(true)
            }
          })
        })
      } else {
        resolve(true)
      }
    })
  })
}
