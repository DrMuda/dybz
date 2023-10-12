import Log from "./Log"
import PuppeteerSingleton from "./PuppeteerSingle"
import { WherePages, waitPage } from "./waitPage"

const puppeteer = PuppeteerSingleton.getInstance()
type ThatWherePages = WherePages | "isTargetPage"
export default async (url: string) => {
  try {
    const page = await puppeteer.getPage()
    if (!page) return
    let waitCut = false
    await page.on("request", async (request) => {
      if (
        request.resourceType() !== "preflight" &&
        request.url() === url &&
        request.method() == "GET"
      ) {
        await page.on("response", async (response) => {
          const method = response.request().method()
          if (
            response.request().resourceType() !== "preflight" &&
            response.url() === url &&
            method === "GET"
          ) {
            const data = (await response.buffer()).toString()
            if (data.includes("('.neirong').append(e)")) {
              waitCut = true
            }
          }
        })
      }
    })
    await page.goto(url)
    const waitTargetPage = async (): Promise<ThatWherePages> => {
      await page.waitForSelector(".neirong br")
      await page.waitForSelector(".chapterPages")
      return "isTargetPage"
    }
    await waitPage(page, { isTargetPage: waitTargetPage() })
    try {
      if (waitCut) {
        console.log("wait cut")
        await page.waitForRequest(
          (request) => {
            return (
              request.url() === url &&
              request.method() === "POST" &&
              request.resourceType() !== "preflight"
            )
          },
          {
            timeout: 30000
          }
        )
        await page.waitForTimeout(1000)
      }
    } catch (error) {
      console.error(error)
    }
    let content = await page.content()
    console.log("end")
    return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
