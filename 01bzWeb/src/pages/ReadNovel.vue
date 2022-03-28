<template>
    <div id="main">
        <div class="nav">
            <el-button class="nav-btn" @click="load">刷新</el-button>
            <el-button class="nav-btn" @click="toPrev">上一章</el-button>
            <el-button class="nav-btn" @click="toNext">下一章</el-button>
            <el-button class="nav-btn" v-for="(item, index) in novel.pages" :key="item" @click="toPages(index)" :type="setPageBtnType(index)"
                >[{{ index + 1 }}]
            </el-button>
        </div>
        <div id="main-context">
            <template v-for="(item, index) in novel.mainContext">
                <br v-if="new RegExp(/^<br \/>/).test(item) === true" :key="item + index" />
                <editable-img
                    v-else-if="new RegExp(/^img:/).test(item) === true && !imgAndChar[oldNewKey[item.replace('img:', '')]]?.char"
                    :key="item + index"
                    :imgSrc="imgAndChar[oldNewKey[item.replace('img:', '')]]?.img || '#'"
                    :id="item.replace('img:', '')"
                    :updateCache="updateCache"
                    :item="item"
                    :newKey="oldNewKey[item.replace('img:', '')]"
                />
                <span v-else-if="new RegExp(/^img:/).test(item) === true && imgAndChar[oldNewKey[item.replace('img:', '')]]?.char" :key="item + index">{{
                    imgAndChar[oldNewKey[item.replace("img:", "")]]?.char
                }}</span>
                <span v-else :key="item + index">{{ item }}</span>
            </template>
        </div>
        <div id="loading" v-loading="loading" v-show="loading"></div>
    </div>
</template>

<script>
import strToDom from "@/utils/strToDom";
import ImgAndChar from "../utils/ImgAndChar";
import cacheImg from "@/utils/cacheImg";
import EditableImg from "@/components/EditableImg.vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import * as services from "@/service/index.js";
/* eslint-disable */

