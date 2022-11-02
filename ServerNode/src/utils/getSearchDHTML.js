const puppeteer = require("puppeteer");
const Log = require("./Log");
const { getPuppeteerConfig } = require("./utils");

module.exports = async (url, searchValue) => {
  try {
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    //开启拦截器
    await page.setRequestInterception(true);
    await page.on("request", (interceptedRequest) => {
      //判断加载的url是否以jpg或png结尾，符合条件将不再加载
      if (
        interceptedRequest.url().endsWith(".jpg") ||
        interceptedRequest.url().endsWith(".png")
      ) {
        interceptedRequest.abort();
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(url);
    await page.waitForSelector(".search-form");
    await page.evaluate((searchValue) => {
      document.querySelector(".text-border.vm").value = searchValue + "";
      document.querySelector(".btn").click();
    }, searchValue);
    await page.waitForSelector(".mod.block.book-all-list");
    const content = await page.content();
    page.close();
    browser.close();
    return content;
  } catch (error) {
    Log.error(error);
    return `<body><div class='neirong'>server error: ${error}</div></body>`;
  }
};
