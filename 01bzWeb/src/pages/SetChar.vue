<!--
 * @Author: LXX
 * @Date: 2022-03-03 16:04:20
 * @LastEditTime: 2022-03-11 10:33:34
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\SetChar.vue
-->
<template>
    <div class="set-char">
        <div class="filter-bar">
            <span style="flex: 0 0 auto">筛选：</span>
            <el-input v-model="filterInput" @change="onFilterInputChange" />
            <el-button @click="filter('wasSet')">已设值</el-button>
            <el-button @click="filter('notSet')">未设值</el-button>
            <el-button @click="filter('all')">所有值</el-button>
        </div>
        <div class="list">
            <div v-for="id in Object.keys(imgCache)" :key="id" class="item">
                <img :src="imgCache[id]" /><el-input v-model="imgMapCache[id]" @change="onChange" />
            </div>
        </div>
    </div>
</template>

<script>
import { ElInput, ElButton } from "element-plus";
import ImgBase64 from "@/utils/ImgBase64";
import ImgMapChar from "@/utils/ImgMapChar";

const imgMapCache = ImgMapChar.get(); // 图片与文字的映射
const originImgCache = ImgBase64.get(); // 图片与base64的映射
export default {
    components: {
        ElInput,
    },
    data() {
        return {
            imgMapCache,
            originImgCache,
            imgCache: originImgCache,
            filterInput: "",
        };
    },
    methods: {
        onChange() {
            ImgMapChar.set(this.imgMapCache)
        },
        onFilterInputChange() {
            if (this.filterInput) {
                const nextImgCache = {};
                Object.keys(this.originImgCache).forEach((key) => {
                    if (this.imgMapCache[key]?.indexOf(this.filterInput) > -1) {
                        nextImgCache[key] = this.originImgCache[key];
                    }
                });
                this.imgCache = nextImgCache;
            }
        },
        filter(tag) {
            let nextImgCache = {};
            this.filterInput = "";
            switch (tag) {
                case "wasSet": {
                    Object.keys(this.originImgCache).forEach((key) => {
                        if (this.imgMapCache[key]) {
                            nextImgCache[key] = this.originImgCache[key];
                        }
                    });
                    break;
                }
                case "notSet": {
                    Object.keys(this.originImgCache).forEach((key) => {
                        if (!this.imgMapCache[key]) {
                            nextImgCache[key] = this.originImgCache[key];
                        }
                    });
                    break;
                }
                default: {
                    nextImgCache = this.originImgCache;
                    break;
                }
            }
            this.imgCache = nextImgCache;
        },
    },
};
</script>

<style>
.set-char {
    height: 99%;
    max-height: 99%;
    display: flex;
    flex-direction: column;
}
.filter-bar {
    height: 30px;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 8px;
    display: flex;
    align-items: center;
}
.list {
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
}
.item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;
}
</style>
