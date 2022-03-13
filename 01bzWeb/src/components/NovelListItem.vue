<!--
 * @Author: LXX
 * @Date: 2022-03-02 09:44:33
 * @LastEditTime: 2022-03-03 17:46:25
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\NovelListItem.vue
-->
<template>
    <div class="novel-card">
        <div class="position-head">
            <div class="novel-info">
                <el-input v-model="name" @change="onNameOrIdChange" />
                <el-input v-model="id" @change="onNameOrIdChange" />
            </div>
            <div class="operation">
                <a class="link" @click="onDelBtnClick" style="color: red">删除书籍</a>
                <router-link :to="`/SelectChapter?id=${id}&name=${name}`" class="link">选择章节</router-link>
            </div>
        </div>
        <div class="link-list">
            <router-link :to="history.id ? '/ReadNovel?id=' + history.id : '/SelectChapter?id=' + id" class="link">上次读到：{{ history.title }}</router-link>
            <router-link :to="firstChapter.id ? '/ReadNovel?id=' + firstChapter.id : '/SelectChapter?id=' + id" class="link"
                >重头开始读：{{ firstChapter.title }}</router-link
            >
        </div>
    </div>
</template>

<script>
import { ElInput } from "element-plus";
export default {
    components: {
        ElInput,
    },
    data() {
        return {
            initId: this.item.id, // 初始id， 修改的依据
            name: this.item.name,
            id: this.item.id,
            history: this.item.history,
            firstChapter: this.item.firstChapter,
        };
    },
    props: {
        item: Object,
        onChange: Function,
        onDel: Function,
    },
    methods: {
        onDelBtnClick() {
            this.onDel(this.id);
        },
        onNameOrIdChange() {
            this.onChange(this.id, this.name, this.initId);
        },
    },
};
</script>

<style>
.novel-card {
    width: 100%;
    height: 140px;
    box-sizing: border-box;
    border-radius: 20px;
    background-color: white;
    box-shadow: rgb(122, 122, 122) 0 0 5px;
    padding: 8px;
    margin: 10px 0;
}
.link-list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 16px;
}
.link {
    color: #409eff;
    text-decoration: none;
    margin-top: 8px;
    display: inline-block;
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
}
.position-head {
    display: flex;
    justify-content: center;
}
.operation {
    flex-shrink: 0;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
}
.novel-info {
    flex: 1 1 auto;
}
.operation {
    flex: 0 0 auto;
}
</style>
