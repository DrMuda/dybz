<template>
    <div id="main">
        <div class="nav">
            <el-button class="nav-btn" @click="this.load">刷新</el-button>
            <el-button class="nav-btn" @click="this.toPrev">上一章</el-button>
            <el-button class="nav-btn" @click="this.toNext">下一章</el-button>
            <el-button class="nav-btn" v-for="(item, index) in this.novel.pages" :key="item" @click="this.toPages(index)" :type="setPageBtnType(index)"
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
import strToDom from "@/utils/strToDom";
import ImgBase64 from "@/utils/ImgBase64";
import ImgMapChar from "@/utils/ImgMapChar";
import cacheImg from "@/utils/cacheImg";
import EditableImg from "@/components/EditableImg.vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import * as services from "@/service/index.js";
import { tr } from "element-plus/lib/locale";

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
            imgMapCache: ImgMapChar.get(), // 图片与文字的映射
            imgCache: ImgBase64.get(), // 图片与base64的映射
            novelId: this.$route.query.id,
            novelUrl: this.$route.query.url,
            loading: false,
            isPreLoad: false, // 是否预加载
            stopLoad: false,
            tryPreLoadNum: 1, // 预加载第几次
            maxTryPreloadNum: 3, // 最多重试预加载几次
            loadSuccess: false,
            autoRefreshChar: null,
        };
    },
    props: {
        msg: String,
    },
    mounted: async function () {
        await this.load();
        this.autoRefreshChar = setInterval(() => {
            const imgMapCache = ImgMapChar.get();
            const imgCache = ImgBase64.get();
            if (JSON.stringify(imgMapCache) !== JSON.stringify(this.imgMapCache)) {
                this.imgMapCache = imgMapCache;
            }
            if (JSON.stringify(imgCache) !== JSON.stringify(this.imgCache)) {
                this.imgCache = imgCache;
            }
        }, 1000);
        setTimeout(() => {
            console.log("开始预加载");
            this.nextPageNovel = null;
            this.isPreLoad = true;
            this.tryPreLoadNum = 1;
            this.maxTryPreloadNum = 3;
            this.load();
        }, 500);
    },
    beforeUnmount() {
        // eslint-disable-next-line no-debugger
        // debugger;
        this.autoRefreshChar && clearInterval(this.autoRefreshChar);
        this.setHistory();
    },
    methods: {
        setHistory: function () {
            if (this.loadSuccess) {
                const urlList = this.novelUrl.split("/");
                const currPage = this.novel.pages[currPage]?.replace?.(".html", "") || this.novelUrl;
                const nextNovelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
                const index = nextNovelList.findIndex((item) => {
                    return item.id.toString() === this.novelId.toString();
                });
                // eslint-disable-next-line no-debugger
                // debugger;
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
                let timer = setInterval(() => {
                    if (this.stopLoad) {
                        this.stopLoad = false;
                        clearInterval(timer);
                        resolve();
                    }
                }, 1);
                this.loadSuccess = false;
                !this.isPreLoad && (this.loading = true);
                try {
                    let novelUrl = this.novelUrl;
                    console.log(this.novel);
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
                        const webData = this.getWebData(novelUrl);
                        webData.then(
                            (data) => {
                                const initRes = this.initContent(data) || {};
                                let sleep = new Promise((resolve) => {
                                    setTimeout(
                                        () => {
                                            resolve();
                                        },
                                        this.isPreLoad ? 10000 : 0
                                    );
                                });
                                sleep.then(() => {
                                    if (this.isPreLoad) {
                                        this.nextPageNovel = initRes.novel;
                                    } else {
                                        this.novel = initRes.novel;
                                    }
                                    this.cacheImg().then(() => {
                                        this.imgMapCache = ImgMapChar.get(); // 图片与文字的映射
                                        this.imgCache = ImgBase64.get(); // 图片与base64的映射
                                        this.isPreLoad && this.toTop();
                                        this.loadSuccess = true;
                                        this.isPreLoad = false;

                                        !this.isPreLoad && (this.loading = false);
                                        setTimeout(() => {
                                            // 如果是预加载， 且加载次数小于最大加载次数， 且本次加载失败， 进行下一次预加载
                                            if (this.isPreLoad && this.tryPreLoadNum < this.maxTryPreloadNum && !this.loadSuccess) {
                                                console.log("开始重试预加载");
                                                this.loading();
                                            }
                                        }, 500);
                                        !this.isPreLoad && this.setHistory();
                                        clearInterval(timer);
                                        resolve();
                                    });
                                });
                            },
                            () => {
                                resolve();
                            }
                        );
                    }
                } catch (error) {
                    console.error(error);
                    if (!this.isPreLoad) {
                        ElMessage({
                            showClose: true,
                            message: "出错了",
                            type: "error",
                        });
                    }
                    !this.isPreLoad && (this.loading = false);
                }
            });
        },

        toPrev: async function () {
            this.novelUrl = this.novel.prev.replace(".html", "");
            this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
            if (this.isPreLoad) {
                this.stopLoad = true;
            }
            this.isPreLoad = false;
            await this.load();
            setTimeout(() => {
                console.log("加载上一页完成，开始预加载");
                this.nextPageNovel = null;
                this.isPreLoad = true;
                this.tryPreLoadNum = 1;
                this.maxTryPreloadNum = 3;
                this.load();
            }, 500);
        },

        toNext: async function () {
            this.novelUrl = this.novel.next.replace(".html", "");
            this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
            // 如果当前是最后一页， 那么下一章就是预加载的内容， 直接使用预加载的内容
            console.log("当前页数与最大页数页数", this.novel.currPage, this.novel.pages.length);
            if (!this.novel.currPage || this.novel.currPage === this.novel.pages.length - 1) {
                if (this.nextPageNovel) {
                    console.log("使用预加载内容");
                    this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                } else {
                    console.log("没有预加载内容");
                    if (this.isPreLoad) {
                        console.log("目前正在加载， 等待这次加载完毕");
                        this.isPreLoad = false;
                        this.loading = true;
                        await new Promise((resolve) => {
                            this.$watch("loading", (newValue, oldValue) => {
                                console.log("这次加载完毕");
                                resolve();
                            });
                        });
                    } else {
                        console.log("开始新的加载");
                        if (this.isPreLoad) {
                            this.stopLoad = true;
                        }
                        this.isPreLoad = false;
                        await this.load();
                    }
                }
            } else {
                console.log("不是下一页, 不使用预加载内容");
                if (this.isPreLoad) {
                    this.stopLoad = true;
                }
                this.isPreLoad = false;
                await this.load();
            }
            setTimeout(() => {
                console.log("加载下一页完成，开始预加载");
                this.nextPageNovel = null;
                this.isPreLoad = true;
                this.tryPreLoadNum = 1;
                this.maxTryPreloadNum = 3;
                this.load();
            }, 500);
        },

        toPages: async function (pageNumber) {
            // 点击同一页的话， 不做处理
            if (this.novel.currPage !== pageNumber) {
                const novelUrlSplit = this.novelUrl.split("/");
                this.novelUrl = `/${novelUrlSplit[1]}/${novelUrlSplit[2]}/${this.novel.pages[pageNumber].replace(".html", "")}`;
                this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
                // 如果刚好点击的是下一页， 使用预加载的内容
                console.log("当前页数与点击页数", this.novel.currPage, pageNumber);
                if (this.novel.currPage + 1 === pageNumber) {
                    if (this.nextPageNovel) {
                        console.log("使用预加载内容");
                        this.novel = JSON.parse(JSON.stringify(this.nextPageNovel));
                    } else {
                        console.log("没有预加载内容");
                        if (this.isPreLoad) {
                            console.log("目前正在加载， 等待这次加载完毕");
                            this.isPreLoad = false;
                            this.loading = true;
                            await new Promise((resolve) => {
                                this.$watch("loading", (newValue, oldValue) => {
                                    console.log("这次加载完毕");
                                    resolve();
                                });
                            });
                        } else {
                            console.log("开始新的加载");
                            this.isPreLoad = false;
                            await this.load();
                        }
                    }
                } else {
                    console.log("不是下一页, 不使用预加载内容");
                    this.isPreLoad = false;
                    await this.load();
                }
                setTimeout(() => {
                    console.log("加载", pageNumber, "完成，开始预加载");
                    this.nextPageNovel = null;
                    this.isPreLoad = true;
                    this.tryPreLoadNum = 1;
                    this.maxTryPreloadNum = 3;
                    this.load();
                }, 500);
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
            ImgMapChar.set(this.imgMapCache);
        },

        getWebData: function (novelUrl = this.novelUrl) {
            return new Promise((resolve, reject) => {
                services
                    .getNovelHtml(novelUrl)
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
            let imgMapCache = ImgMapChar.get(); // 图片与文字的映射
            let imgCache = ImgBase64.get(); // 图片与base64的映射
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

            ImgBase64.set(imgCache);
            ImgMapChar.set(imgMapCache);
            return { novel, imgMapCache, imgCache };
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
