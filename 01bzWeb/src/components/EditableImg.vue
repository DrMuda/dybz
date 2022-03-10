<!--
 * @Author: LXX
 * @Date: 2022-02-28 11:28:14
 * @LastEditTime: 2022-03-10 17:15:03
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\EditableImg.vue
-->
<template>
    <span>
        <img :src="imgSrc || '#'" @click="onImgClick" />
        <el-dialog v-if="dialogIsShow" v-model="dialogIsShow" title="输入字符" width="90%" :before-close="handleClose">
            <img :src="imgSrc || '#'" @click="onImgClick" />
            <el-input
                v-model="input"
                id="input"
            />
        </el-dialog>
    </span>
</template>

<script>
import { onMounted, ref } from "vue";
export default {
    name: "EditableImg",
    data() {
        return {
            dialogIsShow: false,
            input: "",
        };
    },
    props: {
        imgSrc: String,
        id: String,
        updateCache: Function,
    },
    methods: {
        onImgClick: function () {
            this.dialogIsShow = true;
            setTimeout(() => {
                document.getElementById("input").focus();
            }, 10);
        },
        handleClose: function () {
            this.dialogIsShow = false;
            this.updateCache(this.id.replace("img:", ""), this.input);
        },
    },
};
</script>

<style scoped></style>
