<template>
  <div class="search">
    <div class="search-bar">
      <el-input v-model="searchValue" placeholder="搜索词" />
      <el-button type="primary" @click="onSearch">搜索</el-button>
    </div>
    <div class="content" v-loading="loading">
      <template v-if="novelList.length < 1"><el-empty /></template>
      <template v-else>
        <div class="row" v-for="item of novelList">
          <a @click="toSelectChapter(item)" class="name">{{ item.name }}</a>
          <a @click="toReadNovel(item)" class="new-chapter-name">{{
            item.newChapterName
          }}</a>
          <span>{{ item.author }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Button, Empty, Message, Loading } from "element-ui";
import Vue from "vue";
import * as services from "@/service";
import strToDom from "@/utils/strToDom";
import { Novel as CacheNovel } from "@/utils/type";
import moment from "moment";
Vue.use(Input);
Vue.use(Button);
Vue.use(Empty);
Vue.use(Loading.directive);

interface Novel {
  name: string;
  url: string;
  newChapterName: string;
  newChapterUrl: string;
  author: string;
  id: string;
}
interface Data {
  searchValue: string;
  isEmpty: boolean;
  novelList: Array<Novel>;
  loading: boolean;
}
export default Vue.extend({
  components: { Input, Button, Empty },
  data(): Data {
    return {
      searchValue: (this.$route.query.searchValue as string) || "",
      isEmpty: true,
      novelList: [],
      loading: false,
    };
  },
  mounted() {
    if (this.searchValue) {
      this.onSearch();
    }
  },
  methods: {
    onSearch() {
      this.loading = true;
      services
        .search(localStorage.getItem("chanel") || "", this.searchValue)
        .then(
          (res) => {
            if (res.data.status === "success") {
              const novelList: Novel[] = [];
              let content = res.data.content;

              // 清除空格，防止扰乱正则匹配
              content = content.replace(/\n/g, "");
              content = content.replace(/\r/g, "");
              // 防止转成dom时加载资源
              content = content.replace(/src=/g, "my-src=");

              // 转成dom元素，方便分析
              const tempEle = document.createElement("div");
              let bodyStr = new RegExp("<body.*/body>").exec(content)?.[0];
              bodyStr = bodyStr?.replace("body", "div");
              const body = strToDom(bodyStr)[0];
              if (body) {
                tempEle?.appendChild(body);
              }
              if (content.includes("server error")) {
                Message.error(
                  (tempEle.querySelector(".neirong") as HTMLDivElement)
                    .innerText
                );
              }
              const eleList =
                tempEle
                  .querySelector(".mod.block.book-all-list")
                  ?.querySelector("ul")?.childNodes || [];

              for (let i = 0; i < eleList.length; i++) {
                const row = eleList[i] as HTMLLIElement | Text;
                if (!(row instanceof HTMLLIElement)) {
                  continue;
                }
                const nameEle = row.querySelector(".name") as HTMLAnchorElement;
                const newChapterNameEle = row.querySelector(
                  ".update"
                ) as HTMLParagraphElement;
                const newChapterUrlEle = newChapterNameEle.querySelector(
                  "a"
                ) as HTMLAnchorElement;
                const authorEle = row.querySelector(
                  ".info"
                ) as HTMLParagraphElement;
                const url = Array.from(nameEle.getAttribute("href") || "/");
                url.splice(-1, 1);
                novelList.push({
                  author: authorEle.innerText,
                  id: `${new Date().getTime() + i}`,
                  name: nameEle.innerText,
                  url: url.join("") || "",
                  newChapterName: newChapterNameEle.innerText,
                  newChapterUrl:
                    newChapterUrlEle
                      .getAttribute("href")
                      ?.replace(".html", "") || "",
                });
              }
              this.novelList = novelList;
            } else {
              Message.error({ message: "request fail" });
              console.error("request fail");
            }
            this.loading = false;
          },
          (reason) => {
            Message.error({ message: reason });
            console.error(reason);
          }
        );
    },
    toSelectChapter(row: Novel) {
      this.addNovelToCache(row);
      this.$router.push({
        path: "/SelectChapter",
        query: { id: row.id },
      });
    },
    toReadNovel(row: Novel) {
      this.addNovelToCache(row);
      this.$router.push({
        path: "/ReadNovel",
        query: { url: row.newChapterUrl, id: row.id },
      });
    },
    addNovelToCache(row: Novel) {
      const cacheNovelList: CacheNovel[] =
        JSON.parse(`{"data":${localStorage.getItem("novelList")}}`).data || [];
      const index = cacheNovelList.findIndex((novel) => novel.id === row.id);
      if (index < 0) {
        cacheNovelList.push({
          chanel: localStorage.getItem("chanel") || "",
          firstChapter: { title: "", url: "" },
          history: { title: "", url: "" },
          id: row.id,
          name: row.name,
          url: row.url,
          key: `${Math.random()}`,
        });
        localStorage.setItem("novelList", JSON.stringify(cacheNovelList));
        localStorage.setItem(
          "lastUpdate",
          moment().format("YYYY-MM-DD HH:mm:ss")
        );
      }
    },
  },
  watch: {
    searchValue() {
      this.$router.replace({
        path: "/search",
        query: { searchValue: this.searchValue },
      });
    },
  },
});
</script>

<style lang="less">
.search {
  padding: 8px;
  .search-bar {
    display: flex;
    gap: 4px;
    > * {
      height: 100%;
    }
  }
  .content {
    width: 100%;
    .row {
      margin: 4px 0;
      border-radius: 8px;
      box-shadow: 0 0 5px #808080;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      box-sizing: border-box;
      .name,
      .new-chapter-name {
        color: #1890ff;
      }
      > span {
        color: #808080;
        font-size: 12px;
      }
    }
  }
}
</style>
