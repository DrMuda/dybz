<template>
  <!-- <Home /> -->
  <div class="layout">
    <config-set />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ConfigSet from "./components/ConfigSet.vue";
export default Vue.extend({
  components: { ConfigSet },
});
</script>

<style lang="less">
.layout {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
}
</style>
