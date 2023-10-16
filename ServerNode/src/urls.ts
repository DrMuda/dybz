import Users from "./utils/Users"
import Log from "./utils/Log"
import getDHTML from "./utils/getDHTML"
import getSearchDHTML from "./utils/getSearchDHTML"
import getNovelDHTML from "./utils/getNovelDHTML"
import { Request, Response } from "express"
import {ResSendData } from "./types"
import axios from "axios"
import getChannelList from "./apis/getChannelList"
import searchBook from "./apis/searchBook"
import { delBook, editBook, getBookList } from "./apis/userBook"
import getChatperList from "./apis/getChatperList"
import getBookPageContent from "./apis/getBookPageContent"

export type Api = Record<
  string,
  { method: "get" | "post"; message: (req: Request, res: Response) => Promise<void> }
>
function sendError(res: Response, msg: any) {
  Log.error(msg)
  res.send({ status: "error", message: msg } as ResSendData)
}

export interface ReqDHTMLBody {
  url: string
  waitForSelector?: string
}
async function reptileDHTML(req: Request, res: Response) {
  try {
    const { url, waitForSelector } = req.body as ReqDHTMLBody
    Log.info(`reptileDHTML: ${JSON.stringify({ url, waitForSelector })}`)
    const content = await getDHTML(url, waitForSelector)
    res.send({ status: "success", content })
  } catch (error) {
    sendError(res, error)
  }
}
export interface SearchBody extends ReqDHTMLBody {
  searchValue: string
  page: number
}
async function search(req: Request, res: Response) {
  try {
    const { url, searchValue, page } = req.body as SearchBody
    Log.info(`searchDHTML: ${JSON.stringify({ url, searchValue, page })}`)
    const content = await getSearchDHTML(url, searchValue, page || 1)
    res.send({ status: "success", content })
  } catch (error) {
    sendError(res, error)
  }
}

async function getImg(req: Request, res: Response) {
  const { url } = req.query as { url: string }
  const response = await axios.get(url, { responseType: "arraybuffer" })
  res.set(response.headers)
  res.end(response.data.toString("binary"), "binary")
}

async function getNovel(req: Request, res: Response) {
  const { url } = req.query as { url: string }
  Log.info(`reptileDHTML: ${JSON.stringify({ url })}`)
  const content = await getNovelDHTML(url)
  const data: ResSendData = { status: "success", content }
  res.send(data)
}

const route: Api = {
  "/reptileDHTML": {
    method: "post",
    message: reptileDHTML
  },
  "/search": {
    method: "post",
    message: search
  },
  "/getImg": {
    method: "get",
    message: getImg
  },
  "/getNovel": {
    method: "get",
    message: getNovel
  },

  "/getChannelList": {
    method: "get",
    message: getChannelList
  },
  "/searchBook": {
    message: searchBook,
    method: "get"
  },
  "/getBookList": {
    message: getBookList,
    method: "get"
  },
  "/editBook": {
    message: editBook,
    method: "post"
  },
  "/delBook": {
    message: delBook,
    method: "post"
  },
  "/getChatperList": {
    message: getChatperList,
    method: "get"
  },
  "/getBookPageContent": {
    message: getBookPageContent,
    method: "get"
  }
}
export default route
