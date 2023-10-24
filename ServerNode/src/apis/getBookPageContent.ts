import { parseUrl, sleep } from "../utils/utils"
import jsdom from "jsdom"
import { GetBookPageContentParams, GetBookPageContentRes } from "./types"
import { waitPage } from "../utils/waitPage"
import ImgIdToMd5Map from "../utils/ImgIdToMd5Map"
import Md5ToCharMap from "../utils/Md5ToCharMap"
import md5 from "md5"
import { Page } from "puppeteer"
import fontMap from "../utils/fontMap"
import createPuppeteerApi from "../utils/createPuppeteerApi"
import Log from '../utils/Log'

const { JSDOM } = jsdom
const imgIdToMd5Map = ImgIdToMd5Map.getInstance()
const md5ToCharMap = Md5ToCharMap.getInstance()

const getNeirongFromTagImg = async (item: Element, page: Page, domian?: string) => {
  const src = (item as HTMLImageElement).src
  const md5Key = imgIdToMd5Map.getByImgId(src || "") || ""
  const { char, img } = md5ToCharMap.getByKey(md5Key) || {}
  if (char) {
    return char
  }
  if (img) {
    return `<img>:${img}`
  }
  const imageElement = await page.$(`img[src='${src}']`)
  if (imageElement) {
    const base64Image = await imageElement.evaluate((element) => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = element.width
      canvas.height = element.height
      context?.drawImage(element, 0, 0, element.width, element.height)
      return canvas.toDataURL("image/png") // 获取图像的Base64编码
    })
    const md5Key = md5(base64Image)
    imgIdToMd5Map.setByImgId(src, md5Key)
    md5ToCharMap.setItem(md5Key, {
      char: "",
      img: base64Image
    })
    return `<img>:${base64Image}`
  }
  return `<img>:${domian}${src}`
}

const getNeirongFromTagI = async (item: Element) => {
  const charCode = item.innerHTML.charCodeAt(0)
  let char = ""
  Object.entries(fontMap).find(([charCodeStr, _char]) => {
    // 解析16进制数
    const _charCode = parseInt(charCodeStr.replace("U+", ""), 16)

    if (_charCode === charCode) {
      char = _char
      return true
    }
    return false
  })
  return char || "<i>"
}

export default createPuppeteerApi<GetBookPageContentParams, {}, GetBookPageContentRes>(
  async (req, res, page) => {
    const { url } = req.query
    if (!url) {
      res.send({ status: "error", message: "url must string" })
      return
    }

    await page.goto(url)
    const waitRes = await waitPage(page, {
      isChapterInfo: new Promise((r) => {
        page
          ?.waitForSelector(".chapterinfo br")
          .then(() => r("isTargetPage"))
          .catch(() => null)
      }),
      isNeiRong: new Promise((r) => {
        page
          ?.waitForSelector(".neirong br")
          .then(() => r("isTargetPage"))
          .catch(() => null)
      })
    }).catch(() => null)
    if (waitRes !== "isTargetPage") {
      res.send({ status: "error", message: waitRes || null })
      return
    }
    await page.waitForSelector(".chapterPages a")
    await page.waitForSelector(".page-control a")
    let content = await page.content()

    if (content.includes(".append(e)")) {
      await page
        .waitForRequest(
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
        )
        .catch(() => null)
    }
    await sleep(1000)

    content = await page.content()
    const { document } = new JSDOM(content).window
    const { domian } = parseUrl(url)
    // 提取主要内容
    let neiRong = document.querySelector(".chapterinfo") || document.querySelector(".neirong")

    const neirongChildrenList: Element[] = []
    // 平铺内容dom
    const flatDomTree = (dom: Element, level: number) => {
      if (dom?.getAttribute?.("style")?.includes("display: none")) return
      if (dom.tagName === "DIV") {
        dom.childNodes.forEach((node) => {
          flatDomTree(node as Element, level + 1)
        })
      } else {
        neirongChildrenList.push(dom)
      }
    }
    neiRong && flatDomTree(neiRong, 1)
    const neiRongList: string[] = []
    const pushNeiRongList = (newItem: string) => {
      const { length } = neiRongList
      const theLast = neiRongList[length - 1]
      const isSpecialItem = (item: string) => {
        if (item === "<i>" || item === "<br>" || item?.match(/^<img>:/)) return true
        return false
      }
      if (length === 0 || isSpecialItem(theLast) || isSpecialItem(newItem)) {
        neiRongList.push(newItem)
      } else {
        neiRongList[length - 1] = theLast + newItem
      }
    }
    for (let i = 0; i < neirongChildrenList.length; i++) {
      const item = neirongChildrenList[i] as
        | HTMLImageElement
        | HTMLBRElement
        | HTMLElement
        | HTMLDivElement

      if ((item as unknown as Text).data) {
        pushNeiRongList((item as unknown as Text).data)
        continue
      }

      if (item.tagName === "IMG") {
        pushNeiRongList(await getNeirongFromTagImg(item, page, domian))
        continue
      }

      if (item.tagName === "I") {
        pushNeiRongList(await getNeirongFromTagI(item))
        continue
      }

      if (item.tagName === "BR") {
        pushNeiRongList("<br>")
        continue
      }
      pushNeiRongList(`${item}`)
    }

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
      message: content
    })
  }
)
