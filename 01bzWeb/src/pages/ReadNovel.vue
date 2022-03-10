<template>
    <div id="main">
        <div class="nav">
            <el-button class="nav-btn" @click="this.load">刷新</el-button>
            <el-button class="nav-btn" @click="this.toPrev">上一章</el-button>
            <el-button class="nav-btn" @click="this.toNext">下一章</el-button>
            <el-button class="nav-btn" v-for="(item, index) in this.novel.pages" :key="item" @click="this.toPages(index)" :type="this.setPageBtnType(item)"
                >[{{ index + 1 }}]
            </el-button>
        </div>
        <div id="main-context">
            <template v-for="(item, index) in this.novel.mainContext">
                <br v-if="new RegExp(/^<br \/>/).test(item) === true" :key="item + index" />
                <editable-img
                    v-else-if="new RegExp(/^img:/).test(item) === true && !this.imgMapCache[item.replace('img:', '')]"
                    :key="item + index"
                    :imgSrc="this.imgCache[item.replace('img:', '')]"
                    :id="item.replace('img:', '')"
                    :updateCache="this.updateCache"
                />
                <span v-else-if="new RegExp(/^img:/).test(item) === true && this.imgMapCache[item.replace('img:', '')]" :key="item + index">{{
                    this.imgMapCache[item.replace("img:", "")]
                }}</span>
                <span v-else :key="item + index">{{ item }}</span>
            </template>
        </div>
        <div id="loading" v-loading="loading" v-show="loading"></div>
    </div>
</template>

<script>
import axios from "axios";
import strToDom from "@/utils/strToDom";
// import baiduOcr from "@/utils/baiduOcr";
import EditableImg from "@/components/EditableImg.vue";
import { ElMessage } from "element-plus";

