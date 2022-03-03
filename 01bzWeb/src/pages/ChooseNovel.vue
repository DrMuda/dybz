<!--
 * @Author: LXX
 * @Date: 2022-03-01 15:55:18
 * @LastEditTime: 2022-03-03 17:55:07
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\ChooseNovel.vue
-->
<template>
    <div style="height: 100%; max-height: 100%">
        <div class="novel-list">
            <novel-list-item v-for="(item, index) in novelList" :key="item.id + index" :item="item" :onChange="onChange" :onDel="onDel" />
            <div class="add-btn" @click="onAdd">添加</div>
        </div>
        <el-button type="primary" class="set-char-btn" @click="toSetChar">管理字符</el-button>
    </div>
</template>

<script>
import NovelListItem from "@/components/NovelListItem.vue";
import { ElButton } from "element-plus";

let novelList = [];
try {
    novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
} catch (error) {
    novelList = [];
}

export default {
    components: {
        NovelListItem,
        ElButton,
    },
    data() {
        return {
            novelList,
        };
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
        },
        onDel(id) {
            const index = this.novelList.findIndex((item) => {
                return item.id === id;
            });
            if (index > -1) {
                this.novelList.splice(index, 1);
            }
            localStorage.setItem("novelList", JSON.stringify(this.novelList));
        },
        toSetChar() {
            this.$router.push("SetChar");
        },
    },
};
</script>
<style scoped>
.novel-list {
    min-height: 99%;
    max-height: 99%;
    padding: 10px;
    box-sizing: border-box;
    overflow: auto;
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
.set-char-btn {
    position: fixed;
    margin: -200px 0 0 20px;
}
</style>
