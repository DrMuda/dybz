const Log = require("./Log")
const initPuppeteer = require("./initPuppeteer")

module.exports = async (url, waitForSelector) => {
  try {
    const { page, browser } = await initPuppeteer()
    await page.goto(url)
    let content = await page.content()
    if (content.match("为防止恶意访问,请输入")) {
      await page.type("input", "1234")
      await page.click("a")
    }
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector)
    } else {
      await page.waitForTimeout(1000)
    }
    content = await page.content()
    await page.close()
    await browser.close()
    return content
  } catch (error) {
    Log.error(error)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
