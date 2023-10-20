import { Request, Response } from "express"
import { Page } from "puppeteer"
import PuppeteerSingleton from "./PuppeteerSingle"
import { puppeteerError } from "./utils"
import Log from "./Log"
import { ResSendData } from "../types"
import { error } from "console"

const puppeteer = PuppeteerSingleton.getInstance()
// @ts-ignore
interface MyRequest<MyQuery, MyBody> extends Request {
  query: MyQuery
  body: MyBody
}
interface MyResponse<SendData extends ResSendData> extends Response {
  send: (body?: SendData) => this
}

function createApi<MyQuery, MyBody, SendData extends ResSendData>(
  fn: (req: MyRequest<MyQuery, MyBody>, res: MyResponse<SendData>) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    Log.info(`${req.url}, ${req.query}, ${req.body}`)
    res.addListener("error", (error) => {
      Log.error(`${req.url}, ${req.query}, ${req.body}, ${error}`)
    })
    try {
      // @ts-ignore
      await fn(req, res)
    } catch (error) {
      Log.error(`${error}`)
      res.send({
        status: "error",
        message: `${error}`
      })
    }
  }
}

export default createApi
