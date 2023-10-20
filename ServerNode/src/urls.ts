import { Request, Response } from "express"
import getChannelList from "./apis/getChannelList"
import searchBook from "./apis/searchBook"
import { delBook, editBook, getBookList } from "./apis/userBook"
import getChatperList from "./apis/getChatperList"
import getBookPageContent from "./apis/getBookPageContent"

export type Api = Record<
  string,
  { method: "get" | "post"; message: (req: Request, res: Response) => Promise<void> }
>

const route: Api = {
  "/api/getChannelList": {
    method: "get",
    message: getChannelList
  },
  "/api/searchBook": {
    message: searchBook,
    method: "get"
  },
  "/api/getBookList": {
    message: getBookList,
    method: "get"
  },
  "/api/editBook": {
    message: editBook,
    method: "post"
  },
  "/api/delBook": {
    message: delBook,
    method: "post"
  },
  "/api/getChatperList": {
    message: getChatperList,
    method: "get"
  },
  "/api/getBookPageContent": {
    message: getBookPageContent,
    method: "get"
  }
}
export default route
