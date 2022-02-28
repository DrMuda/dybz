<template>
    <div id="main">
        <div id="main-context">loading...</div>
    </div>
</template>

<script>
import axios from "axios";
import strToDom from "../utils/strToDom";
// import EditableImg from "./EditableImg.vue";
// eslint-disable-next-line

export default {
    name: "Home",
    components: {
        // EditableImg,
    },
    data() {
        return {
            reloadBtnIsShow: false,
        };
    },
    props: {
        msg: String,
    },
    mounted: async function () {
        this.load();
    },
    methods: {
        load: async function () {
            const webData = await this.getWebData();
            const initRes = this.initContent(webData) || {};
            this.transToWeb(initRes);
        },
        getWebData: function () {
            return new Promise((resolve, reject) => {
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
                    .then(
                        async function (res) {
                            const content = await res.data;
                            resolve(content);
                        }.bind(this)
                    )
                    .catch(function (err) {
                        const contextEle = document.getElementById("main-context");
                        contextEle || (contextEle.innerText = "加载失败，请重试");
                        console.error("failed", err);
                    });
            });
        },
        initContent: (content) => {
            const novel = {};
            let imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
            let imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射
            // 获取网页数据
            const tempEle = document.createElement("div");
            // tempEle.setAttribute("style","visibility:hidden;")
            // document.getElementById("main-context").appendChild(tempEle)
            content = content.replace(/\r\n/g, "");
            content = content.replace(/\n/g, "");

            let bodyStr = new RegExp('<body class="chapter".*</body>').exec(content)?.[0];
            bodyStr = bodyStr?.replace("body", "div");
            const body = strToDom(bodyStr)[0];
            if (body) {
                tempEle?.appendChild(body);
            }

            console.log("提取title");
            // 提取title
            novel.title = tempEle.getElementsByClassName("page-title")?.[0]?.innerHTML;

            console.log("提取章小节");
            // 提取章小节
            const aList = tempEle.getElementsByClassName("chapterPages")[0].childNodes;
            for (let i = 0; i < aList.length; i += 1) {
                const link = aList[i];
                const href = link.getAttribute("href");
                novel.pages || (novel.pages = []);
                novel.pages = [...novel.pages, href];
                if (link.getAttribute("class") === "curr") {
                    novel.currPage = href;
                }
            }

            console.log("提取上一章、下一章");
            // 提取上一章、下一章
            const prevLink = tempEle.getElementsByClassName("mod page-control")[1].getElementsByClassName("prev")[0];
            const nextLink = tempEle.getElementsByClassName("mod page-control")[1].getElementsByClassName("next")[0];
            novel.prev = prevLink.getAttribute("href");
            novel.next = nextLink.getAttribute("href");

            console.log("提取正文");
            // 提取正文
            const mainContextEleList = tempEle.getElementsByClassName("neirong")[0].childNodes;
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
                if (itemEle instanceof HTMLBRElement) {
                    novel.mainContext.push("<br />");
                }
            }

            localStorage.setItem("imgMap", JSON.stringify(imgMapCache));

            console.log(novel);
            return { novel, imgMapCache, imgCache };
        },
        cacheImg: () => {
            return new Promise((resolve, reject) => {
                let imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
                let imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射
                const pList = [];
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
                        localStorage.setItem("img", JSON.stringify(imgCache));
                        resolve();
                    },
                    (res) => {
                        reject();
                        console.log(res);
                    }
                );
            });
        },
        transToWeb: ({ novel }) => {
            const contextEle = document.getElementById("main-context");
            const imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
            const imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射

            if (contextEle) {
                contextEle.innerHTML = "";
                novel?.mainContext?.forEach?.((data) => {
                    if (data) {
                        let child = null;
                        const imgReg = new RegExp(/^img:/);
                        const brReg = new RegExp(/^<br \/>$/);
                        if (imgReg.test(data)) {
                            const imgId = data.split("img:")[1];
                            if (imgMapCache?.[imgId]) {
                                child = document.createTextNode(imgMapCache?.[imgId] || "");
                            } else {
                                child = document.createElement("img");
                                child.setAttribute("src", imgCache?.[imgId] || "");
                                child.setAttribute("id", imgId || "");
                            }
                        } else if (brReg.test(data)) {
                            child = document.createElement("br");
                        } else {
                            child = document.createTextNode(data || "");
                        }
                        contextEle?.appendChild(child);
                    }
                });
            }
        },
    },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
