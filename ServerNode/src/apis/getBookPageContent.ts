import { Request, Response } from "express"
import PuppeteerSingleton from "../utils/PuppeteerSingle"
import { parseUrl, puppeteerError, sleep } from "../utils/utils"
import Log from "../utils/Log"
import jsdom from "jsdom"
import { ResSendData } from "../types"
import { GetBookPageContentParams, GetBookPageContentRes } from "./types"
import { waitPage } from "../utils/waitPage"
import ImgIdToMd5Map from "../utils/ImgIdToMd5Map"
import Md5ToCharMap from "../utils/Md5ToCharMap"

const { JSDOM } = jsdom
const puppeteer = PuppeteerSingleton.getInstance()
const imgIdToMd5Map = ImgIdToMd5Map.getInstance()
const md5ToCharMap = Md5ToCharMap.getInstance()
export default async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await puppeteer.getPage()
    if (!page) {
      res.send(puppeteerError)
      return
    }
    const { url } = req.query as unknown as GetBookPageContentParams
    if (!url) {
      res.send({ status: "error", message: "url must string" } as ResSendData)
      return
    }

    await page.goto(url)
    const waitRes = await waitPage(page, {
      isChapterInfo: new Promise((r) => {
        page
          .waitForSelector(".chapterinfo")
          .then(() => r("isTargetPage"))
          .catch(() => null)
      }),
      isNeiRong: new Promise((r) => {
        page
          .waitForSelector(".neirong")
          .then(() => r("isTargetPage"))
          .catch(() => null)
      })
    }).catch(() => null)
    if (waitRes !== "isTargetPage") {
      res.send({ status: "error", message: waitRes } as ResSendData)
      return
    }
    await sleep(500)
    let content = await page.content()

    if(content.includes(".append(e)")){
      await page.waitForRequest(
        (request) => {
          return (
            request.url() === url &&
            request.method() === "POST" &&
            request.resourceType() !== "preflight"
          )
        },
        {
          timeout: 10000
        }
      ).catch(()=>null)
    }
    await sleep(500)

    content = await page.content()
    const { document } = new JSDOM(content).window
    const { domian } = parseUrl(url)
    // 提取主要内容
    let neiRong = document.querySelector(".chapterinfo") || document.querySelector(".neirong")

    const neirongChildrenList: Element[] = []
    const flatDomTree = (dom: Element, level:number) => {
      if (dom?.getAttribute?.("style")?.includes("display: none")) return
      if (dom.tagName === "DIV") {
        dom.childNodes.forEach((node) => {
          flatDomTree(node as Element, level+1)
        })
      } else {
        neirongChildrenList.push(dom)
      }
    }
    neiRong && flatDomTree(neiRong, 1)
    const neiRongList: string[] = []
    for (let i = 0; i < neirongChildrenList.length; i++) {
      const item = neirongChildrenList[i] as
        | HTMLImageElement
        | HTMLBRElement
        | HTMLElement
        | HTMLDivElement

      if ((item as unknown as Text).data) {
        neiRongList.push((item as unknown as Text).data)
        continue
      }

      if (item.tagName === "IMG") {
        const src = (item as HTMLImageElement).src
        const md5Key = imgIdToMd5Map.getByImgId(src || "") || ""
        const { char, img } = md5ToCharMap.getByKey(md5Key) || {}
        if (char) {
          neiRongList.push(char)
          continue
        }
        if (img) {
          neiRongList.push(`<img>:${img}`)
          continue
        }

        neiRongList.push(`<img>:${domian}${src}`)
        continue
      }

      if (item.tagName === "I") {
        neiRongList.push("<i>")
        continue
      }

      if (item.tagName === "BR") {
        neiRongList.push("<br>")
        continue
      }

      neiRongList.push(`${item}`)
    }
    neirongChildrenList.forEach(async (_item) => {})

    // 提取分页
    const pageList = Array.from(document.querySelectorAll(".chapterPages a") || []).map(
      (_, index) => {
        const _url = url.replace(/(_\d+)?\.html/, ``)
        if (index === 0) return `${_url}.html`
        return `${_url}_${index + 1}.html`
      }
    )

    // 提取上下一章
    const preEle = document.querySelector(".prev") as HTMLAnchorElement | null
    const nextEle = document.querySelector(".next") as HTMLAnchorElement | null
    const preUrl = preEle?.href.includes(".html") ? [domian, preEle.href].join("") : ""
    const nextUrl = nextEle?.href.includes(".html") ? [domian, nextEle.href].join("") : ""

    res.send({
      status: "success",
      data: {
        chapterUrl: url,
        contentList: neiRongList,
        pageList,
        preUrl,
        nextUrl
      },
    } as GetBookPageContentRes)
    return
  } catch (error) {
    Log.error(`${error}`)
    res.send({
      status: "error",
      message: `${error}`
    })
  }
}
