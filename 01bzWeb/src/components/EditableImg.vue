<!--
 * @Author: LXX
 * @Date: 2022-02-28 11:28:14
 * @LastEditTime: 2022-03-02 14:57:45
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\EditableImg.vue
-->
<template>
    <span>
        <img :src="this.imgSrc || '#'" @click="this.onImgClick" />
        <el-dialog v-model="dialogIsShow" title="输入字符" width="90%" :before-close="handleClose">
            <img :src="this.imgSrc || '#'" @click="this.onImgClick" />:<el-input v-model="input" />
        </el-dialog>
    </span>
</template>

<script>
// eslint-disable-next-line
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
        },
        handleClose: function () {
            this.dialogIsShow = false;
            this.updateCache(this.id.replace("img:", ""), this.input);
        },
    },
};
</script>

<style scoped>
input {
    width: 30px;
}
</style>
