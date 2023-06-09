import ImgAndChar from "./ImgAndChar";
import * as services from "@/service/index";
import { Message } from "element-ui";

const QPS = 10;

export default async () => {
  const url = localStorage.getItem("ocr");
  const access_token = localStorage.getItem("ocrToken");
  if (url && url !== "no" && access_token) {
    Message({
      message: "正在使用百度ocr， 注意使用量",
      type: "warning",
      duration: 1000,
      showClose: true,
    });
    const imgAndChar = ImgAndChar.get();
    const keys = Object.keys(imgAndChar);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const item = imgAndChar[key];
      if (!item.char && item.img) {
        await new Promise<void>((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.setAttribute("height", "25");
          canvas.setAttribute("width", "25");
          if (ctx) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, 25, 25);
            const img = new Image();
            img.src = item.img || "";
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              services
                .requestOCR({
                  url,
                  method: "post",
                  params: {
                    access_token,
                    image: canvas.toDataURL(),
                  },
                })
                .then(
                  (res) => {
                    ImgAndChar.setCharByKey(
                      key,
                      res.data.words_result?.[0]?.words
                    );
                    imgAndChar[key] = {
                      ...imgAndChar[key],
                      char: res.data.words_result?.[0]?.words,
                    };
                    resolve();
                  },
                  () => {
                    reject();
                    console.error("error");
                  }
                )
                .catch((e) => {
                  reject();
                  console.error(e);
                });
            };
          }
        });
      }
    }
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000 / QPS);
    });
  } else if (url && url !== "no" && !access_token) {
    Message({
      message: "无access_token",
      type: "error",
      duration: 1000,
      showClose: true,
    });
  }
};
