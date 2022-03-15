<!--
 * @Author: LXX
 * @Date: 2022-03-03 16:04:20
 * @LastEditTime: 2022-03-15 15:35:00
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\SetChar.vue
-->
<template>
    <div class="set-char">
        <div class="filter-bar">
            <div class="input-contain">
                <span style="flex: 0 0 auto">筛选：</span>
                <el-input v-model="filterInput" @change="onFilterInputChange" />
            </div>
            <div class="btn-contain">
                <el-button @click="filter('wasSet')">已设值</el-button>
                <el-button @click="filter('notSet')">未设值</el-button>
                <el-button @click="filter('all')">所有值</el-button>
            </div>
        </div>
        <div class="list">
            <div v-for="id in Object.keys(imgCache)" :key="id" class="item">
                <img :src="imgCache[id]" /><el-input
                    v-model="imgMapCache[id]"
                    @change="
                        (val) => {
                            this.onChange(val, id);
                        }
                    "
                />
            </div>
        </div>
    </div>
</template>

<script>
import { ElInput, ElMessage } from "element-plus";
import ImgBase64 from "@/utils/ImgBase64";
import ImgMapChar from "@/utils/ImgMapChar";
import cacheImg from "@/utils/cacheImg";

export default {
    components: {
        ElInput,
    },
    data() {
        return {
            imgMapCache: ImgMapChar.get(), // 图片与文字的映射
            originImgCache: ImgBase64.get(), // 图片与base64的映射
            imgCache: ImgBase64.get(),
            filterInput: "",
        };
    },
    mounted() {
        Object.keys(this.imgMapCache).forEach((key) => {
            if (this.originImgCache[key] === undefined) {
                this.originImgCache[key] = null;
            }
        });
        ImgBase64.set(this.originImgCache);
        ElMessage.info("正在下载图片...");
        setTimeout(async () => {
            await cacheImg(true);
            this.imgMapCache = ImgMapChar.get(); // 图片与文字的映射
            this.originImgCache = ImgBase64.get(); // 图片与base64的映射
            this.imgCache = ImgBase64.get();
            ElMessage.info("下载完成");
        }, 10);
    },
    methods: {
        onChange(value, id) {
            if (value.length > 1) {
                this.imgMapCache[id] = value[0];
            }
            ImgMapChar.set(this.imgMapCache);
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

<style scoped>
.set-char {
    height: 99%;
    max-height: 99%;
    display: flex;
    flex-direction: column;
}
.filter-bar {
    flex-grow: 0;
    flex-shrink: 0;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.input-contain {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
}
.btn-contain {
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    margin: 8px 0;
}
.list {
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
    padding-top: 0;
}
.item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;
}
</style>
