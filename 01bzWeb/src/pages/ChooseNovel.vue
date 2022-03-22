<!--
 * @Author: LXX
 * @Date: 2022-03-01 15:55:18
 * @LastEditTime: 2022-03-22 11:25:10
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\ChooseNovel.vue
-->
<template>
    <div class="choose-novel">
        <config-set />
        <div class="novel-list">
            <template v-for="item in novelList">
                <novel-list-item v-if="item.id" :key="item.key" :item="item" :onChange="onChange" :onDel="onDel" />
            </template>
            <div class="add-btn" @click="onAdd">添加</div>
            <div class="add-btn" @click="tran">转换</div>
        </div>
        <div class="sync-btn-contain">
            <el-icon :size="40" @click="pushCache" class="sync-btn pull"><upload /></el-icon>
            <el-icon :size="40" @click="pullCache" class="sync-btn push"><download /></el-icon>
        </div>
    </div>
</template>

<script>
import NovelListItem from "@/components/NovelListItem.vue";
import ConfigSet from "@/components/ConfigSet.vue";
import ImgMapChar from "@/utils/ImgMapChar.js";
import tranform from "../utils/tranform";
import syncCache from "../utils/syncCache";
import { ElMessage, ElMessageBox, ElIcon } from "element-plus";
import { Upload, Download } from "@element-plus/icons-vue";
import moment, { locale } from "moment";
import * as services from "@/service/index.js";

export default {
    components: {
        NovelListItem,
        ConfigSet,
        ElIcon,
        Upload,
        Download,
    },
    data() {
        return {
            novelList: [],
            updateTag: true,
        };
    },
    mounted() {
        try {
            this.novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
            this.novelList = this.novelList.map((item) => {
                return { ...item, key: Math.random() };
            });
        } catch (error) {
            this.novelList = [];
        }
        if (!sessionStorage.getItem("isFirst") || sessionStorage.getItem("isFirst") === "true") {
            this.pullCache();
            sessionStorage.setItem("isFirst", "false");
        }
    },
    methods: {
        tran() {
            tranform();
        },
        onChange(url, name, id) {
            if (id) {
                const index = this.novelList.findIndex((item) => {
                    return item.id.toString() === id.toString();
                });
                if (index > -1) {
                    this.novelList[index] = {
                        ...this.novelList[index],
                        url,
                        name,
                    };
                } else {
                    this.novelList.push({
                        ...this.novelList[index],
                        id: new Date().getTime(),
                        url,
                        name,
                    });
                }
            } else {
                this.novelList.push({
                    id: new Date().getTime(),
                    url,
                    name,
                    history: { title: "无历史记录", url: null },
                    firstChapter: { title: "查找章节", url: null },
                });
            }
            localStorage.setItem("novelList", JSON.stringify(this.novelList));
            localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
        },
        onAdd() {
            this.novelList || (this.novelList = []);
            this.novelList.push({
                id: new Date().getTime(),
                url: "",
                name: "书籍名称",
                history: { title: "无历史记录", url: null },
                firstChapter: { title: "查找章节", url: null },
            });
            localStorage.setItem("novelList", JSON.stringify(this.novelList));
            localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
        },
        onDel(id) {
            const index = this.novelList.findIndex((item) => {
                return item.id === id;
            });
            if (index > -1) {
                this.novelList.splice(index, 1);
                localStorage.setItem("novelList", JSON.stringify(this.novelList));
                localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
            }
        },
        pushCache() {
            syncCache.pushCache();
        },
        pullCache() {
            syncCache.pullCache();
        },
    },
};
</script>
<style scoped>
.choose-novel {
    height: 100%;
    max-height: 100%;
    display: flex;
}
.novel-list {
    min-height: 99%;
    max-height: 99%;
    padding: 10px;
    box-sizing: border-box;
    overflow: auto;
    flex: 1 1 auto;
}
.add-btn {
    width: 100%;
    height: 50px;
    box-sizing: border-box;
    border-radius: 20px;
    background-color: white;
    color: #747474;
    border: 1px #747474 dashed;
    font-size: 20px;
    text-align: center;
    line-height: 50px;
}
.btn-contain {
    flex: 0 0 auto;
    height: 100%;
    width: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 10px;
    box-shadow: 0 1px 5px#666666;
}
.sync-btn-contain {
    height: 100%;
    width: 100%;
    max-width: 600px;
    position: fixed;
    margin: 0 auto;
    pointer-events: none;
}
.sync-btn {
    height: 50px;
    width: 50px;
    border-radius: 50px;
    position: absolute;
    left: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 5px #575757;
    pointer-events: all;
}
.push {
    bottom: 110px;
}
.pull {
    bottom: 160px;
}
.el-message-box {
    max-width: 100% !important;
}
</style>
