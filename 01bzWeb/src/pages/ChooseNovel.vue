<!--
 * @Author: LXX
 * @Date: 2022-03-01 15:55:18
 * @LastEditTime: 2022-03-02 14:58:01
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\ChooseNovel.vue
-->
<template>
    <div class="novel-list">
        <novel-list-item v-for="(item, index) in novelList" :key="item.id + index" :item="item" :onChange="onChange" :onDel="onDel" />
        <div class="add-btn" @click="onAdd">添加</div>
    </div>
</template>

<script>
import NovelListItem from "@/components/NovelListItem.vue";

let novelList = [];
try {
    novelList = JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
} catch (error) {
    novelList = [];
}

export default {
    components: {
        NovelListItem,
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
    },
};
</script>
<style scoped>
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
.novel-list {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
}
</style>
