import axios from "axios";
import ImgBase64 from "./ImgBase64";
import ImgMapChar from "./ImgMapChar";

const QPS = 10;
const url = ["general_basic", "general", "accurate_basic", "accurate"];
const access_token = "24.f77cd5678a5e79ab2f385628cc8a9d8d.2592000.1649558689.282335-25293048";

export default async () => {
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
                        url: "/baiduocr/" + url[0],
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
};
