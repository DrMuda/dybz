<template>
    <div class="con">
        <div class="left"></div>
        <div class="right">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
        </div>
    </div>
</template>

<script>
export default {
};
</script>

<style>
.con {
    width: 90%;
    height: 100%;
    display: flex;
}
.left {
    width: 200px;
    height: 200px;
    flex: 0 0 auto;
    background-color: antiquewhite;
}
.right {
    height: 200px;
    flex: 1 1 auto;
    display: flex;
    overflow: auto;
}
.item {
    flex: 0 0 auto;
    width: 200px;
    height: 100%;
    background-color: brown;
    margin: 0 8px;
}
</style>
