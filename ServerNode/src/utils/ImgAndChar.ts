import isFileExistedAndCreate from "./isFileExistedAndCreate"
import fs from "fs"
import Log from "./Log"
import { ImgAndChar as IImgAndChar, ImgAndCharItem } from "../type"

const fileName = "../data/imgAndChar.json"
class ImgAndChar {
  imgAndChar: IImgAndChar = {}
  hasNewData: boolean = false
  keys: string[] = []

  constructor() {
    this._init()
    setInterval(() => {
      if (this.hasNewData) {
        this._updateFile()
      }
    }, 5000)
  }

  async _init() {
    const isExist = await isFileExistedAndCreate(fileName, "{}")
    if (isExist) {
      fs.open(fileName, "r", (e) => {
        if (e) {
          Log.error(`文件读取有误：${fileName}`)
        } else {
          fs.readFile(fileName, (e, data) => {
            if (e) {
              Log.error(`文件读取有误：${fileName}`)
            } else {
              this.imgAndChar = JSON.parse(data.toString())
              this.keys = Object.keys(this.imgAndChar)
            }
          })
        }
      })
    } else {
      Log.error(`文不存在且创建失败：${fileName}`)
    }
  }

  // 将数据更新到文件或从文件更新到内存
  async _updateFile(reverse = false) {
    return new Promise((resolve, reject) => {
      isFileExistedAndCreate(fileName, "{}").then((isExist) => {
        if (isExist) {
          if (!reverse) {
            fs.open(fileName, "r", (e) => {
              if (e) {
                Log.error(`文件读取有误：${fileName}`)
              } else {
                fs.writeFile(fileName, JSON.stringify(this.imgAndChar, null, 4), (e) => {
                  if (e) {
                    Log.error(`文件写入失败：${fileName}`)
                    Log.error(e)
                    reject(false)
                  } else {
                    Log.info(`文件写入成功：${fileName}`)
                    this.hasNewData = false
                    resolve(true)
                  }
                })
              }
            })
          } else {
            fs.open(fileName, "r", (e) => {
              if (e) {
                Log.error(`文件读取有误：${fileName}`)
                reject(false)
              } else {
                fs.readFile(fileName, (e, data) => {
                  if (e) {
                    Log.error(`文件读取有误：${fileName}`)
                    reject(false)
                  } else {
                    this.imgAndChar = JSON.parse(data.toString())
                    Log.info(`已更新内存数据：${fileName}`)
                    resolve(true)
                  }
                })
              }
            })
          }
        } else {
          Log.error(`文不存在且创建失败：${fileName}`)
          reject(false)
        }
      })
    })
  }

  get() {
    return this.imgAndChar
  }

  getByKey(key: string) {
    if (this.imgAndChar[key]) {
      return this.imgAndChar[key]
    }
    return "not exist"
  }

  getTotalPage(size: number) {
    return Math.ceil(this.keys.length / size)
  }

  getByPage(page: number, size: number) {
    const keys = this.keys.slice((page - 1) * size, page * size)
    const imgAndChar: IImgAndChar = {}
    keys.forEach((key) => {
      imgAndChar[key] = this.imgAndChar[key]
    })
    return imgAndChar
  }

  async set(imgAndChar: IImgAndChar) {
    this.imgAndChar = imgAndChar
    this.hasNewData = true
    this.keys = Object.keys(this.imgAndChar)
    return true
  }

  async setItem(key: string, item: ImgAndCharItem) {
    this.imgAndChar[key] = item
    this.hasNewData = true
    this.keys = Object.keys(this.imgAndChar)
    return true
  }
}

export default new ImgAndChar()
