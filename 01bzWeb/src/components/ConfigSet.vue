<!--
 * @Author: LXX
 * @Date: 2022-03-11 15:10:27
 * @LastEditTime: 2022-03-23 15:25:45
 * @LastEditors: LXX
 * @Description: 
 * @FilePath: \dybz\01bzWeb\src\components\ConfigSet.vue
-->

<template>
    <div id="setting-contain">
        <div :class="iconIsShow ? 'main btn-mode' : 'main card-mode'">
            <el-icon v-show="iconIsShow" :size="50" color="#575757" @click="openCardMode"><setting /></el-icon>
            <div v-show="!iconIsShow">
                <div class="close-btn-contain">
                    <el-icon @click="closeCardMode" :size="40" color="#575757"><close /></el-icon>
                </div>
                <div class="set-item">
                    <div class="label"></div>
                    <el-button type="primary" class="btn" @click="toSetChar">管理字符</el-button>
                </div>
                <div class="set-item">
                    <div class="label">账号密码</div>
                    <div>
                        <el-input v-model="userName" @change="onUserNameChange" placeholder="用户名" />
                        <el-input v-model="password" @change="onPasswordChange" type="password" placeholder="密码" />
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
                        <el-input v-model="currChanel" @change="onInputChange" />
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
                        <el-input v-model="ocrToken" @change="onTokenChange" placeholder="access_token：启用后可用" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ElIcon, ElButton, ElRadioGroup, ElRadio, ElMessageBox } from "element-plus";
import { Setting, Close } from "@element-plus/icons-vue";
import moment from "moment";
import md5 from "md5";
import { ElMessage } from "element-plus/lib/components";

export default {
    components: {
        ElIcon,
        Setting,
        ElButton,
        Close,
        ElRadioGroup,
        ElRadio,
    },
    data() {
        return {
            iconIsShow: true,
            chanelList: ["www.banzhu222.xyz", "www.5diyibanzhu.xyz", "www.diyibanzhuvip6.xyz", "www.diyibanzhu111.xyz"],
            currChanel: localStorage.getItem("chanel") || "www.banzhu222.xyz",
            ocr: localStorage.getItem("ocr") || "no",
            ocrToken: localStorage.getItem("ocrToken") || "",
            userName: localStorage.getItem("userName"),
            password: "",
        };
    },
    beforeUnMount() {
        this.iconIsShow = true;
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
        onChanelChange(chancel) {
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
                ElMessageBox.confirm("确定更改已缓存的密码吗？")
                    .then(() => {
                        localStorage.setItem("password", md5(this.password));
                        ElMessage.info("密码已更改");
                    })
                    .catch(() => {
                        ElMessage.info("密码未更改");
                    });
            } else {
                localStorage.setItem("password", md5(this.password));
            }
        },
    },
};
</script>

<style>
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
    height: 70px;
    width: 70px;
    border-radius: 70px;
    position: absolute;
    bottom: 20px;
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
.close-btn-contain {
    display: flex;
    justify-content: flex-end;
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
}
.el-message-box {
    max-width: 100% !important;
}
</style>
