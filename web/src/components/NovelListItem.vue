<!--
 * @Author: LXX
 * @Date: 2022-03-02 09:44:33
 * @LastEditTime: 2022-04-18 17:42:08
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\NovelListItem.vue
-->
<template>
  <div class="novel-card">
    <div class="position-head">
      <div class="novel-info">
        <el-input v-model="name" @change="onNameOrUrlChange" size="small" />
        <el-input v-model="url" @change="onNameOrUrlChange" size="small" />
      </div>
      <div class="operation">
        <el-popconfirm title="确定？" @cancel="null" @confirm="onDelBtnClick">
          <template #reference>
            <a class="link" style="color: red">删除书籍</a>
          </template>
        </el-popconfirm>
        <router-link
          :to="`/SelectChapter?id=${id}&url=${url}&name=${name}`"
          class="link"
          >选择章节</router-link
        >
      </div>
    </div>
    <div class="link-list">
      <router-link :to="toHistory()" class="link" @click="setChanel"
        >上次读到：{{ history.title }}</router-link
      >
      <router-link :to="toFirst()" class="link" @click="setChanel"
        >重头开始读：{{ firstChapter.title }}</router-link
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Popconfirm } from "element-ui";
import Vue from "vue";

Vue.use(Input);
Vue.use(Popconfirm);
export default Vue.extend({
  components: {
    Input,
    Popconfirm,
  },
  data() {
    return {
      id: this.item?.id || "",
      name: this.item?.name || "",
      url: this.item?.url || "",
      history: this.item?.history || "",
      firstChapter: this.item?.firstChapter || "",
    };
  },
  props: {
    item: Object,
    onChange: Function,
    onDel: Function,
  },
  mounted() {
    if (!this.item?.chanel) {
      this.item && (this.item.chanel = localStorage.getItem("chanel"));
    }
  },
  methods: {
    onDelBtnClick() {
      this.onDel?.(this.id);
    },
    onNameOrUrlChange() {
      this.onChange?.(this.url, this.name, this.id);
    },
    toHistory() {
      if (this.history.url) {
        return {
          path: "/ReadNovel",
          name: "ReadNovel",
          query: { url: this.history.url, id: this.id },
        };
      }
      return {
        path: "/SelectChapter",
        query: { id: this.id },
      };
    },
    toFirst() {
      if (this.firstChapter.url) {
        return {
          path: "/ReadNovel",
          name: "ReadNovel",
          query: { url: this.firstChapter.url, id: this.id },
        };
      }
      return {
        path: "/SelectChapter",
        query: { id: this.id },
      };
    },
    setChanel() {
      this.$store.commit("setCurrNovelChanel", this.item?.chanel);
    },
  },
});
</script>

<style lang="less" scoped>
.novel-card {
  width: 100%;
  height: 140px;
  box-sizing: border-box;
  border-radius: 20px;
  background-color: white;
  box-shadow: rgb(122, 122, 122) 0 0 5px;
  padding: 8px;
  margin: 10px 0;
}
.link-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 16px;
}
.link {
  color: #409eff;
  text-decoration: none;
  margin-top: 8px;
  display: inline-block;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
}
.position-head {
  display: flex;
  justify-content: center;
}
.operation {
  flex-shrink: 0;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}
.novel-info {
  flex: 1 1 auto;
}
.operation {
  flex: 0 0 auto;
}
</style>
