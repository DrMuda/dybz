<!--
 * @Author: LXX
 * @Date: 2022-04-12 11:44:08
 * @LastEditTime: 2022-04-12 15:22:52
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
    },
};
</script>

<style></style>
