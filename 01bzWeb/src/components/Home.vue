<template>
    <div id="main-context"></div>
</template>

<script lang="ts">
import axios from "axios";
import { Novel, ImgMap } from "./Home";
import strToDom from "../utils/strToDom";

export default {
    name: "Home",
    props: {
        msg: String,
    },
    mounted: () => {
        axios
            .get("/getHtml/10/10967/211316", {
                responseType: "blob",
                transformResponse: [
                    async function (data) {
                        return new Promise((resolve) => {
                            let reader = new FileReader();
                            reader.readAsText(data, "GBK");
                            reader.onload = function () {
                                resolve(reader.result);
                            };
                        });
                    },
                ],
            })
            .then(async function (res) {
                const novel: Novel = {};
                let imgMapCache: ImgMap = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data; // 图片与文字的映射
                let imgCache: ImgMap = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data; // 图片与base64的映射
                if (!(imgMapCache as ImgMap)) {
                    imgMapCache = {};
                }
                if (!(imgCache as ImgMap)) {
                    imgCache = {};
                }
                // 获取网页数据
                const contextEle = document.getElementById("main-context");
                contextEle && (contextEle.innerText = "loading...");
                let content: string = await res.data;

                content = content.replace(/\r\n/g, "");
                content = content.replace(/\n/g, "");

                let bodyStr = new RegExp('<body class="chapter".*</body>').exec(content)?.[0];
                bodyStr = bodyStr?.replace("body", "div");
                const body = strToDom(bodyStr)[0];
                if (body) {
                    contextEle && (contextEle.innerText = "");
                    contextEle?.appendChild(body);
                }

                console.log("提取title")
                // 提取title
                novel.title = document.getElementsByClassName("page-title")?.[0]?.innerHTML;

                console.log("提取章小节")
                // 提取章小节
                const aList = document.getElementsByClassName("chapterPages")[0].childNodes as unknown as Array<HTMLLinkElement>;
                for (let i = 0; i < aList.length; i += 1) {
                    const link = aList[i];
                    const href = link.getAttribute("href");
                    novel.pages || (novel.pages = []);
                    novel.pages = [...novel.pages, href];
                    if (link.getAttribute("class") === "curr") {
                        novel.currPage = href;
                    }
                }

                console.log("提取上一章、下一章")
                // 提取上一章、下一章
                const prevLink = document.getElementsByClassName("mod page-control")[1].getElementsByClassName("prev")[0] as unknown as HTMLLinkElement;
                const nextLink = document.getElementsByClassName("mod page-control")[1].getElementsByClassName("next")[0] as unknown as HTMLLinkElement;
                novel.prev = prevLink.getAttribute("href");
                novel.next = nextLink.getAttribute("href");

                console.log("提取正文")
                // 提取正文
                const mainContextEleList = document.getElementsByClassName("neirong")[0].childNodes as unknown as Array<
                    HTMLParamElement | HTMLImageElement | HTMLBRElement
                >;
                for (let i = 0; i < mainContextEleList.length; i += 1) {
                    novel.mainContext || (novel.mainContext = []);
                    const itemEle = mainContextEleList[i];
                    if (itemEle instanceof Text) {
                        let text = itemEle.textContent;
                        text = text?.replace(/&nbsp;/g, "") || null;
                        if (text) {
                            novel.mainContext.push(text);
                        }
                    }
                    if (itemEle instanceof HTMLImageElement) {
                        let imgId = itemEle.getAttribute("src");
                        if (imgId) {
                            novel.mainContext.push(`img:${imgId}`);
                            imgMapCache[imgId] || (imgMapCache[imgId] = null);
                            imgCache[imgId] || (imgCache[imgId] = null);
                        }
                    }
                }

                localStorage.setItem("imgMap", JSON.stringify(imgMapCache));
                const pList: Array<Promise<any>> = [];
                Object.keys(imgCache).forEach((key) => {
                    if (imgCache[key] === null) {
                        pList.push(
                            new Promise((resolve, reject) => {
                                axios
                                    .get(`/getImg${key}`, {
                                        responseType: "blob",
                                        transformResponse: [
                                            async function (data) {
                                                return new Promise((resolve2, reject2) => {
                                                    const fileReader = new FileReader();
                                                    fileReader.onload = (e) => {
                                                        resolve2(e?.target?.result);
                                                    };
                                                    // readAsDataURL
                                                    fileReader.readAsDataURL(data);
                                                    fileReader.onerror = () => {
                                                        reject2(new Error("blobToBase64 error"));
                                                    };
                                                });
                                            },
                                        ],
                                    })
                                    .then(
                                        async (res) => {
                                            const imgBase64 = await res.data;
                                            if (typeof imgBase64 === "string") {
                                                imgCache[key] = imgBase64;
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
                    (res) => {
                        console.log("加载完成");
                        localStorage.setItem("img", JSON.stringify(imgCache));
                        if (contextEle) {
                            contextEle.innerHTML = "";
                        }
                        novel.mainContext?.forEach?.((data) => {
                            if (data) {
                                let child = null;
                                const imgReg = new RegExp(/$img:.+/);
                                if (imgReg.test(data)) {
                                    const imgId = data.split("img:")[1];
                                    if (imgMapCache?.[imgId]) {
                                        child = document.createTextNode(imgMapCache[imgId]);
                                    } else {
                                        child = document.createElement("img");
                                        child.setAttribute("src", imgCache?.[imgId]);
                                    }
                                }
                                contextEle?.appendChild(child);
                            }
                        });
                    },
                    (res) => {
                        console.log(res);
                    }
                );

                console.log(novel, imgMapCache);
            })
            .catch(function (err) {
                console.error("failed", err);
            });
    },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
