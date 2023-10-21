import jsdom from "jsdom"
import { SearchBookParams, SearchBookRes } from "./types"
import { waitPage } from "../utils/waitPage"
import createPuppeteerApi from "../utils/createPuppeteerApi"
import Log from '../utils/Log'

const { JSDOM } = jsdom
export default createPuppeteerApi<SearchBookParams, {}, SearchBookRes>(async (req, res, page) => {
  const { keyword, channel, page: searchPage } = req.query
  if (!keyword) {
    res.send({ status: "error", message: "keyword must string" })
    return
  }
  if (!searchPage) {
    res.send({ status: "error", message: "page must number" })
    return
  }
  if (!channel) {
    res.send({ status: "error", message: "channel must string" })
    return
  }

  await page.goto(channel)

  let waitRes = await waitPage(page, {
    isTarGetPage: new Promise((r) => {
      page
        ?.waitForSelector(".search-form")
        .then(() => r("isTarGetPage"))
        .catch(() => null)
    })
  })
  if (waitRes !== "isTarGetPage") {
    res.send({ status: "error", message: waitRes })
    return
  }
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
  waitRes = await waitPage(page, {
    isTarGetPage: new Promise((r) => {
      page
        ?.waitForSelector("ul")
        .then(() => r("isTarGetPage"))
        .catch(() => null)
    })
  })
  if (waitRes !== "isTarGetPage") {
    res.send({ status: "error", message: waitRes })
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
  })
})
