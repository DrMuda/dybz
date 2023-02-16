<template>
  <div class="choose-novel">
    <div class="novel-list">
      <div class="search-bar">
        <el-input v-model="searchValue" placeholder="搜索词" />
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>
      <template v-for="item in sortedNovelList">
        <novel-list-item
          v-if="item.id"
          :key="item.key"
          :item="item"
          :onChange="onChange"
          :onDel="onDel"
        />
      </template>
      <div class="add-btn" @click="onAdd">添加</div>
    </div>
    <div class="sync-btn-contain">
      <i
        class="el-icon-upload2 sync-btn pull"
        @click="pushCache"
        style="font-size: 25px"
      ></i>
      <i
        class="el-icon-download sync-btn push"
        @click="pullCache"
        style="font-size: 25px"
      ></i>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import NovelListItem from "@/components/NovelListItem.vue";
import syncCache from "@/utils/syncCache";
import { Novel } from "@/utils/type";
import moment from "moment";

interface Data {
  novelList: Array<any>;
  updateTag: boolean;
  searchValue: string;
}
export default Vue.extend({
  components: {
    NovelListItem,
  },
  data(): Data {
    return {
      novelList: [],
      updateTag: true,
      searchValue: "",
    };
  },
  computed: {
    sortedNovelList(): Array<any> {
      if (this.novelList instanceof Array) {
        return this.novelList.sort((a, b) => {
          if (!a.lastTime) {
            return 1;
          }
          if (!b.lastTime) {
            return -1;
          }
          return (
            new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
          );
        });
      }
      return [];
    },
  },
  mounted() {
    try {
      this.novelList =
        JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
      this.novelList = this.novelList.map((item) => {
        return { ...item, key: Math.random() };
      });
    } catch (error) {
      this.novelList = [];
    }
    if (
      !sessionStorage.getItem("isFirst") ||
      sessionStorage.getItem("isFirst") === "true"
    ) {
      this.pullCache();
      sessionStorage.setItem("isFirst", "false");
    }
  },
  methods: {
    onChange(url: string, name: string, id: string) {
      if (id) {
        const index = this.novelList.findIndex((item) => {
          return item.id.toString() === id.toString();
        });
        if (index > -1) {
          this.novelList[index] = {
            ...this.novelList[index],
            url,
            name,
          };
        } else {
          this.novelList.push({
            ...this.novelList[index],
            id: new Date().getTime(),
            url,
            name,
          });
        }
        localStorage.setItem("novelList", JSON.stringify(this.novelList));
        localStorage.setItem(
          "lastUpdate",
          moment().format("YYYY-MM-DD HH:mm:ss")
        );
      }
    },
    onAdd() {
      this.novelList || (this.novelList = []);
      this.novelList.push({
        id: new Date().getTime(),
        url: "",
        name: "书籍名称",
        history: { title: "无历史记录", url: null },
        firstChapter: { title: "查找章节", url: null },
        chanel: localStorage.getItem("chanel") || "www.banzhu222.xyz",
      });
      localStorage.setItem("novelList", JSON.stringify(this.novelList));
      localStorage.setItem(
        "lastUpdate",
        moment().format("YYYY-MM-DD HH:mm:ss")
      );
    },
    onDel(id: string) {
      const index = this.novelList.findIndex((item) => {
        return item.id === id;
      });
      if (index > -1) {
        this.novelList.splice(index, 1);
        localStorage.setItem("novelList", JSON.stringify(this.novelList));
        localStorage.setItem(
          "lastUpdate",
          moment().format("YYYY-MM-DD HH:mm:ss")
        );
      }
    },
    pushCache() {
      syncCache.pushCache();
    },
    pullCache() {
      syncCache.pullCache().then(() => {
        try {
          this.novelList = (
            JSON.parse(localStorage.getItem("novelList") || "[]") as Novel[]
          ).map((item) => {
            return { ...item, key: Math.random() };
          });
        } catch (error) {
          console.error(error);
          this.novelList = [];
        }
      });
    },
    onSearch() {
      this.$router.push({
        path: "/search",
        query: { searchValue: this.searchValue },
      });
    },
  },
});
</script>
<style scoped lang="less">
.choose-novel {
  height: 100%;
  max-height: 100%;
  display: flex;
}
.novel-list {
  min-height: 99%;
  max-height: 99%;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
  flex: 1 1 auto;
}
.add-btn {
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  border-radius: 20px;
  background-color: white;
  color: #747474;
  border: 1px #747474 dashed;
  font-size: 20px;
  text-align: center;
  line-height: 50px;
}
.btn-contain {
  flex: 0 0 auto;
  height: 100%;
  width: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px;
  box-shadow: 0 1px 5px#666666;
}
.sync-btn-contain {
  height: 100%;
  width: 100%;
  max-width: 600px;
  position: fixed;
  margin: 0 auto;
  pointer-events: none;
}
.sync-btn {
  height: 30px;
  width: 30px;
  border-radius: 30px;
  position: absolute;
  left: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 5px #575757;
  pointer-events: all;
}
.push {
  bottom: 60px;
}
.pull {
  bottom: 90px;
}
.el-message-box {
  max-width: 100% !important;
}
.search-bar {
  display: flex;
  gap: 4px;
  > * {
    height: 100%;
  }
}
</style>
