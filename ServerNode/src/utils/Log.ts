import isFileExistedAndCreate from "./isFileExistedAndCreate"
import fs from "fs"
import moment from "moment"

const fileName = "../nodeServerLog.txt"
const timeFomat = "YYYY-MM-DD HH:mm:ss x"

class Log {
  list: string[] = []
  constructor() {
    setInterval(async () => {
      if (this.list.length > 0) {
        console.log("写入记录条数: ", this.list.length)
        const appendData = this.list.join("\r\n")
        this.list = []
        const appendSuccess = await this.append(appendData)
        // 如果写入失败， 还原内存中的日志
        // 等待写入完成还会有新的日志输入， 所以需要追加this.list
        if (!appendSuccess) {
          const temp = appendData.split("\r\n")
          this.list = [...temp, ...this.list]
        }
      }
    }, 5000)
  }
  append(message: string | NodeJS.ErrnoException) {
    return new Promise((resolve) => {
      isFileExistedAndCreate(fileName, `创建日志文件${moment().format(timeFomat)}`).then(
        (isExist) => {
          if (isExist) {
            fs.open(fileName, "r", (e, fd) => {
              if (e) {
                console.error(`日志读取有误：${fileName}`)
                fs.close(fd, () => {
                  resolve(false)
                })
              } else {
                fs.readFile(fileName, (e, data) => {
                  if (e) {
                    console.error(`日志读取有误：${fileName}`)
                    fs.close(fd, () => {
                      resolve(false)
                    })
                  } else {
                    fs.writeFile(fileName, data + "\r\n" + message, (e) => {
                      if (e) {
                        console.error(`日志写入失败：${fileName}`)
                        console.error(e)
                        fs.close(fd, () => {
                          resolve(false)
                        })
                      } else {
                        console.log(`日志写入成功：${fileName}`)
                        fs.close(fd, () => {
                          resolve(true)
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        }
      )
    })
  }

  error(message: string | NodeJS.ErrnoException) {
    let _message = `error(${moment().format(timeFomat)}): ${message}`
    console.error(_message)
    this.list.push(_message)
  }

  info(message: string | NodeJS.ErrnoException) {
    let _message = `info(${moment().format(timeFomat)}): ${message}`
    console.log(_message)
    this.list.push(_message)
  }

  warn(message: string | NodeJS.ErrnoException) {
    let _message = `warn(${moment().format(timeFomat)}): ${message}`
    console.warn(_message)
    this.list.push(_message)
  }
}

export default new Log()
