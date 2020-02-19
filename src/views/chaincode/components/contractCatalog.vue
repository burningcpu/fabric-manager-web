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
    <div class="chainCode-menu" style="position: relative;height: 100% ;">
        <div class="chainCode-menu-header">
            <el-tooltip class="item" effect="dark" content="新建文件" v-if="!disabled" placement="top-start">
                <i class="wbs-icon-Addfile icon chainCode-icon" @click='addFile'></i>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="上传文件" v-if="!disabled" placement="top-start">
                <i class="wbs-icon-shangchuan chainCode-icon" style="position:relative;">
                    <input multiple title="" type="file" id="file" ref='file' name="chaincodes" class="uploads" @change="upload($event)" />
                </i>
            </el-tooltip>
            <el-tooltip effect="dark" content="群组内部署的合约都需要在合约管理里添加，编译保存，否则会判断为异常合约。" placement="top-start">
                <i class="el-icon-info chainCode-icon font-15" style="cursor: default;"></i>
            </el-tooltip>
        </div>

        <div class="chainCode-menu-content">
            <ul>
                <li v-for='item in chainCodeList' :key="item.chainCodePk">
                    <div  class="chainCode-file" :id='item.chainCodePk'>
                        <i class="wbs-icon-file" @click='select(item)'  :id='item.chainCodePk'></i>
                        <span @contextmenu.prevent="handle($event,item)" @click='select(item)' :id='item.chainCodePk'  :class="{'colorActive': item.chainCodeActive}">{{item.chainCodeName}}</span>
                        <div class="chainCode-menu-handle" v-if='!disabled &&item.handleModel && item.chainCodeStatus == 1' :style="{'top': clentY,'left': clentX}" v-Clickoutside="checkNull">
                            <ul v-if="chainCodeFile">
                                <li class="chainCode-menu-handle-list"  @click="deleteFile(item)">删除</li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <add-file v-if="fileshow" :fileshow="fileshow" @close='fileClose' @success='fileSuccess($event)'></add-file>
        <select-catalog v-if='cataLogShow' :show='cataLogShow' @success='catalogSuccess($event)' @close='catalogClose'></select-catalog>
    </div>
