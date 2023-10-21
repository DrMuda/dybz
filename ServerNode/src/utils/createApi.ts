import { Request, Response } from "express"
import PuppeteerSingleton from "./PuppeteerSingle"
import Log from "./Log"
import { ResSendData } from "../types"

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
    Log.info(`${req.url}, ${JSON.stringify(req.query)}, ${JSON.stringify(req.body)}`)
    res.addListener("error", (error) => {
      Log.error(
        `${req.url}, ${JSON.stringify(req.query)}, ${JSON.stringify(req.body)}, ${JSON.stringify(
          error
        )}`
      )
    })
    try {
      // @ts-ignore
      await fn(req, res)
    } catch (error) {
      Log.error(`${JSON.stringify(error)}`)
      res.send({
        status: "error",
        message: `${JSON.stringify(error)}`
      })
    }
  }
}

export default createApi
