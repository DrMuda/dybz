<!--
 * @Author: LXX
 * @Date: 2022-02-28 11:28:14
 * @LastEditTime: 2022-02-28 16:54:59
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\EditableImg.vue
-->
<template>
    <span>
        <img :src="this.props.src" v-on="onImgClick(this)" />
        <input v-if="this.data.inputIsShow" />
    </span>
</template>

<script>
// eslint-disable-next-line
export default {
    name: "EditableImg",
    data() {
        return {
            inputIsShow: false,
        };
    },
    props: {
        src: String,
        id: String,
    },
    methods: {
        onImgClick: function (item) {
            this.data.inputIsShow = true;
            console.log(item);
        },
    },
};
</script>

<style></style>
