import isFileExistedAndCreate from "./isFileExistedAndCreate"
import fs from "fs"
import Log from "./Log"
import { ImgIdToMd5Map as IImgIdToMd5Map } from "../types"

const fileName = "../data/imgIdToMd5Map.json"
class ImgIdToMd5Map {
  private static instance: ImgIdToMd5Map
  imgIdToMd5Map: IImgIdToMd5Map = {}
  keys: string[] = []
  hasNewData = false

  private constructor() {
    this._init()
    setInterval(() => {
      if (this.hasNewData) {
        this._updateFile()
      }
    }, 5000)
  }

  public static getInstance() {
    if(!ImgIdToMd5Map.instance){
      ImgIdToMd5Map.instance = new ImgIdToMd5Map()
    }
    return ImgIdToMd5Map.instance
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
              this.imgIdToMd5Map = JSON.parse(data.toString("utf-8"))
              this.keys = Object.keys(this.imgIdToMd5Map)
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
                fs.writeFile(fileName, JSON.stringify(this.imgIdToMd5Map, null, 4), (e) => {
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
                    this.imgIdToMd5Map = JSON.parse(data.toString("utf-8"))
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
    return this.imgIdToMd5Map
  }

  getByImgId(imgId: string) {
    return this.imgIdToMd5Map[imgId]
  }

  getTotalPage(size: number) {
    return Math.ceil(this.keys.length / size)
  }

  getByPage(page: number, size: number) {
    const keys = this.keys.slice((page - 1) * size, page * size)
    const imgIdToMd5Map: IImgIdToMd5Map = {}
    keys.forEach((key) => {
      imgIdToMd5Map[key] = this.imgIdToMd5Map[key]
    })
    return imgIdToMd5Map
  }

  async set(imgIdToMd5Map:IImgIdToMd5Map) {
    this.imgIdToMd5Map = imgIdToMd5Map
    this.hasNewData = true
    this.keys = Object.keys(this.imgIdToMd5Map)
    return true
  }

  async setByImgId(imgId: string, md5Id: string) {
    this.imgIdToMd5Map[imgId] = md5Id
    this.hasNewData = true
    this.keys = Object.keys(this.imgIdToMd5Map)
    return true
  }
}

export default ImgIdToMd5Map
