/*
 * @Author: LXX
 * @Date: 2022-04-27 10:33:22
 * @LastEditTime: 2022-04-28 17:42:33
 * @LastEditors: LXX
 * @Description:
 * @FilePath: \dybz\01bzServerNodeJS\src\utils\getDHTML.js
 */

const puppeteer = require("puppeteer");
const Log = require("./Log");

module.exports = async (url) => {
    try {
        const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
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
    } catch (error) {
        Log.error(error);
        return "<body><div class='neirong'>server error</div></body>";
    }
};
