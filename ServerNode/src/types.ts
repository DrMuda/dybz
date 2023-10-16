export interface Chapter {
  title?: string
  url?: string
}

export type UserId = string
export type Users = Record<UserId, User>
export type ImgIdToMd5Map = Record<string, string>
export type ImgAndCharItem = { img?: string; char?: string }
export type Md5ToCharMap = Record<string, ImgAndCharItem>
export interface ResSendData extends Record<string, any> {
  status: "success" | "error" | (string & {})
  message?: string
  data?: any
}

export interface Book {
  id?: number
  url?: string
  name?: string
  history?: Chapter
  /** 用于排序, YYYY-MM-DD HH:mm:ss */
  lastUpdate?: string
  delete: boolean
}

export interface User {
  bookList: Book[]
  ocrToken?: string
  password: string
  /** 整个记录更新时间， 用于同步数据， YYYY-MM-DD HH:mm:ss */
  lastUpdate?: string
}
