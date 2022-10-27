/* eslint-disable */
import ImgAndChar from "./ImgAndChar";
import md5 from "md5";
import baiduOcr from "@/utils/baiduOcr";
import * as services from "@/service/index.js";

export default (onCacheSuccess:Function) => {
  return new Promise<void>((resolve, reject) => {
    let imgAndChar = ImgAndChar.get();
    const pList:Array<Promise<string>> = [];
    Object.keys(imgAndChar).forEach((key) => {
      if (key.includes(".png")) {
        pList.push(
          new Promise((resolve, reject) => {
            services.getImg(key).then(
              async (res) => {
                const imgBase64 = await res.data;
                if (typeof imgBase64 === "string") {
                  const md5Key = md5(
                    imgBase64.replace("data:text/html", "data:image/png")
                  );
                  imgAndChar[md5Key] = {
                    char: "",
                    img: imgBase64.replace("data:text/html", "data:image/png"),
                  };
                  if (onCacheSuccess instanceof Function) {
                    onCacheSuccess(key, md5Key);
                  }
                  delete imgAndChar[key];
                }
                resolve(`success:${key}`);
              },
              () => {
                reject(`fail:${key}`);
              }
            );
          })
        );
      }
    });
    Promise.allSettled(pList).then(
      () => {
        ImgAndChar.set(imgAndChar);
        baiduOcr();
        resolve();
      },
      () => {
        reject();
      }
    );
  });
};
