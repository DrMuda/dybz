import { Request, Response } from "express"
import { Page } from "puppeteer"
import PuppeteerSingleton from "./PuppeteerSingle"
import { puppeteerError } from "./utils"
import Log from "./Log"
import { ResSendData } from "../types"

const puppeteer = PuppeteerSingleton.getInstance()
// @ts-ignore
interface MyRequest<MyQuery, MyBody> extends Request {
  query: MyQuery
  body: MyBody
}
interface MyResponse<SendData extends ResSendData> extends Response {
  send: (body?: SendData) => this
}

function createPuppeteerApi<MyQuery, MyBody, SendData extends ResSendData>(
  fn: (req: MyRequest<MyQuery, MyBody>, res: MyResponse<SendData>, page: Page) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    let page: Page | null = null
    Log.info(`${req.url}, ${req.query}, ${req.body}`)
    res.addListener("error", (error) => {
      Log.error(`${req.url}, ${req.query}, ${req.body}, ${error}`)
    })
    res.addListener("finish", () => {
      page && page.close()
    })
    try {
      page = await puppeteer.newPage()
      if (!page) {
        res.send(puppeteerError)
        return
      }
      // @ts-ignore
      await fn(req, res, page)
    } catch (error) {
      Log.error(`${error}`)
      res.send({
        status: "error",
        message: `${error}`
      })
      page && page.close()
    }
  }
}

export default createPuppeteerApi
