<!--
 * @Author: LXX
 * @Date: 2022-03-11 15:10:27
 * @LastEditTime: 2022-06-09 11:39:23
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\ConfigSet.vue
-->

<template>
  <div id="setting-contain">
    <div :class="iconIsShow ? 'main btn-mode' : 'main card-mode'">
      <i
        class="el-icon-s-tools"
        @click="openCardMode"
        v-show="iconIsShow"
        style="font-size: 30px; color: #575757"
      ></i>
      <div v-show="!iconIsShow" class="close-btn-contain">
        <i class="el-icon-close" @click="closeCardMode" style="font-size: 40px; color: #575757"></i>
      </div>
      <div v-show="!iconIsShow" class="item-list">
        <div class="set-item">
          <div class="label"></div>
          <el-button type="primary" class="btn" @click="toSetChar">管理字符</el-button>
        </div>
        <div class="set-item">
          <div class="label">控制台</div>
          <el-switch v-model="openVConsole" />
        </div>
        <div class="set-item">
          <div class="label">账号密码</div>
          <div>
            <el-input
              v-model="userName"
              @change="onUserNameChange"
              placeholder="用户名"
              size="small"
            />
            <el-input
              v-model="password"
              @change="onPasswordChange"
              type="password"
              placeholder="密码"
              size="small"
            />
          </div>
        </div>
        <div class="set-item">
          <div class="label">路线选择</div>
          <div>
            <el-button
              class="btn"
              v-for="(chancel, index) in chanelList"
              :type="currChanel === chancel ? 'primary' : ''"
              :key="chancel + '_' + index"
              @click="onChanelChange(chancel)"
              >路线{{ index + 1 }}</el-button
            >
            <br />
            <el-row>
              <el-col :span="6">
                <el-button class="btn" @click="getChanelList">更新路线</el-button>
              </el-col>
              <el-col :span="18">
                <el-input
                  v-model="outOfContactUrl"
                  size="small"
                  :placeholder="`失联页地址${outOfContactUrl}`"
                />
              </el-col>
            </el-row>
            <el-input v-model="currChanel" @change="onInputChange" size="small" />
          </div>
        </div>
        <div class="set-item">
          <div class="label">启用OCR</div>
          <div>
            <el-radio-group v-model="ocr" @change="onOCRChange">
              <el-radio label="/baiduocr/general_basic">百度通用(标准)</el-radio>
              <br />
              <el-radio label="/baiduocr/general">百度带位置通用(标准)</el-radio>
              <br />
              <el-radio label="/baiduocr/accurate_basic">百度通用(精确)</el-radio>
              <br />
              <el-radio label="/baiduocr/accurate">百度带位置通用(精确)</el-radio>
              <br />
              <el-radio label="no">不启用</el-radio>
              <br />
            </el-radio-group>
            <el-input
              v-model="ocrToken"
              @change="onTokenChange"
              placeholder="access_token：启用后可用"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Icon,
  Button,
  RadioGroup,
  Radio,
  MessageBox,
  Switch as TempSwitch,
  Message,
  Input,
  Row,
  Col,
} from "element-ui";
import moment from "moment";
import md5 from "md5";
import VConsole from "vconsole";
import { getChanelList as serviceGetChanelList } from "@/service/index";
import Vue from "vue";
import htmlStrToDom from "@/utils/htmlStrToDom";

