<!--
 * @Author: LXX
 * @Date: 2022-03-01 15:55:18
 * @LastEditTime: 2022-03-03 17:55:07
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\ChooseNovel.vue
-->
<template>
    <div class="choose-novel">
        <div class="btn-contain">
            <el-button type="primary" class="btn" @click="toSetChar"
                >管理字符</el-button
            >
            <el-button
                class="btn"
                v-for="(chancel, index) in chanelList"
                :type="currChanel === chancel ? 'primary' : ''"
                :key="chancel + '_' + index"
                @click="onChanelChange(chancel)"
                >路线{{ index + 1 }}</el-button
            >
            <el-input
                class="btn input-chanel"
                v-model="currChanel"
                @change="onInputChange"
            />
        </div>
        <div class="novel-list">
            <novel-list-item
                v-for="(item, index) in novelList"
                :key="item.id + index"
                :item="item"
                :onChange="onChange"
                :onDel="onDel"
            />
            <div class="add-btn" @click="onAdd">添加</div>
        </div>
    </div>
</template>

<script>
import NovelListItem from "@/components/NovelListItem.vue";
import { ElButton, ElInput } from "element-plus";

let novelList = [];
try {
    novelList =
        JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
} catch (error) {
    novelList = [];
}

export default {
    components: {
        NovelListItem,
        ElButton,
        ElInput,
    },
    data() {
        return {
            novelList,
            chanelList: [
                "www.banzhu222.xyz",
                "www.5diyibanzhu.xyz",
                "www.diyibanzhuvip6.xyz",
                "www.diyibanzhu111.xyz",
            ],
            currChanel: localStorage.getItem("chanel") || "www.banzhu222.xyz",
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
        onChanelChange(chancel) {
            this.currChanel = chancel;
            localStorage.setItem("chanel", chancel);
        },
        onInputChange() {
            console.log(this.currChanel);
            localStorage.setItem("chanel", this.currChanel);
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
.btn {
    margin: 0 !important;
    width: 60px;
    transition: 0.1s;
}
.input-chanel:focus-within {
    width: 200px !important;
}
</style>
