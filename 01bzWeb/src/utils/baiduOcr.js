import axios from "axios";
import ImgBase64 from "./ImgBase64";
import ImgMapChar from "./ImgMapChar";

const QPS = 10;

export default async () => {
    const url = localStorage.getItem("ocr");
    const access_token = localStorage.getItem("ocrToken");
    if (url && url !== "no" && access_token) {
        const imgBase64 = ImgBase64.get();
        const imgMapChar = ImgMapChar.get();
        const newImgMapChar = {};
        const keys = Object.keys(imgBase64);
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (!imgMapChar[key] && imgBase64[key] && imgMapChar[key] !== undefined) {
                await new Promise((resolve, reject) => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.setAttribute("height", 25);
                    canvas.setAttribute("width", 25);
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, 25, 25);
                    const img = new Image();
                    img.src = imgBase64[key].replace("data:text/html", "data:image/png");
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        axios({
                            url,
                            method: "post",
                            params: {
                                access_token,
                                image: canvas.toDataURL(),
                            },
                        })
                            .then(
                                (res) => {
                                    newImgMapChar[key] = res.data.words_result?.[0]?.words;
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
                });
            }
        }
        ImgMapChar.set({
            ...imgMapChar,
            ...newImgMapChar,
        });
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000 / QPS);
        });
    }
};
