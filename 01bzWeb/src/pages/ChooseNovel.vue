<!--
 * @Author: LXX
 * @Date: 2022-03-01 15:55:18
 * @LastEditTime: 2022-03-14 18:01:29
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\ChooseNovel.vue
-->
<template>
    <div class="choose-novel">
        <config-set />
        <div class="novel-list">
            <novel-list-item v-for="(item, index) in novelList" :key="item.id + index" :item="item" :onChange="onChange" :onDel="onDel" />
            <div class="add-btn" @click="onAdd">添加</div>
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
        };
    },
    mounted() {
        try {
            this.novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
        } catch (error) {
            this.novelList = [];
        }
        if (!sessionStorage.getItem("isFirst") || sessionStorage.getItem("isFirst") === "true") {
            this.pullCache();
            sessionStorage.setItem("isFirst", "false");
        }
    },
    methods: {
        onChange(id, name, initId) {
            if (initId) {
                const index = this.novelList.findIndex((item) => {
                    return item.id === initId;
                });
                if (index > -1) {
                    this.novelList[index] = {
                        ...this.novelList[index],
                        id,
                        name,
                    };
                } else {
                    this.novelList.push({
                        ...this.novelList[index],
                        id,
                        name,
                    });
                }
            } else {
                this.novelList.push({
                    id,
                    name,
                    history: { title: "无历史记录", id: null },
                    firstChapter: { title: "查找章节", id: null },
                });
            }
            localStorage.setItem("novelList", JSON.stringify(this.novelList));
            localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
        },
        onAdd() {
            this.novelList || (this.novelList = []);
            this.novelList.push({
                id: `书籍id${new Date().getTime()}`,
                name: "书籍名称",
                history: { title: "无历史记录", id: null },
                firstChapter: { title: "查找章节", id: null },
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
            }
            localStorage.setItem("novelList", JSON.stringify(this.novelList));
            localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
        },
        pushCache() {
            ElMessage({
                type: "info",
                message: "上传数据中...",
            });
            let imgMapChar = null;
            let novelList = null;
            let ocrToken = null;
            try {
                imgMapChar = ImgMapChar.get();
            } catch (e) {
                imgMapChar = {};
            }
            try {
                novelList = JSON.parse(localStorage.getItem("novelList") || {});
            } catch (e) {
                novelList = {};
            }
            try {
                ocrToken = localStorage.getItem("ocrToken") || "";
            } catch (e) {
                ocrToken = "";
            }
            services
                .pushCache({
                    data: {
                        imgMapChar,
                        user: {
                            novelList,
                            ocrToken,
                        },
                    },
                })
                .then((res) => {
                    ElMessage.closeAll();
                    if (res.data === "success") {
                        ElMessage({
                            type: "success",
                            message: "上传成功",
                        });
                    } else {
                        ElMessage({
                            type: "error",
                            message: "上传失败",
                        });
                    }
                });
        },
        pullCache() {
            services.pullCache().then(async (res) => {
                if (res.status === 200) {
                    const localLastUpdate = moment(localStorage.getItem("lastUpdate"));
                    const cloudLastUpdate = moment(res.data.user.lastUpdate);
                    let canUpdate = false;
                    await new Promise((resolve) => {
                        if (moment().isValid(localLastUpdate) && moment().isValid(cloudLastUpdate)) {
                            if (localLastUpdate > cloudLastUpdate) {
                                ElMessageBox.alert(
                                    `<p>本地记录较新，确定更新?</p>
                                    <p>本地：${localStorage.getItem("lastUpdate")}</p>
                                    <p>云端：${res.data.user.lastUpdate}</p>`,
                                    "更新提示",
                                    {
                                        confirmButtonText: "确定",
                                        type: "warning",
                                        dangerouslyUseHTMLString: true,
                                    }
                                )
                                    .then(() => {
                                        canUpdate = true;
                                        resolve();
                                    })
                                    .catch(() => {
                                        ElMessage({
                                            type: "info",
                                            message: "推荐将本地记录上传",
                                        });
                                        resolve();
                                    });
                            } else {
                                canUpdate = true;
                                resolve();
                            }
                        } else {
                            canUpdate = true;
                            resolve();
                        }
                    });

                    if (canUpdate) {
                        ImgMapChar.set({ ...ImgMapChar.get(), ...res.data.imgMapChar });
                        localStorage.setItem("novelList", JSON.stringify(res.data.user.novelList));
                        localStorage.setItem("ocrToken", res.data.user.ocrToken);
                        localStorage.setItem("lastUpdate", res.data.user.lastUpdate);
                        this.novelList = res.data.user.novelList;
                        location.reload(false);
                        ElMessage({
                            type: "info",
                            message: "已更新本地记录",
                        });
                    }
                }
            });
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
</style>
