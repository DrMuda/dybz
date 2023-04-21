import Users from "./utils/Users"
import OldNewKey from "./utils/OldNewKey"
import ImgAndChar from "./utils/ImgAndChar"
import Log from "./utils/Log"
import getDHTML from "./utils/getDHTML"
import getSearchDHTML from "./utils/getSearchDHTML"
import { Request, Response } from "express"
import { ImgAndChar as IImgAndChar, OldNewKey as IOldNewKey, ResSendData, User } from "./type"

export type ApiPath =
  | "/sync/pushCache"
  | "/sync/pullUser"
  | "/sync/pullImgAndChar"
  | "/sync/pullOldNewKey"
  | "/reptileDHTML"
  | "/search"

export type Api = Record<
  ApiPath,
  { method: "get" | "post"; message: (req: Request, res: Response) => Promise<void> }
>
function sendError(res: Response, msg: any) {
  Log.error(msg)
  res.send({ status: "error", message: msg } as ResSendData)
}

interface PushCacheBody {
  userName: string
  password: string
  data: {
    oldNewKey: IOldNewKey
    imgAndChar: IImgAndChar
    user: User
  }
}
async function pushCache(req: Request, res: Response) {
  try {
    const body = req.body as PushCacheBody
    let { oldNewKey, imgAndChar, user } = body.data
    const { userName, password } = req.body
    Log.info(`pushCache: ${userName} ${password}`)
    if (user) {
      if (userName) {
        Users.setUser(userName, password, user).then((status) => {
          if (typeof status === "boolean") {
            res.send({ status: status ? "success" : "file io fail" } as ResSendData)
          } else {
            res.send({ status } as ResSendData)
          }
        })
      } else {
        res.send({ status: "user error" } as ResSendData)
      }
    } else {
      res.send({ status: "push imgAndChar or oldNewKey" } as ResSendData)
    }
    if (imgAndChar) {
      ImgAndChar.set({
        ...ImgAndChar.get(),
        ...imgAndChar
      })
    }
    if (oldNewKey) {
      OldNewKey.set({
        ...OldNewKey.get(),
        ...oldNewKey
      })
    }
  } catch (error) {
    sendError(res, error)
  }
}

interface PullUserQuery {
  userName: string
  password: string
}
async function pullUser(req: Request, res: Response) {
  try {
    const { userName, password } = req.query as unknown as PullUserQuery
    Log.info(`pullCache: ${userName} ${password}`)
    const user = await Users.getUser(userName, password)
    const data: ResSendData = { status: "error", user }
    if (typeof user === "string") {
      data.user = null
      data.status = user
    } else {
      data.status = "success"
    }
    res.send(data)
  } catch (error) {
    sendError(res, error)
  }
}

interface PullOldNewKeyQuery {
  page: string
  size: string
}
async function pullOldNewKey(req: Request, res: Response) {
  try {
    const { page, size } = req.query as unknown as PullOldNewKeyQuery
    const pageInt = parseInt(page)
    const sizeInt = parseInt(size)
    const totalPage = OldNewKey.getTotalPage(sizeInt)
    const oldNewKey = await OldNewKey.getByPage(pageInt, sizeInt)
    const data: ResSendData = { status: "success", oldNewKey, totalPage, page: pageInt }
    res.send(data)
  } catch (error) {
    sendError(res, error)
  }
}

interface PullImgAndCharQuery extends PullOldNewKeyQuery {}
async function pullImgAndChar(req: Request, res: Response) {
  try {
    const { page, size } = req.query as unknown as PullImgAndCharQuery
    const pageInt = parseInt(page)
    const sizeInt = parseInt(size)
    const totalPage = ImgAndChar.getTotalPage(sizeInt)
    const imgAndChar = await ImgAndChar.getByPage(pageInt, sizeInt)
    const data = { status: "success", imgAndChar, totalPage, page: pageInt }
    res.send(data)
  } catch (error) {
    sendError(res, error)
  }
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
}
async function search(req: Request, res: Response) {
  try {
    const { url, searchValue } = req.body as SearchBody
    Log.info(`searchDHTML: ${url} ${searchValue}`)
    const content = await getSearchDHTML(url, searchValue)
    res.send({ status: "success", content })
  } catch (error) {
    sendError(res, error)
  }
}

export default <Api>{
  "/sync/pushCache": {
    method: "post",
    message: pushCache
  },
  "/sync/pullUser": {
    method: "get",
    message: pullUser
  },
  "/sync/pullImgAndChar": {
    method: "get",
    message: pullImgAndChar
  },
  "/sync/pullOldNewKey": {
    method: "get",
    message: pullOldNewKey
  },
  "/reptileDHTML": {
    method: "post",
    message: reptileDHTML
  },
  "/search": {
    method: "post",
    message: search
  }
}
