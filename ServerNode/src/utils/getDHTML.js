/*
 * @Author: LXX
 * @Date: 2022-04-27 10:33:22
 * @LastEditTime: 2022-04-28 17:42:33
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\getDHTML.js
 */
const Log = require("./Log");
const initPuppeteer = require("./initPuppeteer")

module.exports = async (url) => {
  try {
    const {page, browser} = await initPuppeteer()
    await page.goto(url);

    await page.waitForTimeout(1000);
    const content = await page.content();
    page.close();
    browser.close();
    return content;
  } catch (error) {
    Log.error(error);
    return `<body><div class='neirong'>server error: ${error}</div></body>`;
  }
};