export default {
    components: {
        EditableImg,
    },
    data() {
        return {
            novel: {
                title: "",
                pages: [],
                currPage: 0,
                prev: "",
                next: "",
                mainContext: [],
            },
            // 预加载, 下一页/章节的内容, 结构与novel一致
            nextPageNovel: null,
            imgAndChar: ImgAndChar.get(),
            oldNewKey: {},
            novelId: this.$route.query.id,
            novelUrl: this.$route.query.url,
            loading: false,
            isPreLoad: false, // 是否预加载
            tryPreLoadNum: 1, // 预加载第几次
            maxTryPreloadNum: 3, // 最多重试预加载几次
            autoRefreshChar: null,
            cancelTokenList: [],
            reloadTimeInterval: () => {
                return Math.random() * 1000 + 1000;
            }, // 预加载与重新加载间隔时间
        };
    },
    props: {
        msg: String,
    },
    mounted: async function () {
        let cachePage = {};
        try {
            cachePage = JSON.parse(sessionStorage.getItem("cachePage") || "{}");
        } catch (error) {
            console.error(error);
            cachePage = {};
        }

        try {
            this.oldNewKey = JSON.parse(localStorage.getItem("oldNewKey") || "{}");
        } catch (error) {
            console.error(error);
            this.oldNewKey = {};
        }

        if (cachePage.novelUrl === this.novelUrl && cachePage.novelId === this.novelId) {
            this.novel = cachePage.novel;
            this.nextPageNovel = cachePage.nextPageNovel;
        } else {
            await this.load();
            this.toTop();
            setTimeout(() => {
                this.nextPageNovel = null;
                this.isPreLoad = true;
                this.tryPreLoadNum = 1;
                this.maxTryPreloadNum = 3;
                this.load();
            }, this.reloadTimeInterval());
        }

        this.autoRefreshChar = setInterval(() => {
            if (JSON.stringify(ImgAndChar.get()) !== JSON.stringify(this.imgAndChar)) {
                this.imgAndChar = ImgAndChar.get();
            }
            if (localStorage.getItem("oldNewKey") !== JSON.stringify(this.oldNewKey)) {
                try {
                    this.oldNewKey = JSON.parse(localStorage.getItem("oldNewKey") || "{}");
                } catch (error) {
                    console.error(error);
                    this.oldNewKey = {};
                }
            }
        }, 500);
    },
    beforeUnmount() {
        // eslint-disable-next-line no-debugger
        // debugger;
        this.autoRefreshChar && clearInterval(this.autoRefreshChar);
        this.setHistory();
        this.cachePage();
    },
    beforeRouteLeave(_, __, next) {
        this.novelId = this.$route.query.id;
        this.novelUrl = this.$route.query.url;
        next();
    },
    methods: {
        cachePage: function () {
            const data = {
                novelId: this.novelId,
                novelUrl: this.novelUrl,
                novel: this.novel,
                nextPageNovel: this.nextPageNovel,
            };
            sessionStorage.setItem("cachePage", JSON.stringify(data));
        },
        setHistory: function () {
            if (this.novel.mainContext?.length > 0) {
                const urlList = this.novelUrl.split("/");
                const currPage = this.novel.pages[currPage]?.replace?.(".html", "");
                const nextNovelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
                const index = nextNovelList.findIndex((item) => {
                    return item.id.toString() === this.novelId.toString();
                });
                if (index > -1) {
                    nextNovelList[index] = {
                        ...nextNovelList[index],
                        history: {
                            title: this.novel.title,
                            url: `/${urlList[1]}/${urlList[2]}/${currPage || urlList[3]}`,
                        },
                    };
                }
                localStorage.setItem("novelList", JSON.stringify(nextNovelList));
                localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
            }
        },

        load: function () {
            return new Promise((resolve) => {
                let loadSuccess = false;
                !this.isPreLoad && (this.loading = true);
                try {
                    let novelUrl = this.novelUrl;
                    if (this.isPreLoad) {
                        // 如果有下一页，则预加载下一页，否则加载下一章，再不然就停止加载
                        if (this.novel.pages[this.novel.currPage + 1]) {
                            novelUrl =
                                "/" +
                                this.novelUrl.split("/")[1] +
                                "/" +
                                this.novelUrl.split("/")[2] +
                                "/" +
                                this.novel.pages[this.novel.currPage + 1].replace(".html", "");
                        } else if (this.novel.next) {
                            novelUrl = this.novel.next.replace(".html", "");
                        } else {
                            resolve();
                        }
                    }
                    if (novelUrl) {
                        const webData = this.getWebData(novelUrl, this.cancelTokenList);
                        webData.then(
                            function (data) {
                                this.cancelTokenList = [];
                                const novel = this.initContent(data) || {};
                                const oldNewKey = JSON.parse(localStorage.getItem("oldNewKey") || "{}");
                                let canSetNewKey = false;
                                cacheImg(
                                    function (oldKey, newKey) {
                                        oldNewKey[oldKey] = newKey;
                                        canSetNewKey = true;
                                    }.bind(this)
                                ).then(
                                    function () {
                                        let nextContext = novel.mainContext;
                                        if (canSetNewKey) {
                                            localStorage.setItem("oldNewKey", JSON.stringify(oldNewKey));
                                        }
                                        if (this.isPreLoad) {
                                            this.nextPageNovel = { ...novel, mainContext: nextContext };
                                        } else {
                                            this.novel = { ...novel, mainContext: nextContext };
                                        }

                                        this.loading = false;
                                        this.imgAndChar = ImgAndChar.get();
                                        loadSuccess = true;
                                        this.isPreLoad = false;

                                        resolve();
                                    }.bind(this)
                                );
                            }.bind(this),
                            function (err) {
                                console.error(err);
                                this.cancelTokenList = [];
                                if (err !== "中断请求") {
                                    setTimeout(
                                        function () {
                                            // 如果是预加载， 且加载次数小于最大加载次数， 且本次加载失败， 进行下一次预加载
                                            if (this.isPreLoad && this.tryPreLoadNum < this.maxTryPreloadNum && !loadSuccess) {
                                                this.tryPreLoadNum += 1;
                                                this.load();
                                            } else {
                                                this.isPreLoad = false;
                                                resolve();
                                            }
                                        }.bind(this),
                                        this.reloadTimeInterval()
                                    );
                                }
                                resolve();
                            }.bind(this)
                        );
                    }
                } catch (error) {
                    console.error(error);
                    if (!this.isPreLoad) {
                        ElMessage({
                            showClose: true,
                            message: "出错了",
                            type: "error",
                            duration: 1000,
                        });
                    }
                    !this.isPreLoad && (this.loading = false);
                    this.cancelTokenList = [];
                    resolve();
                }
            });
        },

        toPrev: async function () {
            if (this.novel.prev) {
                this.novelUrl = this.novel.prev.replace(".html", "");
                this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
                if (this.isPreLoad) {
                    // 如果现在有在加载中， 使当前请求中断
                    await new Promise((resolve) => {
                        this.cancelTokenList.forEach((c) => {
                            c("中断请求");
                        });
                        this.cancelTokenList = [];
                        setTimeout(resolve, 10);
                    });
                }
                this.isPreLoad = false;
                await this.load();
                this.toTop();
                setTimeout(() => {
                    this.nextPageNovel = null;
                    this.isPreLoad = true;
                    this.tryPreLoadNum = 1;
                    this.maxTryPreloadNum = 3;
                    this.load();
                }, this.reloadTimeInterval());
            } else {
                ElMessage({
                    message: "已是第一章",
                    type: "info",
                    showClose: true,
                    duration: 1000,
                });
            }
        },

        toNext: async function () {
            if (this.novel.next) {
                this.novelUrl = this.novel.next.replace(".html", "");
                this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
                // 如果当前是最后一页， 那么下一章就是预加载的内容， 直接使用预加载的内容
                if (this.novel.currPage === undefined || this.novel.currPage === this.novel.pages.length - 1) {
                    if (this.nextPageNovel) {
                        // console.log("1");
                        this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                        this.toTop();
                    } else {
                        if (this.isPreLoad) {
                            // console.log("2");
                            this.loading = true;
                            await new Promise((resolve) => {
                                this.$watch("loading", () => {
                                    resolve();
                                });
                            });
                            this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                            this.nextPageNovel = null;
                            this.isPreLoad = false;
                            this.loading = false;
                            this.toTop();
                        } else {
                            // console.log("4");
                            this.isPreLoad = false;
                            await this.load();
                            this.toTop();
                        }
                    }
                } else {
                    if (this.isPreLoad) {
                        // console.log("5");
                        // 如果现在有在加载中， 使当前请求中断
                        await new Promise((resolve) => {
                            this.cancelTokenList.forEach((c) => {
                                c("中断请求");
                            });
                            this.cancelTokenList = [];
                            setTimeout(resolve, 10);
                        });
                    }
                    this.isPreLoad = false;
                    await this.load();
                    this.toTop();
                }
                setTimeout(() => {
                    this.nextPageNovel = null;
                    this.isPreLoad = true;
                    this.tryPreLoadNum = 1;
                    this.maxTryPreloadNum = 3;
                    this.load();
                }, this.reloadTimeInterval());
            } else {
                ElMessage({
                    message: "已是最后一章",
                    type: "info",
                    showClose: true,
                    duration: 1000,
                });
            }
        },

        toPages: async function (pageNumber) {
            // 点击同一页的话， 不做处理
            if (this.novel.currPage !== pageNumber) {
                const novelUrlSplit = this.novelUrl.split("/");
                this.novelUrl = `/${novelUrlSplit[1]}/${novelUrlSplit[2]}/${this.novel.pages[pageNumber].replace(".html", "")}`;
                this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
                // 如果刚好点击的是下一页， 使用预加载的内容
                if (this.novel.currPage + 1 === pageNumber) {
                    if (this.nextPageNovel) {
                        // console.log("1");
                        this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                        this.toTop();
                    } else {
                        if (this.isPreLoad) {
                            // console.log("2");
                            this.loading = true;
                            await new Promise((resolve) => {
                                this.$watch("loading", () => {
                                    resolve();
                                });
                            });
                            this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                            this.toTop();
                        } else {
                            // console.log("4");
                            this.isPreLoad = false;
                            await this.load();
                            this.toTop();
                        }
                    }
                } else {
                    if (this.isPreLoad) {
                        // console.log("5");
                        // 如果现在有在加载中， 使当前请求中断
                        await new Promise((resolve) => {
                            this.cancelTokenList.forEach((c) => {
                                c("中断请求");
                            });
                            this.cancelTokenList = [];
                            setTimeout(resolve, 10);
                        });
                    }
                    this.isPreLoad = false;
                    await this.load();
                    this.toTop();
                }
                setTimeout(() => {
                    this.nextPageNovel = null;
                    this.isPreLoad = true;
                    this.tryPreLoadNum = 1;
                    this.maxTryPreloadNum = 3;
                    this.load();
                }, this.reloadTimeInterval());
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
            this.imgAndChar[id].char = input;
            ImgAndChar.setCharByKey(id, input);
        },

        getWebData: function (novelUrl = this.novelUrl, cancelTokenList = this.cancelTokenList) {
            return new Promise((resolve, reject) => {
                services
                    .getNovelHtml(novelUrl, cancelTokenList)
                    .then(
                        async function (res) {
                            const content = await res.data;
                            resolve(content);
                        }.bind(this)
                    )
                    .catch(
                        function (err) {
                            !this.isPreLoad &&
                                ElMessage({
                                    showClose: true,
                                    message: "加载失败",
                                    type: "error",
                                    duration: 1000,
                                });
                            this.loading = false;
                            if (err.message === "中断请求") {
                                reject("中断请求");
                            } else {
                                reject(err.message);
                            }
                        }.bind(this)
                    );
            });
        },

        initContent: function (content) {
            const novel = {};
            this.imgAndChar = ImgAndChar.get();
            // 清除空格，防止扰乱正则匹配
            content = content.replace(/\n/g, "");
            content = content.replace(/\r/g, "");
            // 防止转成dom时加载资源
            content = content.replace(/src=/g, "my-src=");

            // 转成dom元素，方便分析
            const tempEle = document.createElement("div");
            let bodyStr = new RegExp("<body.*/body>").exec(content)?.[0];
            bodyStr = bodyStr?.replace("body", "div");
            const body = strToDom(bodyStr)[0];
            if (body) {
                tempEle?.appendChild(body);
            }

            // 提取title
            novel.title = tempEle.getElementsByClassName("page-title")?.[0]?.innerHTML;

            // 提取章小节
            const aList = tempEle.getElementsByClassName("chapterPages")?.[0]?.childNodes;
            if (aList?.length > 0) {
                for (let i = 0; i < aList.length; i += 1) {
                    const link = aList[i];
                    const href = link.getAttribute("href");
                    novel.pages || (novel.pages = []);
                    novel.pages = [...novel.pages, href];
                    if (link.getAttribute("class") === "curr") {
                        novel.currPage = i;
                    }
                }
            } else {
                novel.pages = [];
            }

            // 提取上一章、下一章
            const prevLink = tempEle.getElementsByClassName("mod page-control")?.[1]?.getElementsByClassName("prev")?.[0];
            const nextLink = tempEle.getElementsByClassName("mod page-control")?.[1]?.getElementsByClassName("next")?.[0];
            novel.prev = prevLink?.getAttribute("href");
            novel.next = nextLink?.getAttribute("href");
            const test = /.html$/g;
            if (!test.test(novel.prev)) {
                novel.prev = null;
            }
            if (!test.test(novel.next)) {
                novel.next = null;
            }

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
                        let imgId = itemEle.getAttribute("my-src");
                        novel.mainContext.push(`img:${imgId}`);
                        // 如果没有图片id的映射， 则生成新的
                        if (!this.oldNewKey[imgId]) {
                            this.imgAndChar[imgId] = { char: null, img: null };
                        } else {
                            // 有映射关系， 但实际没有图片也生成新的
                            if (!this.imgAndChar[this.oldNewKey[imgId]]?.img) {
                                this.imgAndChar[imgId] = { char: null, img: null };
                            }
                        }
                    }
                    if (itemEle instanceof HTMLBRElement) {
                        novel.mainContext.push("<br />");
                    }
                }
            } else {
                novel.mainContext = [];
            }
            ImgAndChar.set(this.imgAndChar);
            return novel;
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
    margin-bottom: 0;
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
    margin-bottom: 0;
    padding-bottom: 50px;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    box-shadow: 1px 0px 5px #666666;
    z-index: 2;
    box-sizing: border-box;
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
