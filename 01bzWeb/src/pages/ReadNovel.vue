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
import strToDom from "@/utils/strToDom";
import ImgBase64 from "@/utils/ImgBase64";
import ImgMapChar from "@/utils/ImgMapChar";
import cacheImg from "@/utils/cacheImg";
import EditableImg from "@/components/EditableImg.vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import * as services from "@/service/index.js";

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
            imgMapCache: ImgMapChar.get(), // 图片与文字的映射
            imgCache: ImgBase64.get(), // 图片与base64的映射
            novelId: this.$route.query.id,
            novelUrl: this.$route.query.url,
            loading: false,
            loadSuccess: false,
            autoRefreshChar: null,
        };
    },
    props: {
        msg: String,
    },
    mounted: async function () {
        this.load();
        this.autoRefreshChar = setInterval(() => {
            this.imgMapCache = ImgMapChar.get(); // 图片与文字的映射
            this.imgCache = ImgBase64.get(); // 图片与base64的映射
        }, 1000);
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
                const currPage = this.novel.currPage?.replace?.(".html", "");
                const nextNovelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
                const index = nextNovelList.findIndex((item) => {
                    console.log(item.id.toString(), this.novelId.toString());
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
        load: async function (e) {
            console.log("加载中...");
            this.loadSuccess = false;
            this.loading = true;
            try {
                const webData = await this.getWebData();
                const initRes = this.initContent(webData) || {};
                this.novel = initRes.novel;
                await cacheImg();
                this.imgMapCache = ImgMapChar.get(); // 图片与文字的映射
                this.imgCache = ImgBase64.get(); // 图片与base64的映射
                this.toTop();
                this.loadSuccess = true;
                this.setHistory();
            } catch (error) {
                console.error(error);
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
            this.novelUrl = this.novel.prev.replace(".html", "");
            this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
            this.load();
        },

        toNext: function () {
            this.novelUrl = this.novel.next.replace(".html", "");
            this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrl}`);
            this.load();
        },

        toPages: function (pageNumber) {
            if (this.novel.currPage !== this.novel.pages[pageNumber]) {
                const novelUrlSplit = this.novelUrl.split("/");
                this.novelId = `/${novelUrlSplit[1]}/${novelUrlSplit[2]}/${this.novel.pages[pageNumber].replace(".html", "")}`;
                this.$router.replace(`ReadNovel?id=${this.novelId}&url=${this.novelUrlSplit}`);
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
            ImgMapChar.set(this.imgMapCache);
        },

        getWebData: function () {
            return new Promise((resolve, reject) => {
                services
                    .getNovelHtml(this.novelUrl)
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
