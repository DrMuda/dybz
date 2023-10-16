import isFileExistedAndCreate from "./isFileExistedAndCreate"
import fs from "fs"
import Log from "./Log"
import { Md5ToCharMap as IMd5ToCharMap, ImgAndCharItem } from "../types"

const fileName = "../data/md5ToCharMap.json"
class Md5ToCharMap {
  private static instance: Md5ToCharMap
  md5ToCharMap: IMd5ToCharMap = {}
  hasNewData: boolean = false
  keys: string[] = []

  private constructor() {
    this._init()
    setInterval(() => {
      if (this.hasNewData) {
        this._updateFile()
      }
    }, 5000)
  }

  public static getInstance() {
    if (!Md5ToCharMap.instance) {
      Md5ToCharMap.instance = new Md5ToCharMap()
    }
    return Md5ToCharMap.instance
  }

  private async _init() {
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
              this.md5ToCharMap = JSON.parse(data.toString())
              this.keys = Object.keys(this.md5ToCharMap)
            }
          })
        }
      })
    } else {
      Log.error(`文不存在且创建失败：${fileName}`)
    }
  }

  // 将数据更新到文件或从文件更新到内存
  private async _updateFile(reverse = false) {
    return new Promise((resolve, reject) => {
      isFileExistedAndCreate(fileName, "{}").then((isExist) => {
        if (isExist) {
          if (!reverse) {
            fs.open(fileName, "r", (e) => {
              if (e) {
                Log.error(`文件读取有误：${fileName}`)
              } else {
                fs.writeFile(fileName, JSON.stringify(this.md5ToCharMap, null, 4), (e) => {
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
                    this.md5ToCharMap = JSON.parse(data.toString())
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
    return this.md5ToCharMap
  }

  getByKey(key: string) {
    if (this.md5ToCharMap[key]) {
      return this.md5ToCharMap[key]
    }
    return null
  }

  getTotalPage(size: number) {
    return Math.ceil(this.keys.length / size)
  }

  getByPage(page: number, size: number) {
    const keys = this.keys.slice((page - 1) * size, page * size)
    const md5ToCharMap: IMd5ToCharMap = {}
    keys.forEach((key) => {
      md5ToCharMap[key] = this.md5ToCharMap[key]
    })
    return md5ToCharMap
  }

  async set(md5ToCharMap: IMd5ToCharMap) {
    this.md5ToCharMap = md5ToCharMap
    this.hasNewData = true
    this.keys = Object.keys(this.md5ToCharMap)
    return true
  }

  async setItem(key: string, item: ImgAndCharItem) {
    this.md5ToCharMap[key] = item
    this.hasNewData = true
    this.keys = Object.keys(this.md5ToCharMap)
    return true
  }
}

export default Md5ToCharMap
