import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { puppeteerError } from "../utils/utils"
import { ResSendData } from "../type"
import jsdom from "jsdom"
import Log from '../utils/Log'

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await puppeteer.getPage()
    if (!page) {
      res.send(puppeteerError)
      return
    }

    const { channelPageUrl } = req.query as { channelPageUrl?: string }
    if (typeof channelPageUrl !== "string") {
      res.send({
        status: "error",
        message: "channelPageUrl must string"
      } as ResSendData)
      return
    }

    await page.goto(channelPageUrl)
    await page.waitForSelector(".navigation-content")
    const content = await page.content()
    const { document: doc } = new JSDOM(content).window
    const aEleList = doc.querySelectorAll(".navigation-content a")
    const url: string[] = []
    aEleList.forEach((ele) => {
      const href = ele.getAttribute("href")
      href && url.push(href)
    })
    res.send({
      status: "success",
      data: url
    } as ResSendData)
    page.close()
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
