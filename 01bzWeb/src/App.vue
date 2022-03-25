<template>
    <!-- <Home /> -->
    <div class="layout">
        <config-set />
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ConfigSet from "./components/ConfigSet.vue";

@Options({
    components: { ConfigSet },
})
export default class App extends Vue {}
</script>

<style>
.layout {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    border: 0;
}
</style>
