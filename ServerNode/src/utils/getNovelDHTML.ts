import Log from "./Log"
import initPuppeteer from "./initPuppeteer"
import { WherePages, waitPage } from "./waitPage"

type ThatWherePages = WherePages | "isTargetPage"
export default async (url: string) => {
  try {
    const { page, browser } = await initPuppeteer()
    await page.goto(url)
    const waitTargetPage = async (): Promise<ThatWherePages> => {
      await page.waitForSelector(".neirong br")
      await page.waitForSelector(".chapterPages")
      return "isTargetPage"
    }
    await waitPage(page, { isTargetPage: waitTargetPage() })
    // const neirong = await page.$(".neirong")
    // const box = await neirong?.boundingBox()
    // await page.waitForTimeout(5000)
    // if (box) {
    //   await page.screenshot({
    //     clip: box,
    //     path: "./test.png"
    //   })
    // }
    // for (let index = 0; index < 1000; index++) {
    //   const i = await page.$(".neirong i") // 找到需要截图的标签
    //   if (!i) break
    //   const box = await i.boundingBox() // 获取标签位置和大小信息
    //   if (!box) continue
    //   const screenshot = (await page.screenshot({
    //     clip: box, // 截取标签所在的区域
    //     encoding: "base64" // 将截图转为 base64 格式
    //   })) as string
    //   await page.evaluate((screenshot: string) => {
    //     // 创建 img 标签并替换 i 标签
    //     const i = document.querySelector(".neirong i")
    //     const img = document.createElement("img")
    //     img.src = `data:image/png;base64,${screenshot}`
    //     if (i) {
    //       i.replaceWith(img)
    //     }
    //   }, screenshot)
    // }
    const content = await page.content()
    await page.close()
    await browser.close()
    console.log("end")
    return content
  } catch (error) {
    Log.error(error as string)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
