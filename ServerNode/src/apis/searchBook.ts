import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { puppeteerError } from "../utils/utils"
import Log from "../utils/Log"
import jsdom from "jsdom"
import { ResSendData } from "../types"
import { SearchBookParams, SearchBookRes } from './types'
import { waitPage } from '../utils/waitPage'

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await puppeteer.getPage()
    if (!page) {
      res.send(puppeteerError)
      return
    }

    const {
      keyword,
      channel,
      page: searchPage
    } = req.query as unknown as SearchBookParams
    if (!keyword) {
      res.send({ status: "error", message: "keyword must string" } as ResSendData)
      return
    }
    if (!searchPage) {
      res.send({ status: "error", message: "page must number" } as ResSendData)
      return
    }
    if (!channel) {
      res.send({ status: "error", message: "channel must string" } as ResSendData)
      return
    }

    await page.goto(`${channel}`)
    await page.waitForSelector(".search-form")
    await page.evaluate(
      ({ keyword, searchPage }) => {
        ;(window as any).formPost?.("/s.php", {
          type: "articlename",
          s: keyword,
          page: searchPage
        })
      },
      { keyword, searchPage }
    )
    const waitRes = await waitPage(page, {
      isTarGetPage: new Promise((r) => {
        page.waitForSelector("ul").then(() => r("isTarGetPage"))
      })
    })
    if (waitRes !== "isTarGetPage") {
      res.send({ status: "error", message: waitRes } as ResSendData)
      return
    }

    const content = await page.content()
    const pageMsg = content.match(/第[0-9]+\/[0-9]+页/)
    let totalPage = 1
    if (pageMsg) {
      let pageStr = pageMsg[0].split("/")[1]
      totalPage = parseInt(pageStr)
    }

    const { document: doc } = new JSDOM(content).window
    const list = doc.querySelectorAll("ul li")
    const bookList: { name: string; url: string }[] = []
    for (let i = 0; i < list.length; i++) {
      const a = list.item(i)?.getElementsByTagName("a")?.[0] as HTMLAnchorElement
      if (a) {
        bookList.push({
          name: a.innerText || a.innerHTML,
          url: `${channel}${a.href}`
        })
      }
    }
    res.send({
      status: "success",
      data: {
        totalPage,
        bookList
      }
    } as SearchBookRes)
    // page.close()
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
