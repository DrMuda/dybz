<!--
 * @Author: LXX
 * @Date: 2022-04-12 11:44:08
 * @LastEditTime: 2022-04-12 17:14:16
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\Test.vue
-->
<template>
    <div>
        <input type="button" value="刷新" @click="refresh" />
        <input type="button" value="pushA" @click="push('a', 123)" />
        <input type="button" value="pushB" @click="push('b', 123)" />
        <input type="button" value="pushC" @click="push('c', 123)" />
        <input type="file" id="fileUpload" @change="handleImageUpload" />
    </div>
</template>

<script>
const defaultValue = {
    a: [],
    b: [],
};
export default {
    data() {
        return {
            ...JSON.parse(JSON.stringify(defaultValue)),
            c: [],
        };
    },
    methods: {
        refresh() {
            Object.assign(this.$data, {
                ...this.$data,
                ...JSON.parse(JSON.stringify(defaultValue)),
            });
            console.log(this.$data);
        },
        push(key, value) {
            this[key].push(value);
            console.log(this.$data);
        },
        handleImageUpload() {
            const files = document.getElementById("fileUpload").files;
            console.log(files[0])

            // fetch("/saveImage", {
            //     method: "POST",
            //     body: formData,
            // })
            //     .then((response) => response.json())
            //     .then((data) => {
            //         console.log(data.path);
            //     })
            //     .catch((error) => {
            //         console.error(error);
            //     });
        },

        // async fc() {
        //     await this.fc2();
        //     console.log("第一次结束fc2");
        //     this.fc2();
        //     console.log("第二次结束fc2");
        // },
        // fc2() {
        //     console.log("fc2开始");
        //     for (let i = 0; i < Number.MAX_VALUE; i++) {}
        //     return;
        // },
    },
};
</script>

<style></style>
