import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { puppeteerError } from "../utils/utils"
import { ResSendData } from "../types"
import jsdom from "jsdom"
import Log from "../utils/Log"
import { GetChannelListRes } from "./types"
import { waitPage } from "../utils/waitPage"

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  console.log("getChannelList")
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
    const waitRes = await waitPage(page, {
      isTarGetPage: new Promise((r) => {
        page.waitForSelector(".navigation-content").then(() => r("isTarGetPage"))
      })
    })
    if (waitRes !== "isTarGetPage") {
      res.send({ status: "error", message: waitRes } as ResSendData)
      return
    }

    const content = await page.content()
    const { document: doc } = new JSDOM(content).window
    const aEleList = doc.querySelectorAll(".navigation-content a")
    const urlList: string[] = []
    aEleList.forEach((ele) => {
      const href = ele.getAttribute("href")
      href && urlList.push(href)
    })
    res.send({
      status: "success",
      data: Array.from(new Set(urlList))
    } as GetChannelListRes)
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
