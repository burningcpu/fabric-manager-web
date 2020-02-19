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
    <div>
        <el-dialog title="新建文件" :visible.sync="dialogVisible" :before-close="modelClose" class="dialog-wrapper" width="433px" :center="true">
            <div>
                <el-form :model="fileFrom" :rules="rules" ref="fileFrom" label-width="100px" class="demo-ruleForm">
                    <el-form-item label="合约名称" prop="chainCodeName" >
                        <el-input v-model="fileFrom.chainCodeName" style="width: 210px;"></el-input>
                    </el-form-item>
                    <el-form-item label="合约版本" prop="chainCodeVersion" >
                        <el-input v-model="fileFrom.chainCodeVersion" style="width: 210px;"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="modelClose">取 消</el-button>
                <el-button type="primary" @click="submit('fileFrom')">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { addChainCode } from "@/util/api"
import errcode from "@/util/errcode";
export default {
    name: "addFile",
    props: ['fileshow','data','id'],
    data: function(){
        return {
            dialogVisible: this.fileshow,
            fileFrom: {
                chainCodeName: "",
                chainCodeVersion: ""
            },
            disabled: false,
            folderId: this.id,
            rules: {
               chainCodeName: [
                    {
                        required: true,
                        message: "请输入合约名称",
                        trigger: "blur"
                    },
                    {
                        min: 1,
                        max: 32,
                        message: "长度在 1 到 32 个字符",
                        trigger: "blur"
                    },
                    {
                        pattern: /^[A-Za-z0-9_]+$/,
                        message: "合约名不符合规则",
                        trigger: "blur"
                    }
               ],
               chainCodeVersion: [
                    {
                        required: true,
                        message: "请输入合约名称",
                        trigger: "blur"
                    },
                    {
                        min: 1,
                        max: 16,
                        message: "长度在 1 到 16 个字符",
                        trigger: "blur"
                    },
                    {
                        pattern: /^\w+$/,
                        message: "合约版本是英文或数字组成",
                        trigger: "blur"
                    }
               ] 
            },
            options: [],
        }
    },
    methods: {
        submit: function(formName){
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let data = {
                        chainCodeName: this.fileFrom.chainCodeName,
                        chainCodeSourceBase64: "",
                        // chainCodeActive: false,
                        chainCodeVersion: this.fileFrom.chainCodeVersion,
                        chainCodeLang: "GO_LANG",
                        channelId: localStorage.getItem("channelId")
                    }
                    this.savechainCode(data)
                }else{
                    return false
                }
            })
        },
        modelClose: function(){
            this.$emit("close")
        },
        savechainCode: function (data,title) {
            let reqData = data
            addChainCode(reqData).then(res => {
                if (res.data.code === 0) {
                    if (data.chainCodePk) {
                        this.$message({
                            type: "success",
                            message: title || '合约保存成功！'
                        });
                    }
                    this.$emit('success',res.data.data)
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
    }
}
</script>

