/*
 * Copyright 2014-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
<template>
    <div class="chainCode-code" :class="{changeActive:changeWidth }" v-loading="loading">
        <div class="chainCode-code-head">
            <span class="chainCode-code-title" v-show="codeShow" :class="{titleActive:changeWidth }">
                <span>{{chainCodeName + '.go'}}</span>
            </span>
            <span class="chainCode-code-handle" v-show="codeShow">
                <span class="chainCode-code-done" v-if="status < 2" @click='saveCode'>
                    <!-- <el-tooltip class="item" effect="dark" content="按Ctrl+s保存合约内容" placement="top-start"> -->
                        <i class="wbs-icon-baocun font-16"></i>
                    <!-- </el-tooltip> -->
                    <span>保存</span>
                </span>
                <!-- <span class="chainCode-code-done" @click="compile" v-if="!chainCodeAddress && !disabled">
                    <i class="wbs-icon-bianyi font-16"></i>
                    <span>编译</span>
                </span> -->
                <span class="chainCode-code-done" @click="deploying" v-if='status == 1'>
                    <i class="wbs-icon-deploy font-16" ></i>
                    <span>部署</span>
                </span>
                <span class="chainCode-code-done" v-if="status == 2" @click="send">
                    <i class="wbs-icon-send font-16"></i>
                    <span>发交易</span>
                </span>
            </span>
        </div>
        <div class="chainCode-code-content" :class="{infoHide: !successHide}">
            <div class="chainCode-code-mirror" :style="{height:codeHight}" ref="codeContent">
                <!-- <div style="padding-top: 60px;text-align:center;" v-show="!codeShow">
                    <span>请在左侧面板点击打开一个合约或新建一个合约</span>
                </div> -->
                <div class="ace-editor" ref="ace" v-show="codeShow"></div>
            </div>
            <div class="chainCode-info" v-show="successHide" :style="{height:infoHeight + 'px'}">
                <div class="move" @mousedown="dragDetailWeight($event)" @mouseup="resizeCode"></div>
                <!-- <div class="chainCode-info-title" @mouseover="mouseHover=!mouseHover" @mouseout="mouseHover=!mouseHover">
                    <i :class="[showCompileText?'el-icon-caret-bottom':'el-icon-caret-top']" @click="collapse">

                    </i>
                </div> -->
                <div>
                    <div class="chainCode-info-list1" v-html="compileinfo">
                    </div>
                    <div class="chainCode-info-list1" style="color: #f00" v-show="errorInfo">
                        {{errorInfo}}
                    </div>
                    <div class="chainCode-info-list1" style="color: #f00" v-show="errorInfo">
                        <span style="display:inline-block;width:calc(100% - 120px);word-wrap:break-word">{{errorMessage}}</span>
                    </div>
                    <div style="color: #68E600;padding-bottom: 15px;">{{successInfo}}</div>
                </div>
            </div>
        </div>
        <el-dialog v-dialogDrag title="选择用户" :visible.sync="dialogUser" width="500px" v-if="dialogUser" center class="send-dialog">
            <v-user @change="deploychainCode($event)" @close="userClose" :abi='abiFile'></v-user>
        </el-dialog>
        <v-editor v-if='editorShow' :show='editorShow' :data='editorData' @close='editorClose'></v-editor>
        <v-transaction :show='sendShow' v-if='sendShow' :data='data' @close='sendClose' @success='sendSuccess($event)'></v-transaction>
        <v-upload v-if='uploadFileAdrShow' :show='uploadFileAdrShow' @close='uploadClose' @success='uploadSuccess($event)'></v-upload>
    </div>
</template>

<script>
import ace from "ace-builds";
// import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";
import 'ace-builds/src-noconflict/mode-golang'
import errcode from "@/util/errcode";
let Base64 = require("js-base64").Base64;
import constant from "@/util/constant";
import editor from "../dialog/editor"
import uploadFileAdr from "../dialog/uploadFileAdr"
import Bus from '@/bus'
import {
    addChaincode,
    getDeployStatus,
    deployChainCode
} from "@/util/api";
import transaction from "../dialog/sendDialog";
import changeUser from "../dialog/changeUser";

export default {
    name: "codes",
    props: ["show", "changeStyle"],
    components: {
        "v-transaction": transaction,
        "v-user": changeUser,
        "v-editor": editor,
        "v-upload": uploadFileAdr,
    },
    data: function () {
        return {
            editorShow: false,
            editorData: null,
            successHide: true,
            loading: false,
            content: "",
            successShow: true,
            errorShow: false,
            dialogVisible: false,
            code: "",
            status: 0,
            chainCodeName: "",
            infoHeight: 100,
            chainCodeList: [],
            dialogUser: false,
            compileinfo: "",
            themePath: "ace/theme/chrome",
            modePath: "ace/mode/golang",
            errorInfo: "",
            errorMessage: "",
            successInfo: "",
            data: null,
            codeShow: false,
            version: "",
            saveShow: false,
            uploadFileAdrShow: false,
            uploadAddress: "",
            disabled: false,
            complieAbiTextHeight: false,
            complieBinTextHeight: false,
            mouseHover: false,
            showCompileText: true,
            sendShow: false,
            cmOptions: {
                tabSize: 4,
                mode: "text/x-go",
                theme: "monokai",
                lineNumbers: true,
                lineWrapping: true,
                smartIndent: true,
                extraKeys: {
                    "Tab": "autocomplete",
                    "Ctrl-S": 'save'
                },
                hintOptions: {//自定义提示选项
                    tables: {
                    users: ['name', 'score', 'birthDate'],
                    countries: ['name', 'population', 'size']
                    }
                },
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter","CodeMirror-lint-markers"],
                lineWiseCopyCut: true,
                showCursorWhenSelecting: true,
                matchBrackets:true,
                line: true
            }
        };
    },
    beforeDestroy: function () {
        Bus.$off("select")
        Bus.$off("noData")
    },
    mounted: function () {
        if (localStorage.getItem("root") === "admin") {
            this.disabled = false
        } else {
            this.disabled = true
        }
        this.initEditor()
        Bus.$on('select', data => {
            this.codeShow = true;
            this.refreshMessage();
            this.version = "";
            this.code = ";"
            this.status = null;
            this.errorMessage = "";
            this.chainCodeName = "";
            this.content = "";
            this.data = data;
            this.code = Base64.decode(data.chainCodeSourceBase64);
            this.content = this.code;
            this.aceEditor.setValue(this.content);
            this.status = data.chainCodeStatus;
            this.errorMessage = data.description || "";
            this.chainCodeName = data.chainCodeName;
            this.version = data.chainCodeVersion;
            this.complieAbiTextHeight = false;
            this.complieBinTextHeight = false;
        })
        Bus.$on("noData", data => {
            this.codeShow = false;
            this.refreshMessage();
            this.code = "";
            this.version = "";
            this.status = null;
            // this.chainCodeAddress = "";
            this.errorMessage = "";
            this.chainCodeName = "";
            this.content = "";
        })
    },
    watch: {
        content: function (val) {
            let data = Base64.decode(this.data.chainCodeSourceBase64);
            if (data != val) {
                this.saveShow = true
            } else {
                this.saveShow = false
            }
        },
        successHide: function (val) {
            if (val) {
                this.infoHeight = 100;
            } else {
                this.infoHeight = 0;
            }
        }
    },
    computed: {
        codeHight: function () {
            if (this.infoHeight) {
                return `calc(100% - ${this.infoHeight}px)`;
            } else {
                return `100%`;
            }
        },
        changeWidth() {
            if (this.changeStyle) {
                return this.changeStyle;
            } else {
                return false;
            }
        },
        tipShow() {
            return !this.show;
        }
    },
    methods: {
        initEditor: function () {
            let _this = this
            this.aceEditor = ace.edit(this.$refs.ace, {
                fontSize: 14,
                fontFamily: "Consolas,Monaco,monospace",

                theme: this.themePath,
                mode: this.modePath,
                tabSize: 4,
                useSoftTabs: true
            });
            this.aceEditor.setOptions({
                enableSnippets: true,
                enableLiveAutocompletion: true,
                enableBasicAutocompletion: true,
                autoScrollEditorIntoView: true,
                copyWithEmptySelection: true
            });
            this.aceEditor.commands.addCommand({
                name: 'myCommand',
                bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                exec: function (editor) {
                    if (_this.data.contractStatus != 2) {
                        _this.saveCode()
                    }
                },
            });
            let editor = this.aceEditor.alignCursors();
            this.aceEditor.getSession().setUseWrapMode(true);
            this.aceEditor.getSession().on("change", this.changeAce);
            this.aceEditor.on("blur", this.blurAce);
            this.aceEditor.resize();
        },
        blurAce: function () {
            this.content = this.aceEditor.getValue();
            let data = Base64.encode(this.content);
            if (this.data.chainCodeSourceBase64 != data && this.data.chainCodeStatus < 2) {
                this.saveCode()
            }
        },
        saveCode: function () {
            this.content = this.aceEditor.getValue();
            this.data.chainCodeSourceBase64 = Base64.encode(this.content);
            Bus.$emit("save", this.data)
        },
        resizeCode: function () {
            this.aceEditor.setOptions({
                maxLines:
                    Math.ceil(this.$refs.codeContent.offsetHeight / 17) - 1
            });
            this.aceEditor.resize();
        },
        dragDetailWeight: function (e) {
            let startY = e.clientY,
                infoHeight = this.infoHeight;
            document.onmousemove = e => {
                let moveY = startY - e.clientY;
                this.infoHeight = infoHeight + moveY;
            };
            document.onmouseup = e => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
            this.aceEditor.setOptions({
                maxLines:
                    Math.ceil(this.$refs.codeContent.offsetHeight / 17) - 1,
                minLines: 9
            });
        },
        upLoadAdr: function () {
            this.uploadFileAdrShow = true
        },
        uploadClose: function () {
            this.uploadFileAdrShow = false
        },
        uploadSuccess: function (val) {
            this.dialogVisible = true;
            this.uploadAddress = val
        },
        sendSuccess: function (val) {
            Bus.$emit("send", this.data);
            this.editorData = val;
            this.editorShow = true;
            this.sendShow = false;
            this.successInfo = "< 发送交易成功！";
        },
        editorClose: function () {
            this.editorShow = false;
        },
        changeAce: function () {
            this.content = this.aceEditor.getSession().getValue();
        },
        refreshMessage: function () {
            this.errorInfo = "";
            this.compileinfo = "";
        },
        deploying: function () {
            this.$prompt('请输入部署链码参数', '参数输入', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                }).then(({ value }) => {
                    let arry = value.split(",")
                    this.deploy(arry)
                }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消输入'
                });       
                });
            
        },
        userClose: function () {
            this.dialogUser = false;
        },
        deploy(val) {
            this.compileinfo = ">部署开始"
            this.content = this.aceEditor.getValue();
            this.loading = true;
            let reqData = {
                channelId: localStorage.getItem("channelId"),
                chainCodeSourceBase64: Base64.encode(this.content),
                chainCodeName: this.chainCodeName,
                chainCodePk: this.data.chainCodePk,
                chainCodeVersion: this.data.chainCodeVersion,
                initParams: val
            };
            deployChainCode(reqData)
                .then(res => {
                    this.loading = false;
                    if (res.data.code === 0) {
                        this.successInfo = "< 部署成功！";
                        this.$message({
                            message: "合约部署成功！",
                            type: "success"
                        })
                        this.data = res.data.data
                        this.data.chainCodeSourceBase64 = Base64.encode(this.content);
                        this.status = res.data.data.status
                        Bus.$emit("deploy", this.data)
                    } else {
                        this.status = 3;
                        this.$message({
                            message: errcode.errCode[res.data.code].cn,
                            type: "error"
                        });
                    }
                })
                .catch(err => {
                    this.status = 3;
                    this.loading = false;
                    this.$message({
                        message: "系统错误",
                        type: "error"
                    });
                });
        },
        foldInfo: function (val) {
            this.successHide = val;
        },
        send: function () {
            this.sendShow = true;
        },
        handleClose: function () {
            this.dialogVisible = false;
        },
        sendClose: function () {
            this.sendShow = false;
        },
        showHover() {

        },
        hiddenHover() {
            // console.log('yinchu ')
        },
        collapse() {
            this.showCompileText = !this.showCompileText
            if (this.showCompileText) {
                this.infoHeight = 100

            } else if (!this.showCompileText) {
                this.infoHeight = 50
            }
            this.$nextTick(() => {
                this.resizeCode()
            })

        },
        copyKey(val) {
            if (!val) {
                this.$message({
                    type: "fail",
                    showClose: true,
                    message: '值为空，不复制',
                    duration: 2000
                });
            } else {
                this.$copyText(val).then(e => {
                    this.$message({
                        type: "success",
                        showClose: true,
                        message: '复制成功',
                        duration: 2000
                    });
                });
            }
        }

    }
};
</script>
<style scoped>
.chainCode-code {
    height: 100%;
    border-left: 1px solid #eee;
    box-sizing: border-box;
}
.changeActive {
    padding-left: 0 !important;
}
.chainCode-code-head {
    width: 100%;
    height: 48px;
    line-height: 48px;
    border-bottom: 2px solid #e7ebf0;
    background-color: #fff;
    overflow: hidden;
}
.chainCode-code-done {
    display: inline-block;
    margin-right: 10px;
    cursor: pointer;
}
.chainCode-code-done i {
    vertical-align: middle;
}
.chainCode-code-done span {
    font-size: 12px;
    color: #9da2ab;
    vertical-align: middle;
}
.chainCode-no-content {
    border-left: 1px solid #e7ebf0;
    height: calc(100% - 50px);
    box-sizing: border-box;
}
.chainCode-code-content {
    border-left: 1px solid #e7ebf0;
    height: calc(100% - 50px);
    box-sizing: border-box;
}
.chainCode-code-mirror {
    width: 100%;
    height: 70%;
    overflow:scroll;
}
.chainCode-info {
    position: relative;
    padding-top: 20px;
    text-align: left;
    border-top: 1px solid #ddd;
    box-sizing: border-box;
    overflow: auto;
}
.chainCode-info-content {
    height: 100%;
    overflow-y: scroll;
    box-sizing: border-box;
}
.chainCode-code-title {
    float: left;
    font-weight: bold;
    font-size: 18px;
    color: #36393d;
    padding-left: 20px;
}
.chainCode-code-handle {
    float: right;
    padding-right: 20px;
}
.chainCode-info-title {
    text-align: center;
}
.move {
    position: absolute;
    width: 100%;
    height: 3px;
    top: 0;
    left: 0;
    z-index: 9999;
    cursor: s-resize;
}
.chainCode-info-title i {
    padding-left: 8px;
    font-size: 10px;
    color: #aeb1b5;
    cursor: pointer;
}
.chainCode-info-title span {
    font-size: 16px;
    font-weight: bold;
    color: #36393d;
}
.chainCode-info-list {
    padding: 5px 20px;
    width: 90%;
    margin: 0 auto;
    border: 1px solid #e8e8e8;
    border-bottom: none;
    position: relative;
}
.chainCode-info-list-title {
    display: inline-block;
    width: 105px;
    vertical-align: top;
}
.chainCode-info-list-title::after {
    display: block;
    content: "";
    clear: both;
}
.ace-editor {
    height: 100% !important;
    position: relative;
    text-align: left;
    letter-spacing: 0.1px;
    text-rendering: geometricPrecision;
    font-feature-settings: "liga" 0;
    font-variant-ligatures: none;
    font: 14px / normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas",
        "source-code-pro", monospace !important;
}
.ace-editor >>> .ace_print-margin {
    display: none;
    text-rendering: geometricPrecision;
}
.infoHide {
    height: calc(100% - 50px);
}
.code-spread {
    position: absolute;
    width: 33px;
    height: 33px;
    line-height: 33px;
    left: 412px;
    bottom: 0;
    border: 1px solid #e8e8e8;
    color: #aeb1b5;
    background-color: #fff;
    text-align: center;
    z-index: 9999;
    cursor: pointer;
}
.code-spread i {
    font-size: 12px;
}
.chainCode-info {
    background-color: #fff;
}
.titleActive {
    padding-left: 40px;
}
.send-dialog /deep/ .el-dialog--center .el-dialog__body {
    padding: 5px 25px 20px;
}
.showText {
    display: inline-block;
    width: calc(100% - 120px);
    word-wrap: break-word;
    max-height: 73px;
    overflow: hidden;
}
.visibility-wrapper {
    position: absolute;
    bottom: 10px;
}
.copy-public-key {
    float: right;
}
.code{
    font-size: 14px;
    height: 100%;
}
.chainCode-code-mirror>>>.CodeMirror {
            border: 1px solid #eee;
            height: 100%;
        }

.chainCode-code-mirror>>>.CodeMirror-scroll {
            height: 100%;
            overflow-y: hidden;
            overflow-x: auto;
        }

</style>