</template>
<script>
import addFolder from "../dialog/addFolder"
import addFile from "../dialog/addFile"
import selectCatalog from "../dialog/selectCatalog"
import { getChainCodeList, addChainCode, deleteChainCode } from "@/util/api"
import Bus from '@/bus'
import errcode from "@/util/errcode";
import Clickoutside from 'element-ui/src/utils/clickoutside'
// console.log(Clickoutside)
export default {
    name: "chainCodeCatalog",
    components: {
        "add-folder": addFolder,
        "add-file": addFile,
        "select-catalog": selectCatalog,
    },
    // directives: { clickoutside  },
    data: function () {
        return {
            foldershow: false,
            fileshow: false,
            filename: "",
            fileString: "",
            chainCodeList: [],
            folderList: [],
            chainCodeArry: [],
            chainCodeData: null,
            cataLogShow: false,
            realchainCodeList: [],
            chainCodeName: "",
            clentX: 0,
            clentY: 0,
            chainCodeFile: true,
            chainCodeFolder: false,
            ID: "",
            folderId: null,
            disabled: false,
            selectData: null
        }
    },
    beforeDestroy: function () {
        Bus.$off("compile")
        Bus.$off("deploy")
        Bus.$off("save")
    },
    mounted: function () {
        if (localStorage.getItem("root") === "admin") {
            this.disabled = false
        } else {
            this.disabled = true
        }
        this.$nextTick(function () {
            this.getchainCodes()
        })
        Bus.$on("save", data => {
            this.savechainCode(data)
        })
        Bus.$on("deploy", data => {
            this.getchainCodes(data);
        })
        Bus.$on("send", data => {
            this.getchainCodes(data);
        })
    },
    directives: {
        Clickoutside,
        focus: {
            update: function (el, { value }) {
                if (value) {
                    el.focus()
                }
            }
        }
    },
    methods: {
        checkNull: function (list) {
            for(let i = 0; i < this.chainCodeList.length; i++){
                this.chainCodeList[i].handleModel = false
                this.$set(this.chainCodeList,i,this.chainCodeList[i])
            }
            this.ID = "";
            this.contractFile = false;
            this.handleModel = false;
        },
        handle: function (e, list) {
            this.checkNull(list);
            for(let i = 0; i < this.chainCodeList.length; i++){
                if(this.chainCodeList[i].chainCodePk == list.chainCodePk){
                    this.chainCodeList[i].handleModel = true
                    this.$set(this.chainCodeList,i,this.chainCodeList[i])
                }
            }
            if (e.clientX > 201) {
                this.clentX = e.clientX - 200 + 'px';
            } else {
                this.clentX = e.clientX + 'px';
            }
            this.clentY = 20 + 'px';
            this.ID = e.target.id;
            let item = {};
            if (this.ID) {
                this.chainCodeList.forEach(value => {
                    if(value.chainCodePk && value.chainCodePk == this.ID){
                        item = value
                    }
                })
                this.chainCodeFile = true;  
            } else {
                this.ID = "";
            }
        },
        changeName: function (val) {
            let pattern = /^[A-Za-z0-9_]+$/
            if (pattern.test(this.chainCodeName) && this.chainCodeName.length < 32 && this.chainCodeName.length > 1) {
                if (this.chainCodeName !== val.chainCodeName) {
                    for (let i = 0; i < this.chainCodeList.length; i++) {
                        if (this.chainCodeList[i].chainCodeName == this.chainCodeName && this.chainCodeList[i].chainCodePath == val.chainCodePath) {
                            this.$message({
                                message: '同目录下存在相同的合约，请重新命名',
                                type: "error"
                            });
                            this.$set(val, 'renameShow', false)
                            return
                        }
                    }
                    if (this.chainCodeName) {
                        this.$set(val, 'chainCodeName', this.chainCodeName)
                        this.chainCodeName = ""
                        this.savechainCode(val);
                    } else {
                        this.$set(val, 'renameShow', false)
                    }
                } else {
                    this.$set(val, 'renameShow', false)
                }
            } else {
                this.$message({
                    message: '请输入数字或字母,长度为1到32位！',
                    type: "error"
                });
                this.$set(val, 'renameShow', false)
            }
        },
        addFile: function () {
            this.checkNull();
            this.fileshow = true
        },
        addFiles: function () {
            this.fileshow = true;
            this.folderId = this.ID;
            this.ID = "";
            this.chainCodeFile = false;
            this.chainCodeFolder = false;
        },
        upload: function (e) {
            this.checkNull();
            if (!e.target.files.length) {
                return;
            }
            this.uploadFiles = e.target.files;

            for (let i = 0; i < this.uploadFiles.length; i++) {
                let filessize = Math.ceil(this.uploadFiles[i].size / 1024);
                let filetype = this.uploadFiles[i].name.split(".")[1];
                if (filessize > 400) {
                    this.$message({
                        message: '文件大小超过400k，请上传小于400k的文件',
                        type: "error"
                    });
                    this.cataLogShow = false
                    break;
                } else if (filetype !== "go") {
                    this.$message({
                        message: '请上传.go格式的文件',
                        type: "error"
                    });
                    this.cataLogShow = false
                    break;
                } else {
                    this.cataLogShow = true
                }
            }
        },
        catalogSuccess: function (val) {
            for (let i = 0; i < this.uploadFiles.length; i++) {
                let reader = new FileReader(); //新建一个FileReader
                reader.readAsText(this.uploadFiles[i], "UTF-8"); //读取文件
                let filename = "", _this = this;
                filename = this.uploadFiles[i].name.split(".")[0];
                let num = 0;
                this.chainCodeList.forEach(value => {
                    if (value.chainCodeName == filename && num===0) {
                        this.$message({
                            type: "error",
                            message: '不能存在同名合约'
                        });
                        num++;
                    }
                });
                if (!num) {
                    reader.onload = function (evt) {
                        var fileString = "";
                        fileString = Base64.encode(evt.target.result); // 读取文件内容
                        let data = {
                            chainCodeName: filename,
                            chainCodeSourceBase64: fileString,
                            chainCodeActive: false,
                            chainCodestatus: 0,
                            chainCodeVersion: val
                        };
                        _this.savechainCode(data);
                    };
                }
            }
            this.$refs.file.value = "";
            this.catalogClose();
        },
        catalogClose: function () {
            this.cataLogShow = false
        },
        fileClose: function () {
            this.fileshow = false
            this.getchainCodes()
        },
        fileSuccess: function(val) {
            this.fileshow = false
            this.getchainCodes(val)
        },
        savechainCode: function (data,title) {
            let reqData = {
                chainCodeLang: data.chainCodeLang,
                chainCodeName: data.chainCodeName,
                chainCodeSourceBase64: data.chainCodeSourceBase64,
                chainCodeVersion: data.chainCodeVersion,
                channelId: localStorage.getItem("channelId")
            }
            if(data.chainCodePk){
                reqData.chainCodePk = data.chainCodePk
            }
            addChainCode(reqData).then(res => {
                if (res.data.code === 0) {
                    this.getchainCodes(res.data.data);
                    if (data.chainCodePk) {
                        this.$message({
                            type: "success",
                            message: title || '合约保存成功！'
                        });
                    }
                } else {
                    this.$message({
                        type: "error",
                        message: errcode.errCode[res.data.code].cn
                    });
                }
            })
                .catch(err => {
                    this.$message({
                        type: "error",
                        message: "系统错误！"
                    });
                    this.$message.closeAll()
                });
        },
        getchainCodes: function (list) {
            let data = {
                channelId: localStorage.getItem("channelId"),
                pageNumber: 1,
                pageSize: 500,
            }
            getChainCodeList(data).then(res => {
                if (res.data.code == 0) {
                    this.chainCodeList = res.data.data || [];
                    localStorage.setItem("chainCodeList", JSON.stringify(this.chainCodeList))
                    if (res.data.data.length) {
                        for(let i = 0; i < this.chainCodeList.length; i++){
                            this.chainCodeList[i].handleModel = false;
                            this.chainCodeList[i].chainCodeActive = false
                        }
                        if(!this.selectData){
                            this.select(res.data.data[0])
                        }
                        if(list){
                            this.select(list)
                        }
                    }
                    
                } else {
                    this.$message({
                        type: "error",
                        message: errcode.errCode[res.data.code].cn
                    });
                }
            })
                .catch(err => {
                    // this.loading = false;
                    this.$message({
                        type: "error",
                        message: "系统错误！"
                    });
                });
        },
        select: function (val) {
            this.selectData = val
            let num = 0;
            for(let i = 0; i < this.chainCodeList.length; i++){
                if(this.chainCodeList[i].chainCodePk == val.chainCodePk){
                    this.chainCodeList[i].chainCodeActive = true;
                    this.$set(this.chainCodeList,i,this.chainCodeList[i]);
                }else{
                    this.chainCodeList[i].chainCodeActive = false;
                    this.$set(this.chainCodeList,i,this.chainCodeList[i]);
                }
            }
            Bus.$emit('select', val)
        },
        deleteFile: function (val) {
            this.$confirm('确认删除？')
                .then(_ => {
                    this.deleteData(val)
                })
                .catch(_ => { });

        },
        deleteData: function (val) {
            let data = {
                channelId: localStorage.getItem("channelId"),
                chainCodePk: val.chainCodePk
            }
            deleteChainCode(data, {}).then(res => {
                if (res.data.code === 0) {
                    this.getchainCodes()
                } else {
                    this.$message({
                        type: "error",
                        message: errcode.errCode[res.data.code].cn
                    });
                }
            })
                .catch(err => {
                    this.loading = false;
                    this.$message({
                        type: "error",
                        message: "系统错误！"
                    });
                });
        },
        deleteFolder: function (val) {
            this.$confirm('确认删除？')
                .then(_ => {
                    this.deleteFolderData(val)
                })
                .catch(_ => { });
        },
        deleteFolderData: function (val) {
            let list = val.child;
            let num = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].chainCodeStatus == 2) {
                    this.$message({
                        type: "error",
                        message: "文件夹内存在已部署的合约，无法删除文件夹"
                    })
                    return
                } else {
                    num++
                }
            }
            if (num) {
                while (list.length > 0) {
                    this.deleteData(list[0])
                    list.splice(0, 1)
                }
            }
            if (val.child.length == 0) {
                this.folderList = JSON.parse(localStorage.getItem("folderList"))
                this.folderList.forEach((value, index) => {
                    if (val.folderId == value.folderId) {
                        this.folderList.splice(index, 1)
                    }
                })
                localStorage.setItem("folderList", JSON.stringify(this.folderList))
                this.getchainCodes()
            }
        }
    }
}
</script>
<style scoped>
.icon {
    font-weight: bold;
}
.chainCode-menu-header {
    width: calc(100% + 1px);
    height: 48px;
    line-height: 48px;
    border-bottom: 2px solid #e7ebf0;
    padding-left: 20px;
}
.chainCode-icon {
    vertical-align: middle;
    padding-left: 10px;
    cursor: pointer;
}
.checkchainCode-upload {
    display: block;
    position: absolute;
    height: 30px;
    left: 0;
    margin-top: -30px;
    width: 100%;
    opacity: 0;
    /* -ms-filter: "alpha(opacity=0)"; */
    z-index: 9;
    cursor: pointer;
}
.chainCode-file {
    position: relative;
    padding-left: 25px;
}
.chainCode-folder {
    position: relative;
    padding-left: 5px;
}
.chainCode-folder i {
    cursor: pointer;
}
.chainCode-file span {
    cursor: pointer;
}
.chainCode-file i {
    cursor: pointer;
}
.uploads {
    position: absolute;
    width: 18px;
    height: 18px;
    left: 10px;
    top: 0;
    opacity: 0;
    z-index: 999;
    cursor: pointer;
}
.colorActive {
    color: rgb(55, 238, 242);
}
.chainCode-delete {
    padding-left: 20px;
    font-weight: 100;
    font-size: 16px;
}
.chainCode-file-handle {
    position: absolute;
    width: 60px;
    top: 24px;
    padding: 10px;
    background-color: #fff;
    z-index: 9999;
    box-shadow: 1px 1px 1px;
}
.chainCode-menu-content {
    overflow: auto;
    height: calc(100% - 50px);
}
.chainCode-menu-content >>> .el-input__inner {
    width: 100px;
    height: 24px;
    line-height: 24px;
    padding: 0 5px;
}
.chainCode-menu-handle {
    position: absolute;
    font-size: 0;
    width: 100px;
    /* top: 0; */
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    vertical-align: middle;
    background-color: #fff;
    box-shadow: 1px 4px 4px 1px;
    z-index: 9999;
}
.chainCode-menu-handle li {
    font-size: 12px;
    height: 30px;
    line-height: 30px;
    padding-left: 8px;
}
.chainCode-menu-handle-list {
    cursor: pointer;
    color: #666;
}
.chainCode-menu-handle-list:hover {
    color: rgb(55, 238, 242);
}
</style>


