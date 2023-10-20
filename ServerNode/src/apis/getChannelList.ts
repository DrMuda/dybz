import jsdom from "jsdom"
import { GetChannelListRes } from "./types"
import { waitPage } from "../utils/waitPage"
import createPuppeteerApi from "../utils/createPuppeteerApi"

const { JSDOM } = jsdom
export default createPuppeteerApi<{ channelPageUrl?: string }, {}, GetChannelListRes>(
  async (req, res, page) => {
    const { channelPageUrl } = req.query
    if (typeof channelPageUrl !== "string") {
      res.send({
        status: "error",
        message: "channelPageUrl must string"
      })
      return
    }

    await page.goto(channelPageUrl)
    const waitRes = await waitPage(page, {
      isTarGetPage: new Promise((r) => {
        page
          ?.waitForSelector(".navigation-content")
          .then(() => r("isTarGetPage"))
          .catch(() => null)
      })
    })
    if (waitRes !== "isTarGetPage") {
      res.send({ status: "error", message: waitRes })
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
    })
  }
)
