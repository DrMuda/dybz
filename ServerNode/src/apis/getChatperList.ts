import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { puppeteerError, sleep } from "../utils/utils"
import Log from "../utils/Log"
import jsdom from "jsdom"
import { ResSendData } from "../types"
import { Chatper, GetChatperListParams, GetChatperListRes } from "./types"
import { ElementHandle } from "puppeteer"
import { waitPage } from "../utils/waitPage"

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await puppeteer.getPage()
    if (!page) {
      res.send(puppeteerError)
      return
    }
    const { page: chatperListPage, url } = req.query as unknown as GetChatperListParams
    if (!chatperListPage || !url) {
      res.send({ status: "error", message: "page must number, url must string" } as ResSendData)
      return
    }

    const urlWithPage = `${url.replace(/(\/)+$/, "")}_${chatperListPage}/`
    await page.goto(urlWithPage)
    const waitRes = await waitPage(page, {
      isTarGetPage: new Promise((r) => {
        page
          .waitForSelector(".chapter-list")
          .then(() => r("isTarGetPage"))
          .catch(() => null)
      })
    })
    if (waitRes !== "isTarGetPage") {
      res.send({ status: "error", message: waitRes } as ResSendData)
      return
    }

    const content = await page.content()
    const { document } = new JSDOM(content).window
    const [_chapterListEle, chapterListEle] = document.querySelectorAll(".chapter-list")
    const aEleList = chapterListEle?.querySelectorAll("a")
    const chatperList: Chatper[] = []
    aEleList.forEach((aEle) => {
      chatperList.push({
        title: aEle.innerText || aEle.innerHTML,
        url: aEle.href
      })
    })
    const pageMsg = content.match(/第[0-9]+\/[0-9]+页/)
    let totalPage = 1
    if (pageMsg) {
      let pageStr = pageMsg[0].split("/")[1]
      totalPage = parseInt(pageStr)
    }
    res.send({ status: "success", data: { chatperList, totalPage } } as GetChatperListRes)
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
