export interface Chapter {
  title?: string
  url?: string
}
export interface Novel {
  id?: number
  url?: string
  name?: string
  history?: Chapter
  firstChapter?: Chapter
  chanel?: string
  key?: number
  /** 用于排序, YYYY-MM-DD HH:mm:ss */
  lastTime?: string
}
export interface User {
  novelList?: Novel[]
  ocrToken?: string
  password?: string
  /** 整个记录更新时间， 用于同步数据， YYYY-MM-DD HH:mm:ss */
  lastUpdate?: string
}
export type UserId = string
export type Users = Record<UserId, User>
export type OldNewKey = Record<string, string>
export type ImgAndCharItem = { img?: string; char?: string }
export type ImgAndChar = Record<string, ImgAndCharItem>
export interface ResSendData extends Record<string, any> {
  status: "success" | "error" | (string & {})
  message?: string
  data?: any
}
