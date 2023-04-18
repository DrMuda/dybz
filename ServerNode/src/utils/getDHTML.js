const Log = require("./Log")
const initPuppeteer = require("./initPuppeteer")

module.exports = async (url) => {
  try {
    const { page, browser } = await initPuppeteer()
    await page.goto(url)

    await page.waitForTimeout(1000)
    const content = await page.content()
    page.close()
    browser.close()
    return content
  } catch (error) {
    Log.error(error)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
