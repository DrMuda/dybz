import jsdom from "jsdom"
import { Chatper, GetChatperListParams, GetChatperListRes } from "./types"
import { waitPage } from "../utils/waitPage"
import createPuppeteerApi from "../utils/createPuppeteerApi"
import Log from '../utils/Log'

const { JSDOM } = jsdom
export default createPuppeteerApi<GetChatperListParams, {}, GetChatperListRes>(
  async (req, res, page) => {
    const { page: chatperListPage, url } = req.query
    if (!chatperListPage || !url) {
      res.send({ status: "error", message: "page must number, url must string" })
      return
    }

    const urlWithPage = `${url.replace(/(\/)+$/, "")}_${chatperListPage}/`
    await page.goto(urlWithPage)
    const waitRes = await waitPage(page, {
      isTarGetPage: new Promise((r) => {
        page
          ?.waitForSelector(".chapter-list")
          .then(() => r("isTarGetPage"))
          .catch(() => null)
      })
    })
    if (waitRes !== "isTarGetPage") {
      res.send({ status: "error", message: waitRes })
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
    res.send({ status: "success", data: { chatperList, totalPage } })
  }
)
