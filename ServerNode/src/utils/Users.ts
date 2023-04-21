import isFileExistedAndCreate from "./isFileExistedAndCreate"
import fs from "fs"
import moment from "moment"
import Log from "./Log"
import { User, Users as IUsers, UserId } from "../type"

const fileName = "../data/users.json"
const timeFomat = "YYYY-MM-DD HH:mm:ss"

class Users {
  users: IUsers = {}
  hasNewData = false
  constructor() {
    this._init()
    setInterval(() => {
      if (this.hasNewData) {
        this.hasNewData = false
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
              this.users = JSON.parse(data.toString("utf-8"))
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
                reject(false)
              } else {
                fs.writeFile(fileName, JSON.stringify(this.users, null, 4), (e) => {
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
                    this.users = JSON.parse(data.toString("utf-8"))
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
    return this.users
  }

  getUser(id: UserId, password: User["password"]) {
    if (this.users[id]) {
      if (this.users[id].password === password) {
        return this.users[id]
      }
      return "user error"
    }
    return "not exist"
  }

  async set(users: IUsers) {
    this.users = users
    this.hasNewData = true
    return await this._updateFile()
  }

  async setUser(id: UserId, password: User["password"], user: User) {
    if (this.users[id]) {
      if (this.users[id].password === password) {
        this.users[id] = { ...user, password, lastUpdate: moment().format(timeFomat) }
        this.hasNewData = true
        return true
        // return await this._updateFile();
      }
      return "user error"
    } else {
      this.users[id] = { ...user, password, lastUpdate: moment().format(timeFomat) }
      return true
      // return await this._updateFile();
    }
  }
}

export default new Users()
