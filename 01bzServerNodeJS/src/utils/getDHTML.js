/*
 * @Author: LXX
 * @Date: 2022-04-27 10:33:22
 * @LastEditTime: 2022-04-28 15:46:56
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\getDHTML.js
 */

const puppeteer = require("puppeteer");

module.exports = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //开启拦截器
    await page.setRequestInterception(true);
    await page.on("request", (interceptedRequest) => {
        //判断加载的url是否以jpg或png结尾，符合条件将不再加载
        if (interceptedRequest.url().endsWith(".jpg") || interceptedRequest.url().endsWith(".png")) {
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
    await page.goto(url);

    await page.waitForTimeout(1000);
    const content = await page.content();
    page.close();
    browser.close();
    return content;
};