interface Data {
  iconIsShow: boolean;
  chanelList: string[];
  currChanel: string;
  ocr: string;
  ocrToken: string;
  userName: string;
  password: string;
  openVConsole: boolean;
  vConsole: VConsole | null;
  outOfContactUrl: string;
}
Vue.use(Icon);
Vue.use(Button);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(TempSwitch);
Vue.use(Input);
Vue.use(Row);
Vue.use(Col);
export default Vue.extend({
  components: {
    Icon,
    Button,
    RadioGroup,
    Radio,
    TempSwitch,
    Input,
    Row,
    Col,
  },
  data(): Data {
    const chanelList = localStorage.getItem("chanelList");
    return {
      iconIsShow: true,
      chanelList: chanelList
        ? JSON.parse(chanelList)
        : [
            "www.banzhu222.xyz",
            "www.5diyibanzhu.xyz",
            "www.diyibanzhuvip6.xyz",
            "www.diyibanzhu111.xyz",
          ],
      currChanel: localStorage.getItem("chanel") || "www.banzhu222.xyz",
      ocr: localStorage.getItem("ocr") || "no",
      ocrToken: localStorage.getItem("ocrToken") || "",
      userName: localStorage.getItem("userName") || "",
      password: "",
      openVConsole: false,
      vConsole: null,
      outOfContactUrl: localStorage.getItem("outOfContactUrl") || "",
    };
  },
  beforeDestroy() {
    this.iconIsShow = true;
  },
  watch: {
    openVConsole() {
      if (this.openVConsole) {
        this.vConsole = new VConsole();
      } else {
        this.vConsole?.destroy();
        this.vConsole = null;
      }
    },
    outOfContactUrl(val) {
      localStorage.setItem("outOfContactUrl", val);
    },
  },
  methods: {
    openCardMode() {
      this.iconIsShow = false;
    },
    closeCardMode() {
      this.iconIsShow = true;
    },
    toSetChar() {
      this.closeCardMode();
      this.$router.push("SetChar");
    },
    onChanelChange(chancel: string) {
      this.currChanel = chancel;
      localStorage.setItem("chanel", chancel);
    },
    onInputChange() {
      localStorage.setItem("chanel", this.currChanel);
    },
    onOCRChange() {
      localStorage.setItem("ocr", this.ocr);
    },
    onTokenChange() {
      localStorage.setItem("ocrToken", this.ocrToken);
      localStorage.setItem("lastUpdate", moment().format("YYYY-MM-DD HH:mm:ss"));
    },
    onUserNameChange() {
      localStorage.setItem("userName", this.userName);
    },
    onPasswordChange() {
      if (localStorage.getItem("password")) {
        MessageBox.confirm("确定更改已缓存的密码吗？", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
        })
          .then(() => {
            localStorage.setItem("password", md5(this.password));
            Message({
              message: "密码已更改",
              type: "info",
              duration: 1000,
              showClose: true,
            });
          })
          .catch(() => {
            Message({
              message: "密码未更改",
              type: "info",
              duration: 1000,
              showClose: true,
            });
          });
      } else {
        localStorage.setItem("password", md5(this.password));
      }
    },
    getChanelList() {
      serviceGetChanelList().then(async (res) => {
        if (res.status === 200) {
          try {
            let htmlStr = res.data.content;
            const doc = htmlStrToDom(htmlStr);
            const body = doc.body;
            if (!body) {
              console.error("body null");
              throw "body null";
            }
            const lineEle = body.getElementsByClassName("line")[0];

            let chanelList = [];
            if (lineEle) {
              const linkEleList = lineEle.getElementsByTagName("a");
              for (let i = 0; i < linkEleList.length; i += 1) {
                const linkEle = linkEleList[i];
                const href = linkEle.getAttribute("href");
                href && chanelList.push(href.replace("http://", ""));
              }
            } else {
              console.error("lineEle null");
              throw "lineEle null";
            }
            if (chanelList.length > 0) {
              chanelList = Array.from(new Set(chanelList));
              localStorage.setItem("chanelList", JSON.stringify(chanelList));
              this.chanelList = chanelList;
              Message({
                message: "已更新",
                type: "info",
                duration: 1000,
                showClose: true,
              });
            } else {
              Message({
                message: "无可更新",
                type: "warning",
                duration: 1000,
                showClose: true,
              });
            }
          } catch (error: any) {
            console.error(error);
            Message({
              message: error,
              type: "error",
              duration: 1000,
              showClose: true,
            });
          }
        } else {
          Message({
            message: "更新失败",
            type: "error",
            duration: 1000,
            showClose: true,
          });
        }
      });
    },
  },
});
</script>

<style lang="less" scoped>
#setting-contain {
  height: 100%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: fixed;
  pointer-events: none;
  z-index: 10;
}

.main {
  transition: all 0.2s;
  pointer-events: all;
}
.btn-mode {
  height: 40px;
  width: 40px;
  border-radius: 70px;
  position: absolute;
  bottom: 10px;
  left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #67c23a;
  box-shadow: 0 0 5px #575757;
}
.card-mode {
  height: calc(100% - 40px);
  width: calc(100% - 40px);
  border-radius: 30px;
  padding: 8px;
  box-sizing: border-box;
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 0 5px #575757;
}
.item-list {
  overflow-y: auto;
}
.close-btn-contain {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.set-item {
  padding: 8px 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  border-bottom: 1px #dadada solid;
}
.label {
  margin-right: 8px;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 0;
  width: 70px;
}

.btn {
  margin: 0 !important;
  margin-right: 8px !important;
  margin-bottom: 8px !important;
  width: 60px;
  transition: 0.1s;
  padding: 8px 0;
}
.el-message-box {
  max-width: 100% !important;
}
</style>
