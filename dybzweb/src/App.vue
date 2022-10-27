<template>
  <!-- <Home /> -->
  <div class="layout">
    <config-set />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import ConfigSet from "./components/ConfigSet.vue";
export default {
  components: { ConfigSet },
};
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
