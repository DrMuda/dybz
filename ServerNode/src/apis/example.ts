import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { puppeteerError } from "../utils/utils"
import Log from "../utils/Log"
import jsdom from "jsdom"
import { ResSendData } from '../types'

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await puppeteer.getPage()
    if (!page) {
      res.send(puppeteerError)
      return
    }    
    const { keyword } = req.query as { keyword?: string }
    if(!keyword){
      res.send({status: "error", message: "keyword must string"} as ResSendData)
      return
    }
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
