<!--
 * @Author: LXX
 * @Date: 2022-03-03 16:04:20
 * @LastEditTime: 2022-03-23 16:36:55
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\pages\SetChar.vue
-->
<template>
  <div class="set-char">
    <div class="filter-bar">
      <div class="input-contain">
        <span style="flex: 0 0 auto">筛选：</span>
        <el-input
          v-model="filterInput"
          @change="onFilterInputChange"
          size="small"
        />
      </div>
      <div class="btn-contain">
        <el-button @click="filter('wasSet')">已设值</el-button>
        <el-button @click="filter('notSet')">未设值</el-button>
        <el-button @click="filter('all')">所有值</el-button>
        <el-button @click="filter('notNormal')">异常值</el-button>
      </div>
    </div>
    <div class="list">
      <div
        v-for="id in Object.keys(imgAndChar)"
        :key="id"
        :class="'item ' + id"
      >
        <img :src="imgAndChar[id].img || '#'" />
        <el-input
          v-model="imgAndChar[id].char"
          @change="
            (val) => {
              onChange(id, val);
            }
          "
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Message, Button } from "element-ui";
import ImgAndChar from "@/utils/ImgAndChar";
import cacheImg from "@/utils/cacheImg";
import baiduOcr from "@/utils/baiduOcr";
import { ImgAndCharValue } from "@/utils/type";
import Vue from "vue";

Vue.use(Button);
Vue.use(Input);
export default Vue.extend({
  components: {
    Input,
    Button,
  },
  data() {
    return {
      imgAndChar: ImgAndChar.get(),
      originImgAndChar: ImgAndChar.get(),
      filterInput: "",
    };
  },
  mounted() {
    let canCache = false;
    Object.keys(this.imgAndChar).forEach((key) => {
      if (!this.imgAndChar[key].img) {
        canCache = true;
      }
    });
    (async () => {
      if (canCache) {
        let m = Message({
          message: "正在下载图片...",
          type: "info",
          duration: 1000,
          showClose: true,
        });
        await cacheImg(() => {});
        m.close();

        Message({
          message: "下载完成",
          type: "info",
          duration: 1000,
          showClose: true,
        });
        this.$forceUpdate();
      }
      setTimeout(async () => {
        this.imgAndChar = ImgAndChar.get();
        this.originImgAndChar = ImgAndChar.get();
        await baiduOcr();
        this.$forceUpdate();
      }, 10);
    })();
  },
  methods: {
    onChange(id: string, char: string) {
      this.imgAndChar[id].char = char?.[0] || "";
      this.originImgAndChar[id].char = char?.[0] || "";
      ImgAndChar.setCharByKey(id, char?.[0] || "");
    },
    onFilterInputChange() {
      if (this.filterInput) {
        const nextImgAndChar: ImgAndCharValue = {};
        Object.keys(this.originImgAndChar).forEach((id) => {
          const item = this.originImgAndChar[id];
          if (item.char && item.char.indexOf(this.filterInput) > -1) {
            nextImgAndChar[id] = item;
          }
        });
        this.imgAndChar = nextImgAndChar;
      } else {
        this.filter("all");
      }
    },
    filter(tag: "wasSet" | "notSet" | "notNormal" | "all") {
      let nextImgAndChar: ImgAndCharValue = {};
      this.filterInput = "";
      switch (tag) {
        case "wasSet": {
          Object.keys(this.originImgAndChar).forEach((id) => {
            const item = this.originImgAndChar[id];
            if (item.char) {
              nextImgAndChar[id] = item;
            }
          });
          break;
        }
        case "notSet": {
          Object.keys(this.originImgAndChar).forEach((id) => {
            const item = this.originImgAndChar[id];
            if (!item.char) {
              nextImgAndChar[id] = item;
            }
          });
          break;
        }
        case "notNormal": {
          Object.keys(this.originImgAndChar).forEach((id) => {
            const item = this.originImgAndChar[id];
            const char = item.char;
            if (char && typeof char === "string") {
              if (char.search(/[0-9]|[a-z]|[A-Z]/g) > -1 || char.length > 1) {
                nextImgAndChar[id] = item;
              }
            }
          });
          break;
        }
        default: {
          nextImgAndChar = this.originImgAndChar;
          break;
        }
      }
      this.imgAndChar = nextImgAndChar;
    },
  },
});
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
