<!--
 * @Author: LXX
 * @Date: 2022-03-02 14:02:18
 * @LastEditTime: 2022-03-31 16:58:16
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\SelectChapter.vue
-->
<template>
    <div class="select-chapter">
        <div class="header">
            <h3>{{ novel.name }}</h3>
            <div style="display: flex; align-items: center; font-size: 14px">
                <span>锁定路线:</span>
                <el-select v-model="novel.chanel" class="m-2" placeholder="Select" size="small" @change="changeChanel(value)">
                    <el-option v-for="(item, index) in chanelList" :key="item" :label="'路线' + (index + 1)" :value="item" />
                </el-select>
            </div>
        </div>
        <div v-loading="loading" class="list">
            <el-table :data="chapterList" style="width: 100%" @row-click="toReadNovel" :showHeader="false" :stripe="true">
                <el-table-column prop="title" :label="novel.name" />
            </el-table>
        </div>
        <div class="page-nav-contain">
            <div class="page-nav">
                <el-button @click="toPrev" class="page-btn">上一页</el-button>
                <el-button @click="toNext" class="page-btn">下一页</el-button>
            </div>
            <div class="page-nav">
                <el-input-number v-model="inputPage" class="page-input" :min="1" :max="amountPage" />
                <el-button @click="toPage" class="page-btn">跳转</el-button>
            </div>
            <div style="text-align: center; width: 100%">共{{ amountPage }}页</div>
        </div>
    </div>
</template>

<script>
import { ElButton, ElInputNumber, ElMessage, ElTable, ElSelect, ElOption } from "element-plus";
import strToDom from "@/utils/strToDom";
import moment from "moment";
import * as services from "@/service/index.js";

export default {
    components: {
        ElTable,
        ElButton,
        ElInputNumber,
        ElSelect,
        ElOption,
    },
    data() {
        return {
            novel: {},
            novelId: this.$route.query.id,
            chapterList: [],
            chanelList: JSON.parse(localStorage.getItem("chanelList")) || [
                "www.banzhu222.xyz",
                "www.5diyibanzhu.xyz",
                "www.diyibanzhuvip6.xyz",
                "www.diyibanzhu111.xyz",
            ],
            currPage: 1,
            inputPage: 1,
            loading: false,
            amountPage: 0,
            isFirt: false,
        };
    },
    mounted() {
        let novelList = [];
        try {
            novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
        } catch (error) {
            novelList = [];
        }
        let novel = {};
        novelList.forEach((item) => {
            if (item.id.toString() === this.novelId.toString()) {
                novel = item;
            }
        });
        if (!novel.chanel) {
            novel.chanel = localStorage.getItem("chanel");
        }
        this.novel = novel;
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                this.initContent(await this.getWebData());
            } catch (error) {
                console.error(error);
                ElMessage({
                    showClose: true,
                    message: "出错了",
                    type: "error",
                    duration: 1000,
                });
            }
            this.loading = false;
        },

        changeChanel() {
            let novelList = [];
            try {
                novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
            } catch (error) {
                novelList = [];
            }
            novelList = novelList.map((item) => {
                if (item.id.toString() === this.novelId.toString()) {
                    return this.novel;
                }
                return item;
            });
            localStorage.setItem("novelList", JSON.stringify(novelList));
            localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
            this.load();
        },

        toPrev() {
            if (this.currPage > 1) {
                this.currPage -= 1;
                this.inputPage = this.currPage;
                this.load();
            }
        },
        toNext() {
            if (this.currPage < this.amountPage) {
                this.currPage += 1;
                this.inputPage = this.currPage;
                this.load();
            }
        },
        toPage() {
            this.currPage = this.inputPage;
            this.load();
        },
        toReadNovel(row) {
            this.$store.commit("setCurrNovelChanel", this.novel.chanel);
            this.$router.push({
                name: `ReadNovel`,
                path: "/ReadNovel",
                query: {
                    id: this.novelId,
                    url: row.url,
                },
            });
        },
        getWebData() {
            return new Promise((resolve) => {
                services
                    .getChapter(this.novel.url, this.currPage, this.novel.chanel)
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
                                duration: 1000,
                            });
                            this.loading = false;
                            console.error("failed", err);
                        }.bind(this)
                    );
            });
        },
        initContent(content) {
            // 清除空格，防止扰乱正则匹配
            content = content.replace(/\r\n/g, "");
            content = content.replace(/\n/g, "");
            content = content.replace(/\/images\/jipin-default.jpg/g, "");

            this.amountPage = new RegExp(/(第[0-9]+\/[0-9]+页)/, "g").exec(content)?.[0];
            this.amountPage = this.amountPage.split("/")[1];
            this.amountPage = this.amountPage.replace("页", "");
            this.amountPage = parseInt(this.amountPage);

            // 转成dom元素，方便分析
            const tempEle = document.createElement("div");
            let bodyStr = new RegExp('<body class="cover".*</body>').exec(content)?.[0];
            bodyStr = bodyStr?.replace("body", "div");
            const body = strToDom(bodyStr)[0];
            if (body) {
                tempEle?.appendChild(body);
            }

            // 提取章节列表
            this.chapterList = [];
            const linkListEle = tempEle.getElementsByClassName("mod block update chapter-list")[1].getElementsByTagName("a");
            for (let i = 0; i < linkListEle.length; i += 1) {
                this.chapterList.push({
                    url: linkListEle[i].getAttribute("href"),
                    title: linkListEle[i].innerText,
                });
            }

            if (!this.isFirt) {
                this.isFirt = true;
                let novelList = [];
                try {
                    novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
                } catch (error) {
                    novelList = [];
                }
                novelList = novelList.map((item) => {
                    if (item.id.toString() === this.novelId.toString()) {
                        return {
                            ...item,
                            firstChapter: {
                                title: this.chapterList[0].title,
                                url: this.chapterList[0].url.replace(".html", ""),
                            },
                        };
                    }
                    return item;
                });
                localStorage.setItem("novelList", JSON.stringify(novelList));
                localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
            }
            tempEle.remove();
        },
    },
};
</script>

<style>
.select-chapter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    max-height: 100%;
    box-sizing: border-box;
}
.header {
    width: 100%;
    height: 50px;
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.list {
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
    padding: 16px;
    padding-top: 0;
    /* margin-top: 4px; */
    width: 100%;
    box-sizing: border-box;
}
.page-nav-contain {
    flex-grow: 0;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
}
.page-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 8px;
}
.page-btn {
    width: 100px;
    margin: 0 !important;
}
.page-input {
    width: 100px;
}
</style>
