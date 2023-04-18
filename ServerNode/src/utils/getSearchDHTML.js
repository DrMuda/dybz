const Log = require("./Log")
const initPuppeteer = require("./initPuppeteer")

module.exports = async (url, searchValue) => {
  try {
    const { page, browser } = await initPuppeteer()
    await page.goto(url)
    await page.waitForSelector(".search-form")
    await page.evaluate((searchValue) => {
      const searchValueInput = document.querySelector(".text-border.vm")
      const searchValueBtn = document.querySelector(".btn")
      if (searchValueInput && searchValueBtn) {
        searchValueInput.value = searchValue + ""
        searchValueBtn.click()
      }
    }, searchValue)
    await page.waitForSelector(".pagelistbox")
    const content = await page.content()
    page.close()
    browser.close()
    return content
  } catch (error) {
    Log.error(error)
    return `<body><div class='neirong'>server error: ${error}</div></body>`
  }
}