export default {
    components: {
        EditableImg,
    },
    data() {
        return {
            novel: {
                title: "",
                pages: [],
                currPage: "",
                prev: "",
                next: "",
                mainContext: [],
            },
            imgMapCache: JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}, // 图片与文字的映射
            imgCache: JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}, // 图片与base64的映射
            novelId: this.$route.query.id,
            loading: "false",
        };
    },
    props: {
        msg: String,
    },
    mounted: async function () {
        this.load();
    },
    beforeUnmount() {
        const idList = this.novelId.split("/");
        const currPage = this.novel.currPage.replace(".html", "");
        const nextNovelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
        const index = nextNovelList.findIndex((item) => {
            return item.id === `/${idList[1]}/${idList[2]}`;
        });
        if (index > -1) {
            nextNovelList[index] = {
                ...nextNovelList[index],
                history: {
                    title: this.novel.title,
                    id: `/${idList[1]}/${idList[2]}/${currPage}`,
                },
            };
        }
        localStorage.setItem("novelList", JSON.stringify(nextNovelList));
    },
    methods: {
        load: async function (e) {
            console.log("加载中...");
            this.loading = true;
            try {
                const webData = await this.getWebData();
                const initRes = this.initContent(webData) || {};
                this.novel = initRes.novel;
                await this.cacheImg();
                this.imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
                this.imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射
                this.toTop();
            } catch (error) {
                console.error(error);
                console.log(this.novel);
                ElMessage({
                    showClose: true,
                    message: "出错了",
                    type: "error",
                });
            }
            console.log("加载完成");
            this.loading = false;
        },

        toPrev: function () {
            this.novelId = this.novel.prev.replace(".html", "");
            this.load();
        },

        toNext: function () {
            this.novelId = this.novel.next.replace(".html", "");
            this.load();
        },

        toPages: function (pageNumber) {
            if (this.novel.currPage !== this.novel.pages[pageNumber]) {
                const novelIdSplit = this.novelId.split("/");
                this.novelId = `/${novelIdSplit[1]}/${novelIdSplit[2]}/${this.novel.pages[pageNumber].replace(".html", "")}`;
                this.load();
            }
        },

        toTop() {
            document.getElementById("main-context").scrollTo({ top: 0, behavior: "smooth" });
        },

        setPageBtnType: function (page) {
            if (page === this.novel.currPage) {
                return "primary";
            }
            return undefined;
        },

        updateCache(id, input) {
            this.imgMapCache[id] = input;
            localStorage.setItem("imgMap", JSON.stringify(this.imgMapCache));
        },

        getWebData: function () {
            return new Promise((resolve, reject) => {
                axios
                    .get(`/getNovelHtml/${localStorage.getItem("chanel")}${this.novelId}`, {
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
                    .catch(
                        function (err) {
                            ElMessage({
                                showClose: true,
                                message: "加载失败",
                                type: "error",
                            });
                            this.loading = false;
                            console.error("failed", err);
                        }.bind(this)
                    );
            });
        },

        initContent: (content) => {
            const novel = {};
            let imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
            let imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射
            // 清除空格，防止扰乱正则匹配
            content = content.replace(/\n/g, "");
            content = content.replace(/\r/g, "");

            // 转成dom元素，方便分析
            const tempEle = document.createElement("div");
            let bodyStr = new RegExp("<body.*/body>").exec(content)?.[0];
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
            const aList = tempEle.getElementsByClassName("chapterPages")?.[0]?.childNodes;
            if (aList?.length > 0) {
                for (let i = 0; i < aList.length; i += 1) {
                    const link = aList[i];
                    const href = link.getAttribute("href");
                    novel.pages || (novel.pages = []);
                    novel.pages = [...novel.pages, href];
                    if (link.getAttribute("class") === "curr") {
                        novel.currPage = href;
                    }
                }
            } else {
                novel.pages = [];
            }

            console.log("提取上一章、下一章");
            // 提取上一章、下一章
            const prevLink = tempEle.getElementsByClassName("mod page-control")?.[1]?.getElementsByClassName("prev")?.[0];
            const nextLink = tempEle.getElementsByClassName("mod page-control")?.[1]?.getElementsByClassName("next")?.[0];
            novel.prev = prevLink?.getAttribute("href");
            novel.next = nextLink?.getAttribute("href");

            console.log("提取正文");
            // 提取正文，正文是由文本、图片、<br />组成， 先提取全部元素作为一个数组， 然后遍历，根据内容重新组装，主要是替换图片
            const mainContextEleList = tempEle.getElementsByClassName("neirong")[0]?.childNodes;
            if (mainContextEleList?.length > 0) {
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
            } else {
                novel.mainContext = [];
            }

            localStorage.setItem("imgMap", JSON.stringify(imgMapCache));
            localStorage.setItem("img", JSON.stringify(imgCache));
            return { novel, imgMapCache, imgCache };
        },

        cacheImg: () => {
            return new Promise((resolve, reject) => {
                console.log("缓存图片");
                let imgMapCache = JSON.parse(`{"data":${localStorage.getItem("imgMap")}}`).data || {}; // 图片与文字的映射
                let imgCache = JSON.parse(`{"data":${localStorage.getItem("img")}}`).data || {}; // 图片与base64的映射
                const pList = [];
                Object.keys(imgCache).forEach((key) => {
                    if (!imgCache[key]) {
                        pList.push(
                            new Promise((resolve, reject) => {
                                axios
                                    .get(`/getImg/${localStorage.getItem("chanel")}${key}`, {
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
                                                    // fileReader.readAsArrayBuffer(data);
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
                                                // imgMapCache[key] = (await baiduOcr(imgBase64)).words_result[0].words;
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
                        console.log("缓存完成");
                        resolve();
                    },
                    (res) => {
                        console.log("缓存完成");
                        reject();
                    }
                );
            });
        },
    },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    height: 100%;
    max-height: 100%;
}
#main-context {
    flex-shrink: 1;
    flex-grow: 1;
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    padding: 0 8px;
}
#loading {
    position: fixed;
    height: 100%;
    width: 100%;
    pointer-events: none;
    z-index: 1;
}
.nav {
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    width: 80px;
    height: 100%;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    box-shadow: 1px 0px 5px #666666;
    z-index: 2;
}
.nav-btn {
    margin: 0 !important;
    width: 60px;
}
.curr {
    border-color: aqua;
    color: aqua;
}
</style>
